import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  getFavoriteMenuItems,
  getFavoriteShops,
  toggleFavorite,
  toggleFavoriteMenu,
} from "../utils/favoritesStorage";
import userAPI from "../services/userAPI";
import { useFocusEffect } from "@react-navigation/native";

export default function FavoritesScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("cafes");
  const [shops, setShops] = useState([]);
  const [metadata, setMetadata] = useState({});
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState([]);

  useFocusEffect(
    useCallback(() => {
      fetchFavoriteShops();
      fetchFavoriteMenuItems();
    }, [])
  );

  const fetchFavoriteShops = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const data = await getFavoriteShops();
      setShops(data);
    } catch (err) {
      // handle error
    }
    setLoading(false);
  };

  const fetchFavoriteMenuItems = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const data = await getFavoriteMenuItems();
      setMenuItems(data);
    } catch (err) {
      // handle error
    }
    setLoading(false);
  };

  const handleToggleFavoriteShop = async (shop) => {
    await toggleFavorite(shop);
    fetchFavoriteShops(); // Reload favorites after toggling
  };

  const handleToggleFavoriteDish = async (dish) => {
    await toggleFavoriteMenu(dish);
    fetchFavoriteMenuItems(); // Reload favorites after toggling
  };

  const renderCafeCard = ({ item: cafe }) => (
    <TouchableOpacity
      style={styles.shopCard}
      onPress={() => navigation.navigate("CafeDetail", { shopId: cafe._id })}
    >
      <Image source={{ uri: cafe?.mainImage?.url }} style={styles.cafeImage} />
      <View style={styles.cafeContent}>
        <View style={styles.cafeHeader}>
          <View>
            <Text style={styles.cafeName}>{cafe.name}</Text>
            <View style={styles.ratingContainer}>
              <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
              <Text style={styles.rating}>{cafe.rating_avg || 0}</Text>
              <Text style={styles.reviews}>
                ({cafe.rating_count || 0} đánh giá)
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.favoriteButton} onPress={() => handleToggleFavoriteShop(cafe)}>
            <MaterialCommunityIcons name="heart" size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>
        <View style={styles.cafeDetails}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons
              name="map-marker"
              size={16}
              color="#64748B"
            />
            <Text style={styles.address}>{cafe.address}</Text>
          </View>
        </View>
        <View style={styles.cafeFooter}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: cafe.is_open ? "#4CAF50" : "#FF9800" },
            ]}
          >
            <Text style={styles.statusText}>
              {cafe.is_open ? "Đang mở cửa" : "Đóng cửa"}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => navigation.navigate("Booking", { shopId: cafe._id })}
          >
            <Text style={styles.bookButtonText}>Đặt chỗ</Text>
            <MaterialCommunityIcons
              name="arrow-right"
              size={20}
              color="white"
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderDishCard = ({ item: dish }) => {
    return (
      <TouchableOpacity
        style={styles.dishCard}
        onPress={() =>
          navigation.navigate("MenuItemDetail", { menuItem: dish })
        }
      >
        <Image
          source={{
            uri:
              dish.images?.[0]?.url ||
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTt-kLox6r5K7OxuCAm3v7tgbXllRTBxw-RVw&s",
          }}
          style={styles.dishImage}
        />
        <View style={styles.dishContent}>
          <View style={styles.dishHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.dishName} numberOfLines={1}>
                {dish.name}
              </Text>
              <Text style={styles.dishDescription} numberOfLines={2}>
                {dish.description}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.favoriteButton} 
              onPress={() => handleToggleFavoriteDish(dish)}
            >
              <MaterialCommunityIcons name="heart" size={24} color="#EF4444" />
            </TouchableOpacity>
          </View>

          <View style={styles.dishInfo}>
            <View style={styles.priceContainer}>
              <MaterialCommunityIcons name="cash" size={16} color="#64748B" />
              <Text style={styles.dishPrice}>
                {dish.price ? dish.price.toLocaleString() + "đ" : ""}
              </Text>
            </View>
            <View style={styles.ratingContainer}>
              <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
              <Text style={styles.rating}>{dish.rating || 0}</Text>
              <Text style={styles.reviews}>({dish.reviews || 0})</Text>
            </View>
          </View>

          <View style={styles.dishFooter}>
            <View style={[styles.statusBadge, { backgroundColor: dish.is_available ? "#DFF7E9" : "#FEE2E2" }]}>
              <MaterialCommunityIcons
                name={dish.is_available ? "check-circle" : "close-circle"}
                size={16}
                color={dish.is_available ? "#10B981" : "#EF4444"}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: dish.is_available ? "#10B981" : "#EF4444" }
                ]}
              >
                {dish.is_available ? "Có sẵn" : "Hết hàng"}
              </Text>
            </View>

            {dish.shop_id && (
              <TouchableOpacity 
                style={styles.cafeBadge}
                onPress={() => navigation.navigate("CafeDetail", { shopId: dish.shop_id })}
              >
                <MaterialCommunityIcons name="store" size={16} color="#4A90E2" />
                <Text style={styles.cafeBadgeText} numberOfLines={1}>
                  {dish.shop_id.name || "Cửa hàng"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>Yêu thích</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "cafes" && styles.activeTab]}
          onPress={() => setActiveTab("cafes")}
        >
          <MaterialCommunityIcons
            name="store"
            size={20}
            color={activeTab === "cafes" ? "#7a5545" : "#7a5545"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "cafes" && styles.activeTabText,
            ]}
          >
            Quán yêu thích
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "dishes" && styles.activeTab]}
          onPress={() => setActiveTab("dishes")}
        >
          <MaterialCommunityIcons
            name="food"
            size={20}
            color={activeTab === "dishes" ? "#7a5545" : "#7a5545"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "dishes" && styles.activeTabText,
            ]}
          >
            Món yêu thích
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "cafes" ? (
        <FlatList
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          data={shops}
          keyExtractor={(item) => item._id}
          renderItem={renderCafeCard}
        />
      ) : (
        <FlatList
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          data={menuItems}
          keyExtractor={(item) => item._id}
          renderItem={renderDishCard}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#BFA58E",
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1E293B",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 20,
  },
  tabContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "white",
    borderBottomColor: "#BFA58E",
    borderBottomWidth: 1,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#F8FAF9",
    gap: 8,
    borderWidth: 1,
    borderColor: "#BFA58E",
  },
  activeTab: {
    backgroundColor: "#f1f1f1",
    borderColor: "#BFA58E",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B4F3F",
  },
  activeTabText: {
    color: "#6B4F3F",
    fontWeight: "700",
  },
  shopCard: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#BFA58E",
    overflow: "hidden",
  },
  cafeImage: {
    width: "100%",
    height: 200,
  },
  cafeContent: {
    padding: 16,
    gap: 16,
  },
  cafeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cafeName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEF9C3",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  rating: {
    fontSize: 14,
    fontWeight: "600",
    color: "#854D0E",
  },
  reviews: {
    fontSize: 12,
    color: "#854D0E",
  },
  favoriteButton: {
    padding: 10,
    backgroundColor: "#FFF1F2",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECDD3",
  },
  cafeDetails: {
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  address: {
    fontSize: 14,
    color: "#475569",
    flex: 1,
    lineHeight: 20,
  },
  cafeFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  bookButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7a5545",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  dishCard: {
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#BFA58E",
    flexDirection: "row",
    height: 120,
  },
  dishImage: {
    width: 120,
    height: "100%",
    resizeMode: "cover",
  },
  dishContent: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  dishHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  dishName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 4,
  },
  dishDescription: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 16,
  },
  favoriteButton: {
    padding: 4,
    backgroundColor: "#FFF1F2",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FECDD3",
  },
  dishInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 4,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dishPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2C3E50",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEF9C3",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  rating: {
    fontSize: 12,
    fontWeight: "600",
    color: "#854D0E",
  },
  reviews: {
    fontSize: 10,
    color: "#854D0E",
  },
  dishFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  cafeBadge: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  cafeBadgeText: {
    fontSize: 12,
    color: "#4A90E2",
    fontWeight: "500",
    flex: 1,
  },
});
