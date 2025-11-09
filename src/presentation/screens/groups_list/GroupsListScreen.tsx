import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
} from "react-native";
import { SearchInput } from "../../components/SearchInput";
import { ChatBoard } from "../chat_list/components/ChatBoard";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { RoomServiceFactory } from "../../../infrastructure/factories/RoomServiceFactory";
import Room from "../../../domain/entities/Room";

export function GroupsListScreen() {
    const navigate = useNavigation<any>();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>("");

    useEffect(() => {
        loadRooms();
    }, []);

    const loadRooms = async () => {
        try {
            const listRoomsUseCase = RoomServiceFactory.makeListRoomsUseCase();
            const roomsList = await listRoomsUseCase.execute();
            setRooms(roomsList);
        } catch (error) {
            console.error("Erro ao carregar salas:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredRooms = rooms.filter((room) =>
        room.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#3AC0A0" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Grupos de Localização</Text>
            <SearchInput
                style={styles.searchInput}
                placeholder="Buscar sala"
                onChangeText={setSearchQuery}
                value={searchQuery}
            />
            {filteredRooms.length === 0 ? (
                <View style={styles.centerContent}>
                    <Text style={styles.emptyText}>
                        {searchQuery
                            ? "Nenhuma sala encontrada"
                            : "Você ainda não está em nenhuma sala"}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredRooms}
                    contentContainerStyle={styles.listContainer}
                    keyExtractor={(item) =>
                        item.id || item.code || Math.random().toString()
                    }
                    renderItem={({ item }) => (
                        <ChatBoard
                            title={item.name}
                            lastMessage={`Código: ${item.code}`}
                            unreadedMessages={0}
                            onClick={() => {
                                navigate.navigate("Conversation", {
                                    roomId: item.id,
                                    roomName: item.name,
                                });
                            }}
                        />
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        flex: 1,
    },
    centerContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
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
    emptyText: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
    },
});
