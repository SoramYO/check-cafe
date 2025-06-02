import { StyleSheet, Text, View } from "react-native";
import { Toaster } from "sonner-native";
import { enableScreens } from "react-native-screens";
enableScreens();
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AppRouters from "./src/navigators/AppRouters";
import store from "./src/redux/store";
import { Provider } from "react-redux";
import { StatusBar } from "expo-status-bar";
import { LocationProvider } from "./src/context/LocationContext";
import { ShopProvider } from "./src/context/ShopContext";
import "react-native-reanimated";

export default function App() {

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <Provider store={store}>
        <SafeAreaProvider style={styles.container}>
          <Toaster />
          <ShopProvider>
            <LocationProvider>
              <NavigationContainer>
                <AppRouters />
              </NavigationContainer>
            </LocationProvider>
          </ShopProvider>
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
