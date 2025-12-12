import { useEffect, useState } from "react";
import { CacheServiceFactory } from "../../infrastructure/factories/CacheServiceFactory";

/**
 * Hook para monitorar o estado de conexão e sincronização.
 */
export function useNetworkStatus() {
    const [isOnline, setIsOnline] = useState(true);
    const [pendingSyncCount, setPendingSyncCount] = useState(0);

    useEffect(() => {
        // Estado inicial
        setIsOnline(CacheServiceFactory.isOnline());

        // Atualizar contagem de operações pendentes
        const updatePendingCount = async () => {
            const count = await CacheServiceFactory.getPendingSyncCount();
            setPendingSyncCount(count);
        };

        updatePendingCount();

        // Listener para mudanças de conexão
        const unsubscribe = CacheServiceFactory.addConnectionListener(
            async (connected) => {
                setIsOnline(connected);

                if (connected) {
                    // Quando reconectar, forçar sincronização e atualizar contagem
                    await CacheServiceFactory.forceSync();
                    await updatePendingCount();
                }
            }
        );

        // Atualizar contagem periodicamente
        const interval = setInterval(updatePendingCount, 5000);

        return () => {
            unsubscribe();
            clearInterval(interval);
        };
    }, []);

    return {
        isOnline,
        pendingSyncCount,
        hasPendingSync: pendingSyncCount > 0,
        forceSync: CacheServiceFactory.forceSync,
    };
}
