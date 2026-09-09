-- D1 seed script — populates Cloudflare D1 with the same cinematic starter
-- content that scripts/seed.ts loads into local SQLite.
--
-- Apply to local D1 simulator:
--   npx wrangler d1 execute baby-seven-db --local --file=prisma/migrations-d1/0002_seed.sql
--
-- Apply to remote D1 (production):
--   npx wrangler d1 execute baby-seven-db --remote --file=prisma/migrations-d1/0002_seed.sql
--
-- All ids use cuid-style strings generated at seed time. For D1 we use
-- LOWER(HEX(RANDOMBLOB(25))) as a quick unique-id stand-in — the Prisma
-- client will generate proper cuids at runtime when the app writes data.

-- Projects -----------------------------------------------------------------
INSERT INTO "Project" ("id", "title", "category", "description", "coverImage", "videoUrl", "isFeatured", "rank") VALUES
  (LOWER(HEX(RANDOMBLOB(25))), 'Blood Disaster', 'Writing', 'The #1 ranked dystopian thriller novel. A story of collapse, blood, and the price of survival in a city that forgot how to love.', 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=1200&q=80&auto=format&fit=crop', NULL, 1, 1),
  (LOWER(HEX(RANDOMBLOB(25))), 'Neon Requiem', 'Writing', 'A neon-soaked noir novella about a composer who hears the future in the city''s hum.', 'https://images.unsplash.com/photo-1518972559570-7cc1309f3229?w=1200&q=80&auto=format&fit=crop', NULL, 1, NULL),
  (LOWER(HEX(RANDOMBLOB(25))), 'Echoes of Tomorrow — Director''s Cut', 'Video', 'A 14-minute cinematic short exploring memory, loss, and the ghosts we carry forward. Shot on ARRI Alexa Mini.', 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&q=80&auto=format&fit=crop', 'https://vimeo.com/babyseven/echoes-of-tomorrow', 1, NULL),
  (LOWER(HEX(RANDOMBLOB(25))), 'Velvet Static — Music Video', 'Video', 'Award-winning music video for artist Lumen Vex. 4M+ views. Reels cut, color grade, and directorial concept by Baby Seven.', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80&auto=format&fit=crop', 'https://youtube.com/watch?v=demo', 0, NULL),
  (LOWER(HEX(RANDOMBLOB(25))), 'The Last Broadcast — Feature Script', 'Script', 'Original screenplay. A late-night radio host begins receiving calls from a future that hasn''t happened yet. 117 pages.', 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&q=80&auto=format&fit=crop', NULL, 1, NULL),
  (LOWER(HEX(RANDOMBLOB(25))), 'Glasshouse — Pilot Teleplay', 'Script', 'Pilot episode for a limited series. A botanist in a sealed greenhouse discovers the plants are keeping a record of every visitor.', 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=1200&q=80&auto=format&fit=crop', NULL, 0, NULL),
  (LOWER(HEX(RANDOMBLOB(25))), 'Ink & Embers — Essay Collection', 'Writing', 'A collection of essays on craft, creativity, and the discipline of showing up to the page every single morning.', 'https://images.unsplash.com/photo-1455390582262-43129a8e6f6b?w=1200&q=80&auto=format&fit=crop', NULL, 0, NULL),
  (LOWER(HEX(RANDOMBLOB(25))), 'Midnight Frame — Reels Series', 'Video', 'A 12-part Instagram Reels series. Each 60-second film captures one city at one exact minute past midnight.', 'https://images.unsplash.com/photo-1492691527719-9d1e27e1401a?w=1200&q=80&auto=format&fit=crop', NULL, 0, NULL);

-- Testimonials -------------------------------------------------------------
INSERT INTO "Testimonial" ("id", "clientName", "text", "rating", "projectType") VALUES
  (LOWER(HEX(RANDOMBLOB(25))), 'Marcus Linde, Producer at Halcyon Studios', 'Baby Seven delivered a script that didn''t just meet the brief — it redefined the brief. The "Last Broadcast" screenplay is the best first draft I''ve read in a decade.', 5, 'Script'),
  (LOWER(HEX(RANDOMBLOB(25))), 'Lumen Vex, Recording Artist', 'The "Velvet Static" video doubled my streaming numbers in a week. The visual storytelling was completely next-level.', 5, 'Video'),
  (LOWER(HEX(RANDOMBLOB(25))), 'Aria Sato, Editor-in-Chief, Nightwave Press', 'Blood Disaster is a once-in-a-generation debut. The prose cuts like glass and leaves a mark you''ll feel for days.', 5, 'Writing'),
  (LOWER(HEX(RANDOMBLOB(25))), 'Dev Patel, Indie Filmmaker', 'Worked with Baby Seven on three reels campaigns. Always cinematic, always on time, always surprising. Hire before the rate goes up.', 5, 'Video');

-- Reel Editors -------------------------------------------------------------
INSERT INTO "ReelEditor" ("id", "fullName", "email", "portfolioLink", "editingStyle", "sampleReelUrl", "status") VALUES
  (LOWER(HEX(RANDOMBLOB(25))), 'Theo Marchetti', 'theo@marchetti.studio', 'https://instagram.com/theo.cuts', 'Cinematic', 'https://instagram.com/reel/Cxyz123', 'Shortlisted'),
  (LOWER(HEX(RANDOMBLOB(25))), 'Priya Nair', 'priya@nairframes.com', 'https://youtube.com/@priyacuts', 'Fast-Paced', 'https://youtube.com/shorts/abcd456', 'Pending'),
  (LOWER(HEX(RANDOMBLOB(25))), 'Jordan Blake', 'jordan@blakefilm.co', 'https://vimeo.com/jordanblake', 'Story-driven', 'https://vimeo.com/789012', 'Hired'),
  (LOWER(HEX(RANDOMBLOB(25))), 'Sasha Okonkwo', 'sasha@viralframe.io', 'https://tiktok.com/@sashaframes', 'Viral/Hook', 'https://tiktok.com/@sashaframes/video/712345', 'Pending'),
  (LOWER(HEX(RANDOMBLOB(25))), 'Lena Park', 'lena@parkreels.studio', 'https://instagram.com/lena.cuts', 'Cinematic', 'https://instagram.com/reel/Cabc890', 'Pending');

-- Page Views (initial counts) ---------------------------------------------
INSERT INTO "PageView" ("id", "route", "count") VALUES
  (LOWER(HEX(RANDOMBLOB(25))), '/', 500),
  (LOWER(HEX(RANDOMBLOB(25))), '/portfolio', 350),
  (LOWER(HEX(RANDOMBLOB(25))), '/collaborate', 900),
  (LOWER(HEX(RANDOMBLOB(25))), '/support', 200);
