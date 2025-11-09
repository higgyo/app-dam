import User from "../../domain/entities/User";
import { IUserRepository } from "../../domain/interfaces/iuser-repository";
import Email from "../../domain/value-objects/Email";
import Password from "../../domain/value-objects/Password";

export class LoginUser {
    constructor(private readonly userRepository: IUserRepository) {}

    async execute(params: { email: string; password: string }): Promise<User> {
        const { email, password } = params;

        const user = await this.userRepository.login(
            Email.create(email),
            Password.create(password)
        );

        return user;
    }

    private async comparePassword(
        password: string,
        hashedPassword: string
    ): Promise<boolean> {
        return `hashed_${password}` === hashedPassword;
    }
}
