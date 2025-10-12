import Email from "../value-objects/Email";
import GeoLocation from "../value-objects/GeoLocation";
import Password from "../value-objects/Password";
import * as Crypto from "expo-crypto"

export default class User {
    private constructor(
        readonly name: string,
        readonly email: Email,
        readonly password: Password,
        readonly location?: GeoLocation,
        readonly id?: string
    ) {}

    static create(user: {
        name: string;
        email: string;
        password: string;
        latitude?: number;
        longitude?: number;
        id?: string;
    }) {
        if (user.latitude && user.longitude) {
            return new User(
                user.name,
                Email.create(user.email),
                Password.create(user.password),
                GeoLocation.create(user.latitude, user.longitude),
                user.id?.length ? user.id : Crypto.randomUUID()
            );
        }

        return new User(
            user.name,
            Email.create(user.email),
            Password.create(user.password),
            undefined,
            user.id?.length ? user.id : Crypto.randomUUID()
        );
    }
}
