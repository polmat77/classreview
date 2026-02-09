-- Remove the policy that exposes all active promo codes to authenticated users
-- Users don't need to browse promo codes; they submit codes via edge function (service role)
DROP POLICY IF EXISTS "Authenticated users can read active promo codes" ON public.promo_codes;