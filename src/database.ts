import { Database } from "bun:sqlite";
import { eq, relations, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { Data, Effect } from "effect";

// Schema definitions
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  sessionId: text("session_id").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`,
  ),
});

export const summerHouses = sqliteTable("summer_houses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  bookingUrl: text("booking_url").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`,
  ),
});

export const votes = sqliteTable("votes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  summerHouseId: integer("summer_house_id")
    .notNull()
    .references(() => summerHouses.id),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`,
  ),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  votes: many(votes),
}));

export const summerHousesRelations = relations(summerHouses, ({ many }) => ({
  votes: many(votes),
}));

export const votesRelations = relations(votes, ({ one }) => ({
  user: one(users, {
    fields: [votes.userId],
    references: [users.id],
  }),
  summerHouse: one(summerHouses, {
    fields: [votes.summerHouseId],
    references: [summerHouses.id],
  }),
}));

// Database types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type SummerHouse = typeof summerHouses.$inferSelect;
export type NewSummerHouse = typeof summerHouses.$inferInsert;
export type Vote = typeof votes.$inferSelect;
export type NewVote = typeof votes.$inferInsert;


// Database error types
export class CreateUserError extends Data.TaggedError("CreateUserError")<{
  message: string;
  cause?: unknown;
}> {}

export class GetUserByEmailError extends Data.TaggedError(
  "GetUserByEmailError",
)<{
  message: string;
  cause?: unknown;
}> {}

export class GetUserBySessionIdError extends Data.TaggedError(
  "GetUserBySessionIdError",
)<{
  message: string;
  cause?: unknown;
}> {}

export class GetAllSummerHousesError extends Data.TaggedError(
  "GetAllSummerHousesError",
)<{
  message: string;
  cause?: unknown;
}> {}

export class GetSummerHouseByIdError extends Data.TaggedError(
  "GetSummerHouseByIdError",
)<{
  message: string;
  cause?: unknown;
}> {}

export class CreateSummerHouseError extends Data.TaggedError(
  "CreateSummerHouseError",
)<{
  message: string;
  cause?: unknown;
}> {}

export class CreateVoteError extends Data.TaggedError("CreateVoteError")<{
  message: string;
  cause?: unknown;
}> {}

export class GetVotesByUserIdError extends Data.TaggedError(
  "GetVotesByUserIdError",
)<{
  message: string;
  cause?: unknown;
}> {}

export class GetVotesBySummerHouseIdError extends Data.TaggedError(
  "GetVotesBySummerHouseIdError",
)<{
  message: string;
  cause?: unknown;
}> {}

export class DeleteVoteError extends Data.TaggedError("DeleteVoteError")<{
  message: string;
  cause?: unknown;
}> {}

export class GetSummerHousesWithVoteCountsError extends Data.TaggedError(
  "GetSummerHousesWithVoteCountsError",
)<{
  message: string;
  cause?: unknown;
}> {}

export class MigrationError extends Data.TaggedError("MigrationError")<{
  message: string;
  cause?: unknown;
}> {}

export class DatabaseService extends Effect.Service<DatabaseService>()(
  "DatabaseService",
  {
    accessors: true,
    succeed: {
      createUser: (name: string, email: string, sessionId: string) =>
        Effect.tryPromise({
          try: async () => {
            // Check if user already exists
            const existingUser = await db.query.users.findFirst({
              where: eq(users.email, email),
            });

            if (existingUser) {
              throw new Error("User with this email already exists");
            }

            const result = await db
              .insert(users)
              .values({ name, email, sessionId })
              .returning();
            if (!result[0]) throw new Error("Failed to create user");
            return result[0];
          },
          catch: (error) =>
            new CreateUserError({
              message: "Failed to create user",
              cause: error,
            }),
        }),

      getUserByEmail: (email: string) =>
        Effect.tryPromise({
          try: async () => {
            return await db.query.users.findFirst({
              where: eq(users.email, email),
            });
          },
          catch: (error) =>
            new GetUserByEmailError({
              message: "Failed to get user by email",
              cause: error,
            }),
        }),

      updateUserSession: (userId: number, sessionId: string) =>
        Effect.tryPromise({
          try: async () => {
            const result = await db
              .update(users)
              .set({ sessionId })
              .where(eq(users.id, userId))
              .returning();
            if (!result[0]) throw new Error("Failed to update user session");
            return result[0];
          },
          catch: (error) =>
            new CreateUserError({
              message: "Failed to update user session",
              cause: error,
            }),
        }),

      getUserBySessionId: (sessionId: string) =>
        Effect.tryPromise({
          try: async () => {
            return await db.query.users.findFirst({
              where: eq(users.sessionId, sessionId),
            });
          },
          catch: (error) =>
            new GetUserBySessionIdError({
              message: "Failed to get user by session ID",
              cause: error,
            }),
        }),

      getAllSummerHouses: () =>
        Effect.tryPromise({
          try: async () =>
            await db.query.summerHouses.findMany({
              orderBy: summerHouses.name,
            }),
          catch: (error) =>
            new GetAllSummerHousesError({
              message: "Failed to get summer houses",
              cause: error,
            }),
        }),

      getSummerHouseById: (id: number) =>
        Effect.tryPromise({
          try: async () => {
            return await db.query.summerHouses.findFirst({
              where: eq(summerHouses.id, id),
            });
          },
          catch: (error) =>
            new GetSummerHouseByIdError({
              message: "Failed to get summer house by ID",
              cause: error,
            }),
        }),

      createSummerHouse: (name: string, imageUrl: string, bookingUrl: string) =>
        Effect.tryPromise({
          try: async () => {
            const result = await db
              .insert(summerHouses)
              .values({ name, imageUrl, bookingUrl })
              .returning();
            if (!result[0]) throw new Error("Failed to create summer house");
            return result[0];
          },
          catch: (error) =>
            new CreateSummerHouseError({
              message: "Failed to create summer house",
              cause: error,
            }),
        }),

      createVote: (userId: number, summerHouseId: number) =>
        Effect.tryPromise({
          try: async () => {
            const result = await db
              .insert(votes)
              .values({ userId, summerHouseId })
              .returning();
            if (!result[0]) throw new Error("Failed to create vote");
            return result[0];
          },
          catch: (error) =>
            new CreateVoteError({
              message: "Failed to create vote",
              cause: error,
            }),
        }),

      getVotesByUserId: (userId: number) =>
        Effect.tryPromise({
          try: async () =>
            await db.query.votes.findMany({
              where: eq(votes.userId, userId),
              with: {
                summerHouse: true,
              },
            }),
          catch: (error) =>
            new GetVotesByUserIdError({
              message: "Failed to get votes by user ID",
              cause: error,
            }),
        }),

      getVotesBySummerHouseId: (summerHouseId: number) =>
        Effect.tryPromise({
          try: async () =>
            await db.query.votes.findMany({
              where: eq(votes.summerHouseId, summerHouseId),
              with: {
                user: true,
              },
            }),
          catch: (error) =>
            new GetVotesBySummerHouseIdError({
              message: "Failed to get votes by summer house ID",
              cause: error,
            }),
        }),

      deleteVote: (userId: number, summerHouseId: number) =>
        Effect.tryPromise({
          try: async () => {
            // Check if vote exists first
            const existingVote = await db
              .select()
              .from(votes)
              .where(
                sql`${votes.userId} = ${userId} AND ${votes.summerHouseId} = ${summerHouseId}`,
              );

            if (existingVote.length === 0) {
              return false;
            }

            await db
              .delete(votes)
              .where(
                sql`${votes.userId} = ${userId} AND ${votes.summerHouseId} = ${summerHouseId}`,
              );

            return true;
          },
          catch: (error) =>
            new DeleteVoteError({
              message: "Failed to delete vote",
              cause: error,
            }),
        }),

      getUserWithVotes: (sessionId: string) =>
        Effect.tryPromise({
          try: async () => {
            const user = await db.query.users.findFirst({
              where: eq(users.sessionId, sessionId),
              with: {
                votes: true,
              },
            });

            if (!user) return null;

            return {
              ...user,
              votes: user.votes.map((vote: Vote) => ({
                summerHouseId: vote.summerHouseId,
                createdAt: vote.createdAt,
              })),
            };
          },
          catch: (error) =>
            new GetUserBySessionIdError({
              message: "Failed to get user by session ID",
              cause: error,
            }),
        }),

      getSummerHousesWithVoteCounts: () =>
        Effect.tryPromise({
          try: async () => {
            const result = await db
              .select({
                id: summerHouses.id,
                name: summerHouses.name,
                imageUrl: summerHouses.imageUrl,
                bookingUrl: summerHouses.bookingUrl,
                createdAt: summerHouses.createdAt,
                voteCount: sql<number>`count(${votes.id})`,
              })
              .from(summerHouses)
              .leftJoin(votes, eq(summerHouses.id, votes.summerHouseId))
              .groupBy(summerHouses.id)
              .orderBy(sql`count(${votes.id}) desc`, summerHouses.name);

            return result;
          },
          catch: (error) =>
            new GetSummerHousesWithVoteCountsError({
              message: "Failed to get summer houses with vote counts",
              cause: error,
            }),
        }),
    },
  },
) {}

// Initialize database
const sqlite = new Database("data/voting.db", { create: true });
const db = drizzle(sqlite, {
  schema: {
    users,
    summerHouses,
    votes,
    usersRelations,
    summerHousesRelations,
    votesRelations,
  },
});

// Migration function
export const runMigrations = Effect.try({
  try: () => migrate(db, { migrationsFolder: "./drizzle" }),
  catch: (error) =>
    new MigrationError({ message: "Migration failed", cause: error }),
});
