import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Platform, Text } from "react-native";
import ProfileScreen from "./../screens/ProfileScreen";
import DiscoverScreen from "../screens/DiscoverScreen";
import MapScreen from "../screens/MapScreen";
import BookingsScreen from "../screens/BookingsScreen";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const TabNavigator = () => {
  const Tab = createBottomTabNavigator();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarIcon: ({ focused, color, size }) => {
            let iconName = "home";
  
            if (route.name === "Discover") {
              iconName = focused ? "coffee" : "coffee-outline";
            } else if (route.name === "Map") {
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
        
        tabBarActiveTintColor: '#4A90E2',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Bookings" component={BookingsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
