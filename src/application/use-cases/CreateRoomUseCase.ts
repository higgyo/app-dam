import { IRoomRepository } from "../../domain/interfaces/iroom-repository";
import Room from "../../domain/entities/Room";
import Password from "../../domain/value-objects/Password";

export class CreateChatUseCase {
    constructor(private readonly roomRepository: IRoomRepository) {}

    async execute(params: { name: string; password: string }): Promise<Room> {
        const { name, password } = params;

        const record = await this.roomRepository.createRoom(
            name,
            Password.create(password)
        );

        return record;
    }
}
