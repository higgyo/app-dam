export const MessageType = {
    Image: "image",
    Text: "text",
    Video: "video",
} as const;

export type MessageType = (typeof MessageType)[keyof typeof MessageType];
