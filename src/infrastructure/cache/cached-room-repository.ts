import Room from "../../domain/entities/Room";
import Password from "../../domain/value-objects/Password";
import { IRoomRepository } from "../../domain/interfaces/iroom-repository";
import { SQLiteDatabase } from "./sqlite-database";

interface CachedRoom {
    id: string;
    name: string;
    code: string | null;
    created_by: string | null;
    image_url: string | null;
}

export class CachedRoomRepository implements IRoomRepository {
    constructor(
        private readonly remoteRepository: IRoomRepository,
        private readonly sqliteDb: SQLiteDatabase
    ) {}

    async createRoom(name: string, password: Password): Promise<Room> {
        // Room creation requires network - delegate to remote
        const room = await this.remoteRepository.createRoom(name, password);

        // Cache the new room
        const db = this.sqliteDb.getDatabase();
        if (room.id) {
            await db.runAsync(
                `INSERT OR REPLACE INTO rooms (id, name, code, created_by, image_url, updated_at)
                 VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
                room.id,
                room.name,
                room.code || null,
                room.idUser || null,
                room.imageUrl || null
            );
        }

        return room;
    }

    async enterRoom(code: string, password: Password): Promise<Room> {
        // Entering a room requires network validation - delegate to remote
        const room = await this.remoteRepository.enterRoom(code, password);

        // Cache the room and membership
        const db = this.sqliteDb.getDatabase();
        if (room.id) {
            await db.runAsync(
                `INSERT OR REPLACE INTO rooms (id, name, code, created_by, image_url, updated_at)
                 VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
                room.id,
                room.name,
                room.code || null,
                room.idUser || null,
                room.imageUrl || null
            );
        }

        return room;
    }

    async getRoomsList(): Promise<Room[]> {
        const db = this.sqliteDb.getDatabase();

        try {
            // Try to fetch from remote first
            const remoteRooms = await this.remoteRepository.getRoomsList();

            // Cache all fetched rooms
            for (const room of remoteRooms) {
                if (room.id) {
                    await db.runAsync(
                        `INSERT OR REPLACE INTO rooms (id, name, code, created_by, image_url, updated_at)
                         VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
                        room.id,
                        room.name,
                        room.code || null,
                        room.idUser || null,
                        room.imageUrl || null
                    );
                }
            }

            return remoteRooms;
        } catch {
            // If remote fails, return cached rooms
            const cachedRooms = await db.getAllAsync<CachedRoom>(
                `SELECT * FROM rooms ORDER BY name ASC`
            );

            return cachedRooms.map((room) =>
                Room.create({
                    id: room.id,
                    name: room.name,
                    code: room.code || undefined,
                    idUser: room.created_by || undefined,
                    imageUrl: room.image_url || undefined,
                })
            );
        }
    }

    async getCachedRoomById(roomId: string): Promise<Room | null> {
        const db = this.sqliteDb.getDatabase();
        
        const cachedRoom = await db.getFirstAsync<CachedRoom>(
            `SELECT * FROM rooms WHERE id = ?`,
            roomId
        );

        if (!cachedRoom) return null;

        return Room.create({
            id: cachedRoom.id,
            name: cachedRoom.name,
            code: cachedRoom.code || undefined,
            idUser: cachedRoom.created_by || undefined,
            imageUrl: cachedRoom.image_url || undefined,
        });
    }
}
