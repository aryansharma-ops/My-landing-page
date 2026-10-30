-- Meridian Press seed catalogue.
-- All titles are working concepts: status 'in_development', no price, no
-- checkout URLs. Update rows (price_cents, gumroad_url, status='available',
-- amazon_*) to publish a title for sale.
insert into products (
  slug, title, subtitle, description, intended_reader, category, format,
  status, price_cents, currency, cover_image, featured_order
) values
(
  'the-psychology-of-power',
  'The Psychology of Power',
  'Understanding influence, status, and human behavior',
  'A working concept for a practical study of how power actually operates in everyday life — in meetings, negotiations, friendships, and families. Planned chapters cover status signals, persuasion, group dynamics, and how to hold your ground without becoming the person you set out to avoid.',
  'Readers who want to understand influence and status games clearly — at work and in life — without resorting to manipulation themselves.',
  'psychology', 'ebook', 'in_development', null, 'USD',
  '/images/covers/psychology-of-power.jpg', 1
),
(
  'how-to-recognize-manipulation',
  'How to Recognize Manipulation',
  'A clear-eyed guide to influence and control',
  'A planned field guide to the patterns behind manipulative behaviour — framing, guilt-tripping, gaslighting, love-bombing, and manufactured urgency — and calm, practical responses for each. The outline favours recognition over retaliation.',
  'Anyone who has walked away from a conversation feeling pressured or confused, and wants vocabulary, patterns, and responses that hold up in real life.',
  'psychology', 'ebook', 'in_development', null, 'USD',
  '/images/covers/recognize-manipulation.jpg', 2
),
(
  'the-art-of-strategic-thinking',
  'The Art of Strategic Thinking',
  'Seeing further, deciding better',
  'A concept for a concise playbook on thinking several moves ahead: mapping incentives, recognising second-order effects, positioning before acting, and knowing when not to play. Designed as short chapters with decision frameworks you can reuse.',
  'Professionals, founders, and ambitious readers who make recurring decisions under uncertainty and want a calmer, more structured way to make them.',
  'strategy', 'ebook', 'in_development', null, 'USD',
  '/images/covers/art-of-strategic-thinking.jpg', 3
),
(
  'the-habit-tracker',
  'The Habit Tracker',
  'A workbook for consistency that lasts',
  'A planned print-and-write workbook built around a simple idea: what gets measured honestly gets repeated. Monthly tracking grids, weekly review prompts, and short evidence-based readings on why habits stall — and how to restart them without drama.',
  'Readers who have started routines many times and want a physical, low-friction system for keeping them visible and reviewable.',
  'habits', 'workbook', 'in_development', null, 'USD',
  '/images/covers/habit-tracker.jpg', 4
),
(
  'the-art-of-self-discipline',
  'The Art of Self-Discipline',
  'Quiet systems for a deliberate life',
  'A concept for a short, unsentimental book on discipline as design rather than willpower: managing friction, energy, and environment so that the right action is the easy one. Planned as a compact read with end-of-chapter exercises.',
  'Readers suspicious of hustle culture who still want a reliable way to follow through on what matters to them.',
  'habits', 'ebook', 'in_development', null, 'USD',
  '/images/covers/art-of-self-discipline.jpg', 5
)
on conflict (slug) do nothing;
