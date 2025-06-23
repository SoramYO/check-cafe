import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../hooks/useAuth';
import { usePremium } from '../context/PremiumContext';
import Header from '../components/Header';
import { useAnalytics } from '../utils/analytics';

const { width, height } = Dimensions.get('window');

export default function AddAddressScreen() {
  const navigation = useNavigation();
  const { location, setLocation } = useLocation();
  const { user } = useAuth();
  const { isPremium, loading: premiumLoading, refreshPremiumStatus } = usePremium();
  const { trackScreenView, trackTap, isAuthenticated } = useAnalytics();
  
  const [addressName, setAddressName] = useState('');
  const [addressDetails, setAddressDetails] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 11.9403, // Đà Lạt coordinates
    longitude: 108.4583,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    const init = async () => {
      if (await isAuthenticated()) {
        trackScreenView('AddAddress', {
          timestamp: new Date().toISOString()
        });
      }
    };
    init();
    
    // Set initial map region to current location if available
    if (location) {
      setMapRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  }, [location]);

  // Tự động refresh premium status khi focus vào màn hình
  useFocusEffect(
    React.useCallback(() => {
      refreshPremiumStatus();
    }, [])
  );

  const getCurrentLocation = async () => {
    try {
      setGettingLocation(true);
      
      // Request permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Quyền truy cập vị trí',
          'Ứng dụng cần quyền truy cập vị trí để lấy địa chỉ hiện tại của bạn.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setCurrentLocation(newLocation);
      setSelectedLocation(newLocation);

      // Get address from coordinates
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (addressResponse.length > 0) {
        const address = addressResponse[0];
        const fullAddress = [
          address.street,
          address.district,
          address.city,
          address.region,
        ].filter(Boolean).join(', ');
        
        setAddressDetails(fullAddress);
      }

    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Lỗi',
        'Không thể lấy vị trí hiện tại. Vui lòng thử lại.',
        [{ text: 'OK' }]
      );
    } finally {
      setGettingLocation(false);
    }
  };

  const openMapPicker = () => {
    setMapModalVisible(true);
    trackTap('open_map_picker', {
      timestamp: new Date().toISOString()
    });
  };

  const handleMapPress = async (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    const newLocation = { latitude, longitude };
    
    setSelectedLocation(newLocation);
    
    try {
      // Get address from coordinates
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addressResponse.length > 0) {
        const address = addressResponse[0];
        const fullAddress = [
          address.street,
          address.district,
          address.city,
          address.region,
        ].filter(Boolean).join(', ');
        
        setAddressDetails(fullAddress);
      }
    } catch (error) {
      console.error('Error getting address from coordinates:', error);
    }
  };

  const confirmMapLocation = () => {
    if (selectedLocation) {
      setCurrentLocation(selectedLocation);
      setMapModalVisible(false);
      
      trackTap('confirm_map_location', {
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleSaveAddress = () => {
    if (!addressName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên địa chỉ.');
      return;
    }

    if (!addressDetails.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập chi tiết địa chỉ.');
      return;
    }

    // Save address logic here
    const newAddress = {
      id: Date.now().toString(),
      name: addressName.trim(),
      details: addressDetails.trim(),
      coordinates: currentLocation,
      createdAt: new Date().toISOString(),
    };

    trackTap('save_address', {
      address_name: newAddress.name,
      has_coordinates: !!currentLocation,
      timestamp: new Date().toISOString()
    });

    // Navigate back with the new address using navigate with merge option
    navigation.navigate({
      name: 'DefaultLocation',
      params: { newAddress },
      merge: true,
    });
  };

  if (premiumLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Thêm địa chỉ" navigation={navigation} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7a5545" />
          <Text style={styles.loadingText}>Đang kiểm tra quyền truy cập...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isPremium) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Thêm địa chỉ" navigation={navigation} />
        <View style={styles.premiumRequiredContainer}>
          <MaterialCommunityIcons 
            name="crown" 
            size={80} 
            color="#FFD700" 
          />
          <Text style={styles.premiumTitle}>Tính năng Premium</Text>
          <Text style={styles.premiumDescription}>
            Chỉ người dùng Premium mới có thể thêm và quản lý địa chỉ tùy chỉnh.
          </Text>
          <Text style={styles.premiumFeatures}>
            • Lưu nhiều địa chỉ yêu thích{'\n'}
            • Tìm kiếm quán cà phê gần địa chỉ{'\n'}
            • Đặt chỗ nhanh chóng{'\n'}
            • Nhận thông báo ưu đãi đặc biệt
          </Text>
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => {
              trackTap('upgrade_to_premium', {
                source: 'add_address_screen',
                timestamp: new Date().toISOString()
              });
              navigation.navigate('Premium');
            }}
          >
            <Text style={styles.upgradeButtonText}>Nâng cấp Premium</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Thêm địa chỉ" navigation={navigation} />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.premiumBadge}>
          <MaterialCommunityIcons name="crown" size={16} color="#FFD700" />
          <Text style={styles.premiumBadgeText}>Premium</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tên địa chỉ *</Text>
            <TextInput
              style={styles.input}
              value={addressName}
              onChangeText={setAddressName}
              placeholder="VD: Nhà riêng, Công ty, Trường học..."
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Chi tiết địa chỉ *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={addressDetails}
              onChangeText={setAddressDetails}
              placeholder="Nhập địa chỉ chi tiết..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.locationButtonsContainer}>
            <TouchableOpacity
              style={[styles.locationButton, styles.locationButtonHalf]}
              onPress={getCurrentLocation}
              disabled={gettingLocation}
            >
              <MaterialCommunityIcons 
                name="crosshairs-gps" 
                size={20} 
                color="#7a5545" 
              />
              <Text style={styles.locationButtonText}>
                {gettingLocation ? 'Đang lấy...' : 'Vị trí hiện tại'}
              </Text>
              {gettingLocation && (
                <ActivityIndicator size="small" color="#7a5545" style={{ marginLeft: 8 }} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.locationButton, styles.locationButtonHalf, styles.mapButton]}
              onPress={openMapPicker}
            >
              <MaterialCommunityIcons 
                name="map-marker-plus" 
                size={20} 
                color="#7a5545" 
              />
              <Text style={styles.locationButtonText}>Chọn trên bản đồ</Text>
            </TouchableOpacity>
          </View>

          {currentLocation && (
            <View style={styles.locationInfo}>
              <MaterialCommunityIcons name="check-circle" size={16} color="#10B981" />
              <Text style={styles.locationInfoText}>
                Đã chọn: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveAddress}
          >
            <Text style={styles.saveButtonText}>Lưu địa chỉ</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Map Picker Modal */}
      <Modal
        visible={mapModalVisible}
        animationType="slide"
        onRequestClose={() => setMapModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setMapModalVisible(false)}
            >
              <MaterialCommunityIcons name="close" size={24} color="#1E293B" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Chọn vị trí trên bản đồ</Text>
            <TouchableOpacity
              style={styles.modalConfirmButton}
              onPress={confirmMapLocation}
              disabled={!selectedLocation}
            >
              <Text style={[styles.modalConfirmText, !selectedLocation && styles.modalConfirmTextDisabled]}>
                Xác nhận
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              region={mapRegion}
              onPress={handleMapPress}
              showsUserLocation={true}
              showsMyLocationButton={true}
            >
              {selectedLocation && (
                <Marker
                  coordinate={selectedLocation}
                  title="Vị trí đã chọn"
                  description="Chạm để xác nhận vị trí này"
                />
              )}
            </MapView>
          </View>

          <View style={styles.mapInstructions}>
            <MaterialCommunityIcons name="hand-pointing-up" size={20} color="#7a5545" />
            <Text style={styles.mapInstructionsText}>
              Chạm vào bản đồ để chọn vị trí mong muốn
            </Text>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
  premiumRequiredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  premiumTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  premiumDescription: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  premiumFeatures: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 32,
    textAlign: 'center',
  },
  upgradeButton: {
    backgroundColor: '#7a5545',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 20,
  },
  premiumBadgeText: {
    color: '#1E293B',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
    backgroundColor: '#F8FAFC',
  },
  textArea: {
    height: 100,
    paddingTop: 16,
  },
  locationButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#7a5545',
    borderRadius: 12,
    padding: 16,
    flex: 1,
  },
  locationButtonHalf: {
    flex: 1,
  },
  locationButtonText: {
    color: '#7a5545',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  mapButton: {
    backgroundColor: '#F0F9FF',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  locationInfoText: {
    color: '#065F46',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#7a5545',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  modalCloseButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginLeft: 16,
    flex: 1,
  },
  modalConfirmButton: {
    padding: 8,
    backgroundColor: '#7a5545',
    borderRadius: 8,
  },
  modalConfirmText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalConfirmTextDisabled: {
    backgroundColor: '#E2E8F0',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  mapInstructions: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  mapInstructionsText: {
    color: '#64748B',
    fontSize: 14,
    marginLeft: 8,
  },
}); 