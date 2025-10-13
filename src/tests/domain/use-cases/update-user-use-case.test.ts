import { UpdateUserUseCase } from "../../../application/use-cases/UpdateUserUseCase";
import { MockUserRepository } from "../../../infrastructure/repositories/mock-user-repository";
import User from "../../../domain/entities/User";
import { FakeDatabase } from "../../../fake-database/fake-database";

describe("UpdateUserUseCase", () => {
    let updateUserUseCase: UpdateUserUseCase;
    let userRepository: MockUserRepository;
    let fakeDatabase: FakeDatabase;

    beforeEach(() => {
        fakeDatabase = FakeDatabase.getInstance();
        fakeDatabase.users = [];
        userRepository = new MockUserRepository();
        updateUserUseCase = new UpdateUserUseCase(userRepository);
    });

    it("deve atualizar um usuário com sucesso", async () => {
        // Arrange
        const testUser = User.create({
            name: "Usuario Original",
            email: "original@example.com",
            password: "hashed_senha123",
            latitude: 10,
            longitude: 20,
            id: "user-123",
        });
        fakeDatabase.users.push(testUser);

        // Act
        const result = await updateUserUseCase.execute({
            id: "user-123",
            name: "Usuario Atualizado",
            email: "atualizado@example.com",
        });

        // Assert
        expect(result).toBeDefined();
        expect(result.name).toBe("Usuario Atualizado");
        expect(result.email.value).toBe("atualizado@example.com");
        expect(result.id).toBe("user-123");
    });

    it("deve atualizar apenas a localização do usuário", async () => {
        // Arrange
        const testUser = User.create({
            name: "Usuario",
            email: "usuario@example.com",
            password: "hashed_senha123",
            latitude: 10,
            longitude: 20,
            id: "user-123",
        });
        fakeDatabase.users.push(testUser);

        // Act
        const result = await updateUserUseCase.execute({
            id: "user-123",
            latitude: 30,
            longitude: 40,
        });

        // Assert
        expect(result).toBeDefined();
        expect(result.name).toBe("Usuario");
        expect(result.location?.latitude).toBe(30);
        expect(result.location?.longitude).toBe(40);
    });

    it("deve lançar erro quando o usuário não é encontrado", async () => {
        // Arrange & Act & Assert
        await expect(
            updateUserUseCase.execute({
                id: "usuario-inexistente",
                name: "Nome Novo",
            })
        ).rejects.toThrow("Usuário não encontrado.");
    });

    it("deve manter valores originais quando campos não são fornecidos", async () => {
        // Arrange
        const testUser = User.create({
            name: "Usuario Original",
            email: "original@example.com",
            password: "hashed_senha123",
            latitude: 10,
            longitude: 20,
            id: "user-123",
        });
        fakeDatabase.users.push(testUser);

        // Act
        const result = await updateUserUseCase.execute({
            id: "user-123",
            name: "Novo Nome",
        });

        // Assert
        expect(result.name).toBe("Novo Nome");
        expect(result.email.value).toBe("original@example.com");
        expect(result.location?.latitude).toBe(10);
        expect(result.location?.longitude).toBe(20);
    });
});
