import { View, Text, StyleSheet, FlatList } from "react-native";
import { SearchInput } from "../../components/SearchInput";
import { ChatBoard } from "./components/ChatBoard";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import Chat from "../../../domain/entities/Chat";
import { ChatRepository } from "../../../infrastructure/repositories/chat-repository";
import { useAuthContext } from "../../contexts/AuthContext";

export function ChatListScreen() {
    const navigation = useNavigation();
    const { currentUser } = useAuthContext();

    const [chats, setChats] = useState<Chat[]>([]);

    const chatRepository = new ChatRepository({} as any);

    useEffect(() => {
        if (!currentUser) return;

        const loadChats = async () => {
            const list = await chatRepository.getChatsList(currentUser.id);
            setChats(list);
        };

        loadChats();
    }, [currentUser]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Chats</Text>

            <SearchInput style={styles.searchInput} placeholder="Search" />

            <FlatList<Chat>
                data={chats}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item }) => (
                    <ChatBoard
                        title={item.name}
                        lastMessage={"Última mensagem mock..."}
                        unreadedMessages={0}
                        onClick={() =>
                            navigation.navigate("Conversation" as never)
                        }
                    />
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16 },
    title: {
        fontSize: 16,
        fontWeight: "700",
        textAlign: "center",
        paddingBottom: 16,
    },
    searchInput: { marginTop: 16 },
    listContainer: { paddingVertical: 8 },
});
