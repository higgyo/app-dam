/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    collectCoverageFrom: [
        "src/**/*.ts", // Inclui todos os arquivos .ts dentro da pasta src
        "!src/**/*.test.ts", // Exclui todos os arquivos .test.ts
        "!src/**/*.spec.ts", // Exclui todos os arquivos .spec.ts
    ],
};
