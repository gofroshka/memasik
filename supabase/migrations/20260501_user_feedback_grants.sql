-- The user_feedback table was created without granting table-level access to
-- the PostgREST roles, so any client request was rejected before RLS even
-- ran. Grant the same privileges as user_suggestions; RLS continues to
-- narrow the visible rows.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_feedback TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_feedback_list() TO authenticated, service_role;
