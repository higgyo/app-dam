import Message from "../../domain/entities/Message";
import { IMessageRepository } from "../../domain/interfaces/imessage-repository";
import { IHttpClient } from "../interfaces/ihttp-client";
import { supabase } from "../supabase";
import { RealtimeChannel } from "@supabase/supabase-js";
import { MessageType } from "../../shared/types";
import { SupabaseStorageService } from "../supabase/storage-service";

export class MessageRepository implements IMessageRepository {
    private realtimeChannels: Map<string, RealtimeChannel> = new Map();

    constructor(readonly httpClient: IHttpClient) {}

    async sendMessage(
        content: string,
        roomId: string,
        senderId: string,
        type: MessageType = MessageType.Text,
        mediaUri?: string
    ): Promise<Message> {
        try {
            let publicUrl;

            if (
                (type === MessageType.Image || type === MessageType.Video) &&
                mediaUri
            ) {
                const storage = new SupabaseStorageService();

                const userId = (await supabase.auth.getUser()).data.user?.id;

                if (!userId)
                    throw new Error(
                        "Falha ao enviar mensagem: usuário deve estar logado"
                    );

                publicUrl = await storage.uploadImage(
                    mediaUri,
                    "app-dam",
                    userId
                );
            }

            const { data, error } = await supabase
                .from("messages")
                .insert({
                    content,
                    room_id: roomId,
                    sender_id: senderId,
                    file_url: publicUrl,
                    type,
                })
                .select()
                .single();

            if (error) {
                throw new Error(`Falha ao enviar mensagem: ${error.message}`);
            }

            return Message.create({
                id: data.id,
                content: data.content || "",
                roomId: data.room_id,
                senderId: data.sender_id,
                createdAt: data.created_at,
                type: data.type,
                fileUrl: data.file_url || undefined,
            });
        } catch (error) {
            throw error;
        }
    }

    async getMessagesByRoom(roomId: string): Promise<Message[]> {
        try {
            const { data, error } = await supabase
                .from("messages")
                .select("*")
                .eq("room_id", roomId)
                .order("created_at", { ascending: true });

            if (error) {
                throw new Error(`Falha ao buscar mensagens: ${error.message}`);
            }

            if (!data) return [];

            return data.map((msg) =>
                Message.create({
                    id: msg.id,
                    content: msg.content || "",
                    roomId: msg.room_id,
                    senderId: msg.sender_id,
                    createdAt: msg.created_at,
                    type: msg.type,
                    fileUrl: msg.file_url || undefined,
                })
            );
        } catch (error) {
            throw error;
        }
    }

    subscribeToMessages(
        roomId: string,
        callback: (message: Message) => void
    ): () => void {
        // Remove canal existente se houver
        const existingChannel = this.realtimeChannels.get(roomId);
        if (existingChannel) {
            supabase.removeChannel(existingChannel);
        }

        const channel = supabase
            .channel(`room:${roomId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `room_id=eq.${roomId}`,
                },
                (payload) => {
                    const newMessage = payload.new as any;
                    callback(
                        Message.create({
                            id: newMessage.id,
                            content: newMessage.content || "",
                            roomId: newMessage.room_id,
                            senderId: newMessage.sender_id,
                            createdAt: newMessage.created_at,
                            type: newMessage.type,
                            fileUrl: newMessage.file_url || undefined,
                        })
                    );
                }
            )
            .subscribe();

        this.realtimeChannels.set(roomId, channel);

        return () => {
            supabase.removeChannel(channel);
            this.realtimeChannels.delete(roomId);
        };
    }
}
