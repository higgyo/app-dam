import { AxiosHttpClient } from "../http/axios-http-client";
import { MessageRepository } from "../repositories/message-repository";
import { CachedMessageRepository } from "../cache/cached-message-repository";
import { SendMessageUseCase } from "../../application/use-cases/SendMessageUseCase";
import { GetMessagesUseCase } from "../../application/use-cases/GetMessagesUseCase";
import { IMessageRepository } from "../../domain/interfaces/imessage-repository";

export class MessageServiceFactory {
    private static httpClient = new AxiosHttpClient();
    private static remoteRepository = new MessageRepository(this.httpClient);
    private static messageRepository: IMessageRepository =
        new CachedMessageRepository(this.remoteRepository);

    static makeSendMessageUseCase(): SendMessageUseCase {
        return new SendMessageUseCase(this.messageRepository);
    }

    static makeGetMessagesUseCase(): GetMessagesUseCase {
        return new GetMessagesUseCase(this.messageRepository);
    }

    static getMessageRepository(): IMessageRepository {
        return this.messageRepository;
    }
}
