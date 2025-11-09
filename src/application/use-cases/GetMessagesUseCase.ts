import { IMessageRepository } from "../../domain/interfaces/imessage-repository";
import Message from "../../domain/entities/Message";

export class GetMessagesUseCase {
    constructor(private readonly messageRepository: IMessageRepository) {}

    async execute(params: { roomId: string }): Promise<Message[]> {
        const { roomId } = params;

        if (!roomId) {
            throw new Error("ID da sala é obrigatório");
        }

        const messages = await this.messageRepository.getMessagesByRoom(roomId);

        return messages;
    }
}
