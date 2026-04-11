INSERT INTO public.users (id, email, password_hash, full_name, role, parent_user_id, birth_year, date_of_birth, updated_at)
VALUES
  ('usr_parent_001', 'parent@test.com', '$2a$10$sI6h18v2ahW1mj6MFP62ru6M8Ur5eM6VQXXRrwOx2pXo2xkN/yXY6', 'Test Parent', 'parent', NULL, NULL, NULL, now()),
  ('usr_parent_002', 'demo@test.com', '$2a$10$sI6h18v2ahW1mj6MFP62ru6M8Ur5eM6VQXXRrwOx2pXo2xkN/yXY6', 'Demo Parent', 'parent', NULL, NULL, NULL, now()),
  ('usr_child_001', 'alex.child.seed@child.kidscareerdecoder.internal', '$2a$10$4SsaUatNKUe7nKiJc1.WAujcaf43NGKRDOfFzKEosV5gJcGC/d.jy', 'Alex', 'child', 'usr_parent_001', 2014, '2014-03-15', now()),
  ('usr_child_002', 'maya.child.seed@child.kidscareerdecoder.internal', '$2a$10$4SsaUatNKUe7nKiJc1.WAujcaf43NGKRDOfFzKEosV5gJcGC/d.jy', 'Maya', 'child', 'usr_parent_001', 2016, '2016-07-22', now()),
  ('usr_child_003', 'sam.child.seed@child.kidscareerdecoder.internal', '$2a$10$4SsaUatNKUe7nKiJc1.WAujcaf43NGKRDOfFzKEosV5gJcGC/d.jy', 'Sam', 'child', 'usr_parent_002', 2013, '2013-11-08', now())
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  password_hash = EXCLUDED.password_hash,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  parent_user_id = EXCLUDED.parent_user_id,
  birth_year = EXCLUDED.birth_year,
  date_of_birth = EXCLUDED.date_of_birth,
  updated_at = EXCLUDED.updated_at;

