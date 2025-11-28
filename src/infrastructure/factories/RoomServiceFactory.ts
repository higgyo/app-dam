import { AxiosHttpClient } from "../http/axios-http-client";
import { RoomRepository } from "../repositories/room-repository";
import { CreateChatUseCase } from "../../application/use-cases/CreateRoomUseCase";
import { EnterRoomUseCase } from "../../application/use-cases/EnterRoomUseCase";
import { ListRoomsUseCase } from "../../application/use-cases/ListRoomsUseCase";
import { IRoomRepository } from "../../domain/interfaces/iroom-repository";
import { CachedRoomRepository, SQLiteDatabase } from "../cache";

export class RoomServiceFactory {
    private static httpClient = new AxiosHttpClient();
    private static remoteRepository = new RoomRepository(this.httpClient);
    private static cachedRepository: CachedRoomRepository | null = null;

    private static getRepository(): IRoomRepository {
        if (this.cachedRepository) {
            return this.cachedRepository;
        }
        return this.remoteRepository;
    }

    static initializeCache(): void {
        const sqliteDb = SQLiteDatabase.getInstance();
        this.cachedRepository = new CachedRoomRepository(this.remoteRepository, sqliteDb);
    }

    static makeCreateRoomUseCase(): CreateChatUseCase {
        return new CreateChatUseCase(this.getRepository());
    }

    static makeEnterRoomUseCase(): EnterRoomUseCase {
        return new EnterRoomUseCase(this.getRepository());
    }

    static makeListRoomsUseCase(): ListRoomsUseCase {
        return new ListRoomsUseCase(this.getRepository());
    }

    static getCachedRepository(): CachedRoomRepository | null {
        return this.cachedRepository;
    }
}
