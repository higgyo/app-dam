import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";
import User from "../../domain/entities/User";
import { LoginUser } from "../../application/use-cases/LoginUseCase";
import { RegisterUserUseCase } from "../../application/use-cases/RegisterUseCase";
import { UpdateUserUseCase } from "../../application/use-cases/UpdateUserUseCase";
import { DeleteUserUseCase } from "../../application/use-cases/DeleteUserUseCase";
import { FindUserUseCase } from "../../application/use-cases/FindUserUseCase";
import { UserRepository } from "../../infrastructure/repositories/user-repository";
import { AxiosHttpClient } from "../../infrastructure/http/axios-http-client";
import { LogoutUser } from "../../application/use-cases/LogoutUserUseCase";
import { supabase } from "../../infrastructure/supabase";
import { VerifyAuthenticationUseCase } from "../../application/use-cases/VerifyAuthenticationUseCase";
import { CacheInitializer } from "../../infrastructure/factories/CacheInitializer";
import { CachedUserRepository, SQLiteDatabase } from "../../infrastructure/cache";
import { IUserRepository } from "../../domain/interfaces/iuser-repository";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthContextProvider({ children }: { children: ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLogged, setIsLogged] = useState(false);
    const [isCacheInitialized, setIsCacheInitialized] = useState(false);

    const httpClient = new AxiosHttpClient();

    // Inicializar repositório e use cases
    const remoteUserRepository = new UserRepository(httpClient);
    const [userRepository, setUserRepository] = useState<IUserRepository>(remoteUserRepository);

    // Initialize cache and update repository
    useEffect(() => {
        (async () => {
            try {
                await CacheInitializer.initialize();
                const sqliteDb = SQLiteDatabase.getInstance();
                const cachedRepo = new CachedUserRepository(remoteUserRepository, sqliteDb);
                setUserRepository(cachedRepo);
                setIsCacheInitialized(true);
            } catch (error) {
                console.error("Failed to initialize cache:", error);
                setIsCacheInitialized(true); // Continue without cache
            }
        })();
    }, []);

    const registerUseCase = new RegisterUserUseCase(userRepository);
    const loginUseCase = new LoginUser(userRepository);
    const logoutUseCase = new LogoutUser(userRepository);
    const updateUserUseCase = new UpdateUserUseCase(userRepository);
    const deleteUserUseCase = new DeleteUserUseCase(userRepository);
    const findUserUseCase = new FindUserUseCase(userRepository);
    const verifyAuthentication = new VerifyAuthenticationUseCase(
        userRepository
    );

    async function login(email: string, password: string): Promise<void> {
        try {
            const user = await loginUseCase.execute({ email, password });
            setCurrentUser(user);
            setIsLogged(true);
        } catch (error) {
            throw error;
        }
    }

    async function register(params: {
        name: string;
        email: string;
        password: string;
        latitude?: number;
        longitude?: number;
    }): Promise<User> {
        try {
            const user = await registerUseCase.execute(params);
            return user;
        } catch (error) {
            throw error;
        }
    }

    async function updateUser(params: {
        id: string;
        name?: string;
        email?: string;
        password?: string;
        latitude?: number;
        longitude?: number;
    }): Promise<User> {
        try {
            const user = await updateUserUseCase.execute(params);
            if (currentUser && currentUser.id === user.id) {
                setCurrentUser(user);
            }
            return user;
        } catch (error) {
            throw error;
        }
    }

    async function deleteUser(id: string): Promise<void> {
        try {
            await deleteUserUseCase.execute({ id });
            if (currentUser && currentUser.id === id) {
                logout();
            }
        } catch (error) {
            throw error;
        }
    }

    async function findUser(id: string): Promise<User | null> {
        try {
            return await findUserUseCase.execute({ id });
        } catch (error) {
            throw error;
        }
    }

    function logout() {
        try {
            logoutUseCase.execute();
            setCurrentUser(null);
            setIsLogged(false);
        } catch (error) {
            throw error;
        }
    }

    useEffect(() => {
        if (!isCacheInitialized) return;
        
        (async () => {
            const user = await verifyAuthentication.execute();

            if (user) {
                setCurrentUser(user);
                setIsLogged(true);
            }
        })();
    }, [isCacheInitialized]);

    return (
        <AuthContext.Provider
            value={{
                currentUser,
                isLogged,
                login,
                register,
                updateUser,
                deleteUser,
                findUser,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error(
            "useAuthContext must be used within AuthContextProvider"
        );
    }
    return context;
}

type AuthContextType = {
    currentUser: User | null;
    isLogged: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (params: {
        name: string;
        email: string;
        password: string;
        latitude?: number;
        longitude?: number;
    }) => Promise<User>;
    updateUser: (params: {
        id: string;
        name?: string;
        email?: string;
        password?: string;
        latitude?: number;
        longitude?: number;
    }) => Promise<User>;
    deleteUser: (id: string) => Promise<void>;
    findUser: (id: string) => Promise<User | null>;
    logout: () => void;
};
