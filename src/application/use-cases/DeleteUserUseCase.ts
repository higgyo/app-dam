import { IUserRepository } from "../../domain/interfaces/iuser-repository";

export class DeleteUserUseCase {
    constructor(private readonly userRepository: IUserRepository) {}

    async execute(params: { id: string }): Promise<void> {
        const { id } = params;

        const user = await this.userRepository.findById(id);

        if (!user) {
            throw new Error("Usuário não encontrado.");
        }

        await this.userRepository.delete(id);
    }
}
