import { AxiosHttpClient } from "../http/axios-http-client";
import { MessageRepository } from "../repositories/message-repository";
import { SendMessageUseCase } from "../../application/use-cases/SendMessageUseCase";
import { GetMessagesUseCase } from "../../application/use-cases/GetMessagesUseCase";

export class MessageServiceFactory {
    private static httpClient = new AxiosHttpClient();
    private static messageRepository = new MessageRepository(this.httpClient);

    static makeSendMessageUseCase(): SendMessageUseCase {
        return new SendMessageUseCase(this.messageRepository);
    }

    static makeGetMessagesUseCase(): GetMessagesUseCase {
        return new GetMessagesUseCase(this.messageRepository);
    }

    static getMessageRepository(): MessageRepository {
        return this.messageRepository;
    }
}
