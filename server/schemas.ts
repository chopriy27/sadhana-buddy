import { z } from "zod";

// Validation schemas for API requests
export const insertSadhanaEntrySchema = z.object({
  userId: z.string(),
  date: z.string(),
  chantingRounds: z.number().default(0),
  readingPrabhupada: z.boolean().default(false),
  bookTitle: z.string().nullable().optional(),
  pagesRead: z.number().default(0),
  hearingLectures: z.number().default(0),
});

export const insertJournalEntrySchema = z.object({
  userId: z.string(),
  title: z.string(),
  content: z.string(),
  mood: z.string().nullable().optional(),
});

export const insertUserChallengeSchema = z.object({
  userId: z.string(),
  challengeId: z.number(),
  progress: z.number().default(0),
  completed: z.boolean().default(false),
});

export const insertFavoriteSongSchema = z.object({
  userId: z.string(),
  songId: z.number(),
});

export const insertUserGoalsSchema = z.object({
  userId: z.string(),
  dailyChantingRounds: z.number().default(16),
  dailyReadingPages: z.number().default(5),
  dailyHearingLectures: z.number().default(1),
  isOnboardingComplete: z.boolean().default(false),
});

