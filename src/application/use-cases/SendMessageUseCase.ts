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
        mediaUri?: string;
    }): Promise<Message> {
        const { content, roomId, senderId, type, mediaUri } = params;

        if (!roomId) {
            throw new Error("ID da sala é obrigatório");
        }

        if (!senderId) {
            throw new Error("ID do remetente é obrigatório");
        }

        if (!content.trim() && !mediaUri) {
            throw new Error("Mensagem não pode estar vazia");
        }

        const finalType =
            type ?? (mediaUri ? MessageType.Image : MessageType.Text);

        const message = await this.messageRepository.sendMessage(
            content,
            roomId,
            senderId,
            finalType,
            mediaUri
        );

        return message;
    }
}
