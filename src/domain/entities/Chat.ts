import Password from "../value-objects/Password";

export default class Chat {
    private constructor(
        readonly name: string,
        readonly id?: string,
        readonly idUser?: string,
        readonly imageUrl?: string,
        readonly password?: Password,
    ) {}

    static create(
        name: string,
        id?: string,
        idUser?: string,
        imageUrl?: string,
        password?: string
    ) {
        return new Chat(name, id, idUser, imageUrl, password ? Password.create(password) : undefined)
    }
}