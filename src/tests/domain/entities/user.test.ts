import User from "../../../domain/entities/User";
import InvalidPasswordError from "../../../domain/errors/InvalidPasswordError";
import GeoLocation from "../../../domain/value-objects/GeoLocation";

jest.mock("../../../domain/value-objects/Password", () => {
    return {
        create: jest.fn((password: string) => {
            if (password && password.length >= 8) {
                return { value: password };
            } else {
                throw new InvalidPasswordError("Senha inválida");
            }
        }),
    };
});

describe("User", () => {
    it("should create a User instance", () => {
        const userData = {
            name: "Higor Teste",
            latitude: 100,
            longitude: 100,
            id : "A1001",
            email: "higortteste@gmail.com",
            password: "#SenhaValida123"
        };

        const user = User.create(
            userData.name,
            userData.latitude,
            userData.longitude,
            userData.id,
            userData.email,
            userData.password
        )

        expect(user).toBeInstanceOf(User);
        expect(user.name).toBe(userData.name);
        expect(user.location).toBeInstanceOf(GeoLocation)
        expect(user.location.latitude).toBe(userData.latitude)
        expect(user.location.longitude).toBe(userData.longitude)
        expect(user.id).toBe(userData.id);
        expect(user.email).toBeDefined()
        expect(user.email?.value).toBe(userData.email);
        expect(user.password).toBeDefined()
        expect(user.password?.value).toBe(userData.password);
    });

    it("should create user with undefined id, email and password", () => {
        const userData = {
            name: "Higor Teste",
            latitude: 100,
            longitude: 100,
        };

        const user = User.create(
            userData.name,
            userData.latitude,
            userData.longitude,
        )

        expect(user).toBeInstanceOf(User);
        expect(user.name).toBe(userData.name);
        expect(user.location).toBeInstanceOf(GeoLocation)
        expect(user.location.latitude).toBe(userData.latitude)
        expect(user.location.longitude).toBe(userData.longitude)
        expect(user.id).toBeUndefined()
        expect(user.password).toBeUndefined()
        expect(user.email).toBeUndefined()
    })
});
