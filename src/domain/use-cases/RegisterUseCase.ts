import User from "../entities/User";
import { IUserRepository } from "../interfaces/iuser-repository";

export class RegisterUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(params: {
    name: string;
    email: string;
    password: string;
    latitude: number;
    longitude: number;
  }): Promise<User> {
    const { name, email, password, latitude, longitude } = params;

    if (!name.length)
        throw new Error('Nome precisa ser preenchido!');

    const userExists = await this.userRepository.findByEmail(email);
    
    if (userExists) {
      throw new Error('Usuário já existe!');
    }

    const hashedPassword = await this.hashPassword(password);

    const user = User.create(name, latitude, longitude, email, hashedPassword, crypto.randomUUID());

    await this.userRepository.save(user);

    return user;
  }

  private async hashPassword(password: string): Promise<string> {
    return `hashed_${password}`;
  }
}