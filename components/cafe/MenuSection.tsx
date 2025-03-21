import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MotiView } from 'moti';

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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const categories = ['all', ...new Set(menuItems.map(item => item.category))];
  
  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const renderCategoryTab = (category: string) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryTab,
        selectedCategory === category && styles.categoryTabActive
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <Text style={[
        styles.categoryTabText,
        selectedCategory === category && styles.categoryTabTextActive
      ]}>
        {category === 'all' ? 'Tất cả' : category}
      </Text>
    </TouchableOpacity>
  );

  const renderMenuItem = (item: MenuItem) => (
    <MotiView
      key={item.id}
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 500 }}
    >
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => onItemPress && onItemPress(item)}
      >
        <View style={styles.menuItemContent}>
          <View style={styles.menuDetails}>
            <Text style={styles.menuItemName}>{item.name}</Text>
            <Text style={styles.menuItemDescription}>{item.description}</Text>
            <Text style={styles.menuItemPrice}>{item.price}</Text>
          </View>
          {item.imageUrl && (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.menuItemImage}
              resizeMode="cover"
            />
          )}
        </View>
      </TouchableOpacity>
    </MotiView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Thực đơn</Text>
        <TouchableOpacity style={styles.filterButton}>
          <MaterialCommunityIcons name="tune-vertical" size={24} color="#64748B" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        {categories.map(renderCategoryTab)}
      </ScrollView>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.menuList}
      >
        {filteredItems.map(renderMenuItem)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 8,
    maxHeight: 500, // Add max height to make the menu section scrollable
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  categoriesContainer: {
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 4,
  },
  categoryTabActive: {
    backgroundColor: '#4A90E2',
  },
  categoryTabText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  categoryTabTextActive: {
    color: 'white',
  },
  menuList: {
    padding: 16,
    gap: 16,
  },
  menuItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  menuItemContent: {
    flexDirection: 'row',
    gap: 12,
  },
  menuDetails: {
    flex: 1,
    gap: 4,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
  },
  menuItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
});

export default MenuSection;