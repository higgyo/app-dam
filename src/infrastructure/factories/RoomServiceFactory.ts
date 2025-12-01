import { AxiosHttpClient } from "../http/axios-http-client";
import { RoomRepository } from "../repositories/room-repository";
import { CachedRoomRepository } from "../repositories/cached/CachedRoomRepository";
import { CreateChatUseCase } from "../../application/use-cases/CreateRoomUseCase";
import { EnterRoomUseCase } from "../../application/use-cases/EnterRoomUseCase";
import { ListRoomsUseCase } from "../../application/use-cases/ListRoomsUseCase";
import { IRoomRepository } from "../../domain/interfaces/iroom-repository";

export class RoomServiceFactory {
    private static httpClient = new AxiosHttpClient();
    private static remoteRepository = new RoomRepository(this.httpClient);
    private static cachedRepository: CachedRoomRepository | null = null;

    private static getRoomRepository(): IRoomRepository {
        if (!this.cachedRepository) {
            this.cachedRepository = new CachedRoomRepository(
                this.remoteRepository
            );
        }
        return this.cachedRepository;
    }

    static makeCreateRoomUseCase(): CreateChatUseCase {
        return new CreateChatUseCase(this.getRoomRepository());
    }

    static makeEnterRoomUseCase(): EnterRoomUseCase {
        return new EnterRoomUseCase(this.getRoomRepository());
    }

    static makeListRoomsUseCase(): ListRoomsUseCase {
        return new ListRoomsUseCase(this.getRoomRepository());
    }
}