INSERT INTO public.quizzes (id, slug, title, description, created_by_user_id, default_difficulty, time_per_question_seconds, is_published, updated_at)
VALUES (
  'quiz_001',
  'discover-your-strengths',
  'Discover Your Strengths',
  'Fun scenario questions that help map your sparkle strengths.',
  'usr_parent_001',
  0.5,
  60,
  true,
  now()
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  is_published = EXCLUDED.is_published,
  time_per_question_seconds = EXCLUDED.time_per_question_seconds,
  updated_at = EXCLUDED.updated_at;

INSERT INTO public.careers (id, title, aptitude_type, sort_order) VALUES
  ('seed_car_l1', 'Software Engineer', 'logical', 1),
  ('seed_car_l2', 'Data Scientist', 'logical', 2),
  ('seed_car_l3', 'Accountant', 'logical', 3),
  ('seed_car_l4', 'Mathematician', 'logical', 4),
  ('seed_car_c1', 'Animator', 'creative', 1),
  ('seed_car_c2', 'Graphic Designer', 'creative', 2),
  ('seed_car_c3', 'Film Director', 'creative', 3),
  ('seed_car_c4', 'Fashion Designer', 'creative', 4),
  ('seed_car_v1', 'Journalist', 'verbal', 1),
  ('seed_car_v2', 'Author', 'verbal', 2),
  ('seed_car_v3', 'Lawyer', 'verbal', 3),
  ('seed_car_v4', 'Translator', 'verbal', 4),
  ('seed_car_s1', 'Teacher', 'social', 1),
  ('seed_car_s2', 'Counsellor', 'social', 2),
  ('seed_car_s3', 'Social Worker', 'social', 3),
  ('seed_car_s4', 'Event Planner', 'social', 4),
  ('seed_car_sc1', 'Marine Biologist', 'scientific', 1),
  ('seed_car_sc2', 'Astronomer', 'scientific', 2),
  ('seed_car_sc3', 'Pharmacist', 'scientific', 3),
  ('seed_car_sc4', 'Environmental Scientist', 'scientific', 4),
  ('seed_car_p1', 'Architect', 'practical', 1),
  ('seed_car_p2', 'Civil Engineer', 'practical', 2),
  ('seed_car_p3', 'Surgeon', 'practical', 3),
  ('seed_car_p4', 'Mechanic', 'practical', 4)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, aptitude_type = EXCLUDED.aptitude_type, sort_order = EXCLUDED.sort_order;

INSERT INTO public.questions (id, quiz_id, body, order_index, difficulty_level, aptitude_tag) VALUES ('q001', 'quiz_001', 'You find a broken toy on the ground. What do you do?', 1, 0.5, NULL) ON CONFLICT (id) DO UPDATE SET body = EXCLUDED.body, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q001_a', 'q001', 'Figure out what snapped and try to repair it', 'logical', 1, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q001_b', 'q001', 'Turn it into a brand-new character for pretend play', 'creative', 2, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q001_c', 'q001', 'Make up a silly story about how it got broken', 'verbal', 3, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q001_d', 'q001', 'Ask nearby friends if it belongs to anyone', 'social', 4, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.questions (id, quiz_id, body, order_index, difficulty_level, aptitude_tag) VALUES ('q002', 'quiz_001', 'A rainy Saturday traps you inside. What sounds best?', 2, 0.5, NULL) ON CONFLICT (id) DO UPDATE SET body = EXCLUDED.body, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q002_a', 'q002', 'Sort your games by size and plan what to play first', 'logical', 1, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q002_b', 'q002', 'Build a blanket fort city with secret tunnels', 'practical', 2, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q002_c', 'q002', 'Record a weather report as a pretend news anchor', 'verbal', 3, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q002_d', 'q002', 'Invite everyone to vote on the next group activity', 'social', 4, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.questions (id, quiz_id, body, order_index, difficulty_level, aptitude_tag) VALUES ('q003', 'quiz_001', 'A new kid looks shy at lunch. What is your move?', 3, 0.5, NULL) ON CONFLICT (id) DO UPDATE SET body = EXCLUDED.body, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q003_a', 'q003', 'Share a clear plan for where to sit and what to try', 'logical', 1, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q003_b', 'q003', 'Draw a funny welcome comic on a napkin', 'creative', 2, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q003_c', 'q003', 'Tell a joke to break the ice', 'verbal', 3, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q003_d', 'q003', 'Sit with them and introduce your friends', 'social', 4, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.questions (id, quiz_id, body, order_index, difficulty_level, aptitude_tag) VALUES ('q004', 'quiz_001', 'The class pet looks extra wiggly today. What happens next?', 4, 0.5, NULL) ON CONFLICT (id) DO UPDATE SET body = EXCLUDED.body, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q004_a', 'q004', 'Track what it does every minute in a simple chart', 'scientific', 1, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q004_b', 'q004', 'Design a safer castle home with paper tubes', 'practical', 2, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q004_c', 'q004', 'Write a one-page adventure starring the pet', 'verbal', 3, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q004_d', 'q004', 'Teach a partner how to hold it gently', 'social', 4, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.questions (id, quiz_id, body, order_index, difficulty_level, aptitude_tag) VALUES ('q005', 'quiz_001', 'You forgot your homework at home. What do you try?', 5, 0.5, NULL) ON CONFLICT (id) DO UPDATE SET body = EXCLUDED.body, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q005_a', 'q005', 'List exactly what you finished and what is left', 'logical', 1, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q005_b', 'q005', 'Sketch a funny excuse comic your teacher might like', 'creative', 2, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q005_c', 'q005', 'Explain out loud what you learned yesterday', 'verbal', 3, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q005_d', 'q005', 'Ask a friend to help you redo it at recess', 'social', 4, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.questions (id, quiz_id, body, order_index, difficulty_level, aptitude_tag) VALUES ('q006', 'quiz_001', 'The talent show sign-up sheet is almost full. What do you pick?', 6, 0.5, NULL) ON CONFLICT (id) DO UPDATE SET body = EXCLUDED.body, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q006_a', 'q006', 'Pick the act with the clearest steps to practice', 'logical', 1, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q006_b', 'q006', 'Create a mash-up dance no one has tried yet', 'creative', 2, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q006_c', 'q006', 'Tell a short story with voices and sound effects', 'verbal', 3, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q006_d', 'q006', 'Form a group act so nobody performs alone', 'social', 4, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.questions (id, quiz_id, body, order_index, difficulty_level, aptitude_tag) VALUES ('q007', 'quiz_001', 'Your lunch box goes missing. What is your plan?', 7, 0.5, NULL) ON CONFLICT (id) DO UPDATE SET body = EXCLUDED.body, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q007_a', 'q007', 'Retrace your steps with a tiny map of where you went', 'logical', 1, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q007_b', 'q007', 'Make a missing poster with a silly mascot', 'creative', 2, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q007_c', 'q007', 'Announce politely that you are looking for it', 'verbal', 3, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q007_d', 'q007', 'Check with the office and your table team', 'social', 4, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.questions (id, quiz_id, body, order_index, difficulty_level, aptitude_tag) VALUES ('q008', 'quiz_001', 'You get to design a treehouse. What is step one?', 8, 0.5, NULL) ON CONFLICT (id) DO UPDATE SET body = EXCLUDED.body, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q008_a', 'q008', 'Measure the branches you can safely use', 'practical', 1, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q008_b', 'q008', 'Dream up a slide that spirals through the leaves', 'creative', 2, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q008_c', 'q008', 'Name the treehouse and write its rules', 'verbal', 3, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q008_d', 'q008', 'Host a vote for paint colors with your crew', 'social', 4, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.questions (id, quiz_id, body, order_index, difficulty_level, aptitude_tag) VALUES ('q009', 'quiz_001', 'Two friends argue about the rules of a game. What do you do?', 9, 0.5, NULL) ON CONFLICT (id) DO UPDATE SET body = EXCLUDED.body, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q009_a', 'q009', 'Rewrite the rules so both sides can agree', 'logical', 1, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q009_b', 'q009', 'Invent a brand-new mini-game as a tiebreaker', 'creative', 2, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q009_c', 'q009', 'Explain each side back to them in calm words', 'verbal', 3, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q009_d', 'q009', 'Help them take turns being the referee', 'social', 4, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.questions (id, quiz_id, body, order_index, difficulty_level, aptitude_tag) VALUES ('q010', 'quiz_001', 'Science fair is coming. What project calls you?', 10, 0.5, NULL) ON CONFLICT (id) DO UPDATE SET body = EXCLUDED.body, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q010_a', 'q010', 'Test which ramp angle makes a toy car go farthest', 'scientific', 1, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q010_b', 'q010', 'Build a glowing cardboard city for night photos', 'creative', 2, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q010_c', 'q010', 'Make a poster that explains your idea in simple words', 'verbal', 3, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q010_d', 'q010', 'Interview family members about what they wonder', 'social', 4, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.questions (id, quiz_id, body, order_index, difficulty_level, aptitude_tag) VALUES ('q011', 'quiz_001', 'Your room is a creative mess. How do you tackle it?', 11, 0.5, NULL) ON CONFLICT (id) DO UPDATE SET body = EXCLUDED.body, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q011_a', 'q011', 'Sort everything into keep, donate, and recycle piles', 'logical', 1, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q011_b', 'q011', 'Turn cleanup into a timed treasure hunt game', 'creative', 2, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q011_c', 'q011', 'Narrate the cleanup like a sports announcer', 'verbal', 3, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q011_d', 'q011', 'Offer trades so siblings help for ten minutes', 'social', 4, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.questions (id, quiz_id, body, order_index, difficulty_level, aptitude_tag) VALUES ('q012', 'quiz_001', 'Camping trip packing time. What is your style?', 12, 0.5, NULL) ON CONFLICT (id) DO UPDATE SET body = EXCLUDED.body, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q012_a', 'q012', 'Check the weather list and pack layers in order', 'scientific', 1, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q012_b', 'q012', 'Decorate your water bottle so it never gets mixed up', 'creative', 2, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q012_c', 'q012', 'Write a silly packing song you can sing twice', 'verbal', 3, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q012_d', 'q012', 'Split jobs so everyone packs one shared item', 'practical', 4, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.questions (id, quiz_id, body, order_index, difficulty_level, aptitude_tag) VALUES ('q013', 'quiz_001', 'A video game level keeps beating you. What now?', 13, 0.5, NULL) ON CONFLICT (id) DO UPDATE SET body = EXCLUDED.body, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q013_a', 'q013', 'Study the pattern and try one new strategy per round', 'logical', 1, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q013_b', 'q013', 'Redesign your character with wild new gear', 'creative', 2, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q013_c', 'q013', 'Watch a short guide and explain the trick to a friend', 'verbal', 3, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q013_d', 'q013', 'Co-op with someone who likes different skills', 'social', 4, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.questions (id, quiz_id, body, order_index, difficulty_level, aptitude_tag) VALUES ('q014', 'quiz_001', 'The park has litter near the swings. What do you do?', 14, 0.5, NULL) ON CONFLICT (id) DO UPDATE SET body = EXCLUDED.body, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q014_a', 'q014', 'Count pieces and estimate how long cleanup will take', 'scientific', 1, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q014_b', 'q014', 'Build a recycle monster bin that makes people smile', 'creative', 2, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q014_c', 'q014', 'Make a friendly sign with rhymes about litter', 'verbal', 3, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q014_d', 'q014', 'Gather a cleanup squad with gloves for everyone', 'social', 4, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.questions (id, quiz_id, body, order_index, difficulty_level, aptitude_tag) VALUES ('q015', 'quiz_001', 'You need a birthday gift for your sibling. What is your idea?', 15, 0.5, NULL) ON CONFLICT (id) DO UPDATE SET body = EXCLUDED.body, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q015_a', 'q015', 'Build a coupon book with clear promises', 'practical', 1, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q015_b', 'q015', 'Craft a surprise box with clues inside', 'creative', 2, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q015_c', 'q015', 'Write a poem about your favorite memory together', 'verbal', 3, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q015_d', 'q015', 'Plan a mini party with their two best friends', 'social', 4, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.questions (id, quiz_id, body, order_index, difficulty_level, aptitude_tag) VALUES ('q016', 'quiz_001', 'Your sports team is losing every game. What helps?', 16, 0.5, NULL) ON CONFLICT (id) DO UPDATE SET body = EXCLUDED.body, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q016_a', 'q016', 'Track small improvements like passes completed', 'scientific', 1, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q016_b', 'q016', 'Design a new cheer that lifts the bench', 'creative', 2, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q016_c', 'q016', 'Give a pep talk that names one bright moment each game', 'verbal', 3, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q016_d', 'q016', 'Organize a snack rotation so everyone feels included', 'social', 4, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.questions (id, quiz_id, body, order_index, difficulty_level, aptitude_tag) VALUES ('q017', 'quiz_001', 'The kitchen invites you to cook. What role fits you?', 17, 0.5, NULL) ON CONFLICT (id) DO UPDATE SET body = EXCLUDED.body, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q017_a', 'q017', 'Read the recipe twice and set up ingredients in order', 'logical', 1, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q017_b', 'q017', 'Plate the food like a tiny restaurant chef', 'practical', 2, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q017_c', 'q017', 'Tell the story of each ingredient while you stir', 'verbal', 3, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q017_d', 'q017', 'Assign everyone a job so the table feels fair', 'social', 4, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.questions (id, quiz_id, body, order_index, difficulty_level, aptitude_tag) VALUES ('q018', 'quiz_001', 'A museum trip is tomorrow. What are you excited to do?', 18, 0.5, NULL) ON CONFLICT (id) DO UPDATE SET body = EXCLUDED.body, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q018_a', 'q018', 'Map the exhibits you want in time order', 'logical', 1, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q018_b', 'q018', 'Sketch inventions inspired by what you see', 'creative', 2, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q018_c', 'q018', 'Prepare three questions for a guide or parent', 'verbal', 3, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q018_d', 'q018', 'Pair up so nobody wanders past cool rooms alone', 'social', 4, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.questions (id, quiz_id, body, order_index, difficulty_level, aptitude_tag) VALUES ('q019', 'quiz_001', 'You spot an injured bird in the yard. What is your first move?', 19, 0.5, NULL) ON CONFLICT (id) DO UPDATE SET body = EXCLUDED.body, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q019_a', 'q019', 'Figure out a quiet warm box setup with air holes', 'scientific', 1, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q019_b', 'q019', 'Draw the bird to remember its colors for later', 'creative', 2, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q019_c', 'q019', 'Call a rescue line and describe what you see', 'verbal', 3, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q019_d', 'q019', 'Stay nearby so other kids do not crowd it', 'social', 4, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.questions (id, quiz_id, body, order_index, difficulty_level, aptitude_tag) VALUES ('q020', 'quiz_001', 'Bedtime hits but your puzzle is half done. What do you choose?', 20, 0.5, NULL) ON CONFLICT (id) DO UPDATE SET body = EXCLUDED.body, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q020_a', 'q020', 'Plan which corner you will finish tomorrow', 'logical', 1, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q020_b', 'q020', 'Turn the pieces into a bedtime story scene', 'creative', 2, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q020_c', 'q020', 'Whisper a summary of the picture it will become', 'verbal', 3, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('opt_q020_d', 'q020', 'Ask a grown-up to save your spot with a note', 'social', 4, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;

INSERT INTO public.quiz_sessions (id, quiz_id, user_id, started_at, completed_at, status, top_aptitude, scores_json, metadata_json)
VALUES (
  'sess_001',
  'quiz_001',
  'usr_child_001',
  '2026-01-10T15:00:00Z',
  '2026-01-10T15:22:00Z',
  'completed',
  'creative',
  '{"logical":0,"creative":83.33,"verbal":16.67,"social":0,"scientific":0,"practical":0}'::jsonb,
  '{"ai_provider":"seed","profile":"Creative-Verbal","explanation":"Alex leaned into imaginative choices in this practice run.","top_strength":"Creative"}'::jsonb
),
(
  'sess_002',
  'quiz_001',
  'usr_child_001',
  '2026-02-14T10:05:00Z',
  '2026-02-14T10:28:00Z',
  'completed',
  'logical',
  '{"logical":100,"creative":0,"verbal":0,"social":0,"scientific":0,"practical":0}'::jsonb,
  '{"ai_provider":"seed","profile":"Logical-Scientific","explanation":"Alex shifted toward structured problem solving this month.","top_strength":"Logical"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  quiz_id = EXCLUDED.quiz_id,
  user_id = EXCLUDED.user_id,
  started_at = EXCLUDED.started_at,
  completed_at = EXCLUDED.completed_at,
  status = EXCLUDED.status,
  top_aptitude = EXCLUDED.top_aptitude,
  scores_json = EXCLUDED.scores_json,
  metadata_json = EXCLUDED.metadata_json;

INSERT INTO public.quiz_answers (id, session_id, question_id, question_option_id, aptitude_type, response_time_ms, skipped, answered_at) VALUES
  ('ans_s1_01','sess_001','q001','opt_q001_b','creative',12400,false,'2026-01-10T15:02:00Z'),
  ('ans_s1_02','sess_001','q002','opt_q002_c','verbal',8300,false,'2026-01-10T15:04:00Z'),
  ('ans_s1_03','sess_001','q003','opt_q003_b','creative',15600,false,'2026-01-10T15:06:00Z'),
  ('ans_s1_04','sess_001','q005','opt_q005_b','creative',22100,false,'2026-01-10T15:08:00Z'),
  ('ans_s1_05','sess_001','q006','opt_q006_b','creative',9100,false,'2026-01-10T15:10:00Z'),
  ('ans_s1_06','sess_001','q007','opt_q007_b','creative',30500,false,'2026-01-10T15:12:00Z'),
  ('ans_s2_01','sess_002','q001','opt_q001_a','logical',4200,false,'2026-02-14T10:07:00Z'),
  ('ans_s2_02','sess_002','q003','opt_q003_a','logical',11800,false,'2026-02-14T10:09:00Z'),
  ('ans_s2_03','sess_002','q005','opt_q005_a','logical',17600,false,'2026-02-14T10:11:00Z'),
  ('ans_s2_04','sess_002','q006','opt_q006_a','logical',9400,false,'2026-02-14T10:13:00Z'),
  ('ans_s2_05','sess_002','q009','opt_q009_a','logical',33400,false,'2026-02-14T10:15:00Z'),
  ('ans_s2_06','sess_002','q011','opt_q011_a','logical',23900,false,'2026-02-14T10:17:00Z')
ON CONFLICT (id) DO UPDATE SET
  session_id = EXCLUDED.session_id,
  question_id = EXCLUDED.question_id,
  question_option_id = EXCLUDED.question_option_id,
  aptitude_type = EXCLUDED.aptitude_type,
  response_time_ms = EXCLUDED.response_time_ms,
  skipped = EXCLUDED.skipped,
  answered_at = EXCLUDED.answered_at;
