import React, { useEffect, useState } from "react";
import { ContextWrapper } from "./src/presentation/contexts/ContextWrapper";
import { HostNavigation } from "./src/presentation/navigation/HostNavigation";
import * as Updates from "expo-updates";
import Constants from "expo-constants";
import { ActivityIndicator, Text, View, Button } from "react-native";
import * as Location from "expo-location";
import { SupabaseStorageService } from "./src/infrastructure/supabase/storage-service";
import { useAuthContext } from "./src/presentation/contexts/AuthContext";

interface Coordinates {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
}

// Função para obter e salvar a localização
async function getLocation() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.error("Permissão de localização não concedida");
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return location.coords;
  } catch (error) {
    console.error("Erro ao obter localização:", error);
    return null;
  }
}

function AppContent() {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [locationIntervalId, setLocationIntervalId] = useState<NodeJS.Timeout | null>(null);
  
  const { currentUser } = useAuthContext();
  const storage = new SupabaseStorageService();

  const version =
    Constants.manifest2?.extra?.expoClient?.version ??
    Constants.expoConfig?.version ??
    "unknown";

  async function saveLocationToSupabase(coords:Coordinates) {
    try {
      if (!currentUser?.id) {
        console.log("Usuário não autenticado, localização não salva");
        return;
      }
      
      await storage.updateLocation(coords.longitude, coords.latitude, currentUser.id);
      console.log("Localização salva:", coords);
    } catch (error) {
      console.error("Erro ao salvar a localização:", error);
    }
  }

  async function checkForUpdates() {
    try {
      setIsChecking(true);
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        setIsUpdateAvailable(true);
      }
    } catch (error) {
      console.error("Erro ao verificar atualizações:", error);
    } finally {
      setIsChecking(false);
    }
  }

  async function downloadAndReload() {
    try {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    } catch (error) {
      console.error("Erro ao baixar atualização:", error);
    }
  }

  function startLocationTracking() {
    const MIN = 1;
    const intervalId = setInterval(async () => {
      const location = await getLocation();
      if (location) {
        await saveLocationToSupabase(location);
      }
    }, 1000 * 60 * MIN);

    setLocationIntervalId(intervalId);
  }

  function stopLocationTracking() {
    if (locationIntervalId) {
      clearInterval(locationIntervalId);
      setLocationIntervalId(null);
    }
  }

  useEffect(() => {
    const initLocation = async () => {
      const location = await getLocation();
      if (location) {
        await saveLocationToSupabase(location);
      }
    };

    initLocation();

    startLocationTracking();

    return () => {
      stopLocationTracking();
    };
  }, [currentUser]);

  if (isChecking || isUpdateAvailable) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>BóConecta - Versão {version}</Text>
        {isChecking && <ActivityIndicator />}
        {isUpdateAvailable && (
          <View>
            <Text>Nova versão disponível!</Text>
            <Button title="Atualizar Agora" onPress={downloadAndReload} />
          </View>
        )}
        <Button title="Verificar Atualizações" onPress={checkForUpdates} />
      </View>
    );
  }

  return <HostNavigation />;
}

export default function App() {
  return (
    <ContextWrapper>
      <AppContent />
    </ContextWrapper>
  );
}