import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CafeDetailScreen from "../../screens/CafeDetailScreen";
import BookingScreen from "../../screens/BookingScreen";
import EditProfileScreen from "../../screens/EditProfileScreen";
import VoucherScreen from "../../screens/VoucherScreen";
import FavoritesScreen from "../../screens/FavoritesScreen";
import CheckinCameraScreen from "../../screens/CheckinCameraScreen";
import FeaturedDetailScreen from "../../screens/FeaturedDetailScreen";
import BookingDetailScreen from "../../screens/BookingDetailScreen";
import DefaultLocationScreen from "../../screens/DefaultLocationScreen";
import ThemeScreen from "../../screens/ThemeScreen";
import PremiumScreen from "../../screens/PremiumScreen";
import AddAddressScreen from "../../screens/AddAddressScreen";
import TabNavigatorCustomer from "./TabNavigatorCustomer";
import PaymentHistoryScreen from "../../screens/PaymentHistoryScreen";
import MenuItemDetailScreen from "../../screens/MenuItemDetailScreen";
import TermsAndPrivacyScreen from "../../screens/TermsAndPrivacyScreen";
import NotificationScreen from "../../screens/NotificationScreen";
// Checkin related screens
import CheckinListScreen from "../../screens/CheckinListScreen";
import CheckinMapScreen from "../../screens/CheckinMapScreen";
import FriendsScreen from "../../screens/FriendsScreen";
import ImageViewerScreen from "../../screens/ImageViewerScreen";

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
      <Stack.Screen name="DefaultLocation" component={DefaultLocationScreen} />
      <Stack.Screen name="AddAddress" component={AddAddressScreen} />
      <Stack.Screen name="Vouchers" component={VoucherScreen} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
      <Stack.Screen name="CheckinCamera" component={CheckinCameraScreen} />
      <Stack.Screen name="FeaturedDetail" component={FeaturedDetailScreen} />
      <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
      <Stack.Screen name="Premium" component={PremiumScreen} />
      <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} />
      <Stack.Screen name="MenuItemDetail" component={MenuItemDetailScreen} />
      <Stack.Screen name="TermsAndPrivacy" component={TermsAndPrivacyScreen} />
      <Stack.Screen name="Notifications" component={NotificationScreen} />
      {/* Checkin related screens */}
      <Stack.Screen name="CheckinList" component={CheckinListScreen} />
      <Stack.Screen name="CheckinMap" component={CheckinMapScreen} />
      <Stack.Screen name="Friends" component={FriendsScreen} />
      <Stack.Screen 
        name="ImageViewer" 
        component={ImageViewerScreen}
        options={{ 
          presentation: 'modal',
          animation: 'fade'
        }}
      />
    </Stack.Navigator>
  );
};

export default MainNavigatorCustomer;
