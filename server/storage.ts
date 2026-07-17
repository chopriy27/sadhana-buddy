import { firestore, COLLECTIONS } from "./firebase";
import { parseAuthenticCalendar, convertToAuthenticFestivals } from "./authentnicCalendarParser";
import { parseVaishnavSongBook, convertToDevotionalSongs, knownVaishnavSongs } from "./songParser";
import { join } from "path";
import { FieldValue } from 'firebase-admin/firestore';

// Types (simplified for Firestore - no Drizzle dependencies)
export interface User {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SadhanaEntry {
  id: number;
  userId: string;
  date: string;
  chantingRounds: number;
  readingPrabhupada: boolean;
  bookTitle: string | null;
  pagesRead: number;
  hearingLectures: number;
  createdAt: Date;
}

export interface JournalEntry {
  id: number;
  userId: string;
  title: string;
  content: string;
  mood: string | null;
  createdAt: Date;
}

export interface DevotionalSong {
  id: number;
  title: string;
  author: string;
  category: string;
  mood: string;
  lyrics: string | null;
  lyricsPreview: string | null;
  pageReference: string | null;
  audioUrl: string | null;
  createdAt: Date;
}

export interface Lecture {
  id: number;
  title: string;
  speaker: string;
  topic: string;
  duration: number | null;
  videoUrl: string | null;
  description: string | null;
  createdAt: Date;
}

export interface Festival {
  id: number;
  name: string;
  date: string;
  description: string | null;
  significance: string | null;
  observances: string[] | null;
}

export interface DailyVerse {
  id: number;
  verse: string;
  translation: string;
  source: string;
  date: string;
}

export interface UserProgress {
  id: number;
  userId: string;
  booksRead: string[];
  lecturesHeard: number[];
  totalChantingRounds: number;
  currentStreak: number;
  longestStreak: number;
  updatedAt: Date;
}

export interface Challenge {
  id: number;
  title: string;
  description: string;
  type: string;
  target: number;
  duration: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface UserChallenge {
  id: number;
  userId: string;
  challengeId: number;
  progress: number;
  completed: boolean;
  joinedAt: Date;
}

export interface FavoriteSong {
  id: number;
  userId: string;
  songId: number;
  createdAt: Date;
}

export interface UserGoals {
  id: number;
  userId: string;
  dailyChantingRounds: number;
  dailyReadingPages: number;
  dailyHearingLectures: number;
  isOnboardingComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Insert types (for creating new records)
export type InsertUser = Omit<User, 'createdAt' | 'updatedAt'>;
export type UpsertUser = Partial<User> & { id: string };
export type InsertSadhanaEntry = Omit<SadhanaEntry, 'id' | 'createdAt'>;
export type InsertJournalEntry = Omit<JournalEntry, 'id' | 'createdAt'>;
export type InsertDevotionalSong = Omit<DevotionalSong, 'id' | 'createdAt'>;
export type InsertLecture = Omit<Lecture, 'id' | 'createdAt'>;
export type InsertFestival = Omit<Festival, 'id'>;
export type InsertDailyVerse = Omit<DailyVerse, 'id'>;
export type InsertUserProgress = Omit<UserProgress, 'id' | 'updatedAt'>;
export type InsertChallenge = Omit<Challenge, 'id'>;
export type InsertUserChallenge = Omit<UserChallenge, 'id' | 'joinedAt'>;
export type InsertFavoriteSong = Omit<FavoriteSong, 'id' | 'createdAt'>;
export type InsertUserGoals = Omit<UserGoals, 'id' | 'createdAt' | 'updatedAt'>;

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

// Counter for generating auto-increment IDs
async function getNextId(collection: string): Promise<number> {
  const counterRef = firestore.collection('counters').doc(collection);

  try {
    const result = await firestore.runTransaction(async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      let nextId = 1;

      if (counterDoc.exists) {
        nextId = (counterDoc.data()?.value || 0) + 1;
      }

      transaction.set(counterRef, { value: nextId });
      return nextId;
    });

    return result;
  } catch (error) {
    // Fallback: use timestamp-based ID
    return Date.now();
  }
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

  // Users - Firestore operations
  async getUser(id: string): Promise<User | undefined> {
    const doc = await firestore.collection(COLLECTIONS.users).doc(id).get();
    if (!doc.exists) return undefined;

    const data = doc.data()!;
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as User;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const userRef = firestore.collection(COLLECTIONS.users).doc(userData.id);
    const existingDoc = await userRef.get();

    const now = new Date();

    // Clean undefined values - Firestore doesn't accept undefined
    const cleanData: Record<string, any> = {
      id: userData.id,
      email: userData.email ?? null,
      firstName: userData.firstName ?? null,
      lastName: userData.lastName ?? null,
      profileImageUrl: userData.profileImageUrl ?? null,
      timezone: userData.timezone || 'America/New_York',
      updatedAt: now,
    };

    if (!existingDoc.exists) {
      cleanData.createdAt = now;
    }

    await userRef.set(cleanData, { merge: true });

    return {
      ...cleanData,
      createdAt: existingDoc.exists ? (existingDoc.data()?.createdAt?.toDate() || now) : now,
      updatedAt: now,
    } as User;
  }

  async updateUserProfilePicture(id: string, profileImageUrl: string): Promise<User> {
    const userRef = firestore.collection(COLLECTIONS.users).doc(id);
    await userRef.update({
      profileImageUrl,
      updatedAt: new Date()
    });

    const user = await this.getUser(id);
    return user!;
  }

  // Sadhana Entries - Firestore operations
  async getSadhanaEntry(userId: string, date: string): Promise<SadhanaEntry | undefined> {
    const snapshot = await firestore
      .collection(COLLECTIONS.sadhanaEntries)
      .where('userId', '==', userId)
      .where('date', '==', date)
      .limit(1)
      .get();

    if (snapshot.empty) return undefined;

    const doc = snapshot.docs[0];
    const data = doc.data();
    return {
      ...data,
      id: data.id,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as SadhanaEntry;
  }

  async getSadhanaEntries(userId: string, limit = 30): Promise<SadhanaEntry[]> {
    const snapshot = await firestore
      .collection(COLLECTIONS.sadhanaEntries)
      .where('userId', '==', userId)
      .orderBy('date', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: data.id,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as SadhanaEntry;
    });
  }

  async createSadhanaEntry(insertEntry: InsertSadhanaEntry): Promise<SadhanaEntry> {
    const id = await getNextId(COLLECTIONS.sadhanaEntries);
    const entry = {
      ...insertEntry,
      id,
      createdAt: new Date(),
    };

    await firestore.collection(COLLECTIONS.sadhanaEntries).doc(id.toString()).set(entry);

    return entry as SadhanaEntry;
  }

