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
                .select("name, last_latitude, last_longitude, location_updated_at, avatar_url")
                .eq("user_id", userId)
                .single();

            if (profileError)
                throw new Error(
                    `Falha ao fazer login: ${profileError.message}`
                );

            console.log(profile)

            return User.create({
                id: data.user.id,
                name: profile.name,
                email: email.value,
                password: password.value,
                latitude: profile.last_latitude ? profile.last_latitude : 0,
                longitude: profile.last_longitude ? profile.last_longitude : 0
            });
        } catch (error) {
            throw error;
        }
    }

    async verifyAuthentication(): Promise<User> {
        try {
            const { data, error } = await supabase.auth.getUser();

            if (error) throw new Error(`Usuário não está autenticado`);

            const userId = data.user.id;

            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("name, last_latitude, last_longitude, location_updated_at, avatar_url")
                .eq("user_id", userId)
                .single();

            if (profileError)
                throw new Error(
                    `Falha ao recuperar usuário: ${profileError.message}`
                );

            return User.create({
                id: data.user.id,
                name: profile.name,
                email: data.user.email!,
                password: "Senha#123",
                latitude: profile.last_latitude ? profile.last_latitude : 0,
                longitude: profile.last_longitude ? profile.last_longitude : 0,
                avatar_url: profile.avatar_url ? profile.avatar_url : ""
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
