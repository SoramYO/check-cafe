import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Animated,
  ActivityIndicator,
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
import { useAnalytics } from "../utils/analytics";
import notificationAPI from "../services/notificationAPI";

export default function DiscoverScreen({ navigation }) {
  const { location } = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [themes, setThemes] = useState([]);
  const [shops, setShops] = useState([]);
  const [originalShops, setOriginalShops] = useState([]);
  const [currentAddress, setCurrentAddress] = useState("");
  const [activeFilters, setActiveFilters] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [favoriteShops, setFavoriteShops] = useState([]);
  const [pressedCategory, setPressedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const { trackScreenView, trackTap, trackSearch, trackFilter, trackFavorite, isAuthenticated } = useAnalytics();

  // Track screen view only if authenticated
  useEffect(() => {
    const init = async () => {
      if (await isAuthenticated()) {
        trackScreenView('Discover', {
          location: location ? 'available' : 'unavailable',
          timestamp: new Date().toISOString()
        });
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!location) return;
    const fetchData = async () => {
      try {
        setLoading(true);
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
        const responseNotification = await notificationAPI.HandleNotification("/unread-count");
        if (responseNotification.data && responseNotification.data.unread_count) {
          setUnreadNotifications(responseNotification.data.unread_count);
        } else {
          setUnreadNotifications(0);
        }
        setThemes(responseTheme.data.themes);
        setShops(responseShop.data.shops);
        setOriginalShops(responseShop.data.shops);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
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
    const isFavorited = isShopFavorite(shop._id);

    // Track favorite action
    trackFavorite(shop._id, isFavorited ? 'remove' : 'add', {
      shop_name: shop.name,
      shop_rating: shop.rating_avg,
      is_open: shop.is_open
    });

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
    // Track category selection
    const selectedTheme = themes.find(theme => theme._id === categoryId);
    trackTap('category_filter', {
      category_id: categoryId,
      category_name: selectedTheme?.name,
      previous_category: activeCategory
    });

    setPressedCategory(categoryId);
    setActiveCategory(categoryId);
    handleApplyFilters({ themeId: categoryId });

    setTimeout(() => {
      setPressedCategory(null);
    }, 200);
  };

  const getCategoryStyle = (itemId) => {
    return [
      styles.categoryItem,
      activeCategory === itemId && styles.categoryItemActive,
      pressedCategory === itemId && {
        transform: [{ scale: 0.95 }],
      },
    ];
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={getCategoryStyle(item._id)}
      key={item._id || item.id}
      onPress={() => handleCategoryPress(item._id)}
      activeOpacity={0.7}
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
      onPress={() => {
        trackTap('shop_card', {
          shop_id: item._id,
          shop_name: item.name,
          shop_rating: item.rating_avg,
          is_open: item.is_open,
          source: 'discover_list'
        });
        navigation.navigate("CafeDetail", { shopId: item._id });
      }}
    >
      <Image source={{ uri: item?.mainImage?.url }} style={styles.shopImage} />
      <View style={styles.shopInfo}>
        <Text style={styles.shopName} numberOfLines={1}>{item?.name}</Text>

        <View style={styles.ratingRow}>
          <View style={styles.ratingContainer}>
            <MaterialCommunityIcons name="star" size={14} color="#FFD700" />
            <Text style={styles.rating}>{item?.rating_avg}</Text>
            <Text style={styles.reviews}>({item?.rating_count})</Text>
          </View>

          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: item?.is_open ? "#4CAF50" : "#FF9800" },
              ]}
            />
            <Text style={[
              styles.statusText,
              { color: item?.is_open ? "#4CAF50" : "#FF9800" }
            ]}>
              {item?.is_open ? "Mở" : "Đóng"}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="map-marker" size={14} color="#666" />
          <Text style={styles.shopAddress} numberOfLines={1}>{item.address}</Text>
        </View>

        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => handleToggleFavorite(item)}
          >
            <MaterialCommunityIcons
              name={isShopFavorite(item._id) ? "heart" : "heart-outline"}
              size={20}
              color={isShopFavorite(item._id) ? "#EF4444" : "#666"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => navigation.navigate("Booking", { shopId: item._id })}
          >
            <Text style={styles.bookButtonText}>Đặt chỗ</Text>
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

    try {
      setFilterLoading(true);
      let url = `/public?latitude=${location.latitude}&longitude=${location.longitude}`;

      if (filters) {
        if (filters.distance) {
          url += `&radius=${filters.distance}`;
        }
        if (filters.themeId) {
          url += `&themes=${filters.themeId}`;
        }
        if (filters.sortRating) {
          url += `&sortBy=rating_avg&sortOrder=${filters.sortRating}`;
        }
        if (filters.searchQuery) {
          url += `&search=${encodeURIComponent(filters.searchQuery)}`;
        }
      } else {
        url += "&radius=10000";
      }

      const response = await shopAPI.HandleCoffeeShops(url);
      setShops(response.data.shops);
      setOriginalShops(response.data.shops);
    } catch (error) {
      console.error("Error applying filters:", error);
    } finally {
      setFilterLoading(false);
    }
  };

  // Add function to handle search by name
  const handleSearch = (query) => {
    setSearchQuery(query);

    if (query.length > 2) {
      // Track search
      trackSearch(query, {
        source: 'discover_screen',
        query_length: query.length
      });
    }

    // Apply filters with search query included
    const filtersWithSearch = {
      ...activeFilters,
      searchQuery: query.trim()
    };

    handleApplyFilters(filtersWithSearch);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7a5545" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        {/* Header with title and notification */}
        <View style={styles.topHeader}>
          <Text style={styles.headerTitle}>Khám phá</Text>

          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => {
              trackTap('notification_icon', { source: 'discover_header' });
              navigation.navigate('Notifications');
            }}
          >
            <MaterialCommunityIcons name="bell-outline" size={22} color="#7a5545" />
            {unreadNotifications > 0 &&
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>{unreadNotifications}</Text>
              </View>
            }
          </TouchableOpacity>
        </View>

        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
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
            numColumns={4}
            scrollEnabled={false}
            columnWrapperStyle={styles.categoryRow}
          />
        </View>

        <View style={styles.featuredContainer}>
          <Text style={styles.sectionTitle}>Quán cà phê hot ở Đà Lạt</Text>
          {filterLoading ? (
            <View style={styles.filterLoadingContainer}>
              <ActivityIndicator size="small" color="#7a5545" />
              <Text style={styles.filterLoadingText}>Đang lọc dữ liệu...</Text>
            </View>
          ) : (
            <FlatList
              data={shops}
              renderItem={renderShopCard}
              keyExtractor={(item) => item.id || item._id}
              numColumns={2}
              columnWrapperStyle={styles.shopRow}
              scrollEnabled={false}
            />
          )}
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
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    paddingBottom: 8,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#7a5545',
    letterSpacing: 0.5,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F0E6DD',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8D3C3',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF4757',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  quickActionItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 11,
    color: '#6c757d',
    fontWeight: '500',
  },
  iconTheme: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    backgroundColor: '#FFF9F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8D3C3',
  },
  header: {
    backgroundColor: "#6B4F3F",
    zIndex: 1000,
  },
  themesContainer: {
    marginVertical: 15,
    paddingHorizontal: 12,
  },
  categoryRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryItem: {
    alignItems: 'center',
    width: '23%',
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8D3C3',
    shadowColor: "#BFA58E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF9F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8D3C3',
  },
  categoryName: {
    marginTop: 6,
    fontSize: 11,
    color: '#6B4F3F',
    fontWeight: '500',
    textAlign: 'center',
  },
  categoryItemActive: {
    backgroundColor: '#BFA58E',
    borderColor: '#8B7355',
    borderWidth: 1,
  },
  categoryNameActive: {
    color: '#FFF9F5',
    fontWeight: '600',
  },
  featuredContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 20,
    color: "#6B4F3F",
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  shopRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  shopCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8D3C3',
    shadowColor: "#BFA58E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  shopImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  shopInfo: {
    padding: 10,
  },
  shopName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B4F3F',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  rating: {
    color: '#6B4F3F',
    fontSize: 12,
    fontWeight: '600',
  },
  reviews: {
    color: '#BFA58E',
    fontSize: 11,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  shopAddress: {
    color: '#6B4F3F',
    fontSize: 12,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bookButton: {
    flex: 1,
    backgroundColor: '#7a5545',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#FFF9F5',
    fontSize: 12,
    fontWeight: '600',
  },
  favoriteButton: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: '#FFF9F5',
    borderWidth: 1,
    borderColor: '#E8D3C3',
  },
  locationContainer: {
    backgroundColor: "#6B4F3F",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  locationText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#FFF9F5",
    flex: 1,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#7a5545",
    fontWeight: "500",
  },
  filterLoadingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    gap: 8,
  },
  filterLoadingText: {
    fontSize: 14,
    color: "#7a5545",
    fontWeight: "500",
  },
});
