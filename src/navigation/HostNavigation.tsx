import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/home/HomeScreen';
import { LoginScreen } from '../screens/login/LoginScreen';

const Stack = createNativeStackNavigator()

export function HostNavigation() {
    const isLogged = true

    return <NavigationContainer>
        <Stack.Navigator>
            {isLogged ? <ProtectedRoutes /> : <PublicRoutes />}
        </Stack.Navigator>
    </NavigationContainer>
}

function PublicRoutes() {
    return <><Stack.Screen name='Login' component={LoginScreen} /></>
}

function ProtectedRoutes() {
    return <><Stack.Screen name='Home' component={HomeScreen} /></>
}