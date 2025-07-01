import {
  users,
  sadhanaEntries,
  journalEntries,
  devotionalSongs,
  lectures,
  festivals,
  dailyVerses,
  userProgress,
  challenges,
  userChallenges,
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
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Sadhana Entries
  getSadhanaEntry(userId: number, date: string): Promise<SadhanaEntry | undefined>;
  getSadhanaEntries(userId: number, limit?: number): Promise<SadhanaEntry[]>;
  createSadhanaEntry(entry: InsertSadhanaEntry): Promise<SadhanaEntry>;
  updateSadhanaEntry(id: number, entry: Partial<InsertSadhanaEntry>): Promise<SadhanaEntry | undefined>;

  // Journal Entries
  getJournalEntries(userId: number, limit?: number): Promise<JournalEntry[]>;
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
  getUserProgress(userId: number): Promise<UserProgress | undefined>;
  updateUserProgress(userId: number, progress: Partial<InsertUserProgress>): Promise<UserProgress>;

  // Challenges
  getChallenges(): Promise<Challenge[]>;
  getActiveUserChallenges(userId: number): Promise<(UserChallenge & { challenge: Challenge })[]>;
  joinChallenge(userChallenge: InsertUserChallenge): Promise<UserChallenge>;
  updateChallengeProgress(id: number, progress: number): Promise<UserChallenge | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private sadhanaEntries: Map<number, SadhanaEntry>;
  private journalEntries: Map<number, JournalEntry>;
  private devotionalSongs: Map<number, DevotionalSong>;
  private lectures: Map<number, Lecture>;
  private festivals: Map<number, Festival>;
  private dailyVerses: Map<number, DailyVerse>;
  private userProgress: Map<number, UserProgress>;
  private challenges: Map<number, Challenge>;
  private userChallenges: Map<number, UserChallenge>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.sadhanaEntries = new Map();
    this.journalEntries = new Map();
    this.devotionalSongs = new Map();
    this.lectures = new Map();
    this.festivals = new Map();
    this.dailyVerses = new Map();
    this.userProgress = new Map();
    this.challenges = new Map();
    this.userChallenges = new Map();
    this.currentId = 1;
    this.seedData();
  }

  private seedData() {
    // Create default user
    const defaultUser: User = {
      id: 1,
      username: "devotee1",
      email: "devotee@example.com",
      password: "password123",
      createdAt: new Date(),
    };
    this.users.set(1, defaultUser);

    // Seed devotional songs
    const songs: DevotionalSong[] = [
      {
        id: 1,
        title: "Hare Krishna Mahamantra",
        author: "Traditional",
        category: "kirtan",
        mood: "devotional",
        lyrics: "Hare Krishna Hare Krishna Krishna Krishna Hare Hare\nHare Rama Hare Rama Rama Rama Hare Hare",
        audioUrl: "",
        createdAt: new Date(),
      },
      {
        id: 2,
        title: "Jaya Radha Madhava",
        author: "Srila Bhaktivinoda Thakura",
        category: "bhajan",
        mood: "meditative",
        lyrics: "Jaya radha-madhava kunja-bihari\ngopi-jana-vallabha giri-vara-dhari",
        audioUrl: "",
        createdAt: new Date(),
      },
      {
        id: 3,
        title: "Govinda Jaya Jaya",
        author: "Srila Jayadeva Goswami",
        category: "kirtan",
        mood: "joyful",
        lyrics: "Govinda jaya jaya\ngopala jaya jaya\nradha-ramana hari\ngovinda jaya jaya",
        audioUrl: "",
        createdAt: new Date(),
      },
    ];
    songs.forEach(song => this.devotionalSongs.set(song.id, song));

    // Seed lectures
    const lectures: Lecture[] = [
      {
        id: 1,
        title: "The Science of Self-Realization",
        speaker: "His Divine Grace A.C. Bhaktivedanta Swami Prabhupada",
        topic: "Self-Realization",
        duration: 45,
        videoUrl: "",
        description: "Understanding the eternal nature of the soul and its relationship with Krishna",
        createdAt: new Date(),
      },
      {
        id: 2,
        title: "Bhagavad Gita As It Is - Chapter 2",
        speaker: "His Holiness Radhanath Swami",
        topic: "Bhagavad Gita",
        duration: 60,
        videoUrl: "",
        description: "Contents of the Gita Summarized - The eternal soul and material nature",
        createdAt: new Date(),
      },
    ];
    lectures.forEach(lecture => this.lectures.set(lecture.id, lecture));

    // Seed festivals
    const festivals: Festival[] = [
      {
        id: 1,
        name: "Janmashtami",
        date: "2025-08-26",
        description: "Appearance day of Lord Krishna",
        significance: "Celebrates the divine appearance of Krishna",
        observances: ["Fasting until midnight", "Abhisheka ceremony", "Midnight celebration"],
      },
      {
        id: 2,
        name: "Radhastami",
        date: "2025-09-07",
        description: "Appearance day of Srimati Radharani",
        significance: "Celebrates the divine appearance of Radha",
        observances: ["Fasting until noon", "Special prayers", "Radha-Krishna worship"],
      },
    ];
    festivals.forEach(festival => this.festivals.set(festival.id, festival));

    // Seed daily verses
    const verses: DailyVerse[] = [
      {
        id: 1,
        verse: "One who is not disturbed by the incessant flow of desires that enter like rivers into the ocean, which is ever being filled but is always still, can alone achieve peace, and not the man who strives to satisfy such desires.",
        translation: "A person who is not disturbed by the incessant flow of desires can alone achieve peace.",
        source: "Bhagavad Gita 2.70",
        date: "2025-07-01",
      },
      {
        id: 2,
        verse: "For the soul there is neither birth nor death. It is not slain when the body is slain.",
        translation: "The soul is eternal and indestructible.",
        source: "Bhagavad Gita 2.20",
        date: "2025-07-02",
      },
    ];
    verses.forEach(verse => this.dailyVerses.set(verse.id, verse));

    // Seed challenges
    const challenges: Challenge[] = [
      {
        id: 1,
        title: "108 Rounds Challenge",
        description: "Chant 108 rounds in a week",
        type: "chanting",
        target: 108,
        duration: 7,
        startDate: "2025-07-01",
        endDate: "2025-07-07",
        isActive: true,
      },
      {
        id: 2,
        title: "Daily Reading Streak",
        description: "Read Bhagavad Gita daily for 30 days",
        type: "reading",
        target: 30,
        duration: 30,
        startDate: "2025-07-01",
        endDate: "2025-07-30",
        isActive: true,
      },
    ];
    challenges.forEach(challenge => this.challenges.set(challenge.id, challenge));

    this.currentId = 100; // Start new IDs from 100
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async getSadhanaEntry(userId: number, date: string): Promise<SadhanaEntry | undefined> {
    return Array.from(this.sadhanaEntries.values()).find(
      entry => entry.userId === userId && entry.date === date
    );
  }

  async getSadhanaEntries(userId: number, limit = 30): Promise<SadhanaEntry[]> {
    return Array.from(this.sadhanaEntries.values())
      .filter(entry => entry.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  async createSadhanaEntry(insertEntry: InsertSadhanaEntry): Promise<SadhanaEntry> {
    const id = this.currentId++;
    const entry: SadhanaEntry = { ...insertEntry, id, createdAt: new Date() };
    this.sadhanaEntries.set(id, entry);
    return entry;
  }

  async updateSadhanaEntry(id: number, updateData: Partial<InsertSadhanaEntry>): Promise<SadhanaEntry | undefined> {
    const entry = this.sadhanaEntries.get(id);
    if (!entry) return undefined;
    
    const updatedEntry = { ...entry, ...updateData };
    this.sadhanaEntries.set(id, updatedEntry);
    return updatedEntry;
  }

  async getJournalEntries(userId: number, limit = 20): Promise<JournalEntry[]> {
    return Array.from(this.journalEntries.values())
      .filter(entry => entry.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async createJournalEntry(insertEntry: InsertJournalEntry): Promise<JournalEntry> {
    const id = this.currentId++;
    const entry: JournalEntry = { ...insertEntry, id, createdAt: new Date() };
    this.journalEntries.set(id, entry);
    return entry;
  }

  async updateJournalEntry(id: number, updateData: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined> {
    const entry = this.journalEntries.get(id);
    if (!entry) return undefined;
    
    const updatedEntry = { ...entry, ...updateData };
    this.journalEntries.set(id, updatedEntry);
    return updatedEntry;
  }

  async deleteJournalEntry(id: number): Promise<boolean> {
    return this.journalEntries.delete(id);
  }

  async getDevotionalSongs(category?: string, mood?: string): Promise<DevotionalSong[]> {
    let songs = Array.from(this.devotionalSongs.values());
    
    if (category) {
      songs = songs.filter(song => song.category === category);
    }
    if (mood) {
      songs = songs.filter(song => song.mood === mood);
    }
    
    return songs.sort((a, b) => a.title.localeCompare(b.title));
  }

  async searchDevotionalSongs(query: string): Promise<DevotionalSong[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.devotionalSongs.values())
      .filter(song => 
        song.title.toLowerCase().includes(lowerQuery) ||
        song.author.toLowerCase().includes(lowerQuery) ||
        song.category.toLowerCase().includes(lowerQuery) ||
        song.mood.toLowerCase().includes(lowerQuery)
      );
  }

  async createDevotionalSong(insertSong: InsertDevotionalSong): Promise<DevotionalSong> {
    const id = this.currentId++;
    const song: DevotionalSong = { ...insertSong, id, createdAt: new Date() };
    this.devotionalSongs.set(id, song);
    return song;
  }

  async getLectures(speaker?: string, topic?: string): Promise<Lecture[]> {
    let lectures = Array.from(this.lectures.values());
    
    if (speaker) {
      lectures = lectures.filter(lecture => lecture.speaker.toLowerCase().includes(speaker.toLowerCase()));
    }
    if (topic) {
      lectures = lectures.filter(lecture => lecture.topic.toLowerCase().includes(topic.toLowerCase()));
    }
    
    return lectures.sort((a, b) => a.title.localeCompare(b.title));
  }

  async searchLectures(query: string): Promise<Lecture[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.lectures.values())
      .filter(lecture => 
        lecture.title.toLowerCase().includes(lowerQuery) ||
        lecture.speaker.toLowerCase().includes(lowerQuery) ||
        lecture.topic.toLowerCase().includes(lowerQuery) ||
        (lecture.description && lecture.description.toLowerCase().includes(lowerQuery))
      );
  }

  async createLecture(insertLecture: InsertLecture): Promise<Lecture> {
    const id = this.currentId++;
    const lecture: Lecture = { ...insertLecture, id, createdAt: new Date() };
    this.lectures.set(id, lecture);
    return lecture;
  }

  async getFestivals(): Promise<Festival[]> {
    return Array.from(this.festivals.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async getUpcomingFestivals(limit = 5): Promise<Festival[]> {
    const today = new Date().toISOString().split('T')[0];
    return Array.from(this.festivals.values())
      .filter(festival => festival.date >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, limit);
  }

  async createFestival(insertFestival: InsertFestival): Promise<Festival> {
    const id = this.currentId++;
    const festival: Festival = { ...insertFestival, id };
    this.festivals.set(id, festival);
    return festival;
  }

  async getDailyVerse(date: string): Promise<DailyVerse | undefined> {
    return Array.from(this.dailyVerses.values()).find(verse => verse.date === date);
  }

  async getTodaysVerse(): Promise<DailyVerse | undefined> {
    const today = new Date().toISOString().split('T')[0];
    return this.getDailyVerse(today);
  }

  async createDailyVerse(insertVerse: InsertDailyVerse): Promise<DailyVerse> {
    const id = this.currentId++;
    const verse: DailyVerse = { ...insertVerse, id };
    this.dailyVerses.set(id, verse);
    return verse;
  }

  async getUserProgress(userId: number): Promise<UserProgress | undefined> {
    return Array.from(this.userProgress.values()).find(progress => progress.userId === userId);
  }

  async updateUserProgress(userId: number, updateData: Partial<InsertUserProgress>): Promise<UserProgress> {
    const existing = await this.getUserProgress(userId);
    
    if (existing) {
      const updated = { ...existing, ...updateData, updatedAt: new Date() };
      this.userProgress.set(existing.id, updated);
      return updated;
    } else {
      const id = this.currentId++;
      const progress: UserProgress = {
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
      this.userProgress.set(id, progress);
      return progress;
    }
  }

  async getChallenges(): Promise<Challenge[]> {
    return Array.from(this.challenges.values())
      .filter(challenge => challenge.isActive)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }

  async getActiveUserChallenges(userId: number): Promise<(UserChallenge & { challenge: Challenge })[]> {
    const userChallenges = Array.from(this.userChallenges.values())
      .filter(uc => uc.userId === userId && !uc.completed);
    
    return userChallenges.map(uc => {
      const challenge = this.challenges.get(uc.challengeId);
      return { ...uc, challenge: challenge! };
    });
  }

  async joinChallenge(insertUserChallenge: InsertUserChallenge): Promise<UserChallenge> {
    const id = this.currentId++;
    const userChallenge: UserChallenge = { ...insertUserChallenge, id, joinedAt: new Date() };
    this.userChallenges.set(id, userChallenge);
    return userChallenge;
  }

  async updateChallengeProgress(id: number, progress: number): Promise<UserChallenge | undefined> {
    const userChallenge = this.userChallenges.get(id);
    if (!userChallenge) return undefined;
    
    const challenge = this.challenges.get(userChallenge.challengeId);
    const completed = challenge ? progress >= challenge.target : false;
    
    const updated = { ...userChallenge, progress, completed };
    this.userChallenges.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
