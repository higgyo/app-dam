import { FindUserUseCase } from "../../../application/use-cases/FindUserUseCase";
import { MockUserRepository } from "../../../infrastructure/repositories/mock-user-repository";
import User from "../../../domain/entities/User";
import { FakeDatabase } from "../../../fake-database/fake-database";

describe("FindUserUseCase", () => {
    let findUserUseCase: FindUserUseCase;
    let userRepository: MockUserRepository;
    let fakeDatabase: FakeDatabase;

    beforeEach(() => {
        fakeDatabase = FakeDatabase.getInstance();
        fakeDatabase.users = [];
        userRepository = new MockUserRepository();
        findUserUseCase = new FindUserUseCase(userRepository);
    });

    it("deve encontrar um usuário por ID com sucesso", async () => {
        // Arrange
        const testUser = User.create({
            name: "Usuario Teste",
            email: "teste@example.com",
            password: "hashed_senha123",
            latitude: 10,
            longitude: 20,
            id: "user-123",
        });
        fakeDatabase.users.push(testUser);

        // Act
        const result = await findUserUseCase.execute({ id: "user-123" });

        // Assert
        expect(result).toBeDefined();
        expect(result?.id).toBe("user-123");
        expect(result?.name).toBe("Usuario Teste");
        expect(result?.email.value).toBe("teste@example.com");
    });

    it("deve retornar null quando o usuário não é encontrado", async () => {
        // Arrange & Act
        const result = await findUserUseCase.execute({
            id: "usuario-inexistente",
        });

        // Assert
        expect(result).toBeNull();
    });

    it("deve encontrar o usuário correto quando há múltiplos usuários", async () => {
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
        const result = await findUserUseCase.execute({ id: "user-2" });

        // Assert
        expect(result).toBeDefined();
        expect(result?.id).toBe("user-2");
        expect(result?.name).toBe("Usuario 2");
    });
});
