import Message from "../../domain/entities/Message";
import { IMessageRepository } from "../../domain/interfaces/imessage-repository";
import { MessageType } from "../../shared/types";
import { DatabaseService } from "./database-service";
import { NetworkService } from "./network-service";
import { SyncService } from "./sync-service";
import * as Crypto from "expo-crypto";

interface CachedMessage {
    id: string;
    content: string;
    room_id: string;
    sender_id: string;
    created_at: string;
    type: string;
    file_url: string | null;
    synced: number;
}

export class CachedMessageRepository implements IMessageRepository {
    private remoteRepository: IMessageRepository;
    private databaseService: DatabaseService;
    private networkService: NetworkService;
    private syncService: SyncService;

    constructor(remoteRepository: IMessageRepository) {
        this.remoteRepository = remoteRepository;
        this.databaseService = DatabaseService.getInstance();
        this.networkService = NetworkService.getInstance();
        this.syncService = SyncService.getInstance();

        this.registerSyncCallbacks();
    }

    private registerSyncCallbacks(): void {
        this.syncService.registerSyncCallback("message", async (data) => {
            if (data.operation === "send") {
                await this.remoteRepository.sendMessage(
                    data.content,
                    data.roomId,
                    data.senderId,
                    data.type,
                    data.mediaUri
                );
                await this.markAsSynced(data.entityId);
            }
        });
    }

    async sendMessage(
        content: string,
        roomId: string,
        senderId: string,
        type: MessageType = MessageType.Text,
        mediaUri?: string
    ): Promise<Message> {
        // Criar ID temporário para a mensagem
        const tempId = Crypto.randomUUID();
        const createdAt = new Date().toISOString();

        // Criar mensagem local primeiro (local-first)
        const localMessage = Message.create({
            id: tempId,
            content,
            roomId,
            senderId,
            createdAt,
            type,
            fileUrl: mediaUri,
        });

        // Salvar no cache
        await this.cacheMessage(localMessage, false);

        if (this.networkService.isOnline()) {
            try {
                // Se tem mídia, precisa enviar online para upload
                const remoteMessage = await this.remoteRepository.sendMessage(
                    content,
                    roomId,
                    senderId,
                    type,
                    mediaUri
                );

                // Atualizar cache com dados do servidor
                await this.deleteCachedMessage(tempId);
                await this.cacheMessage(remoteMessage, true);

                return remoteMessage;
            } catch (error) {
                // Se falhar, manter a mensagem local e adicionar à fila
                if (type === MessageType.Text) {
                    await this.syncService.addPendingOperation(
                        "message",
                        tempId,
                        "send",
                        { content, roomId, senderId, type }
                    );
                    return localMessage;
                }
                // Para mídia, precisamos de conexão
                await this.deleteCachedMessage(tempId);
                throw new Error("Envio de mídia requer conexão com a internet");
            }
        }

        // Modo offline
        if (type !== MessageType.Text) {
            await this.deleteCachedMessage(tempId);
            throw new Error("Envio de mídia requer conexão com a internet");
        }

        // Adicionar à fila de sincronização
        await this.syncService.addPendingOperation("message", tempId, "send", {
            content,
            roomId,
            senderId,
            type,
        });

        return localMessage;
    }

    async getMessagesByRoom(roomId: string): Promise<Message[]> {
        if (this.networkService.isOnline()) {
            try {
                const messages = await this.remoteRepository.getMessagesByRoom(
                    roomId
                );
                await this.cacheMessages(roomId, messages);

                // Mesclar com mensagens não sincronizadas
                const unsyncedMessages = await this.getUnsyncedMessages(roomId);
                const allMessages = [...messages, ...unsyncedMessages];

                // Ordenar por data
                allMessages.sort(
                    (a, b) =>
                        new Date(a.createdAt).getTime() -
                        new Date(b.createdAt).getTime()
                );

                return allMessages;
            } catch (error) {
                // Retornar cache se falhar
                return this.getCachedMessages(roomId);
            }
        }

        // Modo offline
        return this.getCachedMessages(roomId);
    }

    subscribeToMessages(
        roomId: string,
        callback: (message: Message) => void
    ): () => void {
        // Subscription real funciona apenas online
        if (this.networkService.isOnline()) {
            return this.remoteRepository.subscribeToMessages(
                roomId,
                async (message) => {
                    // Cachear mensagem recebida
                    await this.cacheMessage(message, true);
                    callback(message);
                }
            );
        }

        // Retornar função vazia se offline
        return () => {};
    }

    private async cacheMessage(
        message: Message,
        synced: boolean
    ): Promise<void> {
        const db = this.databaseService.getDatabase();

        await db.runAsync(
            `INSERT OR REPLACE INTO messages 
             (id, content, room_id, sender_id, created_at, type, file_url, synced, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
            [
                message.id ?? Crypto.randomUUID(),
                message.content,
                message.roomId,
                message.senderId,
                message.createdAt,
                message.type,
                message.fileUrl ?? null,
                synced ? 1 : 0,
            ]
        );
    }

    private async cacheMessages(
        roomId: string,
        messages: Message[]
    ): Promise<void> {
        const db = this.databaseService.getDatabase();

        // Remover mensagens sincronizadas antigas desta sala
        await db.runAsync(
            `DELETE FROM messages WHERE room_id = ? AND synced = 1`,
            [roomId]
        );

        // Inserir novas mensagens
        for (const message of messages) {
            await this.cacheMessage(message, true);
        }
    }

    private async getCachedMessages(roomId: string): Promise<Message[]> {
        const db = this.databaseService.getDatabase();

        const results = await db.getAllAsync<CachedMessage>(
            `SELECT * FROM messages WHERE room_id = ? ORDER BY created_at ASC`,
            [roomId]
        );

        return results.map(this.mapToMessage);
    }

    private async getUnsyncedMessages(roomId: string): Promise<Message[]> {
        const db = this.databaseService.getDatabase();

        const results = await db.getAllAsync<CachedMessage>(
            `SELECT * FROM messages WHERE room_id = ? AND synced = 0 ORDER BY created_at ASC`,
            [roomId]
        );

        return results.map(this.mapToMessage);
    }

    private async deleteCachedMessage(messageId: string): Promise<void> {
        const db = this.databaseService.getDatabase();
        await db.runAsync(`DELETE FROM messages WHERE id = ?`, [messageId]);
    }

    private async markAsSynced(messageId: string): Promise<void> {
        const db = this.databaseService.getDatabase();
        await db.runAsync(
            `UPDATE messages SET synced = 1, updated_at = datetime('now') WHERE id = ?`,
            [messageId]
        );
    }

    private mapToMessage(cached: CachedMessage): Message {
        return Message.create({
            id: cached.id,
            content: cached.content,
            roomId: cached.room_id,
            senderId: cached.sender_id,
            createdAt: cached.created_at,
            type: cached.type,
            fileUrl: cached.file_url ?? undefined,
        });
    }
}
