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
import { useAuthContext } from "../../contexts/AuthContext";

type RegisterScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "Register"
>;

export function RegisterScreen() {
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");

    const navigation = useNavigation<RegisterScreenNavigationProp>();
    const auth = useAuthContext();

    const handleRedirect = () => {
        navigation.navigate("Login");
    };

    const handleRegister = async () => {
        try {
            setError("");
            setSuccess("");

            if (!name || !email || !password) {
                setError("Preencha todos os campos");
                return;
            }

            if (password !== confirmPassword) {
                setError("As senhas não coincidem");
                return;
            }

            await auth.register({
                name,
                email,
                password,
                latitude: 0,
                longitude: 0,
            });

            setSuccess("Cadastro realizado com sucesso!");
            setTimeout(() => {
                navigation.navigate("Login");
            }, 1500);
        } catch (err: any) {
            setError(err.message || "Erro ao fazer cadastro");
        }
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
                    value={name}
                    onChangeText={setName}
                />

                <TextInput
                    placeholder="example@domain.com.br"
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <TextInput 
                    placeholder="********" 
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TextInput 
                    placeholder="********" 
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                />

                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                {success ? <Text style={styles.successText}>{success}</Text> : null}

                <TouchableOpacity style={styles.button} onPress={handleRegister}>
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
    errorText: {
        color: "red",
        marginTop: 10,
        fontSize: 14,
    },
    successText: {
        color: "green",
        marginTop: 10,
        fontSize: 14,
    },
});
