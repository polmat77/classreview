CREATE POLICY "Users can create own redemptions"
  ON public.promo_code_redemptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);