import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';

export const EnterRoom = () => {
    const [roomCode, setRoomCode] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const [showPassword, setShowPassword] = useState<boolean>(false);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <View style={styles.contentContainer}>
                <Text style={styles.header}>Entrar em uma Sala</Text>

                <Text style={{ marginBottom: 16 }}>
                    Nessa tela você vai conseguir entrar em uma sala de localizações! Basta inserir o código da sala gerado no momento da criação e sua senha.
                </Text>

                <Text style={styles.labelText}>Código da Sala</Text>
                <TextInput
                    onChangeText={roomCode => setRoomCode(roomCode)}
                    placeholder="Código da sala"
                    style={styles.input}
                    value={roomCode}
                />

                <Text style={styles.labelText}>Senha</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        onChangeText={password => setPassword(password)}
                        placeholder="********"
                        style={styles.inputWithIcon}
                        value={password}
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(prev => !prev)}>
                        <Ionicons
                            name={showPassword ? "eye-off" : "eye"}
                            size={24}
                            color="gray"
                        />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.saveButton}>
                    <Text style={styles.saveButtonText}>Entrar</Text>
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
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        marginBottom: 8,
        marginTop: 8,
        paddingHorizontal: 16,
        width: '100%',
    },
    inputWithIcon: {
        flex: 1,
        height: 50,
    },
    input: {
        height: 50,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        marginBottom: 8,
        marginTop: 8,
        paddingHorizontal: 16,
        width: '100%',
    },
    saveButton: {
        backgroundColor: "#3AC0A0",
        borderRadius: 8,
        marginTop: 16,
        padding: 16,
        width: "100%",
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
