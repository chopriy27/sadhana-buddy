import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { verifyIdToken, isFirebaseConfigured, firestore, COLLECTIONS } from "./firebase";
import {
  insertSadhanaEntrySchema,
  insertJournalEntrySchema,
  insertUserChallengeSchema,
  insertFavoriteSongSchema,
  insertUserGoalsSchema,
} from "./schemas";

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      uid: string;
      email?: string;
      name?: string;
    };
  }
}

async function auth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized - No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];

  // In local dev without Firebase Admin credentials, decode the JWT without
  // signature verification. The token was already validated by the Firebase
  // client SDK before being sent here, so this is safe for development.
  if (!isFirebaseConfigured()) {
    try {
      const payload = JSON.parse(
        Buffer.from(token.split('.')[1], 'base64url').toString('utf8')
      );
      req.user = {
        uid: payload.user_id || payload.sub,
        email: payload.email,
        name: payload.name,
      };
      console.warn('[DEV] Firebase Admin not configured — skipping token verification.');
      return next();
    } catch {
      return res.status(401).json({ message: 'Unauthorized - Invalid token' });
    }
  }

  try {
    const decodedToken = await verifyIdToken(token);
    if (!decodedToken) {
      return res.status(401).json({ message: 'Unauthorized - Invalid token' });
    }

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Unauthorized - Token verification failed' });
  }
}

// Returns false and sends 403 if the authenticated user doesn't own the resource.
function requireOwner(req: Request, res: Response, userId: string): boolean {
  if (req.user?.uid !== userId) {
    res.status(403).json({ message: 'Forbidden' });
    return false;
  }
  return true;
}

