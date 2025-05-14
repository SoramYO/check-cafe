import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import FeaturedBanner from "../components/FeaturedBanner";
import SearchBar from "../components/SearchBar";
import themeAPI from "../services/shopThemeAPI";
import shopAPI from "../services/shopAPI";
import { useLocation } from "../context/LocationContext";
import * as Location from "expo-location";
import { getFavoriteShops, toggleFavorite } from "../utils/favoritesStorage";
import { useFocusEffect } from "@react-navigation/native";

export default function DiscoverScreen({ navigation }) {
  const { location } = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [themes, setThemes] = useState([]);
  const [shops, setShops] = useState([]);
  const [currentAddress, setCurrentAddress] = useState("");
  const [activeFilters, setActiveFilters] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [favoriteShops, setFavoriteShops] = useState([]);

  useEffect(() => {
    if (!location) return;
    const fetchData = async () => {
      const [responseTheme, responseShop] = await Promise.all([
        themeAPI.HandleTheme(),
        shopAPI.HandleCoffeeShops(
          "/public?latitude=" +
            location?.latitude +
            "&longitude=" +
            location?.longitude +
            "&radius=10000"
        ),
      ]);
      setThemes(responseTheme.data.themes);
      setShops(responseShop.data.shops);
    };
    fetchData();
  }, [location]);

  useEffect(() => {
    const updateCurrentLocation = async () => {
      if (location) {
        const address = await getAddressFromCoords(
          location.latitude,
          location.longitude
        );
        setCurrentAddress(address);
      }
    };
    updateCurrentLocation();
  }, [location]);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    const favorites = await getFavoriteShops();
    setFavoriteShops(favorites);
  };

  const handleToggleFavorite = async (shop) => {
    await toggleFavorite(shop);
    loadFavorites();
  };

  const isShopFavorite = (shopId) => {
    return favoriteShops.some((shop) => shop._id === shopId);
  };

  const getAddressFromCoords = async (latitude, longitude) => {
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addresses.length > 0) {
        const addr = addresses[0];
        return `${addr.street}, ${addr.district}, ${addr.region}, ${addr.country}`;
      } else {
        return "Không tìm thấy địa chỉ";
      }
    } catch (error) {
      console.error("Lỗi khi chuyển đổi tọa độ:", error);
      return "Lỗi khi lấy địa chỉ";
    }
  };

  const handleCategoryPress = (categoryId) => {
    setActiveCategory(categoryId);
    handleApplyFilters({ themeId: categoryId });
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        activeCategory === item._id && styles.categoryItemActive,
      ]}
      key={item._id || item.id}
      onPress={() => handleCategoryPress(item._id)}
    >
      <View style={[styles.categoryIcon]}>
        <Image source={{ uri: item.theme_image }} style={styles.iconTheme} />
      </View>
      <Text
        style={[
          styles.categoryName,
          activeCategory === item._id && styles.categoryNameActive,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderShopCard = ({ item }) => (
    <TouchableOpacity
      style={styles.shopCard}
      onPress={() => navigation.navigate("CafeDetail", { shopId: item._id })}
    >
      <Image source={{ uri: item?.mainImage?.url }} style={styles.shopImage} />
      <View style={styles.shopInfo}>
        <View style={styles.shopHeader}>
          <View>
            <Text style={styles.shopName}>{item?.name}</Text>
            <View style={styles.ratingContainer}>
              <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
              <Text style={styles.rating}>{item?.rating_avg}</Text>
              <Text style={styles.reviews}>
                ({item?.rating_count} đánh giá)
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: item?.is_open ? "#4CAF50" : "#FF9800" },
            ]}
          >
            <Text style={styles.statusText}>
              {item?.is_open ? "Mở cửa" : "Đóng cửa"}
            </Text>
          </View>
        </View>

        <View style={styles.shopDetails}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="map-marker" size={16} color="#666" />
            <Text style={styles.shopAddress}>{item.address}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="walk" size={16} color="#666" />
            <Text style={styles.distance}>{item.distance.toFixed(2)} km</Text>
          </View>
        </View>

        <View style={styles.features}>
          {item?.features?.map((feature, index) => (
            <View key={index} style={styles.featureBadge}>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => navigation.navigate("Booking", { shopId: item._id })}
          >
            <Text style={styles.bookButtonText}>Đặt chỗ</Text>
            <MaterialCommunityIcons
              name="arrow-right"
              size={20}
              color="white"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => handleToggleFavorite(item)}
          >
            <MaterialCommunityIcons
              name={isShopFavorite(item._id) ? "heart" : "heart-outline"}
              size={24}
              color={isShopFavorite(item._id) ? "#EF4444" : "#666"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -50],
    extrapolate: "clamp",
  });

  const handleApplyFilters = async (filters) => {
    setActiveFilters(filters);
    if (!location) return;

    // Construct the API URL with filters
    let url = `/public?latitude=${location.latitude}&longitude=${location.longitude}`;

    if (filters) {
      if (filters.distance) {
        url += `&radius=${filters.distance}`; // Convert km to meters
      }
      if (filters.themeId) {
        url += `&themes=${filters.themeId}`;
      }
      if (filters.sortRating) {
        url += `&sortBy=rating_avg&sortOrder=${filters.sortRating}`;
      }
    } else {
      url += "&radius=10000"; // Default 10km
    }

    // Fetch filtered shops
    const response = await shopAPI.HandleCoffeeShops(url);
    setShops(response.data.shops);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.locationContainer}>
          <MaterialCommunityIcons name="map-marker" size={20} color="white" />
          <Text style={styles.locationText} numberOfLines={1}>
            {currentAddress || "Đang tải vị trí..."}
          </Text>
        </View>

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          themes={themes}
          onApplyFilters={handleApplyFilters}
        />
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <FeaturedBanner />

        <View style={styles.themesContainer}>
          <FlatList
            data={themes}
            renderItem={renderCategory}
            keyExtractor={(item) => item._id || item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>

        <View style={styles.featuredContainer}>
          <Text style={styles.sectionTitle}>Quán cà phê hot ở Đà Lạt</Text>
          <FlatList
            data={shops}
            renderItem={renderShopCard}
            keyExtractor={(item) => item.id || item._id}
            scrollEnabled={false}
          />
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerContainer: {
    backgroundColor: "#fff",
  },
  iconTheme: {
    width: 24,
    height: 24,
  },
  header: {
    backgroundColor: "white",
    zIndex: 1000,
  },
  themesContainer: {
    marginTop: 15,
    marginBottom: 5,
  },
  categoryItem: {
    alignItems: "center",
    marginHorizontal: 10,
    padding: 8,
    borderRadius: 12,
  },
  categoryItemActive: {
    backgroundColor: "#EBF3FE",
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F0F8FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  categoryName: {
    marginTop: 8,
    fontSize: 12,
    color: "#666",
  },
  categoryNameActive: {
    color: "#4A90E2",
    fontWeight: "600",
  },
  featuredContainer: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  shopCard: {
    backgroundColor: "white",
    borderRadius: 12,
    borderColor: "#E2E8F0",
    borderWidth: 1,
    marginBottom: 15,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  shopImage: {
    width: "100%",
    height: 180,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  shopInfo: {
    padding: 15,
  },
  shopHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  shopName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rating: {
    color: "#333",
    fontWeight: "bold",
  },
  reviews: {
    color: "#666",
    fontSize: 12,
  },
  price: {
    color: "#666",
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  shopDetails: {
    marginTop: 10,
    gap: 5,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  shopAddress: {
    color: "#666",
    flex: 1,
    fontSize: 14,
  },
  distance: {
    color: "#666",
    fontSize: 14,
  },
  features: {
    flexDirection: "row",
    marginTop: 10,
    gap: 8,
  },
  featureBadge: {
    backgroundColor: "#F0F8FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featureText: {
    color: "#4A90E2",
    fontSize: 12,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 15,
    gap: 10,
  },
  bookButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4A90E2",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  bookButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  favoriteButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  locationContainer: {
    backgroundColor: "#4A90E2",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
    color: "white",
    flex: 1,
  },
});
