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
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import MapView, { Marker } from "react-native-maps";
import { useLocation } from "../context/LocationContext";
import shopAPI from "../services/shopAPI";
import CustomMapViewDirections from "../components/CustomMapViewDirections";
import { formatDurationRoute } from "../utils/formatHelpers";

// Định nghĩa mảng CAFES với các quán cà phê cũ và mới
const CAFES = [
  {
    id: "1",
    name: "The Dreamer Coffee",
    address:
      "357 Điện Biên Phủ, Phường 2, Bình Thạnh, Hồ Chí Minh 008428, Việt Nam",
    rating: 4.8,
    reviews: 256,
    image:
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2947&auto=format&fit=crop",
    coordinate: {
      latitude: 10.801588,
      longitude: 106.7105107,
    },
    status: "open",
  },
  {
    id: "2",
    name: "Still Cafe",
    address: "59 Nguyễn Trãi, Phường 9, Đà Lạt, Lâm Đồng 66111, Việt Nam",
    rating: 4.6,
    reviews: 189,
    image:
      "https://lh5.googleusercontent.com/p/AF1QipPogroazMq3rLIQJk3eXCEJgKuwu-wY1VRzgU0G=w408-h496-k-no",
    coordinate: {
      latitude: 11.9443448,
      longitude: 108.4481679,
    },
    status: "busy",
  },
  {
    id: "3",
    name: "Horizon Coffee - BBQ",
    address: "31/6 Đường 3/4, Phường 3, Đà Lạt, Lâm Đồng, Việt Nam",
    rating: 4.7,
    reviews: 210,
    image:
      "https://lh5.googleusercontent.com/p/AF1QipPEiKbSYh1xfix-xV0CjUgsgNc2bY-GIHtbtcBq=w408-h306-k-no",
    coordinate: {
      latitude: 11.9406,
      longitude: 108.4373,
    },
    status: "open",
  },
  {
    id: "4",
    name: "Chuyện Coffee",
    address: "55 Đường Hàn Thuyên, Phường 5, Đà Lạt, Lâm Đồng, Việt Nam",
    rating: 4.8,
    reviews: 0,
    image: "https://images.didau.date/chuyen-dalat/0-Cafe-image-0.webp",
    coordinate: {
      latitude: 11.9475473,
      longitude: 108.4207463,
    },
    status: "open",
  },
  {
    id: "5",
    name: "A.M Phin & Pour",
    address: "58 Thân Văn Nhiếp, An Phú, Thủ Đức, Hồ Chí Minh 71000, Việt Nam",
    rating: 4.8,
    image: "https://images.didau.date/AM-Phin-Pour/0-Cafe-image-0.webp",
    coordinate: {
      latitude: 10.7849944,
      longitude: 106.7498372,
    },
    status: "open",
  },
  {
    id: "6",
    name: "Y Coffee Roastery",
    address: "428 Võ Văn Tần, Phường 5, Quận 3, Hồ Chí Minh, Việt Nam",
    rating: 4.6,
    image: "https://images.didau.date/Y-Coffee-Roastery/1-Cafe-image-1.webp",
    coordinate: {
      latitude: 10.7696522,
      longitude: 106.6810065,
    },
    status: "open",
  },
  {
    id: "7",
    name: "Xóm Space",
    address: "20 Trần Cao Vân, Đa Kao, Quận 1, Hồ Chí Minh, Việt Nam",
    rating: 4.5,
    image: "https://images.didau.date/Xm-Space/0-Cafe-image-0.webp",
    coordinate: {
      latitude: 10.7843889,
      longitude: 106.6947912,
    },
    status: "open",
  },
];

// Component cho phiên bản web
const WebMap = () => {
  return (
    <View style={styles.webMapContainer}>
      <Text style={styles.webMapText}>
        Maps are not supported in web version. Please use the mobile app for
        full functionality.
      </Text>
      <MaterialCommunityIcons name="map-marker-off" size={48} color="#94A3B8" />
    </View>
  );
};

