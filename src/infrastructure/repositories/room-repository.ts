import Room from "../../domain/entities/Room";
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
                        password: password.value,
                    },
                }
            );

            if (error) {
                const errorBody = await error.context.json();
                throw new Error(`Falha ao criar sala: ${errorBody.error}`);
            }

            return Room.create({ name, code: data.code });
        } catch (error) {
            throw error;
        }
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

            if (error) {
                const errorBody = await error.context.json();
                throw new Error(`Falha ao entrar na sala: ${errorBody.error}`);
            }

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
