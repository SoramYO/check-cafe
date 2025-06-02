import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { formatPrice } from "../../utils/formatHelpers";
import { useFocusEffect } from "@react-navigation/native";
import { getFavoriteMenuItems, toggleFavoriteMenu } from "../../utils/favoritesStorage";

const MenuSection = ({ menuItems, onItemPress }) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [favoriteMenuItems, setFavoriteMenuItems] = useState([]);

  useEffect(() => {
    // Create a map to store unique categories
    const uniqueCategories = new Map();

    // Add "all" category first
    uniqueCategories.set("all", {
      _id: "all",
      name: "Tất cả",
    });

    // Add other categories, preventing duplicates by _id
    menuItems?.forEach((item) => {
      if (item.category && !uniqueCategories.has(item.category._id)) {
        uniqueCategories.set(item.category._id, item.category);
      }
    });

    // Convert map to array
    setCategories(Array.from(uniqueCategories.values()));
  }, [menuItems]);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    const favorites = await getFavoriteMenuItems();
    setFavoriteMenuItems(favorites);
  };

  const filteredItems =
    selectedCategory === "all"
      ? menuItems
      : menuItems?.filter((item) => item.category?._id === selectedCategory);

  const isMenuFavorite = (menuId) => {
    return favoriteMenuItems.some((menu) => menu._id === menuId);
  };

  const handleToggleFavorite = async (menu) => {
    await toggleFavoriteMenu(menu);
    loadFavorites();
  };

  const renderCategoryTab = (category) => (
    <TouchableOpacity
      key={category._id}
      style={[
        styles.categoryTab,
        selectedCategory === category._id && styles.categoryTabActive,
      ]}
      onPress={() => setSelectedCategory(category._id)}
    >
      <MaterialCommunityIcons
        name={getCategoryIcon(category)}
        size={20}
        color={selectedCategory === category._id ? "white" : "#7a5545"}
        style={styles.categoryIcon}
      />
      <Text
        style={[
          styles.categoryTabText,
          selectedCategory === category._id && styles.categoryTabTextActive,
        ]}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );

  const getCategoryIcon = (category) => {
    if (category._id === "all") return "menu";

    switch (category?.name?.toLowerCase()) {
      case "cà phê":
        return "coffee";
      case "trà":
        return "tea";
      case "nước ép":
        return "fruit-watermelon";
      case "sinh tố":
        return "blender";
      case "bánh ngọt":
        return "cake";
      default:
        return "food";
    }
  };

  const renderMenuItem = (item) => (
    <TouchableOpacity
      key={item._id || item.name}
      style={styles.menuItem}
      onPress={() => onItemPress && onItemPress(item)}
    >
      <View style={styles.menuItemContent}>
        <View style={styles.menuDetails}>
          <View style={styles.menuItemHeader}>
            <Text style={styles.menuItemName}>{item.name}</Text>
            {item.isPopular && (
              <View style={styles.popularBadge}>
                <MaterialCommunityIcons name="star" size={12} color="#FFD700" />
                <Text style={styles.popularText}>Phổ biến</Text>
              </View>
            )}
          </View>
          <Text style={styles.menuItemDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.menuItemFooter}>
            <Text style={styles.menuItemPrice}>{formatPrice(item.price)}</Text>
          </View>
        </View>
        {item.images && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.images[0].url }}
              style={styles.menuItemImage}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={() => handleToggleFavorite(item)}
            >
              <MaterialCommunityIcons
                name={isMenuFavorite(item._id) ? "heart" : "heart-outline"}
                size={20}
                color={isMenuFavorite(item._id) ? "#EF4444" : "#666"}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.sectionTitle}>Thực đơn</Text>
          <Text style={styles.subtitle}>{filteredItems?.length || 0} món</Text>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <MaterialCommunityIcons
            name="tune-vertical"
            size={24}
            color="#64748B"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.categoriesWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map(renderCategoryTab)}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.menuList}
      >
        {filteredItems?.map(renderMenuItem)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
    marginVertical: 8,
    maxHeight: 700,
    shadowColor: "#BFA58E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#6B4F3F",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#BFA58E",
  },
  filterButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#fcedd6",
  },
  categoriesWrapper: {
    paddingBottom: 8,
  },
  categoriesContainer: {
    flexGrow: 0,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    gap: 6,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E8D3C3",
  },
  categoryIcon: {
    marginRight: 4,
  },
  categoryTabActive: {
    backgroundColor: "#7a5545",
  },
  categoryTabText: {
    fontSize: 14,
    color: "#6B4F3F",
    fontWeight: "500",
  },
  categoryTabTextActive: {
    color: "#FFF9F5",
  },
  menuList: {
    padding: 16,
    gap: 16,
  },
  menuItem: {
    backgroundColor: "#FFF9F5",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E8D3C3",
    shadowColor: "#BFA58E",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  menuItemContent: {
    flexDirection: "row",
    gap: 16,
  },
  menuDetails: {
    flex: 1,
    gap: 8,
  },
  menuItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B4F3F",
    flex: 1,
  },
  popularBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fcedd6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  popularText: {
    fontSize: 12,
    color: "#6B4F3F",
    fontWeight: "500",
  },
  menuItemDescription: {
    fontSize: 14,
    color: "#BFA58E",
    lineHeight: 20,
  },
  menuItemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7a5545",
  },
  imageContainer: {
    position: "relative",
  },
  menuItemImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  favoriteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFF9F5",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#BFA58E",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default MenuSection;