// Component chính MapScreen
export default function MapScreen() {
  const navigation = useNavigation();
  const { location } = useLocation();
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedCafe, setSelectedCafe] = useState(null);
  const [shops, setShops] = useState([]);
  const mapRef = useRef(null);
  const [routeInfo, setRouteInfo] = useState(null);

  useEffect(() => {
    if (!location) return;
    const fetchData = async () => {
      try {
        const response = await shopAPI.HandleCoffeeShops(
          `/public?latitude=${location.latitude}&longitude=${location.longitude}&radius=10000`
        );
        setShops(response.data.shops);
      } catch (error) {
        console.error("Error fetching shops:", error);
        setErrorMsg("Không thể tải danh sách quán cà phê");
      }
    };
    fetchData();
  }, [location]);

  const handleCafePress = (shop) => {
    setRouteInfo(null);
    setSelectedCafe(shop);
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: shop.location.coordinates[1],
          longitude: shop.location.coordinates[0],
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500
      );
    }
  };

  const handleInfoPress = () => {
    if (selectedCafe) {
      navigation.navigate("CafeDetail", { shopId: selectedCafe._id });
    }
  };

  const handleRouteReady = (result) => {
    setRouteInfo(result);

    // Fit map to show entire route
    if (mapRef.current && result.coordinates.length > 0) {
      mapRef.current.fitToCoordinates(result.coordinates, {
        edgePadding: {
          top: 50,
          right: 50,
          bottom: 50,
          left: 50,
        },
        animated: true,
      });
    }
  };

  const renderMarker = (shop) => {
    if (Platform.OS === "web") return null;
    if (!shop?.location?.coordinates) return null;

    return (
      <Marker
        key={shop?._id}
        coordinate={{
          latitude: shop?.location?.coordinates[1],
          longitude: shop?.location?.coordinates[0],
        }}
        onPress={() => handleCafePress(shop)}
      >
        <View
          style={[
            styles.markerContainer,
            selectedCafe?._id === shop?._id && styles.markerContainerSelected,
          ]}
        >
          <View
            style={[
              styles.markerStatus,
              {
                backgroundColor:
                  shop?.status === "open" ? "#4CAF50" : "#FF9800",
              },
            ]}
          />
          <Image
            source={{ uri: shop?.mainImage?.url }}
            style={styles.markerImage}
          />
        </View>
      </Marker>
    );
  };

  if (Platform.OS === "web") {
    return (
      <SafeAreaView style={styles.container}>
        <WebMap />
      </SafeAreaView>
    );
  }

  if (!location) {
    return (
      <SafeAreaView style={styles.container}>
        <View
          style={[
            styles.container,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <Text>Đang xác định vị trí...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (errorMsg) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <LinearGradient colors={["#18213e", "#983aa8"]}>
          {Platform.select({
            native: () => {
              return (
                <>
                  <MapView
                    key={shops.length}
                    ref={mapRef}
                    style={styles.map}
                    showsUserLocation
                    initialRegion={{
                      latitude: location?.latitude,
                      longitude: location?.longitude,
                      latitudeDelta: 0.02,
                      longitudeDelta: 0.02,
                    }}
                    mapType="standard"
                    provider={MapView.PROVIDER_OPENSTREETMAP}
                  >
                    {shops?.map(renderMarker)}
                    {selectedCafe && location && (
                      <CustomMapViewDirections
                        key={selectedCafe._id}
                        origin={{
                          latitude: location.latitude,
                          longitude: location.longitude,
                        }}
                        destination={{
                          latitude: selectedCafe.location.coordinates[1],
                          longitude: selectedCafe.location.coordinates[0],
                        }}
                        strokeWidth={3}
                        strokeColor="#4A90E2"
                        onReady={handleRouteReady}
                      />
                    )}
                  </MapView>

                  {selectedCafe && (
                    <TouchableOpacity
                      style={styles.cafeInfo}
                      onPress={handleInfoPress}
                    >
                      <Image
                        source={{ uri: selectedCafe?.mainImage?.url }}
                        style={styles.cafeImage}
                      />
                      <View style={styles.cafeDetails}>
                        <Text style={styles.cafeName}>{selectedCafe.name}</Text>
                        <View style={styles.ratingContainer}>
                          <MaterialCommunityIcons
                            name="star"
                            size={16}
                            color="#FFD700"
                          />
                          <Text style={styles.rating}>
                            {selectedCafe.rating_avg}
                          </Text>
                          <Text style={styles.reviews}>
                            ({selectedCafe.rating_count} đánh giá)
                          </Text>
                        </View>
                        {routeInfo && (
                          <View style={styles.routeInfo}>
                            <View style={styles.routeDetail}>
                              <MaterialCommunityIcons
                                name="map-marker-distance"
                                size={16}
                                color="#64748B"
                              />
                              <Text style={styles.routeText}>
                                {routeInfo.distance.toFixed(1)} km
                              </Text>
                            </View>
                            <View style={styles.routeDetail}>
                              <MaterialCommunityIcons
                                name="clock-outline"
                                size={16}
                                color="#64748B"
                              />
                              <Text style={styles.routeText}>
                                {formatDurationRoute(routeInfo.duration)}
                              </Text>
                            </View>
                          </View>
                        )}
                        <Text style={styles.cafeAddress} numberOfLines={1}>
                          Địa chỉ: {selectedCafe.address}
                        </Text>
                      </View>
                      <MaterialCommunityIcons
                        name="chevron-right"
                        size={24}
                        color="#64748B"
                      />
                    </TouchableOpacity>
                  )}
                </>
              );
            },
            default: () => <WebMap />,
          })()}
          <TouchableOpacity
            style={styles.locationButton}
            onPress={() => {
              if (location && mapRef.current) {
                mapRef.current.animateToRegion(
                  {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.02,
                  },
                  500
                );
              }
            }}
          >
            <MaterialCommunityIcons
              name="crosshairs-gps"
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
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
    backgroundColor: "#7a5545",
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
    flexDirection: "row",
    alignItems: "center",
  },
  markerContainer: {
    width: 32,
    height: 32,
    borderRadius: 22,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerContainerSelected: {
    transform: [{ scale: 1.1 }],
    borderWidth: 2,
    borderColor: "#4A90E2",
  },
  markerImage: {
    width: 32,
    height: 32,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#4A90E2",
  },
  markerStatus: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "white",
    zIndex: 1,
  },
  cafeInfo: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cafeImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  cafeDetails: {
    flex: 1,
    gap: 4,
  },
  cafeName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },
  reviews: {
    fontSize: 12,
    color: "#64748B",
  },
  cafeAddress: {
    fontSize: 12,
    color: "#64748B",
  },
  webMapContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 20,
    gap: 16,
  },
  webMapText: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 24,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 4,
  },
  routeDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  routeText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
});
