import { RegisterUserUseCase } from "../../domain/use-cases/RegisterUseCase";
import { FindUserUseCase } from "../../domain/use-cases/FindUserUseCase";
import { UpdateUserUseCase } from "../../domain/use-cases/UpdateUserUseCase";
import { DeleteUserUseCase } from "../../domain/use-cases/DeleteUserUseCase";
import { MockUserRepository } from "../../infrastructure/repositories/mock-user-repository";
import { FakeDatabase } from "../../fake-database/fake-database";

describe("Testes de Integração - CRUD de Usuários", () => {
  let registerUseCase: RegisterUserUseCase;
  let findUserUseCase: FindUserUseCase;
  let updateUserUseCase: UpdateUserUseCase;
  let deleteUserUseCase: DeleteUserUseCase;
  let userRepository: MockUserRepository;
  let fakeDatabase: FakeDatabase;

  beforeEach(() => {
    fakeDatabase = FakeDatabase.getInstance();
    fakeDatabase.users = [];
    userRepository = new MockUserRepository();
    registerUseCase = new RegisterUserUseCase(userRepository);
    findUserUseCase = new FindUserUseCase(userRepository);
    updateUserUseCase = new UpdateUserUseCase(userRepository);
    deleteUserUseCase = new DeleteUserUseCase(userRepository);
  });

  describe("CREATE - Criar Usuário", () => {
    it("deve criar um usuário e persistir no banco fake", async () => {
      // Arrange
      const userData = {
        name: "Novo Usuario",
        email: "novo@example.com",
        password: "senha123",
        latitude: 10,
        longitude: 20,
      };

      // Act
      const createdUser = await registerUseCase.execute(userData);

      // Assert
      expect(createdUser).toBeDefined();
      expect(createdUser.id).toBeDefined();
      expect(fakeDatabase.users.length).toBe(1);
      expect(fakeDatabase.users[0].id).toBe(createdUser.id);
    });

    it("deve criar múltiplos usuários independentemente", async () => {
      // Arrange & Act
      const user1 = await registerUseCase.execute({
        name: "User 1",
        email: "user1@example.com",
        password: "senha1",
      });
      const user2 = await registerUseCase.execute({
        name: "User 2",
        email: "user2@example.com",
        password: "senha2",
      });

      // Assert
      expect(fakeDatabase.users.length).toBe(2);
      expect(user1.id).not.toBe(user2.id);
    });
  });

  describe("READ - Buscar Usuário", () => {
    it("deve criar e buscar um usuário por ID", async () => {
      // Arrange
      const userData = {
        name: "Usuario Busca",
        email: "busca@example.com",
        password: "senha123",
        latitude: 15,
        longitude: 25,
      };
      const createdUser = await registerUseCase.execute(userData);

      // Act
      const foundUser = await findUserUseCase.execute({ id: createdUser.id! });

      // Assert
      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(createdUser.id);
      expect(foundUser?.name).toBe(userData.name);
      expect(foundUser?.email.value).toBe(userData.email);
    });

    it("deve retornar null ao buscar usuário inexistente", async () => {
      // Act
      const foundUser = await findUserUseCase.execute({ id: "id-inexistente" });

      // Assert
      expect(foundUser).toBeNull();
    });
  });

  describe("UPDATE - Atualizar Usuário", () => {
    it("deve criar e atualizar um usuário com sucesso", async () => {
      // Arrange
      const userData = {
        name: "Usuario Original",
        email: "original@example.com",
        password: "senha123",
        latitude: 10,
        longitude: 20,
      };
      const createdUser = await registerUseCase.execute(userData);

      // Act
      const updatedUser = await updateUserUseCase.execute({
        id: createdUser.id!,
        name: "Usuario Atualizado",
        latitude: 30,
        longitude: 40,
      });

      // Assert
      expect(updatedUser.name).toBe("Usuario Atualizado");
      expect(updatedUser.location?.latitude).toBe(30);
      expect(updatedUser.location?.longitude).toBe(40);
      expect(fakeDatabase.users[0].name).toBe("Usuario Atualizado");
    });

    it("deve buscar usuário atualizado e confirmar mudanças", async () => {
      // Arrange
      const userData = {
        name: "Usuario Teste",
        email: "teste@example.com",
        password: "senha123",
      };
      const createdUser = await registerUseCase.execute(userData);

      // Act
      await updateUserUseCase.execute({
        id: createdUser.id!,
        name: "Nome Alterado",
      });
      const foundUser = await findUserUseCase.execute({ id: createdUser.id! });

      // Assert
      expect(foundUser?.name).toBe("Nome Alterado");
    });
  });

  describe("DELETE - Deletar Usuário", () => {
    it("deve criar e deletar um usuário com sucesso", async () => {
      // Arrange
      const userData = {
        name: "Usuario para Deletar",
        email: "deletar@example.com",
        password: "senha123",
      };
      const createdUser = await registerUseCase.execute(userData);
      expect(fakeDatabase.users.length).toBe(1);

      // Act
      await deleteUserUseCase.execute({ id: createdUser.id! });

      // Assert
      expect(fakeDatabase.users.length).toBe(0);
    });

    it("deve buscar e confirmar que usuário foi deletado", async () => {
      // Arrange
      const userData = {
        name: "Usuario Remover",
        email: "remover@example.com",
        password: "senha123",
      };
      const createdUser = await registerUseCase.execute(userData);

      // Act
      await deleteUserUseCase.execute({ id: createdUser.id! });
      const foundUser = await findUserUseCase.execute({ id: createdUser.id! });

      // Assert
      expect(foundUser).toBeNull();
    });
  });

  describe("Fluxo CRUD Completo", () => {
    it("deve executar operações CRUD em sequência", async () => {
      // CREATE
      const userData = {
        name: "Usuario Completo",
        email: "completo@example.com",
        password: "senha123",
        latitude: 5,
        longitude: 10,
      };
      const created = await registerUseCase.execute(userData);
      expect(created).toBeDefined();
      expect(fakeDatabase.users.length).toBe(1);

      // READ
      const found = await findUserUseCase.execute({ id: created.id! });
      expect(found).toBeDefined();
      expect(found?.name).toBe("Usuario Completo");

      // UPDATE
      const updated = await updateUserUseCase.execute({
        id: created.id!,
        name: "Usuario Modificado",
        latitude: 15,
      });
      expect(updated.name).toBe("Usuario Modificado");
      expect(updated.location?.latitude).toBe(15);

      // READ após UPDATE
      const foundAfterUpdate = await findUserUseCase.execute({ id: created.id! });
      expect(foundAfterUpdate?.name).toBe("Usuario Modificado");

      // DELETE
      await deleteUserUseCase.execute({ id: created.id! });
      expect(fakeDatabase.users.length).toBe(0);

      // READ após DELETE
      const foundAfterDelete = await findUserUseCase.execute({ id: created.id! });
      expect(foundAfterDelete).toBeNull();
    });

    it("deve gerenciar múltiplos usuários com CRUD independente", async () => {
      // Criar 3 usuários
      const user1 = await registerUseCase.execute({
        name: "User 1",
        email: "user1@test.com",
        password: "senha1",
      });
      const user2 = await registerUseCase.execute({
        name: "User 2",
        email: "user2@test.com",
        password: "senha2",
      });
      const user3 = await registerUseCase.execute({
        name: "User 3",
        email: "user3@test.com",
        password: "senha3",
      });
      expect(fakeDatabase.users.length).toBe(3);

      // Atualizar user2
      await updateUserUseCase.execute({
        id: user2.id!,
        name: "User 2 Updated",
      });

      // Deletar user1
      await deleteUserUseCase.execute({ id: user1.id! });
      expect(fakeDatabase.users.length).toBe(2);

      // Verificar que user2 foi atualizado e user3 não foi afetado
      const foundUser2 = await findUserUseCase.execute({ id: user2.id! });
      const foundUser3 = await findUserUseCase.execute({ id: user3.id! });
      expect(foundUser2?.name).toBe("User 2 Updated");
      expect(foundUser3?.name).toBe("User 3");

      // Verificar que user1 foi deletado
      const foundUser1 = await findUserUseCase.execute({ id: user1.id! });
      expect(foundUser1).toBeNull();
    });
  });

  describe("Validações e Tratamento de Erros no CRUD", () => {
    it("deve impedir atualização de usuário inexistente", async () => {
      // Arrange & Act & Assert
      await expect(
        updateUserUseCase.execute({
          id: "id-inexistente",
          name: "Novo Nome",
        })
      ).rejects.toThrow("Usuário não encontrado.");
    });

    it("deve impedir deleção de usuário inexistente", async () => {
      // Arrange & Act & Assert
      await expect(
        deleteUserUseCase.execute({ id: "id-inexistente" })
      ).rejects.toThrow("Usuário não encontrado.");
    });

    it("deve impedir criação de usuário duplicado", async () => {
      // Arrange
      const userData = {
        name: "Usuario Duplicado",
        email: "duplicado@test.com",
        password: "senha123",
      };
      await registerUseCase.execute(userData);

      // Act & Assert
      await expect(
        registerUseCase.execute(userData)
      ).rejects.toThrow("Usuário já existe!");
    });
  });
});