  async updateSadhanaEntry(id: number, updateData: Partial<InsertSadhanaEntry>): Promise<SadhanaEntry | undefined> {
    const docRef = firestore.collection(COLLECTIONS.sadhanaEntries).doc(id.toString());
    const doc = await docRef.get();

    if (!doc.exists) return undefined;

    await docRef.update(updateData);

    const updated = await docRef.get();
    const data = updated.data()!;
    return {
      ...data,
      id: data.id,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as SadhanaEntry;
  }

  // Journal Entries - Firestore operations
  async getJournalEntries(userId: string, limit = 20): Promise<JournalEntry[]> {
    const snapshot = await firestore
      .collection(COLLECTIONS.journalEntries)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: data.id,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as JournalEntry;
    });
  }

  async createJournalEntry(insertEntry: InsertJournalEntry): Promise<JournalEntry> {
    const id = await getNextId(COLLECTIONS.journalEntries);
    const entry = {
      ...insertEntry,
      id,
      createdAt: new Date(),
    };

    await firestore.collection(COLLECTIONS.journalEntries).doc(id.toString()).set(entry);

    return entry as JournalEntry;
  }

  async updateJournalEntry(id: number, updateData: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined> {
    const docRef = firestore.collection(COLLECTIONS.journalEntries).doc(id.toString());
    const doc = await docRef.get();

    if (!doc.exists) return undefined;

    await docRef.update(updateData);

    const updated = await docRef.get();
    const data = updated.data()!;
    return {
      ...data,
      id: data.id,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as JournalEntry;
  }

  async deleteJournalEntry(id: number): Promise<boolean> {
    const docRef = firestore.collection(COLLECTIONS.journalEntries).doc(id.toString());
    const doc = await docRef.get();

    if (!doc.exists) return false;

    await docRef.delete();
    return true;
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
    // Use yesterday's date to account for timezone differences
    // (server runs in UTC but users may be in different timezones)
    const now = new Date();
    now.setDate(now.getDate() - 1);
    const yesterday = now.toISOString().split('T')[0];
    
    return this.festivalsData
      .filter(festival => festival.date >= yesterday)
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
    if (this.dailyVersesData.length === 0) return undefined;
    const d = new Date(date + 'T00:00:00');
    const startOfYear = new Date(d.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((d.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
    return this.dailyVersesData[dayOfYear % this.dailyVersesData.length];
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

  // User Progress - Firestore operations
  async getUserProgress(userId: string): Promise<UserProgress | undefined> {
    const doc = await firestore.collection(COLLECTIONS.userProgress).doc(userId).get();
    if (!doc.exists) return undefined;

    const data = doc.data()!;
    return {
      ...data,
      id: data.id || 1,
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as UserProgress;
  }

  async updateUserProgress(userId: string, updateData: Partial<InsertUserProgress>): Promise<UserProgress> {
    const docRef = firestore.collection(COLLECTIONS.userProgress).doc(userId);
    const existing = await docRef.get();

    if (existing.exists) {
      await docRef.update({
        ...updateData,
        updatedAt: new Date(),
      });
    } else {
      const id = await getNextId(COLLECTIONS.userProgress);
      const newProgress = {
        id,
        userId,
        booksRead: [],
        lecturesHeard: [],
        totalChantingRounds: 0,
        currentStreak: 0,
        longestStreak: 0,
        ...updateData,
        updatedAt: new Date(),
      };
      await docRef.set(newProgress);
    }

    return (await this.getUserProgress(userId))!;
  }

  // Challenges - In-memory with seeded data
  async getChallenges(): Promise<Challenge[]> {
    return [...this.challengesData];
  }

  async getActiveUserChallenges(userId: string): Promise<(UserChallenge & { challenge: Challenge })[]> {
    const snapshot = await firestore
      .collection(COLLECTIONS.userChallenges)
      .where('userId', '==', userId)
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: data.id,
        joinedAt: data.joinedAt?.toDate() || new Date(),
        challenge: this.challengesData.find(c => c.id === data.challengeId)!
      } as UserChallenge & { challenge: Challenge };
    });
  }

  async joinChallenge(insertUserChallenge: InsertUserChallenge): Promise<UserChallenge> {
    const id = await getNextId(COLLECTIONS.userChallenges);
    const userChallenge = {
      ...insertUserChallenge,
      id,
      joinedAt: new Date(),
    };

    await firestore.collection(COLLECTIONS.userChallenges).doc(id.toString()).set(userChallenge);

    return userChallenge as UserChallenge;
  }

  async updateChallengeProgress(id: number, progress: number): Promise<UserChallenge | undefined> {
    const docRef = firestore.collection(COLLECTIONS.userChallenges).doc(id.toString());
    const doc = await docRef.get();

    if (!doc.exists) return undefined;

    await docRef.update({ progress });

    const updated = await docRef.get();
    const data = updated.data()!;
    return {
      ...data,
      id: data.id,
      joinedAt: data.joinedAt?.toDate() || new Date(),
    } as UserChallenge;
  }

  // Favorites - Firestore operations
  async getFavoriteSongs(userId: string): Promise<(FavoriteSong & { song: DevotionalSong })[]> {
    const snapshot = await firestore
      .collection(COLLECTIONS.favoriteSongs)
      .where('userId', '==', userId)
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: data.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        song: this.devotionalSongsData.find(song => song.id === data.songId)!
      } as FavoriteSong & { song: DevotionalSong };
    });
  }

  async addFavoriteSong(insertFavoriteSong: InsertFavoriteSong): Promise<FavoriteSong> {
    const id = await getNextId(COLLECTIONS.favoriteSongs);
    const favoriteSong = {
      ...insertFavoriteSong,
      id,
      createdAt: new Date(),
    };

    await firestore.collection(COLLECTIONS.favoriteSongs).doc(id.toString()).set(favoriteSong);

    return favoriteSong as FavoriteSong;
  }

  async removeFavoriteSong(userId: string, songId: number): Promise<boolean> {
    const snapshot = await firestore
      .collection(COLLECTIONS.favoriteSongs)
      .where('userId', '==', userId)
      .where('songId', '==', songId)
      .limit(1)
      .get();

    if (snapshot.empty) return false;

    await snapshot.docs[0].ref.delete();
    return true;
  }

  async isSongFavorited(userId: string, songId: number): Promise<boolean> {
    const snapshot = await firestore
      .collection(COLLECTIONS.favoriteSongs)
      .where('userId', '==', userId)
      .where('songId', '==', songId)
      .limit(1)
      .get();

    return !snapshot.empty;
  }

  // User Goals - Firestore operations
  async getUserGoals(userId: string): Promise<UserGoals | undefined> {
    const doc = await firestore.collection(COLLECTIONS.userGoals).doc(userId).get();
    if (!doc.exists) return undefined;

    const data = doc.data()!;
    return {
      ...data,
      id: data.id || 1,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as UserGoals;
  }

  async createUserGoals(insertGoals: InsertUserGoals): Promise<UserGoals> {
    const id = await getNextId(COLLECTIONS.userGoals);
    const now = new Date();
    const goals = {
      ...insertGoals,
      id,
      createdAt: now,
      updatedAt: now,
    };

    await firestore.collection(COLLECTIONS.userGoals).doc(insertGoals.userId).set(goals);

    return goals as UserGoals;
  }

  async updateUserGoals(userId: string, updateData: Partial<InsertUserGoals>): Promise<UserGoals> {
    const docRef = firestore.collection(COLLECTIONS.userGoals).doc(userId);

    await docRef.update({
      ...updateData,
      updatedAt: new Date(),
    });

    return (await this.getUserGoals(userId))!;
  }

  // Seed data methods
  private loadVaishnavCalendar(): void {
    try {
      console.log("Loading authentic ISKCON festivals for 2025 and 2026...");
      
      // Load 2025 calendar
      const calendar2025Path = join(process.cwd(), "attached_assets", "Pasted--January-02-Jan-2025-Disappearance-Day-of-Sri-Jiva-Goswami-02-Jan-2025-Disappearance-Day-of-S-1751383253600_1751383253601.txt");
      const calendar2025Events = parseAuthenticCalendar(calendar2025Path);
      const festivals2025 = convertToAuthenticFestivals(calendar2025Events);

      festivals2025.forEach(festival => {
        const festivalWithId: Festival = {
          ...festival,
          id: this.festivalsData.length + 1,
          description: festival.description || null,
          significance: festival.significance || null,
          observances: festival.observances || null,
        };
        this.festivalsData.push(festivalWithId);
      });

      console.log(`Loaded ${festivals2025.length} festivals for 2025`);

      // Load 2026 calendar
      const calendar2026Path = join(process.cwd(), "attached_assets", "calendar-2026-washington.txt");
      const calendar2026Events = parseAuthenticCalendar(calendar2026Path);
      const festivals2026 = convertToAuthenticFestivals(calendar2026Events);

      festivals2026.forEach(festival => {
        const festivalWithId: Festival = {
          ...festival,
          id: this.festivalsData.length + 1,
          description: festival.description || null,
          significance: festival.significance || null,
          observances: festival.observances || null,
        };
        this.festivalsData.push(festivalWithId);
      });

      console.log(`Loaded ${festivals2026.length} festivals for 2026`);
      console.log(`Successfully loaded ${this.festivalsData.length} total authentic ISKCON festivals`);
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
          lyrics: song.lyrics || null,
          audioUrl: song.audioUrl || null,
          lyricsPreview: song.lyricsPreview ?? null,
          pageReference: song.pageReference ?? null,
        };
        this.devotionalSongsData.push(songWithId);
      });

      console.log(`Successfully loaded ${this.devotionalSongsData.length} devotional songs`);
    } catch (error) {
      console.error("Error loading songs:", error);
    }
  }

