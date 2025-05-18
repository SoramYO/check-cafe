import React, { useRef, useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import advertisementAPI from '../services/advertisementsAPI';
const { width } = Dimensions.get('window');


const FEATURED_BANNERS = [
  {
    id: '1',
    title: 'Khám phá Horizon Coffee',
    subtitle: 'View đồi núi đỉnh cao',
    image: 'https://images.unsplash.com/photo-1493857671505-72967e2e2760?q=80&w=2940&auto=format&fit=crop',
    type: 'discover',
  },
  {
    id: '2',
    title: 'Giảm 20% tại Túi Mơ To',
    subtitle: 'Chỉ trong hôm nay',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2940&auto=format&fit=crop',
    type: 'promotion',
  },
  {
    id: '3',
    title: 'Festival Hoa Đà Lạt 2025',
    subtitle: 'Sắp diễn ra',
    image: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?q=80&w=2940&auto=format&fit=crop',
    type: 'event',
  },
];

export default function FeaturedBanner() {
  const navigation = useNavigation();
  const scrollX = useRef(new Animated.Value(0)).current;
  const slideRef = useRef(null);
  const [advertisements, setAdvertisements] = useState([]);

  useEffect(() => {
    getAdvertisements();
    const timer = setInterval(() => {
      const nextIndex = Math.floor(scrollX._value / width) + 1;
      if (nextIndex >= advertisements.length) {
        slideRef.current?.scrollTo({ x: 0, animated: true });
      } else {
        slideRef.current?.scrollTo({ x: nextIndex * width, animated: true });
      }
    }, 3000);

    return () => clearInterval(timer);
  }, [advertisements.length]);

  const getAdvertisements = async (page = 1, limit = 10) => {
    const response = await advertisementAPI.HandleAdvertisement(`?page=${page}&limit=${limit}`);
    setAdvertisements(response.data.data);
    console.log(response.data.data);
  };

  const handleBannerPress = (banner) => {
    navigation.navigate('FeaturedDetail', { type: banner.type, id: banner._id });
  };

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        ref={slideRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
      >
        {advertisements.map((banner, index) => (
          <View key={banner._id} style={styles.slide}>
            <Image
              source={{ uri: banner.image || "https://placehold.co/400x200" }}
              style={styles.image}
            />
            <View style={styles.overlay}>
              <View style={styles.content}>
                <Text style={styles.title}>{banner.title}</Text>
                <Text style={styles.subtitle}>{banner.description || banner.content}</Text>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handleBannerPress(banner)}
                >
                  <Text style={styles.buttonText}>
                    {banner.type === 'promotion' ? 'Đặt ngay' : 'Xem thêm'}
                  </Text>
                  <MaterialCommunityIcons
                    name="arrow-right"
                    size={20}
                    color="white"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </Animated.ScrollView>
      <View style={styles.pagination}>
        {advertisements.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [1, 1.2, 1],
            extrapolate: 'clamp',
          });
          return (
            <Animated.View
              key={index}
              style={[styles.dot, { opacity, transform: [{ scale }] }]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
  },
  slide: {
    width,
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  content: {
    padding: 20,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignSelf: 'flex-start',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 15,
    width: '100%',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
});