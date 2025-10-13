import InvalidPasswordError from "../errors/InvalidPasswordError";

export default class Password {
    private constructor(readonly value: string) {}

    static create(password: string): Password {
        if (!this.validate(password)) {
            throw new InvalidPasswordError("Senha inválida");
        }

        return new Password(password);
    }

    private static validate(password: string): boolean {
        return password.length >= 8;
    }
}
