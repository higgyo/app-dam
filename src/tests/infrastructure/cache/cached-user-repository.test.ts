import { CachedUserRepository } from "../../../infrastructure/cache/cached-user-repository";
import { IUserRepository } from "../../../domain/interfaces/iuser-repository";
import User from "../../../domain/entities/User";
import Email from "../../../domain/value-objects/Email";
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
const mockRemoteRepository: jest.Mocked<IUserRepository> = {
    login: jest.fn(),
    verifyAuthentication: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
};

describe("CachedUserRepository", () => {
    let cachedRepo: CachedUserRepository;

    beforeEach(() => {
        jest.clearAllMocks();
        cachedRepo = new CachedUserRepository(
            mockRemoteRepository,
            mockSqliteDatabase as any
        );
    });

    describe("login", () => {
        it("should login via remote and cache user", async () => {
            const mockUser = User.create({
                id: "user-123",
                name: "Test User",
                email: "test@example.com",
                password: "Test#123",
            });
            const email = Email.create("test@example.com");
            const password = Password.create("Test#123");

            mockRemoteRepository.login.mockResolvedValue(mockUser);

            const result = await cachedRepo.login(email, password);

            expect(mockRemoteRepository.login).toHaveBeenCalledWith(email, password);
            expect(mockDb.runAsync).toHaveBeenCalled(); // Cache user
            expect(result.name).toBe("Test User");
        });
    });

    describe("verifyAuthentication", () => {
        it("should verify via remote and cache user on success", async () => {
            const mockUser = User.create({
                id: "user-123",
                name: "Authenticated User",
                email: "auth@example.com",
                password: "Test#123",
            });

            mockRemoteRepository.verifyAuthentication.mockResolvedValue(mockUser);

            const result = await cachedRepo.verifyAuthentication();

            expect(mockRemoteRepository.verifyAuthentication).toHaveBeenCalled();
            expect(mockDb.runAsync).toHaveBeenCalled();
            expect(result.name).toBe("Authenticated User");
        });

        it("should return cached user when remote fails", async () => {
            mockRemoteRepository.verifyAuthentication.mockRejectedValue(new Error("Network error"));
            mockDb.getFirstAsync.mockResolvedValue({
                id: "cached-user",
                name: "Cached User",
                email: "cached@example.com",
                avatar_url: null,
                last_latitude: null,
                last_longitude: null,
            });

            const result = await cachedRepo.verifyAuthentication();

            expect(result.name).toBe("Cached User");
        });

        it("should throw error when both remote fails and no cache", async () => {
            mockRemoteRepository.verifyAuthentication.mockRejectedValue(new Error("Network error"));
            mockDb.getFirstAsync.mockResolvedValue(null);

            await expect(cachedRepo.verifyAuthentication()).rejects.toThrow(
                "Usuário não está autenticado"
            );
        });
    });

    describe("register", () => {
        it("should register via remote and cache user", async () => {
            const mockUser = User.create({
                id: "user-new",
                name: "New User",
                email: "new@example.com",
                password: "Test#123",
            });
            const email = Email.create("new@example.com");
            const password = Password.create("Test#123");

            mockRemoteRepository.register.mockResolvedValue(mockUser);

            const result = await cachedRepo.register("New User", email, password);

            expect(mockRemoteRepository.register).toHaveBeenCalledWith("New User", email, password);
            expect(mockDb.runAsync).toHaveBeenCalled();
            expect(result.name).toBe("New User");
        });
    });

    describe("logout", () => {
        it("should call remote logout", async () => {
            mockRemoteRepository.logout.mockResolvedValue();

            await cachedRepo.logout();

            expect(mockRemoteRepository.logout).toHaveBeenCalled();
        });
    });

    describe("findById", () => {
        it("should find user by id from remote and cache", async () => {
            const mockUser = User.create({
                id: "user-123",
                name: "Found User",
                email: "found@example.com",
                password: "Test#123",
            });

            mockRemoteRepository.findById.mockResolvedValue(mockUser);

            const result = await cachedRepo.findById("user-123");

            expect(mockRemoteRepository.findById).toHaveBeenCalledWith("user-123");
            expect(mockDb.runAsync).toHaveBeenCalled();
            expect(result?.name).toBe("Found User");
        });

        it("should return cached user when remote fails", async () => {
            mockRemoteRepository.findById.mockRejectedValue(new Error("Network error"));
            mockDb.getFirstAsync.mockResolvedValue({
                id: "user-123",
                name: "Cached User",
                email: "cached@example.com",
                avatar_url: null,
                last_latitude: null,
                last_longitude: null,
            });

            const result = await cachedRepo.findById("user-123");

            expect(result?.name).toBe("Cached User");
        });

        it("should return null when user not found in cache", async () => {
            mockRemoteRepository.findById.mockRejectedValue(new Error("Network error"));
            mockDb.getFirstAsync.mockResolvedValue(null);

            const result = await cachedRepo.findById("non-existent");

            expect(result).toBeNull();
        });
    });

    describe("update", () => {
        it("should update user via remote and cache", async () => {
            const mockUser = User.create({
                id: "user-123",
                name: "Updated User",
                email: "updated@example.com",
                password: "Test#123",
            });

            mockRemoteRepository.update.mockResolvedValue();

            await cachedRepo.update(mockUser);

            expect(mockRemoteRepository.update).toHaveBeenCalledWith(mockUser);
            expect(mockDb.runAsync).toHaveBeenCalled();
        });
    });

    describe("getCachedUser", () => {
        it("should return cached user by id", async () => {
            mockDb.getFirstAsync.mockResolvedValue({
                id: "user-123",
                name: "Cached User",
                email: "cached@example.com",
                avatar_url: null,
                last_latitude: 40.7128,
                last_longitude: -74.006,
            });

            const result = await cachedRepo.getCachedUser("user-123");

            expect(mockDb.getFirstAsync).toHaveBeenCalled();
            expect(result?.name).toBe("Cached User");
        });

        it("should return null when user not found", async () => {
            mockDb.getFirstAsync.mockResolvedValue(null);

            const result = await cachedRepo.getCachedUser("non-existent");

            expect(result).toBeNull();
        });
    });
});
