import { serve } from "bun";
import index from "./index.html";
import { dbOperations } from "./database";
import {
  generateSessionId,
  getSessionId,
  createResponseWithSession,
} from "./utils";

const server = serve({
  routes: {
    // API Routes
    "/api/users": {
      POST: async (req) => {
        try {
          const { name } = await req.json();
          if (!name || typeof name !== "string" || name.trim().length === 0) {
            return Response.json(
              { error: "Name is required" },
              { status: 400 },
            );
          }

          let sessionId = getSessionId(req);
          if (!sessionId) {
            sessionId = generateSessionId();
          }

          const userWithVotes = await dbOperations.getUserWithVotes(sessionId);
          return createResponseWithSession({ user: userWithVotes }, sessionId);
        } catch (error) {
          console.error("Error creating user:", error);
          return Response.json(
            { error: "Failed to create user" },
            { status: 500 },
          );
        }
      },

      GET: async (req) => {
        try {
          const sessionId = getSessionId(req);
          if (!sessionId) {
            return Response.json(
              { error: "No session found" },
              { status: 401 },
            );
          }

          const userWithVotes = await dbOperations.getUserWithVotes(sessionId);
          if (!userWithVotes) {
            return Response.json({ error: "User not found" }, { status: 404 });
          }

          return Response.json({ user: userWithVotes });
        } catch (error) {
          console.error("Error getting user:", error);
          return Response.json(
            { error: "Failed to get user" },
            { status: 500 },
          );
        }
      },
    },

    "/api/summer-houses": {
      GET: async () => {
        try {
          const summerHouses = await dbOperations.getAllSummerHouses();
          return Response.json({ summerHouses });
        } catch (error) {
          console.error("Error getting summer houses:", error);
          return Response.json(
            { error: "Failed to get summer houses" },
            { status: 500 },
          );
        }
      },
    },

    "/api/votes": {
      POST: async (req) => {
        try {
          const sessionId = getSessionId(req);
          if (!sessionId) {
            return Response.json(
              { error: "No session found" },
              { status: 401 },
            );
          }

          const { summerHouseId } = await req.json();
          if (!summerHouseId || typeof summerHouseId !== "number") {
            return Response.json(
              { error: "Summer house ID is required" },
              { status: 400 },
            );
          }

          const user = await dbOperations.getUserBySessionId(sessionId);
          if (!user) {
            return Response.json({ error: "User not found" }, { status: 404 });
          }

          // Check if user already voted for this summer house
          const existingVotes = await dbOperations.getVotesByUserId(user.id);
          const hasVoted = existingVotes.some(
            (vote) => vote.summerHouseId === summerHouseId,
          );

          if (hasVoted) {
            return Response.json(
              { error: "Already voted for this summer house" },
              { status: 400 },
            );
          }

          const vote = await dbOperations.createVote(user.id, summerHouseId);
          const userWithVotes = await dbOperations.getUserWithVotes(sessionId);

          return Response.json({ vote, user: userWithVotes });
        } catch (error) {
          console.error("Error creating vote:", error);
          return Response.json(
            { error: "Failed to create vote" },
            { status: 500 },
          );
        }
      },

      DELETE: async (req) => {
        try {
          const sessionId = getSessionId(req);
          if (!sessionId) {
            return Response.json(
              { error: "No session found" },
              { status: 401 },
            );
          }

          const { summerHouseId } = await req.json();
          if (!summerHouseId || typeof summerHouseId !== "number") {
            return Response.json(
              { error: "Summer house ID is required" },
              { status: 400 },
            );
          }

          const user = await dbOperations.getUserBySessionId(sessionId);
          if (!user) {
            return Response.json({ error: "User not found" }, { status: 404 });
          }

          const deleted = await dbOperations.deleteVote(user.id, summerHouseId);
          if (!deleted) {
            return Response.json({ error: "Vote not found" }, { status: 404 });
          }

          const userWithVotes = await dbOperations.getUserWithVotes(sessionId);
          return Response.json({ success: true, user: userWithVotes });
        } catch (error) {
          console.error("Error deleting vote:", error);
          return Response.json(
            { error: "Failed to delete vote" },
            { status: 500 },
          );
        }
      },
    },

    "/api/results": {
      GET: async () => {
        try {
          const results = await dbOperations.getSummerHousesWithVoteCounts();
          return Response.json({ results });
        } catch (error) {
          console.error("Error getting results:", error);
          return Response.json(
            { error: "Failed to get results" },
            { status: 500 },
          );
        }
      },
    },

    // Serve index.html for all unmatched routes.
    "/*": index,
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
