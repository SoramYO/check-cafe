import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const FAVORITE_CAFES = [
  {
    id: '1',
    name: 'The Dreamer Coffee',
    address: '123 Đường Trần Hưng Đạo, Phường 10, Đà Lạt',
    rating: 4.8,
    reviews: 256,
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2947&auto=format&fit=crop',
    status: 'open',
    distance: '0.8km',
  },
  {
    id: '2',
    name: 'Mountain View Café',
    address: '45 Đường Lê Đại Hành, Đà Lạt',
    rating: 4.6,
    reviews: 189,
    image: 'https://images.unsplash.com/photo-1493857671505-72967e2e2760?q=80&w=2940&auto=format&fit=crop',
    status: 'busy',
    distance: '1.2km',
  },
  {
    id: '3',
    name: 'Horizon Coffee',
    address: '78 Đường Nguyễn Chí Thanh, Đà Lạt',
    rating: 4.7,
    reviews: 210,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2940&auto=format&fit=crop',
    status: 'open',
    distance: '2.0km',
  },
];

const FAVORITE_DISHES = [
  {
    id: '1',
    name: 'Cà phê sữa đá',
    price: '35.000đ',
    description: 'Cà phê phin truyền thống với sữa đặc',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=2787&auto=format&fit=crop',
    cafe: 'The Dreamer Coffee',
    rating: 4.8,
    reviews: 120,
  },
  {
    id: '2',
    name: 'Cappuccino',
    price: '45.000đ',
    description: 'Cà phê Ý với sữa tươi đánh bông',
    image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?q=80&w=2787&auto=format&fit=crop',
    cafe: 'Mountain View Café',
    rating: 4.6,
    reviews: 85,
  },
];

export default function FavoritesScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('cafes'); // 'cafes' or 'dishes'

  const renderCafeCard = (cafe) => (
    <TouchableOpacity
      key={cafe.id}
      style={styles.cafeCard}
      onPress={() => navigation.navigate('CafeDetail', { cafeId: cafe.id })}
    >
      <Image source={{ uri: cafe.image }} style={styles.cafeImage} />
      <View style={styles.cafeContent}>
        <View style={styles.cafeHeader}>
          <View>
            <Text style={styles.cafeName}>{cafe.name}</Text>
            <View style={styles.ratingContainer}>
              <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
              <Text style={styles.rating}>{cafe.rating}</Text>
              <Text style={styles.reviews}>({cafe.reviews} đánh giá)</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.favoriteButton}>
            <MaterialCommunityIcons name="heart" size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>

        <View style={styles.cafeDetails}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="map-marker" size={16} color="#64748B" />
            <Text style={styles.address}>{cafe.address}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="walk" size={16} color="#64748B" />
            <Text style={styles.distance}>{cafe.distance}</Text>
          </View>
        </View>

        <View style={styles.cafeFooter}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: cafe.status === 'open' ? '#4CAF50' : '#FF9800' }
          ]}>
            <Text style={styles.statusText}>
              {cafe.status === 'open' ? 'Đang mở cửa' : 'Đông khách'}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.bookButton}
            onPress={() => navigation.navigate('Booking', {
              cafeName: cafe.name,
              cafeAddress: cafe.address,
            })}
          >
            <Text style={styles.bookButtonText}>Đặt chỗ</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderDishCard = (dish) => (
    <TouchableOpacity
      key={dish.id}
      style={styles.dishCard}
      onPress={() => navigation.navigate('CafeDetail', { dishId: dish.id })}
    >
      <Image source={{ uri: dish.image }} style={styles.dishImage} />
      <View style={styles.dishContent}>
        <View style={styles.dishHeader}>
          <Text style={styles.dishName}>{dish.name}</Text>
          <TouchableOpacity style={styles.favoriteButton}>
            <MaterialCommunityIcons name="heart" size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.dishDescription} numberOfLines={2}>
          {dish.description}
        </Text>

        <View style={styles.dishInfo}>
          <Text style={styles.dishPrice}>{dish.price}</Text>
          <View style={styles.ratingContainer}>
            <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
            <Text style={styles.rating}>{dish.rating}</Text>
            <Text style={styles.reviews}>({dish.reviews})</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.cafeBadge}>
          <MaterialCommunityIcons name="store" size={16} color="#4A90E2" />
          <Text style={styles.cafeName}>{dish.cafe}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

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
          style={[styles.tab, activeTab === 'cafes' && styles.activeTab]}
          onPress={() => setActiveTab('cafes')}
        >
          <MaterialCommunityIcons
            name="store"
            size={20}
            color={activeTab === 'cafes' ? '#4A90E2' : '#64748B'}
          />
          <Text style={[
            styles.tabText,
            activeTab === 'cafes' && styles.activeTabText
          ]}>
            Quán yêu thích
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'dishes' && styles.activeTab]}
          onPress={() => setActiveTab('dishes')}
        >
          <MaterialCommunityIcons
            name="food"
            size={20}
            color={activeTab === 'dishes' ? '#4A90E2' : '#64748B'}
          />
          <Text style={[
            styles.tabText,
            activeTab === 'dishes' && styles.activeTabText
          ]}>
            Món yêu thích
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {activeTab === 'cafes' 
          ? FAVORITE_CAFES.map(renderCafeCard)
          : FAVORITE_DISHES.map(renderDishCard)
        }
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  cafeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cafeImage: {
    width: '100%',
    height: 200,
  },
  cafeContent: {
    padding: 16,
    gap: 12,
  },
  cafeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cafeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  reviews: {
    fontSize: 12,
    color: '#64748B',
  },
  favoriteButton: {
    padding: 8,
  },
  cafeDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  address: {
    fontSize: 14,
    color: '#64748B',
    flex: 1,
  },
  distance: {
    fontSize: 14,
    color: '#64748B',
  },
  cafeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  bookButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#EBF5FF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  activeTabText: {
    color: '#4A90E2',
  },
  dishCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dishImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  dishContent: {
    padding: 16,
    gap: 12,
  },
  dishHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dishName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  dishDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  dishInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dishPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
  },
  cafeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 6,
  },
  cafeName: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '500',
  },
});