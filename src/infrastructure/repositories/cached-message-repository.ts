import Message from "../../domain/entities/Message";
import { IMessageRepository } from "../../domain/interfaces/imessage-repository";
import { ICacheStorage } from "../cache/icache-storage";
import { MessageType } from "../../shared/types";

const CACHE_TTL_SECONDS = 300; // 5 minutes cache TTL

export class CachedMessageRepository implements IMessageRepository {
    constructor(
        private readonly messageRepository: IMessageRepository,
        private readonly cache: ICacheStorage
    ) {}

    private getCacheKey(roomId: string): string {
        return `messages:room:${roomId}`;
    }

    async sendMessage(
        content: string,
        roomId: string,
        senderId: string,
        type: MessageType = MessageType.Text,
        mediaUri?: string
    ): Promise<Message> {
        const message = await this.messageRepository.sendMessage(
            content,
            roomId,
            senderId,
            type,
            mediaUri
        );

        await this.cache.delete(this.getCacheKey(roomId));

        return message;
    }

    async getMessagesByRoom(roomId: string): Promise<Message[]> {
        const cacheKey = this.getCacheKey(roomId);

        const cached = await this.cache.get<
            {
                content: string;
                roomId: string;
                senderId: string;
                createdAt: string;
                type?: string;
                fileUrl?: string;
                id?: string;
            }[]
        >(cacheKey);

        if (cached) {
            return cached.map((msg) =>
                Message.create({
                    id: msg.id,
                    content: msg.content,
                    roomId: msg.roomId,
                    senderId: msg.senderId,
                    createdAt: msg.createdAt,
                    type: msg.type,
                    fileUrl: msg.fileUrl,
                })
            );
        }

        const messages = await this.messageRepository.getMessagesByRoom(roomId);

        const messagesData = messages.map((msg) => ({
            id: msg.id,
            content: msg.content,
            roomId: msg.roomId,
            senderId: msg.senderId,
            createdAt: msg.createdAt,
            type: msg.type,
            fileUrl: msg.fileUrl,
        }));

        await this.cache.set(cacheKey, messagesData, CACHE_TTL_SECONDS);

        return messages;
    }

    subscribeToMessages(
        roomId: string,
        callback: (message: Message) => void
    ): () => void {
        const wrappedCallback = async (message: Message) => {
            await this.cache.delete(this.getCacheKey(roomId));
            callback(message);
        };

        return this.messageRepository.subscribeToMessages(
            roomId,
            wrappedCallback
        );
    }
}
