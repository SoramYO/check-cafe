import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Toaster } from 'sonner-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import DiscoverScreen from "./screens/DiscoverScreen";
import MapScreen from "./screens/MapScreen";
import ProfileScreen from "./screens/ProfileScreen";
import BookingsScreen from "./screens/BookingsScreen";
import CafeDetailScreen from './screens/CafeDetailScreen';
import BookingScreen from './screens/BookingScreen';
import CheckinCameraScreen from './screens/CheckinCameraScreen';
import FeaturedDetailScreen from './screens/FeaturedDetailScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import { useEffect, useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Discover') {
            iconName = focused ? 'coffee' : 'coffee-outline';
          } else if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Bookings') {
            iconName = focused ? 'calendar-check' : 'calendar-check-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'account' : 'account-outline';
          }

          return <MaterialCommunityIcons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF6B6B',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          paddingBottom: 5,
          height: 60,
          backgroundColor: 'white',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          paddingBottom: 5,
        },
      })}
    >
      <Tab.Screen name="Discover" component={DiscoverScreen} options={{ title: 'Khám phá' }} />
      <Tab.Screen name="Map" component={MapScreen} options={{ title: 'Bản đồ' }} />
      <Tab.Screen name="Bookings" component={BookingsScreen} options={{ title: 'Đặt chỗ' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Cá nhân' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);
  const [fontsLoaded] = useFonts({
    'Poppins_400Regular': require('@expo-google-fonts/poppins/Poppins_400Regular.ttf'),
    'Poppins_500Medium': require('@expo-google-fonts/poppins/Poppins_500Medium.ttf'),
    'Poppins_600SemiBold': require('@expo-google-fonts/poppins/Poppins_600SemiBold.ttf'),
    'Poppins_700Bold': require('@expo-google-fonts/poppins/Poppins_700Bold.ttf'),
  });

  useEffect(() => {
    async function checkOnboardingStatus() {
      try {
        const value = await AsyncStorage.getItem('hasSeenOnboarding');
        setHasSeenOnboarding(value === 'true');
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setHasSeenOnboarding(false);
      }
    }

    checkOnboardingStatus();
  }, []);

  useEffect(() => {
    if (fontsLoaded && hasSeenOnboarding !== null) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, hasSeenOnboarding]);

  if (!fontsLoaded || hasSeenOnboarding === null) {
    return null;
  }

  return (
    <ThemeProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider style={styles.container}>
          <Toaster />
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: 'white' },
                animation: 'fade_from_bottom',
              }}
              initialRouteName={hasSeenOnboarding ? 'Welcome' : 'Onboarding'}
            >
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
              <Stack.Screen name="Welcome" component={HomeScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="MainApp" component={MainTabs} />
              <Stack.Screen 
                name="CafeDetail" 
                component={CafeDetailScreen}
                options={{
                  animation: 'slide_from_right',
                }}
              />
              <Stack.Screen 
                name="Booking" 
                component={BookingScreen}
                options={{
                  presentation: 'modal',
                  animation: 'slide_from_bottom',
                }}
              />
              <Stack.Screen 
                name="CheckinCamera" 
                component={CheckinCameraScreen}
                options={{
                  presentation: 'fullScreenModal',
                  animation: 'fade',
                }}
              />
              <Stack.Screen 
                name="FeaturedDetail" 
                component={FeaturedDetailScreen}
                options={{
                  animation: 'slide_from_right',
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});