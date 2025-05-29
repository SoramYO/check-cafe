import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TabNavigatorStaff from "./TabNavigatorStaff";
import CheckinSuccessScreen from "../../screens/staff/CheckinSuccessScreen";
import EditProfileScreen from "../../screens/EditProfileScreen";

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
    </Stack.Navigator>
  );
};

export default MainNavigatorStaff;
