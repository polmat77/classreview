
-- Defense in depth: block authenticated users from writing to payments
-- Service role (used by stripe-webhook) bypasses RLS, so this won't affect normal operations

CREATE POLICY "Only service role can insert payments"
  ON public.payments
  FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "Payments cannot be updated"
  ON public.payments
  FOR UPDATE
  TO authenticated
  USING (false);

CREATE POLICY "Payments cannot be deleted"
  ON public.payments
  FOR DELETE
  TO authenticated
  USING (false);
