import InvalidEmailError from "../errors/InvalidEmailError";

export default class Email {
    private constructor(readonly value: string) {}

    static create(email: string): Email {
        if (!this.validate(email)) {
            throw new InvalidEmailError("E-mail inválido");
        }

        return new Email(email);
    }

    private static validate(email: string): boolean {
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(email);
    }
}
