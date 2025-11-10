export const MessageType = {
  Image: 'image',
  Text: 'text',
} as const;

export type MessageType = typeof MessageType[keyof typeof MessageType];