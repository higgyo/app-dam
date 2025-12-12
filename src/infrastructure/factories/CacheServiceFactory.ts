import { DatabaseService, NetworkService, SyncService } from "../cache";

/**
 * Factory principal para inicialização do cache e serviços relacionados.
 * Deve ser chamada uma vez na inicialização do app.
 */
export class CacheServiceFactory {
    private static initialized = false;

    /**
     * Inicializa todos os serviços de cache.
     * Deve ser chamado uma vez no início do app (ex: App.tsx).
     */
    static async initialize(): Promise<void> {
        if (this.initialized) return;

        // Inicializar banco de dados
        const databaseService = DatabaseService.getInstance();
        await databaseService.initialize();

        // Inicializar serviço de rede
        const networkService = NetworkService.getInstance();
        networkService.initialize();

        // Inicializar serviço de sincronização
        const syncService = SyncService.getInstance();
        syncService.initialize();

        this.initialized = true;
        console.log("Cache services initialized successfully");
    }

    /**
     * Retorna se os serviços de cache estão inicializados.
     */
    static isInitialized(): boolean {
        return this.initialized;
    }

    /**
     * Força a sincronização de operações pendentes.
     */
    static async forceSync(): Promise<void> {
        const syncService = SyncService.getInstance();
        await syncService.syncPendingOperations();
    }

    /**
     * Retorna a quantidade de operações pendentes de sincronização.
     */
    static async getPendingSyncCount(): Promise<number> {
        const syncService = SyncService.getInstance();
        return syncService.getPendingCount();
    }

    /**
     * Verifica se está online.
     */
    static isOnline(): boolean {
        const networkService = NetworkService.getInstance();
        return networkService.isOnline();
    }

    /**
     * Limpa todo o cache local.
     * Use com cuidado - remove todos os dados armazenados.
     */
    static async clearCache(): Promise<void> {
        const databaseService = DatabaseService.getInstance();
        await databaseService.clearAllData();
    }

    /**
     * Adiciona listener para mudanças de conexão.
     */
    static addConnectionListener(
        listener: (isConnected: boolean) => void
    ): () => void {
        const networkService = NetworkService.getInstance();
        return networkService.addListener(listener);
    }
}
