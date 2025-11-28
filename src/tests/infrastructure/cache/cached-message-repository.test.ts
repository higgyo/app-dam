import { CachedMessageRepository } from "../../../infrastructure/cache/cached-message-repository";
import { IMessageRepository } from "../../../domain/interfaces/imessage-repository";
import Message from "../../../domain/entities/Message";
import { MessageType } from "../../../shared/types";

// Mock SQLite database
const mockDb = {
    runAsync: jest.fn(),
    getAllAsync: jest.fn(),
    getFirstAsync: jest.fn(),
};

const mockSqliteDatabase = {
    getDatabase: () => mockDb,
    initialize: jest.fn(),
    clearAllData: jest.fn(),
};

// Mock remote repository
const mockRemoteRepository: jest.Mocked<IMessageRepository> = {
    sendMessage: jest.fn(),
    getMessagesByRoom: jest.fn(),
    subscribeToMessages: jest.fn(),
};

describe("CachedMessageRepository", () => {
    let cachedRepo: CachedMessageRepository;

    beforeEach(() => {
        jest.clearAllMocks();
        cachedRepo = new CachedMessageRepository(
            mockRemoteRepository,
            mockSqliteDatabase as any
        );
    });

    describe("sendMessage", () => {
        it("should send message via remote and cache it on success", async () => {
            const mockMessage = Message.create({
                id: "msg-123",
                content: "Hello!",
                roomId: "room-1",
                senderId: "user-1",
                createdAt: "2024-01-01T00:00:00Z",
                type: "text",
            });

            mockRemoteRepository.sendMessage.mockResolvedValue(mockMessage);

            const result = await cachedRepo.sendMessage(
                "Hello!",
                "room-1",
                "user-1",
                MessageType.Text
            );

            expect(mockRemoteRepository.sendMessage).toHaveBeenCalledWith(
                "Hello!",
                "room-1",
                "user-1",
                MessageType.Text,
                undefined
            );
            expect(mockDb.runAsync).toHaveBeenCalled();
            expect(result.content).toBe("Hello!");
        });

        it("should store message locally when remote fails", async () => {
            mockRemoteRepository.sendMessage.mockRejectedValue(new Error("Network error"));

            const result = await cachedRepo.sendMessage(
                "Offline message",
                "room-1",
                "user-1",
                MessageType.Text
            );

            expect(mockDb.runAsync).toHaveBeenCalled();
            expect(result.content).toBe("Offline message");
            expect(result.id).toContain("local_");
        });
    });

    describe("getMessagesByRoom", () => {
        it("should fetch from remote and cache messages on success", async () => {
            const mockMessages = [
                Message.create({
                    id: "msg-1",
                    content: "Message 1",
                    roomId: "room-1",
                    senderId: "user-1",
                    createdAt: "2024-01-01T00:00:00Z",
                    type: "text",
                }),
                Message.create({
                    id: "msg-2",
                    content: "Message 2",
                    roomId: "room-1",
                    senderId: "user-2",
                    createdAt: "2024-01-01T00:01:00Z",
                    type: "text",
                }),
            ];

            mockRemoteRepository.getMessagesByRoom.mockResolvedValue(mockMessages);
            mockDb.getAllAsync.mockResolvedValue([]); // No local unsynced messages

            const result = await cachedRepo.getMessagesByRoom("room-1");

            expect(mockRemoteRepository.getMessagesByRoom).toHaveBeenCalledWith("room-1");
            expect(mockDb.runAsync).toHaveBeenCalledTimes(2); // Cache both messages
            expect(result.length).toBe(2);
        });

        it("should return cached messages when remote fails", async () => {
            mockRemoteRepository.getMessagesByRoom.mockRejectedValue(new Error("Network error"));
            mockDb.getAllAsync.mockResolvedValue([
                {
                    id: "cached-msg",
                    content: "Cached message",
                    room_id: "room-1",
                    sender_id: "user-1",
                    created_at: "2024-01-01T00:00:00Z",
                    type: "text",
                    file_url: null,
                },
            ]);

            const result = await cachedRepo.getMessagesByRoom("room-1");

            expect(result.length).toBe(1);
            expect(result[0].content).toBe("Cached message");
        });
    });

    describe("subscribeToMessages", () => {
        it("should subscribe to remote and cache incoming messages", () => {
            const mockCallback = jest.fn();
            const mockUnsubscribe = jest.fn();
            mockRemoteRepository.subscribeToMessages.mockReturnValue(mockUnsubscribe);

            const unsubscribe = cachedRepo.subscribeToMessages("room-1", mockCallback);

            expect(mockRemoteRepository.subscribeToMessages).toHaveBeenCalled();
            expect(unsubscribe).toBe(mockUnsubscribe);
        });
    });
});
