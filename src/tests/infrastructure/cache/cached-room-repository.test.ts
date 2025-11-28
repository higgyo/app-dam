import { CachedRoomRepository } from "../../../infrastructure/cache/cached-room-repository";
import { IRoomRepository } from "../../../domain/interfaces/iroom-repository";
import Room from "../../../domain/entities/Room";
import Password from "../../../domain/value-objects/Password";

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
const mockRemoteRepository: jest.Mocked<IRoomRepository> = {
    createRoom: jest.fn(),
    enterRoom: jest.fn(),
    getRoomsList: jest.fn(),
};

describe("CachedRoomRepository", () => {
    let cachedRepo: CachedRoomRepository;

    beforeEach(() => {
        jest.clearAllMocks();
        cachedRepo = new CachedRoomRepository(
            mockRemoteRepository,
            mockSqliteDatabase as any
        );
    });

    describe("createRoom", () => {
        it("should create room via remote and cache it", async () => {
            const mockRoom = Room.create({
                id: "room-123",
                name: "Test Room",
                code: "ABC123",
                idUser: "user-1",
            });
            const password = Password.create("Test#123");

            mockRemoteRepository.createRoom.mockResolvedValue(mockRoom);

            const result = await cachedRepo.createRoom("Test Room", password);

            expect(mockRemoteRepository.createRoom).toHaveBeenCalledWith("Test Room", password);
            expect(mockDb.runAsync).toHaveBeenCalled();
            expect(result.name).toBe("Test Room");
        });
    });

    describe("enterRoom", () => {
        it("should enter room via remote and cache it", async () => {
            const mockRoom = Room.create({
                id: "room-123",
                name: "Existing Room",
                code: "XYZ789",
                idUser: "user-2",
            });
            const password = Password.create("Test#123");

            mockRemoteRepository.enterRoom.mockResolvedValue(mockRoom);

            const result = await cachedRepo.enterRoom("XYZ789", password);

            expect(mockRemoteRepository.enterRoom).toHaveBeenCalledWith("XYZ789", password);
            expect(mockDb.runAsync).toHaveBeenCalled();
            expect(result.name).toBe("Existing Room");
        });
    });

    describe("getRoomsList", () => {
        it("should fetch from remote and cache rooms on success", async () => {
            const mockRooms = [
                Room.create({
                    id: "room-1",
                    name: "Room 1",
                    code: "ABC",
                    idUser: "user-1",
                }),
                Room.create({
                    id: "room-2",
                    name: "Room 2",
                    code: "DEF",
                    idUser: "user-1",
                }),
            ];

            mockRemoteRepository.getRoomsList.mockResolvedValue(mockRooms);

            const result = await cachedRepo.getRoomsList();

            expect(mockRemoteRepository.getRoomsList).toHaveBeenCalled();
            expect(mockDb.runAsync).toHaveBeenCalledTimes(2); // Cache both rooms
            expect(result.length).toBe(2);
        });

        it("should return cached rooms when remote fails", async () => {
            mockRemoteRepository.getRoomsList.mockRejectedValue(new Error("Network error"));
            mockDb.getAllAsync.mockResolvedValue([
                {
                    id: "cached-room",
                    name: "Cached Room",
                    code: "CACHE",
                    created_by: "user-1",
                    image_url: null,
                },
            ]);

            const result = await cachedRepo.getRoomsList();

            expect(result.length).toBe(1);
            expect(result[0].name).toBe("Cached Room");
        });
    });

    describe("getCachedRoomById", () => {
        it("should return cached room by id", async () => {
            mockDb.getFirstAsync.mockResolvedValue({
                id: "room-123",
                name: "Test Room",
                code: "TEST",
                created_by: "user-1",
                image_url: null,
            });

            const result = await cachedRepo.getCachedRoomById("room-123");

            expect(mockDb.getFirstAsync).toHaveBeenCalled();
            expect(result?.name).toBe("Test Room");
        });

        it("should return null when room not found", async () => {
            mockDb.getFirstAsync.mockResolvedValue(null);

            const result = await cachedRepo.getCachedRoomById("non-existent");

            expect(result).toBeNull();
        });
    });
});
