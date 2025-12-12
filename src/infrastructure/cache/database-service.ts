import * as SQLite from "expo-sqlite";

export class DatabaseService {
    private static instance: DatabaseService;
    private db: SQLite.SQLiteDatabase | null = null;
    private initialized: boolean = false;

    private constructor() {}

    static getInstance(): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }

    async initialize(): Promise<void> {
        if (this.initialized) return;

        this.db = await SQLite.openDatabaseAsync("bo_conecta_cache.db");

        await this.createTables();
        this.initialized = true;
    }

    private async createTables(): Promise<void> {
        if (!this.db) throw new Error("Database not initialized");

        // Tabela de usuários
        await this.db.execAsync(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                password TEXT NOT NULL,
                latitude REAL,
                longitude REAL,
                is_current_user INTEGER DEFAULT 0,
                synced INTEGER DEFAULT 1,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Tabela de salas
        await this.db.execAsync(`
            CREATE TABLE IF NOT EXISTS rooms (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                code TEXT,
                id_user TEXT,
                image_url TEXT,
                password TEXT,
                synced INTEGER DEFAULT 1,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Tabela de mensagens
        await this.db.execAsync(`
            CREATE TABLE IF NOT EXISTS messages (
                id TEXT PRIMARY KEY,
                content TEXT NOT NULL,
                room_id TEXT NOT NULL,
                sender_id TEXT NOT NULL,
                created_at TEXT NOT NULL,
                type TEXT DEFAULT 'text',
                file_url TEXT,
                synced INTEGER DEFAULT 1,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (room_id) REFERENCES rooms(id)
            );
        `);

        // Tabela de operações pendentes para sincronização
        await this.db.execAsync(`
            CREATE TABLE IF NOT EXISTS pending_operations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                entity_type TEXT NOT NULL,
                entity_id TEXT NOT NULL,
                operation TEXT NOT NULL,
                data TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Índices para melhor performance
        await this.db.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id);
        `);

        await this.db.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_messages_synced ON messages(synced);
        `);

        await this.db.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_pending_operations_entity ON pending_operations(entity_type, entity_id);
        `);
    }

    getDatabase(): SQLite.SQLiteDatabase {
        if (!this.db) {
            throw new Error(
                "Database not initialized. Call initialize() first."
            );
        }
        return this.db;
    }

    async clearAllData(): Promise<void> {
        if (!this.db) throw new Error("Database not initialized");

        await this.db.execAsync("DELETE FROM pending_operations;");
        await this.db.execAsync("DELETE FROM messages;");
        await this.db.execAsync("DELETE FROM rooms;");
        await this.db.execAsync("DELETE FROM users;");
    }

    async close(): Promise<void> {
        if (this.db) {
            await this.db.closeAsync();
            this.db = null;
            this.initialized = false;
        }
    }
}
