import InvalidPasswordError from "../../../domain/errors/InvalidPasswordError";
import Password from "../../../domain/value-objects/Password";

describe("Password", () => {
    it("should create a Password instance with a valid password", () => {
        const validPassword = "validPass123";

        // Criar o Password com uma senha válida
        const password = Password.create(validPassword);

        // Verificar se a instância é de Password
        expect(password).toBeInstanceOf(Password);
        expect(password.value).toBe(validPassword);
    });

    it("should throw an InvalidPasswordError if the password is invalid", () => {
        const invalidPasswords = [
            "short", // Menor que 8 caracteres
            "", // Senha vazia
            "1234567", // Apenas 7 caracteres
        ];

        invalidPasswords.forEach((invalidPassword) => {
            // Verificar se a função cria lança o erro InvalidPasswordError para cada senha inválida
            expect(() => {
                Password.create(invalidPassword);
            }).toThrow(InvalidPasswordError);

            // Verificar a mensagem do erro
            expect(() => {
                Password.create(invalidPassword);
            }).toThrow(new InvalidPasswordError("Senha inválida"));
        });
    });

    it("should create a Password instance with a password of exactly 8 characters", () => {
        const passwordWithEightChars = "12345678"; // Exatamente 8 caracteres

        // Criar o Password com a senha de 8 caracteres
        const password = Password.create(passwordWithEightChars);

        // Verificar se a instância é de Password
        expect(password).toBeInstanceOf(Password);
        expect(password.value).toBe(passwordWithEightChars);
    });

    it("should throw an InvalidPasswordError if the password is empty", () => {
        const emptyPassword = "";

        // Verificar se a função cria lança o erro InvalidPasswordError para senha vazia
        expect(() => {
            Password.create(emptyPassword);
        }).toThrow(InvalidPasswordError);

        // Verificar a mensagem do erro
        expect(() => {
            Password.create(emptyPassword);
        }).toThrow(new InvalidPasswordError("Senha inválida"));
    });
});
