import Message from "../../../domain/entities/Message";
import { IMessageRepository } from "../../../domain/interfaces/imessage-repository";
import { MessageType } from "../../../shared/types";
import { networkService } from "../../services/NetworkService";
import { syncService } from "../../services/SyncService";
import { SqliteMessageRepository } from "../sqlite/SqliteMessageRepository";
import * as Crypto from "expo-crypto";

export class CachedMessageRepository implements IMessageRepository {
    constructor(
        private readonly remoteRepository: IMessageRepository,
        private readonly localRepository: SqliteMessageRepository = new SqliteMessageRepository()
    ) {}

    async sendMessage(
        content: string,
        roomId: string,
        senderId: string,
        type: MessageType = MessageType.Text,
        mediaUri?: string
    ): Promise<Message> {
        if (networkService.isOnline()) {
            try {
                const message = await this.remoteRepository.sendMessage(
                    content,
                    roomId,
                    senderId,
                    type,
                    mediaUri
                );

                // Cache the message locally
                await this.localRepository.saveMessage(message);

                return message;
            } catch (error) {
                // If online send fails, create local message and queue for sync
                const localMessage = await this.createLocalMessage(
                    content,
                    roomId,
                    senderId,
                    type,
                    mediaUri
                );
                return localMessage;
            }
        }

        // Offline: create local message and queue for sync
        return this.createLocalMessage(
            content,
            roomId,
            senderId,
            type,
            mediaUri
        );
    }

    private async createLocalMessage(
        content: string,
        roomId: string,
        senderId: string,
        type: MessageType,
        mediaUri?: string
    ): Promise<Message> {
        const localId = Crypto.randomUUID();
        const createdAt = new Date().toISOString();

        const message = Message.create({
            id: localId,
            content,
            roomId,
            senderId,
            createdAt,
            type,
            fileUrl: mediaUri,
        });

        // Save to local cache
        await this.localRepository.saveMessage(message);

        // Queue for later sync (without media for now - media sync is complex)
        await syncService.addToQueue({
            entityType: "message",
            entityId: localId,
            operation: "create",
            data: {
                content,
                roomId,
                senderId,
                type,
                createdAt,
                // Note: mediaUri not included - media files need special handling
            },
        });

        return message;
    }

    async getMessagesByRoom(roomId: string): Promise<Message[]> {
        if (networkService.isOnline()) {
            try {
                const messages =
                    await this.remoteRepository.getMessagesByRoom(roomId);

                // Update local cache
                await this.localRepository.saveMessages(messages);

                return messages;
            } catch {
                // Fall back to local cache
                return this.localRepository.getMessagesByRoom(roomId);
            }
        }

        // Offline: return cached messages
        return this.localRepository.getMessagesByRoom(roomId);
    }

    subscribeToMessages(
        roomId: string,
        callback: (message: Message) => void
    ): () => void {
        // Realtime subscription only works online
        // We wrap the callback to also cache received messages
        const wrappedCallback = async (message: Message) => {
            await this.localRepository.saveMessage(message);
            callback(message);
        };

        return this.remoteRepository.subscribeToMessages(
            roomId,
            wrappedCallback
        );
    }
}
