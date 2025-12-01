import { useEffect, useState } from "react";
import { ContextWrapper } from "./src/presentation/contexts/ContextWrapper";
import { HostNavigation } from "./src/presentation/navigation/HostNavigation";
import * as Updates from "expo-updates";
import Constants from "expo-constants";
import { ActivityIndicator, Text, View, Button } from "react-native";
import { initializeDatabase } from "./src/infrastructure/database";
import { syncService } from "./src/infrastructure/services/SyncService";
import { networkService } from "./src/infrastructure/services/NetworkService";

export default function App() {
    const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [isDatabaseReady, setIsDatabaseReady] = useState(false);

    const version =
        Constants.manifest2?.extra?.expoClient?.version ??
        Constants.expoConfig?.version ??
        "unknown";

    async function checkForUpdates() {
        try {
            setIsChecking(true);
            const update = await Updates.checkForUpdateAsync();
            if (update.isAvailable) {
                setIsUpdateAvailable(true);
            }
        } catch (error) {
            console.error("Erro ao verificar updates:", error);
        } finally {
            setIsChecking(false);
        }
    }

    async function downloadAndReload() {
        try {
            await Updates.fetchUpdateAsync();
            await Updates.reloadAsync();
        } catch (error) {
            console.error("Erro ao baixar update:", error);
        }
    }

    useEffect(() => {
        Updates.checkForUpdateAsync();

        // Initialize services in order: network first, then database, then sync
        const initializeApp = async () => {
            try {
                // Initialize network service first so offline detection works
                await networkService.initialize();
                await initializeDatabase();
                await syncService.initialize();
                setIsDatabaseReady(true);
            } catch (error) {
                console.error("Erro ao inicializar banco de dados:", error);
                // Still set ready to allow app to function
                setIsDatabaseReady(true);
            }
        };

        initializeApp();
    }, []);

    if (!isDatabaseReady || isChecking || isUpdateAvailable) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Text>BóConecta - Versão {version}</Text>
                {isChecking && <ActivityIndicator />}
                {isUpdateAvailable && (
                    <View>
                        <Text>Nova versão disponível!</Text>
                        <Button
                            title="Atualizar Agora"
                            onPress={downloadAndReload}
                        />
                    </View>
                )}
                <Button title="Verificar Updates" onPress={checkForUpdates} />
            </View>
        );
    }

    return (
        <ContextWrapper>
            <HostNavigation />
        </ContextWrapper>
    );
}
