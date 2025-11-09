import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen } from "../screens/home/HomeScreen";
import { LoginScreen } from "../screens/login/LoginScreen";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { useAuthContext } from "../contexts/AuthContext";
import { ChatListScreen } from "../screens/chat_list/ChatListScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { GroupsListScreen } from "../screens/groups_list/GroupsListScreen";
import ChatScreen from "../screens/chat/ChatScreen";
import { RegisterScreen } from "../screens/register/RegisterScreen";
import { CreateRoom } from "../screens/createroom/CreateRoom";
import { EnterRoom } from "../screens/enterroom/EnterRoom";
import { RootStackParamList } from "./types";
import { ChatCamera } from "../screens/chat_camera/ChatCamera";

export function HostNavigation() {
    const auth = useAuthContext();

    return (
        <NavigationContainer>
            {auth?.isLogged ? <ProtectedRoutes /> : <PublicRoutes />}
        </NavigationContainer>
    );
}

const Stack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator();
const BottomTab = createBottomTabNavigator();

function PublicRoutes() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Register"
                component={RegisterScreen}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
}

function ProtectedRoutes() {
    return (
        <Drawer.Navigator initialRouteName="ChatTabs">
            <Drawer.Screen
                name="ChatTabs"
                component={ChatBottomTabs}
                options={{ title: "Conversas" }}
            />
            <Drawer.Screen
                name="Conversation"
                component={ChatScreen}
                options={{ title: "Conversa" }}
            />
            <Drawer.Screen
                name="CreateRoom"
                component={CreateRoom}
                options={{ title: "Criar Sala" }}
            />
            <Drawer.Screen
                name="EnterRoom"
                component={EnterRoom}
                options={{ title: "Adentrar Sala" }}
            />
            <Drawer.Screen 
                name="Camera"
                component={ChatCamera}
                options={{ title: "Usar Câmera" }}
            />
        </Drawer.Navigator>
    );
}

function ChatBottomTabs() {
    return (
        <BottomTab.Navigator screenOptions={{ headerShown: false }}>
            <BottomTab.Screen
                name="Chats"
                component={ChatListScreen}
                options={{
                    tabBarLabel: "Chats",
                }}
            />
            <BottomTab.Screen
                name="Groups"
                component={GroupsListScreen}
                options={{
                    tabBarLabel: "Grupos de Localização",
                }}
            />
        </BottomTab.Navigator>
    );
}
