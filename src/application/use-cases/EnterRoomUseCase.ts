import { IRoomRepository } from "../../domain/interfaces/iroom-repository";
import Room from "../../domain/entities/Room";
import Password from "../../domain/value-objects/Password";

export class EnterRoomUseCase {
    constructor(private readonly roomRepository: IRoomRepository) {}

    async execute(params: { code: string; password: string }): Promise<Room> {
        const { code, password } = params;

        const room = await this.roomRepository.enterRoom(
            code,
            Password.create(password)
        );

        return room;
    }
}
