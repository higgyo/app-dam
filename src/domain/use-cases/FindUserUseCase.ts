import User from "../entities/User";
import { IUserRepository } from "../interfaces/iuser-repository";

export class FindUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(params: { id: string }): Promise<User | null> {
    return this.userRepository.findById(params.id);
  }
}