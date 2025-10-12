import Email from "../value-objects/Email";
import GeoLocation from "../value-objects/GeoLocation";
import Password from "../value-objects/Password";

export default class User {
    private constructor(
        readonly name: string,
        readonly location: GeoLocation,
        readonly email: Email,
        readonly password: Password,
        readonly id?: string
    ) {}

    static create(
        name: string,
        latitude: number,
        longitude: number,
        email: string,
        password: string,
        id?: string
    ) {
        return new User(
            name,
            GeoLocation.create(latitude, longitude),
            Email.create(email),
            Password.create(password),
            id?.length ? id : crypto.randomUUID(),
        );
    }
}
