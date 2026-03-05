import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import path from "path";
import fs from "fs";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const dbPath = process.env.VERCEL ? "/tmp/gigmaster.db" : "gigmaster.db";
const db = new Database(dbPath);
const JWT_SECRET = process.env.JWT_SECRET || "gigmaster-secret-key-123";

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firebase_uid TEXT UNIQUE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    role TEXT DEFAULT 'buyer',
    avatar TEXT,
    bio TEXT,
    skills TEXT,
    portfolio_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS gigs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    seller_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    price_basic REAL NOT NULL,
    price_standard REAL,
    price_premium REAL,
    delivery_basic INTEGER NOT NULL,
    image_url TEXT,
    rating REAL DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'published',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gig_id INTEGER NOT NULL,
    buyer_id INTEGER NOT NULL,
    seller_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    amount REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (gig_id) REFERENCES gigs(id),
    FOREIGN KEY (buyer_id) REFERENCES users(id),
    FOREIGN KEY (seller_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id)
  );
`);

// Database Migrations
try {
  const columns = db.prepare("PRAGMA table_info(users)").all() as any[];
  console.log("Current users table columns:", columns.map(c => c.name).join(", "));
  const hasFirebaseUid = columns.some(c => c.name === 'firebase_uid');
  if (!hasFirebaseUid) {
    db.exec("ALTER TABLE users ADD COLUMN firebase_uid TEXT UNIQUE");
    console.log("Added firebase_uid column to users table");
  }
} catch (e) {
  console.error("Migration error (firebase_uid):", e);
}
try {
  const columns = db.prepare("PRAGMA table_info(users)").all() as any[];
  const hasSkills = columns.some(c => c.name === 'skills');
  if (!hasSkills) {
    db.exec("ALTER TABLE users ADD COLUMN skills TEXT");
  }
} catch (e) {}
try {
  const columns = db.prepare("PRAGMA table_info(users)").all() as any[];
  const hasPortfolio = columns.some(c => c.name === 'portfolio_url');
  if (!hasPortfolio) {
    db.exec("ALTER TABLE users ADD COLUMN portfolio_url TEXT");
  }
} catch (e) {}
try {
  db.exec("ALTER TABLE gigs ADD COLUMN status TEXT DEFAULT 'published'");
} catch (e) {}
try {
  db.exec("ALTER TABLE gigs ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP");
} catch (e) {}

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const PORT = 3000;

(async () => {
  app.use(express.json());

// --- Auth API ---
  app.get("/api/auth/profile/:uid", (req, res) => {
    try {
      const { uid } = req.params;
      console.log(`Fetching profile for UID: ${uid}`);
      const user = db.prepare("SELECT * FROM users WHERE firebase_uid = ?").get(uid) as any;
      if (user) {
        res.json(user);
      } else {
        console.log(`User not found for UID: ${uid}`);
        res.status(404).json({ error: "User not found" });
      }
    } catch (error: any) {
      console.error("Error in /api/auth/profile/:uid:", error);
      res.status(500).json({ error: "Internal server error", details: error.message });
    }
  });

  app.post("/api/auth/signup", async (req, res) => {
    const { name, email, role, bio, skills, portfolio_url, firebase_uid } = req.body;
    console.log(`Signup attempt for email: ${email}, UID: ${firebase_uid}`);
    try {
      const result = db.prepare("INSERT INTO users (name, email, role, bio, skills, portfolio_url, firebase_uid) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
        name, 
        email, 
        role || 'buyer',
        bio || null,
        skills || null,
        portfolio_url || null,
        firebase_uid
      );
      const token = jwt.sign({ id: result.lastInsertRowid, email, role }, JWT_SECRET);
      res.json({ 
        token, 
        user: { 
          id: result.lastInsertRowid, 
          firebase_uid,
          name, 
          email, 
          role,
          bio: bio || null,
          skills: skills || null,
          portfolio_url: portfolio_url || null
        } 
      });
    } catch (error: any) {
      console.error("Error in /api/auth/signup:", error);
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        bio: user.bio,
        skills: user.skills,
        portfolio_url: user.portfolio_url
      } 
    });
  });

  app.get("/api/users/:id", (req, res) => {
    const user = db.prepare("SELECT id, name, email, role, avatar, bio, skills, portfolio_url, created_at FROM users WHERE id = ?").get(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  });

  // --- Gigs API ---
  app.get("/api/gigs/recommendations", (req, res) => {
    // Simple "AI" recommendation: return top rated gigs
    const gigs = db.prepare("SELECT gigs.*, users.name as seller_name FROM gigs JOIN users ON gigs.seller_id = users.id ORDER BY rating DESC LIMIT 5").all();
    res.json(gigs);
  });

  app.get("/api/gigs", (req, res) => {
    const { category, search } = req.query;
    let query = "SELECT gigs.*, users.name as seller_name, users.avatar as seller_avatar FROM gigs JOIN users ON gigs.seller_id = users.id WHERE status = 'published'";
    const params = [];
    if (category) {
      query += " AND category = ?";
      params.push(category);
    }
    if (search) {
      query += " AND title LIKE ?";
      params.push(`%${search}%`);
    }
    query += " ORDER BY created_at DESC";
    const gigs = db.prepare(query).all(...params);
    res.json(gigs);
  });

  app.get("/api/gigs/:id", (req, res) => {
    const gig = db.prepare("SELECT gigs.*, users.name as seller_name, users.avatar as seller_avatar, users.bio as seller_bio FROM gigs JOIN users ON gigs.seller_id = users.id WHERE gigs.id = ?").get(req.params.id);
    res.json(gig);
  });

  app.post("/api/gigs", (req, res) => {
    const { seller_id, title, description, category, price_basic, price_standard, price_premium, delivery_basic, image_url } = req.body;
    const result = db.prepare(`
      INSERT INTO gigs (seller_id, title, description, category, price_basic, price_standard, price_premium, delivery_basic, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(seller_id, title, description, category, price_basic, price_standard, price_premium, delivery_basic, image_url);
    res.json({ id: result.lastInsertRowid });
  });

  // --- Orders API ---
  app.post("/api/orders", (req, res) => {
    const { gig_id, buyer_id, seller_id, amount } = req.body;
    const commission = amount * 0.20; // 20% commission
    const seller_payout = amount - commission;
    
    const result = db.prepare("INSERT INTO orders (gig_id, buyer_id, seller_id, amount, status) VALUES (?, ?, ?, ?, ?)").run(gig_id, buyer_id, seller_id, amount, 'pending');
    res.json({ id: result.lastInsertRowid, commission, seller_payout });
  });

  app.get("/api/orders/buyer/:id", (req, res) => {
    const orders = db.prepare("SELECT orders.*, gigs.title as gig_title, users.name as seller_name FROM orders JOIN gigs ON orders.gig_id = gigs.id JOIN users ON orders.seller_id = users.id WHERE buyer_id = ?").all(req.params.id);
    res.json(orders);
  });

  app.get("/api/orders/seller/:id", (req, res) => {
    const orders = db.prepare("SELECT orders.*, gigs.title as gig_title, users.name as buyer_name FROM orders JOIN gigs ON orders.gig_id = gigs.id JOIN users ON orders.buyer_id = users.id WHERE orders.seller_id = ?").all(req.params.id);
    res.json(orders);
  });

  // --- Messages API ---
  app.get("/api/conversations/:userId", (req, res) => {
    const { userId } = req.params;
    const conversations = db.prepare(`
      SELECT DISTINCT 
        CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END as other_user_id,
        users.name as other_user_name,
        users.avatar as other_user_avatar,
        (SELECT content FROM messages WHERE (sender_id = ? AND receiver_id = users.id) OR (sender_id = users.id AND receiver_id = ?) ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages WHERE (sender_id = ? AND receiver_id = users.id) OR (sender_id = users.id AND receiver_id = ?) ORDER BY created_at DESC LIMIT 1) as last_message_time
      FROM messages 
      JOIN users ON users.id = (CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END)
      WHERE sender_id = ? OR receiver_id = ?
      ORDER BY last_message_time DESC
    `).all(userId, userId, userId, userId, userId, userId, userId, userId);
    res.json(conversations);
  });

  app.get("/api/messages/:userId/:otherId", (req, res) => {
    const { userId, otherId } = req.params;
    const messages = db.prepare(`
      SELECT * FROM messages 
      WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
      ORDER BY created_at ASC
    `).all(userId, otherId, otherId, userId);
    res.json(messages);
  });

  // --- WebSockets ---
  const clients = new Map<number, any>();

  wss.on("connection", (ws) => {
    let currentUserId: number | null = null;

    ws.on("message", (data) => {
      const message = JSON.parse(data.toString());
      
      if (message.type === "auth") {
        currentUserId = message.userId;
        clients.set(currentUserId!, ws);
      }

      if (message.type === "chat") {
        const { sender_id, receiver_id, content } = message;
        db.prepare("INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)").run(sender_id, receiver_id, content);
        
        // Send to receiver if online
        const receiverWs = clients.get(receiver_id);
        if (receiverWs && receiverWs.readyState === ws.OPEN) {
          receiverWs.send(JSON.stringify(message));
        }
        
        // Send back to sender for confirmation (optional, but good for sync)
        ws.send(JSON.stringify(message));
      }
    });

    ws.on("close", () => {
      if (currentUserId) {
        clients.delete(currentUserId);
      }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
})();

export { app, server };
