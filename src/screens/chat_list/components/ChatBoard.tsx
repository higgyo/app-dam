import { View, Text, Image, StyleSheet } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

interface ChatBoardProps {
    title: string;
    lastMessage: string;
    unreadedMessages: number;
}

export function ChatBoard({
    title,
    lastMessage,
    unreadedMessages,
}: ChatBoardProps) {
    return (
        <View style={styles.container}>
            <View style={styles.chatImageContainer}>
                <FontAwesome name="user" size={24} color="#B4DBFF" />
            </View>
            <View>
                <Text style={styles.chatTitle}>{title}</Text>
                <Text style={styles.lastMessage}>{lastMessage}</Text>
            </View>
            {unreadedMessages > 0 && (
                <View style={styles.unreadedMessagesBalloon}>
                    <Text style={styles.unreadedMessagesText}>
                        {unreadedMessages}
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    chatImageContainer: {
        backgroundColor: "#EAF2FF",
    },
    chatTitle: {
        fontWeight: "700",
        fontSize: 14,
    },
    lastMessage: {
        fontSize: 14,
        color: "gray",
    },
    unreadedMessagesBalloon: {
        paddingHorizontal: 6,
        paddingVertical: 1.5,
        borderRadius: 20,
        backgroundColor: "#006FFD",
        marginLeft: "auto",
    },
    unreadedMessagesText: {
        color: "white",
        fontWeight: "600",
        fontSize: 12,
    },
});
