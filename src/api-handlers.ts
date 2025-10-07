import { Effect, Schema } from "effect";
import { DatabaseService } from "./database";
import {
  createResponseWithSession,
  generateSessionId,
  getSessionId,
} from "./utils";
import {
  CreateUserRequestSchema,
  LoginRequestSchema,
  CheckUserRequestSchema,
  VoteRequestSchema,
  DeleteVoteRequestSchema,
  CreateUserResponseSchema,
  LoginResponseSchema,
  CheckUserResponseSchema,
  GetUserResponseSchema,
  GetSummerHousesResponseSchema,
  VoteResponseSchema,
  DeleteVoteResponseSchema,
  GetResultsResponseSchema,
} from "./schemas";

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
    }).pipe(Effect.flatMap(Schema.decodeUnknown(CreateUserRequestSchema)));

    let sessionId = getSessionId(req);
    if (!sessionId) {
      sessionId = generateSessionId();
    }

    yield* DatabaseService.createUser(
      body.name.trim(),
      body.email.trim().toLowerCase(),
      sessionId,
    );
    const userWithVotes = yield* DatabaseService.getUserWithVotes(sessionId);

    // Validate response
    const validatedResponse = yield* Schema.decodeUnknown(
      CreateUserResponseSchema,
    )({ user: userWithVotes });

    return createResponseWithSession(validatedResponse, sessionId);
  }).pipe(
    Effect.catchAll((error) =>
      Effect.logError("Error creating user:", error).pipe(
        Effect.map(() => createErrorResponse("Failed to create user", 500)),
      ),
    ),
  );
}

export function loginUserHandler(req: Request) {
  return Effect.gen(function* () {
    const body = yield* Effect.tryPromise({
      try: () => req.json(),
      catch: (error) => new Error(`Failed to parse JSON: ${error}`),
    }).pipe(Effect.flatMap(Schema.decodeUnknown(LoginRequestSchema)));

    let sessionId = getSessionId(req);
    if (!sessionId) {
      sessionId = generateSessionId();
    }

    // Check if user exists
    const existingUser = yield* DatabaseService.getUserByEmail(
      body.email.trim().toLowerCase(),
    );

    if (!existingUser) {
      return createErrorResponse("User not found", 404);
    }

    // Update session for existing user
    yield* DatabaseService.updateUserSession(existingUser.id, sessionId);
    const userWithVotes = yield* DatabaseService.getUserWithVotes(sessionId);

    // Validate response
    const validatedResponse = yield* Schema.decodeUnknown(LoginResponseSchema)({
      user: userWithVotes,
    });

    return createResponseWithSession(validatedResponse, sessionId);
  }).pipe(
    Effect.catchAll((error) =>
      Effect.logError("Error logging in user:", error).pipe(
        Effect.map(() => createErrorResponse("Failed to login user", 500)),
      ),
    ),
  );
}

export function getUserHandler(req: Request) {
  return Effect.gen(function* () {
    const sessionId = getSessionId(req);
    if (!sessionId) {
      return createErrorResponse("No session found", 401);
    }
    const userWithVotes = yield* DatabaseService.getUserWithVotes(sessionId);
    const validatedResponse = yield* Schema.decodeUnknown(
      GetUserResponseSchema,
    )({ user: userWithVotes });
    return createSuccessResponse(validatedResponse);
  });
}
export function logoutHandler(_req: Request) {
  return Effect.gen(function* () {
    const response = createSuccessResponse({ success: true });
    response.headers.set(
      "Set-Cookie",
      "session_id=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0",
    );
    return response;
  });
}

export function checkUserHandler(req: Request) {
  return Effect.gen(function* () {
    const body = yield* Effect.tryPromise({
      try: () => req.json(),
      catch: (error) => new Error(`Failed to parse JSON: ${error}`),
    }).pipe(Effect.flatMap(Schema.decodeUnknown(CheckUserRequestSchema)));

    const user = yield* DatabaseService.getUserByEmail(
      body.email.trim().toLowerCase(),
    );

    // Validate response
    const validatedResponse = yield* Schema.decodeUnknown(
      CheckUserResponseSchema,
    )({
      exists: user !== undefined,
    });

    return createSuccessResponse(validatedResponse);
  }).pipe(
    Effect.catchAll((error) =>
      Effect.logError("Error checking user:", error).pipe(
        Effect.map(() => createErrorResponse("Failed to check user", 500)),
      ),
    ),
  );
}
// Summer Houses API handlers
export function getSummerHousesHandler(_req: Request) {
  return Effect.gen(function* () {
    const summerHouses = yield* DatabaseService.getAllSummerHouses();

    // Validate response
    const validatedResponse = yield* Schema.decodeUnknown(
      GetSummerHousesResponseSchema,
    )({ summerHouses });

    return createSuccessResponse(validatedResponse);
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
    }).pipe(Effect.flatMap(Schema.decodeUnknown(VoteRequestSchema)));

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

    // Validate response
    const validatedResponse = yield* Schema.decodeUnknown(VoteResponseSchema)({
      vote,
      user: userWithVotes,
    });

    return createSuccessResponse(validatedResponse);
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
    }).pipe(Effect.flatMap(Schema.decodeUnknown(DeleteVoteRequestSchema)));

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

    // Validate response
    const validatedResponse = yield* Schema.decodeUnknown(
      DeleteVoteResponseSchema,
    )({ success: true, user: userWithVotes });

    return createSuccessResponse(validatedResponse);
  });
}
// Results API handlers
export function getResultsHandler(_req: Request) {
  return Effect.gen(function* () {
    const results = yield* DatabaseService.getSummerHousesWithVoteCounts();

    // Validate response
    const validatedResponse = yield* Schema.decodeUnknown(
      GetResultsResponseSchema,
    )({ results });

    return createSuccessResponse(validatedResponse);
  }).pipe(
    Effect.catchAll((error) =>
      Effect.logError("Error getting results:", error).pipe(
        Effect.map(() => createErrorResponse("Failed to get results", 500)),
      ),
    ),
  );
}
