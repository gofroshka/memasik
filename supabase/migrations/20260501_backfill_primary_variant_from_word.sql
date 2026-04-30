-- Older words had image_url and short_description only on the word row,
-- not on the primary variant. After the per-variant refactor the user
-- card pulls those from associations[0], so values must mirror.

-- Backfill primary variant image from word.image_url when missing.
UPDATE public.words
SET associations = jsonb_set(associations, '{0,image_url}', to_jsonb(image_url))
WHERE jsonb_array_length(coalesce(associations, '[]'::jsonb)) > 0
  AND (associations -> 0 ->> 'image_url') IS NULL
  AND image_url IS NOT NULL;

-- Backfill primary variant short_description from word.short_description when missing.
UPDATE public.words
SET associations = jsonb_set(associations, '{0,short_description}', to_jsonb(short_description))
WHERE jsonb_array_length(coalesce(associations, '[]'::jsonb)) > 0
  AND (associations -> 0 ->> 'short_description') IS NULL
  AND short_description IS NOT NULL;
