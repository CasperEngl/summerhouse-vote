import { Effect, Schema } from "effect";
import { DatabaseService } from "./database";
import {
  createResponseWithSession,
  generateSessionId,
  getSessionId,
} from "./utils";

// Schemas for request bodies
const CreateUserRequest = Schema.Struct({
  name: Schema.String.pipe(Schema.nonEmptyString()),
  email: Schema.String.pipe(Schema.nonEmptyString()),
});

const VoteRequest = Schema.Struct({
  summerHouseId: Schema.Number,
});

const DeleteVoteRequest = Schema.Struct({
  summerHouseId: Schema.Number,
});

// Helper function to create error response
const createErrorResponse = (error: string, status: number = 500): Response => {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
};

// Helper function to create success response
const createSuccessResponse = (data: any, status: number = 200): Response => {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
};

// User API handlers
export function createUserHandler(req: Request) {
  return Effect.gen(function* () {
    const body = yield* Effect.tryPromise({
      try: () => req.json(),
      catch: (error) => new Error(`Failed to parse JSON: ${error}`),
    }).pipe(Effect.flatMap(Schema.decodeUnknown(CreateUserRequest)));

    let sessionId = getSessionId(req);
    if (!sessionId) {
      sessionId = generateSessionId();
    }

    yield* DatabaseService.createUser(body.name.trim(), body.email.trim().toLowerCase(), sessionId);
    const userWithVotes = yield* DatabaseService.getUserWithVotes(sessionId);

    return createResponseWithSession({ user: userWithVotes }, sessionId);
  }).pipe(
    Effect.catchAll((error) =>
      Effect.logError("Error creating user:", error).pipe(
        Effect.map(() => createErrorResponse("Failed to create user", 500)),
      ),
    ),
  );
}

export function getUserHandler(req: Request) {
  return Effect.gen(function* () {
    const db = yield* DatabaseService;
    const sessionId = getSessionId(req);

    if (!sessionId) {
      return createErrorResponse("No session found", 401);
    }

    const userWithVotes = yield* db.getUserWithVotes(sessionId);
    if (!userWithVotes) {
      return createErrorResponse("User not found", 404);
    }

    return createSuccessResponse({ user: userWithVotes });
  }).pipe(
    Effect.catchAll((error) =>
      Effect.logError("Error getting user:", error).pipe(
        Effect.map(() => createErrorResponse("Failed to get user", 500)),
      ),
    ),
  );
}
export function logoutHandler(_req: Request) {
  return Effect.try({
    try: () => {
      // Clear the session cookie by setting it to expire immediately
      const response = createSuccessResponse({ success: true });
      response.headers.set(
        "Set-Cookie",
        "session_id=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0",
      );
      return response;
    },
    catch: () => createErrorResponse("Failed to logout", 500),
  }).pipe(
    Effect.catchAll((error) =>
      Effect.logError("Error logging out:", error).pipe(
        Effect.map(() => createErrorResponse("Failed to logout", 500)),
      ),
    ),
  );
}
// Summer Houses API handlers
export function getSummerHousesHandler(_req: Request) {
  return Effect.gen(function* () {
    const db = yield* DatabaseService;
    const summerHouses = yield* db.getAllSummerHouses();

    return createSuccessResponse({ summerHouses });
  }).pipe(
    Effect.catchAll((error) =>
      Effect.logError("Error getting summer houses:", error).pipe(
        Effect.map(() =>
          createErrorResponse("Failed to get summer houses", 500),
        ),
      ),
    ),
  );
}
// Votes API handlers
export function createVoteHandler(req: Request) {
  return Effect.gen(function* () {
    const sessionId = getSessionId(req);

    if (!sessionId) {
      return createErrorResponse("No session found", 401);
    }

    const body = yield* Effect.tryPromise({
      try: () => req.json(),
      catch: (error) => new Error(`Failed to parse JSON: ${error}`),
    }).pipe(Effect.flatMap(Schema.decodeUnknown(VoteRequest)));

    const user = yield* DatabaseService.getUserBySessionId(sessionId);
    if (!user) {
      return createErrorResponse("User not found", 404);
    }

    // Check if user already voted for this summer house
    const existingVotes = yield* DatabaseService.getVotesByUserId(user.id);
    const hasVoted = existingVotes.some(
      (vote) => vote.summerHouseId === body.summerHouseId,
    );

    if (hasVoted) {
      return createErrorResponse("Already voted for this summer house", 400);
    }

    const vote = yield* DatabaseService.createVote(user.id, body.summerHouseId);
    const userWithVotes = yield* DatabaseService.getUserWithVotes(sessionId);

    return createSuccessResponse({ vote, user: userWithVotes });
  }).pipe(
    Effect.catchAll((error) =>
      Effect.logError("Error creating vote:", error).pipe(
        Effect.map(() => createErrorResponse("Failed to create vote", 500)),
      ),
    ),
  );
}
export function deleteVoteHandler(req: Request) {
  return Effect.gen(function* () {
    const sessionId = getSessionId(req);

    if (!sessionId) {
      return createErrorResponse("No session found", 401);
    }

    const body = yield* Effect.tryPromise({
      try: () => req.json(),
      catch: (error) => new Error(`Failed to parse JSON: ${error}`),
    }).pipe(Effect.flatMap(Schema.decodeUnknown(DeleteVoteRequest)));

    const user = yield* DatabaseService.getUserBySessionId(sessionId);
    if (!user) {
      return createErrorResponse("User not found", 404);
    }

    const deleted = yield* DatabaseService.deleteVote(
      user.id,
      body.summerHouseId,
    );
    if (!deleted) {
      return createErrorResponse("Vote not found", 404);
    }

    const userWithVotes = yield* DatabaseService.getUserWithVotes(sessionId);
    return createSuccessResponse({ success: true, user: userWithVotes });
  });
}
// Results API handlers
export function getResultsHandler(_req: Request) {
  return Effect.gen(function* () {
    const results = yield* DatabaseService.getSummerHousesWithVoteCounts();

    return createSuccessResponse({ results });
  }).pipe(
    Effect.catchAll((error) =>
      Effect.logError("Error getting results:", error).pipe(
        Effect.map(() => createErrorResponse("Failed to get results", 500)),
      ),
    ),
  );
}
