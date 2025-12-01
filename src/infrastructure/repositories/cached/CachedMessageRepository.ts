import Message from "../../../domain/entities/Message";
import { IMessageRepository } from "../../../domain/interfaces/imessage-repository";
import { MessageType } from "../../../shared/types";
import { SyncQueueRow } from "../../database/schema";
import { networkService } from "../../services/NetworkService";
import { syncService } from "../../services/SyncService";
import { SqliteMessageRepository } from "../sqlite/SqliteMessageRepository";
import * as Crypto from "expo-crypto";

export class CachedMessageRepository implements IMessageRepository {
    constructor(
        private readonly remoteRepository: IMessageRepository,
        private readonly localRepository: SqliteMessageRepository = new SqliteMessageRepository()
    ) {
        // Register sync handler for messages
        this.registerSyncHandler();
    }

    private registerSyncHandler(): void {
        syncService.registerHandler("message", async (op: SyncQueueRow) => {
            try {
                const data = JSON.parse(op.data);
                if (op.operation === "create") {
                    // Send the message to the remote server
                    const remoteMessage = await this.remoteRepository.sendMessage(
                        data.content,
                        data.roomId,
                        data.senderId,
                        data.type as MessageType
                        // Note: mediaUri is not synced - see TODO in createLocalMessage
                    );

                    // Update local cache with the real server ID
                    if (remoteMessage.id && remoteMessage.id !== op.entity_id) {
                        // Delete the local placeholder and save with real ID
                        await this.localRepository.deleteMessage(op.entity_id);
                        await this.localRepository.saveMessage(remoteMessage);
                    }

                    return true;
                }
                // Other operations (update, delete) can be added here as needed
                return true;
            } catch {
                return false;
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

        // Queue for later sync
        // TODO: Media file synchronization is not yet implemented.
        // Currently, media files (images/videos) sent while offline will not be
        // uploaded when connectivity returns. This is a known limitation that
        // requires implementing:
        // 1. Local file caching with expo-file-system
        // 2. Background upload when online
        // 3. URL replacement after successful upload
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
                // mediaUri is intentionally excluded - see TODO above
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
            } catch (error) {
                // Fall back to local cache on any error (network failure, server error, etc.)
                console.warn(
                    "Failed to fetch messages from server, using cache:",
                    error
                );
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
