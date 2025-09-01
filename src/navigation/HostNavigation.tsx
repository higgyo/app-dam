import { createStaticNavigation, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/home/HomeScreen';
import { LoginScreen } from '../screens/login/LoginScreen';

type HostNavigationProps = {
    isLogged: boolean
}

export function HostNavigation({ isLogged }: HostNavigationProps) {
    const Routes = isLogged ? ProtectedNavigator : PublicNavigator

    return <NavigationContainer>
        <Routes />
    </NavigationContainer>
}

const PublicStack = createNativeStackNavigator({
    initialRouteName: 'login',
    screens: {
        'login': LoginScreen
    }
})

const PublicNavigator = createStaticNavigation(PublicStack)

const ProtectedStack = createNativeStackNavigator({
    initialRouteName: 'home',
    screens: {
        'home': HomeScreen
    }
})

const ProtectedNavigator = createStaticNavigation(ProtectedStack)