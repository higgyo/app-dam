import { AxiosHttpClient } from "../http/axios-http-client";
import { MessageRepository } from "../repositories/message-repository";
import { CachedMessageRepository } from "../repositories/cached-message-repository";
import { SendMessageUseCase } from "../../application/use-cases/SendMessageUseCase";
import { GetMessagesUseCase } from "../../application/use-cases/GetMessagesUseCase";
import { SQLiteCacheStorage } from "../cache";
import { CACHE_CONFIG } from "../cache/cache-config";
import { IMessageRepository } from "../../domain/interfaces/imessage-repository";

export class MessageServiceFactory {
    private static httpClient = new AxiosHttpClient();
    private static baseMessageRepository = new MessageRepository(
        this.httpClient
    );
    private static cacheStorage = new SQLiteCacheStorage(
        CACHE_CONFIG.MESSAGES_DATABASE
    );
    private static messageRepository: IMessageRepository =
        new CachedMessageRepository(
            this.baseMessageRepository,
            this.cacheStorage
        );

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
