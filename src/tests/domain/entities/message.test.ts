import Message from "../../../domain/entities/Message";

describe("Message", () => {
    it("should create a Message instance correctly with all properties", () => {
        const messageData = {
            message: "Hello, world!",
            date: "2023-10-03T12:00:00Z",
            userId: "user123",
            chatId: "chat456",
            id: "message789",
        };

        const message = Message.create(
            messageData.message,
            messageData.date,
            messageData.userId,
            messageData.chatId,
            messageData.id
        );

        expect(message).toBeInstanceOf(Message);
        expect(message.message).toBe(messageData.message);
        expect(message.date).toBe(messageData.date);
        expect(message.userId).toBe(messageData.userId);
        expect(message.chatId).toBe(messageData.chatId);
        expect(message.id).toBe(messageData.id);
    });

    it("should create a Message instance correctly without an id", () => {
        const messageData = {
            message: "Hello, world!",
            date: "2023-10-03T12:00:00Z",
            userId: "user123",
            chatId: "chat456",
        };

        const message = Message.create(
            messageData.message,
            messageData.date,
            messageData.userId,
            messageData.chatId
        );

        expect(message).toBeInstanceOf(Message);
        expect(message.message).toBe(messageData.message);
        expect(message.date).toBe(messageData.date);
        expect(message.userId).toBe(messageData.userId);
        expect(message.chatId).toBe(messageData.chatId);
        expect(message.id).toBeUndefined();
    });
});
