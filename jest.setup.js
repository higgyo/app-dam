// Mock do expo-crypto para evitar erros de import ESM
jest.mock('expo-crypto', () => ({
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
}));

// Mock do expo-sqlite para evitar erros de import ESM
jest.mock('expo-sqlite', () => ({
    openDatabaseAsync: jest.fn(() => Promise.resolve({
        execAsync: jest.fn(),
        runAsync: jest.fn(),
        getAllAsync: jest.fn(() => Promise.resolve([])),
        getFirstAsync: jest.fn(() => Promise.resolve(null)),
        closeAsync: jest.fn(),
    })),
}));
