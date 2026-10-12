-- Session 90: allow 12 pastel colours on CATEGORIES (goals and accounts keep 6).
--
-- Optional. Without it the app still works: a category saved with one of the six
-- new colours is retried with its base fallback (lib/categories.js →
-- isColorCheckViolation) and the user is told to run this file.
--
-- Safe to re-run.
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_color_check;

ALTER TABLE categories
  ADD CONSTRAINT categories_color_check
  CHECK (
    color IS NULL OR color IN (
      'indigo', 'rose', 'emerald', 'amber', 'violet', 'cyan',
      'orange', 'sky', 'pink', 'lime', 'fuchsia', 'teal'
    )
  );
