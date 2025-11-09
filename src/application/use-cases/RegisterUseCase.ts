import User from "../../domain/entities/User";
import { IUserRepository } from "../../domain/interfaces/iuser-repository";
import * as Crypto from "expo-crypto";
import Email from "../../domain/value-objects/Email";
import Password from "../../domain/value-objects/Password";

export class RegisterUserUseCase {
    constructor(private readonly userRepository: IUserRepository) {}

    async execute(params: {
        name: string;
        email: string;
        password: string;
        latitude?: number;
        longitude?: number;
    }): Promise<User> {
        const { name, email, password, latitude, longitude } = params;

        return this.userRepository.register(
            name,
            Email.create(email),
            Password.create(password)
        );
    }

    private async hashPassword(password: string): Promise<string> {
        return `hashed_${password}`;
    }
}
