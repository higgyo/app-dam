import User from "../../domain/entities/User";
import Email from "../../domain/value-objects/Email";
import Password from "../../domain/value-objects/Password";
import { IUserRepository } from "../../domain/interfaces/iuser-repository";
import { SQLiteDatabase } from "./sqlite-database";

interface CachedUser {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
    last_latitude: number | null;
    last_longitude: number | null;
}

export class CachedUserRepository implements IUserRepository {
    constructor(
        private readonly remoteRepository: IUserRepository,
        private readonly sqliteDb: SQLiteDatabase
    ) {}

    async login(email: Email, password: Password): Promise<User> {
        // Login requires network - delegate to remote
        const user = await this.remoteRepository.login(email, password);

        // Cache the logged-in user
        await this.cacheUser(user);

        return user;
    }

    async verifyAuthentication(): Promise<User> {
        const db = this.sqliteDb.getDatabase();

        try {
            // Try to verify with remote
            const user = await this.remoteRepository.verifyAuthentication();
            
            // Cache/update the authenticated user
            await this.cacheUser(user);

            return user;
        } catch {
            // If remote fails, try to return cached current user
            // Note: This is a simplified approach - in production you'd want
            // to store which user is currently logged in
            const cachedUser = await db.getFirstAsync<CachedUser>(
                `SELECT * FROM users ORDER BY updated_at DESC LIMIT 1`
            );

            if (cachedUser) {
                return User.create({
                    id: cachedUser.id,
                    name: cachedUser.name,
                    email: cachedUser.email,
                    password: "Cached#123", // Placeholder - password isn't stored
                    latitude: cachedUser.last_latitude || undefined,
                    longitude: cachedUser.last_longitude || undefined,
                });
            }

            throw new Error("Usuário não está autenticado");
        }
    }

    async register(
        username: string,
        email: Email,
        password: Password
    ): Promise<User> {
        // Registration requires network - delegate to remote
        const user = await this.remoteRepository.register(username, email, password);

        // Cache the registered user
        await this.cacheUser(user);

        return user;
    }

    async logout(): Promise<void> {
        await this.remoteRepository.logout();
        
        // Optionally clear user cache on logout
        // Note: keeping cache allows offline access to historical data
    }

    async findById(id: string): Promise<User | null> {
        const db = this.sqliteDb.getDatabase();

        try {
            // Try remote first
            const user = await this.remoteRepository.findById(id);
            
            if (user) {
                await this.cacheUser(user);
            }

            return user;
        } catch {
            // Fall back to cache
            const cachedUser = await db.getFirstAsync<CachedUser>(
                `SELECT * FROM users WHERE id = ?`,
                id
            );

            if (!cachedUser) return null;

            return User.create({
                id: cachedUser.id,
                name: cachedUser.name,
                email: cachedUser.email,
                password: "Cached#123", // Placeholder - password isn't stored
                latitude: cachedUser.last_latitude || undefined,
                longitude: cachedUser.last_longitude || undefined,
            });
        }
    }

    async update(user: User): Promise<void> {
        await this.remoteRepository.update(user);
        
        // Update cache
        await this.cacheUser(user);
    }

    private async cacheUser(user: User): Promise<void> {
        const db = this.sqliteDb.getDatabase();

        await db.runAsync(
            `INSERT OR REPLACE INTO users (id, name, email, avatar_url, last_latitude, last_longitude, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            user.id,
            user.name,
            user.email.value,
            null, // avatar_url
            user.location?.latitude || null,
            user.location?.longitude || null
        );
    }

    async getCachedUser(userId: string): Promise<User | null> {
        const db = this.sqliteDb.getDatabase();
        
        const cachedUser = await db.getFirstAsync<CachedUser>(
            `SELECT * FROM users WHERE id = ?`,
            userId
        );

        if (!cachedUser) return null;

        return User.create({
            id: cachedUser.id,
            name: cachedUser.name,
            email: cachedUser.email,
            password: "Cached#123", // Placeholder
            latitude: cachedUser.last_latitude || undefined,
            longitude: cachedUser.last_longitude || undefined,
        });
    }
}
