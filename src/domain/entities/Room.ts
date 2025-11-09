import Password from "../value-objects/Password";

export default class Room {
    private constructor(
        readonly name: string,
        readonly id?: string,
        readonly idUser?: string,
        readonly imageUrl?: string,
        readonly password?: Password,
        readonly code?: string
    ) {}

    static create({
        name,
        id,
        idUser,
        imageUrl,
        password,
        code,
    }: {
        name: string;
        id?: string;
        idUser?: string;
        imageUrl?: string;
        password?: string;
        code?: string;
    }) {
        return new Room(
            name,
            id,
            idUser,
            imageUrl,
            password ? Password.create(password) : undefined,
            code
        );
    }
}
