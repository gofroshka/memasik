-- Each word can have multiple mnemonic association variants.
-- Shape: jsonb array of { text, image_url, short_description }.
ALTER TABLE public.words
  ADD COLUMN IF NOT EXISTS associations jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Backfill: every word with a non-empty `description` becomes a single variant
-- so the existing user-facing pages keep showing the same content.
UPDATE public.words
SET associations = jsonb_build_array(
  jsonb_build_object(
    'text', description,
    'image_url', NULL,
    'short_description', NULL
  )
)
WHERE jsonb_array_length(associations) = 0
  AND description IS NOT NULL
  AND btrim(description) <> '';
