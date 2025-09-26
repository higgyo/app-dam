export default class Message {
    private constructor(
        readonly message: string,
        readonly date: string,
        readonly userId: string,
        readonly id?: string,
    ) {}

    static create(message: string, date: string, userId: string, id?: string) {
        return new Message(
            message,
            date,
            userId,
            id
        )
    }
}