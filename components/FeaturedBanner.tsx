import React, { useRef, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const FEATURED_BANNERS = [
  {
    id: '1',
    title: 'Khám phá Horizon Coffee',
    subtitle: 'View đồi núi đỉnh cao',
    image: 'https://api.a0.dev/assets/image?text=horizon+coffee+shop+dalat+mountain+view&aspect=16:9',
    type: 'discover',
  },
  {
    id: '2',
    title: 'Giảm 20% tại Túi Mơ To',
    subtitle: 'Chỉ trong hôm nay',
    image: 'https://api.a0.dev/assets/image?text=tui+mo+to+coffee+shop+dalat+cozy&aspect=16:9',
    type: 'promotion',
  },
  {
    id: '3',
    title: 'Festival Hoa Đà Lạt 2025',
    subtitle: 'Sắp diễn ra',
    image: 'https://api.a0.dev/assets/image?text=dalat+flower+festival+2025&aspect=16:9',
    type: 'event',
  },
];

export default function FeaturedBanner() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const slideRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = Math.floor(scrollX._value / width) + 1;
      if (nextIndex >= FEATURED_BANNERS.length) {
        slideRef.current?.scrollTo({ x: 0, animated: true });
      } else {
        slideRef.current?.scrollTo({ x: nextIndex * width, animated: true });
      }
    }, 3000);

    return () => clearInterval(timer);
  }, []);

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
        {FEATURED_BANNERS.map((banner, index) => (
          <View key={banner.id} style={styles.slide}>
            <Image source={{ uri: banner.image }} style={styles.image} />
            <View style={styles.overlay}>
              <View style={styles.content}>
                <Text style={styles.title}>{banner.title}</Text>
                <Text style={styles.subtitle}>{banner.subtitle}</Text>
                <TouchableOpacity style={styles.button}>
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
        {FEATURED_BANNERS.map((_, index) => {
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