-- 1. Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 3. Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 5. RLS policy for user_roles - only admins can read all roles
CREATE POLICY "Admins can view all roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 6. Create promo_codes table
CREATE TABLE public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  type text NOT NULL CHECK (type IN ('free_credits', 'discount')),
  value integer NOT NULL CHECK (value > 0),
  max_uses integer DEFAULT NULL,
  current_uses integer DEFAULT 0,
  max_uses_per_user integer DEFAULT 1,
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz DEFAULT NULL,
  is_active boolean DEFAULT true,
  description text DEFAULT NULL,
  created_at timestamptz DEFAULT now()
);

-- 7. Create index on code for fast lookups
CREATE INDEX idx_promo_codes_code ON public.promo_codes(code);
CREATE INDEX idx_promo_codes_active ON public.promo_codes(is_active) WHERE is_active = true;

-- 8. Enable RLS on promo_codes
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- 9. RLS policies for promo_codes
-- Anyone can read active codes (needed for validation in edge function with service role)
CREATE POLICY "Anyone can read active promo codes"
  ON public.promo_codes
  FOR SELECT
  USING (is_active = true);

-- Only admins can manage promo codes
CREATE POLICY "Admins can manage all promo codes"
  ON public.promo_codes
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 10. Create promo_code_redemptions table
CREATE TABLE public.promo_code_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  promo_code_id uuid REFERENCES public.promo_codes(id) ON DELETE CASCADE NOT NULL,
  redeemed_at timestamptz DEFAULT now(),
  credits_awarded integer NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  UNIQUE(user_id, promo_code_id)
);

-- 11. Create indexes for redemptions lookups
CREATE INDEX idx_redemptions_user ON public.promo_code_redemptions(user_id);
CREATE INDEX idx_redemptions_code ON public.promo_code_redemptions(promo_code_id);

-- 12. Enable RLS on promo_code_redemptions
ALTER TABLE public.promo_code_redemptions ENABLE ROW LEVEL SECURITY;

-- 13. RLS policies for promo_code_redemptions
-- Users can view their own redemptions
CREATE POLICY "Users can view their own redemptions"
  ON public.promo_code_redemptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can view all redemptions
CREATE POLICY "Admins can view all redemptions"
  ON public.promo_code_redemptions
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));