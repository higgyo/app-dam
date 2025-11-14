import { useEffect } from "react";
import { useAuthContext } from "../../contexts/AuthContext";

export function LogoutScreen() {
    const auth = useAuthContext();

    useEffect(() => {
        auth.logout();
    }, []);

    return null;
}
