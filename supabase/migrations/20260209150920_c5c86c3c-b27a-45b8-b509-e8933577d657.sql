
CREATE TABLE public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  stripe_session_id TEXT NOT NULL,
  stripe_payment_intent TEXT,
  plan TEXT NOT NULL,
  amount INTEGER NOT NULL,
  students_credited INTEGER NOT NULL,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);
