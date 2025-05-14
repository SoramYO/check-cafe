import React, { useState } from "react";
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

const MenuSection = ({
  menuItems,
  onItemPress,
}) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const categories = [
    "all",
    ...new Set(menuItems?.map((item) => item.category)),
  ];

  const filteredItems =
    selectedCategory === "all"
      ? menuItems
      : menuItems?.filter((item) => item.category === selectedCategory);

  const renderCategoryTab = (category) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryTab,
        selectedCategory === category && styles.categoryTabActive,
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <MaterialCommunityIcons
        name={getCategoryIcon(category)}
        size={20}
        color={selectedCategory === category ? "white" : "#64748B"}
        style={styles.categoryIcon}
      />
      <Text
        style={[
          styles.categoryTabText,
          selectedCategory === category && styles.categoryTabTextActive,
        ]}
      >
        {category === "all" ? "Tất cả" : category}
      </Text>
    </TouchableOpacity>
  );

  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case "all":
        return "menu";
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
      key={item.id || item.name}
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
            <TouchableOpacity style={styles.favoriteButton}>
              <MaterialCommunityIcons
                name="heart-outline"
                size={16}
                color="#FF4B4B"
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
          {categories?.map(renderCategoryTab)}
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
    color: "#1E293B",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
  },
  filterButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
  },
  categoriesWrapper: {
    paddingBottom: 8,
    backgroundColor: "white",
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
    backgroundColor: "#F8FAFC",
    gap: 6,
    justifyContent: "center",
  },
  categoryIcon: {
    marginRight: 4,
  },
  categoryTabActive: {
    backgroundColor: "#4A90E2",
  },
  categoryTabText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  categoryTabTextActive: {
    color: "white",
  },
  menuList: {
    padding: 16,
    gap: 16,
  },
  menuItem: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
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
    color: "#1E293B",
    flex: 1,
  },
  popularBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF9C3",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  popularText: {
    fontSize: 12,
    color: "#854D0E",
    fontWeight: "500",
  },
  menuItemDescription: {
    fontSize: 14,
    color: "#64748B",
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
    color: "#4A90E2",
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
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
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
