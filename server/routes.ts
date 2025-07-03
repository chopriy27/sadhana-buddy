import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertSadhanaEntrySchema,
  insertJournalEntrySchema,
  insertUserChallengeSchema,
  insertFavoriteSongSchema,
  insertUserGoalsSchema,
} from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Profile picture upload endpoint
  app.post('/api/upload/profile-picture', isAuthenticated, upload.single('profilePicture'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const userId = req.user.claims.sub;
      
      // Convert buffer to base64 for storage
      const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      
      // Update user profile with new image URL
      await storage.updateUserProfilePicture(userId, base64Image);
      
      res.json({ 
        message: "Profile picture uploaded successfully",
        profileImageUrl: base64Image 
      });
      
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      res.status(500).json({ message: "Failed to upload profile picture" });
    }
  });
  
  // Sadhana endpoints
  app.get("/api/sadhana/:userId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entries = await storage.getSadhanaEntries(userId, 30);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sadhana entries" });
    }
  });

  app.get("/api/sadhana/:userId/today", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const today = new Date().toISOString().split('T')[0];
      const entry = await storage.getSadhanaEntry(userId, today);
      res.json(entry || null);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch today's sadhana entry" });
    }
  });

  app.post("/api/sadhana", async (req, res) => {
    try {
      const validatedData = insertSadhanaEntrySchema.parse(req.body);
      const entry = await storage.createSadhanaEntry(validatedData);
      res.json(entry);
    } catch (error) {
      res.status(400).json({ message: "Invalid sadhana entry data" });
    }
  });

  app.put("/api/sadhana/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertSadhanaEntrySchema.partial().parse(req.body);
      const entry = await storage.updateSadhanaEntry(id, validatedData);
      if (!entry) {
        return res.status(404).json({ message: "Sadhana entry not found" });
      }
      res.json(entry);
    } catch (error) {
      res.status(400).json({ message: "Invalid sadhana entry data" });
    }
  });

  // Journal endpoints
  app.get("/api/journal/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const entries = await storage.getJournalEntries(userId, 20);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch journal entries" });
    }
  });

  app.post("/api/journal", async (req, res) => {
    try {
      const validatedData = insertJournalEntrySchema.parse(req.body);
      const entry = await storage.createJournalEntry(validatedData);
      res.json(entry);
    } catch (error) {
      res.status(400).json({ message: "Invalid journal entry data" });
    }
  });

  app.put("/api/journal/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertJournalEntrySchema.partial().parse(req.body);
      const entry = await storage.updateJournalEntry(id, validatedData);
      if (!entry) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      res.json(entry);
    } catch (error) {
      res.status(400).json({ message: "Invalid journal entry data" });
    }
  });

  app.delete("/api/journal/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteJournalEntry(id);
      if (!deleted) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      res.json({ message: "Journal entry deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete journal entry" });
    }
  });

  // Devotional songs endpoints
  app.get("/api/songs", async (req, res) => {
    try {
      const { category, mood, search } = req.query;
      
      let songs;
      if (search) {
        songs = await storage.searchDevotionalSongs(search as string);
      } else {
        songs = await storage.getDevotionalSongs(
          category as string, 
          mood as string
        );
      }
      res.json(songs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch devotional songs" });
    }
  });

  // Lectures endpoints
  app.get("/api/lectures", async (req, res) => {
    try {
      const { speaker, topic, search } = req.query;
      
      let lectures;
      if (search) {
        lectures = await storage.searchLectures(search as string);
      } else {
        lectures = await storage.getLectures(
          speaker as string, 
          topic as string
        );
      }
      res.json(lectures);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lectures" });
    }
  });

  app.get("/api/lectures/prabhupada", async (req, res) => {
    try {
      const lectures = await storage.getLectures("A.C. Bhaktivedanta Swami Prabhupada");
      res.json(lectures);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Prabhupada's lectures" });
    }
  });

  // Festivals endpoints
  app.get("/api/festivals", async (req, res) => {
    try {
      const festivals = await storage.getFestivals();
      res.json(festivals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch festivals" });
    }
  });

  app.get("/api/festivals/upcoming", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const festivals = await storage.getUpcomingFestivals(limit);
      res.json(festivals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch upcoming festivals" });
    }
  });

  // Daily verse endpoints
  app.get("/api/verse/today", async (req, res) => {
    try {
      const verse = await storage.getTodaysVerse();
      res.json(verse || null);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch today's verse" });
    }
  });

  app.get("/api/verse/:date", async (req, res) => {
    try {
      const date = req.params.date;
      const verse = await storage.getDailyVerse(date);
      res.json(verse || null);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch verse for date" });
    }
  });

  // User progress endpoints
  app.get("/api/progress/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const progress = await storage.getUserProgress(userId);
      res.json(progress || null);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user progress" });
    }
  });

  app.put("/api/progress/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const progress = await storage.updateUserProgress(userId, req.body);
      res.json(progress);
    } catch (error) {
      res.status(400).json({ message: "Failed to update user progress" });
    }
  });

  // Challenges endpoints
  app.get("/api/challenges", async (req, res) => {
    try {
      const challenges = await storage.getChallenges();
      res.json(challenges);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch challenges" });
    }
  });

  app.get("/api/challenges/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const userChallenges = await storage.getActiveUserChallenges(userId);
      res.json(userChallenges);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user challenges" });
    }
  });

  app.post("/api/challenges/join", async (req, res) => {
    try {
      const validatedData = insertUserChallengeSchema.parse(req.body);
      const userChallenge = await storage.joinChallenge(validatedData);
      res.json(userChallenge);
    } catch (error) {
      res.status(400).json({ message: "Failed to join challenge" });
    }
  });

  app.put("/api/challenges/progress/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { progress } = req.body;
      const userChallenge = await storage.updateChallengeProgress(id, progress);
      if (!userChallenge) {
        return res.status(404).json({ message: "User challenge not found" });
      }
      res.json(userChallenge);
    } catch (error) {
      res.status(400).json({ message: "Failed to update challenge progress" });
    }
  });

  // Favorite Songs endpoints
  app.get("/api/favorites/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const favorites = await storage.getFavoriteSongs(userId);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch favorite songs" });
    }
  });

  app.post("/api/favorites", async (req, res) => {
    try {
      const validatedData = insertFavoriteSongSchema.parse(req.body);
      const favorite = await storage.addFavoriteSong(validatedData);
      res.json(favorite);
    } catch (error) {
      res.status(400).json({ message: "Failed to add favorite song" });
    }
  });

  app.delete("/api/favorites/:userId/:songId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const songId = parseInt(req.params.songId);
      const removed = await storage.removeFavoriteSong(userId, songId);
      if (!removed) {
        return res.status(404).json({ message: "Favorite not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Failed to remove favorite song" });
    }
  });

  app.get("/api/favorites/:userId/:songId/check", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const songId = parseInt(req.params.songId);
      const isFavorited = await storage.isSongFavorited(userId, songId);
      res.json({ isFavorited });
    } catch (error) {
      res.status(500).json({ message: "Failed to check favorite status" });
    }
  });

  // User Goals routes
  app.get("/api/goals/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const goals = await storage.getUserGoals(userId);
      res.json(goals);
    } catch (error) {
      console.error("Error fetching user goals:", error);
      res.status(500).json({ message: "Failed to fetch user goals" });
    }
  });

  app.post("/api/goals", async (req, res) => {
    try {
      const validatedData = insertUserGoalsSchema.parse(req.body);
      const userId = validatedData.userId;
      
      // Check if user goals already exist
      const existingGoals = await storage.getUserGoals(userId);
      
      let goals;
      if (existingGoals) {
        // Update existing goals
        goals = await storage.updateUserGoals(userId, validatedData);
      } else {
        // Create new goals
        goals = await storage.createUserGoals(validatedData);
      }
      
      res.json(goals);
    } catch (error) {
      console.error("Error creating/updating user goals:", error);
      res.status(500).json({ message: "Failed to save user goals" });
    }
  });

  app.put("/api/goals/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const updateData = req.body;
      const goals = await storage.updateUserGoals(userId, updateData);
      res.json(goals);
    } catch (error) {
      console.error("Error updating user goals:", error);
      res.status(500).json({ message: "Failed to update user goals" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
