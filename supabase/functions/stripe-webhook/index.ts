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
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id;
    const plan = session.metadata?.plan;

    if (!userId || !plan) {
      console.error('Missing metadata in session:', session.id);
      return new Response('OK', { status: 200 });
    }

    const studentsToCredit = PLAN_STUDENTS[plan];
    if (!studentsToCredit) {
      console.error('Unknown plan:', plan);
      return new Response('OK', { status: 200 });
    }

    // Use service role to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Calculate plan_expires_at: August 31st of current academic year
    // Sept-Dec → Aug 31 next year; Jan-Aug → Aug 31 this year
    const now = new Date();
    const month = now.getMonth(); // 0-indexed: 0=Jan, 8=Sep
    const year = month >= 8 ? now.getFullYear() + 1 : now.getFullYear();
    const expiresAt = `${year}-08-31T23:59:59Z`;

    // Update profile
    const { error: updateError } = await supabaseAdmin.rpc('execute_sql', {} as any).catch(() => ({ error: null }));
    
    // Use direct update with increment
    const { data: currentProfile, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('students_balance')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching profile:', fetchError);
      return new Response('OK', { status: 200 });
    }

    const newBalance = (currentProfile.students_balance || 0) + studentsToCredit;

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        students_balance: newBalance,
        plan: plan,
        plan_purchased_at: new Date().toISOString(),
        plan_expires_at: expiresAt,
      })
      .eq('id', userId);

    if (profileError) {
      console.error('Error updating profile:', profileError);
    }

    // Log payment
    const { error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        user_id: userId,
        stripe_session_id: session.id,
        stripe_payment_intent: typeof session.payment_intent === 'string' ? session.payment_intent : null,
        plan: plan,
        amount: session.amount_total || 0,
        students_credited: studentsToCredit,
        status: 'completed',
      });

    if (paymentError) {
      console.error('Error logging payment:', paymentError);
    }

    console.log(`✅ Credited ${studentsToCredit} students to user ${userId} for plan ${plan}`);
  }

  return new Response('OK', { status: 200 });
});
