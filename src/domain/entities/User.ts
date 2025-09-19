import Email from "../value-objects/Email";
import GeoLocation from "../value-objects/GeoLocation";
import Password from "../value-objects/Password";

export default class User {
    private constructor(
        readonly name: string,
        readonly location: GeoLocation,
        readonly id?: string,
        readonly email?: Email,
        readonly password?: Password
    ) {}

    static create(
        name: string,
        latitude: number,
        longitude: number,
        id?: string,
        email?: string,
        password?: string
    ) {
        return new User(
            name,
            GeoLocation.create(latitude, longitude),
            id,
            email ? Email.create(email) : undefined,
            password ? Password.create(password) : undefined
        );
    }
}
