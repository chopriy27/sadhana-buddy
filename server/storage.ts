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
        translation: "One who is not disturbed by the incessant flow of desires that enter like rivers into the ocean, which is ever being filled but is always still, can alone achieve peace, and not the person who strives to satisfy such desires.",
        source: "Bhagavad Gita 2.70"
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
