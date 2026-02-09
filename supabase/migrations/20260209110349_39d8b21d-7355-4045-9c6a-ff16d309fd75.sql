-- Add policy to allow users to view their own role assignments
-- This enables application functionality where users need to know their own permissions

CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);