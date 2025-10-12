import InvalidEmailError from "../../../domain/errors/InvalidEmailError";
import Email from "../../../domain/value-objects/Email";

describe("Email", () => {
    it("should create an Email instance with a valid email", () => {
        const validEmail = "test@example.com";

        // Criar o Email com um e-mail válido
        const email = Email.create(validEmail);

        // Verificar se a instância é de Email
        expect(email).toBeInstanceOf(Email);
        expect(email.value).toBe(validEmail);
    });

    it("should throw an InvalidEmailError if the email is invalid", () => {
        const invalidEmails = [
            "invalidemail.com", // Sem '@'
            "test@", // Domínio incompleto
            "test@com", // Domínio sem TLD
            "@example.com", // Sem usuário
            "test@.com", // Domínio com ponto na frente
        ];

        invalidEmails.forEach((invalidEmail) => {
            // Verificar se a função cria lança o erro InvalidEmailError para cada e-mail inválido
            expect(() => {
                Email.create(invalidEmail);
            }).toThrow(InvalidEmailError);

            // Verificar a mensagem do erro
            expect(() => {
                Email.create(invalidEmail);
            }).toThrow(new InvalidEmailError("E-mail inválido"));
        });
    });

    it("should throw an InvalidEmailError if the email is empty", () => {
        const emptyEmail = "";

        // Verificar se a função cria lança o erro InvalidEmailError para e-mail vazio
        expect(() => {
            Email.create(emptyEmail);
        }).toThrow(InvalidEmailError);

        // Verificar a mensagem do erro
        expect(() => {
            Email.create(emptyEmail);
        }).toThrow(new InvalidEmailError("E-mail inválido"));
    });
});
