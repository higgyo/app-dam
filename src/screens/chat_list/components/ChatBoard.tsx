import { View, Text, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

interface ChatBoardProps {
    title: string;
    lastMessage: string;
    unreadedMessages: number;
    onClick: () => void;
}

export function ChatBoard({
    title,
    lastMessage,
    unreadedMessages,
    onClick,
}: ChatBoardProps) {
    return (
        <View style={styles.container} onTouchEnd={onClick}>
            <View style={styles.chatImageContainer}>
                <FontAwesome name="user" size={24} color="#B4DBFF" />
            </View>
            <View style={styles.textContainer}>
                <Text
                    style={styles.chatTitle}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {title}
                </Text>
                <Text
                    style={styles.lastMessage}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {lastMessage}
                </Text>
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
        flexGrow: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        padding: 8,
    },
    chatImageContainer: {
        backgroundColor: "#EAF2FF",
        padding: 8,
        borderRadius: 20,
    },
    textContainer: {
        flex: 1,
        minWidth: 0,
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
        flexShrink: 0,
    },
    unreadedMessagesText: {
        color: "white",
        fontWeight: "600",
        fontSize: 12,
    },
});
