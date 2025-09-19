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
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";

type RegisterScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "Register"
>;

export function RegisterScreen() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");

    const navigation = useNavigation<RegisterScreenNavigationProp>();

    const handleRedirect = () => {
        navigation.navigate("Login");
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <View
                style={{
                    backgroundColor: "#4e9af1",
                    height: "30%",
                    borderBottomLeftRadius: 36,
                    borderBottomRightRadius: 36,
                }}
            ></View>
            <View style={styles.contentContainer}>
                <Text style={styles.headline}>Cadastro</Text>

                <TextInput
                    placeholder="Exemplo: Lázaro Eduardo"
                    style={styles.input}
                />

                <TextInput
                    placeholder="example@domain.com.br"
                    style={styles.input}
                />

                <TextInput placeholder="********" style={styles.input} />

                <TextInput placeholder="********" style={styles.input} />

                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Cadastrar-se</Text>
                </TouchableOpacity>

                <View style={styles.signUpContainer}>
                    <Text>Já é um membro?</Text>
                    <Text onPress={handleRedirect} style={styles.signUpText}>
                        Faça login!
                    </Text>
                </View>

                <View style={styles.divider} />

                <Text>Ou cadastre-se com</Text>

                <View style={styles.socialMediaContainer}>
                    <FontAwesome
                        backgroundColor="#ED3241"
                        name="google"
                        size={24}
                        color="white"
                        style={styles.buttonGoogle}
                    />
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    contentContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    input: {
        width: "100%",
        height: 50,
        backgroundColor: "#f0f0f0",
        borderRadius: 8,
        marginTop: 16,
        paddingHorizontal: 16,
    },
    forgotPasswordText: {
        marginTop: 10,
    },
    button: {
        width: "100%",
        height: 50,
        backgroundColor: "#4e9af1",
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20,
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
    },
    signUpContainer: {
        flexDirection: "row",
        marginTop: 20,
    },
    signUpText: {
        marginLeft: 5,
        color: "#4e9af1",
        fontWeight: "bold",
    },
    divider: {
        width: "100%",
        height: 1,
        backgroundColor: "#ccc",
        marginVertical: 20,
    },
    socialMediaContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    buttonGoogle: {
        backgroundColor: "#ED3241",
        borderRadius: 100,
        width: 48,
        height: 48,
        textAlign: "center",
        verticalAlign: "middle",
        marginTop: 8,
    },
    headline: {
        fontSize: 28,
        fontWeight: "bold",
    },
});
