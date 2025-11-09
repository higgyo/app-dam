import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Alert,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { RoomServiceFactory } from "../../../infrastructure/factories/RoomServiceFactory";
import { useNavigation } from "@react-navigation/native";

export const EnterRoom = () => {
    const navigation = useNavigation<any>();
    const [roomCode, setRoomCode] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const [showPassword, setShowPassword] = useState<boolean>(false);

    const handleEnterRoom = async () => {
        if (!roomCode.trim()) {
            Alert.alert("Erro", "Por favor, insira o código da sala");
            return;
        }

        if (!password.trim()) {
            Alert.alert("Erro", "Por favor, insira a senha");
            return;
        }

        setLoading(true);
        try {
            const enterRoomUseCase = RoomServiceFactory.makeEnterRoomUseCase();
            const room = await enterRoomUseCase.execute({
                code: roomCode,
                password: password,
            });

            Alert.alert("Sucesso!", `Você entrou na sala: ${room.name}`, [
                {
                    text: "OK",
                    onPress: () => navigation.goBack(),
                },
            ]);
        } catch (error: any) {
            Alert.alert("Erro", error.message || "Falha ao entrar na sala");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <View style={styles.contentContainer}>
                <Text style={styles.header}>Entrar em uma Sala</Text>

                <Text style={{ marginBottom: 16 }}>
                    Nessa tela você vai conseguir entrar em uma sala de
                    localizações! Basta inserir o código da sala gerado no
                    momento da criação e sua senha.
                </Text>

                <Text style={styles.labelText}>Código da Sala</Text>
                <TextInput
                    onChangeText={(roomCode) => setRoomCode(roomCode)}
                    placeholder="Código da sala"
                    style={styles.input}
                    value={roomCode}
                />

                <Text style={styles.labelText}>Senha</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        onChangeText={(password) => setPassword(password)}
                        placeholder="********"
                        style={styles.inputWithIcon}
                        value={password}
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                        onPress={() => setShowPassword((prev) => !prev)}
                    >
                        <Ionicons
                            name={showPassword ? "eye-off" : "eye"}
                            size={24}
                            color="gray"
                        />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[
                        styles.saveButton,
                        loading && styles.saveButtonDisabled,
                    ]}
                    onPress={handleEnterRoom}
                    disabled={loading}
                >
                    <Text style={styles.saveButtonText}>
                        {loading ? "Entrando..." : "Entrar"}
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    contentContainer: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "flex-start",
        paddingHorizontal: 24,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f0f0f0",
        borderRadius: 8,
        marginBottom: 8,
        marginTop: 8,
        paddingHorizontal: 16,
        width: "100%",
    },
    inputWithIcon: {
        flex: 1,
        height: 50,
    },
    input: {
        height: 50,
        backgroundColor: "#f0f0f0",
        borderRadius: 8,
        marginBottom: 8,
        marginTop: 8,
        paddingHorizontal: 16,
        width: "100%",
    },
    saveButton: {
        backgroundColor: "#3AC0A0",
        borderRadius: 8,
        marginTop: 16,
        padding: 16,
        width: "100%",
    },
    saveButtonDisabled: {
        backgroundColor: "#A0D9CC",
        opacity: 0.7,
    },
    saveButtonText: {
        color: "#fff",
        textAlign: "center",
    },
    header: {
        alignSelf: "flex-start",
        fontWeight: "bold",
        fontSize: 24,
        marginBottom: 8,
        marginTop: 8,
    },
    labelText: {
        fontSize: 16,
        fontWeight: "bold",
    },
});
