import User from "../../../domain/entities/User";
import { IUserRepository } from "../../../domain/interfaces/iuser-repository";
import Email from "../../../domain/value-objects/Email";
import Password from "../../../domain/value-objects/Password";
import { SyncQueueRow } from "../../database/schema";
import { networkService } from "../../services/NetworkService";
import { syncService } from "../../services/SyncService";
import { SqliteUserRepository } from "../sqlite/SqliteUserRepository";

export class CachedUserRepository implements IUserRepository {
    constructor(
        private readonly remoteRepository: IUserRepository,
        private readonly localRepository: SqliteUserRepository = new SqliteUserRepository()
    ) {
        // Register sync handler for users
        this.registerSyncHandler();
    }

    private registerSyncHandler(): void {
        syncService.registerHandler("user", async (op: SyncQueueRow) => {
            try {
                const data = JSON.parse(op.data);
                if (op.operation === "update") {
                    // Create a user object for the update
                    const user = User.create({
                        id: data.id,
                        name: data.name,
                        email: data.email,
                        password: "SyncPlaceholder#1", // Required by User.create but not used for sync
                        latitude: data.latitude,
                        longitude: data.longitude,
                    });
                    await this.remoteRepository.update(user);
                    return true;
                }
                // Other operations can be added here as needed
                return true;
            } catch {
                return false;
            }
        });
    }

    async login(email: Email, password: Password): Promise<User> {
        // Login always requires online connection since it needs to authenticate with Supabase
        if (!networkService.isOnline()) {
            throw new Error(
                "Não é possível fazer login offline. Verifique sua conexão."
            );
        }

        const user = await this.remoteRepository.login(email, password);

        // Cache the user locally (without password)
        await this.localRepository.saveUser(user);

        return user;
    }

    async verifyAuthentication(): Promise<User> {
        if (networkService.isOnline()) {
            try {
                const user = await this.remoteRepository.verifyAuthentication();
                // Cache the user locally
                await this.localRepository.saveUser(user);
                return user;
            } catch (error) {
                // If online verification fails, try local cache
                console.warn(
                    "Failed to verify authentication online, using cache:",
                    error
                );
                const cachedUsers = await this.localRepository.getAllUsers();
                if (cachedUsers.length > 0) {
                    return cachedUsers[0];
                }
                throw new Error("Usuário não está autenticado");
            }
        }

        // Offline: return cached user if available
        const cachedUsers = await this.localRepository.getAllUsers();
        if (cachedUsers.length > 0) {
            return cachedUsers[0];
        }

        throw new Error(
            "Não é possível verificar autenticação offline sem dados em cache"
        );
    }

    async register(
        username: string,
        email: Email,
        password: Password
    ): Promise<User> {
        // Registration always requires online connection
        if (!networkService.isOnline()) {
            throw new Error(
                "Não é possível registrar offline. Verifique sua conexão."
            );
        }

        const user = await this.remoteRepository.register(
            username,
            email,
            password
        );

        // Cache the user locally
        await this.localRepository.saveUser(user);

        return user;
    }

    async logout(): Promise<void> {
        if (networkService.isOnline()) {
            await this.remoteRepository.logout();
        }

        // Clear local user cache
        await this.localRepository.clearAll();
    }

    async findById(id: string): Promise<User | null> {
        if (networkService.isOnline()) {
            try {
                const user = await this.remoteRepository.findById(id);
                if (user) {
                    await this.localRepository.saveUser(user);
                }
                return user;
            } catch (error) {
                // Fall back to local cache on any error
                console.warn(
                    "Failed to find user online, using cache:",
                    error
                );
                return this.localRepository.findById(id);
            }
        }

        // Offline: return cached user
        return this.localRepository.findById(id);
    }

    async update(user: User): Promise<void> {
        // Always update local cache
        await this.localRepository.updateUser(user);

        if (networkService.isOnline()) {
            try {
                await this.remoteRepository.update(user);
            } catch {
                // Queue for later sync
                await syncService.addToQueue({
                    entityType: "user",
                    entityId: user.id,
                    operation: "update",
                    data: {
                        id: user.id,
                        name: user.name,
                        email: user.email.value,
                        latitude: user.location?.latitude,
                        longitude: user.location?.longitude,
                    },
                });
            }
        } else {
            // Queue for later sync
            await syncService.addToQueue({
                entityType: "user",
                entityId: user.id,
                operation: "update",
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email.value,
                    latitude: user.location?.latitude,
                    longitude: user.location?.longitude,
                },
            });
        }
    }
}
