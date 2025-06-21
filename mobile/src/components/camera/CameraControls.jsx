import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const CameraControls = ({
  flash,
  onToggleFlash,
  onToggleCameraType,
  onTakePicture,
  onSelectFromLibrary,
  onShowGuide,
  isCameraReady,
  isSelectingFromLibrary
}) => {
  return (
    <LinearGradient 
      style={styles.bottomGradient} 
      colors={['transparent', 'rgba(0,0,0,0.8)']}
    >
      <View style={styles.bottomControls}>
        <View style={styles.leftControls}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onToggleFlash}
          >
            <MaterialCommunityIcons 
              name={flash === 'off' ? 'flash-off' : 'flash'} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onToggleCameraType}
          >
            <MaterialCommunityIcons name="camera-flip" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.captureButton}
          onPress={onTakePicture}
          disabled={!isCameraReady}
        >
          <View style={styles.captureOuter} />
          <View style={styles.captureInner} />
        </TouchableOpacity>

        <View style={styles.rightControls}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onShowGuide}
          >
            <MaterialCommunityIcons name="help-circle" size={24} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onSelectFromLibrary}
            disabled={isSelectingFromLibrary}
          >
            <MaterialCommunityIcons 
              name="image-multiple" 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    zIndex: 10,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  leftControls: {
    flexDirection: 'row',
    gap: 16,
  },
  rightControls: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 11,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    position: 'absolute',
  },
  captureInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'white',
  },
  libraryButtonContainer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  libraryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  libraryButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  libraryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default CameraControls; 