import User from "../../domain/entities/User";
import { IUserRepository } from "../../domain/interfaces/iuser-repository";
import Email from "../../domain/value-objects/Email";
import Password from "../../domain/value-objects/Password";
import { IHttpClient } from "../interfaces/ihttp-client";
import { supabase } from "../supabase";

export class UserRepository implements IUserRepository {
    constructor(readonly httpClient: IHttpClient) {}

    async login(email: Email, password: Password): Promise<User> {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.value,
                password: password.value,
            });

            if (error)
                throw new Error(`Falha ao fazer login: ${error.message}`);

            const userId = data.user.id;

            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("name")
                .eq("user_id", userId)
                .single();

            if (profileError)
                throw new Error(
                    `Falha ao fazer login: ${profileError.message}`
                );

            return User.create({
                id: data.user.id,
                name: profile.name,
                email: email.value,
                password: password.value,
            });
        } catch (error) {
            throw error;
        }
    }

    async register(
        username: string,
        email: Email,
        password: Password
    ): Promise<User> {
        try {
            const { error } = await supabase.functions.invoke("register-user", {
                body: {
                    name: username,
                    email: email.value,
                    password: password.value,
                },
            });

            if (error) {
                const errorBody = await error.context.json();
                throw new Error(
                    `Falha ao registrar usuário: ${errorBody.error}`
                );
            }

            return User.create({
                name: username,
                email: email.value,
                password: password.value,
            });
        } catch (error) {
            throw error;
        }
    }

    async logout(): Promise<void> {
        try {
            const { error } = await supabase.auth.signOut();

            if (error)
                throw new Error(`Falha ao deslogar usuário: ${error.message}`);
        } catch (error) {
            throw error;
        }
    }

    findById(id: string): Promise<User | null> {
        throw new Error("Method not implemented.");
    }

    update(user: User): Promise<void> {
        throw new Error("Method not implemented.");
    }
}
