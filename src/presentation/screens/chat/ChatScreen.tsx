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
    Modal,
    Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { Image } from "expo-image";
import { VideoView, useVideoPlayer } from "expo-video";
import { useAuthContext } from "../../contexts/AuthContext";
import { MessageServiceFactory } from "../../../infrastructure/factories/MessageServiceFactory";
import Message from "../../../domain/entities/Message";
import { ChatCamera } from "../chat_camera/ChatCamera";
import { supabase } from "../../../infrastructure/supabase";

type ChatScreenRouteProp = RouteProp<
    { Chat: { roomId: string; roomName: string } },
    "Chat"
>;

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const MESSAGE_IMAGE_WIDTH = SCREEN_WIDTH * 0.6;
const MESSAGE_IMAGE_HEIGHT = MESSAGE_IMAGE_WIDTH * 0.75;

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
    const [showCamera, setShowCamera] = useState(false);
    const [fullscreenMedia, setFullscreenMedia] = useState<{
        uri: string;
        type: "image" | "video";
    } | null>(null);
    const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

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

        const unsubscribe = messageRepository.subscribeToMessages(
            roomId,
            (newMessage) => {
                setMessages((prev) => [...prev, newMessage]);
                setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 100);
            }
        );

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

    useEffect(() => {
        const generateSignedUrls = async () => {
            const updates: Record<string, string> = {};

            for (const msg of messages) {
                if (!msg.fileUrl) continue;
                if (signedUrls[msg.id]) continue;

                let path = msg.fileUrl;

                if (path.startsWith("http://") || path.startsWith("https://")) {
                    try {
                        const url = new URL(path);
                        const segments = url.pathname
                            .split("/")
                            .filter(Boolean);
                        const bucketIndex = segments.indexOf("app-dam");

                        if (bucketIndex !== -1) {
                            path = segments.slice(bucketIndex + 1).join("/");
                        } else {
                            path = segments[segments.length - 1];
                        }
                    } catch (error) {
                        console.log(error);
                    }
                }

                const { data, error } = await supabase.storage
                    .from("app-dam")
                    .createSignedUrl(path, 60 * 60);

                if (!error && data?.signedUrl) {
                    updates[msg.id] = data.signedUrl;
                } else {
                    console.log("Erro ao gerar signed URL:", path, error);
                }
            }

            if (Object.keys(updates).length > 0) {
                setSignedUrls((prev) => ({ ...prev, ...updates }));
            }
        };

        if (messages.length > 0) {
            generateSignedUrls();
        }
    }, [messages, signedUrls]);

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

    const handlePhotoTaken = async (uri: string) => {
        setShowCamera(false);

        if (!currentUser) return;

        try {
            setSending(true);
            await sendMessageUseCase.execute({
                content: "",
                roomId,
                senderId: currentUser.id!,
                mediaUri: uri,
                type: "image",
            });
        } catch (error: any) {
            Alert.alert("Erro", error.message || "Falha ao enviar foto");
        } finally {
            setSending(false);
        }
    };

    const handleVideoRecorded = async (uri: string) => {
        setShowCamera(false);

        if (!currentUser) return;

        try {
            setSending(true);
            await sendMessageUseCase.execute({
                content: "",
                roomId,
                senderId: currentUser.id!,
                mediaUri: uri,
                type: "video",
            });
        } catch (error: any) {
            Alert.alert("Erro", error.message || "Falha ao enviar vídeo");
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

    const getMediaUri = (msg: Message) => {
        if (signedUrls[msg.id]) return signedUrls[msg.id];
        if (msg.fileUrl) return msg.fileUrl;
        return msg.content;
    };

    const renderMessageContent = (msg: Message, isSent: boolean) => {
        const mediaUri = getMediaUri(msg);

        switch (msg.type) {
            case "image":
                if (!mediaUri) return null;

                return (
                    <TouchableOpacity
                        onPress={() =>
                            setFullscreenMedia({
                                uri: mediaUri,
                                type: "image",
                            })
                        }
                        activeOpacity={0.8}
                    >
                        <Image
                            source={{ uri: mediaUri }}
                            style={styles.messageImage}
                            contentFit="cover"
                        />
                        <Text
                            style={
                                isSent ? styles.sentTimeText : styles.timeText
                            }
                        >
                            {formatTime(msg.createdAt)}
                        </Text>
                    </TouchableOpacity>
                );

            case "video":
                if (!mediaUri) return null;

                return (
                    <TouchableOpacity
                        onPress={() =>
                            setFullscreenMedia({
                                uri: mediaUri,
                                type: "video",
                            })
                        }
                        activeOpacity={0.8}
                    >
                        <View style={styles.videoContainer}>
                            <Image
                                source={{ uri: mediaUri }}
                                style={styles.messageImage}
                                contentFit="cover"
                            />
                            <View style={styles.videoPlayIcon}>
                                <FontAwesome
                                    name="play-circle"
                                    size={48}
                                    color="white"
                                />
                            </View>
                        </View>
                        <Text
                            style={
                                isSent ? styles.sentTimeText : styles.timeText
                            }
                        >
                            {formatTime(msg.createdAt)}
                        </Text>
                    </TouchableOpacity>
                );

            default:
                return (
                    <>
                        <Text
                            style={
                                isSent ? styles.sentText : styles.receivedText
                            }
                        >
                            {msg.content}
                        </Text>
                        <Text
                            style={
                                isSent ? styles.sentTimeText : styles.timeText
                            }
                        >
                            {formatTime(msg.createdAt)}
                        </Text>
                    </>
                );
        }
    };

    const FullscreenMediaModal = () => {
        if (!fullscreenMedia) return null;

        const videoPlayer =
            fullscreenMedia.type === "video"
                ? useVideoPlayer(fullscreenMedia.uri, (player) => {
                      player.loop = false;
                      player.play();
                  })
                : null;

        return (
            <Modal
                visible={!!fullscreenMedia}
                transparent={false}
                animationType="fade"
                onRequestClose={() => setFullscreenMedia(null)}
            >
                <View style={styles.fullscreenContainer}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setFullscreenMedia(null)}
                    >
                        <MaterialIcons name="close" size={32} color="white" />
                    </TouchableOpacity>

                    {fullscreenMedia.type === "image" ? (
                        <Image
                            source={{ uri: fullscreenMedia.uri }}
                            style={styles.fullscreenMedia}
                            contentFit="contain"
                        />
                    ) : videoPlayer ? (
                        <VideoView
                            player={videoPlayer}
                            style={styles.fullscreenMedia}
                            fullscreenOptions={{ enable: true }}
                        />
                    ) : null}
                </View>
            </Modal>
        );
    };

    if (showCamera) {
        return (
            <Modal visible={showCamera} animationType="slide">
                <ChatCamera
                    onPhotoTaken={handlePhotoTaken}
                    onVideoRecorded={handleVideoRecorded}
                    onClose={() => setShowCamera(false)}
                />
            </Modal>
        );
    }

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
                                        <View
                                            style={[
                                                styles.receivedBubble,
                                                msg.type !== "text" &&
                                                    styles.mediaBubble,
                                            ]}
                                        >
                                            {renderMessageContent(msg, isSent)}
                                        </View>
                                    </View>
                                ) : (
                                    <View style={styles.sentMessageRow}>
                                        <View
                                            style={[
                                                styles.sentBubble,
                                                msg.type !== "text" &&
                                                    styles.mediaBubble,
                                            ]}
                                        >
                                            {renderMessageContent(msg, isSent)}
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
                <TouchableOpacity
                    style={styles.plusButton}
                    onPress={() => setShowCamera(true)}
                >
                    <FontAwesome name="camera" size={24} color="#007AFF" />
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

            <FullscreenMediaModal />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f0f0f0",
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
    mediaBubble: {
        padding: 4,
        maxWidth: MESSAGE_IMAGE_WIDTH + 8,
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
    messageImage: {
        width: MESSAGE_IMAGE_WIDTH,
        height: MESSAGE_IMAGE_HEIGHT,
        borderRadius: 12,
    },
    videoContainer: {
        position: "relative",
    },
    videoPlayIcon: {
        position: "absolute",
        top: "50%",
        left: "50%",
        marginTop: -24,
        marginLeft: -24,
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
    fullscreenContainer: {
        flex: 1,
        backgroundColor: "black",
        justifyContent: "center",
        alignItems: "center",
    },
    fullscreenMedia: {
        width: "100%",
        height: "100%",
    },
    closeButton: {
        position: "absolute",
        top: 50,
        right: 20,
        zIndex: 10,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        borderRadius: 20,
        padding: 8,
    },
    cameraCancelButton: {
        position: "absolute",
        top: 50,
        left: 20,
        zIndex: 10,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        borderRadius: 20,
        padding: 8,
    },
});

export default ChatScreen;
