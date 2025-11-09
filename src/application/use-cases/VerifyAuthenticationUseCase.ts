import User from "../../domain/entities/User";
import { IUserRepository } from "../../domain/interfaces/iuser-repository";

export class VerifyAuthenticationUseCase {
    constructor(private readonly userRepository: IUserRepository) {}

    async execute(): Promise<User | null> {
        try {
            return await this.userRepository.verifyAuthentication();
        } catch (error) {
            return null;
        }
    }
}
