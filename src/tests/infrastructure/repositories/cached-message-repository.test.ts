import { CachedMessageRepository } from "../../../infrastructure/repositories/cached-message-repository";
import { MockCacheStorage } from "../cache/mock-cache-storage";
import { MockMessageRepository } from "./mock-message-repository";
import Message from "../../../domain/entities/Message";
import { MessageType } from "../../../shared/types";

describe("CachedMessageRepository", () => {
    let cachedRepo: CachedMessageRepository;
    let mockRepo: MockMessageRepository;
    let mockCache: MockCacheStorage;

    beforeEach(() => {
        mockRepo = new MockMessageRepository();
        mockCache = new MockCacheStorage();
        cachedRepo = new CachedMessageRepository(mockRepo, mockCache);
    });

    describe("getMessagesByRoom", () => {
        it("should return messages from repository on first call", async () => {
            const roomId = "room-1";
            const message = Message.create({
                id: "msg-1",
                content: "Hello",
                roomId,
                senderId: "user-1",
                createdAt: new Date().toISOString(),
                type: "text",
            });
            mockRepo.addTestMessage(message);

            const result = await cachedRepo.getMessagesByRoom(roomId);

            expect(result).toHaveLength(1);
            expect(result[0].content).toBe("Hello");
            expect(mockRepo.getGetMessagesCallCount()).toBe(1);
        });

        it("should return cached messages on subsequent calls", async () => {
            const roomId = "room-1";
            const message = Message.create({
                id: "msg-1",
                content: "Hello",
                roomId,
                senderId: "user-1",
                createdAt: new Date().toISOString(),
                type: "text",
            });
            mockRepo.addTestMessage(message);

            await cachedRepo.getMessagesByRoom(roomId);
            await cachedRepo.getMessagesByRoom(roomId);
            await cachedRepo.getMessagesByRoom(roomId);

            expect(mockRepo.getGetMessagesCallCount()).toBe(1);
        });

        it("should return empty array for room with no messages", async () => {
            const result = await cachedRepo.getMessagesByRoom("empty-room");

            expect(result).toHaveLength(0);
        });
    });

    describe("sendMessage", () => {
        it("should send message and invalidate cache", async () => {
            const roomId = "room-1";

            // Prime the cache
            await cachedRepo.getMessagesByRoom(roomId);

            // Send a message
            const message = await cachedRepo.sendMessage(
                "New message",
                roomId,
                "user-1",
                MessageType.Text
            );

            expect(message.content).toBe("New message");
            expect(mockRepo.getSendMessageCallCount()).toBe(1);

            // The next getMessages call should hit the repository again
            await cachedRepo.getMessagesByRoom(roomId);
            expect(mockRepo.getGetMessagesCallCount()).toBe(2);
        });

        it("should send message with media", async () => {
            const message = await cachedRepo.sendMessage(
                "Photo",
                "room-1",
                "user-1",
                MessageType.Image,
                "http://example.com/image.jpg"
            );

            expect(message.content).toBe("Photo");
            expect(message.type).toBe(MessageType.Image);
        });
    });

    describe("subscribeToMessages", () => {
        it("should return unsubscribe function", () => {
            const unsubscribe = cachedRepo.subscribeToMessages(
                "room-1",
                () => {}
            );

            expect(typeof unsubscribe).toBe("function");
        });
    });
});
