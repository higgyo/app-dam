import { IUserRepository } from "../../domain/interfaces/iuser-repository";
import { AxiosHttpClient } from "../http/axios-http-client";
import { CachedUserRepository } from "../repositories/cached/CachedUserRepository";
import { UserRepository } from "../repositories/user-repository";

export class UserServiceFactory {
    private static httpClient = new AxiosHttpClient();
    private static remoteRepository = new UserRepository(this.httpClient);
    private static cachedRepository: CachedUserRepository | null = null;

    static getUserRepository(): IUserRepository {
        if (!this.cachedRepository) {
            this.cachedRepository = new CachedUserRepository(
                this.remoteRepository
            );
        }
        return this.cachedRepository;
    }

    static create() {}
}
