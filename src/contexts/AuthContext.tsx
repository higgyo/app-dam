import { createContext, ReactNode, useContext, useState } from "react";

export function AuthContextProvider({ children }: { children: ReactNode }) {
    const [isLogged, setIsLogged] = useState(true);

    return (
        <AuthContext
            value={{
                isLogged,
            }}
        >
            {children}
        </AuthContext>
    );
}

export function useAuthContext() {
    return useContext(AuthContext);
}

const AuthContext = createContext<AuthContextType | null>(null);

type AuthContextType = {
    isLogged: boolean;
};
