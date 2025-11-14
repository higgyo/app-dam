import Room from "../../../domain/entities/Room";
import InvalidPasswordError from "../../../domain/errors/InvalidPasswordError";

jest.mock("../../../domain/value-objects/Password", () => {
    return {
        create: jest.fn((password: string) => {
            if (password && password.length >= 8) {
                return { value: password };
            } else {
                throw new InvalidPasswordError("Senha inválida");
            }
        }),
    };
});

describe("Chat", () => {
    it("should create a Chat instance with a password (ignoring Password validation)", () => {
        const chatData = {
            name: "Tech Talk",
            id: "chat123",
            idUser: "user456",
            imageUrl: "http://example.com/image.jpg",
            password: "validPassword123",
        };

        // Criar o chat com uma senha válida (mas ignorando a validação da senha)
        const chat = Room.create(
            chatData.name,
            chatData.id,
            chatData.idUser,
            chatData.imageUrl,
            chatData.password
        );

        // Verificar se a instância é de Chat
        expect(chat).toBeInstanceOf(Room);
        expect(chat.name).toBe(chatData.name);
        expect(chat.id).toBe(chatData.id);
        expect(chat.idUser).toBe(chatData.idUser);
        expect(chat.imageUrl).toBe(chatData.imageUrl);
        expect(chat.password).toBeDefined();
    });

    it("should create a Chat instance without a password", () => {
        const chatData = {
            name: "General Chat",
            id: "chat456",
            idUser: "user789",
            imageUrl: "http://example.com/image2.jpg",
        };

        const chat = Room.create(
            chatData.name,
            chatData.id,
            chatData.idUser,
            chatData.imageUrl
        );

        // Verificar se a instância é de Chat
        expect(chat).toBeInstanceOf(Room);
        expect(chat.name).toBe(chatData.name);
        expect(chat.id).toBe(chatData.id);
        expect(chat.idUser).toBe(chatData.idUser);
        expect(chat.imageUrl).toBe(chatData.imageUrl);

        // Verificar se o password é undefined
        expect(chat.password).toBeUndefined(); // Já que a senha não foi fornecida
    });
});
