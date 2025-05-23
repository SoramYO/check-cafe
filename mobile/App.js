import { StyleSheet, Text, View } from "react-native";
import { Toaster } from "sonner-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from "expo-font";
import AppRouters from "./src/navigators/AppRouters";
import store from "./src/redux/store";
import { Provider } from "react-redux";
import { StatusBar } from "expo-status-bar";
import { LocationProvider, useLocation } from "./src/context/LocationContext";

export default function App() {
  const [isLoaded] = useFonts({
    MaterialCommunityIcons: require("@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf"),
  });

  if (!isLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <Provider store={store}>
        <SafeAreaProvider style={styles.container}>
          <Toaster />
          <LocationProvider>
            <NavigationContainer>
              <AppRouters />
            </NavigationContainer>
          </LocationProvider>
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
