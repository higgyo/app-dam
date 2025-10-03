import Chat from "../entities/Chat";
import Message from "../entities/Message";
import Password from "../value-objects/Password";

export interface IChatRepository {
  createChat(name: string, password: Password, idUser: string): Promise<Chat>
  sendMessage(message: string, idUser: string): Promise<Message>
  enterChat(id: string, password: Password): Promise<Chat>
  getChatsList(idUser: string): Promise<Chat[]>
}