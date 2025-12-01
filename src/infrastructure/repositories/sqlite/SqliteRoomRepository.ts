import Room from "../../../domain/entities/Room";
import { getDatabase } from "../../database";
import { RoomRow } from "../../database/schema";

export class SqliteRoomRepository {
    async saveRoom(room: Room): Promise<void> {
        const db = await getDatabase();

        await db.runAsync(
            `INSERT OR REPLACE INTO rooms (id, name, code, id_user, image_url, updated_at)
             VALUES (?, ?, ?, ?, ?, datetime('now'))`,
            [
                room.id ?? "",
                room.name,
                room.code ?? null,
                room.idUser ?? null,
                room.imageUrl ?? null,
            ]
        );
    }

    async findById(id: string): Promise<Room | null> {
        const db = await getDatabase();

        const row = await db.getFirstAsync<RoomRow>(
            `SELECT * FROM rooms WHERE id = ?`,
            [id]
        );

        if (!row) {
            return null;
        }

        return this.mapRowToRoom(row);
    }

    async findByCode(code: string): Promise<Room | null> {
        const db = await getDatabase();

        const row = await db.getFirstAsync<RoomRow>(
            `SELECT * FROM rooms WHERE code = ?`,
            [code]
        );

        if (!row) {
            return null;
        }

        return this.mapRowToRoom(row);
    }

    async getAllRooms(): Promise<Room[]> {
        const db = await getDatabase();

        const rows = await db.getAllAsync<RoomRow>(`SELECT * FROM rooms`);

        return rows.map((row) => this.mapRowToRoom(row));
    }

    async deleteRoom(id: string): Promise<void> {
        const db = await getDatabase();
        await db.runAsync(`DELETE FROM rooms WHERE id = ?`, [id]);
    }

    async updateRoom(room: Room): Promise<void> {
        const db = await getDatabase();

        await db.runAsync(
            `UPDATE rooms SET name = ?, code = ?, id_user = ?, image_url = ?, updated_at = datetime('now')
             WHERE id = ?`,
            [
                room.name,
                room.code ?? null,
                room.idUser ?? null,
                room.imageUrl ?? null,
                room.id ?? "",
            ]
        );
    }

    async clearAll(): Promise<void> {
        const db = await getDatabase();
        await db.runAsync(`DELETE FROM rooms`);
    }

    private mapRowToRoom(row: RoomRow): Room {
        return Room.create({
            id: row.id,
            name: row.name,
            code: row.code ?? undefined,
            idUser: row.id_user ?? undefined,
            imageUrl: row.image_url ?? undefined,
        });
    }
}
