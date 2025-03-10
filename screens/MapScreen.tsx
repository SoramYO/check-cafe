import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Marker,
  PROVIDER_DEFAULT,
} from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import WebMapComponent from "../components/WebMapComponent";
import MapView from "react-native-maps";

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function getCurrentLocation() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    }
    getCurrentLocation();
  }, []);

  const goToCurrentLocation = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <LinearGradient colors={["#18213e", "#983aa8"]} style={styles.gradient}>
          {Platform.OS === "web" ? (
            <WebMapComponent location={location} />
          ) : (
            <MapView
              ref={mapRef}
              showsMyLocationButton
              showsUserLocation
              provider={PROVIDER_DEFAULT}
              style={styles.map}
              region={{
                latitude: location?.coords.latitude || 0,
                longitude: location?.coords.longitude || 0,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                title="LoHa"
                description=""
                coordinate={{
                  latitude: (location?.coords?.latitude || 0) + 0.0105,
                  longitude: (location?.coords?.longitude || 0) + 0.0005,
                }}
              >
                <Image
                  source={require("../assets/images/icon.png")}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    borderWidth: 2,
                    borderColor: "gray",
                  }}
                />
              </Marker>
            </MapView>
          )}
          {Platform.OS !== "web" && (
            <TouchableOpacity
              style={styles.locationButton}
              onPress={goToCurrentLocation}
            >
              <Ionicons name="locate" size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height - 100,
  },
  locationButton: {
    position: "absolute",
    right: 20,
    bottom: 40,
    backgroundColor: "#4A90E2",
    padding: 15,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
});
