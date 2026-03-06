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

console.log("Starting server script...");
console.log("Environment:", {
  NODE_ENV: process.env.NODE_ENV,
  VERCEL: process.env.VERCEL,
  PORT: 3000
});

// Use /tmp for database if possible, as it's usually writable in container environments
const dbPath = process.env.DB_PATH || (process.env.VERCEL || fs.existsSync('/tmp') ? "/tmp/gigmaster.db" : "gigmaster.db");
console.log("Using database path:", dbPath);

const JWT_SECRET = process.env.JWT_SECRET || "gigmaster-secret-key-123";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const PORT = 3000;

// Basic middleware that doesn't depend on DB
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check - move outside IIFE to ensure it's available early
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString(), env: process.env.NODE_ENV });
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

(async () => {
  console.log("Entering async IIFE...");
  let db: any;
  try {
    db = new Database(dbPath);
    console.log("Database initialized successfully");
  } catch (err) {
    console.error("FAILED TO INITIALIZE DATABASE:", err);
    // Try one more time with a local path if /tmp failed, or vice versa
    try {
      const fallbackPath = dbPath.includes('/tmp') ? "gigmaster.db" : "/tmp/gigmaster.db";
      console.log("Attempting fallback database path:", fallbackPath);
      db = new Database(fallbackPath);
      console.log("Fallback database initialized successfully");
    } catch (fallbackErr) {
      console.error("CRITICAL: All database initialization attempts failed.");
      // Don't exit yet, let the health check stay alive if possible
    }
  }

  if (db) {
    // Initialize Database Tables
    try {
      db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT,
          role TEXT DEFAULT 'buyer',
          avatar TEXT,
          bio TEXT,
          skills TEXT,
          experience TEXT,
          portfolio_url TEXT,
          referral_code TEXT UNIQUE,
          referred_by INTEGER,
          balance REAL DEFAULT 0,
          is_premium INTEGER DEFAULT 0,
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

        CREATE TABLE IF NOT EXISTS withdrawals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          amount REAL NOT NULL,
          status TEXT DEFAULT 'pending',
          processing_days INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        );
      `);
      console.log("Database tables initialized");
    } catch (err) {
      console.error("FAILED TO CREATE TABLES:", err);
    }

    // Database Migrations
    const migrateColumn = (tableName: string, columnName: string, columnDef: string) => {
      try {
        const columns = db.prepare(`PRAGMA table_info(${tableName})`).all() as any[];
        const hasColumn = columns.some(c => c.name === columnName);
        if (!hasColumn) {
          console.log(`Migrating: Adding ${columnName} to ${tableName}`);
          db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDef}`);
        }
      } catch (err) {
        console.error(`Migration error adding ${columnName} to ${tableName}:`, err);
      }
    };

    migrateColumn('users', 'skills', 'TEXT');
    migrateColumn('users', 'portfolio_url', 'TEXT');
    migrateColumn('users', 'experience', 'TEXT');
    migrateColumn('users', 'referral_code', 'TEXT');
    migrateColumn('users', 'referred_by', 'INTEGER');
    migrateColumn('users', 'balance', 'REAL DEFAULT 0');
    migrateColumn('users', 'is_premium', 'INTEGER DEFAULT 0');

    // Add unique index for referral_code if it doesn't exist
    try {
      db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code)");
    } catch (e) {
      console.log("Referral code index might already exist or table is empty");
    }

    try {
      const columns = db.prepare("PRAGMA table_info(gigs)").all() as any[];
      const hasStatus = columns.some(c => c.name === 'status');
      if (!hasStatus) {
        db.exec("ALTER TABLE gigs ADD COLUMN status TEXT DEFAULT 'published'");
      }
      const hasCreatedAt = columns.some(c => c.name === 'created_at');
      if (!hasCreatedAt) {
        db.exec("ALTER TABLE gigs ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP");
      }
    } catch (e) {
      console.error("Migration error (gigs):", e);
    }
  }

