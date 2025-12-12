import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNetworkStatus } from "../hooks/useNetworkStatus";

interface NetworkStatusBannerProps {
    showPendingSync?: boolean;
}

/**
 * Banner que mostra o status de conexão e sincronização.
 * Exibe uma barra quando offline ou quando há operações pendentes.
 */
export function NetworkStatusBanner({
    showPendingSync = true,
}: NetworkStatusBannerProps) {
    const { isOnline, pendingSyncCount, hasPendingSync } = useNetworkStatus();

    if (isOnline && !hasPendingSync) {
        return null;
    }

    return (
        <View
            style={[
                styles.container,
                isOnline ? styles.syncing : styles.offline,
            ]}
        >
            {!isOnline && (
                <Text style={styles.text}>📡 Sem conexão - Modo offline</Text>
            )}
            {isOnline && hasPendingSync && showPendingSync && (
                <Text style={styles.text}>
                    🔄 Sincronizando {pendingSyncCount} item(s)...
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    offline: {
        backgroundColor: "#ff6b6b",
    },
    syncing: {
        backgroundColor: "#ffd93d",
    },
    text: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
    },
});
