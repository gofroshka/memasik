-- Per-variant feedback: each association gets a stable id, and word_feedback
-- records which variant the vote applies to.

-- 1. Give every existing variant a stable id (uuid as text).
UPDATE public.words SET associations = (
  SELECT jsonb_agg(
    CASE
      WHEN v ? 'id' AND nullif(v ->> 'id', '') IS NOT NULL THEN v
      ELSE v || jsonb_build_object('id', gen_random_uuid()::text)
    END
  )
  FROM jsonb_array_elements(associations) v
)
WHERE jsonb_array_length(coalesce(associations, '[]'::jsonb)) > 0;

-- 2. Add the column nullable so the backfill can run.
ALTER TABLE public.word_feedback
  ADD COLUMN IF NOT EXISTS variant_id text;

-- 3. Backfill existing votes onto the primary variant of each word.
UPDATE public.word_feedback wf
SET variant_id = (
  SELECT w.associations -> 0 ->> 'id'
  FROM public.words w
  WHERE w.id = wf.word_id
)
WHERE wf.variant_id IS NULL;

-- 4. Swap the uniqueness constraint to include the variant.
ALTER TABLE public.word_feedback
  DROP CONSTRAINT IF EXISTS word_feedback_user_id_word_id_key;

ALTER TABLE public.word_feedback
  ALTER COLUMN variant_id SET NOT NULL;

ALTER TABLE public.word_feedback
  ADD CONSTRAINT word_feedback_user_word_variant_key
  UNIQUE (user_id, word_id, variant_id);
