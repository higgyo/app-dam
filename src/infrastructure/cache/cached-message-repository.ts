import Message from "../../domain/entities/Message";
import { IMessageRepository } from "../../domain/interfaces/imessage-repository";
import { MessageType } from "../../shared/types";
import { SQLiteDatabase } from "./sqlite-database";
import * as Crypto from "expo-crypto";

interface CachedMessage {
    id: string;
    content: string | null;
    room_id: string;
    sender_id: string;
    created_at: string;
    type: string;
    file_url: string | null;
    synced: number;
}

export class CachedMessageRepository implements IMessageRepository {
    constructor(
        private readonly remoteRepository: IMessageRepository,
        private readonly sqliteDb: SQLiteDatabase
    ) {}

    async sendMessage(
        content: string,
        roomId: string,
        senderId: string,
        type: MessageType = MessageType.Text,
        mediaUri?: string
    ): Promise<Message> {
        const db = this.sqliteDb.getDatabase();

        try {
            // Try to send via remote first
            const message = await this.remoteRepository.sendMessage(
                content,
                roomId,
                senderId,
                type,
                mediaUri
            );

            // Cache the synced message
            await db.runAsync(
                `INSERT OR REPLACE INTO messages (id, content, room_id, sender_id, created_at, type, file_url, synced, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)`,
                message.id || "",
                message.content,
                message.roomId,
                message.senderId,
                message.createdAt,
                message.type,
                message.fileUrl || null
            );

            return message;
        } catch {
            // If remote fails, save locally as unsynced (for offline support)
            const localId = `local_${Crypto.randomUUID()}`;
            const createdAt = new Date().toISOString();

            await db.runAsync(
                `INSERT INTO messages (id, content, room_id, sender_id, created_at, type, file_url, synced, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)`,
                localId,
                content,
                roomId,
                senderId,
                createdAt,
                type,
                null // Can't upload media offline
            );

            return Message.create({
                id: localId,
                content,
                roomId,
                senderId,
                createdAt,
                type,
            });
        }
    }

    async getMessagesByRoom(roomId: string): Promise<Message[]> {
        const db = this.sqliteDb.getDatabase();

        try {
            // Try to fetch from remote first
            const remoteMessages = await this.remoteRepository.getMessagesByRoom(roomId);

            // Cache remote messages
            for (const msg of remoteMessages) {
                await db.runAsync(
                    `INSERT OR REPLACE INTO messages (id, content, room_id, sender_id, created_at, type, file_url, synced, updated_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)`,
                    msg.id || "",
                    msg.content,
                    msg.roomId,
                    msg.senderId,
                    msg.createdAt,
                    msg.type,
                    msg.fileUrl || null
                );
            }

            // Include any unsynced local messages
            const localUnsynced = await db.getAllAsync<CachedMessage>(
                `SELECT * FROM messages WHERE room_id = ? AND synced = 0 ORDER BY created_at ASC`,
                roomId
            );

            const unsyncedMessages = localUnsynced.map((msg) =>
                Message.create({
                    id: msg.id,
                    content: msg.content || "",
                    roomId: msg.room_id,
                    senderId: msg.sender_id,
                    createdAt: msg.created_at,
                    type: msg.type,
                    fileUrl: msg.file_url || undefined,
                })
            );

            // Merge remote and unsynced messages, sorted by date
            const allMessages = [...remoteMessages, ...unsyncedMessages];
            allMessages.sort((a, b) => 
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );

            return allMessages;
        } catch {
            // If remote fails, return cached messages
            const cachedMessages = await db.getAllAsync<CachedMessage>(
                `SELECT * FROM messages WHERE room_id = ? ORDER BY created_at ASC`,
                roomId
            );

            return cachedMessages.map((msg) =>
                Message.create({
                    id: msg.id,
                    content: msg.content || "",
                    roomId: msg.room_id,
                    senderId: msg.sender_id,
                    createdAt: msg.created_at,
                    type: msg.type,
                    fileUrl: msg.file_url || undefined,
                })
            );
        }
    }

    subscribeToMessages(
        roomId: string,
        callback: (message: Message) => void
    ): () => void {
        // Subscribe to remote and cache new messages
        return this.remoteRepository.subscribeToMessages(roomId, async (message) => {
            const db = this.sqliteDb.getDatabase();

            // Cache the new message
            try {
                await db.runAsync(
                    `INSERT OR REPLACE INTO messages (id, content, room_id, sender_id, created_at, type, file_url, synced, updated_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)`,
                    message.id || "",
                    message.content,
                    message.roomId,
                    message.senderId,
                    message.createdAt,
                    message.type,
                    message.fileUrl || null
                );
            } catch (e) {
                console.error("Failed to cache realtime message:", e);
            }

            callback(message);
        });
    }

    async syncUnsyncedMessages(): Promise<void> {
        const db = this.sqliteDb.getDatabase();
        
        const unsyncedMessages = await db.getAllAsync<CachedMessage>(
            `SELECT * FROM messages WHERE synced = 0 ORDER BY created_at ASC`
        );

        for (const msg of unsyncedMessages) {
            try {
                const syncedMessage = await this.remoteRepository.sendMessage(
                    msg.content || "",
                    msg.room_id,
                    msg.sender_id,
                    msg.type as MessageType
                );

                // Remove local message and add synced version
                await db.runAsync(`DELETE FROM messages WHERE id = ?`, msg.id);
                await db.runAsync(
                    `INSERT OR REPLACE INTO messages (id, content, room_id, sender_id, created_at, type, file_url, synced, updated_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)`,
                    syncedMessage.id || "",
                    syncedMessage.content,
                    syncedMessage.roomId,
                    syncedMessage.senderId,
                    syncedMessage.createdAt,
                    syncedMessage.type,
                    syncedMessage.fileUrl || null
                );
            } catch {
                // Keep unsynced if remote still fails
                console.error(`Failed to sync message ${msg.id}, will retry later`);
            }
        }
    }
}
