import { z } from "zod";

export const IMPROVEMENT_AREAS = [
  "understanding_human_behaviour",
  "strategic_thinking",
  "confidence",
  "communication",
  "habits_and_discipline",
  "productivity",
  "personal_growth",
  "other",
] as const;

export const BOOK_FORMATS = [
  "short_practical_guide",
  "detailed_ebook",
  "printed_paperback",
  "hardcover",
  "workbook_with_exercises",
  "guided_journal_or_planner",
] as const;

export const LEARNING_STYLES = [
  "reading",
  "step_by_step_exercises",
  "real_world_examples",
  "checklists_and_worksheets",
  "combination",
] as const;

export const PRICE_RANGES = [
  "under_5",
  "5_to_999",
  "10_to_1999",
  "20_or_more",
  "not_sure",
] as const;

export const COUNTRIES = [
  "united_states",
  "canada",
  "united_kingdom",
  "australia",
  "germany",
  "france",
  "other",
] as const;

const optionalEmail = z
  .string()
  .trim()
  .max(320)
  .transform((v) => (v === "" ? null : v))
  .pipe(z.union([z.literal(null), z.string().email("Please enter a valid email address.")]));

export const surveySchema = z
  .object({
    improvementArea: z.enum(IMPROVEMENT_AREAS),
    improvementOther: z.string().trim().max(240).optional().nullable(),
    biggestChallenge: z
      .string()
      .trim()
      .min(3, "Please describe your challenge in a few words.")
      .max(600),
    preferredFormat: z.enum(BOOK_FORMATS),
    learningStyle: z.enum(LEARNING_STYLES),
    priceRange: z.enum(PRICE_RANGES),
    country: z.enum(COUNTRIES),
    email: optionalEmail.optional(),
    marketingConsent: z.boolean().optional().default(false),
    sessionId: z.string().max(80).optional().nullable(),
    // Honeypot — must stay empty.
    website: z.string().max(400).optional(),
  })
  .refine((v) => v.improvementArea !== "other" || (v.improvementOther && v.improvementOther.length > 1), {
    message: "Please briefly describe your focus area.",
    path: ["improvementOther"],
  });

export const subscribeSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address.").max(320),
  firstName: z.string().trim().max(80).optional().nullable(),
  consent: z.literal(true, { message: "Please confirm you'd like to receive emails." }),
  sessionId: z.string().max(80).optional().nullable(),
  website: z.string().max(400).optional(),
});

export const guideSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address.").max(320),
  firstName: z.string().trim().max(80).optional().nullable(),
  marketingConsent: z.boolean().optional().default(false),
  sessionId: z.string().max(80).optional().nullable(),
  website: z.string().max(400).optional(),
});

export type SurveyInput = z.infer<typeof surveySchema>;
export type SubscribeInput = z.infer<typeof subscribeSchema>;
export type GuideInput = z.infer<typeof guideSchema>;
