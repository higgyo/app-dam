import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export const CreateRoom = () => {
    const [roomName, setRoomName] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        
        >
            <View style={styles.contentContainer}>
                <Text>Nova Sala</Text>

                <Text>
                    Crie uma sala de localização com nome e senha para compartilhar com seus amigos ou familiares!
                </Text>

                <TextInput
                    onChangeText={roomName => setRoomName(roomName)}
                    placeholder="Nome da senha"
                    style={styles.input}
                    value={roomName}
                />

                <TextInput
                    onChangeText={password => setPassword(password)}
                    placeholder="Crie uma senha"
                    style={styles.input}
                    value={password}
                />

                <TextInput
                    onChangeText={confirmPassword => setConfirmPassword(confirmPassword)}
                    placeholder="Confirme a senha"
                    style={styles.input}
                    value={confirmPassword}
                />

                <TouchableOpacity>
                    <Text>Salvar</Text>
                </TouchableOpacity>
            </View>

        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff"
    },
    contentContainer: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        paddingHorizontal: 20
    },
    input: {
        height: 50,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        marginTop: 16,
        paddingHorizontal: 16,
        width: '100%',
    },
    saveButton: {
        backgroundColor: "#3AC0A0",
        borderRadius: 36,
        width: "100%"
    }
});