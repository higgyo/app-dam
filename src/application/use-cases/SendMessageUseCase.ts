import { IMessageRepository } from "../../domain/interfaces/imessage-repository";
import Message from "../../domain/entities/Message";
import { MessageType } from "../../shared/types";

export class SendMessageUseCase {
    constructor(private readonly messageRepository: IMessageRepository) {}

    async execute(params: {
        content: string;
        roomId: string;
        senderId: string;
        type?: MessageType;
        imageUri?: string;
    }): Promise<Message> {
        const { content, roomId, senderId, type, imageUri } = params;

        if (!content.trim()) {
            throw new Error("Mensagem não pode estar vazia");
        }

        if (!roomId) {
            throw new Error("ID da sala é obrigatório");
        }

        if (!senderId) {
            throw new Error("ID do remetente é obrigatório");
        }

        const message = await this.messageRepository.sendMessage(
            content,
            roomId,
            senderId,
            type || MessageType.Text,
            imageUri
        );

        return message;
    }
}
