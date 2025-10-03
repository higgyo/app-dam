import User from "../../domain/entities/User";
import { IUserRepository } from "../../domain/interfaces/iuser-repository";
import Email from "../../domain/value-objects/Email";
import Password from "../../domain/value-objects/Password";
import { IHttpClient } from "../interfaces/ihttp-client";

export class UserRepository implements IUserRepository {
    constructor(readonly httpClient: IHttpClient) {}

    async login(email: Email, password: Password): Promise<User> {
        return User.create("João", 100, 100)
    }

    async register(username: string, email: Email, password: Password): Promise<User> {
        return User.create("João", 100, 100)
    }

    async logout(): Promise<void> {}
}