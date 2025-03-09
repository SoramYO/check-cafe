import React from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  imageUrl?: string;
  category: string;
}

interface MenuSectionProps {
  menuItems: MenuItem[];
  onItemPress?: (item: MenuItem) => void;
}

const MenuSection: React.FC<MenuSectionProps> = ({ menuItems, onItemPress }) => {
  const { colors } = useTheme();

  // Group menu items by category
  const groupedMenu = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const categories = Object.keys(groupedMenu);

  const renderMenuItem = ({ item }: { item: MenuItem }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => onItemPress && onItemPress(item)}
    >
      <View style={styles.menuItemContent}>
        <View style={styles.menuDetails}>
          <ThemedText style={styles.menuItemName}>{item.name}</ThemedText>
          <ThemedText style={styles.menuItemDescription}>{item.description}</ThemedText>
          <ThemedText style={styles.menuItemPrice}>{item.price}</ThemedText>
        </View>
        {(item.imageUrl || item.image) && (
          <Image
            source={{ uri: item.imageUrl || item.image }}
            style={styles.menuItemImage}
            resizeMode="cover"
          />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.sectionTitle}>Menu</ThemedText>

      {categories.map((category) => (
        <View key={category} style={styles.categoryContainer}>
          <ThemedText style={styles.categoryTitle}>{category}</ThemedText>
          <FlatList
            data={groupedMenu[category]}
            keyExtractor={(item) => item.id}
            renderItem={renderMenuItem}
            scrollEnabled={false}
          />
        </View>
      ))}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  menuItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  menuDetails: {
    flex: 1,
    marginRight: 12,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  menuItemPrice: {
    fontSize: 15,
    fontWeight: '600',
  },
  menuItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
});

export default MenuSection; 