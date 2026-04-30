-- Returns the list of registered users (email + registration date) for the
-- admin analytics screen. Reads auth.users, so it runs with SECURITY DEFINER
-- and gates access through is_admin() to keep emails out of non-admin hands.
CREATE OR REPLACE FUNCTION public.get_users_list()
RETURNS TABLE(email text, created_at timestamptz)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT u.email::text, p.created_at
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE public.is_admin()
  ORDER BY p.created_at DESC;
$$;
