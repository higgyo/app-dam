import { AxiosHttpClient } from "../http/axios-http-client";
import { MessageRepository } from "../repositories/message-repository";
import { CachedMessageRepository } from "../repositories/cached/CachedMessageRepository";
import { SendMessageUseCase } from "../../application/use-cases/SendMessageUseCase";
import { GetMessagesUseCase } from "../../application/use-cases/GetMessagesUseCase";
import { IMessageRepository } from "../../domain/interfaces/imessage-repository";

export class MessageServiceFactory {
    private static httpClient = new AxiosHttpClient();
    private static remoteRepository = new MessageRepository(this.httpClient);
    private static cachedRepository: CachedMessageRepository | null = null;

    private static getCachedRepository(): IMessageRepository {
        if (!this.cachedRepository) {
            this.cachedRepository = new CachedMessageRepository(
                this.remoteRepository
            );
        }
        return this.cachedRepository;
    }

    static makeSendMessageUseCase(): SendMessageUseCase {
        return new SendMessageUseCase(this.getCachedRepository());
    }

    static makeGetMessagesUseCase(): GetMessagesUseCase {
        return new GetMessagesUseCase(this.getCachedRepository());
    }

    static getMessageRepository(): IMessageRepository {
        return this.getCachedRepository();
    }
}
