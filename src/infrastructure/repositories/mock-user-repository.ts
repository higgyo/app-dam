import User from "../../domain/entities/User";
import { IUserRepository } from "../../domain/interfaces/iuser-repository";
import Email from "../../domain/value-objects/Email";
import Password from "../../domain/value-objects/Password";
import { FakeDatabase } from "../../fake-database/fake-database";
import { IHttpClient } from "../interfaces/ihttp-client";

export class MockUserRepository implements IUserRepository {
    constructor(readonly httpClient?: IHttpClient) {}

    private readonly database = FakeDatabase.getInstance();

    async login(email: Email, password: Password): Promise<User | null> {
        const user = this.database.users.find(
            (x) => x.email.value === email.value && x.password.value === password.value
        );

        return user || null;
    }

    async register(
        username: string,
        email: Email,
        password: Password
    ): Promise<User> {
        const user = User.create({ name: username, email: email.value, password: password.value });
        this.database.users.push(user);
        return user;
    }

    async logout(): Promise<void> {
        // Implementação simples de logout - não faz nada no mock
    }

    async delete(id: string): Promise<void> {
        const index = this.database.users.findIndex((user) => user.id === id);
        if (index === -1) {
            throw new Error('Usuário não encontrado.');
        }
        this.database.users.splice(index, 1);
    }

    async findById(id: string): Promise<User | null> {
        const user = this.database.users.find((user) => user.id === id);
        return user || null;
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = this.database.users.find((user) => user.email.value === email);
        return user || null;
    }

    async save(user: User): Promise<void> {
        this.database.users.push(user);
    }

    async update(user: User): Promise<void> {
        const index = this.database.users.findIndex((u) => u.id === user.id);
        if (index === -1) {
            throw new Error('Usuário não encontrado.');
        }
        this.database.users[index] = user;
    }
}
