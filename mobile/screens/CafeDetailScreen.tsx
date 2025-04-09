import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Platform,
  StatusBar,
  TouchableOpacity,
  Text,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MotiView } from "moti";
import ImageCarousel from "../components/cafe/ImageCarousel";
import BasicInfo from "../components/cafe/BasicInfo";
import MenuSection from "../components/cafe/MenuSection";
import CheckinGallery from "../components/cafe/CheckinGallery";
import ReviewSection from "../components/cafe/ReviewSection";
import ActionButtons from "../components/cafe/ActionButtons";

const MOCK_CAFE = {
  id: "1",
  name: "The Dreamer Coffee",
  address: "123 Đường Trần Hưng Đạo, Phường 10, Đà Lạt",
  phone: "0123456789",
  hours: "07:00 - 22:00",
  rating: 4.8,
  reviews: 256,
  website: "https://dreamercoffee.com",
  description: "Quán cà phê view đẹp với không gian thoáng đãng, phong cách hiện đại pha lẫn nét cổ điển của Đà Lạt. Địa điểm lý tưởng để thưởng thức cà phê, đọc sách và ngắm nhìn thành phố từ trên cao.",
  images: [
    "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2947&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1493857671505-72967e2e2760?q=80&w=2940&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2940&auto=format&fit=crop",
  ],
  features: [
    { icon: "wifi", label: "Wifi miễn phí" },
    { icon: "car", label: "Bãi đỗ xe" },
    { icon: "credit-card", label: "Thanh toán thẻ" },
    { icon: "air-conditioner", label: "Máy lạnh" },
  ],
  popularDishes: [
    {
      id: "1",
      name: "Cà phê sữa đá",
      price: "35.000đ",
      image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=2787&auto=format&fit=crop",
      description: "Cà phê phin truyền thống với sữa đặc",
    },
    {
      id: "2",
      name: "Bánh mì chảo",
      price: "55.000đ",
      image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?q=80&w=2874&auto=format&fit=crop",
      description: "Bánh mì nướng với trứng và pate",
    },
  ],
  menu: {
    drinks: [
      {
        id: "1",
        name: "Cà phê sữa đá",
        price: "35.000đ",
        description: "Cà phê phin truyền thống với sữa đặc",
        image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=2787&auto=format&fit=crop",
        category: "Cà phê",
      },
      {
        id: "2",
        name: "Cappuccino",
        price: "45.000đ",
        description: "Cà phê Ý với sữa tươi đánh bông",
        image: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?q=80&w=2787&auto=format&fit=crop",
        category: "Cà phê",
      },
    ],
    food: [
      {
        id: "3",
        name: "Bánh mì chảo",
        price: "55.000đ",
        description: "Bánh mì nướng với trứng và pate",
        image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?q=80&w=2874&auto=format&fit=crop",
        category: "Điểm tâm",
      },
      {
        id: "4",
        name: "Croissant",
        price: "35.000đ",
        description: "Bánh sừng bò Pháp",
        image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=2726&auto=format&fit=crop",
        category: "Bánh ngọt",
      },
    ],
  },
  checkinSpots: [
    {
      id: "1",
      image: "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?q=80&w=2940&auto=format&fit=crop",
      description: "Góc ban công view thành phố",
    },
    {
      id: "2",
      image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=2940&auto=format&fit=crop",
      description: "Khu vườn xanh mát",
    },
    {
      id: "3",
      image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=2940&auto=format&fit=crop",
      description: "Góc vintage trong nhà",
    },
  ],
};

export default function CafeDetailScreen({ navigation }: any) {
  const [isFavorite, setIsFavorite] = useState(false);

  const handleBooking = () => {
    navigation.navigate('Booking', {
      cafeName: MOCK_CAFE.name,
      cafeAddress: MOCK_CAFE.address,
    });
  };

  const renderFeatures = () => (
    <View style={styles.featuresContainer}>
      {MOCK_CAFE.features.map((feature, index) => (
        <View key={index} style={styles.featureItem}>
          <MaterialCommunityIcons name={feature.icon} size={24} color="#4A90E2" />
          <Text style={styles.featureLabel}>{feature.label}</Text>
        </View>
      ))}
    </View>
  );

  const renderPopularDishes = () => (
    <View style={styles.popularDishesContainer}>
      <Text style={styles.sectionTitle}>Món nổi bật</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.popularDishesScroll}
      >
        {MOCK_CAFE.popularDishes.map((dish) => (
          <TouchableOpacity key={dish.id} style={styles.popularDishCard}>
            <Image source={{ uri: dish.image }} style={styles.popularDishImage} />
            <View style={styles.popularDishInfo}>
              <Text style={styles.popularDishName}>{dish.name}</Text>
              <Text style={styles.popularDishDescription}>{dish.description}</Text>
              <Text style={styles.popularDishPrice}>{dish.price}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      >
        <ImageCarousel images={MOCK_CAFE.images} navigation={navigation} />
        
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500 }}
          style={styles.content}
        >
          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>{MOCK_CAFE.description}</Text>
          </View>

          {renderFeatures()}
          {renderPopularDishes()}

          <BasicInfo cafe={MOCK_CAFE} />
          <MenuSection menuItems={[...MOCK_CAFE.menu.drinks, ...MOCK_CAFE.menu.food]} />
          <CheckinGallery spots={MOCK_CAFE.checkinSpots} />
          <ReviewSection cafe={MOCK_CAFE} />
        </MotiView>
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

        <TouchableOpacity 
          style={styles.bookingButton}
          onPress={handleBooking}
        >
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
    backgroundColor: "white",
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
  popularDishesContainer: {
    marginBottom: 24,
  },
  popularDishesScroll: {
    paddingHorizontal: 4,
    gap: 16,
  },
  popularDishCard: {
    width: 280,
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  popularDishImage: {
    width: "100%",
    height: 160,
  },
  popularDishInfo: {
    padding: 12,
    gap: 4,
  },
  popularDishName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
  },
  popularDishDescription: {
    fontSize: 14,
    color: "#64748B",
  },
  popularDishPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4A90E2",
    marginTop: 4,
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
});