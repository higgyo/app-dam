import User from "../entities/User";
import Email from "../value-objects/Email";
import Password from "../value-objects/Password";

export interface IUserRepository {
    login(email: Email, password: Password): Promise<User | null>;
    register(username: string, email: Email, password: Password): Promise<User>;
    logout(): Promise<void>;
    findById(id: string): Promise<User | null>;
    update(user: User): Promise<void>;
}
