import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

// Create SQLite database connection
const sqlite = new Database("ramadan.db");

// Create Drizzle ORM instance with schema
export const db = drizzle(sqlite, { schema });

// Export schema for use in other files
export * from "./schema";

// Export sqlite instance for raw queries if needed
export { sqlite };
