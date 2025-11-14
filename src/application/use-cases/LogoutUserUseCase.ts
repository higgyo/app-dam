import { IUserRepository } from "../../domain/interfaces/iuser-repository";

export class LogoutUser {
    constructor(private readonly userRepository: IUserRepository) {}

    async execute(): Promise<void> {
        await this.userRepository.logout();
    }
}
