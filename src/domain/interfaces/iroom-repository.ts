import Room from "../entities/Room";
import Password from "../value-objects/Password";

export interface IRoomRepository {
    createRoom(name: string, password: Password): Promise<Room>;
    enterRoom(code: string, password: Password): Promise<Room>;
    getRoomsList(): Promise<Room[]>;
}
