import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

const PLAN_STUDENTS: Record<string, number> = {
  one_class: 35,
  four_classes: 140,
  year: 500,
  all_classes: 2000,
};

serve(async (req) => {
  console.log('🔔 Webhook received:', req.method);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    console.error('❌ Missing stripe-signature header');
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  // CRITICAL: read body as raw text BEFORE any parsing
  const body = await req.text();
  console.log('📦 Body length:', body.length);

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    console.log('✅ Signature verified. Event type:', event.type);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log('💳 Session ID:', session.id);
    console.log('📋 Session metadata:', JSON.stringify(session.metadata));

    const userId = session.metadata?.user_id;
    const plan = session.metadata?.plan;

    if (!userId || !plan) {
      console.error('❌ Missing metadata. user_id:', userId, 'plan:', plan);
      return new Response('OK', { status: 200 });
    }

    const studentsToCredit = PLAN_STUDENTS[plan];
    if (!studentsToCredit) {
      console.error('❌ Unknown plan:', plan);
      return new Response('OK', { status: 200 });
    }

    console.log('📊 Plan:', plan, '| Students to credit:', studentsToCredit);

    // Use service role to bypass RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    console.log('🔑 SUPABASE_URL present:', !!supabaseUrl, '| SERVICE_ROLE_KEY present:', !!serviceRoleKey);

    const supabaseAdmin = createClient(supabaseUrl!, serviceRoleKey!);

    // Calculate plan_expires_at: August 31st of current academic year
    const now = new Date();
    const month = now.getMonth(); // 0-indexed: 0=Jan, 8=Sep
    const year = month >= 8 ? now.getFullYear() + 1 : now.getFullYear();
    const expiresAt = `${year}-08-31T23:59:59Z`;
    console.log('📅 Expires at:', expiresAt);

    // Fetch current balance
    const { data: currentProfile, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('students_balance, plan')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching profile:', JSON.stringify(fetchError));
      return new Response('OK', { status: 200 });
    }

    console.log('👤 Current profile:', JSON.stringify(currentProfile));

    const newBalance = (currentProfile.students_balance || 0) + studentsToCredit;

    // Update profile with new balance
    const { data: updateData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        students_balance: newBalance,
        plan: plan,
        plan_purchased_at: new Date().toISOString(),
        plan_expires_at: expiresAt,
      })
      .eq('id', userId)
      .select();

    console.log('📝 UPDATE result - data:', JSON.stringify(updateData), '| error:', JSON.stringify(profileError));

    if (profileError) {
      console.error('❌ Error updating profile:', JSON.stringify(profileError));
    }

    // Log payment
    const { data: paymentData, error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        user_id: userId,
        stripe_session_id: session.id,
        stripe_payment_intent: typeof session.payment_intent === 'string' ? session.payment_intent : null,
        plan: plan,
        amount: session.amount_total || 0,
        students_credited: studentsToCredit,
        status: 'completed',
      })
      .select();

    console.log('💰 Payment log - data:', JSON.stringify(paymentData), '| error:', JSON.stringify(paymentError));

    if (paymentError) {
      console.error('❌ Error logging payment:', JSON.stringify(paymentError));
    }

    console.log(`✅ SUCCESS: Credited ${studentsToCredit} students to user ${userId} (${currentProfile.students_balance || 0} → ${newBalance}) for plan ${plan}`);
  } else {
    console.log('ℹ️ Unhandled event type:', event.type);
  }

  return new Response('OK', { status: 200 });
});
