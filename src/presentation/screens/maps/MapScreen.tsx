import { StyleSheet, View, Image, Modal, Text, TouchableOpacity, ScrollView } from 'react-native';
import MapView, { Marker, Polygon } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthContext } from '../../contexts/AuthContext';
import { supabase } from '../../../infrastructure/supabase';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const googleApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

interface MapScreenProps {
    roomId: string;
    setShowMap: React.Dispatch<React.SetStateAction<boolean>>;
}

interface UserLocationInfo {
    user_id: string;
    last_latitude: number;
    last_longitude: number;
    location_updated_at: string;
    name: string;
    avatar_url?: string | null;
    avatar_signed_url?: string | null;
}

interface RouteInfo {
    distance: number;
    duration: number;
    origin: string;
    destination: string;
}

interface CustomLocation {
    coordinate: LatLng;
    name: string;
}

type LatLng = { latitude: number; longitude: number };

const fallbackCoordinate: LatLng = { latitude: -21.55, longitude: -45.43 };

const coordinateFromProfile = (profile: UserLocationInfo): LatLng => ({
    latitude: profile.last_latitude ? profile.last_latitude : fallbackCoordinate.latitude,
    longitude: profile.last_longitude ? profile.last_longitude : fallbackCoordinate.longitude,
});

const createCirclePolygon = (center: LatLng, radiusMeters: number, pointsCount: number = 32): LatLng[] => {
    const earthRadius = 6378137;
    const lat = (center.latitude * Math.PI) / 180;
    const lng = (center.longitude * Math.PI) / 180;

    const d = radiusMeters / earthRadius;

    const coords: LatLng[] = [];
    for (let i = 0; i < pointsCount; i++) {
        const bearing = (i * 2 * Math.PI) / pointsCount;

        const lat2 = Math.asin(
            Math.sin(lat) * Math.cos(d) + Math.cos(lat) * Math.sin(d) * Math.cos(bearing)
        );

        const lng2 =
            lng +
            Math.atan2(
                Math.sin(bearing) * Math.sin(d) * Math.cos(lat),
                Math.cos(d) - Math.sin(lat) * Math.sin(lat2)
            );

        coords.push({
            latitude: (lat2 * 180) / Math.PI,
            longitude: (lng2 * 180) / Math.PI,
        });
    }

    return coords;
};

