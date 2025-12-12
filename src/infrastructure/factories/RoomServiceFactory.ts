import { AxiosHttpClient } from "../http/axios-http-client";
import { RoomRepository } from "../repositories/room-repository";
import { CachedRoomRepository } from "../cache/cached-room-repository";
import { CreateChatUseCase } from "../../application/use-cases/CreateRoomUseCase";
import { EnterRoomUseCase } from "../../application/use-cases/EnterRoomUseCase";
import { ListRoomsUseCase } from "../../application/use-cases/ListRoomsUseCase";
import { IRoomRepository } from "../../domain/interfaces/iroom-repository";

export class RoomServiceFactory {
    private static httpClient = new AxiosHttpClient();
    private static remoteRepository = new RoomRepository(this.httpClient);
    private static roomRepository: IRoomRepository = new CachedRoomRepository(
        this.remoteRepository
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
