import User from "../entities/User";
import Email from "../value-objects/Email";
import Password from "../value-objects/Password";

export interface IUserRepository {
    login(email: Email, password: Password): Promise<User | null>;
    register(username: string, email: Email, password: Password): Promise<User>;
    logout(): Promise<void>;
    delete(id: string): Promise<void>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    save(user: User): Promise<void>;
    update(user: User): Promise<void>;
}
