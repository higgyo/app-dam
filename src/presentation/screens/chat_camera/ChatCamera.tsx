import {
    CameraView,
    CameraType,
    useCameraPermissions,
    CameraMode,
} from "expo-camera";
import { useRef, useState } from "react";
import { Button, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

export const ChatCamera = () => {
    const [facing, setFacing] = useState<CameraType>("back");
    const [permission, requestPermission] = useCameraPermissions();
    const [mode, setMode] = useState<CameraMode>("picture");
    const [photo, setPhoto] = useState<string | null>(null);
    const [recording, setRecording] = useState<boolean>(false);

    const cameraRef = useRef<CameraView>(null);

    const toggleCameraFacing = () => {
        setFacing((prev) => (prev === "back" ? "front" : "back"));
    };

    const toggleCameraMode = () => {
        setMode((prev) => (prev === "picture" ? "video" : "picture"));
    };

    const takePicture = async () => {
        if (cameraRef.current) {
            const picture = await cameraRef.current.takePictureAsync({
                exif: true,
                base64: false,
                skipProcessing: false,
            });
            setPhoto(picture.uri);
        }
    };

    const recordVideo = async () => {
        if (recording) {
            setRecording(false);
            cameraRef.current?.stopRecording();
            return;
        }
        setRecording(true);
        const video = await cameraRef.current?.recordAsync();
        console.log({ video });
    };

    if (!permission) return <View />;

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>
                    Precisamos de permissão para mostrar a câmera!
                </Text>
                <Button
                    onPress={requestPermission}
                    title="garantir permissão"
                />
            </View>
        );
    }

    const renderPicture = (uri: string) => {
        return (
            <View>
                <Image
                    source={{ uri }}
                    contentFit="contain"
                    style={{ width: 300, aspectRatio: 1 }}
                />
                <Button
                    onPress={() => setPhoto(null)}
                    title="Take another picture"
                />
            </View>
        );
    };

    const renderCamera = () => {
        return (
            <View style={styles.cameraContainer}>
                <CameraView
                    style={styles.camera}
                    ref={cameraRef}
                    mode={mode}
                    facing={facing}
                    mute={false}
                    responsiveOrientationWhenOrientationLocked
                />
                <View style={styles.shutterContainer}>
                    <Pressable onPress={toggleCameraMode}>
                        {mode === "picture" ? (
                            <AntDesign name="picture" size={32} color="white" />
                        ) : (
                            <Feather name="video" size={32} color="white" />
                        )}
                    </Pressable>
                    <Pressable
                        onPress={mode === "picture" ? takePicture : recordVideo}
                    >
                        {({ pressed }) => (
                            <View
                                style={[
                                    styles.shutterBtn,
                                    {
                                        opacity: pressed ? 0.5 : 1,
                                    },
                                ]}
                            >
                                <View
                                    style={[
                                        styles.shutterBtnInner,
                                        {
                                            backgroundColor:
                                                mode === "picture"
                                                    ? "white"
                                                    : "red",
                                        },
                                    ]}
                                />
                            </View>
                        )}
                    </Pressable>
                    <Pressable onPress={toggleCameraFacing}>
                        <FontAwesome6
                            name="rotate-left"
                            size={32}
                            color="white"
                        />
                    </Pressable>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {photo ? renderPicture(photo) : renderCamera()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
    message: {
        textAlign: "center",
        paddingBottom: 10,
    },
    cameraContainer: StyleSheet.absoluteFillObject,
    camera: StyleSheet.absoluteFillObject,
    shutterContainer: {
        position: "absolute",
        bottom: 44,
        left: 0,
        width: "100%",
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 30,
    },
    shutterBtn: {
        backgroundColor: "transparent",
        borderWidth: 5,
        borderColor: "white",
        width: 85,
        height: 85,
        borderRadius: 45,
        alignItems: "center",
        justifyContent: "center",
    },
    shutterBtnInner: {
        width: 70,
        height: 70,
        borderRadius: 50,
    },
});
