import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    StyleSheet,
} from "react-native";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const ChatScreen = () => {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Oi Nicolas, vamos almoçar aqui no Eri?",
            sender: "Higor",
            type: "received",
            time: "9:41",
        },
        {
            id: 2,
            text: "Você tá aqui perto mesmo...",
            sender: "Higor",
            type: "received",
            time: "9:41",
        },
        {
            id: 3,
            text: "Oi Higor!",
            sender: "Nicolas",
            type: "sent",
            time: "9:41",
        },
        {
            id: 4,
            text: "Acabando aqui eu vou =)",
            sender: "Nicolas",
            type: "sent",
            time: "9:41",
        },
        {
            id: 5,
            text: "Fechou!",
            sender: "Higor",
            type: "received",
            time: "9:41",
        },
    ]);

    const sendMessage = () => {
        if (message.trim()) {
            const newMessage = {
                id: messages.length + 1,
                text: message,
                sender: "Nicolas",
                type: "sent",
                time: "9:41",
            };
            setMessages([...messages, newMessage]);
            setMessage("");
        }
    };

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
                                    <Text style={styles.receivedText}>
                                        {msg.text}
                                    </Text>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.sentMessageRow}>
                                <View style={styles.sentBubble}>
                                    <Text style={styles.sentText}>
                                        {msg.text}
                                    </Text>
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f0f0f0",
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
});

export default ChatScreen;
