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
