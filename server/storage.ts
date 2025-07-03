import {
  type User,
  type InsertUser,
  type SadhanaEntry,
  type InsertSadhanaEntry,
  type JournalEntry,
  type InsertJournalEntry,
  type DevotionalSong,
  type InsertDevotionalSong,
  type Lecture,
  type InsertLecture,
  type Festival,
  type InsertFestival,
  type DailyVerse,
  type InsertDailyVerse,
  type UserProgress,
  type InsertUserProgress,
  type Challenge,
  type InsertChallenge,
  type UserChallenge,
  type InsertUserChallenge,
  type FavoriteSong,
  type InsertFavoriteSong,
  type UserGoals,
  type InsertUserGoals,
  type UpsertUser,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";
import * as schema from "@shared/schema";
import { parseVaishnavCalendar, convertToFestivals } from "./calendarParser";
import { parseAuthenticCalendar, convertToAuthenticFestivals } from "./authentnicCalendarParser";
import { parseVaishnavSongBook, convertToDevotionalSongs, knownVaishnavSongs } from "./songParser";
import { readFileSync } from "fs";
import { join } from "path";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfilePicture(id: string, profileImageUrl: string): Promise<User>;

  // Sadhana Entries
  getSadhanaEntry(userId: string, date: string): Promise<SadhanaEntry | undefined>;
  getSadhanaEntries(userId: string, limit?: number): Promise<SadhanaEntry[]>;
  createSadhanaEntry(entry: InsertSadhanaEntry): Promise<SadhanaEntry>;
  updateSadhanaEntry(id: number, entry: Partial<InsertSadhanaEntry>): Promise<SadhanaEntry | undefined>;

  // Journal Entries
  getJournalEntries(userId: string, limit?: number): Promise<JournalEntry[]>;
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  updateJournalEntry(id: number, entry: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined>;
  deleteJournalEntry(id: number): Promise<boolean>;

  // Devotional Songs
  getDevotionalSongs(category?: string, mood?: string): Promise<DevotionalSong[]>;
  searchDevotionalSongs(query: string): Promise<DevotionalSong[]>;
  createDevotionalSong(song: InsertDevotionalSong): Promise<DevotionalSong>;

  // Lectures
  getLectures(speaker?: string, topic?: string): Promise<Lecture[]>;
  searchLectures(query: string): Promise<Lecture[]>;
  createLecture(lecture: InsertLecture): Promise<Lecture>;

  // Festivals
  getFestivals(): Promise<Festival[]>;
  getUpcomingFestivals(limit?: number): Promise<Festival[]>;
  createFestival(festival: InsertFestival): Promise<Festival>;

  // Daily Verses
  getDailyVerse(date: string): Promise<DailyVerse | undefined>;
  getTodaysVerse(): Promise<DailyVerse | undefined>;
  createDailyVerse(verse: InsertDailyVerse): Promise<DailyVerse>;

  // User Progress
  getUserProgress(userId: string): Promise<UserProgress | undefined>;
  updateUserProgress(userId: string, progress: Partial<InsertUserProgress>): Promise<UserProgress>;

  // Challenges
  getChallenges(): Promise<Challenge[]>;
  getActiveUserChallenges(userId: string): Promise<(UserChallenge & { challenge: Challenge })[]>;
  joinChallenge(userChallenge: InsertUserChallenge): Promise<UserChallenge>;
  updateChallengeProgress(id: number, progress: number): Promise<UserChallenge | undefined>;

  // Favorite Songs
  getFavoriteSongs(userId: string): Promise<(FavoriteSong & { song: DevotionalSong })[]>;
  addFavoriteSong(favorite: InsertFavoriteSong): Promise<FavoriteSong>;
  removeFavoriteSong(userId: string, songId: number): Promise<boolean>;
  isSongFavorited(userId: string, songId: number): Promise<boolean>;

  // User Goals
  getUserGoals(userId: string): Promise<UserGoals | undefined>;
  createUserGoals(goals: InsertUserGoals): Promise<UserGoals>;
  updateUserGoals(userId: string, goals: Partial<InsertUserGoals>): Promise<UserGoals>;
}

export class DatabaseStorage implements IStorage {
  private devotionalSongsData: DevotionalSong[] = [];
  private lecturesData: Lecture[] = [];
  private festivalsData: Festival[] = [];
  private dailyVersesData: DailyVerse[] = [];
  private challengesData: Challenge[] = [];

  constructor() {
    this.seedData();
  }

  private seedData() {
    this.loadVaishnavCalendar();
    this.loadVaishnavSongs();
    this.seedDailyVerses();
    this.seedLectures();
    this.seedChallenges();
  }

  // Users - Database operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(schema.users)
      .values(userData)
      .onConflictDoUpdate({
        target: schema.users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserProfilePicture(id: string, profileImageUrl: string): Promise<User> {
    const [user] = await db
      .update(schema.users)
      .set({ 
        profileImageUrl,
        updatedAt: new Date() 
      })
      .where(eq(schema.users.id, id))
      .returning();
    return user;
  }

  // Sadhana Entries - Database operations
  async getSadhanaEntry(userId: string, date: string): Promise<SadhanaEntry | undefined> {
    const [entry] = await db
      .select()
      .from(schema.sadhanaEntries)
      .where(and(eq(schema.sadhanaEntries.userId, userId), eq(schema.sadhanaEntries.date, date)));
    return entry || undefined;
  }

  async getSadhanaEntries(userId: string, limit = 30): Promise<SadhanaEntry[]> {
    return await db
      .select()
      .from(schema.sadhanaEntries)
      .where(eq(schema.sadhanaEntries.userId, userId))
      .orderBy(desc(schema.sadhanaEntries.date))
      .limit(limit);
  }

  async createSadhanaEntry(insertEntry: InsertSadhanaEntry): Promise<SadhanaEntry> {
    const [entry] = await db
      .insert(schema.sadhanaEntries)
      .values(insertEntry)
      .returning();
    return entry;
  }

  async updateSadhanaEntry(id: number, updateData: Partial<InsertSadhanaEntry>): Promise<SadhanaEntry | undefined> {
    const [entry] = await db
      .update(schema.sadhanaEntries)
      .set(updateData)
      .where(eq(schema.sadhanaEntries.id, id))
      .returning();
    return entry || undefined;
  }

  // Journal Entries - Database operations
  async getJournalEntries(userId: string, limit = 20): Promise<JournalEntry[]> {
    return await db
      .select()
      .from(schema.journalEntries)
      .where(eq(schema.journalEntries.userId, userId))
      .orderBy(desc(schema.journalEntries.createdAt))
      .limit(limit);
  }

  async createJournalEntry(insertEntry: InsertJournalEntry): Promise<JournalEntry> {
    const [entry] = await db
      .insert(schema.journalEntries)
      .values(insertEntry)
      .returning();
    return entry;
  }

  async updateJournalEntry(id: number, updateData: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined> {
    const [entry] = await db
      .update(schema.journalEntries)
      .set(updateData)
      .where(eq(schema.journalEntries.id, id))
      .returning();
    return entry || undefined;
  }

  async deleteJournalEntry(id: number): Promise<boolean> {
    const result = await db
      .delete(schema.journalEntries)
      .where(eq(schema.journalEntries.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Devotional Songs - In-memory with seeded data
  async getDevotionalSongs(category?: string, mood?: string): Promise<DevotionalSong[]> {
    return this.devotionalSongsData.filter(song => {
      if (category && song.category !== category) return false;
      if (mood && song.mood !== mood) return false;
      return true;
    });
  }

  async searchDevotionalSongs(query: string): Promise<DevotionalSong[]> {
    const searchTerm = query.toLowerCase();
    return this.devotionalSongsData.filter(song =>
      song.title.toLowerCase().includes(searchTerm) ||
      song.author.toLowerCase().includes(searchTerm) ||
      (song.lyrics && song.lyrics.toLowerCase().includes(searchTerm))
    );
  }

  async createDevotionalSong(insertSong: InsertDevotionalSong): Promise<DevotionalSong> {
    const song: DevotionalSong = {
      ...insertSong,
      id: this.devotionalSongsData.length + 1,
      createdAt: new Date(),
      lyrics: insertSong.lyrics || null,
      audioUrl: insertSong.audioUrl || null,
    };
    this.devotionalSongsData.push(song);
    return song;
  }

  // Lectures - In-memory with seeded data
  async getLectures(speaker?: string, topic?: string): Promise<Lecture[]> {
    return this.lecturesData.filter(lecture => {
      if (speaker && !lecture.speaker.toLowerCase().includes(speaker.toLowerCase())) return false;
      if (topic && !lecture.topic.toLowerCase().includes(topic.toLowerCase())) return false;
      return true;
    });
  }

  async searchLectures(query: string): Promise<Lecture[]> {
    const searchTerm = query.toLowerCase();
    return this.lecturesData.filter(lecture =>
      lecture.title.toLowerCase().includes(searchTerm) ||
      lecture.speaker.toLowerCase().includes(searchTerm) ||
      lecture.topic.toLowerCase().includes(searchTerm)
    );
  }

  async createLecture(insertLecture: InsertLecture): Promise<Lecture> {
    const lecture: Lecture = { 
      ...insertLecture, 
      id: this.lecturesData.length + 1, 
      createdAt: new Date(),
      duration: insertLecture.duration || null,
      videoUrl: insertLecture.videoUrl || null,
      description: insertLecture.description || null,
    };
    this.lecturesData.push(lecture);
    return lecture;
  }

  // Festivals - In-memory with seeded data
  async getFestivals(): Promise<Festival[]> {
    return [...this.festivalsData];
  }

  async getUpcomingFestivals(limit = 5): Promise<Festival[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.festivalsData
      .filter(festival => festival.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, limit);
  }

  async createFestival(insertFestival: InsertFestival): Promise<Festival> {
    const festival: Festival = { 
      ...insertFestival, 
      id: this.festivalsData.length + 1,
      description: insertFestival.description || null,
      significance: insertFestival.significance || null,
      observances: insertFestival.observances || null,
    };
    this.festivalsData.push(festival);
    return festival;
  }

  // Daily Verses - In-memory with seeded data
  async getDailyVerse(date: string): Promise<DailyVerse | undefined> {
    return this.dailyVersesData.find(verse => verse.date === date);
  }

  async getTodaysVerse(): Promise<DailyVerse | undefined> {
    const today = new Date().toISOString().split('T')[0];
    return this.getDailyVerse(today);
  }

  async createDailyVerse(insertVerse: InsertDailyVerse): Promise<DailyVerse> {
    const verse: DailyVerse = { ...insertVerse, id: this.dailyVersesData.length + 1 };
    this.dailyVersesData.push(verse);
    return verse;
  }

  // User Progress - Database operations
  async getUserProgress(userId: string): Promise<UserProgress | undefined> {
    const [progress] = await db
      .select()
      .from(schema.userProgress)
      .where(eq(schema.userProgress.userId, userId));
    return progress || undefined;
  }

  async updateUserProgress(userId: string, updateData: Partial<InsertUserProgress>): Promise<UserProgress> {
    const existing = await this.getUserProgress(userId);
    if (existing) {
      const [progress] = await db
        .update(schema.userProgress)
        .set(updateData)
        .where(eq(schema.userProgress.userId, userId))
        .returning();
      return progress;
    } else {
      const newProgress = {
        userId,
        booksRead: [],
        lecturesHeard: [],
        totalChantingRounds: 0,
        currentStreak: 0,
        longestStreak: 0,
        ...updateData,
      };
      const [created] = await db
        .insert(schema.userProgress)
        .values(newProgress)
        .returning();
      return created;
    }
  }

  // Challenges - In-memory with seeded data
  async getChallenges(): Promise<Challenge[]> {
    return [...this.challengesData];
  }

  async getActiveUserChallenges(userId: string): Promise<(UserChallenge & { challenge: Challenge })[]> {
    const userChallenges = await db
      .select()
      .from(schema.userChallenges)
      .where(eq(schema.userChallenges.userId, userId));

    return userChallenges.map(uc => ({
      ...uc,
      challenge: this.challengesData.find(c => c.id === uc.challengeId)!
    }));
  }

  async joinChallenge(insertUserChallenge: InsertUserChallenge): Promise<UserChallenge> {
    const [userChallenge] = await db
      .insert(schema.userChallenges)
      .values(insertUserChallenge)
      .returning();
    return userChallenge;
  }

  async updateChallengeProgress(id: number, progress: number): Promise<UserChallenge | undefined> {
    const [userChallenge] = await db
      .update(schema.userChallenges)
      .set({ progress })
      .where(eq(schema.userChallenges.id, id))
      .returning();
    return userChallenge || undefined;
  }

  // Favorites - Database operations
  async getFavoriteSongs(userId: string): Promise<(FavoriteSong & { song: DevotionalSong })[]> {
    const favorites = await db
      .select()
      .from(schema.favoriteSongs)
      .where(eq(schema.favoriteSongs.userId, userId));

    return favorites.map(fav => ({
      ...fav,
      song: this.devotionalSongsData.find(song => song.id === fav.songId)!
    }));
  }

  async addFavoriteSong(insertFavoriteSong: InsertFavoriteSong): Promise<FavoriteSong> {
    const [favoriteSong] = await db
      .insert(schema.favoriteSongs)
      .values(insertFavoriteSong)
      .returning();
    return favoriteSong;
  }

  async removeFavoriteSong(userId: string, songId: number): Promise<boolean> {
    const result = await db
      .delete(schema.favoriteSongs)
      .where(and(
        eq(schema.favoriteSongs.userId, userId),
        eq(schema.favoriteSongs.songId, songId)
      ));
    return (result.rowCount || 0) > 0;
  }

  async isSongFavorited(userId: string, songId: number): Promise<boolean> {
    const [favorite] = await db
      .select()
      .from(schema.favoriteSongs)
      .where(and(
        eq(schema.favoriteSongs.userId, userId),
        eq(schema.favoriteSongs.songId, songId)
      ));
    return !!favorite;
  }

  // User Goals
  async getUserGoals(userId: string): Promise<UserGoals | undefined> {
    const [goals] = await db
      .select()
      .from(schema.userGoals)
      .where(eq(schema.userGoals.userId, userId));
    return goals;
  }

  async createUserGoals(insertGoals: InsertUserGoals): Promise<UserGoals> {
    const [goals] = await db
      .insert(schema.userGoals)
      .values(insertGoals)
      .returning();
    return goals;
  }

  async updateUserGoals(userId: string, updateData: Partial<InsertUserGoals>): Promise<UserGoals> {
    const [goals] = await db
      .update(schema.userGoals)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(schema.userGoals.userId, userId))
      .returning();
    return goals;
  }

  // Seed data methods
  private loadVaishnavCalendar(): void {
    try {
      console.log("Loading 131 authentic ISKCON festivals...");
      const calendarPath = join(process.cwd(), "attached_assets", "Pasted--January-02-Jan-2025-Disappearance-Day-of-Sri-Jiva-Goswami-02-Jan-2025-Disappearance-Day-of-S-1751383253600_1751383253601.txt");
      const calendarEvents = parseAuthenticCalendar(calendarPath);
      const festivals = convertToAuthenticFestivals(calendarEvents);
      
      festivals.forEach(festival => {
        const festivalWithId: Festival = {
          ...festival,
          id: this.festivalsData.length + 1,
        };
        this.festivalsData.push(festivalWithId);
      });
      
      console.log(`Successfully loaded ${this.festivalsData.length} authentic ISKCON festivals`);
    } catch (error) {
      console.error("Error loading calendar:", error);
    }
  }

  private loadVaishnavSongs(): void {
    try {
      console.log("Loading songs from Vaishnava song book...");
      console.log("Building comprehensive Vaishnava song database from known sources...");
      
      const songBookPath = join(process.cwd(), "attached_assets", "Vaishnava song book_1751340349202.pdf");
      const parsedSongs = parseVaishnavSongBook(songBookPath);
      console.log(`Parsed ${parsedSongs.length} songs from song book`);
      
      const allSongs = [...parsedSongs, ...knownVaishnavSongs];
      const devotionalSongs = convertToDevotionalSongs(allSongs);
      
      devotionalSongs.forEach(song => {
        const songWithId: DevotionalSong = {
          ...song,
          id: this.devotionalSongsData.length + 1,
          createdAt: new Date(),
        };
        this.devotionalSongsData.push(songWithId);
      });
      
      console.log(`Successfully loaded ${this.devotionalSongsData.length} devotional songs`);
    } catch (error) {
      console.error("Error loading songs:", error);
    }
  }

  private seedDailyVerses(): void {
    const verses = [
      {
        id: 1,
        date: "2025-01-01",
        verse: "One who is not disturbed by the incessant flow of desires that enter like rivers into the ocean, which is ever being filled but is always still, can alone achieve peace, and not the person who strives to satisfy such desires.",
        reference: "Bhagavad Gita 2.70",
        explanation: "True peace comes from detachment from material desires, not from trying to fulfill them all."
      }
    ];
    
    this.dailyVersesData.push(...verses);
  }

  private seedLectures(): void {
    const prabhupadaLectures = [
      {
        id: 1,
        title: "Bhagavad-gita 1.1 - London, July 11, 1973",
        speaker: "A.C. Bhaktivedanta Swami Prabhupada",
        topic: "Bhagavad Gita",
        duration: 2580,
        videoUrl: "https://www.youtube.com/@TheAcharya1",
        description: "Prabhupada's commentary on the opening verse of Bhagavad-gita at Bhaktivedanta Manor, London.",
        createdAt: new Date()
      },
      {
        id: 2,
        title: "Srimad-Bhagavatam 1.2.6 - Delhi, November 12, 1973",
        speaker: "A.C. Bhaktivedanta Swami Prabhupada", 
        topic: "Srimad Bhagavatam",
        duration: 3240,
        videoUrl: "https://www.youtube.com/@TheAcharya1",
        description: "Prabhupada explains the process of devotional service and transcendental knowledge.",
        createdAt: new Date()
      },
      {
        id: 3,
        title: "Sri Caitanya-caritamrta Adi 7.108 - San Francisco, February 18, 1967",
        speaker: "A.C. Bhaktivedanta Swami Prabhupada",
        topic: "Caitanya Caritamrta",
        duration: 2880,
        videoUrl: "https://www.youtube.com/@TheAcharya1",
        description: "The glories of Lord Caitanya's mercy and the chanting of the holy name.",
        createdAt: new Date()
      },
      {
        id: 4,
        title: "Bhagavad-gita 4.9 - New York, July 25, 1966",
        speaker: "A.C. Bhaktivedanta Swami Prabhupada",
        topic: "Bhagavad Gita",
        duration: 3060,
        videoUrl: "https://www.youtube.com/@TheAcharya1",
        description: "Krishna's divine birth and activities explained by Prabhupada in New York.",
        createdAt: new Date()
      },
      {
        id: 5,
        title: "Morning Walk - Los Angeles, December 15, 1973",
        speaker: "A.C. Bhaktivedanta Swami Prabhupada",
        topic: "Philosophy",
        duration: 1800,
        videoUrl: "https://www.youtube.com/@TheAcharya1",
        description: "Prabhupada discusses spiritual topics during morning walk with disciples.",
        createdAt: new Date()
      },
      {
        id: 6,
        title: "Srimad-Bhagavatam 2.1.1 - Paris, June 11, 1974",
        speaker: "A.C. Bhaktivedanta Swami Prabhupada",
        topic: "Srimad Bhagavatam",
        duration: 2700,
        videoUrl: "https://www.youtube.com/@TheAcharya1",
        description: "The process of meditation and remembering Krishna at the time of death.",
        createdAt: new Date()
      },
      {
        id: 7,
        title: "Arrival Lecture - Boston, December 24, 1969",
        speaker: "A.C. Bhaktivedanta Swami Prabhupada",
        topic: "Philosophy",
        duration: 2400,
        videoUrl: "https://www.youtube.com/@TheAcharya1",
        description: "Prabhupada's arrival lecture in Boston explaining the importance of Krishna consciousness.",
        createdAt: new Date()
      },
      {
        id: 8,
        title: "Bhagavad-gita 7.1 - Hyderabad, August 22, 1976",
        speaker: "A.C. Bhaktivedanta Swami Prabhupada",
        topic: "Bhagavad Gita",
        duration: 3300,
        videoUrl: "https://www.youtube.com/@TheAcharya1",
        description: "The process of hearing from the spiritual master to understand Krishna.",
        createdAt: new Date()
      },
      {
        id: 9,
        title: "Nectar of Devotion - Vrindavan, October 14, 1972",
        speaker: "A.C. Bhaktivedanta Swami Prabhupada",
        topic: "Devotional Service",
        duration: 2940,
        videoUrl: "https://www.youtube.com/@TheAcharya1",
        description: "The science of devotional service explained from Nectar of Devotion.",
        createdAt: new Date()
      },
      {
        id: 10,
        title: "Room Conversation - Mayapur, February 19, 1976",
        speaker: "A.C. Bhaktivedanta Swami Prabhupada",
        topic: "Philosophy",
        duration: 2160,
        videoUrl: "https://www.youtube.com/@TheAcharya1",
        description: "Intimate conversation about spiritual topics and practical devotional life.",
        createdAt: new Date()
      }
    ];
    
    this.lecturesData.push(...prabhupadaLectures);
  }

  private seedChallenges(): void {
    const challenges = [
      {
        id: 1,
        type: "chanting",
        title: "16 Round Challenge",
        description: "Complete 16 rounds of chanting daily for 30 days",
        targetValue: 30,
        duration: 30,
        points: 100,
        isActive: true
      },
      {
        id: 2,
        type: "reading",
        title: "Daily Reading Challenge", 
        description: "Read Srila Prabhupada's books for at least 30 minutes daily",
        targetValue: 30,
        duration: 30,
        points: 75,
        isActive: true
      }
    ];
    
    this.challengesData.push(...challenges);
  }
}

export const storage = new DatabaseStorage();