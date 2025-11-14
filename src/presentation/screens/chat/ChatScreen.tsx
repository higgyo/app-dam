import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    StyleSheet,
    Modal,
    Image,
} from "react-native";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { ChatCamera } from "../chat_camera/ChatCamera";
import { IChatRepository } from "../../../domain/interfaces/ichat-repository";
import { useAuthContext } from "../../contexts/AuthContext";

interface ChatScreenProps {
    chatRepository?: IChatRepository;
    currentChatId?: string;
}

type UiMessage = {
    id: number;
    text?: string;
    sender: string;
    type: "sent" | "received";
    time: string;
    mediaUrl?: string;
};

const ChatScreen: React.FC<ChatScreenProps> = ({
    chatRepository,
    currentChatId = "chat-1",
}) => {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<UiMessage[]>([]);
    const [showCamera, setShowCamera] = useState(false);

    const { currentUser } = useAuthContext();

    const currentUserId = currentUser?.id ?? "";

    const handleAppendMessage = (partial: Omit<UiMessage, "id" | "time">) => {
        const newMessage: UiMessage = {
            id: messages.length + 1,
            time: "agora",
            ...partial,
        };
        setMessages((prev) => [...prev, newMessage]);
    };

    const sendMessage = async () => {
        const trimmed = message.trim();
        if (!trimmed) return;

        handleAppendMessage({
            text: trimmed,
            sender: "Nicolas",
            type: "sent",
        });
        setMessage("");

        if (chatRepository) {
            try {
                await chatRepository.sendMessage(
                    trimmed,
                    currentUserId,
                    currentChatId
                );
            } catch {}
        }
    };

    const handlePhotoTaken = async (uri: string) => {
        handleAppendMessage({
            sender: "Nicolas",
            type: "sent",
            mediaUrl: uri,
        });

        if (chatRepository) {
            try {
                await chatRepository.sendMessage(
                    "",
                    currentUserId,
                    currentChatId,
                    uri
                );
            } catch {}
        }
    };

    const handleVideoRecorded = async (uri: string) => {
        handleAppendMessage({
            sender: "Nicolas",
            type: "sent",
            mediaUrl: uri,
        });

        if (chatRepository) {
            try {
                await chatRepository.sendMessage(
                    "",
                    currentUserId,
                    currentChatId,
                    uri
                );
            } catch {}
        }
    };
    useEffect(() => {
        if (!chatRepository) return;

        let isMounted = true;

        (async () => {
            try {
                const domainMessages = await chatRepository.getMessagesByChat(
                    currentChatId
                );

                if (!isMounted) return;

                const uiMessages: UiMessage[] = domainMessages.map(
                    (domainMessage, index) => ({
                        id: index + 1,
                        text:
                            (domainMessage as any).message ??
                            (domainMessage as any).text ??
                            "",
                        sender:
                            (domainMessage as any).idUser === currentUserId
                                ? "Nicolas"
                                : "Outro usuário",
                        type:
                            (domainMessage as any).idUser === currentUserId
                                ? "sent"
                                : "received",
                        time: "agora",
                        mediaUrl: (domainMessage as any).mediaUrl,
                    })
                );

                setMessages(uiMessages);
            } catch (error) {}
        })();

        return () => {
            isMounted = false;
        };
    }, [chatRepository, currentChatId, currentUserId]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton}>
                    <MaterialIcons
                        name="keyboard-arrow-left"
                        size={24}
                        color="#007AFF"
                    />
                </TouchableOpacity>
                <View style={styles.headerTitle}>
                    <Text style={styles.titleText}>
                        Mais que amigos, Friends
                    </Text>
                </View>
                <TouchableOpacity style={styles.profileIcon}>
                    <FontAwesome name="user" size={24} color="#B4DBFF" />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.messagesContainer}
                contentContainerStyle={styles.messagesContent}
            >
                {messages.map((msg) => (
                    <View key={msg.id} style={styles.messageContainer}>
                        {msg.type === "received" ? (
                            <View style={styles.receivedMessageRow}>
                                <View style={styles.receivedBubble}>
                                    {msg.sender && (
                                        <Text style={styles.senderName}>
                                            {msg.sender}
                                        </Text>
                                    )}
                                    {msg.text ? (
                                        <Text style={styles.receivedText}>
                                            {msg.text}
                                        </Text>
                                    ) : null}
                                    {msg.mediaUrl ? (
                                        <Image
                                            source={{ uri: msg.mediaUrl }}
                                            style={styles.messageImage}
                                        />
                                    ) : null}
                                </View>
                            </View>
                        ) : (
                            <View style={styles.sentMessageRow}>
                                <View style={styles.sentBubble}>
                                    {msg.text ? (
                                        <Text style={styles.sentText}>
                                            {msg.text}
                                        </Text>
                                    ) : null}
                                    {msg.mediaUrl ? (
                                        <Image
                                            source={{ uri: msg.mediaUrl }}
                                            style={styles.messageImage}
                                        />
                                    ) : null}
                                </View>
                            </View>
                        )}
                    </View>
                ))}
            </ScrollView>

            <View style={styles.inputContainer}>
                <TouchableOpacity style={styles.plusButton}>
                    <FontAwesome name="plus" size={24} color="#007AFF" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.cameraButton}
                    onPress={() => setShowCamera(true)}
                >
                    <FontAwesome name="camera" size={22} color="#007AFF" />
                </TouchableOpacity>

                <View style={styles.inputWrapper}>
                    <TextInput
                        value={message}
                        onChangeText={setMessage}
                        placeholder="Enviar mensagem"
                        placeholderTextColor="#999"
                        style={styles.textInput}
                        multiline={false}
                        onSubmitEditing={sendMessage}
                    />
                </View>

                <TouchableOpacity
                    onPress={sendMessage}
                    style={styles.sendButton}
                >
                    <FontAwesome name="send" size={16} color="white" />
                </TouchableOpacity>
            </View>

            <Modal visible={showCamera} animationType="slide">
                <ChatCamera
                    onPhotoTaken={handlePhotoTaken}
                    onVideoRecorded={handleVideoRecorded}
                    onClose={() => setShowCamera(false)}
                />
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#ddd",
    },
    backButton: {
        paddingRight: 8,
        paddingVertical: 4,
    },
    headerTitle: {
        flex: 1,
        alignItems: "center",
    },
    titleText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#000",
    },
    profileIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#E5F2FF",
        alignItems: "center",
        justifyContent: "center",
    },
    messagesContainer: {
        flex: 1,
        paddingHorizontal: 16,
    },
    messagesContent: {
        paddingVertical: 16,
    },
    messageContainer: {
        marginBottom: 8,
    },
    receivedMessageRow: {
        flexDirection: "row",
        justifyContent: "flex-start",
    },
    sentMessageRow: {
        flexDirection: "row",
        justifyContent: "flex-end",
    },
    receivedBubble: {
        maxWidth: "80%",
        backgroundColor: "#F1F0F0",
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    sentBubble: {
        maxWidth: "80%",
        backgroundColor: "#007AFF",
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    senderName: {
        fontSize: 11,
        fontWeight: "600",
        color: "#555",
        marginBottom: 2,
    },
    receivedText: {
        fontSize: 14,
        color: "#000",
    },
    sentText: {
        fontSize: 14,
        color: "#fff",
    },
    messageImage: {
        marginTop: 6,
        borderRadius: 10,
        width: 200,
        height: 200,
        backgroundColor: "#000",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: "#ddd",
    },
    plusButton: {
        marginRight: 8,
    },
    cameraButton: {
        marginRight: 8,
    },
    inputWrapper: {
        flex: 1,
        backgroundColor: "#F3F3F3",
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    textInput: {
        fontSize: 14,
        color: "#000",
    },
    sendButton: {
        marginLeft: 8,
        backgroundColor: "#007AFF",
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
});

export default ChatScreen;
