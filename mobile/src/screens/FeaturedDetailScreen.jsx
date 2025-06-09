import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import advertisementAPI from '../services/advertisementsAPI';

const FEATURED_DETAILS = {
  discover: {
    title: 'Khám phá Horizon Coffee',
    subtitle: 'View đồi núi đỉnh cao',
    image: 'https://images.unsplash.com/photo-1493857671505-72967e2e2760?q=80&w=2940&auto=format&fit=crop',
    description: 'Nằm trên đỉnh đồi với tầm nhìn bao quát thành phố Đà Lạt, Horizon Coffee mang đến trải nghiệm độc đáo với không gian mở thoáng đãng và view núi đồi tuyệt đẹp.',
    features: [
      { icon: 'image-filter-hdr', title: 'View Panorama', description: 'Tầm nhìn 360 độ ra thành phố và núi đồi' },
      { icon: 'weather-sunset', title: 'Hoàng hôn đẹp', description: 'Địa điểm lý tưởng để ngắm hoàng hôn' },
      { icon: 'coffee', title: 'Cà phê đặc sản', description: 'Các loại cà phê đặc sản Đà Lạt' },
      { icon: 'camera', title: 'Điểm check-in', description: 'Nhiều góc chụp hình đẹp' },
    ],
    photos: [
      'https://images.unsplash.com/photo-1445116572660-236099ec97a0?q=80&w=2942&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?q=80&w=2941&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?q=80&w=2940&auto=format&fit=crop',
    ],
  },
  promotion: {
    title: 'Giảm 20% tại Túi Mơ To',
    subtitle: 'Chỉ trong hôm nay',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2940&auto=format&fit=crop',
    description: 'Nhân dịp khai trương cơ sở mới, Túi Mơ To gửi tặng ưu đãi đặc biệt giảm 20% trên toàn bộ menu cho khách hàng đặt chỗ qua ứng dụng.',
    features: [
      { icon: 'sale', title: 'Giảm 20%', description: 'Áp dụng cho toàn bộ menu' },
      { icon: 'calendar-check', title: 'Thời gian', description: 'Từ 8:00 - 22:00 hôm nay' },
      { icon: 'ticket-percent', title: 'Không giới hạn', description: 'Áp dụng nhiều lần trong ngày' },
      { icon: 'information', title: 'Điều kiện', description: 'Đặt chỗ qua ứng dụng' },
    ],
    photos: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=2787&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1484723091739-30a097e8f929?q=80&w=2874&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?q=80&w=2787&auto=format&fit=crop',
    ],
  },
  event: {
    title: 'Festival Hoa Đà Lạt 2025',
    subtitle: 'Sắp diễn ra',
    image: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?q=80&w=2940&auto=format&fit=crop',
    description: 'Festival Hoa Đà Lạt 2025 sẽ diễn ra với nhiều hoạt động hấp dẫn. Đặc biệt, các quán cà phê trong khu vực festival sẽ có những ưu đãi và trang trí đặc biệt.',
    features: [
      { icon: 'calendar', title: 'Thời gian', description: 'Từ 1/1 - 5/1/2025' },
      { icon: 'map-marker', title: 'Địa điểm', description: 'Trung tâm Đà Lạt' },
      { icon: 'ticket', title: 'Vé vào cửa', description: 'Miễn phí' },
      { icon: 'store', title: 'Quán tham gia', description: '50+ quán cà phê' },
    ],
    photos: [
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=2940&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=2940&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?q=80&w=2940&auto=format&fit=crop',
    ],
  },
};

export default function FeaturedDetailScreen({ navigation, route }) {
  const { type, id } = route.params;
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const response = await advertisementAPI.HandleAdvertisement(`/${id}`);
        setDetails(response.data.advertisement);
      } catch (error) {
        console.error("Error fetching advertisement details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, []);

  const renderFeature = (feature, index) => (
    <View
      key={feature.title}
      style={styles.featureCard}
    >
      <MaterialCommunityIcons name={feature.icon} size={32} color="#7a5545" />
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{feature.title}</Text>
        <Text style={styles.featureDescription}>{feature.description}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7a5545" />
          <Text style={styles.loadingText}>Đang tải chi tiết...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!details) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorText}>Không thể tải thông tin</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: details?.image }} style={styles.headerImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.gradient}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <View style={styles.content}>
          <View>
            <Text style={styles.title}>{details?.title}</Text>
            <Text style={styles.subtitle}>{details?.subtitle}</Text>
            <Text style={styles.description}>{details?.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin chi tiết</Text>
            <View style={styles.featuresGrid}>
              {details?.features?.map(renderFeature)}
            </View>
          </View>
        </View>
      </ScrollView>

      {details?.type === 'promotion' && (
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Đặt chỗ ngay</Text>
            <MaterialCommunityIcons name="arrow-right" size={24} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    height: 300,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    padding: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#64748B',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
  },
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  featuresGrid: {
    gap: 16,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    gap: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#64748B',
  },
  photosContainer: {
    gap: 16,
    paddingRight: 20,
  },
  photo: {
    width: 280,
    height: 200,
    borderRadius: 12,
  },
  bottomBar: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: 'white',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#745745',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#7a5545',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    gap: 16,
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '500',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#7a5545',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});