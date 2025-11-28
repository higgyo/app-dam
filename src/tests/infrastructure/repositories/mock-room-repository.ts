import Room from "../../../domain/entities/Room";
import { IRoomRepository } from "../../../domain/interfaces/iroom-repository";
import Password from "../../../domain/value-objects/Password";

export class MockRoomRepository implements IRoomRepository {
    private rooms: Room[] = [];
    private createRoomCalls = 0;
    private enterRoomCalls = 0;
    private getRoomsListCalls = 0;

    async createRoom(name: string, password: Password): Promise<Room> {
        this.createRoomCalls++;
        const room = Room.create({
            id: `room-${Date.now()}`,
            name,
            code: `CODE${Date.now()}`,
        });
        this.rooms.push(room);
        return room;
    }

    async enterRoom(code: string, password: Password): Promise<Room> {
        this.enterRoomCalls++;
        const room = this.rooms.find((r) => r.code === code);
        if (!room) {
            throw new Error("Room not found");
        }
        return room;
    }

    async getRoomsList(): Promise<Room[]> {
        this.getRoomsListCalls++;
        return this.rooms;
    }

    // Test helpers
    getCreateRoomCallCount(): number {
        return this.createRoomCalls;
    }

    getEnterRoomCallCount(): number {
        return this.enterRoomCalls;
    }

    getGetRoomsListCallCount(): number {
        return this.getRoomsListCalls;
    }

    addTestRoom(room: Room): void {
        this.rooms.push(room);
    }

    clearRooms(): void {
        this.rooms = [];
    }
}
