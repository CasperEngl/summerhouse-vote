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
  healthCheckHandler,
} from "./api-handlers";
import { runMigrations } from "./database";
import index from "./index.html";
import { ServerRuntime } from "./runtime";

runMigrations.pipe(Effect.runSync);

const server = serve({
  routes: {
    "/api/health": {
      GET: (req) => healthCheckHandler(req).pipe(ServerRuntime.runPromise),
    },

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

    "/*": index,
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
