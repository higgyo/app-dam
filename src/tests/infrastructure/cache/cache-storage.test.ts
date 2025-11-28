import { MockCacheStorage } from "./mock-cache-storage";

describe("MockCacheStorage", () => {
    let cache: MockCacheStorage;

    beforeEach(() => {
        cache = new MockCacheStorage();
    });

    describe("get and set", () => {
        it("should store and retrieve a value", async () => {
            const key = "test-key";
            const value = { name: "test", data: [1, 2, 3] };

            await cache.set(key, value);
            const result = await cache.get(key);

            expect(result).toEqual(value);
        });

        it("should return null for non-existent key", async () => {
            const result = await cache.get("non-existent");
            expect(result).toBeNull();
        });

        it("should overwrite existing value", async () => {
            const key = "test-key";
            await cache.set(key, "first");
            await cache.set(key, "second");

            const result = await cache.get(key);
            expect(result).toBe("second");
        });
    });

    describe("TTL functionality", () => {
        it("should return value before TTL expires", async () => {
            const key = "test-key";
            const value = "test-value";

            await cache.set(key, value, 60); // 60 seconds TTL
            const result = await cache.get(key);

            expect(result).toBe(value);
        });

        it("should return null after TTL expires", async () => {
            const key = "test-key";
            const value = "test-value";

            // Mock Date.now to simulate time passage
            const originalNow = Date.now;
            let currentTime = Date.now();
            Date.now = jest.fn(() => currentTime);

            // Set with 1 second TTL
            await cache.set(key, value, 1);

            // Fast forward time by 2 seconds
            currentTime += 2000;

            const result = await cache.get(key);
            expect(result).toBeNull();

            // Restore Date.now
            Date.now = originalNow;
        });
    });

    describe("delete", () => {
        it("should delete an existing key", async () => {
            const key = "test-key";
            await cache.set(key, "value");
            await cache.delete(key);

            const result = await cache.get(key);
            expect(result).toBeNull();
        });

        it("should not throw when deleting non-existent key", async () => {
            await expect(cache.delete("non-existent")).resolves.toBeUndefined();
        });
    });

    describe("clear", () => {
        it("should clear all keys", async () => {
            await cache.set("key1", "value1");
            await cache.set("key2", "value2");
            await cache.set("key3", "value3");

            await cache.clear();

            expect(await cache.get("key1")).toBeNull();
            expect(await cache.get("key2")).toBeNull();
            expect(await cache.get("key3")).toBeNull();
        });
    });

    describe("has", () => {
        it("should return true for existing key", async () => {
            await cache.set("test-key", "value");
            const result = await cache.has("test-key");
            expect(result).toBe(true);
        });

        it("should return false for non-existent key", async () => {
            const result = await cache.has("non-existent");
            expect(result).toBe(false);
        });
    });
});
