import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";
import {
    networkService,
    NetworkStatus,
} from "../../infrastructure/services/NetworkService";

interface NetworkContextType {
    isOnline: boolean;
    isInternetReachable: boolean | null;
}

const NetworkContext = createContext<NetworkContextType | null>(null);

export function NetworkContextProvider({ children }: { children: ReactNode }) {
    const [status, setStatus] = useState<NetworkStatus>({
        isConnected: true,
        isInternetReachable: true,
    });

    useEffect(() => {
        // Initialize network service and get initial status
        const initialize = async () => {
            await networkService.initialize();
            setStatus(networkService.getStatus());
        };

        initialize();

        // Subscribe to status changes
        const unsubscribe = networkService.addListener((newStatus) => {
            setStatus(newStatus);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const value: NetworkContextType = {
        isOnline:
            status.isConnected && status.isInternetReachable !== false,
        isInternetReachable: status.isInternetReachable,
    };

    return (
        <NetworkContext.Provider value={value}>
            {children}
        </NetworkContext.Provider>
    );
}

export function useNetworkContext(): NetworkContextType {
    const context = useContext(NetworkContext);
    if (!context) {
        throw new Error(
            "useNetworkContext must be used within NetworkContextProvider"
        );
    }
    return context;
}
