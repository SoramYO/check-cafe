import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Alert
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { toast } from 'sonner-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as MediaLibrary from 'expo-media-library';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../services/axiosClient';

// Import camera components
import {
  CameraControls,
  CameraHeader,
  CameraGuide,
  CameraGrid,
  PhotoPreview,
  CameraSettingsModal,
  CheckinFormModal
} from '../components/camera';


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
  const [isSelectingFromLibrary, setIsSelectingFromLibrary] = useState(false);
  const [saveToDevice, setSaveToDevice] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  const cameraRef = useRef(null);
  const isMountedRef = useRef(true);
  const isCleaningUpRef = useRef(false);
  const navigationTimeoutRef = useRef(null);
  
  const { spotId, spotName, cafeId } = route.params || {};

  // Load save to device preference
  useEffect(() => {
    const loadSavePreference = async () => {
      try {
        const saved = await AsyncStorage.getItem('savePhotosToDevice');
        if (saved !== null) {
          setSaveToDevice(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Error loading save preference:', error);
      }
    };
    loadSavePreference();
  }, []);

  // Save preference to AsyncStorage
  const handleSavePreferenceChange = async (value) => {
    try {
      setSaveToDevice(value);
      await AsyncStorage.setItem('savePhotosToDevice', JSON.stringify(value));
    } catch (error) {
      console.error('Error saving preference:', error);
    }
  };

  // Tối ưu useFocusEffect
  useFocusEffect(
    useCallback(() => {
      isMountedRef.current = true;
      isCleaningUpRef.current = false;
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
          
          // Get location in background
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

      // Reverse geocoding trong background
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

  // Save photo to device
  const savePhotoToDevice = async (photoUri) => {
    // Temporarily disabled to avoid "allow expo go to modify this photo" prompt
    // if (!saveToDevice) return;
    
    // Do nothing for now to avoid modification prompts
    return;
    
    // try {
    //   const { status } = await MediaLibrary.requestPermissionsAsync();
    //   if (status === 'granted') {
    //     // Only save the asset, don't create album to avoid modification prompt
    //     await MediaLibrary.createAssetAsync(photoUri);
    //     // Don't show success message to avoid confusion
    //   }
    // } catch (error) {
    //   console.error('Error saving photo:', error);
    //   // Silent fail - don't show error to user
    // }
  };

  // Tối ưu cleanup function
  const performCleanup = useCallback((shouldLog = true) => {
    if (isCleaningUpRef.current) return;
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
    if (isCleaningUpRef.current) return;
    
    try {
      console.log('Closing camera screen...');
      isMountedRef.current = false;
      performCleanup(false);
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
        
        // Save to device if enabled
        if (saveToDevice) {
          savePhotoToDevice(photo.uri);
        }
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

  // Add function to select image from library
  const selectImageFromLibrary = async () => {
    try {
      setIsSelectingFromLibrary(true);
      
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Quyền truy cập',
          'Cần quyền truy cập thư viện ảnh để chọn ảnh',
          [{ text: 'OK' }]
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        aspect: [4, 3],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const selectedImage = result.assets[0];
        
        // Get location for the selected image
        await getCurrentLocation();
        
        // Set the selected image
        setPhoto({
          uri: selectedImage.uri,
          width: selectedImage.width,
          height: selectedImage.height,
        });
        
        toast.success('Đã chọn ảnh từ thư viện');
      }
    } catch (error) {
      console.error('Image picker error:', error);
      toast.error('Không thể chọn ảnh từ thư viện');
    } finally {
      setIsSelectingFromLibrary(false);
    }
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
      
      // Save to media library if not already saved - temporarily disabled
      // if (saveToDevice) {
      //   savePhotoToDevice(photo.uri);
      // }

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
          <Text style={styles.loadingText}>Đang khởi tạo camera...</Text>
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
          
          {/* Camera Header */}
          <CameraHeader
            spotName={spotName}
            isCameraReady={isCameraReady}
            onClose={handleClose}
            onOpenSettings={() => setShowSettings(true)}
          />

          {/* Camera Guide */}
          <CameraGuide
            showGuide={showGuide}
            onCloseGuide={() => setShowGuide(false)}
          />

          {/* Camera Grid */}
          <CameraGrid />

          {/* Camera Controls */}
          <CameraControls
            flash={flash}
            onToggleFlash={toggleFlash}
            onToggleCameraType={toggleCameraType}
            onTakePicture={takePicture}
            onSelectFromLibrary={selectImageFromLibrary}
            onShowGuide={() => setShowGuide(true)}
            isCameraReady={isCameraReady}
            isSelectingFromLibrary={isSelectingFromLibrary}
            onSelectImageFromLibrary={selectImageFromLibrary}
          />
        </View>
      ) : (
        <PhotoPreview
          photo={photo}
          spotName={spotName}
          onRetake={handleRetake}
          onSave={handleSave}
        />
      )}

      {/* Settings Modal */}
      <CameraSettingsModal
        visible={showSettings}
        saveToDevice={saveToDevice}
        onClose={() => setShowSettings(false)}
        onSavePreferenceChange={handleSavePreferenceChange}
      />

      {/* Check-in Form Modal */}
      <CheckinFormModal
        visible={showEditForm}
        photo={photo}
        title={title}
        locationName={locationName}
        visibility={visibility}
        spotName={spotName}
        isUploading={isUploading}
        onClose={() => setShowEditForm(false)}
        onTitleChange={setTitle}
        onVisibilityChange={setVisibility}
        onUpload={handleUploadCheckin}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  cameraContainer: {
    flex: 1,
    width: '100%',
    position: 'relative',
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
});