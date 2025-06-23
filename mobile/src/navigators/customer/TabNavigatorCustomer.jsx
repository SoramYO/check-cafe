import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import DiscoverScreen from "../../screens/DiscoverScreen";
import MapScreen from "../../screens/MapScreen";
import BookingsScreen from "../../screens/BookingsScreen";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ProfileScreen from "../../screens/ProfileScreen";
import CheckinListScreen from "../../screens/CheckinListScreen";
import { View, TouchableOpacity, StyleSheet } from "react-native";

const TabNavigatorCustomer = () => {
  const Tab = createBottomTabNavigator();

  const CustomCheckinButton = ({ children, onPress }) => (
    <TouchableOpacity
      style={styles.customCheckinButton}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.outerBorder}>
        <View style={styles.innerCircle}>{children}</View>
      </View>
    </TouchableOpacity>
  );

  const styles = StyleSheet.create({
    customCheckinButton: {
      top: -18,
      justifyContent: "center",
      alignItems: "center",
    },
    outerBorder: {
      width: 74,
      height: 74,
      borderRadius: 37,
      backgroundColor: "#bfa08a", // cafe sữa border
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 8,
      elevation: 8,
    },
    innerCircle: {
      width: 62,
      height: 62,
      borderRadius: 31,
      backgroundColor: "#7a5545",
      justifyContent: "center",
      alignItems: "center",
    },
  });

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
          } else if (route.name === "Checkin") {
            // handled below
            return null;
          } else if (route.name === "Bookings") {
            iconName = focused ? "calendar-check" : "calendar-check-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "account" : "account-outline";
          }

          return (
            <MaterialCommunityIcons name={iconName} size={size} color={color} />
          );
        },
        tabBarLabelStyle: {
          marginBottom: 4,
          fontSize: 12,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        tabBarStyle: {
          height: 70,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: "#7a5545",
        tabBarInactiveTintColor: "#7a5545",
      })}
    >
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen
        name="Checkin"
        component={CheckinListScreen}
        options={{
          tabBarButton: (props) => (
            <CustomCheckinButton {...props}>
              <MaterialCommunityIcons
                name={props.accessibilityState?.selected ? "camera" : "camera-outline"}
                size={36}
                color="#fff"
              />
            </CustomCheckinButton>
          ),
          tabBarLabel: "",
        }}
      />
      <Tab.Screen name="Bookings" component={BookingsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigatorCustomer;
