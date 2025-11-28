import { ICacheStorage } from "../../../infrastructure/cache/icache-storage";

export class MockCacheStorage implements ICacheStorage {
    private store: Map<string, { value: string; expiresAt: number | null }> =
        new Map();

    async get<T>(key: string): Promise<T | null> {
        const entry = this.store.get(key);
        if (!entry) {
            return null;
        }

        if (entry.expiresAt !== null && entry.expiresAt < Date.now()) {
            this.store.delete(key);
            return null;
        }

        return JSON.parse(entry.value) as T;
    }

    async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
        const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
        this.store.set(key, { value: JSON.stringify(value), expiresAt });
    }

    async delete(key: string): Promise<void> {
        this.store.delete(key);
    }

    async clear(): Promise<void> {
        this.store.clear();
    }

    async has(key: string): Promise<boolean> {
        const result = await this.get(key);
        return result !== null;
    }
}
