-- Free-form feedback channel separate from word suggestions: bug reports,
-- product ideas, anything users want to send to the team.
CREATE TABLE IF NOT EXISTS public.user_feedback (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        text NOT NULL DEFAULT 'other'
              CHECK (type IN ('bug', 'idea', 'other')),
  message     text NOT NULL CHECK (length(btrim(message)) > 0),
  status      text NOT NULL DEFAULT 'new'
              CHECK (status IN ('new', 'in_progress', 'done', 'rejected')),
  admin_note  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_feedback_user_idx     ON public.user_feedback(user_id);
CREATE INDEX IF NOT EXISTS user_feedback_status_idx   ON public.user_feedback(status);
CREATE INDEX IF NOT EXISTS user_feedback_created_idx  ON public.user_feedback(created_at DESC);

ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own feedback"  ON public.user_feedback;
DROP POLICY IF EXISTS "Users can insert feedback"    ON public.user_feedback;
DROP POLICY IF EXISTS "Admins can update feedback"   ON public.user_feedback;
DROP POLICY IF EXISTS "Admins can delete feedback"   ON public.user_feedback;

CREATE POLICY "Users can read own feedback"
  ON public.user_feedback FOR SELECT
  USING ((select auth.uid()) = user_id OR public.is_admin());

CREATE POLICY "Users can insert feedback"
  ON public.user_feedback FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Admins can update feedback"
  ON public.user_feedback FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete feedback"
  ON public.user_feedback FOR DELETE
  USING (public.is_admin());
