import Room from "../../../domain/entities/Room";
import { IRoomRepository } from "../../../domain/interfaces/iroom-repository";
import Password from "../../../domain/value-objects/Password";
import { networkService } from "../../services/NetworkService";
import { syncService } from "../../services/SyncService";
import { SqliteRoomRepository } from "../sqlite/SqliteRoomRepository";

export class CachedRoomRepository implements IRoomRepository {
    constructor(
        private readonly remoteRepository: IRoomRepository,
        private readonly localRepository: SqliteRoomRepository = new SqliteRoomRepository()
    ) {}

    async createRoom(name: string, password: Password): Promise<Room> {
        // Creating a room requires online connection
        if (!networkService.isOnline()) {
            throw new Error(
                "Não é possível criar sala offline. Verifique sua conexão."
            );
        }

        const room = await this.remoteRepository.createRoom(name, password);

        // Cache the room locally (without password)
        if (room.id) {
            await this.localRepository.saveRoom(room);
        }

        return room;
    }

    async enterRoom(code: string, password: Password): Promise<Room> {
        // Entering a room requires online connection for password verification
        if (!networkService.isOnline()) {
            throw new Error(
                "Não é possível entrar na sala offline. Verifique sua conexão."
            );
        }

        const room = await this.remoteRepository.enterRoom(code, password);

        // Cache the room locally
        if (room.id) {
            await this.localRepository.saveRoom(room);
        }

        return room;
    }

    async getRoomsList(): Promise<Room[]> {
        if (networkService.isOnline()) {
            try {
                const rooms = await this.remoteRepository.getRoomsList();

                // Update local cache
                for (const room of rooms) {
                    if (room.id) {
                        await this.localRepository.saveRoom(room);
                    }
                }

                return rooms;
            } catch {
                // Fall back to local cache
                return this.localRepository.getAllRooms();
            }
        }

        // Offline: return cached rooms
        return this.localRepository.getAllRooms();
    }
}
