import { StyleSheet, View, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../../contexts/AuthContext';

export default function MapScreen() {
    const [error, setError] = useState<string | null>(null);
    const [region, setRegion] = useState<{
        latitude: number;
        longitude: number;
        latitudeDelta: number;
        longitudeDelta: number;
    } | null>(null);

    const auth = useAuthContext();

    useFocusEffect(
        useCallback(() => {
            if(!auth.currentUser || !auth.currentUser.location) return;

            setRegion({
                latitude: auth.currentUser.location.latitude,
                longitude: auth.currentUser.location.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05
            })
        }, [])
    );

    return (
        <View style={styles.container}>
            {region && (
                <MapView region={region} style={styles.map}>
                    <Marker
                        coordinate={{ latitude: region.latitude, longitude: region.longitude }}
                        title={auth.currentUser?.name}
                    >   
                        <View>
                            <Ionicons 
                                color="#fff"
                                name='person'
                                size={32}
                            />
                            <Text style={{ color: "#fff" }}>Teste</Text>
                        </View>
                    </Marker>
                </MapView>
            )}

            {error && <Text style={styles.error}>{error}</Text>}
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