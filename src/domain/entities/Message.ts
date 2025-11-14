import * as Crypto from "expo-crypto";

export default class Message {
    private constructor(
        readonly id: string,
        readonly message: string,
        readonly date: string,
        readonly userId: string,
        readonly chatId: string,
        readonly mediaUrl?: string
    ) {}

    static create(
        message: string,
        date: string,
        userId: string,
        chatId: string,
        mediaUrl?: string,
        id?: string
    ) {
        const finalId = id?.length ? id : Crypto.randomUUID();

        return new Message(finalId, message, date, userId, chatId, mediaUrl);
    }
}
