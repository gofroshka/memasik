-- Per-variant feedback breakdown for a single word.
CREATE OR REPLACE FUNCTION public.get_word_variant_stats(p_word_id uuid)
RETURNS TABLE(
  variant_id text,
  pos int,
  label text,
  up bigint,
  down bigint
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH variants AS (
    SELECT
      v.value ->> 'id'                                          AS vid,
      v.ordinality::int                                          AS pos,
      coalesce(nullif(v.value ->> 'short_description', ''), '')  AS short_desc
    FROM public.words w,
         jsonb_array_elements(w.associations) WITH ORDINALITY AS v(value, ordinality)
    WHERE w.id = p_word_id
  )
  SELECT
    var.vid                                                              AS variant_id,
    var.pos                                                              AS pos,
    CASE
      WHEN var.short_desc <> ''  THEN var.short_desc
      WHEN var.pos = 1           THEN 'Основной'
      ELSE 'Вариант ' || var.pos
    END                                                                  AS label,
    coalesce(count(f.id) FILTER (WHERE f.vote = true), 0)::bigint        AS up,
    coalesce(count(f.id) FILTER (WHERE f.vote = false), 0)::bigint       AS down
  FROM variants var
  LEFT JOIN public.word_feedback f
    ON f.word_id = p_word_id AND f.variant_id = var.vid
  GROUP BY var.vid, var.pos, var.short_desc
  ORDER BY var.pos;
$$;

-- Top-rated variants across all words (global "best associations" list).
CREATE OR REPLACE FUNCTION public.get_top_rated_variants()
RETURNS TABLE(
  word_id uuid,
  word text,
  translation text,
  variant_id text,
  pos int,
  label text,
  up bigint,
  down bigint
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH variants AS (
    SELECT
      w.id                                                       AS word_id,
      w.word,
      w.translation,
      v.value ->> 'id'                                           AS vid,
      v.ordinality::int                                          AS pos,
      coalesce(nullif(v.value ->> 'short_description', ''), '')  AS short_desc
    FROM public.words w,
         jsonb_array_elements(w.associations) WITH ORDINALITY AS v(value, ordinality)
  )
  SELECT
    var.word_id,
    var.word,
    var.translation,
    var.vid AS variant_id,
    var.pos AS pos,
    CASE
      WHEN var.short_desc <> ''  THEN var.short_desc
      WHEN var.pos = 1           THEN 'Основной'
      ELSE 'Вариант ' || var.pos
    END                                                AS label,
    count(f.id) FILTER (WHERE f.vote = true)  AS up,
    count(f.id) FILTER (WHERE f.vote = false) AS down
  FROM variants var
  LEFT JOIN public.word_feedback f
    ON f.word_id = var.word_id AND f.variant_id = var.vid
  GROUP BY var.word_id, var.word, var.translation, var.vid, var.pos, var.short_desc
  HAVING count(f.id) FILTER (WHERE f.vote = true) > 0
  ORDER BY up DESC, down ASC
  LIMIT 5;
$$;
