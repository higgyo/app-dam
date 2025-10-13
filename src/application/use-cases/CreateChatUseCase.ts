import { IChatRepository } from "../../domain/interfaces/ichat-repository";
import Chat from "../../domain/entities/Chat";
import Password from "../../domain/value-objects/Password";

export class CreateChatUseCase {
    constructor(private readonly chatRepository: IChatRepository) {}

    async execute(params: {
        name: string;
        idUser: string;
        imageUrl: string;
        password: string;
    }): Promise<Chat> {
        const { name, idUser, imageUrl, password } = params;

        const record = await this.chatRepository.createChat(
            name,
            Password.create(password),
            idUser,
            imageUrl
        );

        return record;
    }
}
