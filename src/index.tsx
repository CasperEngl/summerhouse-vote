import { serve } from "bun";
import { Effect } from "effect";
import {
  checkUserHandler,
  createUserHandler,
  loginUserHandler,
  createVoteHandler,
  deleteVoteHandler,
  getResultsHandler,
  getSummerHousesHandler,
  getUserHandler,
  logoutHandler,
} from "./api-handlers";
import { runMigrations } from "./database";
import index from "./index.html";
import { ServerRuntime } from "./runtime";

// Run migrations on startup
Effect.runSync(runMigrations);

const server = serve({
  routes: {
    // API Routes
    "/api/users": {
      POST: (req) => createUserHandler(req).pipe(ServerRuntime.runPromise),
      GET: (req) => getUserHandler(req).pipe(ServerRuntime.runPromise),
      DELETE: (req) => logoutHandler(req).pipe(ServerRuntime.runPromise),
    },

    "/api/users/check": {
      POST: (req) => checkUserHandler(req).pipe(ServerRuntime.runPromise),
    },

    "/api/users/login": {
      POST: (req) => loginUserHandler(req).pipe(ServerRuntime.runPromise),
    },

    "/api/summer-houses": {
      GET: (req) => getSummerHousesHandler(req).pipe(ServerRuntime.runPromise),
    },

    "/api/votes": {
      POST: (req) => createVoteHandler(req).pipe(ServerRuntime.runPromise),
      DELETE: (req) => deleteVoteHandler(req).pipe(ServerRuntime.runPromise),
    },

    "/api/results": {
      GET: (req) => getResultsHandler(req).pipe(ServerRuntime.runPromise),
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
