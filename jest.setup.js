// Mock do expo-crypto para evitar erros de import ESM
jest.mock('expo-crypto', () => ({
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
}));
