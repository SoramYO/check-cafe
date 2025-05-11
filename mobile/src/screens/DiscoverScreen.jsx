import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import FeaturedBanner from '../components/FeaturedBanner';
import SearchBar from '../components/SearchBar';

const CATEGORIES = [
  { id: '1', name: 'Yên tĩnh', icon: 'peace' },
  { id: '2', name: 'View đẹp', icon: 'image-filter-hdr' },
  { id: '3', name: 'Vintage', icon: 'camera-retro' },
  { id: '4', name: 'Nhạc sống', icon: 'music' },
  { id: '5', name: 'Làm việc', icon: 'laptop' },
];

const FEATURED_SHOPS = [
  {
    id: '1',
    name: 'The Dreamer Coffee',
    address: '123 Đường Trần Hưng Đạo, Đà Lạt',
    rating: 4.8,
    reviews: 256,
    image: 'https://api.a0.dev/assets/image?text=cozy+dalat+coffee+shop+with+mountain+view&aspect=16:9',
    distance: '0.8km',
    price: '$$',
    status: 'Mở cửa',
    features: ['Wifi', 'Chỗ đỗ xe'],
  },
  {
    id: '2',
    name: 'Mountain View Café',
    address: '45 Đường Lê Đại Hành, Đà Lạt',
    rating: 4.6,
    reviews: 189,
    image: 'https://api.a0.dev/assets/image?text=vintage+cafe+in+dalat+with+garden&aspect=16:9',
    distance: '1.2km',
    price: '$$$',
    status: 'Đông',
    features: ['Wifi', 'Bàn ngoài trời'],
  },
];

export default function DiscoverScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const scrollY = useRef(new Animated.Value(0)).current;

  const renderCategory = ({ item }) => (
    <TouchableOpacity style={styles.categoryItem}>
      <View style={styles.categoryIcon}>
        <MaterialCommunityIcons name={item.icon} size={24} color="#4A90E2" />
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderShopCard = ({ item }) => (
    <TouchableOpacity
      style={styles.shopCard}
      onPress={() => navigation.navigate('CafeDetail', { cafeId: item.id })}
    >
      <Image source={{ uri: item.image }} style={styles.shopImage} />
      <View style={styles.shopInfo}>
        <View style={styles.shopHeader}>
          <View>
            <Text style={styles.shopName}>{item.name}</Text>
            <View style={styles.ratingContainer}>
              <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
              <Text style={styles.rating}>{item.rating}</Text>
              <Text style={styles.reviews}>({item.reviews} đánh giá)</Text>
              <Text style={styles.price}>{item.price}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge,
          { backgroundColor: item.status === 'Mở cửa' ? '#4CAF50' : '#FF9800' }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.shopDetails}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="map-marker" size={16} color="#666" />
            <Text style={styles.shopAddress}>{item.address}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="walk" size={16} color="#666" />
            <Text style={styles.distance}>{item.distance}</Text>
          </View>
        </View>

        <View style={styles.features}>
          {item.features.map((feature, index) => (
            <View key={index} style={styles.featureBadge}>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.bookButton} onPress={() => navigation.navigate('Booking')}>
          <Text style={styles.bookButtonText}>Đặt chỗ</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -50],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, { transform: [{ translateY: headerHeight }] }]}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onPressFilter={() => { }}
          onPressVoice={() => { }}
        />
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <FeaturedBanner />

        <View style={styles.categoriesContainer}>
          <FlatList
            data={CATEGORIES}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>

        <View style={styles.featuredContainer}>
          <Text style={styles.sectionTitle}>Quán cà phê hot ở Đà Lạt</Text>
          <FlatList
            data={FEATURED_SHOPS}
            renderItem={renderShopCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
      </Animated.ScrollView>

      <TouchableOpacity style={styles.fab}>
        <MaterialCommunityIcons name="plus" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: 'white',
    zIndex: 1000,
  },
  categoriesContainer: {
    marginTop: 15,
    marginBottom: 5,
  },
  categoryItem: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    marginTop: 8,
    fontSize: 12,
    color: '#333',
  },
  featuredContainer: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  shopCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  shopImage: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  shopInfo: {
    padding: 15,
  },
  shopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  shopName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    color: '#333',
    fontWeight: 'bold',
  },
  reviews: {
    color: '#666',
    fontSize: 12,
  },
  price: {
    color: '#666',
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  shopDetails: {
    marginTop: 10,
    gap: 5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  shopAddress: {
    color: '#666',
    flex: 1,
    fontSize: 14,
  },
  distance: {
    color: '#666',
    fontSize: 14,
  },
  features: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 8,
  },
  featureBadge: {
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featureText: {
    color: '#4A90E2',
    fontSize: 12,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    gap: 8,
  },
  bookButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});