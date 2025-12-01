// Types for SQLite database tables

export interface UserRow {
    id: string;
    name: string;
    email: string;
    latitude: number | null;
    longitude: number | null;
    updated_at: string;
}

export interface RoomRow {
    id: string;
    name: string;
    code: string | null;
    id_user: string | null;
    image_url: string | null;
    updated_at: string;
}

export interface MessageRow {
    id: string;
    content: string;
    room_id: string;
    sender_id: string;
    created_at: string;
    type: string;
    file_url: string | null;
    updated_at: string;
}

export interface SyncQueueRow {
    id: number;
    entity_type: "user" | "room" | "message";
    entity_id: string;
    operation: "create" | "update" | "delete";
    data: string; // JSON stringified data
    created_at: string;
    retry_count: number;
}
