import User from "../../domain/entities/User";
import { IUserRepository } from "../../domain/interfaces/iuser-repository";
import Email from "../../domain/value-objects/Email";
import Password from "../../domain/value-objects/Password";
import { DatabaseService } from "./database-service";
import { NetworkService } from "./network-service";
import { SyncService } from "./sync-service";

interface CachedUser {
    id: string;
    name: string;
    email: string;
    password: string;
    latitude: number | null;
    longitude: number | null;
    is_current_user: number;
    synced: number;
}

export class CachedUserRepository implements IUserRepository {
    private remoteRepository: IUserRepository;
    private databaseService: DatabaseService;
    private networkService: NetworkService;
    private syncService: SyncService;

    constructor(remoteRepository: IUserRepository) {
        this.remoteRepository = remoteRepository;
        this.databaseService = DatabaseService.getInstance();
        this.networkService = NetworkService.getInstance();
        this.syncService = SyncService.getInstance();

        this.registerSyncCallbacks();
    }

    private registerSyncCallbacks(): void {
        this.syncService.registerSyncCallback("user", async (data) => {
            if (data.operation === "update") {
                const user = await this.getCachedUserById(data.entityId);
                if (user) {
                    await this.remoteRepository.update(user);
                    await this.markAsSynced(data.entityId);
                }
            }
        });
    }

    async login(email: Email, password: Password): Promise<User> {
        if (this.networkService.isOnline()) {
            try {
                const user = await this.remoteRepository.login(email, password);
                await this.cacheCurrentUser(user);
                return user;
            } catch (error) {
                // Se falhar online, tentar cache
                const cachedUser = await this.getCachedCurrentUser();
                if (cachedUser && cachedUser.email.value === email.value) {
                    return cachedUser;
                }
                throw error;
            }
        }

        // Modo offline - verificar cache
        const cachedUser = await this.getCachedCurrentUser();
        if (cachedUser && cachedUser.email.value === email.value) {
            return cachedUser;
        }

        throw new Error("Sem conexão e usuário não está em cache");
    }

    async verifyAuthentication(): Promise<User> {
        if (this.networkService.isOnline()) {
            try {
                const user = await this.remoteRepository.verifyAuthentication();
                await this.cacheCurrentUser(user);
                return user;
            } catch (error) {
                // Se falhar online, tentar cache
                const cachedUser = await this.getCachedCurrentUser();
                if (cachedUser) {
                    return cachedUser;
                }
                throw error;
            }
        }

        // Modo offline
        const cachedUser = await this.getCachedCurrentUser();
        if (cachedUser) {
            return cachedUser;
        }

        throw new Error("Usuário não está autenticado");
    }

    async register(
        username: string,
        email: Email,
        password: Password
    ): Promise<User> {
        // Registro requer conexão
        if (!this.networkService.isOnline()) {
            throw new Error("Registro requer conexão com a internet");
        }

        const user = await this.remoteRepository.register(
            username,
            email,
            password
        );
        await this.cacheCurrentUser(user);
        return user;
    }

    async logout(): Promise<void> {
        if (this.networkService.isOnline()) {
            await this.remoteRepository.logout();
        }

        // Limpar usuário atual do cache
        const db = this.databaseService.getDatabase();
        await db.runAsync(`UPDATE users SET is_current_user = 0`);
    }

    async findById(id: string): Promise<User | null> {
        // Primeiro, verificar cache
        const cachedUser = await this.getCachedUserById(id);

        if (this.networkService.isOnline()) {
            try {
                const user = await this.remoteRepository.findById(id);
                if (user) {
                    await this.cacheUser(user);
                    return user;
                }
            } catch (error) {
                // Se falhar, retornar cache se disponível
                if (cachedUser) return cachedUser;
                throw error;
            }
        }

        return cachedUser;
    }

    async update(user: User): Promise<void> {
        // Atualizar cache primeiro (local-first)
        await this.cacheUser(user, false);

        if (this.networkService.isOnline()) {
            try {
                await this.remoteRepository.update(user);
                await this.markAsSynced(user.id);
            } catch (error) {
                // Adicionar à fila de sincronização
                await this.syncService.addPendingOperation(
                    "user",
                    user.id,
                    "update",
                    { userId: user.id }
                );
            }
        } else {
            // Adicionar à fila de sincronização
            await this.syncService.addPendingOperation(
                "user",
                user.id,
                "update",
                { userId: user.id }
            );
        }
    }

    private async cacheCurrentUser(user: User): Promise<void> {
        const db = this.databaseService.getDatabase();

        // Remover flag de usuário atual de todos
        await db.runAsync(`UPDATE users SET is_current_user = 0`);

        // Inserir ou atualizar usuário
        await db.runAsync(
            `INSERT OR REPLACE INTO users 
             (id, name, email, password, latitude, longitude, is_current_user, synced, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, 1, 1, datetime('now'))`,
            [
                user.id,
                user.name,
                user.email.value,
                user.password.value,
                user.location?.latitude ?? null,
                user.location?.longitude ?? null,
            ]
        );
    }

    private async cacheUser(user: User, synced: boolean = true): Promise<void> {
        const db = this.databaseService.getDatabase();

        await db.runAsync(
            `INSERT OR REPLACE INTO users 
             (id, name, email, password, latitude, longitude, synced, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
            [
                user.id,
                user.name,
                user.email.value,
                user.password.value,
                user.location?.latitude ?? null,
                user.location?.longitude ?? null,
                synced ? 1 : 0,
            ]
        );
    }

    private async getCachedCurrentUser(): Promise<User | null> {
        const db = this.databaseService.getDatabase();

        const result = await db.getFirstAsync<CachedUser>(
            `SELECT * FROM users WHERE is_current_user = 1`
        );

        if (!result) return null;

        return this.mapToUser(result);
    }

    private async getCachedUserById(id: string): Promise<User | null> {
        const db = this.databaseService.getDatabase();

        const result = await db.getFirstAsync<CachedUser>(
            `SELECT * FROM users WHERE id = ?`,
            [id]
        );

        if (!result) return null;

        return this.mapToUser(result);
    }

    private mapToUser(cached: CachedUser): User {
        return User.create({
            id: cached.id,
            name: cached.name,
            email: cached.email,
            password: cached.password,
            latitude: cached.latitude ?? undefined,
            longitude: cached.longitude ?? undefined,
        });
    }

    private async markAsSynced(userId: string): Promise<void> {
        const db = this.databaseService.getDatabase();
        await db.runAsync(
            `UPDATE users SET synced = 1, updated_at = datetime('now') WHERE id = ?`,
            [userId]
        );
    }
}
