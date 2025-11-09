import Room from "../../domain/entities/Room";
import Message from "../../domain/entities/Message";
import Password from "../../domain/value-objects/Password";
import { IRoomRepository } from "../../domain/interfaces/iroom-repository";
import { IHttpClient } from "../interfaces/ihttp-client";
import { supabase } from "../supabase";

export class RoomRepository implements IRoomRepository {
    constructor(readonly httpClient: IHttpClient) {}

    async createRoom(name: string, password: Password): Promise<Room> {
        try {
            const { error, data } = await supabase.functions.invoke(
                "create-room",
                {
                    body: {
                        name: name,
                        password: password,
                    },
                }
            );

            if (error) throw new Error(`Falha ao criar sala: ${error.message}`);

            return Room.create({ name, code: data.code });
        } catch (error) {
            throw error;
        }
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

    async enterRoom(code: string, password: Password): Promise<Room> {
        try {
            const { error, data } = await supabase.functions.invoke(
                "enter-room",
                {
                    body: {
                        code: code,
                        password: password.value,
                    },
                }
            );

            if (error)
                throw new Error(`Falha ao entrar na sala: ${error.message}`);

            return Room.create({
                id: data.id,
                name: data.name,
                code: data.code,
                idUser: data.created_by,
            });
        } catch (error) {
            throw error;
        }
    }

    async getRoomsList(): Promise<Room[]> {
        try {
            const { error: authError, data: authData } =
                await supabase.auth.getUser();

            if (authError)
                throw new Error(`Falha ao listar salas: ${authError.message}`);

            const { data, error } = await supabase
                .from("room_members")
                .select(
                    `
                    room_id,
                    rooms:room_id (
                        id,
                        name,
                        code,
                        created_by
                    )
                `
                )
                .eq("user_id", authData.user.id);

            if (error)
                throw new Error(`Falha ao listar salas: ${error.message}`);

            if (!data) return [];

            return data.map((item: any) => {
                const room = item.rooms;
                return Room.create({
                    id: room.id,
                    name: room.name,
                    code: room.code,
                    idUser: room.created_by,
                });
            });
        } catch (error) {
            throw error;
        }
    }
}
