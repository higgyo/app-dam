import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen } from "../screens/home/HomeScreen";
import { LoginScreen } from "../screens/login/LoginScreen";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { useAuthContext } from "../contexts/AuthContext";

export function HostNavigation() {
    const auth = useAuthContext();

    return (
        <NavigationContainer>
            {auth?.isLogged ? <ProtectedRoutes /> : <PublicRoutes />}
        </NavigationContainer>
    );
}

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function PublicRoutes() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
    );
}

function ProtectedRoutes() {
    return (
        <Drawer.Navigator>
            <Drawer.Screen name="Home" component={HomeScreen} />
        </Drawer.Navigator>
    );
}
