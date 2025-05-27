import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CafeDetailScreen from "../../screens/CafeDetailScreen";
import BookingScreen from "../../screens/BookingScreen";
import EditProfileScreen from "../../screens/EditProfileScreen";
import NotificationsScreen from "../../screens/NotificationsScreen";
import VoucherScreen from "../../screens/VoucherScreen";
import FavoritesScreen from "../../screens/FavoritesScreen";
import LanguageScreen from "../../screens/LanguageScreen";
import CheckinCameraScreen from "../../screens/CheckinCameraScreen";
import FeaturedDetailScreen from "../../screens/FeaturedDetailScreen";
import BookingDetailScreen from "../../screens/BookingDetailScreen";
import DefaultLocationScreen from "../../screens/DefaultLocationScreen";
import ThemeScreen from "../../screens/ThemeScreen";
import PremiumScreen from "../../screens/PremiumScreen";
import TabNavigatorCustomer from "./TabNavigatorCustomer";

const MainNavigatorCustomer = () => {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "white" },
        animation: "fade_from_bottom",
      }}
    >
      <Stack.Screen name="TabNavigatorCustomer" component={TabNavigatorCustomer} />
      <Stack.Screen name="CafeDetail" component={CafeDetailScreen} />
      <Stack.Screen name="Booking" component={BookingScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Theme" component={ThemeScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="DefaultLocation" component={DefaultLocationScreen} />
      <Stack.Screen name="Vouchers" component={VoucherScreen} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
      <Stack.Screen name="Language" component={LanguageScreen} />
      <Stack.Screen name="CheckinCamera" component={CheckinCameraScreen} />
      <Stack.Screen name="FeaturedDetail" component={FeaturedDetailScreen} />
      <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
      <Stack.Screen name="Premium" component={PremiumScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigatorCustomer;
