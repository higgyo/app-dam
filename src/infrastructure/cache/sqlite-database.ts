import * as SQLite from "expo-sqlite";

export class SQLiteDatabase {
    private static instance: SQLiteDatabase | null = null;
    private db: SQLite.SQLiteDatabase | null = null;
    private initialized = false;

    private constructor() {}

    static getInstance(): SQLiteDatabase {
        if (!SQLiteDatabase.instance) {
            SQLiteDatabase.instance = new SQLiteDatabase();
        }
        return SQLiteDatabase.instance;
    }

    async initialize(): Promise<void> {
        if (this.initialized) return;

        this.db = await SQLite.openDatabaseAsync("app_cache.db");

        await this.db.execAsync(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                avatar_url TEXT,
                last_latitude REAL,
                last_longitude REAL,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS rooms (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                code TEXT,
                created_by TEXT,
                image_url TEXT,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS room_members (
                room_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                joined_at TEXT,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (room_id, user_id)
            );

            CREATE TABLE IF NOT EXISTS messages (
                id TEXT PRIMARY KEY,
                content TEXT,
                room_id TEXT NOT NULL,
                sender_id TEXT NOT NULL,
                created_at TEXT NOT NULL,
                type TEXT DEFAULT 'text',
                file_url TEXT,
                synced INTEGER DEFAULT 0,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id);
            CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
            CREATE INDEX IF NOT EXISTS idx_room_members_user_id ON room_members(user_id);
        `);

        this.initialized = true;
    }

    getDatabase(): SQLite.SQLiteDatabase {
        if (!this.db) {
            throw new Error("Database not initialized. Call initialize() first.");
        }
        return this.db;
    }

    async clearAllData(): Promise<void> {
        if (!this.db) return;
        
        await this.db.execAsync(`
            DELETE FROM messages;
            DELETE FROM room_members;
            DELETE FROM rooms;
            DELETE FROM users;
        `);
    }

    async close(): Promise<void> {
        if (this.db) {
            await this.db.closeAsync();
            this.db = null;
            this.initialized = false;
        }
    }
}
