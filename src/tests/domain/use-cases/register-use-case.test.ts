import { RegisterUserUseCase } from "../../../domain/use-cases/RegisterUseCase";
import { MockUserRepository } from "../../../infrastructure/repositories/mock-user-repository";
import { FakeDatabase } from "../../../fake-database/fake-database";

describe("RegisterUserUseCase", () => {
  let registerUseCase: RegisterUserUseCase;
  let userRepository: MockUserRepository;
  let fakeDatabase: FakeDatabase;

  beforeEach(() => {
    fakeDatabase = FakeDatabase.getInstance();
    fakeDatabase.users = [];
    userRepository = new MockUserRepository();
    registerUseCase = new RegisterUserUseCase(userRepository);
  });

  it("deve registrar um novo usuário com sucesso", async () => {
    // Arrange
    const userData = {
      name: "Novo Usuario",
      email: "novo@example.com",
      password: "senha123",
      latitude: 10,
      longitude: 20,
    };

    // Act
    const result = await registerUseCase.execute(userData);

    // Assert
    expect(result).toBeDefined();
    expect(result.name).toBe("Novo Usuario");
    expect(result.email.value).toBe("novo@example.com");
    expect(result.password.value).toBe("hashed_senha123");
    expect(fakeDatabase.users.length).toBe(1);
  });

  it("deve lançar erro quando o nome está vazio", async () => {
    // Arrange & Act & Assert
    await expect(
      registerUseCase.execute({
        name: "",
        email: "test@example.com",
        password: "senha123",
        latitude: 10,
        longitude: 20,
      })
    ).rejects.toThrow("Nome precisa ser preenchido!");
  });

  it("deve lançar erro quando o usuário já existe", async () => {
    // Arrange
    const userData = {
      name: "Usuario Existente",
      email: "existente@example.com",
      password: "senha123",
      latitude: 10,
      longitude: 20,
    };
    await registerUseCase.execute(userData);

    // Act & Assert
    await expect(
      registerUseCase.execute(userData)
    ).rejects.toThrow("Usuário já existe!");
  });

  it("deve registrar usuário sem localização (latitude e longitude opcionais)", async () => {
    // Arrange
    const userData = {
      name: "Usuario Sem Localizacao",
      email: "semloc@example.com",
      password: "senha123",
    };

    // Act
    const result = await registerUseCase.execute(userData);

    // Assert
    expect(result).toBeDefined();
    expect(result.name).toBe("Usuario Sem Localizacao");
    expect(result.location).toBeUndefined();
  });
});
