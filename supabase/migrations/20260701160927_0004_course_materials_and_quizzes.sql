/*
# Course Materials and Quizzes

1. New Tables
- `course_materials` — educational articles, videos, PDF presentations for each course
  - `id` (uuid, primary key)
  - `course_id` (uuid, FK to courses)
  - `order_index` (integer, display order)
  - `title` (text)
  - `type` (text: 'theory' | 'article' | 'video' | 'pdf' | 'summary')
  - `content` (text, markdown/html body for articles)
  - `video_url` (text, YouTube embed URL)
  - `pdf_url` (text, link to PDF file)
  - `image_urls` (jsonb array of image URLs)
  - `created_at`

- `course_quizzes` — a quiz (set of 15 questions) per course material block
  - `id` (uuid, primary key)
  - `course_id` (uuid, FK to courses)
  - `material_id` (uuid, FK to course_materials, nullable — can be attached to the whole course)
  - `title` (text)
  - `questions` (jsonb array of question objects)
  - `order_index` (integer)
  - `created_at`

2. Security
- RLS enabled on both tables, read-only for authenticated users.
*/

CREATE TABLE IF NOT EXISTS course_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'article' CHECK (type IN ('theory', 'article', 'video', 'pdf', 'summary')),
  content TEXT,
  video_url TEXT,
  pdf_url TEXT,
  image_urls JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS course_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  material_id UUID REFERENCES course_materials(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE course_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_quizzes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "materials_read" ON course_materials;
CREATE POLICY "materials_read" ON course_materials FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "quizzes_read" ON course_quizzes;
CREATE POLICY "quizzes_read" ON course_quizzes FOR SELECT
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_course_materials_course ON course_materials(course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_course_quizzes_course ON course_quizzes(course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_course_quizzes_material ON course_quizzes(material_id);
