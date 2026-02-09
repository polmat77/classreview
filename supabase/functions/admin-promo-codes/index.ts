import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type ActionType = 'list' | 'create' | 'update' | 'delete' | 'generate_batch' | 'stats';

interface AdminRequest {
  action: ActionType;
  data?: Record<string, unknown>;
}

// Characters for random code generation (excluding ambiguous: 0, O, I, L, 1)
const SAFE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function generateRandomCode(prefix: string, length: number = 6): string {
  let result = prefix;
  for (let i = 0; i < length; i++) {
    result += SAFE_CHARS.charAt(Math.floor(Math.random() * SAFE_CHARS.length));
  }
  return result;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Validate JWT authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Non autorisé' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token);

    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Session invalide' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = userData.user.id;

    // 2. Check if user has admin role using has_role function
    const { data: hasAdminRole, error: roleError } = await supabaseAdmin.rpc('has_role', {
      _user_id: userId,
      _role: 'admin',
    });

    if (roleError || !hasAdminRole) {
      return new Response(JSON.stringify({ error: 'Accès réservé aux administrateurs' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Parse request
    const { action, data }: AdminRequest = await req.json();

    // 4. Handle actions
    switch (action) {
      case 'list': {
        const { data: codes, error } = await supabaseAdmin
          .from('promo_codes')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        return new Response(JSON.stringify({ codes }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'create': {
        const { code, type, value, max_uses, max_uses_per_user, valid_from, valid_until, description } = data as {
          code: string;
          type: 'free_credits' | 'discount';
          value: number;
          max_uses?: number | null;
          max_uses_per_user?: number;
          valid_from?: string;
          valid_until?: string | null;
          description?: string;
        };

        const normalizedCode = code.trim().toUpperCase();

        // Check if code already exists
        const { data: existing } = await supabaseAdmin
          .from('promo_codes')
          .select('id')
          .eq('code', normalizedCode)
          .maybeSingle();

        if (existing) {
          return new Response(JSON.stringify({ error: 'Ce code existe déjà' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { data: newCode, error } = await supabaseAdmin
          .from('promo_codes')
          .insert({
            code: normalizedCode,
            type,
            value,
            max_uses: max_uses ?? null,
            max_uses_per_user: max_uses_per_user ?? 1,
            valid_from: valid_from || new Date().toISOString(),
            valid_until: valid_until || null,
            description: description || null,
          })
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({ code: newCode }), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'update': {
        const { id, ...updateData } = data as { id: string; [key: string]: unknown };

        if (updateData.code) {
          updateData.code = (updateData.code as string).trim().toUpperCase();
        }

        const { data: updatedCode, error } = await supabaseAdmin
          .from('promo_codes')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({ code: updatedCode }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'delete': {
        const { id } = data as { id: string };

        const { error } = await supabaseAdmin
          .from('promo_codes')
          .delete()
          .eq('id', id);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'generate_batch': {
        const { prefix, count, value, type, max_uses_per_user, valid_until, description } = data as {
          prefix: string;
          count: number;
          value: number;
          type?: 'free_credits' | 'discount';
          max_uses_per_user?: number;
          valid_until?: string | null;
          description?: string;
        };

        const normalizedPrefix = prefix.trim().toUpperCase();
        const generatedCodes: string[] = [];
        const failedCodes: string[] = [];
        const maxAttempts = count * 3; // Allow retries for duplicates
        let attempts = 0;

        while (generatedCodes.length < count && attempts < maxAttempts) {
          attempts++;
          const newCode = generateRandomCode(normalizedPrefix);

          // Check if code exists
          const { data: existing } = await supabaseAdmin
            .from('promo_codes')
            .select('id')
            .eq('code', newCode)
            .maybeSingle();

          if (!existing) {
            const { error } = await supabaseAdmin
              .from('promo_codes')
              .insert({
                code: newCode,
                type: type || 'free_credits',
                value,
                max_uses: 1, // Batch codes are single-use by default
                max_uses_per_user: max_uses_per_user ?? 1,
                valid_from: new Date().toISOString(),
                valid_until: valid_until || null,
                description: description || `Batch: ${normalizedPrefix}`,
              });

            if (!error) {
              generatedCodes.push(newCode);
            } else {
              failedCodes.push(newCode);
            }
          }
        }

        return new Response(JSON.stringify({ 
          codes: generatedCodes, 
          count: generatedCodes.length,
          failed: failedCodes.length,
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'stats': {
        // Get total codes
        const { count: totalCodes } = await supabaseAdmin
          .from('promo_codes')
          .select('*', { count: 'exact', head: true });

        // Get active codes
        const { count: activeCodes } = await supabaseAdmin
          .from('promo_codes')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        // Get total redemptions
        const { count: totalRedemptions } = await supabaseAdmin
          .from('promo_code_redemptions')
          .select('*', { count: 'exact', head: true });

        // Get total credits awarded
        const { data: creditsData } = await supabaseAdmin
          .from('promo_code_redemptions')
          .select('credits_awarded');

        const totalCreditsAwarded = creditsData?.reduce(
          (sum, r) => sum + (r.credits_awarded || 0),
          0
        ) ?? 0;

        // Get this month's redemptions
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { count: thisMonthRedemptions } = await supabaseAdmin
          .from('promo_code_redemptions')
          .select('*', { count: 'exact', head: true })
          .gte('redeemed_at', startOfMonth.toISOString());

        return new Response(JSON.stringify({
          stats: {
            totalCodes: totalCodes ?? 0,
            activeCodes: activeCodes ?? 0,
            totalRedemptions: totalRedemptions ?? 0,
            totalCreditsAwarded,
            thisMonthRedemptions: thisMonthRedemptions ?? 0,
          },
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Action non reconnue' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

  } catch (error) {
    console.error('Error in admin-promo-codes:', error);
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Une erreur est survenue' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
