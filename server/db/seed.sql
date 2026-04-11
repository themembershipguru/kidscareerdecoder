-- Seed: default aptitude quiz matching current front-end mock (TakeQuiz.jsx).
-- IDs are stable so re-running seed is safe with INSERT OR IGNORE.

INSERT OR IGNORE INTO quizzes (
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
    1
  );

-- Questions
INSERT OR IGNORE INTO questions (id, quiz_id, body, order_index, difficulty_level, aptitude_tag)
VALUES
  ('q1', 'quiz-aptitude-v1', 'Your class is making a mural for the hallway. What do you want to do most?', 1, 0.5, NULL),
  ('q2', 'quiz-aptitude-v1', 'A rainy Saturday means an indoor project. What sounds best?', 2, 0.5, NULL),
  ('q3', 'quiz-aptitude-v1', 'The school garden club needs help. Where do you jump in?', 3, 0.5, NULL),
  ('q4', 'quiz-aptitude-v1', 'A friend seems stuck on a math puzzle. What is your first move?', 4, 0.5, NULL),
  ('q5', 'quiz-aptitude-v1', 'You get one hour of free maker time. What pulls you in?', 5, 0.5, NULL);

-- Options (aptitude_type drives scoring on the client today)
INSERT OR IGNORE INTO question_options (id, question_id, label, aptitude_type, order_index, is_correct)
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
  ('q5o4', 'q5', 'Read about space telescopes and summarize the coolest fact', 'scientific', 4, NULL);

-- Sample careers (aligned with Results.jsx samples)
INSERT OR IGNORE INTO careers (id, title, aptitude_type, sort_order)
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
  ('car-p3', 'Chef', 'practical', 3);

INSERT OR IGNORE INTO schema_migrations (version) VALUES (1);
