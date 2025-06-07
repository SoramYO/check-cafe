import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TabNavigatorStaff from "./TabNavigatorStaff";
import CheckinSuccessScreen from "../../screens/staff/CheckinSuccessScreen";
import EditProfileScreen from "../../screens/EditProfileScreen";
import TermsAndPrivacyScreen from "../../screens/TermsAndPrivacyScreen";
import NotificationScreen from "../../screens/NotificationScreen";

const MainNavigatorStaff = () => {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "white" },
        animation: "fade_from_bottom",
      }}
    >
      <Stack.Screen name="TabNavigatorStaff" component={TabNavigatorStaff} />
      <Stack.Screen name="CheckinSuccessScreen" component={CheckinSuccessScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="TermsAndPrivacy" component={TermsAndPrivacyScreen} />
      <Stack.Screen name="Notifications" component={NotificationScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigatorStaff;
