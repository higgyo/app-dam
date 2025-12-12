import { DatabaseService } from "./database-service";
import { NetworkService } from "./network-service";

export interface PendingOperation {
    id: number;
    entity_type: string;
    entity_id: string;
    operation: string;
    data: string;
    created_at: string;
}

export class SyncService {
    private static instance: SyncService;
    private databaseService: DatabaseService;
    private networkService: NetworkService;
    private isSyncing: boolean = false;
    private syncCallbacks: Map<string, (data: any) => Promise<void>> =
        new Map();

    private constructor() {
        this.databaseService = DatabaseService.getInstance();
        this.networkService = NetworkService.getInstance();
    }

    static getInstance(): SyncService {
        if (!SyncService.instance) {
            SyncService.instance = new SyncService();
        }
        return SyncService.instance;
    }

    initialize(): void {
        // Escutar mudanças de conexão
        this.networkService.addListener((isConnected) => {
            if (isConnected) {
                this.syncPendingOperations();
            }
        });
    }

    registerSyncCallback(
        entityType: string,
        callback: (data: any) => Promise<void>
    ): void {
        this.syncCallbacks.set(entityType, callback);
    }

    async addPendingOperation(
        entityType: string,
        entityId: string,
        operation: string,
        data: any
    ): Promise<void> {
        const db = this.databaseService.getDatabase();

        await db.runAsync(
            `INSERT INTO pending_operations (entity_type, entity_id, operation, data) 
             VALUES (?, ?, ?, ?)`,
            [entityType, entityId, operation, JSON.stringify(data)]
        );
    }

    async getPendingOperations(): Promise<PendingOperation[]> {
        const db = this.databaseService.getDatabase();

        const results = await db.getAllAsync<PendingOperation>(
            `SELECT * FROM pending_operations ORDER BY created_at ASC`
        );

        return results;
    }

    async removePendingOperation(id: number): Promise<void> {
        const db = this.databaseService.getDatabase();
        await db.runAsync(`DELETE FROM pending_operations WHERE id = ?`, [id]);
    }

    async syncPendingOperations(): Promise<void> {
        if (this.isSyncing || !this.networkService.isOnline()) {
            return;
        }

        this.isSyncing = true;

        try {
            const pendingOps = await this.getPendingOperations();

            for (const op of pendingOps) {
                try {
                    const callback = this.syncCallbacks.get(op.entity_type);

                    if (callback) {
                        const data = JSON.parse(op.data);
                        await callback({
                            operation: op.operation,
                            entityId: op.entity_id,
                            ...data,
                        });
                    }

                    await this.removePendingOperation(op.id);
                } catch (error) {
                    console.error(`Failed to sync operation ${op.id}:`, error);
                    // Continuar com a próxima operação
                }
            }
        } finally {
            this.isSyncing = false;
        }
    }

    async hasPendingOperations(): Promise<boolean> {
        const ops = await this.getPendingOperations();
        return ops.length > 0;
    }

    async getPendingCount(): Promise<number> {
        const db = this.databaseService.getDatabase();
        const result = await db.getFirstAsync<{ count: number }>(
            `SELECT COUNT(*) as count FROM pending_operations`
        );
        return result?.count ?? 0;
    }
}
