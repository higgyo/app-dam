import { MessageType } from "../../shared/types";
import Message from "../entities/Message";

export interface IMessageRepository {
    sendMessage(
        content: string,
        roomId: string,
        senderId: string,
        type?: MessageType,
        imageUri?: string,
    ): Promise<Message>;
    getMessagesByRoom(roomId: string): Promise<Message[]>;
    subscribeToMessages(
        roomId: string,
        callback: (message: Message) => void
    ): () => void;
}
