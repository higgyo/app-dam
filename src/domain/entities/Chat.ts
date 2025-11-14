import Password from "../value-objects/Password";
import * as Crypto from "expo-crypto";

export default class Chat {
    private constructor(
        readonly id: string,
        readonly name: string,
        readonly idUser: string,
        readonly mediaUrl?: string,
        readonly password?: Password
    ) {}

    static create(
        name: string,
        idUser: string,
        mediaUrl?: string,
        password?: Password,
        id?: string
    ) {
        const finalId = id?.length ? id : Crypto.randomUUID();

        return new Chat(finalId, name, idUser, mediaUrl, password);
    }
}
