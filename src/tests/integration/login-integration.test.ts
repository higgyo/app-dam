import { LoginUser } from "../../domain/use-cases/LoginUseCase";
import { RegisterUserUseCase } from "../../domain/use-cases/RegisterUseCase";
import { MockUserRepository } from "../../infrastructure/repositories/mock-user-repository";
import { FakeDatabase } from "../../fake-database/fake-database";

describe("Testes de Integração - Login", () => {
  let loginUseCase: LoginUser;
  let registerUseCase: RegisterUserUseCase;
  let userRepository: MockUserRepository;
  let fakeDatabase: FakeDatabase;

  beforeEach(() => {
    fakeDatabase = FakeDatabase.getInstance();
    fakeDatabase.users = [];
    userRepository = new MockUserRepository();
    loginUseCase = new LoginUser(userRepository);
    registerUseCase = new RegisterUserUseCase(userRepository);
  });

  describe("Fluxo completo de registro e login", () => {
    it("deve registrar um usuário e fazer login com sucesso", async () => {
      // Arrange
      const userData = {
        name: "João Silva",
        email: "joao@example.com",
        password: "senha123",
        latitude: -23.5505,
        longitude: -46.6333,
      };

      // Act - Registrar
      const registeredUser = await registerUseCase.execute(userData);
      expect(registeredUser).toBeDefined();
      expect(registeredUser.email.value).toBe(userData.email);

      // Act - Login
      const loggedInUser = await loginUseCase.execute({
        email: userData.email,
        password: userData.password,
      });

      // Assert
      expect(loggedInUser).toBeDefined();
      expect(loggedInUser.id).toBe(registeredUser.id);
      expect(loggedInUser.name).toBe(userData.name);
      expect(loggedInUser.email.value).toBe(userData.email);
      expect(loggedInUser.location?.latitude).toBe(userData.latitude);
      expect(loggedInUser.location?.longitude).toBe(userData.longitude);
    });

    it("deve falhar ao tentar fazer login com credenciais incorretas após registro", async () => {
      // Arrange
      const userData = {
        name: "Maria Santos",
        email: "maria@example.com",
        password: "senhaCorreta123",
        latitude: -23.5505,
        longitude: -46.6333,
      };

      // Act - Registrar
      await registerUseCase.execute(userData);

      // Assert - Tentar login com senha errada
      await expect(
        loginUseCase.execute({
          email: userData.email,
          password: "senhaErrada",
        })
      ).rejects.toThrow("Credenciais inválidas");
    });

    it("deve permitir múltiplos usuários registrados e login independente", async () => {
      // Arrange
      const user1Data = {
        name: "Usuario 1",
        email: "user1@example.com",
        password: "senha1",
      };
      const user2Data = {
        name: "Usuario 2",
        email: "user2@example.com",
        password: "senha2",
      };

      // Act - Registrar dois usuários
      await registerUseCase.execute(user1Data);
      await registerUseCase.execute(user2Data);

      // Act - Fazer login com user1
      const loggedUser1 = await loginUseCase.execute({
        email: user1Data.email,
        password: user1Data.password,
      });

      // Act - Fazer login com user2
      const loggedUser2 = await loginUseCase.execute({
        email: user2Data.email,
        password: user2Data.password,
      });

      // Assert
      expect(loggedUser1.name).toBe("Usuario 1");
      expect(loggedUser2.name).toBe("Usuario 2");
      expect(loggedUser1.id).not.toBe(loggedUser2.id);
    });

    it("deve impedir registro duplicado e manter o login funcionando", async () => {
      // Arrange
      const userData = {
        name: "Usuario Duplicado",
        email: "duplicado@example.com",
        password: "senha123",
      };

      // Act - Primeiro registro
      await registerUseCase.execute(userData);

      // Assert - Tentar registrar novamente
      await expect(
        registerUseCase.execute(userData)
      ).rejects.toThrow("Usuário já existe!");

      // Assert - Login ainda deve funcionar
      const loggedUser = await loginUseCase.execute({
        email: userData.email,
        password: userData.password,
      });
      expect(loggedUser).toBeDefined();
      expect(loggedUser.name).toBe(userData.name);
    });
  });

  describe("Validações de dados no fluxo de login", () => {
    it("deve falhar ao tentar fazer login sem registrar", async () => {
      // Arrange & Act & Assert
      await expect(
        loginUseCase.execute({
          email: "naoexiste@example.com",
          password: "qualquersenha",
        })
      ).rejects.toThrow("Credenciais inválidas");
    });

    it("deve falhar ao registrar com nome vazio", async () => {
      // Arrange & Act & Assert
      await expect(
        registerUseCase.execute({
          name: "",
          email: "teste@example.com",
          password: "senha123",
        })
      ).rejects.toThrow("Nome precisa ser preenchido!");
    });

    it("deve validar email no formato correto durante registro e login", async () => {
      // Arrange
      const userData = {
        name: "Test User",
        email: "valid@example.com",
        password: "senha123",
      };

      // Act
      const registered = await registerUseCase.execute(userData);
      const loggedIn = await loginUseCase.execute({
        email: userData.email,
        password: userData.password,
      });

      // Assert
      expect(registered.email.value).toBe("valid@example.com");
      expect(loggedIn.email.value).toBe("valid@example.com");
    });
  });

  describe("Persistência de dados no FakeDatabase", () => {
    it("deve persistir usuário no FakeDatabase após registro", async () => {
      // Arrange
      const userData = {
        name: "Persistido",
        email: "persistido@example.com",
        password: "senha123",
      };

      // Act
      await registerUseCase.execute(userData);

      // Assert
      expect(fakeDatabase.users.length).toBe(1);
      expect(fakeDatabase.users[0].name).toBe(userData.name);
    });

    it("deve buscar usuário do FakeDatabase durante login", async () => {
      // Arrange
      const userData = {
        name: "Usuario Busca",
        email: "busca@example.com",
        password: "senha123",
      };
      await registerUseCase.execute(userData);

      // Act
      const initialDbSize = fakeDatabase.users.length;
      const loggedUser = await loginUseCase.execute({
        email: userData.email,
        password: userData.password,
      });

      // Assert - Login não deve alterar o banco
      expect(fakeDatabase.users.length).toBe(initialDbSize);
      expect(loggedUser).toBeDefined();
    });
  });
});