export default function MapScreen({ roomId }: MapScreenProps) {
    const [profiles, setProfiles] = useState<UserLocationInfo[]>([]);
    const [region, setRegion] = useState<{
        latitude: number;
        longitude: number;
        latitudeDelta: number;
        longitudeDelta: number;
    } | null>(null);

    const [pontoClicado1, setPontoClicado1] = useState<UserLocationInfo | CustomLocation | null>(null);
    const [pontoClicado2, setPontoClicado2] = useState<UserLocationInfo | CustomLocation | null>(null);
    const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
    const [showRouteModal, setShowRouteModal] = useState(false);

    const auth = useAuthContext();

    const formatDate = (date: string | null) => {
        if (!date) return "";
        const [datePart, hourPart] = date.split("T");
        const [yyyy, mm, dd] = datePart.split("-");
        return `${dd}/${mm}/${yyyy} ${hourPart}`;
    };

    const formatDistance = (meters: number) => {
        if (!meters || isNaN(meters)) return "N/A";
        if (meters < 1000) {
            return `${Math.round(meters)} m`;
        }
        return `${(meters / 1000).toFixed(2)} km`;
    };

    const formatDuration = (minutes: number) => {
        if (!minutes || isNaN(minutes)) return "N/A";
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);

        if (hours > 0) {
            return `${hours}h ${mins}min`;
        }
        return `${mins} min`;
    };

    const isUserProfile = (point: UserLocationInfo | CustomLocation | null): point is UserLocationInfo => {
        return point !== null && 'user_id' in point;
    };

    const getPointCoordinate = (point: UserLocationInfo | CustomLocation): LatLng => {
        if (isUserProfile(point)) {
            return coordinateFromProfile(point);
        }
        return point.coordinate;
    };

    const getPointName = (point: UserLocationInfo | CustomLocation | null): string => {
        if (!point) return '';
        if (isUserProfile(point)) {
            return point.name;
        }
        return point.name;
    };

    const onClickUsuario = (profile: UserLocationInfo) => {
        if (!pontoClicado1) {
            setPontoClicado1(profile);
            setPontoClicado2(null);
            setRouteInfo(null);
            setShowRouteModal(false);
            return;
        }

        // Se clicar no mesmo usuário que já está selecionado, desseleciona
        if (isUserProfile(pontoClicado1) && pontoClicado1.user_id === profile.user_id) {
            setPontoClicado1(null);
            setPontoClicado2(null);
            setRouteInfo(null);
            setShowRouteModal(false);
            return;
        }

        if (!pontoClicado2) {
            setPontoClicado2(profile);
            return;
        }

        // Se já tem dois pontos, reinicia com o novo ponto
        setPontoClicado1(profile);
        setPontoClicado2(null);
        setRouteInfo(null);
        setShowRouteModal(false);
    };

    const onMapPress = (event: any) => {
        const coordinate = event.nativeEvent.coordinate;

        if (!coordinate) return;

        const customLocation: CustomLocation = {
            coordinate,
            name: 'Local selecionado'
        };

        if (!pontoClicado1) {
            setPontoClicado1(customLocation);
            setPontoClicado2(null);
            setRouteInfo(null);
            setShowRouteModal(false);
            return;
        }

        if (!pontoClicado2) {
            setPontoClicado2(customLocation);
            return;
        }

        // Se já tem dois pontos, reinicia com o novo ponto
        setPontoClicado1(customLocation);
        setPontoClicado2(null);
        setRouteInfo(null);
        setShowRouteModal(false);
    };

    const origin = useMemo(() =>
        pontoClicado1 ? getPointCoordinate(pontoClicado1) : null,
        [pontoClicado1]
    );

    const destination = useMemo(() =>
        pontoClicado2 ? getPointCoordinate(pontoClicado2) : null,
        [pontoClicado2]
    );

    const handleDirectionsReady = useCallback((result: any) => {
        try {
            if (result && result.distance && result.duration && pontoClicado1 && pontoClicado2) {
                const info: RouteInfo = {
                    distance: result.distance,
                    duration: result.duration,
                    origin: getPointName(pontoClicado1),
                    destination: getPointName(pontoClicado2),
                };
                setRouteInfo(info);
                setShowRouteModal(true);
            }
        } catch (error) {
            console.error('Error handling directions:', error);
        }
    }, [pontoClicado1, pontoClicado2]);

    useFocusEffect(
        useCallback(() => {
            if (!auth.currentUser || !auth.currentUser.location) return;

            setRegion({
                latitude: auth.currentUser.location.latitude,
                longitude: auth.currentUser.location.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            });
        }, [auth.currentUser])
    );

    useEffect(() => {
        const createTemporaryUrl = async (avatar_url: string | null) => {
            if (!avatar_url) return null;

            const { data, error } = await supabase.storage
                .from("app-dam")
                .createSignedUrl(avatar_url, 60 * 60);

            if (error || !data) return null;
            return data.signedUrl;
        };

        const fetchData = async () => {
            const { data: roomMembersData, error: roomMembersError } = await supabase
                .from("room_members")
                .select("user_id")
                .eq("room_id", roomId);

            if (roomMembersError) {
                console.error(roomMembersError);
                return;
            }

            const users = (roomMembersData ?? []).map((item) => item.user_id);

            const { data: profilesData, error: profilesError } = await supabase
                .from("profiles")
                .select("user_id, name, last_longitude, last_latitude, location_updated_at, avatar_url")
                .in("user_id", users);

            if (profilesError) {
                console.error(profilesError);
                return;
            }

            const profilesWithAvatar = await Promise.all(
                (profilesData ?? []).map(async (p) => ({
                    ...p,
                    avatar_signed_url: await createTemporaryUrl(p.avatar_url ?? null),
                }))
            );

            setProfiles(profilesWithAvatar);
        };

        fetchData();
    }, [roomId]);

    const circles = useMemo(() => {
        const radiusMeters = 25;
        return profiles.map((profile) => ({
            key: `circle-${profile.user_id}`,
            coordinates: createCirclePolygon(coordinateFromProfile(profile), radiusMeters, 32),
        }));
    }, [profiles]);

    const canDrawDirections = Boolean(googleApiKey && origin && destination);

    const isPointSelected = (profile: UserLocationInfo): boolean => {
        if (isUserProfile(pontoClicado1) && pontoClicado1.user_id === profile.user_id) return true;
        if (isUserProfile(pontoClicado2) && pontoClicado2.user_id === profile.user_id) return true;
        return false;
    };

    return (
        <View style={styles.container}>
            {region && (
                <MapView
                    region={region}
                    style={styles.map}
                    onPress={onMapPress}
                >
                    {circles.map((c) => (
                        <Polygon
                            key={c.key}
                            coordinates={c.coordinates}
                            fillColor="rgba(120, 120, 120, 0.25)"
                            strokeColor="rgba(120, 120, 120, 0.8)"
                            strokeWidth={2}
                        />
                    ))}

                    {canDrawDirections && origin && destination && (
                        <MapViewDirections
                            origin={origin}
                            destination={destination}
                            apikey={googleApiKey!}
                            strokeWidth={5}
                            strokeColor="red"
                            mode="DRIVING"
                            resetOnChange={false}
                            onReady={handleDirectionsReady}
                            onError={(errorMessage) => {
                                console.log('Directions error:', errorMessage);
                                setRouteInfo(null);
                                setShowRouteModal(false);
                            }}
                        />
                    )}

                    {/* Marcador customizado para local selecionado (ponto 1) */}
                    {pontoClicado1 && !isUserProfile(pontoClicado1) && (
                        <Marker
                            coordinate={pontoClicado1.coordinate}
                            title={pontoClicado1.name}
                            pinColor="blue"
                        >
                            <View style={styles.customMarker}>
                                <MaterialIcons name="place" size={40} color="blue" />
                            </View>
                        </Marker>
                    )}

                    {/* Marcador customizado para local selecionado (ponto 2) */}
                    {pontoClicado2 && !isUserProfile(pontoClicado2) && (
                        <Marker
                            coordinate={pontoClicado2.coordinate}
                            title={pontoClicado2.name}
                            pinColor="green"
                        >
                            <View style={styles.customMarker}>
                                <MaterialIcons name="place" size={40} color="green" />
                            </View>
                        </Marker>
                    )}

                    {/* Marcadores dos usuários */}
                    {profiles.map((profile) => (
                        <Marker
                            key={`marker-${profile.user_id}`}
                            coordinate={coordinateFromProfile(profile)}
                            description={formatDate(profile.location_updated_at)}
                            title={profile.name}
                            onPress={() => onClickUsuario(profile)}
                        >
                            <View style={isPointSelected(profile) ? styles.selectedMarker : undefined}>
                                {profile.avatar_signed_url ? (
                                    <Image source={{ uri: profile.avatar_signed_url }} style={styles.avatarMarker} />
                                ) : (
                                    <MaterialIcons name="person-pin" size={32} color="red" />
                                )}
                            </View>
                        </Marker>
                    ))}
                </MapView>
            )}

            {/* Indicador de seleção */}
            {pontoClicado1 && (
                <View style={styles.selectionIndicator}>
                    <Text style={styles.selectionText}>
                        {pontoClicado2
                            ? `Rota: ${getPointName(pontoClicado1)} → ${getPointName(pontoClicado2)}`
                            : `Selecionado: ${getPointName(pontoClicado1)} (toque em outro ponto)`
                        }
                    </Text>
                    <TouchableOpacity
                        onPress={() => {
                            setPontoClicado1(null);
                            setPontoClicado2(null);
                            setRouteInfo(null);
                            setShowRouteModal(false);
                        }}
                        style={styles.clearButton}
                    >
                        <MaterialIcons name="close" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            )}

            {/* Modal de Informações da Rota */}
            <Modal
                visible={showRouteModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowRouteModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Informações da Rota</Text>
                            <TouchableOpacity onPress={() => setShowRouteModal(false)}>
                                <MaterialIcons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            {routeInfo && (
                                <>
                                    <View style={styles.infoRow}>
                                        <MaterialIcons name="place" size={20} color="#666" />
                                        <View style={styles.infoTextContainer}>
                                            <Text style={styles.infoLabel}>Origem</Text>
                                            <Text style={styles.infoValue}>{routeInfo.origin}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.infoRow}>
                                        <MaterialIcons name="flag" size={20} color="#666" />
                                        <View style={styles.infoTextContainer}>
                                            <Text style={styles.infoLabel}>Destino</Text>
                                            <Text style={styles.infoValue}>{routeInfo.destination}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.infoRow}>
                                        <MaterialIcons name="straighten" size={20} color="#666" />
                                        <View style={styles.infoTextContainer}>
                                            <Text style={styles.infoLabel}>Distância</Text>
                                            <Text style={styles.infoValue}>
                                                {formatDistance((routeInfo.distance || 0) * 1000)}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.infoRow}>
                                        <MaterialIcons name="access-time" size={20} color="#666" />
                                        <View style={styles.infoTextContainer}>
                                            <Text style={styles.infoLabel}>Duração estimada</Text>
                                            <Text style={styles.infoValue}>
                                                {formatDuration(routeInfo.duration || 0)}
                                            </Text>
                                        </View>
                                    </View>
                                </>
                            )}
                        </ScrollView>

                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowRouteModal(false)}
                        >
                            <Text style={styles.closeButtonText}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { width: '100%', height: '100%' },
    avatarMarker: {
        width: 32,
        height: 32,
        borderRadius: 19,
        borderWidth: 2,
        borderColor: 'white',
    },
    selectedMarker: {
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'red',
        padding: 1,
    },
    customMarker: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectionIndicator: {
        position: 'absolute',
        top: 10,
        left: 10,
        right: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    selectionText: {
        color: 'white',
        fontSize: 14,
        flex: 1,
        marginRight: 8,
    },
    clearButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        padding: 4,
        borderRadius: 12,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 20,
        paddingBottom: 30,
        paddingHorizontal: 20,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    modalBody: {
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
        paddingVertical: 10,
    },
    infoTextContainer: {
        marginLeft: 15,
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: '#999',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    closeButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});