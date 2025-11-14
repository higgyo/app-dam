import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
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
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { RootStackParamList } from "./types";
import { LogoutScreen } from "../screens/logout/LogoutScreen";

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
const ChatStack = createNativeStackNavigator();

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

function ChatBottomTabs() {
    return (
        <BottomTab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#007AFF",
                tabBarInactiveTintColor: "#999",
            }}
        >
            <BottomTab.Screen
                name="Groups"
                component={GroupsListScreen}
                options={{
                    tabBarLabel: "Grupos",
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons
                            name="groups"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
        </BottomTab.Navigator>
    );
}

function ChatStackNavigator() {
    return (
        <ChatStack.Navigator screenOptions={{ headerShown: false }}>
            <ChatStack.Screen name="ChatTabs" component={ChatBottomTabs} />
            <ChatStack.Screen name="Conversation" component={ChatScreen} />
        </ChatStack.Navigator>
    );
}

function ProtectedRoutes() {
    const auth = useAuthContext();

    return (
        <Drawer.Navigator
            initialRouteName="ChatArea"
            screenOptions={{
                drawerActiveTintColor: "#007AFF",
                drawerInactiveTintColor: "#444",
            }}
        >
            <Drawer.Screen
                name="ChatArea"
                component={ChatStackNavigator}
                options={{
                    title: "Conversas",
                    drawerIcon: ({ color, size }) => (
                        <MaterialIcons
                            name="chat-bubble"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />

            <Drawer.Screen
                name="CreateRoom"
                component={CreateRoom}
                options={{
                    title: "Criar Sala",
                    drawerIcon: ({ color, size }) => (
                        <MaterialIcons
                            name="add-circle-outline"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />

            <Drawer.Screen
                name="EnterRoom"
                component={EnterRoom}
                options={{
                    title: "Adentrar Sala",
                    drawerIcon: ({ color, size }) => (
                        <MaterialIcons name="login" size={size} color={color} />
                    ),
                }}
            />

            <Drawer.Screen
                name="Logout"
                component={LogoutScreen}
                options={{
                    title: "Sair",
                    drawerIcon: ({ color, size }) => (
                        <MaterialIcons
                            name="logout"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
        </Drawer.Navigator>
    );
}
