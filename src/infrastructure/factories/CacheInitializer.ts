import { SQLiteDatabase } from "../cache/sqlite-database";
import { MessageServiceFactory } from "./MessageServiceFactory";
import { RoomServiceFactory } from "./RoomServiceFactory";

export class CacheInitializer {
    private static initialized = false;

    static async initialize(): Promise<void> {
        if (this.initialized) return;

        try {
            // Initialize SQLite database
            const sqliteDb = SQLiteDatabase.getInstance();
            await sqliteDb.initialize();

            // Initialize cached repositories in all factories
            MessageServiceFactory.initializeCache();
            RoomServiceFactory.initializeCache();

            this.initialized = true;
            console.log("Cache layer initialized successfully");
        } catch (error) {
            console.error("Failed to initialize cache layer:", error);
            // App will continue to work without cache
        }
    }

    static isInitialized(): boolean {
        return this.initialized;
    }

    static async clearCache(): Promise<void> {
        const sqliteDb = SQLiteDatabase.getInstance();
        await sqliteDb.clearAllData();
    }

    static async syncPendingMessages(): Promise<void> {
        const cachedRepo = MessageServiceFactory.getCachedRepository();
        if (cachedRepo) {
            await cachedRepo.syncUnsyncedMessages();
        }
    }
}
