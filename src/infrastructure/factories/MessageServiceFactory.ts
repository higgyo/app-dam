import { AxiosHttpClient } from "../http/axios-http-client";
import { MessageRepository } from "../repositories/message-repository";
import { SendMessageUseCase } from "../../application/use-cases/SendMessageUseCase";
import { GetMessagesUseCase } from "../../application/use-cases/GetMessagesUseCase";
import { IMessageRepository } from "../../domain/interfaces/imessage-repository";
import { CachedMessageRepository, SQLiteDatabase } from "../cache";

export class MessageServiceFactory {
    private static httpClient = new AxiosHttpClient();
    private static remoteRepository = new MessageRepository(this.httpClient);
    private static cachedRepository: CachedMessageRepository | null = null;

    private static getRepository(): IMessageRepository {
        if (this.cachedRepository) {
            return this.cachedRepository;
        }
        return this.remoteRepository;
    }

    static initializeCache(): void {
        const sqliteDb = SQLiteDatabase.getInstance();
        this.cachedRepository = new CachedMessageRepository(this.remoteRepository, sqliteDb);
    }

    static makeSendMessageUseCase(): SendMessageUseCase {
        return new SendMessageUseCase(this.getRepository());
    }

    static makeGetMessagesUseCase(): GetMessagesUseCase {
        return new GetMessagesUseCase(this.getRepository());
    }

    static getMessageRepository(): IMessageRepository {
        return this.getRepository();
    }

    static getCachedRepository(): CachedMessageRepository | null {
        return this.cachedRepository;
    }
}
