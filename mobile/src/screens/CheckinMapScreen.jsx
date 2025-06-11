import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import checkinAPI from '../services/checkinAPI';
import { useAnalytics } from '../utils/analytics';
import { Image } from 'react-native';

const CheckinMapScreen = () => {
  const navigation = useNavigation();
  const mapRef = useRef(null);
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedCheckin, setSelectedCheckin] = useState(null);
  const [mapError, setMapError] = useState(false);
  const { trackScreenView, trackTap, trackAppEvent, isAuthenticated } = useAnalytics();

  useEffect(() => {
    const initializeScreen = async () => {
      if (await isAuthenticated()) {
        trackScreenView('CheckinMap', {
          timestamp: new Date().toISOString(),
          platform: Platform.OS
        });
      }
    };
    initializeScreen();
    
    console.log('CheckinMapScreen initialized on platform:', Platform.OS);
    
    // Lấy vị trí hiện tại (sẽ tự động tải checkins khi có vị trí)
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Lỗi', 'Cần quyền truy cập vị trí để hiển thị bản đồ');
        // Load với vị trí mặc định nếu không có permission
        loadNearbyCheckins();
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      
      setUserLocation(newLocation);
      
      // Tải lại checkins với vị trí mới
      loadNearbyCheckins(newLocation);
    } catch (error) {
      console.error('Error getting location:', error);
      trackAppEvent('checkin_map_location_error', {
        error_message: error.message
      });
      // Load với vị trí mặc định nếu có lỗi
      loadNearbyCheckins();
    }
  };

  const loadNearbyCheckins = async (location = null) => {
    try {
      setLoading(true);
      
      // Sử dụng vị trí được truyền vào hoặc vị trí hiện tại từ state
      const currentLocation = location || userLocation;
      
      // Nếu không có vị trí, sử dụng tọa độ mặc định (TP.HCM)
      const lat = currentLocation?.latitude || 10.7769;
      const lng = currentLocation?.longitude || 106.7009;
      
      const response = await checkinAPI.HandleCheckin(`/nearby?lat=${lat}&lng=${lng}&radius=50000`);
      
      // Check if response is successful (either response.success hoặc status 200)
      if (response.success || response.status === 200 || response.data) {
        const checkinData = response.data || [];
        setCheckins(checkinData);
        console.log('Setting checkins:', checkinData);
        
        trackAppEvent('checkin_map_loaded', {
          checkins_count: checkinData?.length || 0,
          user_location: currentLocation ? 'available' : 'default'
        });
      } else {
        console.log('Response not successful:', response);
      }
    } catch (error) {
      console.error('Error loading checkins:', error);
      trackAppEvent('checkin_map_load_error', {
        error_message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerPress = async (checkin) => {
    await trackTap('checkin_map_marker', {
      checkin_id: checkin._id,
      user_id: checkin.user_id?._id || checkin.user?._id,
      platform: Platform.OS
    });
    
    console.log('Marker pressed on', Platform.OS, ':', checkin.title);
    setSelectedCheckin(checkin);
  };

  const handleCalloutPress = async (checkin) => {
    await trackTap('checkin_map_callout', {
      checkin_id: checkin._id,
      user_id: checkin.user_id?._id || checkin.user?._id
    });
    
    console.log('Opening image viewer with:', {
      imageUrl: checkin.image,
      title: checkin.title,
      userName: checkin.user_id?.full_name
    });
    
    navigation.navigate('ImageViewer', {
      imageUrl: checkin.image,
      title: checkin.title,
      userName: checkin.user_id?.full_name,
      checkinData: checkin
    });
  };

  const renderMarker = (checkin) => {
    if (!checkin.location || !checkin.location.coordinates || checkin.location.coordinates.length < 2) {
      console.log('Invalid location data for checkin:', checkin._id);
      return null;
    }
    
    if (Platform.OS === 'android') {
      // Android version - simple marker with alert popup
      return (
        <Marker
          key={checkin._id}
          coordinate={{
            latitude: checkin.location.coordinates[1],
            longitude: checkin.location.coordinates[0],
          }}
          onPress={() => {
            console.log('Android marker pressed:', checkin._id);
            handleMarkerPress(checkin);
          }}
          title={checkin.title}
          description={`${checkin.user_id?.full_name || 'Unknown'} - ${checkin.location.address || 'Vị trí không xác định'}`}
        >
          <View style={styles.customMarker}>
            <Image
              source={{ 
                uri: checkin.image || 'https://via.placeholder.com/40?text=📷'
              }}
              style={styles.markerImage}
            />
            <View style={styles.markerBorder} />
          </View>
        </Marker>
      );
    } else {
      // iOS version - with Callout
      return (
        <Marker
          key={checkin._id}
          coordinate={{
            latitude: checkin.location.coordinates[1],
            longitude: checkin.location.coordinates[0],
          }}
          onPress={() => handleMarkerPress(checkin)}
        >
          <View style={styles.customMarker}>
            <Image
              source={{ 
                uri: checkin.image || 'https://via.placeholder.com/40?text=📷'
              }}
              style={styles.markerImage}
            />
            <View style={styles.markerBorder} />
          </View>
          
          <Callout onPress={() => handleCalloutPress(checkin)}>
            <View style={styles.calloutContainer}>
              <Text style={styles.calloutTitle} numberOfLines={2}>
                {checkin.title}
              </Text>
              <Text style={styles.calloutUser}>
                👤 {checkin.user_id?.full_name || checkin.user?.name || 'Unknown'}
              </Text>
              <Text style={styles.calloutLocation} numberOfLines={1}>
                📍 {checkin.location.address || 'Vị trí không xác định'}
              </Text>
              <View style={styles.calloutStats}>
                <Text style={styles.calloutStat}>
                  ❤️ {checkin.likes_count || 0}
                </Text>
                <Text style={styles.calloutStat}>
                  💬 {checkin.comments_count || 0}
                </Text>
              </View>
              <Text style={styles.calloutTap}>Nhấn để xem ảnh</Text>
            </View>
          </Callout>
        </Marker>
      );
    }
  };

  const handleMyLocationPress = async () => {
    await trackTap('checkin_map_my_location');
    
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(userLocation, 1000);
    } else {
      getCurrentLocation();
    }
  };

  const handleCheckInPress = async () => {
    await trackTap('checkin_map_fab');
    navigation.navigate('CheckinCamera');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#7a5545" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bản đồ Check-in</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7a5545" />
          <Text style={styles.loadingText}>Đang tải bản đồ...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#7a5545" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bản đồ Check-in</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={loadNearbyCheckins}
        >
          <MaterialCommunityIcons name="refresh" size={20} color="#7a5545" />
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        {Platform.OS === 'web' ? (
          <View style={styles.webMapContainer}>
            <Text style={styles.webMapText}>
              Bản đồ không được hỗ trợ trên web
            </Text>
            <MaterialCommunityIcons name="map-marker-off" size={48} color="#94A3B8" />
          </View>
        ) : mapError ? (
          <View style={styles.webMapContainer}>
            <MaterialCommunityIcons name="map-marker-alert" size={48} color="#E74C3C" />
            <Text style={styles.webMapText}>
              Không thể tải bản đồ
            </Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => {
                setMapError(false);
                loadNearbyCheckins();
              }}
            >
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={userLocation || {
              latitude: 10.7769,
              longitude: 106.7009,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            showsUserLocation={true}
            showsMyLocationButton={false}
            provider={Platform.OS === 'android' ? 'google' : undefined}
            loadingEnabled={true}
            loadingIndicatorColor="#7a5545"
            loadingBackgroundColor="#FFFFFF"
            onMapReady={() => {
              console.log('Map is ready!');
              setMapError(false);
            }}
            onError={(error) => {
              console.error('Map error:', error);
              setMapError(true);
            }}
          >
            {checkins.map((checkin, index) => {
              console.log(`Rendering marker ${index} on ${Platform.OS}:`, checkin._id);
              return renderMarker(checkin);
            })}
          </MapView>
        )}

        {/* Floating Action Buttons */}
        <TouchableOpacity
          style={styles.myLocationButton}
          onPress={handleMyLocationPress}
        >
          <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkinFab}
          onPress={handleCheckInPress}
        >
          <MaterialCommunityIcons name="camera" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {checkins.length === 0 && !loading && (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="map-marker-off" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Chưa có check-in nào trong khu vực này</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={handleCheckInPress}>
            <Text style={styles.emptyButtonText}>Tạo check-in đầu tiên</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Android Bottom Sheet for Selected Checkin */}
      {Platform.OS === 'android' && selectedCheckin && (
        <View style={styles.androidBottomSheet}>
          <View style={styles.bottomSheetHeader}>
            <Text style={styles.bottomSheetTitle} numberOfLines={2}>
              {selectedCheckin.title}
            </Text>
            <TouchableOpacity 
              style={styles.bottomSheetClose}
              onPress={() => setSelectedCheckin(null)}
            >
              <MaterialCommunityIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.bottomSheetContent}>
            <View style={styles.bottomSheetRow}>
              <MaterialCommunityIcons name="account" size={16} color="#666" />
              <Text style={styles.bottomSheetText}>
                {selectedCheckin.user_id?.full_name || 'Unknown'}
              </Text>
            </View>
            
            <View style={styles.bottomSheetRow}>
              <MaterialCommunityIcons name="map-marker" size={16} color="#666" />
              <Text style={styles.bottomSheetText} numberOfLines={2}>
                {selectedCheckin.location.address || 'Vị trí không xác định'}
              </Text>
            </View>
            
            <View style={styles.bottomSheetStats}>
              <View style={styles.bottomSheetStat}>
                <MaterialCommunityIcons name="heart" size={16} color="#e74c3c" />
                <Text style={styles.bottomSheetStatText}>{selectedCheckin.likes_count || 0}</Text>
              </View>
              <View style={styles.bottomSheetStat}>
                <MaterialCommunityIcons name="comment" size={16} color="#666" />
                <Text style={styles.bottomSheetStatText}>{selectedCheckin.comments_count || 0}</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.bottomSheetButton}
              onPress={() => {
                setSelectedCheckin(null);
                handleCalloutPress(selectedCheckin);
              }}
            >
              <MaterialCommunityIcons name="image" size={20} color="white" />
              <Text style={styles.bottomSheetButtonText}>Xem ảnh</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7a5545',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  placeholder: {
    width: 40,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7a5545',
  },
  customMarker: {
    width: 50,
    height: 50,
    position: 'relative',
  },
  markerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#fff',
  },
  markerBorder: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#e74c3c',
  },
  calloutContainer: {
    width: 200,
    padding: 10,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  calloutUser: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  calloutLocation: {
    fontSize: 11,
    color: '#888',
    marginBottom: 4,
  },
  calloutStats: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  calloutStat: {
    fontSize: 11,
    color: '#666',
  },
  calloutTap: {
    fontSize: 10,
    color: '#007AFF',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  myLocationButton: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    backgroundColor: '#7a5545',
    padding: 12,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  checkinFab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#e74c3c',
    padding: 16,
    borderRadius: 35,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  emptyContainer: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 12,
  },
  emptyButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  webMapContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  webMapText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#7a5545',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  androidBottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxHeight: '50%',
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  bottomSheetClose: {
    padding: 4,
  },
  bottomSheetContent: {
    padding: 16,
    gap: 12,
  },
  bottomSheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bottomSheetText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  bottomSheetStats: {
    flexDirection: 'row',
    gap: 16,
  },
  bottomSheetStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bottomSheetStatText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  bottomSheetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7a5545',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    gap: 8,
    marginTop: 8,
  },
  bottomSheetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CheckinMapScreen; 