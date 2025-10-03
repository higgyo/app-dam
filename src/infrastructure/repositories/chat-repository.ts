import Chat from "../../domain/entities/Chat";
import Message from "../../domain/entities/Message";
import Password from "../../domain/value-objects/Password";
import { IChatRepository } from "../../domain/interfaces/ichat-repository";
import { IHttpClient } from "../interfaces/ihttp-client";

export class ChatRepository implements IChatRepository {
    constructor (readonly httpClient: IHttpClient) {}

    async createChat(name: string, password: Password, idUser: string): Promise<Chat> {
        return Chat.create(name)
    }

    async sendMessage(message: string, idUser: string): Promise<Message> {
        return Message.create(message, "2025-09-26T16:43:29.000Z", idUser)
    }

    async enterChat(id: string, password: Password): Promise<Chat> {
        return Chat.create("chat-aleatório")
    }

    async getChatsList(idUser: string): Promise<Chat[]> {
        return [Chat.create("chat-aleatório"), Chat.create("chat-aleatório-2")]
    }
}