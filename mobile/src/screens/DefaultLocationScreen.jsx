import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocation } from "../context/LocationContext";
import * as Location from "expo-location";
import Header from "../components/Header";
export default function DefaultLocationScreen({ navigation }) {
  const { location } = useLocation();
  const [currentAddress, setCurrentAddress] = useState("");
  const [savedAddresses, setSavedAddresses] = useState([]);

  useEffect(() => {
    const updateCurrentLocation = async () => {
      if (location) {
        const address = await getAddressFromCoords(
          location.latitude,
          location.longitude
        );
        setCurrentAddress(address);
      }
    };
    updateCurrentLocation();
  }, [location]);

  const getAddressFromCoords = async (latitude, longitude) => {
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addresses.length > 0) {
        const addr = addresses[0];
        return `${addr.street}, ${addr.district}, ${addr.region}, ${addr.country}`;
      } else {
        return "Không tìm thấy địa chỉ";
      }
    } catch (error) {
      console.error("Lỗi khi chuyển đổi tọa độ:", error);
      return "Lỗi khi lấy địa chỉ";
    }
  };

  const handleAddNewAddress = () => {
    navigation.navigate("AddAddress"); // You'll need to create this screen
  };

  const renderAddressCard = (address, isDefault = false) => (
    <View style={styles.addressCard}>
      <View style={styles.addressInfo}>
        <View style={styles.addressHeader}>
          <MaterialCommunityIcons
            name={isDefault ? "map-marker" : "map-marker-outline"}
            size={24}
            color="#7a5545"
          />
          <Text style={styles.addressType}>
            {isDefault ? "Vị trí hiện tại" : "Địa chỉ đã lưu"}
          </Text>
          {isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Mặc định</Text>
            </View>
          )}
        </View>
        <Text style={styles.addressText}>{address}</Text>
      </View>
      {!isDefault && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() =>
            Alert.alert("Xóa địa chỉ", "Bạn có chắc muốn xóa địa chỉ này?")
          }
        >
          <MaterialCommunityIcons
            name="delete-outline"
            size={24}
            color="#EF4444"
          />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Địa chỉ mặc định" navigation={navigation} />
      <ScrollView style={styles.scrollView}>

        {/* Current Location */}
        {renderAddressCard(currentAddress || "Đang tải địa chỉ...", true)}

        {/* Saved Addresses */}
        {savedAddresses.map((address, index) =>
          renderAddressCard(address, false)
        )}
      </ScrollView>

      {/* Add New Address Button */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddNewAddress}>
        <MaterialCommunityIcons name="plus" size={24} color="white" />
        <Text style={styles.addButtonText}>Thêm địa chỉ mới</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f1f1",
  },
  scrollView: {
    flex: 1,
    marginTop: 16,
  },
  addressCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  addressInfo: {
    flex: 1,
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  addressType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginLeft: 8,
  },
  defaultBadge: {
    backgroundColor: "#EBF3FE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  defaultText: {
    color: "#4A90E2",
    fontSize: 12,
    fontWeight: "500",
  },
  addressText: {
    fontSize: 14,
    color: "#64748B",
    marginLeft: 32,
  },
  deleteButton: {
    padding: 8,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7a5545",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
