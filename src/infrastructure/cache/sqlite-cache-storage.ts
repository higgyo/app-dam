import * as SQLite from "expo-sqlite";
import { ICacheStorage } from "./icache-storage";

interface CacheEntry {
    key: string;
    value: string;
    expires_at: number | null;
}

export class SQLiteCacheStorage implements ICacheStorage {
    private db: SQLite.SQLiteDatabase | null = null;
    private initPromise: Promise<void> | null = null;

    constructor(private readonly databaseName: string = "app_cache.db") {}

    private async getDatabase(): Promise<SQLite.SQLiteDatabase> {
        if (!this.initPromise) {
            this.initPromise = this.initializeDatabase();
        }
        await this.initPromise;
        if (!this.db) {
            throw new Error("Database not initialized");
        }
        return this.db;
    }

    private async initializeDatabase(): Promise<void> {
        this.db = await SQLite.openDatabaseAsync(this.databaseName);
        await this.db.execAsync(`
            CREATE TABLE IF NOT EXISTS cache (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                expires_at INTEGER
            );
            CREATE INDEX IF NOT EXISTS idx_cache_expires ON cache(expires_at);
        `);
    }

    async get<T>(key: string): Promise<T | null> {
        const db = await this.getDatabase();
        const now = Date.now();

        const row = await db.getFirstAsync<CacheEntry>(
            "SELECT key, value, expires_at FROM cache WHERE key = ?",
            [key]
        );

        if (!row) {
            return null;
        }

        if (row.expires_at !== null && row.expires_at < now) {
            await this.delete(key);
            return null;
        }

        return JSON.parse(row.value) as T;
    }

    async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
        const db = await this.getDatabase();
        const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
        const valueString = JSON.stringify(value);

        await db.runAsync(
            `INSERT OR REPLACE INTO cache (key, value, expires_at) VALUES (?, ?, ?)`,
            [key, valueString, expiresAt]
        );
    }

    async delete(key: string): Promise<void> {
        const db = await this.getDatabase();
        await db.runAsync("DELETE FROM cache WHERE key = ?", [key]);
    }

    async clear(): Promise<void> {
        const db = await this.getDatabase();
        await db.runAsync("DELETE FROM cache");
    }

    async has(key: string): Promise<boolean> {
        const result = await this.get(key);
        return result !== null;
    }

    async cleanExpired(): Promise<void> {
        const db = await this.getDatabase();
        const now = Date.now();
        await db.runAsync(
            "DELETE FROM cache WHERE expires_at IS NOT NULL AND expires_at < ?",
            [now]
        );
    }
}
