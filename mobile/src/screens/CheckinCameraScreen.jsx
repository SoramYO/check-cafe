import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Platform, 
  Dimensions, 
  Alert, 
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Modal 
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { toast } from 'sonner-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as MediaLibrary from 'expo-media-library';
import * as Location from 'expo-location';
import checkinAPI from '../services/checkinAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../services/axiosClient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CAMERA_GUIDES = [
  { icon: 'image-filter-center-focus', text: 'Đặt điểm check-in vào giữa khung hình' },
  { icon: 'white-balance-sunny', text: 'Đảm bảo ánh sáng tốt' },
  { icon: 'image', text: 'Chụp ảnh ngang để có góc nhìn đẹp hơn' },
];

const VISIBILITY_OPTIONS = [
  { key: 'friends', label: 'Chỉ bạn bè', icon: 'account-group' },
  { key: 'public', label: 'Công khai', icon: 'earth' },
  { key: 'private', label: 'Chỉ mình tôi', icon: 'lock' },
];

export default function CheckinCameraScreen({ route }) {
  const navigation = useNavigation();
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState('back');
  const [isCameraReady, setCameraReady] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [showGuide, setShowGuide] = useState(true);
  const [flash, setFlash] = useState('off');
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  // New states for check-in functionality
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [title, setTitle] = useState('');
  const [visibility, setVisibility] = useState('friends');
  const [isUploading, setIsUploading] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(true);
  
  const cameraRef = useRef(null);
  const isMountedRef = useRef(true);
  const isCleaningUpRef = useRef(false); // Thêm flag để tránh cleanup nhiều lần
  const navigationTimeoutRef = useRef(null); // Thêm ref cho timeout
  
  const { spotId, spotName, cafeId } = route.params || {};

  // Tối ưu useFocusEffect
  useFocusEffect(
    useCallback(() => {
      isMountedRef.current = true;
      isCleaningUpRef.current = false; // Reset cleanup flag
      let isMounted = true;
      let guideTimer = null;
      
      const setupCamera = async () => {
        try {
          console.log('Setting up camera...');
          
          // Reset states
          setIsCameraActive(false);
          setCameraReady(false);
          setPhoto(null);
          setShowGuide(true);
          setShowEditForm(false);
          setIsUploading(false);
          setIsCameraLoading(true);
          
          if (!isMounted) return;
          
          // Request camera permission
          const cameraPermission = await requestPermission();
          if (!cameraPermission?.granted) {
            console.log('Camera permission denied');
            return;
          }
          
          // Activate camera
          if (isMounted) {
            setIsCameraActive(true);
            setIsCameraLoading(false);
            console.log('Camera activated');
          }
          
          // Get location in background (không log nhiều)
          getCurrentLocation().catch(() => {
            // Silent fail - đã có error handling trong function
          });
          
          // Request media library permission
          MediaLibrary.requestPermissionsAsync().catch(() => {
            // Silent fail
          });
          
          // Setup guide timer
          if (isMounted) {
            guideTimer = setTimeout(() => {
              if (isMounted) {
                setShowGuide(false);
              }
            }, 3000);
          }
          
        } catch (error) {
          console.error('Camera setup error:', error);
          if (isMounted) {
            Alert.alert(
              'Lỗi Camera',
              'Không thể khởi tạo camera. Vui lòng thử lại.',
              [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
          }
        }
      };

      setupCamera();

      return () => {
        isMounted = false;
        isMountedRef.current = false;
        if (guideTimer) {
          clearTimeout(guideTimer);
        }
        if (navigationTimeoutRef.current) {
          clearTimeout(navigationTimeoutRef.current);
        }
        // Cleanup camera nhưng không log
        performCleanup(false);
      };
    }, [])
  );

  const getCurrentLocation = async () => {
    try {
      if (!isMountedRef.current) return;
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        maximumAge: 60000,
        timeout: 10000,
      });
      
      if (!isMountedRef.current) return;
      
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      });

      // Reverse geocoding trong background, không log
      setTimeout(async () => {
        try {
          if (!isMountedRef.current) return;
          
          const address = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });

          if (address.length > 0 && isMountedRef.current) {
            const addr = address[0];
            const locationStr = `${addr.street || ''} ${addr.district || ''} ${addr.city || ''}`.trim();
            setLocationName(locationStr || 'Vị trí hiện tại');
          }
        } catch (error) {
          if (isMountedRef.current) {
            setLocationName('Vị trí hiện tại');
          }
        }
      }, 0);
      
    } catch (error) {
      if (isMountedRef.current) {
        setLocationName('Không thể lấy vị trí');
      }
    }
  };

  // Tối ưu cleanup function
  const performCleanup = useCallback((shouldLog = true) => {
    if (isCleaningUpRef.current) return; // Tránh cleanup nhiều lần
    isCleaningUpRef.current = true;
    
    try {
      if (shouldLog) {
        console.log('Cleaning up camera states...');
      }
      
      if (isMountedRef.current) {
        setIsCameraActive(false);
        setCameraReady(false);
        setPhoto(null);
        setShowGuide(true);
        setShowEditForm(false);
        setIsUploading(false);
        setFlash('off');
        setCameraType('back');
        setIsCameraLoading(true);
      }
      
      // Reset camera ref
      if (cameraRef.current) {
        cameraRef.current = null;
      }
      
      if (shouldLog) {
        console.log('Camera cleanup completed');
      }
    } catch (error) {
      console.error('Camera cleanup error:', error);
    }
  }, []);

  // Tối ưu handle close
  const handleClose = useCallback(() => {
    if (isCleaningUpRef.current) return; // Tránh gọi nhiều lần
    
    try {
      console.log('Closing camera screen...');
      isMountedRef.current = false;
      
      // Cleanup ngay lập tức, không log
      performCleanup(false);
      
      // Navigate ngay lập tức, không delay
      navigation.goBack();
    } catch (error) {
      console.error('Close error:', error);
      navigation.goBack();
    }
  }, [navigation, performCleanup]);

  const handleCameraReady = useCallback(() => {
    try {
      if (isCameraActive && isMountedRef.current) {
        setCameraReady(true);
      }
    } catch (error) {
      console.error('Camera ready error:', error);
    }
  }, [isCameraActive]);

  const takePicture = async () => {
    if (!cameraRef.current || !isCameraReady || !isCameraActive || !isMountedRef.current) {
      return;
    }

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        exif: false,
        skipProcessing: false
      });
      
      if (photo && photo.uri && isMountedRef.current) {
        setPhoto(photo);
      } else {
        throw new Error('Không thể lấy ảnh');
      }
    } catch (error) {
      console.error('Camera error:', error);
      if (isMountedRef.current) {
        toast.error('Không thể chụp ảnh. Vui lòng thử lại.');
      }
    }
  };

  const handleSave = async () => {
    if (!photo) return;
    setShowEditForm(true);
  };

  // Tối ưu upload function
  const handleUploadCheckin = async () => {
    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề cho check-in');
      return;
    }

    try {
      setIsUploading(true);
      setShowEditForm(false);
      
      // Cleanup camera ngay lập tức để tránh lag
      performCleanup(false);
      
      // Save to media library (không await để không block UI)
      MediaLibrary.requestPermissionsAsync().then(({ status }) => {
        if (status === 'granted') {
          MediaLibrary.createAssetAsync(photo.uri).then(asset => {
            MediaLibrary.createAlbumAsync('CheckCafe', asset, false).catch(() => {});
          }).catch(() => {});
        }
      }).catch(() => {});

      // Prepare và upload data
      const formData = new FormData();
      
      if (photo) {
        formData.append('image', {
          uri: photo.uri,
          type: 'image/jpeg',
          name: `checkin_${Date.now()}.jpg`,
        });
      }
      
      formData.append('title', title.trim());
      if (currentLocation) {
        formData.append('location', JSON.stringify({
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          address: locationName
        }));
      }
      formData.append('visibility', visibility || 'friends');
      if (cafeId) {
        formData.append('cafeId', cafeId);
      }

      const token = await AsyncStorage.getItem('token');
      const apiResponse = await fetch(`${BASE_URL}/checkins`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: formData,
      });

      const response = await apiResponse.json();
      
      if (response.data) {
        toast.success('Check-in thành công!');
        
        // Navigate ngay lập tức sau khi upload thành công
        navigation.navigate('CheckinList', { refresh: true });
      } else {
        throw new Error(response.message || `HTTP ${apiResponse.status}: Upload failed`);
      }
      
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Không thể lưu check-in. Vui lòng thử lại.');
      setIsUploading(false);
    }
  };

  const handleRetake = () => {
    try {
      setPhoto(null);
      setIsCameraActive(true);
    } catch (error) {
      console.error('Retake error:', error);
    }
  };

  const toggleCameraType = () => {
    try {
      setCameraType(current => (current === 'back' ? 'front' : 'back'));
    } catch (error) {
      console.error('Toggle camera error:', error);
    }
  };

  const toggleFlash = () => {
    try {
      setFlash(current => (current === 'off' ? 'on' : 'off'));
    } catch (error) {
      console.error('Toggle flash error:', error);
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Đang yêu cầu quyền truy cập camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <MaterialCommunityIcons name="camera-off" size={64} color="#94A3B8" />
        <Text style={styles.errorText}>Không có quyền truy cập camera</Text>
        <Text style={styles.errorSubtext}>
          Chúng tôi cần quyền truy cập camera để bạn có thể check-in tại quán
        </Text>
        <TouchableOpacity 
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Cấp quyền</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {isCameraLoading ? (
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons name="camera" size={64} color="#7a5545" />
          <Text style={styles.loadingText}>Đang đăng bài...</Text>
        </View>
      ) : !photo ? (
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFillObject}
            facing={cameraType}
            onCameraReady={handleCameraReady}
            flash={flash}
          />
          {/* Overlay UI */}
          <LinearGradient style={styles.overlay} colors={['rgba(0,0,0,0.7)', 'transparent', 'rgba(0,0,0,0.7)']}>
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={handleClose}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="close" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.spotName}>{spotName}</Text>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={toggleFlash}
              >
                <MaterialCommunityIcons 
                  name={flash === 'off' ? 'flash-off' : 'flash'} 
                  size={24} 
                  color="white" 
                />
              </TouchableOpacity>
            </View>

            {showGuide && (
              <View style={styles.guideContainer}>
                {CAMERA_GUIDES.map((guide, index) => (
                  <View key={index} style={styles.guideItem}>
                    <MaterialCommunityIcons 
                      name={guide.icon} 
                      size={24} 
                      color="white" 
                    />
                    <Text style={styles.guideText}>{guide.text}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.gridOverlay}>
              <View style={styles.gridRow}>
                <View style={styles.gridLine} />
                <View style={styles.gridLine} />
              </View>
              <View style={styles.gridCol}>
                <View style={styles.gridLine} />
                <View style={styles.gridLine} />
              </View>
            </View>

            <View style={styles.controls}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={toggleCameraType}
              >
                <MaterialCommunityIcons name="camera-flip" size={24} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.captureButton}
                onPress={takePicture}
                disabled={!isCameraReady}
              >
                <View style={styles.captureInner} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setShowGuide(true)}
              >
                <MaterialCommunityIcons name="help-circle" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      ) : (
        <View style={styles.previewContainer}>
          <Image source={{ uri: photo.uri }} style={styles.preview} />
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'transparent', 'rgba(0,0,0,0.7)']}
            style={styles.overlay}
          >
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={handleRetake}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="close" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.spotName}>{spotName}</Text>
              <View style={styles.iconButton} />
            </View>

            <View style={styles.previewInfo}>
              <MaterialCommunityIcons name="image" size={48} color="white" />
              <Text style={styles.previewText}>Ảnh đẹp đấy!</Text>
              <Text style={styles.previewSubtext}>
                Bạn có muốn sử dụng ảnh này để check-in không?
              </Text>
            </View>

            <View style={styles.controls}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleRetake}
              >
                <MaterialCommunityIcons name="camera-retake" size={24} color="white" />
                <Text style={styles.actionButtonText}>Chụp lại</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.saveButton]}
                onPress={handleSave}
              >
                <MaterialCommunityIcons name="check" size={24} color="white" />
                <Text style={styles.actionButtonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      )}

      {/* Edit Form Modal */}
      <Modal
        visible={showEditForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditForm(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                onPress={() => setShowEditForm(false)}
                style={styles.modalCloseButton}
              >
                <MaterialCommunityIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Thông tin check-in</Text>
              <TouchableOpacity 
                onPress={handleUploadCheckin}
                style={[styles.modalSaveButton, isUploading && styles.modalSaveButtonDisabled]}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Text style={styles.modalSaveButtonText}>Đang lưu...</Text>
                ) : (
                  <Text style={styles.modalSaveButtonText}>Đăng</Text>
                )}
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Preview Image */}
              <View style={styles.previewImageContainer}>
                <Image source={{ uri: photo?.uri }} style={styles.previewImage} />
              </View>

              {/* Title Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Tiêu đề *</Text>
                <TextInput
                  style={styles.textInput}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Chia sẻ cảm nghĩ về check-in này..."
                  placeholderTextColor="#999"
                  multiline
                  maxLength={200}
                />
                <Text style={styles.characterCount}>{title.length}/200</Text>
              </View>

              {/* Location Info */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Vị trí</Text>
                <View style={styles.locationContainer}>
                  <MaterialCommunityIcons name="map-marker" size={20} color="#7a5545" />
                  <Text style={styles.locationText}>
                    {locationName || 'Đang lấy vị trí...'}
                  </Text>
                </View>
              </View>

              {/* Visibility Options */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Ai có thể xem</Text>
                <View style={styles.visibilityContainer}>
                  {VISIBILITY_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.key}
                      style={[
                        styles.visibilityOption,
                        visibility === option.key && styles.visibilityOptionSelected
                      ]}
                      onPress={() => setVisibility(option.key)}
                    >
                      <MaterialCommunityIcons 
                        name={option.icon} 
                        size={20} 
                        color={visibility === option.key ? '#fff' : '#7a5545'} 
                      />
                      <Text style={[
                        styles.visibilityOptionText,
                        visibility === option.key && styles.visibilityOptionTextSelected
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Cafe Info if available */}
              {spotName && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Địa điểm</Text>
                  <View style={styles.cafeInfoContainer}>
                    <MaterialCommunityIcons name="coffee" size={20} color="#7a5545" />
                    <Text style={styles.cafeInfoText}>{spotName}</Text>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraContainer: {
    flex: 1,
    width: '100%',
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 40 : 0,
    zIndex: 10,
    elevation: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 11,
    elevation: 11,
  },
  spotName: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  guideContainer: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    gap: 12,
  },
  guideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  guideText: {
    color: 'white',
    fontSize: 14,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridRow: {
    width: '100%',
    height: SCREEN_WIDTH,
    justifyContent: 'space-around',
    position: 'absolute',
  },
  gridCol: {
    width: SCREEN_WIDTH,
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
  },
  gridLine: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.3)',
    margin: SCREEN_WIDTH / 3,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Platform.OS === 'android' ? 20 : 0,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  previewContainer: {
    flex: 1,
  },
  preview: {
    flex: 1,
  },
  previewInfo: {
    alignItems: 'center',
    gap: 12,
  },
  previewText: {
    color: 'white',
    fontSize: 24,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  previewSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  saveButton: {
    backgroundColor: '#4A90E2',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  loadingText: {
    color: '#7a5545',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
  },
  errorText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 20,
  },
  errorSubtext: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginHorizontal: 40,
  },
  permissionButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 24,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalSaveButton: {
    backgroundColor: '#7a5545',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  modalSaveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  modalSaveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  previewImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  visibilityContainer: {
    gap: 8,
  },
  visibilityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    gap: 8,
  },
  visibilityOptionSelected: {
    backgroundColor: '#7a5545',
    borderColor: '#7a5545',
  },
  visibilityOptionText: {
    fontSize: 14,
    color: '#333',
  },
  visibilityOptionTextSelected: {
    color: 'white',
  },
  cafeInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  cafeInfoText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});