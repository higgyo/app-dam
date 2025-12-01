import { getDatabase } from "../database";
import { SyncQueueRow } from "../database/schema";
import { networkService } from "./NetworkService";

export type SyncOperation = {
    entityType: "user" | "room" | "message";
    entityId: string;
    operation: "create" | "update" | "delete";
    data: Record<string, unknown>;
};

export type SyncHandler = (
    operation: SyncQueueRow
) => Promise<boolean>;

class SyncService {
    private isSyncing = false;
    private unsubscribeNetwork: (() => void) | null = null;
    private handlers: Map<string, SyncHandler> = new Map();

    async initialize(): Promise<void> {
        // Listen for network changes
        this.unsubscribeNetwork = networkService.addListener(async (status) => {
            if (status.isConnected && status.isInternetReachable !== false) {
                await this.syncPendingOperations();
            }
        });

        // Try initial sync if online
        if (networkService.isOnline()) {
            await this.syncPendingOperations();
        }
    }

    /**
     * Register a handler for syncing a specific entity type.
     * The handler should return true if sync was successful, false otherwise.
     */
    registerHandler(entityType: string, handler: SyncHandler): void {
        this.handlers.set(entityType, handler);
    }

    async addToQueue(operation: SyncOperation): Promise<void> {
        const db = await getDatabase();
        const dataJson = JSON.stringify(operation.data);

        await db.runAsync(
            `INSERT INTO sync_queue (entity_type, entity_id, operation, data, created_at, retry_count)
             VALUES (?, ?, ?, ?, datetime('now'), 0)`,
            [
                operation.entityType,
                operation.entityId,
                operation.operation,
                dataJson,
            ]
        );
    }

    async getPendingOperations(): Promise<SyncQueueRow[]> {
        const db = await getDatabase();
        const rows = await db.getAllAsync<SyncQueueRow>(
            `SELECT * FROM sync_queue ORDER BY created_at ASC`
        );
        return rows;
    }

    async removeFromQueue(id: number): Promise<void> {
        const db = await getDatabase();
        await db.runAsync(`DELETE FROM sync_queue WHERE id = ?`, [id]);
    }

    async incrementRetryCount(id: number): Promise<void> {
        const db = await getDatabase();
        await db.runAsync(
            `UPDATE sync_queue SET retry_count = retry_count + 1 WHERE id = ?`,
            [id]
        );
    }

    async syncPendingOperations(): Promise<void> {
        if (this.isSyncing || !networkService.isOnline()) {
            return;
        }

        this.isSyncing = true;

        try {
            const pendingOps = await this.getPendingOperations();

            for (const op of pendingOps) {
                if (op.retry_count >= 5) {
                    // Remove operations that have failed too many times
                    // Note: In a production app, you might want to log these failures
                    // or move them to a dead letter queue for manual review
                    await this.removeFromQueue(op.id);
                    continue;
                }

                try {
                    const handler = this.handlers.get(op.entity_type);
                    if (handler) {
                        const success = await handler(op);
                        if (success) {
                            await this.removeFromQueue(op.id);
                        } else {
                            await this.incrementRetryCount(op.id);
                        }
                    } else {
                        // No handler registered for this entity type
                        // Log warning and remove to prevent queue buildup
                        console.warn(
                            `No sync handler registered for entity type: ${op.entity_type}`
                        );
                        await this.removeFromQueue(op.id);
                    }
                } catch {
                    await this.incrementRetryCount(op.id);
                }
            }
        } finally {
            this.isSyncing = false;
        }
    }

    async clearQueue(): Promise<void> {
        const db = await getDatabase();
        await db.runAsync(`DELETE FROM sync_queue`);
    }

    hasPendingOperations(): Promise<boolean> {
        return this.getPendingOperations().then((ops) => ops.length > 0);
    }

    dispose(): void {
        if (this.unsubscribeNetwork) {
            this.unsubscribeNetwork();
            this.unsubscribeNetwork = null;
        }
        this.handlers.clear();
    }
}

// Singleton instance
export const syncService = new SyncService();
