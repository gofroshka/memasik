-- Each word and suggestion belongs to a section so the app can host
-- multiple parallel learning tracks (e.g. English mnemonics, Russian
-- vocabulary words, ...).
ALTER TABLE public.words
  ADD COLUMN IF NOT EXISTS section text NOT NULL DEFAULT 'english';

ALTER TABLE public.words
  DROP CONSTRAINT IF EXISTS words_section_check;
ALTER TABLE public.words
  ADD CONSTRAINT words_section_check CHECK (section IN ('english', 'russian'));

CREATE INDEX IF NOT EXISTS words_section_idx ON public.words(section);

ALTER TABLE public.user_suggestions
  ADD COLUMN IF NOT EXISTS section text NOT NULL DEFAULT 'english';

ALTER TABLE public.user_suggestions
  DROP CONSTRAINT IF EXISTS user_suggestions_section_check;
ALTER TABLE public.user_suggestions
  ADD CONSTRAINT user_suggestions_section_check CHECK (section IN ('english', 'russian'));

-- Russian section doesn't use transcription, so make it optional.
ALTER TABLE public.user_suggestions
  ALTER COLUMN transcription DROP NOT NULL;
