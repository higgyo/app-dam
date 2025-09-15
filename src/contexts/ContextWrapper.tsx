import { ReactNode } from "react";
import { AuthContextProvider } from "./AuthContext";

export function ContextWrapper({children}: { children: ReactNode }) {
    return (
        <AuthContextProvider>
            {children}
        </AuthContextProvider>
    )
}