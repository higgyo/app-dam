import Message from "../../../domain/entities/Message";
import { getDatabase } from "../../database";
import { MessageRow } from "../../database/schema";

export class SqliteMessageRepository {
    async saveMessage(message: Message): Promise<void> {
        const db = await getDatabase();

        await db.runAsync(
            `INSERT OR REPLACE INTO messages (id, content, room_id, sender_id, created_at, type, file_url, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
            [
                message.id ?? "",
                message.content,
                message.roomId,
                message.senderId,
                message.createdAt,
                message.type,
                message.fileUrl ?? null,
            ]
        );
    }

    async findById(id: string): Promise<Message | null> {
        const db = await getDatabase();

        const row = await db.getFirstAsync<MessageRow>(
            `SELECT * FROM messages WHERE id = ?`,
            [id]
        );

        if (!row) {
            return null;
        }

        return this.mapRowToMessage(row);
    }

    async getMessagesByRoom(roomId: string): Promise<Message[]> {
        const db = await getDatabase();

        const rows = await db.getAllAsync<MessageRow>(
            `SELECT * FROM messages WHERE room_id = ? ORDER BY created_at ASC`,
            [roomId]
        );

        return rows.map((row) => this.mapRowToMessage(row));
    }

    async deleteMessage(id: string): Promise<void> {
        const db = await getDatabase();
        await db.runAsync(`DELETE FROM messages WHERE id = ?`, [id]);
    }

    async deleteMessagesByRoom(roomId: string): Promise<void> {
        const db = await getDatabase();
        await db.runAsync(`DELETE FROM messages WHERE room_id = ?`, [roomId]);
    }

    async saveMessages(messages: Message[]): Promise<void> {
        const db = await getDatabase();

        for (const message of messages) {
            await this.saveMessage(message);
        }
    }

    async clearAll(): Promise<void> {
        const db = await getDatabase();
        await db.runAsync(`DELETE FROM messages`);
    }

    private mapRowToMessage(row: MessageRow): Message {
        return Message.create({
            id: row.id,
            content: row.content,
            roomId: row.room_id,
            senderId: row.sender_id,
            createdAt: row.created_at,
            type: row.type,
            fileUrl: row.file_url ?? undefined,
        });
    }
}
