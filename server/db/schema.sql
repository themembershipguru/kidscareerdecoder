-- Legacy SQLite reference (local-only). Production DB: Supabase (PostgreSQL).
-- Apply: supabase/migrations/20250404000000_initial_schema.sql

PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------------------
-- Users (parents, children, students, instructors, admins)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (
    role IN ('parent', 'child', 'student', 'instructor', 'admin')
  ),
  parent_user_id TEXT REFERENCES users (id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime ('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime ('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_parent ON users (parent_user_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

-- ---------------------------------------------------------------------------
-- Quizzes (a quiz is a container; difficulty fields support future AI)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quizzes (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  created_by_user_id TEXT REFERENCES users (id) ON DELETE SET NULL,
  default_difficulty REAL NOT NULL DEFAULT 0.5,
  time_per_question_seconds INTEGER NOT NULL DEFAULT 60,
  is_published INTEGER NOT NULL DEFAULT 0 CHECK (is_published IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime ('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime ('now'))
);

CREATE INDEX IF NOT EXISTS idx_quizzes_published ON quizzes (is_published);

-- ---------------------------------------------------------------------------
-- Questions (body + ordering + baseline difficulty for ML)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  quiz_id TEXT NOT NULL REFERENCES quizzes (id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  difficulty_level REAL,
  aptitude_tag TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime ('now'))
);

CREATE INDEX IF NOT EXISTS idx_questions_quiz ON questions (quiz_id);

-- ---------------------------------------------------------------------------
-- Question options (aptitude-style paths and/or future correct/incorrect)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS question_options (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL REFERENCES questions (id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  aptitude_type TEXT NOT NULL CHECK (
    aptitude_type IN (
      'logical',
      'creative',
      'verbal',
      'social',
      'scientific',
      'practical'
    )
  ),
  order_index INTEGER NOT NULL DEFAULT 0,
  is_correct INTEGER CHECK (is_correct IS NULL OR is_correct IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime ('now'))
);

CREATE INDEX IF NOT EXISTS idx_options_question ON question_options (question_id);

-- ---------------------------------------------------------------------------
-- Quiz sessions / attempts (one row per learner run)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id TEXT PRIMARY KEY,
  quiz_id TEXT NOT NULL REFERENCES quizzes (id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  started_at TEXT NOT NULL DEFAULT (datetime ('now')),
  completed_at TEXT,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (
    status IN ('in_progress', 'completed', 'abandoned')
  ),
  top_aptitude TEXT,
  scores_json TEXT,
  metadata_json TEXT
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON quiz_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_quiz ON quiz_sessions (quiz_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON quiz_sessions (status);

-- ---------------------------------------------------------------------------
-- Per-question results (granular data for AI / analytics)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quiz_answers (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES quiz_sessions (id) ON DELETE CASCADE,
  question_id TEXT NOT NULL REFERENCES questions (id) ON DELETE CASCADE,
  question_option_id TEXT REFERENCES question_options (id) ON DELETE SET NULL,
  aptitude_type TEXT,
  response_time_ms INTEGER,
  skipped INTEGER NOT NULL DEFAULT 0 CHECK (skipped IN (0, 1)),
  answered_at TEXT NOT NULL DEFAULT (datetime ('now'))
);

CREATE INDEX IF NOT EXISTS idx_answers_session ON quiz_answers (session_id);
CREATE INDEX IF NOT EXISTS idx_answers_question ON quiz_answers (question_id);

-- ---------------------------------------------------------------------------
-- Career suggestions (optional reference data keyed by top aptitude)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS careers (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  aptitude_type TEXT NOT NULL CHECK (
    aptitude_type IN (
      'logical',
      'creative',
      'verbal',
      'social',
      'scientific',
      'practical'
    )
  ),
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_careers_aptitude ON careers (aptitude_type);

-- ---------------------------------------------------------------------------
-- Schema version (apply migrations incrementally later)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL DEFAULT (datetime ('now'))
);
