import NetInfo, { NetInfoState } from "@react-native-community/netinfo";

export type NetworkStatus = {
    isConnected: boolean;
    isInternetReachable: boolean | null;
};

export type NetworkStatusListener = (status: NetworkStatus) => void;

class NetworkService {
    private listeners: NetworkStatusListener[] = [];
    private currentStatus: NetworkStatus = {
        isConnected: true,
        isInternetReachable: true,
    };
    private unsubscribe: (() => void) | null = null;

    async initialize(): Promise<void> {
        // Get initial state
        const state = await NetInfo.fetch();
        this.updateStatus(state);

        // Subscribe to changes
        this.unsubscribe = NetInfo.addEventListener((state) => {
            this.updateStatus(state);
        });
    }

    private updateStatus(state: NetInfoState): void {
        this.currentStatus = {
            isConnected: state.isConnected ?? false,
            isInternetReachable: state.isInternetReachable,
        };

        // Notify all listeners
        this.listeners.forEach((listener) => {
            listener(this.currentStatus);
        });
    }

    getStatus(): NetworkStatus {
        return this.currentStatus;
    }

    isOnline(): boolean {
        return (
            this.currentStatus.isConnected &&
            this.currentStatus.isInternetReachable !== false
        );
    }

    addListener(listener: NetworkStatusListener): () => void {
        this.listeners.push(listener);

        // Return unsubscribe function
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }

    dispose(): void {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
        this.listeners = [];
    }
}

// Singleton instance
export const networkService = new NetworkService();
