import Room from "../entities/Room";
import Message from "../entities/Message";
import Password from "../value-objects/Password";

export interface IRoomRepository {
    createRoom(name: string, password: Password): Promise<Room>;
    enterRoom(code: string, password: Password): Promise<Room>;
    getRoomsList(): Promise<Room[]>;
    sendMessage(
        message: string,
        idUser: string,
        roomId: string
    ): Promise<Message>;
}
