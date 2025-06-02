import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { toggleFavoriteMenu } from "../utils/favoritesStorage";

const { width } = Dimensions.get("window");

export default function MenuItemDetailScreen({ route, navigation }) {
  const { menuItem } = route.params;
  const [isFavorite, setIsFavorite] = useState(false);

  const handleToggleFavorite = async () => {
    if (menuItem) {
      await toggleFavoriteMenu(menuItem);
      setIsFavorite(!isFavorite);
    }
  };

  if (!menuItem) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialCommunityIcons name="coffee" size={48} color="#7a5545" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: menuItem.images[0]?.url }}
            style={styles.image}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleToggleFavorite}
          >
            <MaterialCommunityIcons
              name={isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={isFavorite ? "#EF4444" : "white"}
            />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Category Badge */}
          <View style={styles.categoryBadge}>
            <MaterialCommunityIcons name="coffee" size={16} color="#7a5545" />
            <Text style={styles.categoryText}>{menuItem.category.name}</Text>
          </View>

          {/* Title and Price */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{menuItem.name}</Text>
            <Text style={styles.price}>
              {menuItem.price.toLocaleString()}đ
            </Text>
          </View>

          {/* Availability Badge */}
          <View
            style={[
              styles.availabilityBadge,
              {
                backgroundColor: menuItem.is_available
                  ? "#DFF7E9"
                  : "#FEE2E2",
              },
            ]}
          >
            <MaterialCommunityIcons
              name={menuItem.is_available ? "check-circle" : "close-circle"}
              size={16}
              color={menuItem.is_available ? "#10B981" : "#EF4444"}
            />
            <Text
              style={[
                styles.availabilityText,
                {
                  color: menuItem.is_available ? "#10B981" : "#EF4444",
                },
              ]}
            >
              {menuItem.is_available ? "Có sẵn" : "Hết hàng"}
            </Text>
          </View>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>Mô tả</Text>
            <Text style={styles.description}>{menuItem.description}</Text>
          </View>

          {/* Category Description */}
          <View style={styles.categoryDescriptionContainer}>
            <Text style={styles.categoryDescriptionTitle}>
              Về {menuItem.category.name}
            </Text>
            <Text style={styles.categoryDescription}>
              {menuItem.category.description}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            !menuItem.is_available && styles.disabledButton,
          ]}
          disabled={!menuItem.is_available}
          onPress={() => {
            // Handle order or add to cart
            navigation.navigate("CafeDetail", { shopId: menuItem.shop_id });
          }}
        >
          <Text style={styles.actionButtonText}>
            {menuItem.is_available ? "Xem quán" : "Hết hàng"}
          </Text>
          <MaterialCommunityIcons
            name="arrow-right"
            size={20}
            color="white"
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: "#7a5545",
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: width,
    height: width * 0.8,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 20,
    gap: 16,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#FFF3E9",
    gap: 6,
  },
  categoryText: {
    fontSize: 14,
    color: "#7a5545",
    fontWeight: "500",
  },
  titleContainer: {
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E293B",
    letterSpacing: 0.3,
  },
  price: {
    fontSize: 20,
    fontWeight: "700",
    color: "#7a5545",
  },
  availabilityBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  availabilityText: {
    fontSize: 14,
    fontWeight: "500",
  },
  descriptionContainer: {
    gap: 8,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
  },
  description: {
    fontSize: 15,
    color: "#64748B",
    lineHeight: 22,
  },
  categoryDescriptionContainer: {
    gap: 8,
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 12,
  },
  categoryDescriptionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
  },
  categoryDescription: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
  },
  bottomContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    backgroundColor: "white",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7a5545",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: "#CBD5E1",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
}); 