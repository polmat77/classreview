import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Limits for free regenerations per class
const FREE_REGEN_LIMITS = {
  appreciation: 3,
  bilan: 1,
};

// Minimum balance allowed (anti-abuse)
const MIN_BALANCE_ALLOWED = -5;

interface ConsumeCreditsRequest {
  tool: 'reportcard' | 'classcouncil' | 'quizmaster';
  action: 'appreciation' | 'bilan' | 'batch' | 'quiz' | 'regeneration';
  students_cost: number;
  class_id: string | null;
  is_regeneration: boolean;
  regeneration_type: 'appreciation' | 'bilan' | null;
  metadata?: Record<string, unknown>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Step 1: Validate authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "AUTH_REQUIRED", 
          message: "Connexion requise pour générer" 
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's auth token
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Validate JWT and get user
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: authError } = await supabaseClient.auth.getClaims(token);
    
    if (authError || !claimsData?.claims) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "AUTH_REQUIRED", 
          message: "Session expirée, veuillez vous reconnecter" 
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const user = { id: claimsData.claims.sub as string };

    // Parse request body
    const body: ConsumeCreditsRequest = await req.json();
    const { tool, action, students_cost, class_id, is_regeneration, regeneration_type, metadata } = body;

    console.log(`[check-and-consume-credits] User ${user.id} requesting ${action} for ${students_cost} students`);

    // Use service role client for database operations (bypasses RLS for atomic updates)
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Step 2: Fetch current profile
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('id, free_students_remaining, students_balance, free_regenerations_used')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Profile error:', profileError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "PROFILE_NOT_FOUND", 
          message: "Profil utilisateur introuvable" 
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const freeRemaining = profile.free_students_remaining ?? 0;
    const paidBalance = profile.students_balance ?? 0;
    const totalBalance = freeRemaining + paidBalance;
    const freeRegens = (profile.free_regenerations_used as Record<string, number>) || {};

    // Step 3: Handle regeneration logic
    let actualCost = students_cost;
    let wasFreeRegeneration = false;

    if (is_regeneration && regeneration_type && class_id) {
      const regenKey = `${class_id}_${regeneration_type === 'appreciation' ? 'appreciations' : 'bilan'}`;
      const usedRegens = freeRegens[regenKey] || 0;
      const limit = FREE_REGEN_LIMITS[regeneration_type];

      console.log(`[check-and-consume-credits] Regeneration check: ${regenKey} = ${usedRegens}/${limit}`);

      if (usedRegens < limit) {
        // Free regeneration available
        wasFreeRegeneration = true;
        actualCost = 0;

        // Increment free regeneration counter
        const newFreeRegens = { ...freeRegens, [regenKey]: usedRegens + 1 };
        
        const { error: updateRegenError } = await adminClient
          .from('profiles')
          .update({ free_regenerations_used: newFreeRegens })
          .eq('id', user.id);

        if (updateRegenError) {
          console.error('Error updating free regenerations:', updateRegenError);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: "UPDATE_FAILED", 
              message: "Erreur lors de la mise à jour des régénérations" 
            }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Log the free regeneration
        await adminClient.from('generations').insert([{
          user_id: user.id,
          tool,
          action: 'regeneration',
          students_used: 0,
          is_free: false,
          is_free_regeneration: true,
          class_id,
          metadata: { ...metadata, type: regeneration_type, freeRegenNumber: usedRegens + 1 },
        }]);

        console.log(`[check-and-consume-credits] Free regeneration used (${usedRegens + 1}/${limit})`);

        return new Response(
          JSON.stringify({
            success: true,
            credits_used: 0,
            was_free_regeneration: true,
            new_balance: {
              free_remaining: freeRemaining,
              paid_remaining: paidBalance,
              total: totalBalance,
            }
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      // If no free regen available, fall through to paid logic
    }

    // Step 4: Check if user can afford the action
    // Rule: Allow if balance >= 1 (even if cost > balance, but don't go below MIN_BALANCE_ALLOWED)
    if (totalBalance < 1) {
      console.log(`[check-and-consume-credits] Insufficient credits: ${totalBalance} < 1`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "NO_CREDITS", 
          message: "Crédits insuffisants",
          balance: totalBalance
        }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if deduction would go below minimum allowed
    const projectedBalance = totalBalance - actualCost;
    if (projectedBalance < MIN_BALANCE_ALLOWED) {
      console.log(`[check-and-consume-credits] Would exceed minimum balance: ${projectedBalance} < ${MIN_BALANCE_ALLOWED}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "NO_CREDITS", 
          message: "Cette action dépasserait la limite de crédits autorisée",
          balance: totalBalance
        }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 5: Calculate deductions (free first, then paid)
    const freeDeduction = Math.min(freeRemaining, actualCost);
    const paidDeduction = actualCost - freeDeduction;

    const newFreeRemaining = freeRemaining - freeDeduction;
    const newPaidBalance = paidBalance - paidDeduction;

    console.log(`[check-and-consume-credits] Deducting: free=${freeDeduction}, paid=${paidDeduction}`);
    console.log(`[check-and-consume-credits] New balances: free=${newFreeRemaining}, paid=${newPaidBalance}`);

    // Step 6: Atomic update with WHERE condition to prevent race conditions
    // This ensures that if the balance changed between our check and update, the update fails
    const { data: updatedProfile, error: updateError } = await adminClient
      .from('profiles')
      .update({
        free_students_remaining: newFreeRemaining,
        students_balance: newPaidBalance,
      })
      .eq('id', user.id)
      .gte('free_students_remaining', freeDeduction) // Ensure we have enough free credits
      .select('free_students_remaining, students_balance')
      .maybeSingle();

    if (updateError) {
      console.error('Error updating credits:', updateError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "UPDATE_FAILED", 
          message: "Erreur lors de la mise à jour des crédits" 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Race condition check: if no rows were updated, balance changed
    if (!updatedProfile) {
      console.log(`[check-and-consume-credits] Race condition detected - balance changed`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "RACE_CONDITION", 
          message: "Veuillez réessayer (conflit de mise à jour)" 
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 7: Log the generation
    const { error: logError } = await adminClient.from('generations').insert([{
      user_id: user.id,
      tool,
      action,
      students_used: actualCost,
      is_free: freeDeduction > 0,
      is_free_regeneration: false,
      class_id,
      metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
    }]);

    if (logError) {
      console.error('Error logging generation:', logError);
      // Don't fail the request, just log the error
    }

    console.log(`[check-and-consume-credits] Success! Credits used: ${actualCost}`);

    // Step 8: Return success
    return new Response(
      JSON.stringify({
        success: true,
        credits_used: actualCost,
        was_free_regeneration: false,
        new_balance: {
          free_remaining: updatedProfile.free_students_remaining,
          paid_remaining: updatedProfile.students_balance,
          total: updatedProfile.free_students_remaining + updatedProfile.students_balance,
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in check-and-consume-credits:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "INTERNAL_ERROR", 
        message: error instanceof Error ? error.message : "Erreur interne" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
