import Room from "../../domain/entities/Room";
import Message from "../../domain/entities/Message";
import Password from "../../domain/value-objects/Password";
import { IRoomRepository } from "../../domain/interfaces/iroom-repository";
import { IHttpClient } from "../interfaces/ihttp-client";

export class RoomRepository implements IRoomRepository {
    constructor(readonly httpClient: IHttpClient) {}

    async createRoom(
        name: string,
        password: Password,
        idUser: string
    ): Promise<Room> {
        return Room.create(name);
    }

    async sendMessage(
        message: string,
        idUser: string,
        roomId: string
    ): Promise<Message> {
        return Message.create(
            message,
            "2025-09-26T16:43:29.000Z",
            idUser,
            roomId
        );
    }

    async enterRoom(id: string, password: Password): Promise<Room> {
        return Room.create("chat-aleatório");
    }

    async getRoomsList(idUser: string): Promise<Room[]> {
        return [Room.create("chat-aleatório"), Room.create("chat-aleatório-2")];
    }
}
