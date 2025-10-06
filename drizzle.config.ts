import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/database.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: "file:./data/voting.db",
  },
});
