-- KidsCareerDecoder — PostgreSQL for Supabase
-- Run via Supabase Dashboard → SQL → New query, or: supabase db push

CREATE EXTENSION IF NOT EXISTS "citext";

-- ---------------------------------------------------------------------------
-- Users
-- ---------------------------------------------------------------------------
CREATE TABLE public.users (
  id text PRIMARY KEY,
  email citext NOT NULL UNIQUE,
  password_hash text,
  full_name text NOT NULL,
  role text NOT NULL CHECK (
    role IN ('parent', 'child', 'student', 'instructor', 'admin')
  ),
  parent_user_id text REFERENCES public.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_parent ON public.users (parent_user_id);
CREATE INDEX idx_users_role ON public.users (role);

-- ---------------------------------------------------------------------------
-- Quizzes
-- ---------------------------------------------------------------------------
CREATE TABLE public.quizzes (
  id text PRIMARY KEY,
  slug text UNIQUE,
  title text NOT NULL,
  description text,
  created_by_user_id text REFERENCES public.users (id) ON DELETE SET NULL,
  default_difficulty double precision NOT NULL DEFAULT 0.5,
  time_per_question_seconds integer NOT NULL DEFAULT 60,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_quizzes_published ON public.quizzes (is_published);

-- ---------------------------------------------------------------------------
-- Questions
-- ---------------------------------------------------------------------------
CREATE TABLE public.questions (
  id text PRIMARY KEY,
  quiz_id text NOT NULL REFERENCES public.quizzes (id) ON DELETE CASCADE,
  body text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  difficulty_level double precision,
  aptitude_tag text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_questions_quiz ON public.questions (quiz_id);

-- ---------------------------------------------------------------------------
-- Question options
-- ---------------------------------------------------------------------------
CREATE TABLE public.question_options (
  id text PRIMARY KEY,
  question_id text NOT NULL REFERENCES public.questions (id) ON DELETE CASCADE,
  label text NOT NULL,
  aptitude_type text NOT NULL CHECK (
    aptitude_type IN (
      'logical',
      'creative',
      'verbal',
      'social',
      'scientific',
      'practical'
    )
  ),
  order_index integer NOT NULL DEFAULT 0,
  is_correct boolean,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_options_question ON public.question_options (question_id);

-- ---------------------------------------------------------------------------
-- Quiz sessions
-- ---------------------------------------------------------------------------
CREATE TABLE public.quiz_sessions (
  id text PRIMARY KEY,
  quiz_id text NOT NULL REFERENCES public.quizzes (id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  status text NOT NULL DEFAULT 'in_progress' CHECK (
    status IN ('in_progress', 'completed', 'abandoned')
  ),
  top_aptitude text,
  scores_json jsonb,
  metadata_json jsonb
);

CREATE INDEX idx_sessions_user ON public.quiz_sessions (user_id);
CREATE INDEX idx_sessions_quiz ON public.quiz_sessions (quiz_id);
CREATE INDEX idx_sessions_status ON public.quiz_sessions (status);

-- ---------------------------------------------------------------------------
-- Quiz answers
-- ---------------------------------------------------------------------------
CREATE TABLE public.quiz_answers (
  id text PRIMARY KEY,
  session_id text NOT NULL REFERENCES public.quiz_sessions (id) ON DELETE CASCADE,
  question_id text NOT NULL REFERENCES public.questions (id) ON DELETE CASCADE,
  question_option_id text REFERENCES public.question_options (id) ON DELETE SET NULL,
  aptitude_type text,
  response_time_ms integer,
  skipped boolean NOT NULL DEFAULT false,
  answered_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_answers_session ON public.quiz_answers (session_id);
CREATE INDEX idx_answers_question ON public.quiz_answers (question_id);

-- ---------------------------------------------------------------------------
-- Careers
-- ---------------------------------------------------------------------------
CREATE TABLE public.careers (
  id text PRIMARY KEY,
  title text NOT NULL,
  aptitude_type text NOT NULL CHECK (
    aptitude_type IN (
      'logical',
      'creative',
      'verbal',
      'social',
      'scientific',
      'practical'
    )
  ),
  sort_order integer NOT NULL DEFAULT 0
);

CREATE INDEX idx_careers_aptitude ON public.careers (aptitude_type);

-- ---------------------------------------------------------------------------
-- Optional app migration log
-- ---------------------------------------------------------------------------
CREATE TABLE public.schema_migrations (
  version integer PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security (service role bypasses; tighten when using anon key)
-- ---------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schema_migrations ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- Seed (idempotent)
-- ---------------------------------------------------------------------------
INSERT INTO public.quizzes (
  id,
  slug,
  title,
  description,
  created_by_user_id,
  default_difficulty,
  time_per_question_seconds,
  is_published
)
VALUES
  (
    'quiz-aptitude-v1',
    'aptitude-sparkle',
    'Sparkle map aptitude quiz',
    'Short scenario quiz that surfaces strength stripes for kids.',
    NULL,
    0.5,
    60,
    true
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, quiz_id, body, order_index, difficulty_level, aptitude_tag)
VALUES
  ('q1', 'quiz-aptitude-v1', 'Your class is making a mural for the hallway. What do you want to do most?', 1, 0.5, NULL),
  ('q2', 'quiz-aptitude-v1', 'A rainy Saturday means an indoor project. What sounds best?', 2, 0.5, NULL),
  ('q3', 'quiz-aptitude-v1', 'The school garden club needs help. Where do you jump in?', 3, 0.5, NULL),
  ('q4', 'quiz-aptitude-v1', 'A friend seems stuck on a math puzzle. What is your first move?', 4, 0.5, NULL),
  ('q5', 'quiz-aptitude-v1', 'You get one hour of free maker time. What pulls you in?', 5, 0.5, NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct)
VALUES
  ('q1o1', 'q1', 'Measure the wall and plan how every piece fits together', 'logical', 1, NULL),
  ('q1o2', 'q1', 'Sketch ideas and pick wild color combos nobody expected', 'creative', 2, NULL),
  ('q1o3', 'q1', 'Write a short caption that explains the story of the mural', 'verbal', 3, NULL),
  ('q1o4', 'q1', 'Organize teams so everyone gets a job they enjoy', 'social', 4, NULL),
  ('q2o1', 'q2', 'Build a sturdy bridge from recycled cardboard and tape', 'practical', 1, NULL),
  ('q2o2', 'q2', 'Mix baking soda and vinegar and jot down what changes each time', 'scientific', 2, NULL),
  ('q2o3', 'q2', 'Record a mini podcast about your favorite animal', 'verbal', 3, NULL),
  ('q2o4', 'q2', 'Paint a comic strip with an original superhero', 'creative', 4, NULL),
  ('q3o1', 'q3', 'Chart sun versus shade for where each plant should go', 'logical', 1, NULL),
  ('q3o2', 'q3', 'Test the soil and read what nutrients it might need', 'scientific', 2, NULL),
  ('q3o3', 'q3', 'Welcome newcomers and show them how to use the tools safely', 'social', 3, NULL),
  ('q3o4', 'q3', 'Build raised beds and fix a wobbly gate latch', 'practical', 4, NULL),
  ('q4o1', 'q4', 'Draw a quick picture or diagram to spot the pattern', 'creative', 1, NULL),
  ('q4o2', 'q4', 'Talk through each step out loud until it clicks', 'verbal', 2, NULL),
  ('q4o3', 'q4', 'Split the problem into smaller chunks and tackle them in order', 'logical', 3, NULL),
  ('q4o4', 'q4', 'Sit side by side and try a few strategies together', 'social', 4, NULL),
  ('q5o1', 'q5', 'Prototype a simple machine that moves a marble', 'practical', 1, NULL),
  ('q5o2', 'q5', 'Write skits and perform them with friends', 'social', 2, NULL),
  ('q5o3', 'q5', 'Invent a board game with silly rules that still feel fair', 'creative', 3, NULL),
  ('q5o4', 'q5', 'Read about space telescopes and summarize the coolest fact', 'scientific', 4, NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.careers (id, title, aptitude_type, sort_order)
VALUES
  ('car-l1', 'Puzzle Game Designer', 'logical', 1),
  ('car-l2', 'City Traffic Planner', 'logical', 2),
  ('car-l3', 'Detective Scientist', 'logical', 3),
  ('car-c1', 'Animator', 'creative', 1),
  ('car-c2', 'Toy Inventor', 'creative', 2),
  ('car-c3', 'Mural Artist', 'creative', 3),
  ('car-v1', 'Podcast Host', 'verbal', 1),
  ('car-v2', 'Children''s Book Author', 'verbal', 2),
  ('car-v3', 'News Reporter', 'verbal', 3),
  ('car-s1', 'Team Coach', 'social', 1),
  ('car-s2', 'School Counselor', 'social', 2),
  ('car-s3', 'Community Event Host', 'social', 3),
  ('car-sc1', 'Marine Biologist', 'scientific', 1),
  ('car-sc2', 'Weather Researcher', 'scientific', 2),
  ('car-sc3', 'Robotics Tinkerer', 'scientific', 3),
  ('car-p1', 'Carpenter', 'practical', 1),
  ('car-p2', 'Bike Mechanic', 'practical', 2),
  ('car-p3', 'Chef', 'practical', 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.schema_migrations (version) VALUES (1)
ON CONFLICT (version) DO NOTHING;
