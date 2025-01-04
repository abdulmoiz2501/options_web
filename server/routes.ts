import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { posts, optionsFlow, tradingStrategies, users } from "@db/schema";
import { desc, eq, and } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

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

  // Get trading strategies for current user
  app.get("/api/trading-strategies", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const strategies = await db.query.tradingStrategies.findMany({
        where: eq(tradingStrategies.userId, req.user.id),
        orderBy: desc(tradingStrategies.createdAt),
      });
      res.json(strategies);
    } catch (error) {
      res.status(500).send("Error fetching trading strategies");
    }
  });

  // Create new trading strategy
  app.post("/api/trading-strategies", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const [strategy] = await db
        .insert(tradingStrategies)
        .values({
          userId: req.user.id,
          name: req.body.name,
          description: req.body.description,
          riskLevel: req.body.riskLevel,
          timeHorizon: req.body.timeHorizon,
          indicators: req.body.indicators,
          entryConditions: req.body.entryConditions,
          exitConditions: req.body.exitConditions,
        })
        .returning();
      res.json(strategy);
    } catch (error) {
      res.status(500).send("Error creating trading strategy");
    }
  });

  // Get personalized strategy recommendations
  app.get("/api/strategy-recommendations", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      // Get user preferences
      const [userPrefs] = await db
        .select({
          riskTolerance: users.riskTolerance,
          investmentStyle: users.investmentStyle,
          preferredSectors: users.preferredSectors,
        })
        .from(users)
        .where(eq(users.id, req.user.id))
        .limit(1);

      // Get recent options flow data
      const recentFlow = await db.query.optionsFlow.findMany({
        orderBy: desc(optionsFlow.createdAt),
        limit: 20,
      });

      // Generate recommendations based on user preferences and market data
      const recommendations = generateRecommendations(userPrefs, recentFlow);
      res.json(recommendations);
    } catch (error) {
      res.status(500).send("Error generating recommendations");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to generate strategy recommendations
function generateRecommendations(userPrefs: any, recentFlow: any[]) {
  const recommendations = [];

  // Basic recommendation based on risk tolerance
  if (userPrefs.riskTolerance === 'conservative') {
    recommendations.push({
      name: "Conservative Options Strategy",
      description: "Focus on covered calls and cash-secured puts",
      riskLevel: "low",
      timeHorizon: "medium",
      indicators: ["RSI", "Moving Averages"],
      suggestedSetup: {
        type: "covered_call",
        delta: 0.3,
        daysToExpiration: 30,
      }
    });
  } else if (userPrefs.riskTolerance === 'aggressive') {
    recommendations.push({
      name: "Momentum Options Strategy",
      description: "Focus on directional options trades based on technical momentum",
      riskLevel: "high",
      timeHorizon: "short",
      indicators: ["MACD", "Volume", "RSI"],
      suggestedSetup: {
        type: "long_call",
        delta: 0.7,
        daysToExpiration: 14,
      }
    });
  }

  // Add recommendations based on recent options flow
  const unusualActivity = recentFlow.filter(flow => 
    flow.volume > flow.openInterest * 2 // Unusual volume
  );

  if (unusualActivity.length > 0) {
    recommendations.push({
      name: "Flow-Based Strategy",
      description: "Strategy based on unusual options activity",
      riskLevel: "medium",
      timeHorizon: "short",
      indicators: ["Options Flow", "Volume Analysis"],
      suggestedSetup: {
        type: unusualActivity[0].type,
        ticker: unusualActivity[0].ticker,
        strike: unusualActivity[0].strike,
        expiry: unusualActivity[0].expiry,
      }
    });
  }

  return recommendations;
}