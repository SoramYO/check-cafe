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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import MenuSection from "../components/cafe/MenuSection";
import CheckinGallery from "../components/cafe/CheckinGallery";
import ReviewSection from "../components/cafe/ReviewSection";
import ImageCarousel from "../components/cafe/ImageCarousel";
import BasicInfo from "../components/cafe/BasicInfo";
import shopAPI from "../services/shopAPI";
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
// const shop = {
//   id: "1",
//   name: "The Dreamer Coffee",
//   address: "123 Đường Trần Hưng Đạo, Phường 10, Đà Lạt",
//   phone: "0123456789",
//   hours: "07:00 - 22:00",
//   rating: 4.8,
//   reviews: 256,
//   website: "https://dreamercoffee.com",
//   description:
//     "Quán cà phê view đẹp với không gian thoáng đãng, phong cách hiện đại pha lẫn nét cổ điển của Đà Lạt. Địa điểm lý tưởng để thưởng thức cà phê, đọc sách và ngắm nhìn thành phố từ trên cao.",
//   images: [
//     "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2947&auto=format&fit=crop",
//     "https://images.unsplash.com/photo-1493857671505-72967e2e2760?q=80&w=2940&auto=format&fit=crop",
//     "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2940&auto=format&fit=crop",
//   ],
//   features: [
//     { icon: "wifi", label: "Wifi miễn phí" },
//     { icon: "car", label: "Bãi đỗ xe" },
//     { icon: "credit-card", label: "Thanh toán thẻ" },
//     { icon: "air-conditioner", label: "Máy lạnh" },
//   ],
//   popularDishes: [
//     {
//       id: "1",
//       name: "Cà phê sữa đá",
//       price: "35.000đ",
//       image:
//         "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=2787&auto=format&fit=crop",
//       description: "Cà phê phin truyền thống với sữa đặc",
//     },
//     {
//       id: "2",
//       name: "Bánh mì chảo",
//       price: "55.000đ",
//       image:
//         "https://images.unsplash.com/photo-1484723091739-30a097e8f929?q=80&w=2874&auto=format&fit=crop",
//       description: "Bánh mì nướng với trứng và pate",
//     },
//   ],
//   menu: {
//     drinks: [
//       {
//         id: "1",
//         name: "Cà phê sữa đá",
//         price: "35.000đ",
//         description: "Cà phê phin truyền thống với sữa đặc",
//         image:
//           "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=2787&auto=format&fit=crop",
//         category: "Cà phê",
//       },
//       {
//         id: "2",
//         name: "Cappuccino",
//         price: "45.000đ",
//         description: "Cà phê Ý với sữa tươi đánh bông",
//         image:
//           "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?q=80&w=2787&auto=format&fit=crop",
//         category: "Cà phê",
//       },
//     ],
//     food: [
//       {
//         id: "3",
//         name: "Bánh mì chảo",
//         price: "55.000đ",
//         description: "Bánh mì nướng với trứng và pate",
//         image:
//           "https://images.unsplash.com/photo-1484723091739-30a097e8f929?q=80&w=2874&auto=format&fit=crop",
//         category: "Điểm tâm",
//       },
//       {
//         id: "4",
//         name: "Croissant",
//         price: "35.000đ",
//         description: "Bánh sừng bò Pháp",
//         image:
//           "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=2726&auto=format&fit=crop",
//         category: "Bánh ngọt",
//       },
//     ],
//   },
//   checkinSpots: [
//     {
//       id: "1",
//       image:
//         "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?q=80&w=2940&auto=format&fit=crop",
//       description: "Góc ban công view thành phố",
//     },
//     {
//       id: "2",
//       image:
//         "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=2940&auto=format&fit=crop",
//       description: "Khu vườn xanh mát",
//     },
//     {
//       id: "3",
//       image:
//         "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=2940&auto=format&fit=crop",
//       description: "Góc vintage trong nhà",
//     },
//   ],
// };

export default function CafeDetailScreen({ navigation, route }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [shop, setShop] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [reviewComment, setReviewComment] = useState("");
  const { shopId } = route.params;

  useEffect(() => {
    const fetchShop = async () => {
      const response = await shopAPI.HandleCoffeeShops(`/${shopId}`);
      setShop(response.data.shop);
    };
    fetchShop();
  }, []);

  const handleBooking = () => {
    navigation.navigate("Booking", {
      shopId: shop._id,
    });
  };

  const handleSubmitReview = () => {
    // Here you would typically send the review to your backend
    console.log("Submitting review:", {
      rating: selectedRating,
      comment: reviewComment,
    });
    // Reset the form
    setSelectedRating(0);
    setReviewComment("");
    setIsReviewModalVisible(false);
  };

  const renderFeatures = () => (
    <View style={styles.featuresContainer}>
      {shop?.amenities?.map((amenitie, index) => (
        <View key={index} style={styles.featureItem}>
          <MaterialCommunityIcons
            name={amenitie.icon}
            size={24}
            color="#4A90E2"
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
        <TouchableOpacity style={styles.seeAllButton}>
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
          <TouchableOpacity key={dish.id} style={styles.popularDishCard}>
            <Image
              source={{ uri: dish.image }}
              style={styles.popularDishImage}
            />
            <View style={styles.popularDishOverlay}>
              <MaterialCommunityIcons
                name="heart-outline"
                size={24}
                color="white"
              />
            </View>
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
                <TouchableOpacity style={styles.addToCartButton}>
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={26} color="white" />
        </TouchableOpacity>

        {/* Share Button */}
        <TouchableOpacity style={styles.shareButton}>
          <MaterialCommunityIcons
            name="share-variant"
            size={24}
            color="white"
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
          onPress={() => setIsFavorite(!isFavorite)}
        >
          <MaterialCommunityIcons
            name={isFavorite ? "heart" : "heart-outline"}
            size={28}
            color={isFavorite ? "#FF4B4B" : "#4A90E2"}
          />
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
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  descriptionContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: "#64748B",
  },
  featuresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 24,
    padding: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
  },
  featureItem: {
    alignItems: "center",
    gap: 8,
    minWidth: 80,
  },
  featureLabel: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1E293B",
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
    color: "#4A90E2",
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
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    color: "#1E293B",
  },
  popularDishPriceTag: {
    backgroundColor: "#F0F9FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  popularDishPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4A90E2",
  },
  popularDishDescription: {
    fontSize: 14,
    color: "#64748B",
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
    color: "#1E293B",
  },
  popularDishRatingCount: {
    fontSize: 14,
    color: "#64748B",
  },
  addToCartButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0F9FF",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  favoriteButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  bookingButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4A90E2",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  bookingButtonText: {
    color: "white",
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
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  shareButton: {
    position: "absolute",
    top: Platform.OS === "android" ? StatusBar.currentHeight + 15 : 15,
    right: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
});
