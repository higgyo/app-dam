import NetInfo, { NetInfoState } from "@react-native-community/netinfo";

export type ConnectionListener = (isConnected: boolean) => void;

export class NetworkService {
    private static instance: NetworkService;
    private isConnected: boolean = true;
    private listeners: ConnectionListener[] = [];
    private unsubscribe: (() => void) | null = null;

    private constructor() {}

    static getInstance(): NetworkService {
        if (!NetworkService.instance) {
            NetworkService.instance = new NetworkService();
        }
        return NetworkService.instance;
    }

    initialize(): void {
        this.unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
            const wasConnected = this.isConnected;
            this.isConnected = state.isConnected ?? false;

            if (wasConnected !== this.isConnected) {
                this.notifyListeners();
            }
        });

        // Verificar estado inicial
        NetInfo.fetch().then((state: NetInfoState) => {
            this.isConnected = state.isConnected ?? false;
        });
    }

    isOnline(): boolean {
        return this.isConnected;
    }

    async checkConnection(): Promise<boolean> {
        const state = await NetInfo.fetch();
        this.isConnected = state.isConnected ?? false;
        return this.isConnected;
    }

    addListener(listener: ConnectionListener): () => void {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener);
        };
    }

    private notifyListeners(): void {
        this.listeners.forEach((listener) => listener(this.isConnected));
    }

    dispose(): void {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
        this.listeners = [];
    }
}
