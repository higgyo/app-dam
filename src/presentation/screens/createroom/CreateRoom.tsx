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

export const CreateRoom = () => {
    const [roomName, setRoomName] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");

    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <View style={styles.contentContainer}>
                <Text style={styles.header}>Nova Sala</Text>

                <Text style={{ marginBottom: 16 }}>
                    Crie uma sala de localização com nome e senha para compartilhar com seus amigos ou familiares!
                </Text>

                <Text style={styles.labelText}>Nome</Text>
                <TextInput
                    onChangeText={roomName => setRoomName(roomName)}
                    placeholder="Nome da sala"
                    style={styles.input}
                    value={roomName}
                />

                <Text style={styles.labelText}>Senha</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        onChangeText={password => setPassword(password)}
                        placeholder="Crie uma senha"
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

                <Text style={styles.labelText}>Confirme a senha</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        onChangeText={confirmPassword => setConfirmPassword(confirmPassword)}
                        placeholder="Confirme a senha"
                        style={styles.inputWithIcon}
                        value={confirmPassword}
                        secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(prev => !prev)}>
                        <Ionicons
                            name={showConfirmPassword ? "eye-off" : "eye"}
                            size={24}
                            color="gray"
                        />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.saveButton}>
                    <Text style={styles.saveButtonText}>Salvar</Text>
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
