import React from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ImageCarousel from "../components/cafe/ImageCarousel";
import BasicInfo from "../components/cafe/BasicInfo";
import MenuSection from "../components/cafe/MenuSection";
import CheckinGallery from "../components/cafe/CheckinGallery";
import ReviewSection from "../components/cafe/ReviewSection";
import ActionButtons from "../components/cafe/ActionButtons";

const MOCK_CAFE = {
  id: "1",
  name: "The Dreamer Coffee",
  address: "123 Đường Trần Hưng Đạo, Phường 10, Đà Lạt",
  phone: "0123456789",
  hours: "07:00 - 22:00",
  rating: 4.8,
  reviews: 256,
  website: "https://dreamercoffee.com",
  images: [
    "https://api.a0.dev/assets/image?text=dreamer+coffee+shop+dalat+beautiful+view&aspect=16:9",
    "https://api.a0.dev/assets/image?text=dreamer+coffee+shop+dalat+interior&aspect=16:9",
    "https://api.a0.dev/assets/image?text=dreamer+coffee+shop+dalat+garden&aspect=16:9",
  ],
  menu: {
    drinks: [
      {
        id: "1",
        name: "Cà phê sữa đá",
        price: "35.000đ",
        image:
          "https://api.a0.dev/assets/image?text=vietnamese+iced+coffee&aspect=1:1",
      },
      {
        id: "2",
        name: "Cappuccino",
        price: "45.000đ",
        image: "https://api.a0.dev/assets/image?text=cappuccino&aspect=1:1",
      },
    ],
    food: [
      {
        id: "3",
        name: "Bánh mì chảo",
        price: "55.000đ",
        image:
          "https://api.a0.dev/assets/image?text=vietnamese+breakfast&aspect=1:1",
      },
      {
        id: "4",
        name: "Croissant",
        price: "35.000đ",
        image: "https://api.a0.dev/assets/image?text=croissant&aspect=1:1",
      },
    ],
  },
  checkinSpots: [
    {
      id: "1",
      image:
        "https://api.a0.dev/assets/image?text=coffee+shop+check+in+spot+1&aspect=1:1",
      description: "Góc ban công view thành phố",
    },
    {
      id: "2",
      image:
        "https://api.a0.dev/assets/image?text=coffee+shop+check+in+spot+2&aspect=1:1",
      description: "Khu vườn xanh mát",
    },
    {
      id: "3",
      image:
        "https://api.a0.dev/assets/image?text=coffee+shop+check+in+spot+3&aspect=1:1",
      description: "Góc vintage trong nhà",
    },
  ],
};
const menuItems = Object.entries(MOCK_CAFE.menu).flatMap(([category, items]) =>
  items.map((item) => ({
    ...item,
    description: "", // Add missing properties from MenuItem interface
    category,
  }))
);

export default function CafeDetailScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      >
        <ImageCarousel images={MOCK_CAFE.images} navigation={navigation} />
        <View style={styles.content}>
          <BasicInfo cafe={MOCK_CAFE} />
          <MenuSection menuItems={menuItems} />
          <CheckinGallery spots={MOCK_CAFE.checkinSpots} />
          <ReviewSection cafe={MOCK_CAFE} />
        </View>
      </ScrollView>
      <ActionButtons
        cafeId={MOCK_CAFE.id}
        cafeName={MOCK_CAFE.name}
        cafeAddress={MOCK_CAFE.address}
        isFavorite={false}
        onFavoritePress={() => {}}
        onCheckInPress={() => {}}
        onDirectionsPress={() => {}}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  content: {
    flex: 1,
    padding: 15,
  },
});
