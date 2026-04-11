-- Two neuroaffirming quizzes: ADHD- and autism-themed strengths scenarios (aptitude mapping unchanged).

INSERT INTO public.quizzes (id, slug, title, description, created_by_user_id, default_difficulty, time_per_question_seconds, is_published, updated_at)
VALUES
  (
    'quiz_007',
    'adhd-spark-strengths',
    'Your ADHD Spark',
    'Scenarios about energy, ideas, and focus—no wrong answers. Celebrate how your brain works.',
    NULL,
    3,
    60,
    true,
    now()
  ),
  (
    'quiz_008',
    'autistic-strengths-shine',
    'Autistic Strengths Shine',
    'Scenarios about patterns, passions, honesty, and your style—no wrong answers. Kid-friendly and respectful.',
    NULL,
    3,
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
  default_difficulty = EXCLUDED.default_difficulty,
  updated_at = EXCLUDED.updated_at;

-- quiz_007: ADHD strengths (difficulty 1..5)
INSERT INTO public.questions (id, quiz_id, body, order_index, difficulty_level, aptitude_tag) VALUES ('qz7_01', 'quiz_007', 'You get a big burst of energy right before homework time. What helps you most?', 1, 1, NULL) ON CONFLICT (id) DO UPDATE SET body = EXCLUDED.body, order_index = EXCLUDED.order_index, difficulty_level = EXCLUDED.difficulty_level, quiz_id = EXCLUDED.quiz_id;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('oz7_01a', 'qz7_01', 'Do ten jumping jacks then tackle the easiest task first', 'practical', 1, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('oz7_01b', 'qz7_01', 'Turn the worksheet into a timed game with silly sound effects', 'creative', 2, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('oz7_01c', 'qz7_01', 'Explain the plan out loud to a stuffed animal coach', 'verbal', 3, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('oz7_01d', 'qz7_01', 'Race a sibling to see who finishes one page first', 'social', 4, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;

INSERT INTO public.questions (id, quiz_id, body, order_index, difficulty_level, aptitude_tag) VALUES ('qz7_02', 'quiz_007', 'Your brain offers three awesome ideas at the same time. What do you do?', 2, 2, NULL) ON CONFLICT (id) DO UPDATE SET body = EXCLUDED.body, order_index = EXCLUDED.order_index, difficulty_level = EXCLUDED.difficulty_level, quiz_id = EXCLUDED.quiz_id;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('oz7_02a', 'qz7_02', 'Number them and pick the one you can finish today', 'logical', 1, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('oz7_02b', 'qz7_02', 'Mash two ideas into one wild invention', 'creative', 2, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('oz7_02c', 'qz7_02', 'Record a voice memo so none of them escape', 'verbal', 3, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('oz7_02d', 'qz7_02', 'Text a friend which idea sounds coolest', 'social', 4, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;

INSERT INTO public.questions (id, quiz_id, body, order_index, difficulty_level, aptitude_tag) VALUES ('qz7_03', 'quiz_007', 'A long assembly means sitting quietly for a while. Your go-to move?', 3, 3, NULL) ON CONFLICT (id) DO UPDATE SET body = EXCLUDED.body, order_index = EXCLUDED.order_index, difficulty_level = EXCLUDED.difficulty_level, quiz_id = EXCLUDED.quiz_id;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('oz7_03a', 'qz7_03', 'Count ceiling tiles in a pattern to stay grounded', 'logical', 1, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('oz7_03b', 'qz7_03', 'Doodle a tiny comic in the margin', 'creative', 2, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('oz7_03c', 'qz7_03', 'Silently mouth the words to a song in your head', 'verbal', 3, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('oz7_03d', 'qz7_03', 'Press feet firmly on the floor and flex calves under the chair', 'practical', 4, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;

INSERT INTO public.questions (id, quiz_id, body, order_index, difficulty_level, aptitude_tag) VALUES ('qz7_04', 'quiz_007', 'You hyperfocus on something you love and lose track of time. How do you feel about that superpower?', 4, 4, NULL) ON CONFLICT (id) DO UPDATE SET body = EXCLUDED.body, order_index = EXCLUDED.order_index, difficulty_level = EXCLUDED.difficulty_level, quiz_id = EXCLUDED.quiz_id;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('oz7_04a', 'qz7_04', 'Proud—I can go deeper than most people on topics I care about', 'scientific', 1, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('oz7_04b', 'qz7_04', 'Curious—I want alarms or buddies to help me pop out when needed', 'creative', 2, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('oz7_04c', 'qz7_04', 'Mixed—I will explain it to grown-ups so they get it', 'verbal', 3, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('oz7_04d', 'qz7_04', 'Hopeful—I share the fun with someone who gets excited too', 'social', 4, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;

INSERT INTO public.questions (id, quiz_id, body, order_index, difficulty_level, aptitude_tag) VALUES ('qz7_05', 'quiz_007', 'Class needs thirty quiet minutes of independent work. Which strategy fits you?', 5, 5, NULL) ON CONFLICT (id) DO UPDATE SET body = EXCLUDED.body, order_index = EXCLUDED.order_index, difficulty_level = EXCLUDED.difficulty_level, quiz_id = EXCLUDED.quiz_id;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('oz7_05a', 'qz7_05', 'Break the work into micro-checkboxes on a sticky note', 'logical', 1, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('oz7_05b', 'qz7_05', 'Use headphones with focus music if allowed', 'practical', 2, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('oz7_05c', 'qz7_05', 'Ask to pace at the back after finishing a chunk', 'verbal', 3, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('oz7_05d', 'qz7_05', 'Partner-check every ten minutes for quick high-fives', 'social', 4, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;

-- quiz_008: Autistic strengths (difficulty 1..5)
INSERT INTO public.questions (id, quiz_id, body, order_index, difficulty_level, aptitude_tag) VALUES ('qz8_01', 'quiz_008', 'You spot a pattern almost nobody else notices (tiles, sounds, or a schedule). What do you do?', 1, 1, NULL) ON CONFLICT (id) DO UPDATE SET body = EXCLUDED.body, order_index = EXCLUDED.order_index, difficulty_level = EXCLUDED.difficulty_level, quiz_id = EXCLUDED.quiz_id;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('oz8_01a', 'qz8_01', 'Point it out with a diagram or counts so others can see it too', 'scientific', 1, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('oz8_01b', 'qz8_01', 'Turn the pattern into art or a rhythm', 'creative', 2, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('oz8_01c', 'qz8_01', 'Describe it clearly to a friend in one sentence', 'verbal', 3, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('oz8_01d', 'qz8_01', 'Enjoy it privately—it feels satisfying to you', 'creative', 4, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;

INSERT INTO public.questions (id, quiz_id, body, order_index, difficulty_level, aptitude_tag) VALUES ('qz8_02', 'quiz_008', 'A loud surprise drill or bell hits. What helps you reset the fastest?', 2, 2, NULL) ON CONFLICT (id) DO UPDATE SET body = EXCLUDED.body, order_index = EXCLUDED.order_index, difficulty_level = EXCLUDED.difficulty_level, quiz_id = EXCLUDED.quiz_id;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('oz8_02a', 'qz8_02', 'Use a known routine: water, wall push, three slow breaths', 'practical', 1, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('oz8_02b', 'qz8_02', 'Picture your favorite calm place in detail', 'creative', 2, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('oz8_02c', 'qz8_02', 'Whisper a rehearsed phrase that means “I am safe now”', 'verbal', 3, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('oz8_02d', 'qz8_02', 'Signal a trusted adult or friend you are okay but need space', 'social', 4, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;

INSERT INTO public.questions (id, quiz_id, body, order_index, difficulty_level, aptitude_tag) VALUES ('qz8_03', 'quiz_008', 'Plans change at the last minute. What works for you?', 3, 3, NULL) ON CONFLICT (id) DO UPDATE SET body = EXCLUDED.body, order_index = EXCLUDED.order_index, difficulty_level = EXCLUDED.difficulty_level, quiz_id = EXCLUDED.quiz_id;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('oz8_03a', 'qz8_03', 'Ask for the new plan written down or step-by-step', 'logical', 1, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('oz8_03b', 'qz8_03', 'Reframe it as a side quest with a funny name', 'creative', 2, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('oz8_03c', 'qz8_03', 'Say what you need: time, quiet, or one clear reason', 'verbal', 3, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('oz8_03d', 'qz8_03', 'Stick with a buddy who can preview changes with you', 'social', 4, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;

INSERT INTO public.questions (id, quiz_id, body, order_index, difficulty_level, aptitude_tag) VALUES ('qz8_04', 'quiz_008', 'You have a deep special interest you could explore for hours. How do you like to share it?', 4, 4, NULL) ON CONFLICT (id) DO UPDATE SET body = EXCLUDED.body, order_index = EXCLUDED.order_index, difficulty_level = EXCLUDED.difficulty_level, quiz_id = EXCLUDED.quiz_id;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('oz8_04a', 'qz8_04', 'Make a fact sheet or mini museum table for show-and-tell', 'scientific', 1, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('oz8_04b', 'qz8_04', 'Build a model, costume, or playlist about it', 'creative', 2, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('oz8_04c', 'qz8_04', 'Offer “three cool things” so listeners get a sampler', 'verbal', 3, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('oz8_04d', 'qz8_04', 'Find the one friend who wants to geek out together', 'social', 4, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;

INSERT INTO public.questions (id, quiz_id, body, order_index, difficulty_level, aptitude_tag) VALUES ('qz8_05', 'quiz_008', 'Small talk feels fuzzy but facts and honesty feel great. In a group project you shine by…', 5, 5, NULL) ON CONFLICT (id) DO UPDATE SET body = EXCLUDED.body, order_index = EXCLUDED.order_index, difficulty_level = EXCLUDED.difficulty_level, quiz_id = EXCLUDED.quiz_id;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('oz8_05a', 'qz8_05', 'Keeping the timeline, links, and file names perfectly organized', 'logical', 1, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('oz8_05b', 'qz8_05', 'Building the prop or slide deck that makes the idea pop', 'practical', 2, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('oz8_05c', 'qz8_05', 'Saying plainly what is done and what is still needed', 'verbal', 3, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct) VALUES ('oz8_05d', 'qz8_05', 'Making sure everyone’s idea gets on the list', 'social', 4, NULL) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, aptitude_type = EXCLUDED.aptitude_type, order_index = EXCLUDED.order_index;
