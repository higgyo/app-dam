import { createStaticNavigation, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CreateRoom } from '../screens/createroom/CreateRoom';
import { HomeScreen } from '../screens/home/HomeScreen';
import { LoginScreen } from '../screens/login/LoginScreen';
import { RegisterScreen } from '../screens/register/RegisterScreen';
import { EnterRoom } from '../screens/enterroom/EnterRoom';

const Stack = createNativeStackNavigator()

export function HostNavigation() {
    const isLogged = true

    return <NavigationContainer>
        <Stack.Navigator initialRouteName='CreateRoom'>
            <Stack.Screen name='Login' component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name='Register' component={RegisterScreen} options={{ headerShown: false }} />
            <Stack.Screen name='Home' component={HomeScreen} />
            <Stack.Screen name='CreateRoom' component={CreateRoom} />
            <Stack.Screen name='EnterRoom' component={EnterRoom} />
        </Stack.Navigator>
    </NavigationContainer>
}