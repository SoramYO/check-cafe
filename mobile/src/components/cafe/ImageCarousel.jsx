import React, { useState, useRef } from "react";
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const height = width * 0.5625; // 16:9 aspect ratio

export default function ImageCarousel({ images, navigation }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const position = Animated.divide(scrollX, width);

  const handleScroll = (event) => {
    const slideSize = event.nativeEvent.contentOffset.x / width;
    setActiveIndex(Math.round(slideSize));
  };

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleScroll}
      >
        {images.map((image, index) => (
          <View key={index} style={styles.slide}>
            <Image source={{ uri: image }} style={styles.image} />
          </View>
        ))}
      </Animated.ScrollView>

      <View style={styles.pagination}>
        {images.map((_, index) => {
          const opacity = position.interpolate({
            inputRange: [index - 1, index, index + 1],
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              key={index}
              style={[styles.paginationDot, { opacity }]}
            />
          );
        })}
      </View>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.shareButton}>
        <MaterialCommunityIcons name="share-variant" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height,
    backgroundColor: "#f5f5f5",
  },
  slide: {
    width,
    height,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  pagination: {
    flexDirection: "row",
    position: "absolute",
    bottom: 15,
    alignSelf: "center",
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "white",
  },
  backButton: {
    position: "absolute",
    top: 15,
    left: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  shareButton: {
    position: "absolute",
    top: 15,
    right: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});
