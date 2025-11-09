import {
    CameraView,
    CameraType,
    useCameraPermissions,
    CameraMode,
    useMicrophonePermissions,
} from "expo-camera";
import { useRef, useState, useEffect } from "react";
import { Button, Dimensions, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { VideoView, useVideoPlayer } from "expo-video";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

interface ChatCameraProps {
    onPhotoTaken?: (uri: string) => void;
    onVideoRecorded?: (uri: string) => void;
}

export const ChatCamera = ({ onPhotoTaken, onVideoRecorded }: ChatCameraProps = {}) => {
    const [facing, setFacing] = useState<CameraType>("back");
    const [permission, requestPermission] = useCameraPermissions();
    const [micPermission, requestMicPermission] = useMicrophonePermissions();
    const [mode, setMode] = useState<CameraMode>("picture");
    const [photo, setPhoto] = useState<string | null>(null);
    const [video, setVideo] = useState<{ uri: string } | null>(null);
    const [recording, setRecording] = useState<boolean>(false);

    const cameraRef = useRef<CameraView>(null);

    const toggleCameraFacing = () => {
        setFacing((prev) => (prev === "back" ? "front" : "back"));
    };

    const toggleCameraMode = () => {
        setPhoto(null);
        setVideo(null);
        setRecording(false);
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

    const recordVideo = () => {
        if (recording) {
            setRecording(false);
            cameraRef.current?.stopRecording();
            return;
        }

        setRecording(true);

        cameraRef.current?.recordAsync().then((videoResult) => {
            if (videoResult) {
                setVideo({ uri: videoResult.uri });
            }
            setRecording(false);
        }).catch((error) => {
            console.error("Erro ao gravar vídeo:", error);
            setRecording(false);
        });
    };

    const handleSendPhoto = () => {
        if (photo && onPhotoTaken) {
            onPhotoTaken(photo);
        }
    };

    const handleSendVideo = () => {
        if (video && onVideoRecorded) {
            onVideoRecorded(video.uri);
        }
    };

    if (!permission || !micPermission) return <View />;

    if (!permission.granted || !micPermission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>
                    Para conseguir usar a câmera e gravar vídeos com áudio, precisamos da sua permissão! Clique no botão abaixo para ceder as permissões.
                </Text>
                <Button 
                    onPress={() => {
                        requestPermission();
                        requestMicPermission();
                    }} 
                    title="Ceder permissões" 
                />
            </View>
        );
    }

    const videoPlayer = video ? useVideoPlayer(video.uri, (player) => {
        player.loop = true;
        player.play();
    }) : null;

    const renderPicture = (uri: string) => {
        return (
            <View style={styles.pictureContainer}>
                <Image
                    source={{ uri }}
                    style={styles.fullscreenImage}
                    contentFit="cover"
                />
                <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={() => setPhoto(null)} style={styles.button}>
                        <Feather name="camera" size={20} color="#fff" style={styles.buttonIcon} />
                        <Text style={styles.buttonText}>Tirar outra foto</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleSendPhoto} style={styles.button}>
                        <AntDesign name="upload" size={20} color="#fff" style={styles.buttonIcon} />
                        <Text style={styles.buttonText}>Enviar foto</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderVideo = () => {
        return (
            <View style={styles.pictureContainer}>
                {videoPlayer && (
                    <VideoView
                        player={videoPlayer}
                        style={styles.fullscreenImage}
                        allowsFullscreen
                        allowsPictureInPicture
                    />
                )}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={() => setVideo(null)} style={styles.button}>
                        <Feather name="video" size={20} color="#fff" style={styles.buttonIcon} />
                        <Text style={styles.buttonText}>Gravar novo vídeo</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleSendVideo} style={styles.button}>
                        <AntDesign name="upload" size={20} color="#fff" style={styles.buttonIcon} />
                        <Text style={styles.buttonText}>Enviar vídeo</Text>
                    </TouchableOpacity>
                </View>
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

                {recording && (
                    <View style={styles.recordingIndicatorContainer}>
                        <View style={styles.recordingDot} />
                        <Text style={styles.recordingText}>Gravando...</Text>
                    </View>
                )}

                <View style={styles.shutterContainer}>
                    <Pressable onPress={toggleCameraMode}>
                        {mode === "picture" ? (
                            <AntDesign name="picture" size={32} color="white" />
                        ) : (
                            <Feather name="video" size={32} color={recording ? "red" : "white"} />
                        )}
                    </Pressable>

                    <Pressable onPress={mode === "picture" ? takePicture : recordVideo}>
                        {({ pressed }) => (
                            <View
                                style={[
                                    styles.shutterBtn,
                                    { opacity: pressed ? 0.5 : 1 },
                                ]}
                            >
                                <View
                                    style={[
                                        styles.shutterBtnInner,
                                        {
                                            backgroundColor:
                                                mode === "picture"
                                                    ? "white"
                                                    : recording
                                                    ? "red"
                                                    : "white",
                                        },
                                    ]}
                                />
                            </View>
                        )}
                    </Pressable>

                    <Pressable onPress={toggleCameraFacing}>
                        <FontAwesome6 name="rotate-left" size={32} color="white" />
                    </Pressable>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {photo ? renderPicture(photo) : video ? renderVideo() : renderCamera()}
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
        padding: 10,
        fontSize: 16,
        color: "#333",
    },

    pictureContainer: {
        flex: 1,
        backgroundColor: "black",
        width: "100%",
        height: "100%",
    },

    fullscreenImage: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        height: "100%",
    },

    buttonContainer: {
        position: "absolute",
        bottom: 60,
        left: 0,
        right: 0,
        alignItems: "center",
        justifyContent: "center",
    },

    button: {
        backgroundColor: "#3AC0A0",
        borderRadius: 4,
        marginTop: 10,
        paddingVertical: 10,
        width: Dimensions.get("screen").width * 0.9,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
    },

    buttonText: {
        color: "#fff",
        textTransform: "uppercase",
        textAlign: "center",
    },

    buttonIcon: {
        marginRight: 8,
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

    recordingIndicatorContainer: {
        position: "absolute",
        top: 60,
        alignSelf: "center",
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },

    recordingDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "red",
        marginRight: 8,
    },

    recordingText: {
        color: "white",
        fontWeight: "600",
    },
});