// --- Auth API ---
  app.get("/api/auth/profile/:id", (req, res) => {
    try {
      const { id } = req.params;
      console.log(`Fetching profile for ID: ${id}`);
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as any;
      if (user) {
        // Ensure referral code exists for old users
        if (!user.referral_code) {
          const new_referral_code = Math.random().toString(36).substring(2, 8).toUpperCase();
          db.prepare("UPDATE users SET referral_code = ? WHERE id = ?").run(new_referral_code, user.id);
          user.referral_code = new_referral_code;
        }
        res.json(user);
      } else {
        console.log(`User not found for ID: ${id}`);
        res.status(404).json({ error: "User not found" });
      }
    } catch (error: any) {
      console.error("Error in /api/auth/profile/:id:", error);
      res.status(500).json({ error: "Internal server error", details: error.message });
    }
  });

  app.post("/api/auth/signup", async (req, res) => {
    const { name, email, password, role, bio, skills, portfolio_url, referral_code: used_referral_code } = req.body;
    console.log(`Signup attempt for email: ${email}`);
    try {
      // Check if user already exists
      const existingUser = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate a unique referral code for the new user
      const new_referral_code = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      let referred_by_id = null;
      if (used_referral_code) {
        const referrer = db.prepare("SELECT id, is_premium FROM users WHERE referral_code = ?").get(used_referral_code) as any;
        if (referrer && referrer.is_premium) {
          referred_by_id = referrer.id;
          // Credit the referrer $30
          db.prepare("UPDATE users SET balance = balance + 30 WHERE id = ?").run(referrer.id);
        }
      }

      // Security: Only allow 'buyer' or 'seller' from frontend, unless it's the master admin email
      const finalRole = (email === 'admin@gigmaster.com') ? 'admin' : (role === 'seller' ? 'seller' : 'buyer');

      const result = db.prepare("INSERT INTO users (name, email, password, role, bio, skills, portfolio_url, referral_code, referred_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(
        name, 
        email, 
        hashedPassword,
        finalRole,
        bio || null,
        skills || null,
        portfolio_url || null,
        new_referral_code,
        referred_by_id
      );

      const userId = Number(result.lastInsertRowid);
      const token = jwt.sign({ id: userId, email, role: finalRole }, JWT_SECRET);
      
      res.json({ 
        token, 
        user: { 
          id: userId, 
          name, 
          email, 
          role: finalRole,
          bio: bio || null,
          skills: skills || null,
          portfolio_url: portfolio_url || null,
          referral_code: new_referral_code,
          balance: 0,
          is_premium: 0
        } 
      });
    } catch (error: any) {
      console.error("Error in /api/auth/signup:", error);
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
      
      // Don't send password back
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({ 
        token, 
        user: userWithoutPassword
      });
    } catch (error: any) {
      console.error("Error in /api/auth/login:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/auth/me", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(decoded.id) as any;
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(401).json({ error: "Invalid token" });
    }
  });

  app.get("/api/users/:id", (req, res) => {
    const user = db.prepare("SELECT id, name, email, role, avatar, bio, skills, portfolio_url, referral_code, balance, is_premium, created_at FROM users WHERE id = ?").get(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  });

  // --- Affiliate API ---
  app.get("/api/affiliate/stats/:userId", (req, res) => {
    const { userId } = req.params;
    const user = db.prepare("SELECT referral_code, balance, is_premium FROM users WHERE id = ?").get(userId) as any;
    if (!user) return res.status(404).json({ error: "User not found" });
    
    const referrals = db.prepare("SELECT id, name, created_at FROM users WHERE referred_by = ?").all(userId);
    res.json({
      referral_code: user.referral_code,
      balance: user.balance,
      is_premium: user.is_premium,
      total_referrals: referrals.length,
      referrals: referrals
    });
  });

  app.post("/api/affiliate/withdraw", (req, res) => {
    const { userId, amount } = req.body;
    const user = db.prepare("SELECT balance, is_premium FROM users WHERE id = ?").get(userId) as any;
    
    if (!user) return res.status(404).json({ error: "User not found" });
    
    const minWithdrawal = user.is_premium ? 50 : 100;
    const processingDays = user.is_premium ? 1 : 3;
    
    if (amount < minWithdrawal) {
      return res.status(400).json({ error: `Minimum withdrawal for ${user.is_premium ? 'Premium' : 'Free'} users is $${minWithdrawal}` });
    }
    
    if (user.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }
    
    db.prepare("UPDATE users SET balance = balance - ? WHERE id = ?").run(amount, userId);
    db.prepare("INSERT INTO withdrawals (user_id, amount, processing_days) VALUES (?, ?, ?)").run(userId, amount, processingDays);
    
    res.json({ success: true, message: `Withdrawal of $${amount} requested. It will arrive in ${processingDays} day(s).` });
  });

  app.get("/api/affiliate/withdrawals/:userId", (req, res) => {
    const withdrawals = db.prepare("SELECT * FROM withdrawals WHERE user_id = ? ORDER BY created_at DESC").all(req.params.userId);
    res.json(withdrawals);
  });

  app.post("/api/users/upgrade-premium", (req, res) => {
    const { userId } = req.body;
    db.prepare("UPDATE users SET is_premium = 1 WHERE id = ?").run(userId);
    res.json({ success: true, message: "Upgraded to Premium successfully!" });
  });

  // --- Admin API ---
  const adminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const user = db.prepare("SELECT role FROM users WHERE id = ?").get(decoded.id) as any;
      if (user?.role === 'admin') {
        next();
      } else {
        res.status(403).json({ error: "Forbidden: Admin access required" });
      }
    } catch (error) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  app.get("/api/admin/users", adminAuth, (req, res) => {
    const users = db.prepare("SELECT id, name, email, role, balance, is_premium, created_at FROM users ORDER BY created_at DESC").all();
    res.json(users);
  });

  app.get("/api/admin/withdrawals", adminAuth, (req, res) => {
    const withdrawals = db.prepare(`
      SELECT withdrawals.*, users.name as user_name, users.email as user_email 
      FROM withdrawals 
      JOIN users ON withdrawals.user_id = users.id 
      ORDER BY withdrawals.created_at DESC
    `).all();
    res.json(withdrawals);
  });

  app.post("/api/admin/withdrawals/:id/status", adminAuth, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    db.prepare("UPDATE withdrawals SET status = ? WHERE id = ?").run(status, id);
    res.json({ success: true });
  });

  app.post("/api/admin/gigs/:id/status", adminAuth, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    db.prepare("UPDATE gigs SET status = ? WHERE id = ?").run(status, id);
    res.json({ success: true });
  });

  app.delete("/api/admin/users/:id", adminAuth, (req, res) => {
    const { id } = req.params;
    // In a real app, we'd handle cascading deletes or soft deletes
    db.prepare("DELETE FROM users WHERE id = ?").run(id);
    res.json({ success: true });
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

  app.get("/api/gigs/seller/:id", (req, res) => {
    const gigs = db.prepare("SELECT gigs.*, users.name as seller_name FROM gigs JOIN users ON gigs.seller_id = users.id WHERE seller_id = ?").all(req.params.id);
    res.json(gigs);
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
    try {
      console.log("Initializing Vite middleware...");
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log("Vite middleware initialized");
    } catch (err) {
      console.error("FAILED TO INITIALIZE VITE MIDDLEWARE:", err);
    }
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Global error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("GLOBAL ERROR:", err);
    res.status(500).json({ error: "Internal server error", message: err.message });
  });
})();

export { app, server };
