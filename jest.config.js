/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    coveragePathIgnorePatterns: [
        "/node_modules/",
        "/__tests__/setup.js",
        "/coverage/",
        "/App.js", // Se não tiver lógica de negócio
        "\\.config\\.js$", // Arquivos de configuração
        "\\.d\\.ts$" // Arquivos de definição de tipos
    ],
    collectCoverageFrom: [
        "src/**/*.ts", // Inclui todos os arquivos .ts dentro da pasta src
        "!src/**/*.test.ts", // Exclui todos os arquivos .test.ts
        "!src/**/*.spec.ts", // Exclui todos os arquivos .spec.ts
    ],
};
