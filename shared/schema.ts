import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sadhanaEntries = pgTable("sadhana_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  chantingRounds: integer("chanting_rounds").default(0),
  chantingTarget: integer("chanting_target").default(16),
  reading: boolean("reading").default(false),
  mangalaArati: boolean("mangala_arati").default(false),
  eveningProgram: boolean("evening_program").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  mood: text("mood"), // grateful, reflective, inspired, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const devotionalSongs = pgTable("devotional_songs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  category: text("category").notNull(), // bhajan, kirtan, prayer
  mood: text("mood").notNull(), // devotional, meditative, joyful, etc.
  lyrics: text("lyrics"),
  audioUrl: text("audio_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const lectures = pgTable("lectures", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  speaker: text("speaker").notNull(),
  topic: text("topic").notNull(),
  duration: integer("duration"), // in minutes
  videoUrl: text("video_url"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const festivals = pgTable("festivals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  description: text("description"),
  significance: text("significance"),
  observances: text("observances").array(),
});

export const dailyVerses = pgTable("daily_verses", {
  id: serial("id").primaryKey(),
  verse: text("verse").notNull(),
  translation: text("translation").notNull(),
  source: text("source").notNull(), // e.g., "Bhagavad Gita 2.70"
  date: text("date").notNull(), // YYYY-MM-DD format
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  booksRead: text("books_read").array().default([]),
  lecturesHeard: integer("lectures_heard").array().default([]),
  totalChantingRounds: integer("total_chanting_rounds").default(0),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // chanting, reading, attendance
  target: integer("target").notNull(),
  duration: integer("duration").notNull(), // in days
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  isActive: boolean("is_active").default(true),
});

export const userChallenges = pgTable("user_challenges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  challengeId: integer("challenge_id").notNull(),
  progress: integer("progress").default(0),
  completed: boolean("completed").default(false),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertSadhanaEntrySchema = createInsertSchema(sadhanaEntries).omit({
  id: true,
  createdAt: true,
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({
  id: true,
  createdAt: true,
});

export const insertDevotionalSongSchema = createInsertSchema(devotionalSongs).omit({
  id: true,
  createdAt: true,
});

export const insertLectureSchema = createInsertSchema(lectures).omit({
  id: true,
  createdAt: true,
});

export const insertFestivalSchema = createInsertSchema(festivals).omit({
  id: true,
});

export const insertDailyVerseSchema = createInsertSchema(dailyVerses).omit({
  id: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  updatedAt: true,
});

export const insertChallengeSchema = createInsertSchema(challenges).omit({
  id: true,
});

export const insertUserChallengeSchema = createInsertSchema(userChallenges).omit({
  id: true,
  joinedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type SadhanaEntry = typeof sadhanaEntries.$inferSelect;
export type InsertSadhanaEntry = z.infer<typeof insertSadhanaEntrySchema>;

export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;

export type DevotionalSong = typeof devotionalSongs.$inferSelect;
export type InsertDevotionalSong = z.infer<typeof insertDevotionalSongSchema>;

export type Lecture = typeof lectures.$inferSelect;
export type InsertLecture = z.infer<typeof insertLectureSchema>;

export type Festival = typeof festivals.$inferSelect;
export type InsertFestival = z.infer<typeof insertFestivalSchema>;

export type DailyVerse = typeof dailyVerses.$inferSelect;
export type InsertDailyVerse = z.infer<typeof insertDailyVerseSchema>;

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;

export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;

export type UserChallenge = typeof userChallenges.$inferSelect;
export type InsertUserChallenge = z.infer<typeof insertUserChallengeSchema>;
