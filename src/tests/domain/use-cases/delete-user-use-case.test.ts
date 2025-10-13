import { DeleteUserUseCase } from "../../../application/use-cases/DeleteUserUseCase";
import { MockUserRepository } from "../../../infrastructure/repositories/mock-user-repository";
import User from "../../../domain/entities/User";
import { FakeDatabase } from "../../../fake-database/fake-database";

describe("DeleteUserUseCase", () => {
    let deleteUserUseCase: DeleteUserUseCase;
    let userRepository: MockUserRepository;
    let fakeDatabase: FakeDatabase;

    beforeEach(() => {
        fakeDatabase = FakeDatabase.getInstance();
        fakeDatabase.users = [];
        userRepository = new MockUserRepository();
        deleteUserUseCase = new DeleteUserUseCase(userRepository);
    });

    it("deve deletar um usuário com sucesso", async () => {
        // Arrange
        const testUser = User.create({
            name: "Usuario para Deletar",
            email: "deletar@example.com",
            password: "hashed_senha123",
            latitude: 10,
            longitude: 20,
            id: "user-123",
        });
        fakeDatabase.users.push(testUser);

        // Act
        await deleteUserUseCase.execute({ id: "user-123" });

        // Assert
        expect(fakeDatabase.users.length).toBe(0);
    });

    it("deve lançar erro quando o usuário não é encontrado", async () => {
        // Arrange & Act & Assert
        await expect(
            deleteUserUseCase.execute({ id: "usuario-inexistente" })
        ).rejects.toThrow("Usuário não encontrado.");
    });

    it("deve deletar apenas o usuário correto quando há múltiplos usuários", async () => {
        // Arrange
        const user1 = User.create({
            name: "Usuario 1",
            email: "user1@example.com",
            password: "hashed_senha123",
            id: "user-1",
        });
        const user2 = User.create({
            name: "Usuario 2",
            email: "user2@example.com",
            password: "hashed_senha123",
            id: "user-2",
        });
        const user3 = User.create({
            name: "Usuario 3",
            email: "user3@example.com",
            password: "hashed_senha123",
            id: "user-3",
        });
        fakeDatabase.users.push(user1, user2, user3);

        // Act
        await deleteUserUseCase.execute({ id: "user-2" });

        // Assert
        expect(fakeDatabase.users.length).toBe(2);
        expect(fakeDatabase.users.find((u) => u.id === "user-1")).toBeDefined();
        expect(
            fakeDatabase.users.find((u) => u.id === "user-2")
        ).toBeUndefined();
        expect(fakeDatabase.users.find((u) => u.id === "user-3")).toBeDefined();
    });
});
