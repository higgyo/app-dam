import { View, Text, TextInput, StyleSheet, FlatList } from "react-native";
import { SearchInput } from "../../components/SearchInput";
import { ChatBoard } from "./components/ChatBoard";
import { useNavigation } from "@react-navigation/native";

const mockChats = [
    {
        title: "Grupo de Localização de Família",
        lastMessage:
            "Guilherme aproveita que você tai perto do supermercado e traz refrigerante!",
        unreadedMessages: 9,
    },
    {
        title: "Mais que amigos, Friends",
        lastMessage: "Vamos almoçar aqui perto?",
        unreadedMessages: 0,
    },
    {
        title: "Namorada <3",
        lastMessage: "Onde você tá indo?",
        unreadedMessages: 2,
    },
];

export function ChatListScreen() {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Chats</Text>
            <SearchInput style={styles.searchInput} placeholder="Search" />
            <FlatList
                data={mockChats}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item, index, separators }) => (
                    <ChatBoard
                        key={index}
                        title={item.title}
                        lastMessage={item.lastMessage}
                        unreadedMessages={item.unreadedMessages}
                        onClick={() => {
                            navigation.navigate("Conversation");
                        }}
                    />
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: "700",
        textAlign: "center",
        paddingBottom: 16,
    },
    searchInput: {
        marginTop: 16,
    },
    listContainer: {
        paddingVertical: 8,
    },
});
