import { ContextWrapper } from "./src/contexts/ContextWrapper";
import { HostNavigation } from "./src/navigation/HostNavigation";

export default function App() {
    return (
        <ContextWrapper>
            <HostNavigation />
        </ContextWrapper>
    );
}
