import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    StyleSheet,
    ActivityIndicator,
    Alert,
    Platform,
    Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { useAuthContext } from "../../contexts/AuthContext";
import { MessageServiceFactory } from "../../../infrastructure/factories/MessageServiceFactory";
import Message from "../../../domain/entities/Message";

type ChatScreenRouteProp = RouteProp<
    { Chat: { roomId: string; roomName: string } },
    "Chat"
>;

const ChatScreen = () => {
    const route = useRoute<ChatScreenRouteProp>();
    const navigation = useNavigation();
    const { currentUser } = useAuthContext();
    const scrollViewRef = useRef<ScrollView>(null);
    const insets = useSafeAreaInsets();

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    const roomId = route.params?.roomId;
    const roomName = route.params?.roomName || "Chat";

    const sendMessageUseCase = MessageServiceFactory.makeSendMessageUseCase();
    const getMessagesUseCase = MessageServiceFactory.makeGetMessagesUseCase();
    const messageRepository = MessageServiceFactory.getMessageRepository();

    useEffect(() => {
        if (!roomId) {
            Alert.alert("Erro", "ID da sala não fornecido");
            navigation.goBack();
            return;
        }

        loadMessages();

        // Subscribe to real-time messages
        const unsubscribe = messageRepository.subscribeToMessages(
            roomId,
            (newMessage) => {
                setMessages((prev) => [...prev, newMessage]);
                setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 100);
            }
        );

        // Keyboard listeners
        const keyboardWillShow = Keyboard.addListener(
            Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
            (e) => {
                setKeyboardHeight(e.endCoordinates.height);
                setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 100);
            }
        );

        const keyboardWillHide = Keyboard.addListener(
            Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
            () => {
                setKeyboardHeight(0);
            }
        );

        return () => {
            unsubscribe();
            keyboardWillShow.remove();
            keyboardWillHide.remove();
        };
    }, [roomId]);

    const loadMessages = async () => {
        try {
            setLoading(true);
            const loadedMessages = await getMessagesUseCase.execute({ roomId });
            setMessages(loadedMessages);
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: false });
            }, 100);
        } catch (error: any) {
            Alert.alert("Erro", error.message || "Falha ao carregar mensagens");
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!message.trim() || !currentUser || sending) return;

        try {
            setSending(true);
            await sendMessageUseCase.execute({
                content: message.trim(),
                roomId: roomId,
                senderId: currentUser.id!,
                type: "text",
            });
            setMessage("");
        } catch (error: any) {
            Alert.alert("Erro", error.message || "Falha ao enviar mensagem");
        } finally {
            setSending(false);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Carregando mensagens...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <MaterialIcons
                        name="keyboard-arrow-left"
                        size={24}
                        color="#007AFF"
                    />
                </TouchableOpacity>
                <View style={styles.headerTitle}>
                    <Text style={styles.titleText}>{roomName}</Text>
                </View>
                <TouchableOpacity style={styles.profileIcon}>
                    <FontAwesome name="user" size={24} color="#B4DBFF" />
                </TouchableOpacity>
            </View>

            <ScrollView
                ref={scrollViewRef}
                style={styles.messagesContainer}
                contentContainerStyle={[
                    styles.messagesContent,
                    {
                        paddingBottom:
                            keyboardHeight > 0
                                ? keyboardHeight - insets.bottom
                                : 16,
                    },
                ]}
                onContentSizeChange={() =>
                    scrollViewRef.current?.scrollToEnd({ animated: true })
                }
                keyboardShouldPersistTaps="handled"
            >
                {messages.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            Nenhuma mensagem ainda
                        </Text>
                        <Text style={styles.emptySubText}>
                            Seja o primeiro a enviar uma mensagem!
                        </Text>
                    </View>
                ) : (
                    messages.map((msg) => {
                        const isSent = msg.senderId === currentUser?.id;
                        return (
                            <View key={msg.id} style={styles.messageContainer}>
                                {!isSent ? (
                                    <View style={styles.receivedMessageRow}>
                                        <View style={styles.receivedBubble}>
                                            <Text style={styles.receivedText}>
                                                {msg.content}
                                            </Text>
                                            <Text style={styles.timeText}>
                                                {formatTime(msg.createdAt)}
                                            </Text>
                                        </View>
                                    </View>
                                ) : (
                                    <View style={styles.sentMessageRow}>
                                        <View style={styles.sentBubble}>
                                            <Text style={styles.sentText}>
                                                {msg.content}
                                            </Text>
                                            <Text style={styles.sentTimeText}>
                                                {formatTime(msg.createdAt)}
                                            </Text>
                                        </View>
                                    </View>
                                )}
                            </View>
                        );
                    })
                )}
            </ScrollView>

            <View
                style={[
                    styles.inputContainer,
                    keyboardHeight > 0 && {
                        position: "absolute",
                        bottom: keyboardHeight - insets.bottom,
                        left: 0,
                        right: 0,
                    },
                    {
                        paddingBottom:
                            keyboardHeight > 0
                                ? 12
                                : Math.max(insets.bottom, 8),
                    },
                ]}
            >
                <TouchableOpacity style={styles.plusButton}>
                    <FontAwesome name="plus" size={24} color="#007AFF" />
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
                        editable={!sending}
                        returnKeyType="send"
                        blurOnSubmit={false}
                    />
                </View>

                <TouchableOpacity
                    onPress={sendMessage}
                    style={[
                        styles.sendButton,
                        (sending || !message.trim()) &&
                            styles.sendButtonDisabled,
                    ]}
                    disabled={sending || !message.trim()}
                >
                    {sending ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <FontAwesome name="send" size={16} color="white" />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#f0f0f0",
    },
    container: {
        flex: 1,
        backgroundColor: "#f0f0f0",
    },
    flex: {
        flex: 1,
    },
    centerContent: {
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: "#666",
    },
    header: {
        backgroundColor: "white",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    backButton: {
        marginRight: 16,
    },
    backArrow: {
        fontSize: 24,
        color: "#007AFF",
        fontWeight: "300",
    },
    headerTitle: {
        flex: 1,
    },
    titleText: {
        fontSize: 17,
        fontWeight: "600",
        color: "#000",
    },
    profileIcon: {
        width: 32,
        height: 32,
        backgroundColor: "#e3f2fd",
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    profileIconText: {
        fontSize: 16,
    },
    messagesContainer: {
        flex: 1,
    },
    messagesContent: {
        padding: 16,
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#666",
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 14,
        color: "#999",
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
        backgroundColor: "white",
        borderRadius: 18,
        paddingHorizontal: 12,
        paddingVertical: 8,
        maxWidth: 280,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    sentBubble: {
        backgroundColor: "#007AFF",
        borderRadius: 18,
        paddingHorizontal: 12,
        paddingVertical: 8,
        maxWidth: 280,
    },
    senderName: {
        fontSize: 13,
        fontWeight: "600",
        color: "#666",
        marginBottom: 2,
    },
    receivedText: {
        fontSize: 16,
        color: "#000",
        lineHeight: 20,
    },
    sentText: {
        fontSize: 16,
        color: "white",
        lineHeight: 20,
    },
    timeText: {
        fontSize: 11,
        color: "#999",
        marginTop: 4,
        alignSelf: "flex-end",
    },
    sentTimeText: {
        fontSize: 11,
        color: "#E5F1FF",
        marginTop: 4,
        alignSelf: "flex-end",
    },
    inputContainer: {
        backgroundColor: "white",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: "#e0e0e0",
    },
    plusButton: {
        marginRight: 12,
    },
    plusIcon: {
        fontSize: 20,
        color: "#007AFF",
    },
    inputWrapper: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    textInput: {
        fontSize: 16,
        color: "#000",
    },
    sendButton: {
        height: 42,
        width: 42,
        backgroundColor: "#007AFF",
        borderRadius: 42,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 12,
    },
    sendButtonDisabled: {
        backgroundColor: "#B4DBFF",
    },
});

export default ChatScreen;
