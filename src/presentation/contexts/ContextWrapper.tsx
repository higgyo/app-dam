import { ReactNode } from "react";
import { AuthContextProvider } from "./AuthContext";
import { NetworkContextProvider } from "./NetworkContext";

export function ContextWrapper({children}: { children: ReactNode }) {
    return (
        <NetworkContextProvider>
            <AuthContextProvider>
                {children}
            </AuthContextProvider>
        </NetworkContextProvider>
    )
}