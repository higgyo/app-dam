import { AxiosHttpClient } from "../http/axios-http-client";
import { RoomRepository } from "../repositories/room-repository";
import { CachedRoomRepository } from "../repositories/cached-room-repository";
import { CreateChatUseCase } from "../../application/use-cases/CreateRoomUseCase";
import { EnterRoomUseCase } from "../../application/use-cases/EnterRoomUseCase";
import { ListRoomsUseCase } from "../../application/use-cases/ListRoomsUseCase";
import { SQLiteCacheStorage } from "../cache";
import { IRoomRepository } from "../../domain/interfaces/iroom-repository";

export class RoomServiceFactory {
    private static httpClient = new AxiosHttpClient();
    private static baseRoomRepository = new RoomRepository(this.httpClient);
    private static cacheStorage = new SQLiteCacheStorage("rooms_cache.db");
    private static roomRepository: IRoomRepository = new CachedRoomRepository(
        this.baseRoomRepository,
        this.cacheStorage
    );

    static makeCreateRoomUseCase(): CreateChatUseCase {
        return new CreateChatUseCase(this.roomRepository);
    }

    static makeEnterRoomUseCase(): EnterRoomUseCase {
        return new EnterRoomUseCase(this.roomRepository);
    }

    static makeListRoomsUseCase(): ListRoomsUseCase {
        return new ListRoomsUseCase(this.roomRepository);
    }
}
