import { CachedRoomRepository } from "../../../infrastructure/repositories/cached-room-repository";
import { MockCacheStorage } from "../cache/mock-cache-storage";
import { MockRoomRepository } from "./mock-room-repository";
import Room from "../../../domain/entities/Room";
import Password from "../../../domain/value-objects/Password";

describe("CachedRoomRepository", () => {
    let cachedRepo: CachedRoomRepository;
    let mockRepo: MockRoomRepository;
    let mockCache: MockCacheStorage;

    beforeEach(() => {
        mockRepo = new MockRoomRepository();
        mockCache = new MockCacheStorage();
        cachedRepo = new CachedRoomRepository(mockRepo, mockCache);
    });

    describe("getRoomsList", () => {
        it("should return rooms from repository on first call", async () => {
            const room = Room.create({
                id: "room-1",
                name: "Test Room",
                code: "ABC123",
            });
            mockRepo.addTestRoom(room);

            const result = await cachedRepo.getRoomsList();

            expect(result).toHaveLength(1);
            expect(result[0].name).toBe("Test Room");
            expect(mockRepo.getGetRoomsListCallCount()).toBe(1);
        });

        it("should return cached rooms on subsequent calls", async () => {
            const room = Room.create({
                id: "room-1",
                name: "Test Room",
                code: "ABC123",
            });
            mockRepo.addTestRoom(room);

            await cachedRepo.getRoomsList();
            await cachedRepo.getRoomsList();
            await cachedRepo.getRoomsList();

            expect(mockRepo.getGetRoomsListCallCount()).toBe(1);
        });

        it("should return empty array when no rooms exist", async () => {
            const result = await cachedRepo.getRoomsList();

            expect(result).toHaveLength(0);
        });
    });

    describe("createRoom", () => {
        it("should create room and invalidate cache", async () => {
            // Prime the cache
            await cachedRepo.getRoomsList();

            // Create a room
            const password = Password.create("Test#123");
            const room = await cachedRepo.createRoom("New Room", password);

            expect(room.name).toBe("New Room");
            expect(mockRepo.getCreateRoomCallCount()).toBe(1);

            // The next getRoomsList call should hit the repository again
            await cachedRepo.getRoomsList();
            expect(mockRepo.getGetRoomsListCallCount()).toBe(2);
        });
    });

    describe("enterRoom", () => {
        it("should enter room and invalidate cache", async () => {
            const room = Room.create({
                id: "room-1",
                name: "Test Room",
                code: "ABC123",
            });
            mockRepo.addTestRoom(room);

            // Prime the cache
            await cachedRepo.getRoomsList();

            // Enter a room
            const password = Password.create("Test#123");
            const enteredRoom = await cachedRepo.enterRoom("ABC123", password);

            expect(enteredRoom.name).toBe("Test Room");
            expect(mockRepo.getEnterRoomCallCount()).toBe(1);

            // The next getRoomsList call should hit the repository again
            await cachedRepo.getRoomsList();
            expect(mockRepo.getGetRoomsListCallCount()).toBe(2);
        });

        it("should throw error when room not found", async () => {
            const password = Password.create("Test#123");

            await expect(
                cachedRepo.enterRoom("INVALID", password)
            ).rejects.toThrow("Room not found");
        });
    });
});
