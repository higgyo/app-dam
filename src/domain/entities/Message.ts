export default class Message {
    private constructor(
        readonly content: string,
        readonly roomId: string,
        readonly senderId: string,
        readonly createdAt: string,
        readonly type: string = "text",
        readonly fileUrl?: string,
        readonly id?: string
    ) {}

    static create(params: {
        content: string;
        roomId: string;
        senderId: string;
        createdAt: string;
        type?: string;
        fileUrl?: string;
        id?: string;
    }) {
        return new Message(
            params.content,
            params.roomId,
            params.senderId,
            params.createdAt,
            params.type || "text",
            params.fileUrl,
            params.id
        );
    }
}
