import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const CameraHeader = ({
  spotName,
  isCameraReady,
  onClose,
  onOpenSettings
}) => {
  return (
    <LinearGradient 
      style={styles.topGradient} 
      colors={['rgba(0,0,0,0.8)', 'transparent']}
    >
      <View style={styles.topControls}>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="close" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.centerInfo}>
          <Text style={styles.spotName}>{spotName || 'Check-in'}</Text>
          <Text style={styles.cameraStatus}>
            {isCameraReady ? 'Sẵn sàng chụp' : 'Đang khởi tạo...'}
          </Text>
        </View>
        
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onOpenSettings}
        >
          <MaterialCommunityIcons name="cog" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    zIndex: 10,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  centerInfo: {
    alignItems: 'center',
    flex: 1,
  },
  spotName: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cameraStatus: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 4,
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
});

export default CameraHeader; 