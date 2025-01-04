import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { posts, optionsFlow, users } from "@db/schema";
import { desc, eq } from "drizzle-orm";
import fetch from "node-fetch";

async function fetchLargeOptionTrades() {
  const API_KEY = process.env.POLYGON_API_KEY;
  if (!API_KEY) {
    throw new Error("POLYGON_API_KEY not found");
  }

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  const response = await fetch(
    `https://api.polygon.io/v3/trades/options?timestamp.gte=${today}&premium_price.gt=100000&limit=50&apiKey=${API_KEY}`,
    {
      headers: {
        'Accept': 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Polygon API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.results.map((trade: any) => ({
    id: trade.id,
    ticker: trade.underlying_symbol,
    strike_price: trade.strike_price,
    expiration_date: trade.expiration_date,
    premium: trade.premium_price,
    contract_type: trade.contract_type.toLowerCase(),
    size: trade.size,
    timestamp: trade.sip_timestamp,
  }));
}

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Get large options trades
  app.get("/api/large-options", async (_req, res) => {
    try {
      const trades = await fetchLargeOptionTrades();
      res.json(trades);
    } catch (error: any) {
      res.status(500).json({ 
        error: "Failed to fetch large options trades",
        details: error.message 
      });
    }
  });

  // Get social feed posts
  app.get("/api/posts", async (req, res) => {
    try {
      const feedPosts = await db.query.posts.findMany({
        with: {
          user: true,
        },
        orderBy: desc(posts.createdAt),
        limit: 50,
      });
      res.json(feedPosts);
    } catch (error) {
      res.status(500).send("Error fetching posts");
    }
  });

  // Create new post
  app.post("/api/posts", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const [post] = await db
        .insert(posts)
        .values({
          userId: req.user.id,
          content: req.body.content,
          ticker: req.body.ticker,
          analysis: req.body.analysis,
        })
        .returning();
      res.json(post);
    } catch (error) {
      res.status(500).send("Error creating post");
    }
  });

  // Get options flow data
  app.get("/api/options-flow", async (req, res) => {
    try {
      const flow = await db.query.optionsFlow.findMany({
        orderBy: desc(optionsFlow.createdAt),
        limit: 100,
      });
      res.json(flow);
    } catch (error) {
      res.status(500).send("Error fetching options flow");
    }
  });

  // Get leaderboard data
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const leaderboardUsers = await db
        .select({
          id: users.id,
          username: users.username,
          totalPnl: users.totalPnl,
          weeklyPnl: users.weeklyPnl,
          winRate: users.winRate,
          tradesCount: users.tradesCount,
        })
        .from(users)
        .orderBy(desc(users.totalPnl))
        .limit(10);

      res.json(leaderboardUsers);
    } catch (error) {
      res.status(500).send("Error fetching leaderboard data");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}