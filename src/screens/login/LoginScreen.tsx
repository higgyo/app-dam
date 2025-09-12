import React from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import AntDesign from '@expo/vector-icons/AntDesign';

export function LoginScreen() {
    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"} 
            style={styles.container}
        >
            <View style={{ height: "30%" }}></View>
            <View style={styles.contentContainer}>
                <Text style={styles.headline}>Bem-Vindo!</Text>

                <TextInput 
                    style={styles.input}
                />

                <TextInput 
                    style={styles.input}
                />

                <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>

                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>

                <View style={styles.signUpContainer}>
                    <Text>Não é um membro?</Text>
                    <Text style={styles.signUpText}>Cadastre-se agora!</Text>
                </View>

                <View style={styles.divider} />

                <Text>Ou continue com</Text>

                <View style={styles.socialMediaContainer}>
                    <AntDesign.Button backgroundColor="#ED3241" name="google" size={24} color="white" style={{ marginRight: 0 }} />
                    <AntDesign.Button backgroundColor="#1877F2" name="facebook-square" size={24} color="white" />
                </View>
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
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        marginTop: 16
    },
    forgotPasswordText: {
        marginTop: 10,
    },
    button: {
        width: '100%',
        height: 50,
        backgroundColor: '#4e9af1',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    signUpContainer: {
        flexDirection: 'row',
        marginTop: 20,
    },
    signUpText: {
        marginLeft: 5,
        color: '#4e9af1',
        fontWeight: 'bold',
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: '#ccc',
        marginVertical: 20,
    },
    socialMediaContainer: {
        flexDirection: 'row',
        justifyContent: "center",
        alignItems: "center"
    },
    buttonGoogle: {
        backgroundColor: "ED3241",
    },
    headline: {
        fontSize: 28,
        fontWeight: "bold"
    }
});
