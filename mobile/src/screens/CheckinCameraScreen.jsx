import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, Dimensions, Alert } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { toast } from 'sonner-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as MediaLibrary from 'expo-media-library';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CAMERA_GUIDES = [
  { icon: 'image-filter-center-focus', text: 'Đặt điểm check-in vào giữa khung hình' },
  { icon: 'white-balance-sunny', text: 'Đảm bảo ánh sáng tốt' },
  { icon: 'image', text: 'Chụp ảnh ngang để có góc nhìn đẹp hơn' },
];

export default function CheckinCameraScreen({ route }) {
  const navigation = useNavigation();
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState('back');
  const [isCameraReady, setCameraReady] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [showGuide, setShowGuide] = useState(true);
  const [flash, setFlash] = useState('off');
  const [isCameraActive, setIsCameraActive] = useState(true);
  
  const cameraRef = useRef(null);
  const { spotId, spotName, cafeId } = route.params || {};

  useEffect(() => {
    let isMounted = true;
    const setupCamera = async () => {
      try {
        await requestPermission();
        // Request media library permission
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Cần quyền truy cập',
            'Ứng dụng cần quyền truy cập thư viện ảnh để lưu ảnh check-in.',
            [{ text: 'OK' }]
          );
        }
        if (isMounted) {
          const timer = setTimeout(() => setShowGuide(false), 3000);
          return () => {
            clearTimeout(timer);
            cleanupCamera();
          };
        }
      } catch (error) {
        console.error('Camera setup error:', error);
        Alert.alert(
          'Lỗi Camera',
          'Không thể khởi tạo camera. Vui lòng thử lại.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    };

    setupCamera();

    return () => {
      isMounted = false;
      cleanupCamera();
    };
  }, []);

  const cleanupCamera = () => {
    try {
      if (cameraRef.current) {
        cameraRef.current = null;
      }
      setIsCameraActive(false);
    } catch (error) {
      console.error('Camera cleanup error:', error);
    }
  };

  const handleClose = () => {
    try {
      cleanupCamera();
      navigation.goBack();
    } catch (error) {
      console.error('Close error:', error);
      navigation.goBack();
    }
  };

  const handleCameraReady = () => {
    try {
      setCameraReady(true);
    } catch (error) {
      console.error('Camera ready error:', error);
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current || !isCameraReady || !isCameraActive) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
        exif: true,
        skipProcessing: true
      });
      setPhoto(photo);
    } catch (error) {
      console.error('Camera error:', error);
      toast.error('Không thể chụp ảnh. Vui lòng thử lại.');
    }
  };

  const handleSave = async () => {
    try {
      cleanupCamera();
      
      // Save to media library
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        const asset = await MediaLibrary.createAssetAsync(photo.uri);
        await MediaLibrary.createAlbumAsync('CheckCafe', asset, false);
        toast.success('Đã lưu ảnh vào thư viện');
      } else {
        toast.error('Không có quyền lưu ảnh');
      }

      // Simulate upload
      // toast.promise(
      //   new Promise((resolve) => setTimeout(resolve, 1500)),
      //   {
      //     loading: 'Đang lưu ảnh...',
      //     success: 'Check-in thành công!',
      //     error: 'Không thể lưu ảnh. Vui lòng thử lại.',
      //   }
      // );
      // setTimeout(() => navigation.goBack(), 2000);
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Không thể lưu ảnh. Vui lòng thử lại.');
      navigation.goBack();
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
      {!photo ? (
        <View style={styles.cameraContainer}>
          {isCameraActive && (
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing={cameraType}
              onCameraReady={handleCameraReady}
              flash={flash}
            >
              <LinearGradient
                colors={['rgba(0,0,0,0.7)', 'transparent', 'rgba(0,0,0,0.7)']}
                style={styles.overlay}
              >
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
            </CameraView>
          )}
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
              <MaterialCommunityIcons name="image-check" size={48} color="white" />
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