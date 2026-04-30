-- Admin-only feedback list with the author's email pulled in from auth.users.
CREATE OR REPLACE FUNCTION public.get_feedback_list()
RETURNS TABLE(
  id          uuid,
  user_id     uuid,
  email       text,
  type        text,
  status      text,
  message     text,
  admin_note  text,
  created_at  timestamptz,
  updated_at  timestamptz
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT f.id, f.user_id, u.email::text, f.type, f.status, f.message, f.admin_note, f.created_at, f.updated_at
  FROM public.user_feedback f
  LEFT JOIN auth.users u ON u.id = f.user_id
  WHERE public.is_admin()
  ORDER BY
    CASE f.status WHEN 'new' THEN 0 WHEN 'in_progress' THEN 1 WHEN 'done' THEN 2 WHEN 'rejected' THEN 3 ELSE 4 END,
    f.created_at DESC;
$$;
