import User from "../../domain/entities/User";
import { IUserRepository } from "../../domain/interfaces/iuser-repository";
import Email from "../../domain/value-objects/Email";
import Password from "../../domain/value-objects/Password";
import { IHttpClient } from "../interfaces/ihttp-client";

export class UserRepository implements IUserRepository {
    constructor(readonly httpClient: IHttpClient) {}

    async login(email: Email, password: Password): Promise<User | null> {
        return User.create("João", 100, 100);
    }

    async register(
        username: string,
        email: Email,
        password: Password
    ): Promise<User> {
        return User.create("João", 100, 100);
    }

    async logout(): Promise<void> {}

    delete(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    findById(id: string): Promise<User | null> {
        throw new Error("Method not implemented.");
    }

    findByEmail(email: string): Promise<User | null> {
        throw new Error("Method not implemented.");
    }

    save(user: User): Promise<void> {
        throw new Error("Method not implemented.");
    }

    update(user: User): Promise<void> {
        throw new Error("Method not implemented.");
    }
}
