import { LoginUser } from "../../../domain/use-cases/LoginUseCase";
import { MockUserRepository } from "../../../infrastructure/repositories/mock-user-repository";
import User from "../../../domain/entities/User";
import { FakeDatabase } from "../../../fake-database/fake-database";

describe("LoginUser Use Case", () => {
  let loginUseCase: LoginUser;
  let userRepository: MockUserRepository;
  let fakeDatabase: FakeDatabase;

  beforeEach(() => {
    fakeDatabase = FakeDatabase.getInstance();
    fakeDatabase.users = []; // Limpar banco fake antes de cada teste
    userRepository = new MockUserRepository();
    loginUseCase = new LoginUser(userRepository);
  });

  it("deve fazer login com sucesso com credenciais válidas", async () => {
    // Arrange
    const testUser = User.create({
      name: "Test User",
      email: "test@example.com",
      password: "hashed_senha123",
      latitude: 10,
      longitude: 20,
    });
    fakeDatabase.users.push(testUser);

    // Act
    const result = await loginUseCase.execute({
      email: "test@example.com",
      password: "senha123",
    });

    // Assert
    expect(result).toBeDefined();
    expect(result.name).toBe("Test User");
    expect(result.email.value).toBe("test@example.com");
  });

  it("deve lançar erro quando o email não existe", async () => {
    // Arrange & Act & Assert
    await expect(
      loginUseCase.execute({
        email: "naoexiste@example.com",
        password: "senha123",
      })
    ).rejects.toThrow("Credenciais inválidas");
  });

  it("deve lançar erro quando a senha está incorreta", async () => {
    // Arrange
    const testUser = User.create({
      name: "Test User",
      email: "test@example.com",
      password: "hashed_senhaCorreta",
      latitude: 10,
      longitude: 20,
    });
    fakeDatabase.users.push(testUser);

    // Act & Assert
    await expect(
      loginUseCase.execute({
        email: "test@example.com",
        password: "senhaErrada",
      })
    ).rejects.toThrow("Credenciais inválidas");
  });
});
