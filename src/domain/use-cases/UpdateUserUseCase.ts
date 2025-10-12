import User from '../entities/User';
import { IUserRepository } from '../interfaces/iuser-repository';

export class UpdateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(params: {
    id: string;
    name?: string;
    email?: string;
    password?: string;
    latitude?: number;
    longitude?: number;
  }): Promise<User> {
    const { id, name, email, password, latitude, longitude } = params;

    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new Error('Usuário não encontrado.');
    }

    const newLatitude = latitude !== undefined ? latitude : user.location?.latitude;
    const newLongitude = longitude !== undefined ? longitude : user.location?.longitude;
    const newName = name?.length ? name : user.name;
    const newEmail = email ? email : user.email.value;
    const newPassword = password ? password : user.password.value;

    const updatedUser = User.create({ 
      name: newName, 
      latitude: newLatitude, 
      longitude: newLongitude, 
      email: newEmail,
      password: newPassword,
      id 
    });

    await this.userRepository.update(updatedUser);

    return updatedUser;
  }
}