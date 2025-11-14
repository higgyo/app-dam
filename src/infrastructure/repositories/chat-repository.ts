import Chat from "../../domain/entities/Chat";
import Message from "../../domain/entities/Message";
import Password from "../../domain/value-objects/Password";
import { IChatRepository } from "../../domain/interfaces/ichat-repository";
import { IHttpClient } from "../interfaces/ihttp-client";

export class ChatRepository implements IChatRepository {
    private chats: Chat[] = [];
    private messages: Message[] = [];

    constructor(readonly httpClient: IHttpClient) {
        const defaultUserId = "user-1";

        const initialChats = [
            Chat.create(
                "Grupo de Localização de Família",
                defaultUserId,
                undefined,
                undefined,
                "1"
            ),
            Chat.create(
                "Mais que amigos, Friends",
                defaultUserId,
                undefined,
                undefined,
                "2"
            ),
            Chat.create(
                "Namorada <3",
                defaultUserId,
                undefined,
                undefined,
                "3"
            ),
        ];

        this.chats.push(...initialChats);

        this.messages.push(
            Message.create(
                "Guilherme aproveita que você tai perto do supermercado e traz refrigerante!",
                new Date().toISOString(),
                "friend",
                "1"
            ),
            Message.create(
                "Vamos almoçar aqui perto?",
                new Date().toISOString(),
                "friend",
                "2"
            ),
            Message.create(
                "Onde você tá indo?",
                new Date().toISOString(),
                "friend",
                "3"
            )
        );
    }

    async createChat(
        name: string,
        password: Password,
        idUser: string,
        mediaUrl?: string
    ): Promise<Chat> {
        const chat = Chat.create(name, idUser, mediaUrl, password);

        this.chats.push(chat);

        return chat;
    }

    async sendMessage(
        message: string,
        idUser: string,
        idChat: string,
        mediaUrl?: string
    ): Promise<Message> {
        const newMessage = Message.create(
            message,
            new Date().toISOString(),
            idUser,
            idChat,
            mediaUrl
        );

        this.messages.push(newMessage);

        return newMessage;
    }

    async enterChat(id: string, password: Password): Promise<Chat> {
        const existingChat = this.chats.find((chat) => chat.id === id);

        if (existingChat) {
            return existingChat;
        }

        const chat = Chat.create("chat-aleatório", "", undefined, password, id);

        this.chats.push(chat);

        return chat;
    }

    async getChatsList(idUser: string): Promise<Chat[]> {
        return this.chats.filter((chat) => chat.idUser === idUser);
    }

    async getChatById(id: string): Promise<Chat | null> {
        const chat = this.chats.find((chat) => chat.id === id);
        return chat ?? null;
    }

    async getMessagesByChat(idChat: string): Promise<Message[]> {
        return this.messages.filter((message) => message.chatId === idChat);
    }
}
