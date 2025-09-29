export default class Message {
    private constructor(
        readonly message: string,
        readonly date: string,
        readonly userId: string,
        readonly chatId: string,
        readonly id?: string
    ) {}

    static create(
        message: string,
        date: string,
        userId: string,
        chatId: string,
        id?: string
    ) {
        return new Message(message, date, userId, chatId, id);
    }
}