  private seedDailyVerses(): void {
    const verses: DailyVerse[] = [
      {
        id: 1,
        date: "2025-01-01",
        verse: "Hare Krsna Hare Krsna Krsna Krsna Hare Hare / Hare Rama Hare Rama Rama Rama Hare Hare",
        translation: "Hare Krsna Hare Krsna Krsna Krsna Hare Hare / Hare Rama Hare Rama Rama Rama Hare Hare",
        source: "Hare Krsna Mahā-mantra"
      },
      {
        id: 2,
        date: "2025-01-02",
        verse: "Krsna who is known as Govinda is the Supreme Godhead. He has an eternal blissful spiritual body. He is the origin of all. He has no other origin and He is the prime cause of all causes.",
        translation: "Krsna who is known as Govinda is the Supreme Godhead. He has an eternal blissful spiritual body. He is the origin of all. He has no other origin and He is the prime cause of all causes.",
        source: "Brahma-saṁhitā 5.1"
      },
      {
        id: 3,
        date: "2025-01-03",
        verse: "Let there be all victory for the chanting of the holy name of Lord Krsna, which can cleanse the mirror of the heart and stop the miseries of the blazing fire of conditional life in material existence. That chanting is the waxing moon that spreads the white lotus of good fortune for all living entities. It is the life and soul of all education; it increases the ocean of transcendental bliss, and it enables us to fully taste the nectar for which we are always anxious.",
        translation: "Let there be all victory for the chanting of the holy name of Lord Krsna, which can cleanse the mirror of the heart and stop the miseries of the blazing fire of conditional life in material existence. That chanting is the waxing moon that spreads the white lotus of good fortune for all living entities. It is the life and soul of all education; it increases the ocean of transcendental bliss, and it enables us to fully taste the nectar for which we are always anxious.",
        source: "Śrī Śikṣāṣṭaka 1 (CC Antya 20.11)"
      },
      {
        id: 4,
        date: "2025-01-04",
        verse: "O my Lord, Your holy name alone can render all benediction to living beings, and thus You have hundreds and millions of names like Krsna and Govinda. In these transcendental names You have invested all Your transcendental energies. There are not even hard and fast rules for chanting these names. O my Lord, out of kindness You enable us to easily approach You by Your holy names, but I am so unfortunate that I have no attraction for them.",
        translation: "O my Lord, Your holy name alone can render all benediction to living beings, and thus You have hundreds and millions of names like Krsna and Govinda. In these transcendental names You have invested all Your transcendental energies. There are not even hard and fast rules for chanting these names. O my Lord, out of kindness You enable us to easily approach You by Your holy names, but I am so unfortunate that I have no attraction for them.",
        source: "Śrī Śikṣāṣṭaka 2 (CC Antya 20.16)"
      },
      {
        id: 5,
        date: "2025-01-05",
        verse: "One should chant the holy name of the Lord in a humble state of mind, thinking oneself lower than the straw in the street; one should be more tolerant than a tree, devoid of all sense of false prestige, and should be ready to offer all respects to others. In such a state of mind one can chant the holy name of the Lord constantly.",
        translation: "One should chant the holy name of the Lord in a humble state of mind, thinking oneself lower than the straw in the street; one should be more tolerant than a tree, devoid of all sense of false prestige, and should be ready to offer all respects to others. In such a state of mind one can chant the holy name of the Lord constantly.",
        source: "Śrī Śikṣāṣṭaka 3 (CC Antya 20.21)"
      },
      {
        id: 6,
        date: "2025-01-06",
        verse: "O almighty Lord, I have no desire to accumulate wealth, nor do I desire beautiful women, nor do I want any number of followers. I only want Your causeless devotional service, birth after birth.",
        translation: "O almighty Lord, I have no desire to accumulate wealth, nor do I desire beautiful women, nor do I want any number of followers. I only want Your causeless devotional service, birth after birth.",
        source: "Śrī Śikṣāṣṭaka 4 (CC Antya 20.29)"
      },
      {
        id: 7,
        date: "2025-01-07",
        verse: "O son of Maharaja Nanda [Krsna], I am Your eternal servitor, yet somehow or other I have fallen into this horrible ocean of birth and death. Please pick me up from this ocean of death and place me as one of the atoms at Your lotus feet.",
        translation: "O son of Maharaja Nanda [Krsna], I am Your eternal servitor, yet somehow or other I have fallen into this horrible ocean of birth and death. Please pick me up from this ocean of death and place me as one of the atoms at Your lotus feet.",
        source: "Śrī Śikṣāṣṭaka 5 (CC Antya 20.32)"
      },
      {
        id: 8,
        date: "2025-01-08",
        verse: "O my Lord, when will my eyes be decorated with tears of love flowing constantly when I chant Your holy name? When will my voice choke up, and when will the hairs of my body stand on end at the recitation of Your name?",
        translation: "O my Lord, when will my eyes be decorated with tears of love flowing constantly when I chant Your holy name? When will my voice choke up, and when will the hairs of my body stand on end at the recitation of Your name?",
        source: "Śrī Śikṣāṣṭaka 6 (CC Antya 20.36)"
      },
      {
        id: 9,
        date: "2025-01-09",
        verse: "O Govinda! Feeling Your separation, I am considering a moment to be like twelve years or more. Tears are flowing from my eyes like torrents of rain, and I am feeling all vacant in the world in Your absence.",
        translation: "O Govinda! Feeling Your separation, I am considering a moment to be like twelve years or more. Tears are flowing from my eyes like torrents of rain, and I am feeling all vacant in the world in Your absence.",
        source: "Śrī Śikṣāṣṭaka 7 (CC Antya 20.39)"
      },
      {
        id: 10,
        date: "2025-01-10",
        verse: "I know no one but Krsna as my Lord, and He shall remain so even if He handles me roughly by His embrace or makes me brokenhearted by not being present before me. He is completely free to do anything and everything, for He is always my worshipful Lord, unconditionally.",
        translation: "I know no one but Krsna as my Lord, and He shall remain so even if He handles me roughly by His embrace or makes me brokenhearted by not being present before me. He is completely free to do anything and everything, for He is always my worshipful Lord, unconditionally.",
        source: "Śrī Śikṣāṣṭaka 8 (CC Antya 20.47)"
      },
      {
        id: 11,
        date: "2025-01-11",
        verse: "As the embodied soul continually passes, in this body, from boyhood to youth to old age, the soul similarly passes into another body at death. A sober person is not bewildered by such a change.",
        translation: "As the embodied soul continually passes, in this body, from boyhood to youth to old age, the soul similarly passes into another body at death. A sober person is not bewildered by such a change.",
        source: "Bhagavad-gītā 2.13"
      },
      {
        id: 12,
        date: "2025-01-12",
        verse: "For the soul there is never birth nor death at any time. He has not come into being, does not come into being, and will not come into being. He is unborn, eternal, ever-existing, and primeval. He is not slain when the body is slain.",
        translation: "For the soul there is never birth nor death at any time. He has not come into being, does not come into being, and will not come into being. He is unborn, eternal, ever-existing, and primeval. He is not slain when the body is slain.",
        source: "Bhagavad-gītā 2.20"
      },
      {
        id: 13,
        date: "2025-01-13",
        verse: "As a person puts on new garments, giving up old ones, the soul similarly accepts new material bodies, giving up the old and useless ones.",
        translation: "As a person puts on new garments, giving up old ones, the soul similarly accepts new material bodies, giving up the old and useless ones.",
        source: "Bhagavad-gītā 2.22"
      },
      {
        id: 14,
        date: "2025-01-14",
        verse: "The soul can never be cut to pieces by any weapon, nor burned by fire, nor moistened by water, nor withered by the wind.",
        translation: "The soul can never be cut to pieces by any weapon, nor burned by fire, nor moistened by water, nor withered by the wind.",
        source: "Bhagavad-gītā 2.23"
      },
      {
        id: 15,
        date: "2025-01-15",
        verse: "You have a right to perform your prescribed duty, but you are not entitled to the fruits of action. Never consider yourself to be the cause of the results of your activities, and never be attached to not doing your duty.",
        translation: "You have a right to perform your prescribed duty, but you are not entitled to the fruits of action. Never consider yourself to be the cause of the results of your activities, and never be attached to not doing your duty.",
        source: "Bhagavad-gītā 2.47"
      },
      {
        id: 16,
        date: "2025-01-16",
        verse: "Perform your duty equipoised, O Arjuna, abandoning all attachment to success or failure. Such equanimity is called yoga.",
        translation: "Perform your duty equipoised, O Arjuna, abandoning all attachment to success or failure. Such equanimity is called yoga.",
        source: "Bhagavad-gītā 2.48"
      },
      {
        id: 17,
        date: "2025-01-17",
        verse: "The Supreme Personality of Godhead said: O Partha, when a man gives up all varieties of desire for sense gratification, which arise from mental concoction, and when his mind, thus purified, finds satisfaction in the self alone, then he is said to be in pure transcendental consciousness.",
        translation: "The Supreme Personality of Godhead said: O Partha, when a man gives up all varieties of desire for sense gratification, which arise from mental concoction, and when his mind, thus purified, finds satisfaction in the self alone, then he is said to be in pure transcendental consciousness.",
        source: "Bhagavad-gītā 2.55"
      },
      {
        id: 18,
        date: "2025-01-18",
        verse: "One who is not disturbed by the incessant flow of desires that enter like rivers into the ocean, which is ever being filled but is always still, can alone achieve peace, and not the person who strives to satisfy such desires.",
        translation: "One who is not disturbed by the incessant flow of desires that enter like rivers into the ocean, which is ever being filled but is always still, can alone achieve peace, and not the person who strives to satisfy such desires.",
        source: "Bhagavad-gītā 2.70"
      },
      {
        id: 19,
        date: "2025-01-19",
        verse: "The working senses are superior to dull matter; mind is higher than the senses; intelligence is still higher than the mind; and he [the soul] is even higher than the intelligence.",
        translation: "The working senses are superior to dull matter; mind is higher than the senses; intelligence is still higher than the mind; and he [the soul] is even higher than the intelligence.",
        source: "Bhagavad-gītā 3.42"
      },
      {
        id: 20,
        date: "2025-01-20",
        verse: "Whenever and wherever there is a decline in religious practice, O descendant of Bharata, and a predominant rise of irreligion — at that time I descend Myself.",
        translation: "Whenever and wherever there is a decline in religious practice, O descendant of Bharata, and a predominant rise of irreligion — at that time I descend Myself.",
        source: "Bhagavad-gītā 4.7"
      },
      {
        id: 21,
        date: "2025-01-21",
        verse: "To deliver the pious and to annihilate the miscreants, as well as to reestablish the principles of religion, I Myself appear, millennium after millennium.",
        translation: "To deliver the pious and to annihilate the miscreants, as well as to reestablish the principles of religion, I Myself appear, millennium after millennium.",
        source: "Bhagavad-gītā 4.8"
      },
      {
        id: 22,
        date: "2025-01-22",
        verse: "One who knows the transcendental nature of My appearance and activities does not, upon leaving the body, take his birth again in this material world, but attains My eternal abode, O Arjuna.",
        translation: "One who knows the transcendental nature of My appearance and activities does not, upon leaving the body, take his birth again in this material world, but attains My eternal abode, O Arjuna.",
        source: "Bhagavad-gītā 4.9"
      },
      {
        id: 23,
        date: "2025-01-23",
        verse: "As all surrender unto Me, I reward them accordingly. Everyone follows My path in all respects, O son of Prtha.",
        translation: "As all surrender unto Me, I reward them accordingly. Everyone follows My path in all respects, O son of Prtha.",
        source: "Bhagavad-gītā 4.11"
      },
      {
        id: 24,
        date: "2025-01-24",
        verse: "Just try to learn the truth by approaching a spiritual master. Inquire from him submissively and render service unto him. The self-realized souls can impart knowledge unto you because they have seen the truth.",
        translation: "Just try to learn the truth by approaching a spiritual master. Inquire from him submissively and render service unto him. The self-realized souls can impart knowledge unto you because they have seen the truth.",
        source: "Bhagavad-gītā 4.34"
      },
      {
        id: 25,
        date: "2025-01-25",
        verse: "A person in full consciousness of Me, knowing Me to be the ultimate beneficiary of all sacrifices and austerities, the Supreme Lord of all planets and demigods, and the benefactor and well-wisher of all living entities, attains peace from the pangs of material miseries.",
        translation: "A person in full consciousness of Me, knowing Me to be the ultimate beneficiary of all sacrifices and austerities, the Supreme Lord of all planets and demigods, and the benefactor and well-wisher of all living entities, attains peace from the pangs of material miseries.",
        source: "Bhagavad-gītā 5.29"
      },
      {
        id: 26,
        date: "2025-01-26",
        verse: "One must deliver himself with the help of his mind, and not degrade himself. The mind is the friend of the conditioned soul, and his enemy as well.",
        translation: "One must deliver himself with the help of his mind, and not degrade himself. The mind is the friend of the conditioned soul, and his enemy as well.",
        source: "Bhagavad-gītā 6.5"
      },
      {
        id: 27,
        date: "2025-01-27",
        verse: "Lord Sri Krsna said: O mighty-armed son of Kunti, it is undoubtedly very difficult to curb the restless mind, but it is possible by suitable practice and by detachment.",
        translation: "Lord Sri Krsna said: O mighty-armed son of Kunti, it is undoubtedly very difficult to curb the restless mind, but it is possible by suitable practice and by detachment.",
        source: "Bhagavad-gītā 6.35"
      },
      {
        id: 28,
        date: "2025-01-28",
        verse: "And of all yogis, the one with great faith who always abides in Me, thinks of Me within himself, and renders transcendental loving service to Me — he is the most intimately united with Me in yoga and is the highest of all. That is My opinion.",
        translation: "And of all yogis, the one with great faith who always abides in Me, thinks of Me within himself, and renders transcendental loving service to Me — he is the most intimately united with Me in yoga and is the highest of all. That is My opinion.",
        source: "Bhagavad-gītā 6.47"
      },
      {
        id: 29,
        date: "2025-01-29",
        verse: "O conqueror of wealth, there is no Truth superior to Me. Everything rests upon Me, as pearls are strung on a thread.",
        translation: "O conqueror of wealth, there is no Truth superior to Me. Everything rests upon Me, as pearls are strung on a thread.",
        source: "Bhagavad-gītā 7.7"
      },
      {
        id: 30,
        date: "2025-01-30",
        verse: "This divine energy of Mine, consisting of the three modes of material nature, is difficult to overcome. But those who have surrendered unto Me can easily cross beyond it.",
        translation: "This divine energy of Mine, consisting of the three modes of material nature, is difficult to overcome. But those who have surrendered unto Me can easily cross beyond it.",
        source: "Bhagavad-gītā 7.14"
      },
      {
        id: 31,
        date: "2025-01-31",
        verse: "After many births and deaths, he who is actually in knowledge surrenders unto Me, knowing Me to be the cause of all causes and all that is. Such a great soul is very rare.",
        translation: "After many births and deaths, he who is actually in knowledge surrenders unto Me, knowing Me to be the cause of all causes and all that is. Such a great soul is very rare.",
        source: "Bhagavad-gītā 7.19"
      },
      {
        id: 32,
        date: "2025-02-01",
        verse: "And whoever, at the end of his life, quits his body remembering Me alone at once attains My nature. Of this there is no doubt.",
        translation: "And whoever, at the end of his life, quits his body remembering Me alone at once attains My nature. Of this there is no doubt.",
        source: "Bhagavad-gītā 8.5"
      },
      {
        id: 33,
        date: "2025-02-02",
        verse: "Therefore, Arjuna, you should always think of Me in the form of Krsna and at the same time carry out your prescribed duty of fighting. With your activities dedicated to Me and your mind and intelligence fixed on Me, you will attain Me without doubt.",
        translation: "Therefore, Arjuna, you should always think of Me in the form of Krsna and at the same time carry out your prescribed duty of fighting. With your activities dedicated to Me and your mind and intelligence fixed on Me, you will attain Me without doubt.",
        source: "Bhagavad-gītā 8.7"
      },
      {
        id: 34,
        date: "2025-02-03",
        verse: "For one who always remembers Me without deviation, I am easy to obtain, O son of Prtha, because of his constant engagement in devotional service.",
        translation: "For one who always remembers Me without deviation, I am easy to obtain, O son of Prtha, because of his constant engagement in devotional service.",
        source: "Bhagavad-gītā 8.14"
      },
      {
        id: 35,
        date: "2025-02-04",
        verse: "After attaining Me, the great souls, who are yogis in devotion, never return to this temporary world, which is full of miseries, because they have attained the highest perfection.",
        translation: "After attaining Me, the great souls, who are yogis in devotion, never return to this temporary world, which is full of miseries, because they have attained the highest perfection.",
        source: "Bhagavad-gītā 8.15"
      },
      {
        id: 36,
        date: "2025-02-05",
        verse: "But those who worship Me with exclusive devotion, meditating on My transcendental form — to them I carry what they lack, and I preserve what they have.",
        translation: "But those who worship Me with exclusive devotion, meditating on My transcendental form — to them I carry what they lack, and I preserve what they have.",
        source: "Bhagavad-gītā 9.22"
      },
      {
        id: 37,
        date: "2025-02-06",
        verse: "If one offers Me with love and devotion a leaf, a flower, a fruit or water, I will accept it.",
        translation: "If one offers Me with love and devotion a leaf, a flower, a fruit or water, I will accept it.",
        source: "Bhagavad-gītā 9.26"
      },
      {
        id: 38,
        date: "2025-02-07",
        verse: "Whatever you do, whatever you eat, whatever you offer or give away, and whatever austerities you perform — do that, O son of Kunti, as an offering to Me.",
        translation: "Whatever you do, whatever you eat, whatever you offer or give away, and whatever austerities you perform — do that, O son of Kunti, as an offering to Me.",
        source: "Bhagavad-gītā 9.27"
      },
      {
        id: 39,
        date: "2025-02-08",
        verse: "I envy no one, nor am I partial to anyone. I am equal to all. But whoever renders service unto Me in devotion is a friend, is in Me, and I am also a friend to him.",
        translation: "I envy no one, nor am I partial to anyone. I am equal to all. But whoever renders service unto Me in devotion is a friend, is in Me, and I am also a friend to him.",
        source: "Bhagavad-gītā 9.29"
      },
      {
        id: 40,
        date: "2025-02-09",
        verse: "Engage your mind always in thinking of Me, become My devotee, offer obeisances to Me and worship Me. Being completely absorbed in Me, surely you will come to Me.",
        translation: "Engage your mind always in thinking of Me, become My devotee, offer obeisances to Me and worship Me. Being completely absorbed in Me, surely you will come to Me.",
        source: "Bhagavad-gītā 9.34"
      },
      {
        id: 41,
        date: "2025-02-10",
        verse: "I am the source of all spiritual and material worlds. Everything emanates from Me. The wise who know this perfectly engage in My devotional service and worship Me with all their hearts.",
        translation: "I am the source of all spiritual and material worlds. Everything emanates from Me. The wise who know this perfectly engage in My devotional service and worship Me with all their hearts.",
        source: "Bhagavad-gītā 10.8"
      },
      {
        id: 42,
        date: "2025-02-11",
        verse: "The thoughts of My pure devotees dwell in Me, their lives are fully devoted to My service, and they derive great satisfaction and bliss from always enlightening one another and conversing about Me.",
        translation: "The thoughts of My pure devotees dwell in Me, their lives are fully devoted to My service, and they derive great satisfaction and bliss from always enlightening one another and conversing about Me.",
        source: "Bhagavad-gītā 10.9"
      },
      {
        id: 43,
        date: "2025-02-12",
        verse: "To those who are constantly devoted to serving Me with love, I give the understanding by which they can come to Me.",
        translation: "To those who are constantly devoted to serving Me with love, I give the understanding by which they can come to Me.",
        source: "Bhagavad-gītā 10.10"
      },
      {
        id: 44,
        date: "2025-02-13",
        verse: "To show them special mercy, I, dwelling in their hearts, destroy with the shining lamp of knowledge the darkness born of ignorance.",
        translation: "To show them special mercy, I, dwelling in their hearts, destroy with the shining lamp of knowledge the darkness born of ignorance.",
        source: "Bhagavad-gītā 10.11"
      },
      {
        id: 45,
        date: "2025-02-14",
        verse: "Time I am, the great destroyer of the worlds.",
        translation: "Time I am, the great destroyer of the worlds.",
        source: "Bhagavad-gītā 11.32"
      },
      {
        id: 46,
        date: "2025-02-15",
        verse: "My dear Arjuna, only by undivided devotional service can I be understood as I am, standing before you, and can thus be seen directly. Only in this way can you enter into the mysteries of My understanding.",
        translation: "My dear Arjuna, only by undivided devotional service can I be understood as I am, standing before you, and can thus be seen directly. Only in this way can you enter into the mysteries of My understanding.",
        source: "Bhagavad-gītā 11.54"
      },
      {
        id: 47,
        date: "2025-02-16",
        verse: "But those who worship Me, giving up all their activities unto Me and being devoted to Me without deviation, engaged in devotional service and always meditating upon Me, having fixed their minds upon Me, O son of Prtha — for them I am the swift deliverer from the ocean of birth and death.",
        translation: "But those who worship Me, giving up all their activities unto Me and being devoted to Me without deviation, engaged in devotional service and always meditating upon Me, having fixed their minds upon Me, O son of Prtha — for them I am the swift deliverer from the ocean of birth and death.",
        source: "Bhagavad-gītā 12.6-7"
      },
      {
        id: 48,
        date: "2025-02-17",
        verse: "The living entities in this conditioned world are My eternal fragmental parts. Due to conditioned life, they are struggling very hard with the six senses, which include the mind.",
        translation: "The living entities in this conditioned world are My eternal fragmental parts. Due to conditioned life, they are struggling very hard with the six senses, which include the mind.",
        source: "Bhagavad-gītā 15.7"
      },
      {
        id: 49,
        date: "2025-02-18",
        verse: "I am seated in everyone's heart, and from Me come remembrance, knowledge and forgetfulness. By all the Vedas, I am to be known. Indeed, I am the compiler of Vedanta, and I am the knower of the Vedas.",
        translation: "I am seated in everyone's heart, and from Me come remembrance, knowledge and forgetfulness. By all the Vedas, I am to be known. Indeed, I am the compiler of Vedanta, and I am the knower of the Vedas.",
        source: "Bhagavad-gītā 15.15"
      },
      {
        id: 50,
        date: "2025-02-19",
        verse: "One who is thus transcendentally situated at once realizes the Supreme Brahman and becomes fully joyful. He never laments nor desires to have anything. He is equally disposed toward every living entity. In that state he attains pure devotional service unto Me.",
        translation: "One who is thus transcendentally situated at once realizes the Supreme Brahman and becomes fully joyful. He never laments nor desires to have anything. He is equally disposed toward every living entity. In that state he attains pure devotional service unto Me.",
        source: "Bhagavad-gītā 18.54"
      },
      {
        id: 51,
        date: "2025-02-20",
        verse: "The Supreme Lord is situated in everyone's heart, O Arjuna, and is directing the wanderings of all living entities, who are seated as on a machine, made of the material energy.",
        translation: "The Supreme Lord is situated in everyone's heart, O Arjuna, and is directing the wanderings of all living entities, who are seated as on a machine, made of the material energy.",
        source: "Bhagavad-gītā 18.61"
      },
      {
        id: 52,
        date: "2025-02-21",
        verse: "Always think of Me, become My devotee, worship Me and offer your homage unto Me. Thus you will come to Me without fail. I promise you this because you are My very dear friend.",
        translation: "Always think of Me, become My devotee, worship Me and offer your homage unto Me. Thus you will come to Me without fail. I promise you this because you are My very dear friend.",
        source: "Bhagavad-gītā 18.65"
      },
      {
        id: 53,
        date: "2025-02-22",
        verse: "Abandon all varieties of religion and just surrender unto Me. I shall deliver you from all sinful reactions. Do not fear.",
        translation: "Abandon all varieties of religion and just surrender unto Me. I shall deliver you from all sinful reactions. Do not fear.",
        source: "Bhagavad-gītā 18.66"
      },
      {
        id: 54,
        date: "2025-02-23",
        verse: "Completely rejecting all religious activities which are materially motivated, this Bhagavata Purana propounds the highest truth, which is understandable by those devotees who are fully pure in heart. The highest truth is reality distinguished from illusion for the welfare of all. Such truth uproots the threefold miseries. This beautiful Bhagavatam, compiled by the great sage Vyasadeva [in his maturity], is sufficient in itself for God realization. What is the need of any other scripture? As soon as one attentively and submissively hears the message of Bhagavatam, by this culture of knowledge the Supreme Lord is established within his heart.",
        translation: "Completely rejecting all religious activities which are materially motivated, this Bhagavata Purana propounds the highest truth, which is understandable by those devotees who are fully pure in heart. The highest truth is reality distinguished from illusion for the welfare of all. Such truth uproots the threefold miseries. This beautiful Bhagavatam, compiled by the great sage Vyasadeva [in his maturity], is sufficient in itself for God realization. What is the need of any other scripture? As soon as one attentively and submissively hears the message of Bhagavatam, by this culture of knowledge the Supreme Lord is established within his heart.",
        source: "Śrīmad-Bhāgavatam 1.1.2"
      },
      {
        id: 55,
        date: "2025-02-24",
        verse: "O best among the twice-born, it is therefore concluded that the highest perfection one can achieve by discharging the duties prescribed for one's own occupation according to caste divisions and orders of life is to please the Personality of Godhead.",
        translation: "O best among the twice-born, it is therefore concluded that the highest perfection one can achieve by discharging the duties prescribed for one's own occupation according to caste divisions and orders of life is to please the Personality of Godhead.",
        source: "Śrīmad-Bhāgavatam 1.2.13"
      },
      {
        id: 56,
        date: "2025-02-25",
        verse: "Therefore, with one-pointed attention, one should constantly hear about, glorify, remember and worship the Personality of Godhead, who is the protector of the devotees.",
        translation: "Therefore, with one-pointed attention, one should constantly hear about, glorify, remember and worship the Personality of Godhead, who is the protector of the devotees.",
        source: "Śrīmad-Bhāgavatam 1.2.14"
      },
      {
        id: 57,
        date: "2025-02-26",
        verse: "Sri Krsna, the Personality of Godhead, who is the Paramatma [Supersoul] in everyone's heart and the benefactor of the truthful devotee, cleanses desire for material enjoyment from the heart of the devotee who has developed the urge to hear His messages, which are in themselves virtuous when properly heard and chanted.",
        translation: "Sri Krsna, the Personality of Godhead, who is the Paramatma [Supersoul] in everyone's heart and the benefactor of the truthful devotee, cleanses desire for material enjoyment from the heart of the devotee who has developed the urge to hear His messages, which are in themselves virtuous when properly heard and chanted.",
        source: "Śrīmad-Bhāgavatam 1.2.17"
      },
      {
        id: 58,
        date: "2025-02-27",
        verse: "By regular attendance in classes on the Bhagavatam and by rendering of service to the pure devotee, all that is troublesome to the heart is almost completely destroyed, and loving service unto the Personality of Godhead, who is praised with transcendental songs, is established as an irrevocable fact.",
        translation: "By regular attendance in classes on the Bhagavatam and by rendering of service to the pure devotee, all that is troublesome to the heart is almost completely destroyed, and loving service unto the Personality of Godhead, who is praised with transcendental songs, is established as an irrevocable fact.",
        source: "Śrīmad-Bhāgavatam 1.2.18"
      },
      {
        id: 59,
        date: "2025-02-28",
        verse: "As soon as irrevocable loving service is established in the heart, the effects of nature's modes of passion and ignorance, such as lust, desire and hankering, disappear from the heart. Then the devotee is established in goodness, and he becomes completely happy.",
        translation: "As soon as irrevocable loving service is established in the heart, the effects of nature's modes of passion and ignorance, such as lust, desire and hankering, disappear from the heart. Then the devotee is established in goodness, and he becomes completely happy.",
        source: "Śrīmad-Bhāgavatam 1.2.19"
      },
      {
        id: 60,
        date: "2025-03-01",
        verse: "All of the above-mentioned incarnations are either plenary portions or portions of the plenary portions of the Lord, but Lord Sri Krsna is the original Personality of Godhead. All of them appear on planets whenever there is a disturbance created by the atheists. The Lord incarnates to protect the theists.",
        translation: "All of the above-mentioned incarnations are either plenary portions or portions of the plenary portions of the Lord, but Lord Sri Krsna is the original Personality of Godhead. All of them appear on planets whenever there is a disturbance created by the atheists. The Lord incarnates to protect the theists.",
        source: "Śrīmad-Bhāgavatam 1.3.28"
      },
      {
        id: 61,
        date: "2025-03-02",
        verse: "Those words which do not describe the glories of the Lord, who alone can sanctify the atmosphere of the whole universe, are considered by saintly persons to be like unto a place of pilgrimage for crows. Since the all-perfect persons are inhabitants of the transcendental abode, they do not derive any pleasure there.",
        translation: "Those words which do not describe the glories of the Lord, who alone can sanctify the atmosphere of the whole universe, are considered by saintly persons to be like unto a place of pilgrimage for crows. Since the all-perfect persons are inhabitants of the transcendental abode, they do not derive any pleasure there.",
        source: "Śrīmad-Bhāgavatam 1.5.10"
      },
      {
        id: 62,
        date: "2025-03-03",
        verse: "One who has forsaken his material occupations to engage in the devotional service of the Lord may sometimes fall down while in an immature stage, yet there is no danger of his being unsuccessful. On the other hand, a nondevotee, though fully engaged in occupational duties, does not gain anything.",
        translation: "One who has forsaken his material occupations to engage in the devotional service of the Lord may sometimes fall down while in an immature stage, yet there is no danger of his being unsuccessful. On the other hand, a nondevotee, though fully engaged in occupational duties, does not gain anything.",
        source: "Śrīmad-Bhāgavatam 1.5.17"
      },
      {
        id: 63,
        date: "2025-03-04",
        verse: "Simply by giving aural reception to this Vedic literature, the feeling for loving devotional service to Lord Krsna, the Supreme Personality of Godhead, sprouts up at once to extinguish the fire of lamentation, illusion and fearfulness.",
        translation: "Simply by giving aural reception to this Vedic literature, the feeling for loving devotional service to Lord Krsna, the Supreme Personality of Godhead, sprouts up at once to extinguish the fire of lamentation, illusion and fearfulness.",
        source: "Śrīmad-Bhāgavatam 1.7.7"
      },
      {
        id: 64,
        date: "2025-03-05",
        verse: "I wish that all those calamities would happen again and again so that we could see You again and again, for seeing You means that we will no longer see repeated births and deaths.",
        translation: "I wish that all those calamities would happen again and again so that we could see You again and again, for seeing You means that we will no longer see repeated births and deaths.",
        source: "Śrīmad-Bhāgavatam 1.8.25"
      },
      {
        id: 65,
        date: "2025-03-06",
        verse: "Hearing and chanting about the transcendental holy name, form, qualities, paraphernalia and pastimes of Lord Visnu, remembering them, serving the lotus feet of the Lord, offering the Lord respectful worship, offering prayers to the Lord, becoming His servant, considering the Lord one's best friend, and surrendering everything unto Him — these nine processes are accepted as pure devotional service.",
        translation: "Hearing and chanting about the transcendental holy name, form, qualities, paraphernalia and pastimes of Lord Visnu, remembering them, serving the lotus feet of the Lord, offering the Lord respectful worship, offering prayers to the Lord, becoming His servant, considering the Lord one's best friend, and surrendering everything unto Him — these nine processes are accepted as pure devotional service.",
        source: "Śrīmad-Bhāgavatam 7.5.31"
      }
    ];

    this.dailyVersesData.push(...verses);
  }

