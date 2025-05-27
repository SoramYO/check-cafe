import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ProfileScreen from "../../screens/ProfileScreen";
import BookingRequestScreen from "../../screens/staff/BookingRequestScreen";
import ScanQRScreen from "../../screens/staff/ScanQRScreen";

const TabNavigatorStaff = () => {
  const Tab = createBottomTabNavigator();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarIcon: ({ focused, color, size }) => {
            let iconName = "home";
          
            if (route.name === "BookingRequests") {
              iconName = focused ? "calendar-check" : "calendar-check-outline";
            } else if (route.name === "ScanQR") {
              iconName = focused ? "map" : "map-outline";
            } else if (route.name === "Bookings") {
              iconName = focused ? "calendar-check" : "calendar-check-outline";
            } else if (route.name === "Profile") {
              iconName = focused ? "account" : "account-outline";
            }
  
            return (
              <MaterialCommunityIcons name={iconName} size={size} color={color} />
            );
          },
        tabBarIconStyle: {
          marginTop: 8,
        },
        
        tabBarActiveTintColor: '#7a5545',
        tabBarInactiveTintColor: '#7a5545',
      })}
    >
      <Tab.Screen name="Bookings" component={BookingRequestScreen} />
      <Tab.Screen name="ScanQR" component={ScanQRScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigatorStaff;