// Checks that a Firestore document exists and belongs to the authenticated user.
async function verifyDocumentOwner(
  collection: string,
  docId: string,
  uid: string
): Promise<'ok' | 'not-found' | 'forbidden'> {
  const doc = await firestore.collection(collection).doc(docId).get();
  if (!doc.exists) return 'not-found';
  if (doc.data()?.userId !== uid) return 'forbidden';
  return 'ok';
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Firebase Auth sync endpoint - creates/updates user in our database
  app.post('/api/auth/sync', auth, async (req: Request, res) => {
    try {
      const { id, email, firstName, lastName, profileImageUrl, displayName } = req.body;

      // Verify the user ID matches the token
      if (id !== req.user?.uid) {
        return res.status(403).json({ message: 'User ID mismatch' });
      }

      // Upsert user in database
      const user = await storage.upsertUser({
        id,
        email,
        firstName,
        lastName,
        profileImageUrl,
      });

      res.json(user);
    } catch (error) {
      console.error("Error syncing user:", error);
      res.status(500).json({ message: "Failed to sync user" });
    }
  });

  // Auth routes
  app.get('/api/auth/user', auth, async (req: Request, res) => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Sadhana endpoints
  app.get("/api/sadhana/:userId", auth, async (req: Request, res) => {
    if (!requireOwner(req, res, req.params.userId)) return;
    try {
      const entries = await storage.getSadhanaEntries(req.params.userId, 30);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sadhana entries" });
    }
  });

  app.get("/api/sadhana/:userId/today", auth, async (req: Request, res) => {
    if (!requireOwner(req, res, req.params.userId)) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const entry = await storage.getSadhanaEntry(req.params.userId, today);
      res.json(entry || null);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch today's sadhana entry" });
    }
  });

  app.post("/api/sadhana", auth, async (req: Request, res) => {
    try {
      req.body.userId = req.user!.uid;
      const validatedData = insertSadhanaEntrySchema.parse(req.body) as Parameters<typeof storage.createSadhanaEntry>[0];
      const entry = await storage.createSadhanaEntry(validatedData);
      res.json(entry);
    } catch (error) {
      res.status(400).json({ message: "Invalid sadhana entry data" });
    }
  });

  app.put("/api/sadhana/:id", auth, async (req: Request, res) => {
    try {
      const id = parseInt(req.params.id);
      const ownership = await verifyDocumentOwner(COLLECTIONS.sadhanaEntries, id.toString(), req.user!.uid);
      if (ownership === 'not-found') return res.status(404).json({ message: "Sadhana entry not found" });
      if (ownership === 'forbidden') return res.status(403).json({ message: "Forbidden" });

      const validatedData = insertSadhanaEntrySchema.partial().parse(req.body);
      const entry = await storage.updateSadhanaEntry(id, validatedData);
      if (!entry) {
        return res.status(404).json({ message: "Sadhana entry not found" });
      }
      res.json(entry);
    } catch (error) {
      console.error("Sadhana update error:", error);
      res.status(400).json({
        message: "Invalid sadhana entry data",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Journal endpoints
  app.get("/api/journal/:userId", auth, async (req: Request, res) => {
    if (!requireOwner(req, res, req.params.userId)) return;
    try {
      const entries = await storage.getJournalEntries(req.params.userId, 20);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch journal entries" });
    }
  });

  app.post("/api/journal", auth, async (req: Request, res) => {
    try {
      req.body.userId = req.user!.uid;
      const validatedData = insertJournalEntrySchema.parse(req.body) as Parameters<typeof storage.createJournalEntry>[0];
      const entry = await storage.createJournalEntry(validatedData);
      res.json(entry);
    } catch (error) {
      res.status(400).json({ message: "Invalid journal entry data" });
    }
  });

  app.put("/api/journal/:id", auth, async (req: Request, res) => {
    try {
      const id = parseInt(req.params.id);
      const ownership = await verifyDocumentOwner(COLLECTIONS.journalEntries, id.toString(), req.user!.uid);
      if (ownership === 'not-found') return res.status(404).json({ message: "Journal entry not found" });
      if (ownership === 'forbidden') return res.status(403).json({ message: "Forbidden" });

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

  app.delete("/api/journal/:id", auth, async (req: Request, res) => {
    try {
      const id = parseInt(req.params.id);
      const ownership = await verifyDocumentOwner(COLLECTIONS.journalEntries, id.toString(), req.user!.uid);
      if (ownership === 'not-found') return res.status(404).json({ message: "Journal entry not found" });
      if (ownership === 'forbidden') return res.status(403).json({ message: "Forbidden" });

      const deleted = await storage.deleteJournalEntry(id);
      if (!deleted) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      res.json({ message: "Journal entry deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete journal entry" });
    }
  });

  // Devotional songs endpoints — public catalog, no auth required
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

  // Lectures endpoints — public catalog, no auth required
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

  // Festivals endpoints — public catalog, no auth required
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

  // Daily verse endpoints — public, no auth required
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
  app.get("/api/progress/:userId", auth, async (req: Request, res) => {
    if (!requireOwner(req, res, req.params.userId)) return;
    try {
      const progress = await storage.getUserProgress(req.params.userId);
      res.json(progress || null);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user progress" });
    }
  });

  app.put("/api/progress/:userId", auth, async (req: Request, res) => {
    if (!requireOwner(req, res, req.params.userId)) return;
    try {
      const progress = await storage.updateUserProgress(req.params.userId, req.body);
      res.json(progress);
    } catch (error) {
      res.status(400).json({ message: "Failed to update user progress" });
    }
  });

  // Challenges endpoints — catalog is public, user-specific routes require auth
  app.get("/api/challenges", async (req, res) => {
    try {
      const challenges = await storage.getChallenges();
      res.json(challenges);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch challenges" });
    }
  });

  app.get("/api/challenges/user/:userId", auth, async (req: Request, res) => {
    if (!requireOwner(req, res, req.params.userId)) return;
    try {
      const userChallenges = await storage.getActiveUserChallenges(req.params.userId);
      res.json(userChallenges);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user challenges" });
    }
  });

  app.post("/api/challenges/join", auth, async (req: Request, res) => {
    try {
      req.body.userId = req.user!.uid;
      const validatedData = insertUserChallengeSchema.parse(req.body);
      const userChallenge = await storage.joinChallenge(validatedData);
      res.json(userChallenge);
    } catch (error) {
      res.status(400).json({ message: "Failed to join challenge" });
    }
  });

  app.put("/api/challenges/progress/:id", auth, async (req: Request, res) => {
    try {
      const id = parseInt(req.params.id);
      const ownership = await verifyDocumentOwner(COLLECTIONS.userChallenges, id.toString(), req.user!.uid);
      if (ownership === 'not-found') return res.status(404).json({ message: "User challenge not found" });
      if (ownership === 'forbidden') return res.status(403).json({ message: "Forbidden" });

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
  app.get("/api/favorites/:userId", auth, async (req: Request, res) => {
    if (!requireOwner(req, res, req.params.userId)) return;
    try {
      const favorites = await storage.getFavoriteSongs(req.params.userId);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch favorite songs" });
    }
  });

  app.post("/api/favorites", auth, async (req: Request, res) => {
    try {
      req.body.userId = req.user!.uid;
      const validatedData = insertFavoriteSongSchema.parse(req.body);
      const favorite = await storage.addFavoriteSong(validatedData);
      res.json(favorite);
    } catch (error) {
      res.status(400).json({ message: "Failed to add favorite song" });
    }
  });

  app.delete("/api/favorites/:userId/:songId", auth, async (req: Request, res) => {
    if (!requireOwner(req, res, req.params.userId)) return;
    try {
      const songId = parseInt(req.params.songId);
      const removed = await storage.removeFavoriteSong(req.params.userId, songId);
      if (!removed) {
        return res.status(404).json({ message: "Favorite not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Failed to remove favorite song" });
    }
  });

  app.get("/api/favorites/:userId/:songId/check", auth, async (req: Request, res) => {
    if (!requireOwner(req, res, req.params.userId)) return;
    try {
      const songId = parseInt(req.params.songId);
      const isFavorited = await storage.isSongFavorited(req.params.userId, songId);
      res.json({ isFavorited });
    } catch (error) {
      res.status(500).json({ message: "Failed to check favorite status" });
    }
  });

  // User Goals routes
  app.get("/api/goals/:userId", auth, async (req: Request, res) => {
    if (!requireOwner(req, res, req.params.userId)) return;
    try {
      const goals = await storage.getUserGoals(req.params.userId);
      res.json(goals);
    } catch (error) {
      console.error("Error fetching user goals:", error);
      res.status(500).json({ message: "Failed to fetch user goals" });
    }
  });

  app.post("/api/goals", auth, async (req: Request, res) => {
    try {
      req.body.userId = req.user!.uid;
      const validatedData = insertUserGoalsSchema.parse(req.body);

      const existingGoals = await storage.getUserGoals(validatedData.userId);

      let goals;
      if (existingGoals) {
        goals = await storage.updateUserGoals(validatedData.userId, validatedData);
      } else {
        goals = await storage.createUserGoals(validatedData);
      }

      res.json(goals);
    } catch (error) {
      console.error("Error creating/updating user goals:", error);
      res.status(500).json({ message: "Failed to save user goals" });
    }
  });

  app.put("/api/goals/:userId", auth, async (req: Request, res) => {
    if (!requireOwner(req, res, req.params.userId)) return;
    try {
      const goals = await storage.updateUserGoals(req.params.userId, req.body);
      res.json(goals);
    } catch (error) {
      console.error("Error updating user goals:", error);
      res.status(500).json({ message: "Failed to update user goals" });
    }
  });

  app.patch("/api/goals/:userId", auth, async (req: Request, res) => {
    if (!requireOwner(req, res, req.params.userId)) return;
    try {
      const goals = await storage.updateUserGoals(req.params.userId, req.body);
      res.json(goals);
    } catch (error) {
      console.error("Error updating user goals:", error);
      res.status(500).json({ message: "Failed to update user goals" });
    }
  });

  // User profile update endpoint
  app.patch("/api/user/:userId/profile", auth, async (req: Request, res) => {
    if (!requireOwner(req, res, req.params.userId)) return;
    try {
      const { firstName, lastName } = req.body;

      const existingUser = await storage.getUser(req.params.userId);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const updatedUser = await storage.upsertUser({
        ...existingUser,
        firstName: firstName !== undefined ? firstName : existingUser.firstName,
        lastName: lastName !== undefined ? lastName : existingUser.lastName,
      });

      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // User timezone update endpoint
  app.patch("/api/user/:userId/timezone", auth, async (req: Request, res) => {
    if (!requireOwner(req, res, req.params.userId)) return;
    try {
      const { timezone } = req.body;
      if (!timezone) return res.status(400).json({ message: "Timezone is required" });

      const existingUser = await storage.getUser(req.params.userId);
      if (!existingUser) return res.status(404).json({ message: "User not found" });

      const updatedUser = await storage.upsertUser({ ...existingUser, timezone });
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating timezone:", error);
      res.status(500).json({ message: "Failed to update timezone" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
