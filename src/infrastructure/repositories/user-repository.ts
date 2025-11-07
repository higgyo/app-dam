import User from "../../domain/entities/User";
import { IUserRepository } from "../../domain/interfaces/iuser-repository";
import Email from "../../domain/value-objects/Email";
import Password from "../../domain/value-objects/Password";
import { IHttpClient } from "../interfaces/ihttp-client";
import { supabase } from "../supabase";

export class UserRepository implements IUserRepository {
    constructor(readonly httpClient: IHttpClient) {}

    async login(email: Email, password: Password): Promise<User | null> {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.value,
            password: password.value,
        });

        if (error) throw new Error(`Falha ao fazer login: ${error.message}`)
        
        return User.create({ id: data.user.id, name: "macaco", email: email.value, password: password.value})
    }

    async register(
        username: string,
        email: Email,
        password: Password
    ): Promise<User> {
        const { data, error } = await supabase.auth.signUp({
            email: email.value,
            password: password.value,
            options: {
                data: {
                    name: username
                }
            }
        });

        if (error) throw new Error(`Falha ao registrar usuário: ${error.message}`);
        
        return User.create({name: username, email: email.value, password: password.value})
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
