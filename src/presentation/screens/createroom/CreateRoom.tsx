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

export const CreateRoom = () => {
    const navigation = useNavigation<any>();
    const [roomName, setRoomName] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState<boolean>(false);

    const handleCreateRoom = async () => {
        if (!roomName.trim()) {
            Alert.alert("Erro", "Por favor, insira o nome da sala");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Erro", "As senhas não coincidem");
            return;
        }

        if (password.length < 8) {
            Alert.alert("Erro", "A senha deve ter pelo menos 8 caracteres");
            return;
        }

        setLoading(true);
        try {
            const createRoomUseCase =
                RoomServiceFactory.makeCreateRoomUseCase();
            const room = await createRoomUseCase.execute({
                name: roomName,
                password: password,
            });

            Alert.alert(
                "Sucesso!",
                `Sala criada com sucesso!\nCódigo: ${room.code}`,
                [
                    {
                        text: "OK",
                        onPress: () => navigation.goBack(),
                    },
                ]
            );
        } catch (error: any) {
            Alert.alert("Erro", error.message || "Falha ao criar sala");
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
                <Text style={styles.header}>Nova Sala</Text>

                <Text style={{ marginBottom: 16 }}>
                    Crie uma sala de localização com nome e senha para
                    compartilhar com seus amigos ou familiares!
                </Text>

                <Text style={styles.labelText}>Nome</Text>
                <TextInput
                    onChangeText={(roomName) => setRoomName(roomName)}
                    placeholder="Nome da sala"
                    style={styles.input}
                    value={roomName}
                />

                <Text style={styles.labelText}>Senha</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        onChangeText={(password) => setPassword(password)}
                        placeholder="Crie uma senha"
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

                <Text style={styles.labelText}>Confirme a senha</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        onChangeText={(confirmPassword) =>
                            setConfirmPassword(confirmPassword)
                        }
                        placeholder="Confirme a senha"
                        style={styles.inputWithIcon}
                        value={confirmPassword}
                        secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity
                        onPress={() => setShowConfirmPassword((prev) => !prev)}
                    >
                        <Ionicons
                            name={showConfirmPassword ? "eye-off" : "eye"}
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
                    onPress={handleCreateRoom}
                    disabled={loading}
                >
                    <Text style={styles.saveButtonText}>
                        {loading ? "Criando..." : "Salvar"}
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
