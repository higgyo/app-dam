import Room from "../../domain/entities/Room";
import Password from "../../domain/value-objects/Password";
import { IRoomRepository } from "../../domain/interfaces/iroom-repository";
import { ICacheStorage } from "../cache/icache-storage";
import { CACHE_CONFIG } from "../cache/cache-config";

const ROOMS_LIST_CACHE_KEY = "rooms:list";

export class CachedRoomRepository implements IRoomRepository {
    constructor(
        private readonly roomRepository: IRoomRepository,
        private readonly cache: ICacheStorage
    ) {}

    async createRoom(name: string, password: Password): Promise<Room> {
        const room = await this.roomRepository.createRoom(name, password);

        await this.cache.delete(ROOMS_LIST_CACHE_KEY);

        return room;
    }

    async enterRoom(code: string, password: Password): Promise<Room> {
        const room = await this.roomRepository.enterRoom(code, password);

        await this.cache.delete(ROOMS_LIST_CACHE_KEY);

        return room;
    }

    async getRoomsList(): Promise<Room[]> {
        const cached = await this.cache.get<
            {
                id?: string;
                name: string;
                code?: string;
                idUser?: string;
            }[]
        >(ROOMS_LIST_CACHE_KEY);

        if (cached) {
            return cached.map((room) =>
                Room.create({
                    id: room.id,
                    name: room.name,
                    code: room.code,
                    idUser: room.idUser,
                })
            );
        }

        const rooms = await this.roomRepository.getRoomsList();

        const roomsData = rooms.map((room) => ({
            id: room.id,
            name: room.name,
            code: room.code,
            idUser: room.idUser,
        }));

        await this.cache.set(
            ROOMS_LIST_CACHE_KEY,
            roomsData,
            CACHE_CONFIG.DEFAULT_TTL_SECONDS
        );

        return rooms;
    }
}
