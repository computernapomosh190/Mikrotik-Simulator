/*
# Per-material quiz support

Adds a `quiz_type` column to course_quizzes to distinguish between
a short per-material quiz (5 questions) and a full course quiz (15 questions).

1. Changes
  - Add `quiz_type` TEXT column ('per_material' | 'course_summary') to course_quizzes
  - Default existing rows to 'course_summary'
*/

ALTER TABLE course_quizzes
  ADD COLUMN IF NOT EXISTS quiz_type TEXT NOT NULL DEFAULT 'course_summary'
    CHECK (quiz_type IN ('per_material', 'course_summary'));
