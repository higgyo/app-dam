import Chat from "../../../domain/entities/Chat";
import InvalidPasswordError from "../../../domain/errors/InvalidPasswordError";
import Password from "../../../domain/value-objects/Password";

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
            mediaUrl: "http://example.com/image.jpg",
            password: "validPassword123",
        };

        const password = Password.create(chatData.password);

        const chat = Chat.create(
            chatData.name,
            chatData.id,
            chatData.idUser,
            chatData.mediaUrl,
            password
        );

        // Verificar se a instância é de Chat
        expect(chat).toBeInstanceOf(Chat);
        expect(chat.name).toBe(chatData.name);
        expect(chat.id).toBe(chatData.id);
        expect(chat.idUser).toBe(chatData.idUser);
        expect(chat.mediaUrl).toBe(chatData.mediaUrl);
        expect(chat.password).toBeDefined();
    });

    it("should create a Chat instance without a password", () => {
        const chatData = {
            name: "General Chat",
            id: "chat456",
            idUser: "user789",
            mediaUrl: "http://example.com/image2.jpg",
        };

        const chat = Chat.create(
            chatData.name,
            chatData.id,
            chatData.idUser,
            chatData.mediaUrl
        );

        // Verificar se a instância é de Chat
        expect(chat).toBeInstanceOf(Chat);
        expect(chat.name).toBe(chatData.name);
        expect(chat.id).toBe(chatData.id);
        expect(chat.idUser).toBe(chatData.idUser);
        expect(chat.mediaUrl).toBe(chatData.mediaUrl);

        // Verificar se o password é undefined
        expect(chat.password).toBeUndefined(); // Já que a senha não foi fornecida
    });
});
