import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen } from "../screens/home/HomeScreen";
import { LoginScreen } from "../screens/login/LoginScreen";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { useAuthContext } from "../contexts/AuthContext";
import { ChatListScreen } from "../screens/chat_list/ChatListScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

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
const BottomTab = createBottomTabNavigator();

function PublicRoutes() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
    );
}

// Opção 1: Bottom Tab dentro do Drawer (Recomendado)
function ProtectedRoutes() {
    return (
        <Drawer.Navigator initialRouteName="ChatTabs">
            <Drawer.Screen name="Home" component={HomeScreen} />
            <Drawer.Screen
                name="ChatTabs"
                component={ChatBottomTabs}
                options={{ title: "Conversas" }}
            />
        </Drawer.Navigator>
    );
}

function ChatBottomTabs() {
    return (
        <BottomTab.Navigator>
            <BottomTab.Screen
                name="Chats"
                component={ChatListScreen}
                options={{
                    tabBarLabel: "Chats",
                    // Adicione ícones aqui se necessário
                }}
            />
            <BottomTab.Screen
                name="Groups"
                component={ChatListScreen}
                options={{
                    tabBarLabel: "Grupos",
                    // Adicione ícones aqui se necessário
                }}
            />
        </BottomTab.Navigator>
    );
}
