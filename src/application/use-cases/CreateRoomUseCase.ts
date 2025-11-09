import { IRoomRepository } from "../../domain/interfaces/iroom-repository";
import Room from "../../domain/entities/Room";
import Password from "../../domain/value-objects/Password";

export class CreateChatUseCase {
    constructor(private readonly roomRepository: IRoomRepository) {}

    async execute(params: {
        name: string;
        idUser: string;
        password: string;
    }): Promise<Room> {
        const { name, idUser, password } = params;

        const record = await this.roomRepository.createRoom(
            name,
            Password.create(password),
            idUser
        );

        return record;
    }
}
