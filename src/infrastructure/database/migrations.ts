import * as SQLite from "expo-sqlite";

const DATABASE_NAME = "boconecta.db";

export async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
    // Create users table
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY NOT NULL,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            latitude REAL,
            longitude REAL,
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
    `);

    // Create rooms table
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS rooms (
            id TEXT PRIMARY KEY NOT NULL,
            name TEXT NOT NULL,
            code TEXT,
            id_user TEXT,
            image_url TEXT,
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
    `);

    // Create messages table
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY NOT NULL,
            content TEXT NOT NULL,
            room_id TEXT NOT NULL,
            sender_id TEXT NOT NULL,
            created_at TEXT NOT NULL,
            type TEXT NOT NULL DEFAULT 'text',
            file_url TEXT,
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
    `);

    // Create sync_queue table for pending operations
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS sync_queue (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            entity_type TEXT NOT NULL,
            entity_id TEXT NOT NULL,
            operation TEXT NOT NULL,
            data TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            retry_count INTEGER NOT NULL DEFAULT 0
        );
    `);

    // Create indexes for better query performance
    await db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id);
        CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
        CREATE INDEX IF NOT EXISTS idx_sync_queue_entity ON sync_queue(entity_type, entity_id);
    `);
}
