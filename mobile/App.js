import { LogBox, StatusBar, StyleSheet, Text, View } from "react-native";
import { Toaster } from "sonner-native";
import { enableScreens } from "react-native-screens";
enableScreens();
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AppRouters from "./src/navigators/AppRouters";
import store from "./src/redux/store";
import { Provider } from "react-redux";
import { LocationProvider } from "./src/context/LocationContext";
import { ShopProvider } from "./src/context/ShopContext";
import { AnalyticsProvider } from "./src/context/AnalyticsProvider";
import "react-native-reanimated";
import Toast from "react-native-toast-message";

LogBox.ignoreLogs([
  "expo-notifications: Android Push notifications (remote notifications) functionality provided by expo-notifications was removed from Expo Go",
]);

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <Provider store={store}>
        <SafeAreaProvider style={styles.container}>
          <Toaster />
          <AnalyticsProvider>
            <ShopProvider>
              <LocationProvider>
                <NavigationContainer>
                  <AppRouters />
                </NavigationContainer>
              </LocationProvider>
            </ShopProvider>
          </AnalyticsProvider>
          <Toast visibilityTime={3000} />
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
