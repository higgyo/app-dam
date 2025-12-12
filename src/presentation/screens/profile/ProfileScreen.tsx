import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Image,
    Platform,
    KeyboardAvoidingView,
    Alert,
    Linking,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuthContext } from "../../contexts/AuthContext";
import { supabase } from "../../../infrastructure/supabase";

export function ProfileScreen() {
    const [name, setName] = useState<string>("");
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    const auth = useAuthContext();

    const handlePickImage = async () => {
        try {
            const current = await ImagePicker.getMediaLibraryPermissionsAsync();

            if (!current.granted) {
                const requested = await ImagePicker.requestMediaLibraryPermissionsAsync();

                if (!requested.granted) {
                    if (requested.canAskAgain === false) {
                        Alert.alert(
                            "Permissão bloqueada",
                            "Você bloqueou o acesso às fotos. Ative em Configurações para escolher uma imagem.",
                            [
                                { text: "Cancelar", style: "cancel" },
                                { text: "Abrir Configurações", onPress: () => Linking.openSettings() },
                            ]
                        );
                        return;
                    }

                    Alert.alert(
                        "Permissão necessária",
                        "Permita o acesso às fotos para escolher a imagem de perfil."
                    );
                    return;
                }
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled) {
                setImageUri(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert("Erro", `Erro ao selecionar imagem: ${error}`);
        }
    };

    const handleSubmit = async () => {
        if (!auth.currentUser || isSaving) {
            console.log("Condição de retorno atingida");
            return;
        }

        setIsSaving(true);

        try {
            let avatarPath: string | null = null;

            const hasLocalImage = !!imageUri && !imageUri.startsWith("http");

            if (hasLocalImage) {
                const uri = imageUri as string;

                const extRaw = uri.split(".").pop()?.toLowerCase() ?? "jpg";

                const normalizedExtRaw = extRaw.split("?")[0];

                const contentType =
                    normalizedExtRaw === "jpg" || normalizedExtRaw === "jpeg"
                        ? "image/jpeg"
                        : normalizedExtRaw === "png"
                            ? "image/png"
                            : `image/${normalizedExtRaw}`;

                const fileName = `${auth.currentUser.id}_${Date.now()}.${normalizedExtRaw}`;

                const res = await fetch(uri);

                if (!res.ok) {
                    console.error("Erro no fetch:", res.status, res.statusText);
                    Alert.alert("Erro", "Não foi possível ler a imagem");
                    return;
                }

                const blob = await res.blob();

                const reader = new FileReader();
                const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
                    reader.onerror = reject;
                    reader.onload = () => {
                        if (reader.result instanceof ArrayBuffer) {
                            resolve(reader.result);
                        } else {
                            reject(new Error("Erro ao converter imagem"));
                        }
                    };
                    reader.readAsArrayBuffer(blob);
                });
                const { error: uploadError } = await supabase.storage
                    .from("app-dam")
                    .upload(fileName, arrayBuffer, {
                        contentType,
                        upsert: true,
                    });

                if (uploadError) {
                    Alert.alert("Erro", `Erro ao enviar imagem: ${uploadError.message}`);
                    return;
                }

                avatarPath = fileName;
            }

            const payload: any = { name };

            if (avatarPath) payload.avatar_url = avatarPath;

            const { error: profileError } = await supabase
                .from("profiles")
                .update(payload)
                .eq("user_id", auth.currentUser.id);

            if (profileError) {
                Alert.alert("Erro", `Erro ao salvar perfil: ${profileError.message}`);
                return;
            }

            Alert.alert("Sucesso", "Perfil atualizado com sucesso");
        } catch (error) {
            Alert.alert("Erro", `Erro inesperado: ${error}`);
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        if (auth.currentUser) {
            setName(auth.currentUser.name ?? "");
            setImageUri(auth.currentUser.avatar_url ?? null);
        }
    }, [auth.currentUser]);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <View style={styles.contentContainer}>
                <TouchableOpacity
                    style={styles.avatarContainer}
                    onPress={handlePickImage}
                >
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.avatar} />
                    ) : (
                        <Text style={styles.avatarPlaceholder}>+</Text>
                    )}
                </TouchableOpacity>

                <TextInput
                    placeholder="Seu nome"
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                />

                <TouchableOpacity
                    style={[
                        styles.button,
                        isSaving && { opacity: 0.6 },
                    ]}
                    onPress={handleSubmit}
                    disabled={isSaving}
                >
                    <Text style={styles.buttonText}>
                        {isSaving ? "Salvando..." : "Salvar"}
                    </Text>
                </TouchableOpacity>
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
    avatarContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    avatar: {
        width: "100%",
        height: "100%",
        borderRadius: 60,
    },
    avatarPlaceholder: {
        fontSize: 32,
        color: "#999",
    },
    input: {
        width: "100%",
        height: 50,
        backgroundColor: "#f0f0f0",
        borderRadius: 8,
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    button: {
        width: "100%",
        height: 50,
        backgroundColor: "#4e9af1",
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
    },
});