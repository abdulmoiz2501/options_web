import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { posts, optionsFlow, users, tradingChallenges, challengeParticipants, paperTradingAccounts, paperTradingPositions } from "@db/schema";
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

  // Get challenges
  app.get("/api/challenges", async (req, res) => {
    try {
      const challenges = await db.query.tradingChallenges.findMany({
        with: {
          creator: true,
          participants: true,
        },
        orderBy: desc(tradingChallenges.createdAt),
      });
      res.json(challenges);
    } catch (error) {
      res.status(500).send("Error fetching challenges");
    }
  });

  // Get single challenge
  app.get("/api/challenges/:id", async (req, res) => {
    try {
      const [challenge] = await db.query.tradingChallenges.findMany({
        where: eq(tradingChallenges.id, parseInt(req.params.id)),
        with: {
          creator: true,
          participants: {
            with: {
              user: true,
            },
          },
        },
      });

      if (!challenge) {
        return res.status(404).send("Challenge not found");
      }

      res.json(challenge);
    } catch (error) {
      res.status(500).send("Error fetching challenge");
    }
  });

  // Create challenge
  app.post("/api/challenges", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const [challenge] = await db
        .insert(tradingChallenges)
        .values({
          creatorId: req.user.id,
          title: req.body.title,
          description: req.body.description,
          startDate: req.body.startDate,
          endDate: req.body.endDate,
          initialBalance: req.body.initialBalance,
          maxLeverage: req.body.maxLeverage,
          allowedInstruments: req.body.allowedInstruments,
          minParticipants: req.body.minParticipants,
          maxParticipants: req.body.maxParticipants,
        })
        .returning();

      res.json(challenge);
    } catch (error) {
      res.status(500).send("Error creating challenge");
    }
  });

  // Join challenge
  app.post("/api/challenges/:id/join", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const [challenge] = await db
        .select()
        .from(tradingChallenges)
        .where(eq(tradingChallenges.id, parseInt(req.params.id)))
        .limit(1);

      if (!challenge) {
        return res.status(404).send("Challenge not found");
      }

      // Check if user is already participating
      const [existingParticipant] = await db
        .select()
        .from(challengeParticipants)
        .where(eq(challengeParticipants.userId, req.user.id))
        .limit(1);

      if (existingParticipant) {
        return res.status(400).send("Already participating in this challenge");
      }

      const [participant] = await db
        .insert(challengeParticipants)
        .values({
          challengeId: challenge.id,
          userId: req.user.id,
          currentBalance: challenge.initialBalance,
        })
        .returning();

      res.json(participant);
    } catch (error) {
      res.status(500).send("Error joining challenge");
    }
  });

  // Get paper trading account details
  app.get("/api/paper-trading/account", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      let [account] = await db
        .select()
        .from(paperTradingAccounts)
        .where(eq(paperTradingAccounts.userId, req.user.id))
        .limit(1);

      if (!account) {
        // Create account if it doesn't exist
        [account] = await db
          .insert(paperTradingAccounts)
          .values({
            userId: req.user.id,
            balance: 10000, //Give initial balance
          })
          .returning();
      }

      res.json(account);
    } catch (error) {
      res.status(500).send("Error fetching account");
    }
  });

  // Get paper trading positions
  app.get("/api/paper-trading/positions", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const positions = await db
        .select({
          id: paperTradingPositions.id,
          symbol: paperTradingPositions.symbol,
          optionType: paperTradingPositions.optionType,
          quantity: paperTradingPositions.quantity,
          entryPrice: paperTradingPositions.entryPrice,
          strikePrice: paperTradingPositions.strikePrice,
          expiryDate: paperTradingPositions.expiryDate,
          status: paperTradingPositions.status,
          pnl: paperTradingPositions.pnl,
          riskLevel: paperTradingPositions.riskLevel,
        })
        .from(paperTradingPositions)
        .innerJoin(
          paperTradingAccounts,
          eq(paperTradingPositions.accountId, paperTradingAccounts.id)
        )
        .where(eq(paperTradingAccounts.userId, req.user.id))
        .where(eq(paperTradingPositions.status, 'open'));

      res.json(positions);
    } catch (error) {
      res.status(500).send("Error fetching positions");
    }
  });

  // Place new paper trade
  app.post("/api/paper-trading/trade", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const [account] = await db
        .select()
        .from(paperTradingAccounts)
        .where(eq(paperTradingAccounts.userId, req.user.id))
        .limit(1);

      if (!account) {
        return res.status(404).send("Trading account not found");
      }

      const { symbol, amount, type, expiry, strike } = req.body;

      // Check if user has enough balance
      if (account.balance < amount) {
        return res.status(400).send("Insufficient funds");
      }

      // Calculate risk level
      const maxLoss = type === 'call' ? amount : strike * 100;
      const riskLevel = maxLoss > 5000 ? 'HIGH' : maxLoss > 2000 ? 'MEDIUM' : 'LOW';

      // Create new position
      const [position] = await db
        .insert(paperTradingPositions)
        .values({
          accountId: account.id,
          symbol,
          optionType: type,
          quantity: Math.floor(amount / strike),
          entryPrice: strike,
          strikePrice: strike,
          expiryDate: new Date(expiry),
          status: 'open',
          pnl: 0,
          riskLevel,
        })
        .returning();

      // Update account balance
      await db
        .update(paperTradingAccounts)
        .set({
          balance: account.balance - amount,
        })
        .where(eq(paperTradingAccounts.id, account.id));

      res.json(position);
    } catch (error) {
      res.status(500).send("Error executing trade");
    }
  });

  // Get paper trading leaderboard
  app.get("/api/paper-trading/leaderboard", async (_req, res) => {
    try {
      const leaderboard = await db
        .select({
          id: users.id,
          username: users.username,
          totalPnl: paperTradingAccounts.totalPnl,
          winRate: users.winRate,
          tradesCount: users.tradesCount,
        })
        .from(users)
        .innerJoin(
          paperTradingAccounts,
          eq(users.id, paperTradingAccounts.userId)
        )
        .orderBy(desc(paperTradingAccounts.totalPnl))
        .limit(10);

      res.json(leaderboard);
    } catch (error) {
      res.status(500).send("Error fetching leaderboard data");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}