  private seedLectures(): void {
    const prabhupadaLectures = [
      {
        id: 1,
        title: "University Lectures",
        speaker: "A.C. Bhaktivedanta Swami Prabhupada",
        topic: "Philosophy",
        duration: 0,
        videoUrl: "https://youtube.com/playlist?list=PLKVZK40wEWjc6G00QjKGEsZcAGBm_qMKH&si=PS7rSme0l9Vo0BOs",
        description: "Collection of Prabhupada's lectures delivered at various universities around the world.",
        createdAt: new Date()
      },
      {
        id: 2,
        title: "Nectar of Devotion",
        speaker: "A.C. Bhaktivedanta Swami Prabhupada",
        topic: "Devotional Service",
        duration: 0,
        videoUrl: "https://youtube.com/playlist?list=PLKVZK40wEWjexllouuw9WDDh3MqipLQKG&si=6geVuF3FxWXs-bLP",
        description: "Complete lectures on the science of pure devotional service to Krishna.",
        createdAt: new Date()
      },
      {
        id: 3,
        title: "Short Hindi Classes",
        speaker: "A.C. Bhaktivedanta Swami Prabhupada",
        topic: "Philosophy",
        duration: 0,
        videoUrl: "https://youtube.com/playlist?list=PLKVZK40wEWjewgykPr4iXKl0gLEeb_1Kj&si=1wsezZtQVmIE9-3o",
        description: "Brief spiritual talks and classes delivered in Hindi language.",
        createdAt: new Date()
      },
      {
        id: 4,
        title: "Short English Classes",
        speaker: "A.C. Bhaktivedanta Swami Prabhupada",
        topic: "Philosophy",
        duration: 0,
        videoUrl: "https://youtube.com/playlist?list=PLKVZK40wEWjdB8f0GhA31GxH-PXy3kfIe&si=Tklo3oLhqi29VmIE",
        description: "Concise spiritual lessons and discussions in English language.",
        createdAt: new Date()
      },
      {
        id: 5,
        title: "Caitanya Caritamrta Lectures",
        speaker: "A.C. Bhaktivedanta Swami Prabhupada",
        topic: "Caitanya Caritamrta",
        duration: 0,
        videoUrl: "https://youtube.com/playlist?list=PLKVZK40wEWjewZM2tHYyw5_0gLSSG0Tnf&si=_AA0bjqz_0ICI2AY",
        description: "Comprehensive lectures on the biography and teachings of Lord Caitanya.",
        createdAt: new Date()
      },
      {
        id: 6,
        title: "Srimad Bhagavatam Lectures",
        speaker: "A.C. Bhaktivedanta Swami Prabhupada",
        topic: "Srimad Bhagavatam",
        duration: 0,
        videoUrl: "https://youtube.com/playlist?list=PLKVZK40wEWjf27uvED15jEP9oT2j3RrVQ&si=-epigsR8mmu2ZHCp",
        description: "Detailed commentary on the most important Purana describing Krishna's pastimes.",
        createdAt: new Date()
      },
      {
        id: 7,
        title: "Bhagavad Gita Lectures",
        speaker: "A.C. Bhaktivedanta Swami Prabhupada",
        topic: "Bhagavad Gita",
        duration: 0,
        videoUrl: "https://youtube.com/playlist?list=PLKVZK40wEWjd1iasoAknprMNQlsJsXuAi&si=Wh1uzUgkOoSKq2AD",
        description: "Verse-by-verse explanation of Krishna's instructions to Arjuna on the battlefield.",
        createdAt: new Date()
      },
      {
        id: 8,
        title: "Festival Lectures",
        speaker: "A.C. Bhaktivedanta Swami Prabhupada",
        topic: "Philosophy",
        duration: 0,
        videoUrl: "https://youtube.com/playlist?list=PLKVZK40wEWjdoIF6x8TE-1TKBWYzcRCuK&si=PZw2CSA4_jHUIOwx",
        description: "Special lectures delivered during various Vaishnava festivals and celebrations.",
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
        target: 30,
        duration: 30,
        startDate: "2025-01-01",
        endDate: "2025-01-31",
        isActive: true
      },
      {
        id: 2,
        type: "reading",
        title: "Daily Reading Challenge",
        description: "Read Srila Prabhupada's books for at least 30 minutes daily",
        target: 30,
        duration: 30,
        startDate: "2025-01-01",
        endDate: "2025-01-31",
        isActive: true
      }
    ];

    this.challengesData.push(...challenges);
  }
}

export const storage = new DatabaseStorage();
