import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TabNavigatorStaff from "./TabNavigatorStaff";

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
    </Stack.Navigator>
  );
};

export default MainNavigatorStaff;
