import React from 'react';
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

export default function FavoritesScreen({ navigation }) {
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>Quán yêu thích</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {FAVORITE_CAFES.map(renderCafeCard)}
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
});