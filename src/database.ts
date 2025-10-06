import { Database } from "bun:sqlite";
import { eq, relations, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Schema definitions
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
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

export interface UserWithVotes extends User {
  votes: number[];
}

// Initialize database
const sqlite = new Database("voting.db", { create: true });
export const db = drizzle(sqlite);

// Migration function
export async function runMigrations() {
  migrate(db, { migrationsFolder: "./drizzle" });
}

// Database operations
export const dbOperations = {
  // User operations
  createUser: async (name: string, sessionId: string): Promise<User> => {
    const result = await db
      .insert(users)
      .values({
        name,
        sessionId,
      })
      .onConflictDoUpdate({
        target: users.sessionId,
        set: { name },
      })
      .returning();
    if (!result[0]) throw new Error("Failed to create user");
    return result[0];
  },

  getUserBySessionId: async (sessionId: string): Promise<User | undefined> => {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.sessionId, sessionId));
    return result[0];
  },

  // Summer house operations
  createSummerHouse: async (
    name: string,
    imageUrl: string,
    bookingUrl: string,
  ): Promise<SummerHouse> => {
    const result = await db
      .insert(summerHouses)
      .values({
        name,
        imageUrl,
        bookingUrl,
      })
      .returning();
    if (!result[0]) throw new Error("Failed to create summer house");
    return result[0];
  },

  getAllSummerHouses: async (): Promise<SummerHouse[]> => {
    return await db.select().from(summerHouses).orderBy(summerHouses.name);
  },

  getSummerHouseById: async (id: number): Promise<SummerHouse | undefined> => {
    const result = await db
      .select()
      .from(summerHouses)
      .where(eq(summerHouses.id, id));
    return result[0];
  },

  // Vote operations
  createVote: async (userId: number, summerHouseId: number): Promise<Vote> => {
    const result = await db
      .insert(votes)
      .values({
        userId,
        summerHouseId,
      })
      .returning();
    if (!result[0]) throw new Error("Failed to create vote");
    return result[0];
  },

  getVotesByUserId: async (userId: number): Promise<Vote[]> => {
    return await db.select().from(votes).where(eq(votes.userId, userId));
  },

  getVotesBySummerHouseId: async (summerHouseId: number): Promise<Vote[]> => {
    return await db
      .select()
      .from(votes)
      .where(eq(votes.summerHouseId, summerHouseId));
  },

  getAllVotes: async (): Promise<Vote[]> => {
    return await db.select().from(votes);
  },

  deleteVote: async (
    userId: number,
    summerHouseId: number,
  ): Promise<boolean> => {
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

  // Combined operations
  getUserWithVotes: async (
    sessionId: string,
  ): Promise<UserWithVotes | null> => {
    const user = await dbOperations.getUserBySessionId(sessionId);
    if (!user) return null;

    const userVotes = await dbOperations.getVotesByUserId(user.id);
    const voteIds = userVotes.map((vote) => vote.summerHouseId);

    return {
      ...user,
      votes: voteIds,
    };
  },

  getSummerHousesWithVoteCounts: async (): Promise<
    (SummerHouse & { voteCount: number })[]
  > => {
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
};
