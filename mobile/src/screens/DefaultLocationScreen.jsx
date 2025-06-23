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
import { useAuth } from "../hooks/useAuth";
import { usePremium } from "../context/PremiumContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../components/Header";
import { useAnalytics } from "../utils/analytics";
import { useFocusEffect } from "@react-navigation/native";

const SAVED_ADDRESSES_KEY = 'saved_addresses';

export default function DefaultLocationScreen({ navigation, route }) {
  const { location } = useLocation();
  const { user } = useAuth();
  const { isPremium, loading: premiumLoading, refreshPremiumStatus } = usePremium();
  const { trackScreenView, trackTap, isAuthenticated } = useAnalytics();
  const [currentAddress, setCurrentAddress] = useState("");
  const [savedAddresses, setSavedAddresses] = useState([]);

  useEffect(() => {
    const init = async () => {
      if (await isAuthenticated()) {
        trackScreenView('DefaultLocation', {
          timestamp: new Date().toISOString()
        });
      }
    };
    init();
    loadSavedAddresses();
  }, []);

  // Tự động refresh premium status khi focus vào màn hình
  useFocusEffect(
    React.useCallback(() => {
      refreshPremiumStatus();
    }, [])
  );

  // Load saved addresses from AsyncStorage
  const loadSavedAddresses = async () => {
    try {
      const savedAddressesData = await AsyncStorage.getItem(SAVED_ADDRESSES_KEY);
      if (savedAddressesData) {
        const addresses = JSON.parse(savedAddressesData);
        setSavedAddresses(addresses);
      }
    } catch (error) {
      console.error('Error loading saved addresses:', error);
    }
  };

  // Save addresses to AsyncStorage
  const saveAddressesToStorage = async (addresses) => {
    try {
      await AsyncStorage.setItem(SAVED_ADDRESSES_KEY, JSON.stringify(addresses));
    } catch (error) {
      console.error('Error saving addresses:', error);
    }
  };

  // Handle new address from AddAddressScreen
  useEffect(() => {
    const handleNewAddress = async () => {
      if (route.params?.newAddress) {
        const newAddress = route.params.newAddress;
        
        // Check if address already exists to avoid duplicates
        const addressExists = savedAddresses.some(addr => addr.id === newAddress.id);
        if (addressExists) {
          return;
        }
        
        // Add to local state
        const updatedAddresses = [...savedAddresses, newAddress];
        setSavedAddresses(updatedAddresses);
        
        // Save to AsyncStorage
        await saveAddressesToStorage(updatedAddresses);
        
        // Clear the route params to avoid adding duplicate
        navigation.setParams({ newAddress: undefined });
        
        Alert.alert(
          'Thành công',
          `Đã lưu địa chỉ "${newAddress.name}" thành công!`,
          [{ text: 'OK' }]
        );
      }
    };

    handleNewAddress();
  }, [route.params?.newAddress]);

  const updateCurrentLocation = async () => {
    if (location) {
      const address = await getAddressFromCoords(
        location.latitude,
        location.longitude
      );
      setCurrentAddress(address);
    }
  };

  useEffect(() => {
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
    if (!isPremium) {
      Alert.alert(
        'Tính năng Premium',
        'Chỉ người dùng Premium mới có thể thêm địa chỉ tùy chỉnh. Bạn có muốn nâng cấp không?',
        [
          { text: 'Hủy', style: 'cancel' },
          { 
            text: 'Nâng cấp', 
            onPress: () => {
              trackTap('upgrade_to_premium', {
                source: 'default_location_screen',
                timestamp: new Date().toISOString()
              });
              navigation.navigate('Premium');
            }
          }
        ]
      );
      return;
    }

    trackTap('add_new_address', {
      timestamp: new Date().toISOString()
    });
    navigation.navigate("AddAddress");
  };

  const handleDeleteAddress = async (addressId) => {
    Alert.alert(
      "Xóa địa chỉ", 
      "Bạn có chắc muốn xóa địa chỉ này?",
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: async () => {
            const updatedAddresses = savedAddresses.filter(addr => addr.id !== addressId);
            setSavedAddresses(updatedAddresses);
            
            // Save to AsyncStorage
            await saveAddressesToStorage(updatedAddresses);
            
            trackTap('delete_address', {
              timestamp: new Date().toISOString()
            });
          }
        }
      ]
    );
  };

  const renderAddressCard = (address, isDefault = false, addressData = null) => (
    <View style={styles.addressCard}>
      <View style={styles.addressInfo}>
        <View style={styles.addressHeader}>
          <MaterialCommunityIcons
            name={isDefault ? "map-marker" : "map-marker-outline"}
            size={24}
            color="#7a5545"
          />
          <Text style={styles.addressType}>
            {isDefault ? "Vị trí hiện tại" : (addressData?.name || "Địa chỉ đã lưu")}
          </Text>
          {isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Mặc định</Text>
            </View>
          )}
          {addressData && (
            <View style={styles.premiumBadge}>
              <MaterialCommunityIcons name="crown" size={12} color="#FFD700" />
              <Text style={styles.premiumBadgeText}>Premium</Text>
            </View>
          )}
        </View>
        <Text style={styles.addressText}>
          {isDefault ? address : (addressData?.details || address)}
        </Text>
      </View>
      {!isDefault && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteAddress(addressData?.id)}
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
        {savedAddresses.map((addressData, index) => (
          <View key={addressData.id || `address-${index}`}>
            {renderAddressCard(addressData.details, false, addressData)}
          </View>
        ))}

        {savedAddresses.length === 0 && isPremium && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="map-marker-plus" size={48} color="#CBD5E1" />
            <Text style={styles.emptyStateText}>Chưa có địa chỉ nào được lưu</Text>
            <Text style={styles.emptyStateSubtext}>
              Thêm địa chỉ để tìm kiếm quán cà phê gần đó
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add New Address Button */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddNewAddress}>
        <MaterialCommunityIcons name="plus" size={24} color="white" />
        <Text style={styles.addButtonText}>
          {isPremium ? 'Thêm địa chỉ mới' : 'Nâng cấp Premium để thêm địa chỉ'}
        </Text>
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
    flexWrap: 'wrap',
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
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  premiumBadgeText: {
    color: '#1E293B',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
  },
  addressText: {
    fontSize: 14,
    color: "#64748B",
    marginLeft: 32,
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 16,
    fontWeight: '500',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
    textAlign: 'center',
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
