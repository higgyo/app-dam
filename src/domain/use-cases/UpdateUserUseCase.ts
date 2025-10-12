import User from '../entities/User';
import { IUserRepository } from '../interfaces/iuser-repository';

export class UpdateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(params: {
    id: string;
    name?: string;
    email?: string;
    latitude?: number;
    longitude?: number;
  }): Promise<User> {
    const { id, name, email, latitude, longitude } = params;

    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new Error('Usuário não encontrado.');
    }

    const newLatitude = latitude ? latitude : user.location.latitude;
    const newLongitude = longitude ? longitude : user.location.longitude;
    const newName = name?.length ? name : user.name;
    const newEmail = email ? email : user.email.value;

    const updatedUser = User.create(newName, newLatitude, newLongitude, newEmail, id);

    await this.userRepository.update(updatedUser);

    return updatedUser;
  }
}