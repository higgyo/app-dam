import { StyleSheet, View, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthContext } from '../../contexts/AuthContext';
import { supabase } from '../../../infrastructure/supabase';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface MapScreenProps {
    roomId: string;
    setShowMap: React.Dispatch<React.SetStateAction<boolean>>;
}

interface UserLocationInfo {
    last_latitude: number;
    last_longitude: number;
    location_updated_at: string;
    name: string;
}

export default function MapScreen({ roomId }: MapScreenProps) {
    const [profiles, setProfiles] = useState<UserLocationInfo[]>([]);
    const [region, setRegion] = useState<{
        latitude: number;
        longitude: number;
        latitudeDelta: number;
        longitudeDelta: number;
    } | null>(null);

    const auth = useAuthContext();

    const formatDate = (date: string | null) => {
        if (!date)
            return ""

        let dateSplit = date.split("T")
        let datePart = dateSplit[0]
        let hourPart = dateSplit[1]

        let datePartSplit = datePart.split("-")
        return datePartSplit[2] + "/" + datePartSplit[1] + "/" + datePartSplit[0] + " " + hourPart
    }

    useFocusEffect(
        useCallback(() => {
            if (!auth.currentUser || !auth.currentUser.location) return;

            setRegion({
                latitude: auth.currentUser.location.latitude,
                longitude: auth.currentUser.location.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05
            });
        }, [])
    );

    useEffect(() => {
        const fetchData = async () => {
            let { data: roomMembersData, error: roomMembersError } = await supabase
                .from("room_members")
                .select("user_id")
                .eq("room_id", roomId);

            if (roomMembersError) {
                console.error(roomMembersError);
                return;
            }

            let users: string[] = [];
            roomMembersData?.forEach((item) => {
                users.push(item.user_id);
            });

            let { data: profilesData, error: profilesError } = await supabase
                .from("profiles")
                .select("name, last_longitude, last_latitude, location_updated_at")
                .in("user_id", users);

            if (profilesError) {
                console.error(profilesError);
                return;
            }

            console.log(profilesData);

            setProfiles(profilesData);
        }

        fetchData();
    }, [roomId]);

    return (
        <View style={styles.container}>
            {region && (
                <MapView region={region} style={styles.map}>
                    {profiles.map((profile, index) => (
                        <Marker
                            coordinate={{
                                latitude: !profile.last_latitude ? -21.55 : profile.last_latitude,
                                longitude: !profile.last_longitude ? -45.43 : profile.last_longitude
                            }}
                            style={{ alignItems: "center" }}
                            key={index}
                            description={formatDate(profile.location_updated_at)}
                            title={profile.name}
                        >
                            <View>
                                <MaterialIcons name="person-pin" size={32} color="red" />
                            </View>
                        </Marker>
                    ))}
                </MapView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    markerContainer: {
        alignItems: 'center',
        minWidth: 100,
        minHeight: 70,
        padding: 10,
    },
    nameTag: {
        backgroundColor: 'white',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginBottom: 4,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    nameText: {
        fontWeight: 'bold',
        color: 'blue',
    },
    error: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        backgroundColor: 'red',
        color: 'white',
        padding: 10,
        borderRadius: 5,
    },
});