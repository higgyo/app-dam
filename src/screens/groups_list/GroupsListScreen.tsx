import { View, Text, StyleSheet, FlatList } from "react-native";
import { SearchInput } from "../../components/SearchInput";
import { ChatBoard } from "../chat_list/components/ChatBoard";

const mockChats = [
    {
        title: "Grupo de Localização de Família",
        lastMessage:
            "Guilherme aproveita que você tai perto do supermercado e traz refrigerante!",
        unreadedMessages: 9,
    },
];

export function GroupsListScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Grupos de Localização</Text>
            <SearchInput style={styles.searchInput} placeholder="Search" />
            <FlatList
                data={mockChats}
                pagingEnabled={true}
                renderItem={({ item, index, separators }) => (
                    <ChatBoard
                        key={index}
                        title={item.title}
                        lastMessage={item.lastMessage}
                        unreadedMessages={item.unreadedMessages}
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
});
