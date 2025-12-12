import Room from "../../domain/entities/Room";
import { IRoomRepository } from "../../domain/interfaces/iroom-repository";
import Password from "../../domain/value-objects/Password";
import { DatabaseService } from "./database-service";
import { NetworkService } from "./network-service";
import { SyncService } from "./sync-service";

interface CachedRoom {
    id: string;
    name: string;
    code: string | null;
    id_user: string | null;
    image_url: string | null;
    password: string | null;
    synced: number;
}

export class CachedRoomRepository implements IRoomRepository {
    private remoteRepository: IRoomRepository;
    private databaseService: DatabaseService;
    private networkService: NetworkService;
    private syncService: SyncService;

    constructor(remoteRepository: IRoomRepository) {
        this.remoteRepository = remoteRepository;
        this.databaseService = DatabaseService.getInstance();
        this.networkService = NetworkService.getInstance();
        this.syncService = SyncService.getInstance();
    }

    async createRoom(name: string, password: Password): Promise<Room> {
        // Criação de sala requer conexão para obter o código
        if (!this.networkService.isOnline()) {
            throw new Error("Criar sala requer conexão com a internet");
        }

        const room = await this.remoteRepository.createRoom(name, password);
        await this.cacheRoom(room);
        return room;
    }

    async enterRoom(code: string, password: Password): Promise<Room> {
        // Entrar em sala requer conexão para validar o código
        if (!this.networkService.isOnline()) {
            // Verificar se já temos a sala em cache
            const cachedRoom = await this.getCachedRoomByCode(code);
            if (cachedRoom) {
                return cachedRoom;
            }
            throw new Error("Entrar em sala requer conexão com a internet");
        }

        const room = await this.remoteRepository.enterRoom(code, password);
        await this.cacheRoom(room);
        return room;
    }

    async getRoomsList(): Promise<Room[]> {
        if (this.networkService.isOnline()) {
            try {
                const rooms = await this.remoteRepository.getRoomsList();
                await this.cacheRooms(rooms);
                return rooms;
            } catch (error) {
                // Se falhar, retornar cache
                const cachedRooms = await this.getCachedRooms();
                if (cachedRooms.length > 0) {
                    return cachedRooms;
                }
                throw error;
            }
        }

        // Modo offline - retornar cache
        return this.getCachedRooms();
    }

    private async cacheRoom(room: Room): Promise<void> {
        const db = this.databaseService.getDatabase();

        await db.runAsync(
            `INSERT OR REPLACE INTO rooms 
             (id, name, code, id_user, image_url, password, synced, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, 1, datetime('now'))`,
            [
                room.id ?? "",
                room.name,
                room.code ?? null,
                room.idUser ?? null,
                room.imageUrl ?? null,
                room.password?.value ?? null,
            ]
        );
    }

    private async cacheRooms(rooms: Room[]): Promise<void> {
        for (const room of rooms) {
            await this.cacheRoom(room);
        }
    }

    private async getCachedRooms(): Promise<Room[]> {
        const db = this.databaseService.getDatabase();

        const results = await db.getAllAsync<CachedRoom>(
            `SELECT * FROM rooms ORDER BY updated_at DESC`
        );

        return results.map(this.mapToRoom);
    }

    private async getCachedRoomByCode(code: string): Promise<Room | null> {
        const db = this.databaseService.getDatabase();

        const result = await db.getFirstAsync<CachedRoom>(
            `SELECT * FROM rooms WHERE code = ?`,
            [code]
        );

        if (!result) return null;

        return this.mapToRoom(result);
    }

    async getCachedRoomById(id: string): Promise<Room | null> {
        const db = this.databaseService.getDatabase();

        const result = await db.getFirstAsync<CachedRoom>(
            `SELECT * FROM rooms WHERE id = ?`,
            [id]
        );

        if (!result) return null;

        return this.mapToRoom(result);
    }

    private mapToRoom(cached: CachedRoom): Room {
        return Room.create({
            id: cached.id,
            name: cached.name,
            code: cached.code ?? undefined,
            idUser: cached.id_user ?? undefined,
            imageUrl: cached.image_url ?? undefined,
            password: cached.password ?? undefined,
        });
    }
}
