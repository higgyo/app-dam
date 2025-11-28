import Message from "../../../domain/entities/Message";
import { IMessageRepository } from "../../../domain/interfaces/imessage-repository";
import { MessageType } from "../../../shared/types";

export class MockMessageRepository implements IMessageRepository {
    private messages: Message[] = [];
    private sendMessageCalls = 0;
    private getMessagesCalls = 0;

    async sendMessage(
        content: string,
        roomId: string,
        senderId: string,
        type: MessageType = MessageType.Text,
        mediaUri?: string
    ): Promise<Message> {
        this.sendMessageCalls++;
        const message = Message.create({
            id: `msg-${Date.now()}`,
            content,
            roomId,
            senderId,
            createdAt: new Date().toISOString(),
            type,
            fileUrl: mediaUri,
        });
        this.messages.push(message);
        return message;
    }

    async getMessagesByRoom(roomId: string): Promise<Message[]> {
        this.getMessagesCalls++;
        return this.messages.filter((m) => m.roomId === roomId);
    }

    subscribeToMessages(
        roomId: string,
        callback: (message: Message) => void
    ): () => void {
        return () => {};
    }

    // Test helpers
    getSendMessageCallCount(): number {
        return this.sendMessageCalls;
    }

    getGetMessagesCallCount(): number {
        return this.getMessagesCalls;
    }

    addTestMessage(message: Message): void {
        this.messages.push(message);
    }

    clearMessages(): void {
        this.messages = [];
    }
}
