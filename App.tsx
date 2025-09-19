import { ContextWrapper } from "./src/presentation/contexts/ContextWrapper";
import { HostNavigation } from "./src/presentation/navigation/HostNavigation";

export default function App() {
    return (
        <ContextWrapper>
            <HostNavigation />
        </ContextWrapper>
    );
}
