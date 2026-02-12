import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RedemptionRequest {
  code: string;
}

interface RedemptionResponse {
  success: boolean;
  status: 'SUCCESS' | 'INVALID' | 'EXPIRED' | 'EXHAUSTED' | 'ALREADY_USED' | 'AUTH_REQUIRED' | 'ERROR';
  message: string;
  creditsAwarded?: number;
  newBalance?: number;
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
      const response: RedemptionResponse = {
        success: false,
        status: 'AUTH_REQUIRED',
        message: 'Connexion requise pour utiliser un code promo.',
      };
      return new Response(JSON.stringify(response), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Client with user's JWT for auth verification
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Service client for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getUser(token);
    
    if (claimsError || !claimsData?.user) {
      const response: RedemptionResponse = {
        success: false,
        status: 'AUTH_REQUIRED',
        message: 'Session invalide. Veuillez vous reconnecter.',
      };
      return new Response(JSON.stringify(response), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = claimsData.user.id;

    // 2. Parse request body
    const { code }: RedemptionRequest = await req.json();
    
    if (!code || typeof code !== 'string') {
      const response: RedemptionResponse = {
        success: false,
        status: 'INVALID',
        message: 'Veuillez entrer un code promo valide.',
      };
      return new Response(JSON.stringify(response), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const normalizedCode = code.trim().toUpperCase();

    // 3. Fetch the promo code
    const { data: promoCode, error: promoError } = await supabaseAdmin
      .from('promo_codes')
      .select('*')
      .eq('code', normalizedCode)
      .single();

    if (promoError || !promoCode) {
      const response: RedemptionResponse = {
        success: false,
        status: 'INVALID',
        message: 'Ce code promo n\'existe pas.',
      };
      return new Response(JSON.stringify(response), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 4. Validate promo code status
    if (!promoCode.is_active) {
      const response: RedemptionResponse = {
        success: false,
        status: 'INVALID',
        message: 'Ce code promo n\'est plus actif.',
      };
      return new Response(JSON.stringify(response), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const now = new Date();
    
    // Check valid_from
    if (promoCode.valid_from && new Date(promoCode.valid_from) > now) {
      const response: RedemptionResponse = {
        success: false,
        status: 'INVALID',
        message: 'Ce code promo n\'est pas encore valide.',
      };
      return new Response(JSON.stringify(response), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check valid_until
    if (promoCode.valid_until && new Date(promoCode.valid_until) < now) {
      const response: RedemptionResponse = {
        success: false,
        status: 'EXPIRED',
        message: 'Ce code promo a expiré.',
      };
      return new Response(JSON.stringify(response), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check max_uses (global limit)
    if (promoCode.max_uses !== null && promoCode.current_uses >= promoCode.max_uses) {
      const response: RedemptionResponse = {
        success: false,
        status: 'EXHAUSTED',
        message: 'Ce code promo a atteint sa limite d\'utilisation.',
      };
      return new Response(JSON.stringify(response), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 5. Check if user already used this code
    const { data: existingRedemption } = await supabaseAdmin
      .from('promo_code_redemptions')
      .select('id')
      .eq('user_id', userId)
      .eq('promo_code_id', promoCode.id)
      .maybeSingle();

    if (existingRedemption) {
      const response: RedemptionResponse = {
        success: false,
        status: 'ALREADY_USED',
        message: 'Vous avez déjà utilisé ce code promo.',
      };
      return new Response(JSON.stringify(response), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 6. Apply the bonus based on type
    let creditsAwarded = 0;
    let newBalance = 0;

    if (promoCode.type === 'free_credits') {
      creditsAwarded = promoCode.value;

      // Get current balance
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('students_balance')
        .eq('id', userId)
        .single();

      if (profileError) {
        throw new Error('Erreur lors de la récupération du profil.');
      }

      const currentBalance = profile?.students_balance ?? 0;
      newBalance = currentBalance + creditsAwarded;

      // Update user's students_balance (atomic update)
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ students_balance: newBalance })
        .eq('id', userId);

      if (updateError) {
        throw new Error('Erreur lors de la mise à jour du solde.');
      }
    } else if (promoCode.type === 'discount') {
      // For discount codes, we just record the redemption
      // The discount will be applied during Stripe checkout (future feature)
      creditsAwarded = 0;
    }

    // 7. Create redemption record
    const { error: redemptionError } = await supabaseAdmin
      .from('promo_code_redemptions')
      .insert({
        user_id: userId,
        promo_code_id: promoCode.id,
        credits_awarded: creditsAwarded,
        metadata: {
          code: normalizedCode,
          type: promoCode.type,
          value: promoCode.value,
        },
      });

    if (redemptionError) {
      // Rollback the balance update if redemption record fails
      if (promoCode.type === 'free_credits') {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('students_balance')
          .eq('id', userId)
          .single();
        
        if (profile) {
          await supabaseAdmin
            .from('profiles')
            .update({ students_balance: profile.students_balance - creditsAwarded })
            .eq('id', userId);
        }
      }
      throw new Error('Erreur lors de l\'enregistrement de l\'utilisation.');
    }

    // 8. Increment current_uses counter (atomic)
    const { error: incrementError } = await supabaseAdmin
      .from('promo_codes')
      .update({ current_uses: promoCode.current_uses + 1 })
      .eq('id', promoCode.id);

    if (incrementError) {
      console.error('Failed to increment current_uses:', incrementError);
      // Non-blocking error - the redemption is still valid
    }

    // 9. Return success
    const successMessage = promoCode.type === 'free_credits'
      ? `🎉 +${creditsAwarded} élèves ajoutés à votre compte !`
      : `🎉 Réduction de ${promoCode.value}% appliquée !`;

    const response: RedemptionResponse = {
      success: true,
      status: 'SUCCESS',
      message: successMessage,
      creditsAwarded,
      newBalance,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in redeem-promo-code:', error);
    
    const response: RedemptionResponse = {
      success: false,
      status: 'ERROR',
      message: 'Une erreur est survenue.',
    };

    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
