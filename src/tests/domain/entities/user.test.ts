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
            id: "A1001",
            email: "higortteste@gmail.com",
            password: "#SenhaValida123",
        };

        const user = User.create({
            name: userData.name,
            latitude: userData.latitude,
            longitude: userData.longitude,
            id: userData.id,
            email: userData.email,
            password: userData.password,
        });

        expect(user).toBeInstanceOf(User);
        expect(user.name).toBe(userData.name);
        expect(user.location).toBeInstanceOf(GeoLocation);
        expect(user.location?.latitude).toBe(userData.latitude);
        expect(user.location?.longitude).toBe(userData.longitude);
        expect(user.id).toBe(userData.id);
        expect(user.email).toBeDefined();
        expect(user.email?.value).toBe(userData.email);
        expect(user.password).toBeDefined();
        expect(user.password?.value).toBe(userData.password);
    });

    it("should create user without location", () => {
        const userData = {
            name: "Higor Teste",
            email: "higor@test.com",
            password: "#SenhaValida123",
            id: "A1002",
        };

        const user = User.create({
            name: userData.name,
            email: userData.email,
            password: userData.password,
            id: userData.id,
        });

        expect(user).toBeInstanceOf(User);
        expect(user.name).toBe(userData.name);
        expect(user.location).toBeUndefined();
        expect(user.id).toBe(userData.id);
        expect(user.email).toBeDefined();
        expect(user.email?.value).toBe(userData.email);
        expect(user.password).toBeDefined();
        expect(user.password?.value).toBe(userData.password);
    });
});
