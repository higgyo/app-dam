import { IRoomRepository } from "../../domain/interfaces/iroom-repository";
import Room from "../../domain/entities/Room";

export class ListRoomsUseCase {
    constructor(private readonly roomRepository: IRoomRepository) {}

    async execute(): Promise<Room[]> {
        const rooms = await this.roomRepository.getRoomsList();
        return rooms;
    }
}
