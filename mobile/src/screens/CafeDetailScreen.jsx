import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Platform,
  StatusBar,
  TouchableOpacity,
  Text,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import MenuSection from "../components/cafe/MenuSection";
import CheckinGallery from "../components/cafe/CheckinGallery";
import ReviewSection from "../components/cafe/ReviewSection";
import ImageCarousel from "../components/cafe/ImageCarousel";
import BasicInfo from "../components/cafe/BasicInfo";
import shopAPI from "../services/shopAPI";
import { getFavoriteShops, toggleFavorite } from "../utils/favoritesStorage";
import { useAnalytics } from "../utils/analytics";
const popularDishes = [
  {
    id: "1",
    name: "Cà phê sữa đá",
    price: "35.000đ",
    image:
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=2787&auto=format&fit=crop",
    description: "Cà phê phin truyền thống với sữa đặc",
  },
  {
    id: "2",
    name: "Bánh mì chảo",
    price: "55.000đ",
    image:
      "https://images.unsplash.com/photo-1484723091739-30a097e8f929?q=80&w=2874&auto=format&fit=crop",
    description: "Bánh mì nướng với trứng và pate",
  },
];

export default function CafeDetailScreen({ navigation, route }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const { shopId } = route.params;
  const { trackScreenView, trackTap, trackFavorite, trackAppEvent, isAuthenticated } = useAnalytics();

  useEffect(() => {
    const init = async () => {
      // Only track if user is authenticated
      if (await isAuthenticated()) {
        trackScreenView('CafeDetail', {
          shop_id: shopId,
          timestamp: new Date().toISOString()
        });
      }
    };
    init();

    const fetchData = async () => {
      try {
        setLoading(true);
        trackAppEvent('cafe_detail_loading_started', { shop_id: shopId });
        
        const [shopResponse] = await Promise.all([
          shopAPI.HandleCoffeeShops(`/${shopId}`),
          checkButtonStatus(),
        ]);
        
        setShop(shopResponse.data.shop);
        
        // Track successful shop data load
        trackAppEvent('cafe_detail_loaded', {
          shop_id: shopId,
          shop_name: shopResponse.data.shop?.name,
          is_open: shopResponse.data.shop?.is_open,
          rating: shopResponse.data.shop?.rating_avg,
          amenities_count: shopResponse.data.shop?.amenities?.length || 0
        });
        
      } catch (error) {
        console.error("Error fetching shop data:", error);
        trackAppEvent('cafe_detail_load_failed', {
          shop_id: shopId,
          error_message: error.message
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const checkButtonStatus = async () => {
    try {
      const favorites = await getFavoriteShops();
      setIsFavorite(favorites.some((fav) => fav._id === shopId));
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  };

  const toggleFavoriteShop = async () => {
    // Track favorite action
    trackFavorite(shopId, isFavorite ? 'remove' : 'add', {
      shop_name: shop?.name,
      shop_rating: shop?.rating_avg,
      is_open: shop?.is_open,
      source: 'cafe_detail_screen'
    });

    await toggleFavorite(shop);
    checkButtonStatus();
  };

  const handleBooking = () => {
    // Track booking button click
    trackTap('booking_button', {
      shop_id: shop._id,
      shop_name: shop?.name,
      is_open: shop?.is_open,
      source: 'cafe_detail_screen',
      user_has_favorited: isFavorite
    });

    navigation.navigate("Booking", {
      shopId: shop._id,
    });
  };

  const renderFeatures = () => (
    <View style={styles.featuresContainer}>
      {shop?.amenities?.map((amenitie, index) => (
        <View key={index} style={styles.featureItem}>
          <MaterialCommunityIcons
            name={amenitie.icon}
            size={24}
            color="#7a5545"
          />
          <Text style={styles.featureLabel}>{amenitie.label}</Text>
        </View>
      ))}
    </View>
  );

  const renderPopularDishes = () => (
    <View style={styles.popularDishesContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Món nổi bật</Text>
        <TouchableOpacity 
          style={styles.seeAllButton}
          onPress={() => {
            trackTap('see_all_popular_dishes', {
              shop_id: shopId,
              source: 'cafe_detail_screen'
            });
            // Add navigation to full menu when implemented
          }}
        >
          <Text style={styles.seeAllText}>Xem tất cả</Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color="#4A90E2"
          />
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.popularDishesScroll}
      >
        {popularDishes.map((dish) => (
          <TouchableOpacity 
            key={dish.id} 
            style={styles.popularDishCard}
            onPress={() => {
              trackTap('popular_dish_card', {
                dish_id: dish.id,
                dish_name: dish.name,
                shop_id: shopId,
                source: 'cafe_detail_screen'
              });
              // Add navigation to dish detail when implemented
            }}
          >
            <Image
              source={{ uri: dish.image }}
              style={styles.popularDishImage}
            />
            <TouchableOpacity 
              style={styles.popularDishOverlay}
              onPress={() => {
                trackTap('dish_favorite_button', {
                  dish_id: dish.id,
                  dish_name: dish.name,
                  shop_id: shopId,
                  source: 'cafe_detail_popular_dishes'
                });
                // Add favorite dish logic when implemented
              }}
            >
              <MaterialCommunityIcons
                name="heart-outline"
                size={24}
                color="white"
              />
            </TouchableOpacity>
            <View style={styles.popularDishInfo}>
              <View style={styles.popularDishHeader}>
                <Text style={styles.popularDishName}>{dish.name}</Text>
                <View style={styles.popularDishPriceTag}>
                  <Text style={styles.popularDishPrice}>{dish.price}</Text>
                </View>
              </View>
              <Text style={styles.popularDishDescription} numberOfLines={2}>
                {dish.description}
              </Text>
              <View style={styles.popularDishFooter}>
                <View style={styles.popularDishRating}>
                  <MaterialCommunityIcons
                    name="star"
                    size={16}
                    color="#FFD700"
                  />
                  <Text style={styles.popularDishRatingText}>4.5</Text>
                  <Text style={styles.popularDishRatingCount}>(120)</Text>
                </View>
                <TouchableOpacity 
                  style={styles.addToCartButton}
                  onPress={() => {
                    trackTap('add_to_cart_button', {
                      dish_id: dish.id,
                      dish_name: dish.name,
                      dish_price: dish.price,
                      shop_id: shopId,
                      source: 'cafe_detail_popular_dishes'
                    });
                    // Add to cart logic when implemented
                  }}
                >
                  <MaterialCommunityIcons
                    name="plus"
                    size={20}
                    color="#4A90E2"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons name="arrow-left" size={26} color="#7a5545" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton}>
            <MaterialCommunityIcons
              name="share-variant"
              size={24}
              color="#7a5545"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7a5545" />
          <Text style={styles.loadingText}>Đang tải thông tin quán...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => {
            trackTap('back_button', {
              shop_id: shopId,
              source: 'cafe_detail_screen'
            });
            navigation.goBack();
          }}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={26} color="#7a5545" />
        </TouchableOpacity>

        {/* Share Button */}
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={() => {
            trackTap('share_button', {
              shop_id: shopId,
              shop_name: shop?.name,
              source: 'cafe_detail_screen'
            });
            // Add share functionality when implemented
          }}
        >
          <MaterialCommunityIcons
            name="share-variant"
            size={24}
            color="#7a5545"
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {shop && (
          <>
            <ImageCarousel images={shop.images} navigation={navigation} />

            <View style={styles.content}>
              {shop?.description && (
                <View style={styles.descriptionContainer}>
                  <Text style={styles.description}>{shop?.description}</Text>
                </View>
              )}

              {shop.amenities && renderFeatures()}
              {renderPopularDishes()}

              <BasicInfo shop={shop} />
              <MenuSection menuItems={shop?.menuItems} />
              <CheckinGallery images={shop?.images} />
              <ReviewSection shop={shop} />
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavoriteShop()}
        >
          <MaterialCommunityIcons
            name={isFavorite ? "heart" : "heart-outline"}
            size={28}
            color={isFavorite ? "#FF4B4B" : "#7a5545"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkinButton}
          onPress={async () => {
            await trackTap('checkin_button', {
              shop_id: shop._id,
              shop_name: shop?.name,
              source: 'cafe_detail_screen'
            });
            navigation.navigate('CheckinCamera', {
              spotId: shop._id,
              spotName: shop.name,
              cafeId: shop._id,
            });
          }}
        >
          <MaterialCommunityIcons name="camera" size={20} color="white" />
          <Text style={styles.checkinButtonText}>Check-in</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bookingButton} onPress={handleBooking}>
          <Text style={styles.bookingButtonText}>Đặt chỗ ngay</Text>
          <MaterialCommunityIcons name="arrow-right" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  descriptionContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#FFF9F5",
    borderRadius: 12,
    shadowColor: "#BFA58E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: "#6B4F3F",
  },
  featuresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 24,
    padding: 16,
    backgroundColor: "#FFF9F5",
    borderRadius: 12,
    shadowColor: "#BFA58E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  featureItem: {
    alignItems: "center",
    gap: 8,
    minWidth: 80,
  },
  featureLabel: {
    fontSize: 12,
    color: "#6B4F3F",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#6B4F3F",
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    color: "#6B4F3F",
    fontWeight: "500",
  },
  popularDishesContainer: {
    marginBottom: 24,
  },
  popularDishesScroll: {
    paddingHorizontal: 4,
    gap: 16,
  },
  popularDishCard: {
    width: 300,
    backgroundColor: "#FFF9F5",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E8D3C3",
    shadowColor: "#BFA58E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  popularDishImage: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
  },
  popularDishOverlay: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  popularDishInfo: {
    padding: 16,
    gap: 8,
  },
  popularDishHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  popularDishName: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#6B4F3F",
  },
  popularDishPriceTag: {
    backgroundColor: "#fcedd6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  popularDishPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B4F3F",
  },
  popularDishDescription: {
    fontSize: 14,
    color: "#6B4F3F",
    lineHeight: 20,
  },
  popularDishFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  popularDishRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  popularDishRatingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B4F3F",
  },
  popularDishRatingCount: {
    fontSize: 14,
    color: "#BFA58E",
  },
  addToCartButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fcedd6",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 16,
    backgroundColor: "#FFF9F5",
    borderTopWidth: 1,
    borderTopColor: "#E8D3C3",
  },
  favoriteButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fcedd6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8D3C3",
  },
  checkinButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e74c3c",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
  },
  checkinButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  bookingButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7a5545",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  bookingButtonText: {
    color: "#FFF9F5",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "android" ? StatusBar.currentHeight + 15 : 15,
    left: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
    shadowColor: "#BFA58E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  shareButton: {
    position: "absolute",
    top: Platform.OS === "android" ? StatusBar.currentHeight + 15 : 15,
    right: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
    shadowColor: "#BFA58E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#7a5545",
    fontWeight: "500",
  },
});
