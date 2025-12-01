import * as SQLite from "expo-sqlite";
import { runMigrations } from "./migrations";

const DATABASE_NAME = "boconecta.db";

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function initializeDatabase(): Promise<SQLite.SQLiteDatabase> {
    if (dbInstance) {
        return dbInstance;
    }

    dbInstance = await SQLite.openDatabaseAsync(DATABASE_NAME);
    await runMigrations(dbInstance);

    return dbInstance;
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
    if (!dbInstance) {
        return initializeDatabase();
    }
    return dbInstance;
}

export async function closeDatabase(): Promise<void> {
    if (dbInstance) {
        await dbInstance.closeAsync();
        dbInstance = null;
    }
}

export { dbInstance };
