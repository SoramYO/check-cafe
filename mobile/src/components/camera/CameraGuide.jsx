import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const CAMERA_GUIDES = [
  { icon: 'image-filter-center-focus', text: 'Đặt điểm check-in vào giữa khung hình' },
  { icon: 'white-balance-sunny', text: 'Đảm bảo ánh sáng tốt' },
  { icon: 'image', text: 'Chụp ảnh ngang để có góc nhìn đẹp hơn' },
];

const CameraGuide = ({ showGuide, onCloseGuide }) => {
  if (!showGuide) return null;

  return (
    <View style={styles.guideContainer}>
      <View style={styles.guideHeader}>
        <MaterialCommunityIcons name="lightbulb" size={20} color="#FFD700" />
        <Text style={styles.guideTitle}>Mẹo chụp ảnh</Text>
        <TouchableOpacity onPress={onCloseGuide}>
          <MaterialCommunityIcons name="close" size={20} color="white" />
        </TouchableOpacity>
      </View>
      {CAMERA_GUIDES.map((guide, index) => (
        <View key={index} style={styles.guideItem}>
          <MaterialCommunityIcons 
            name={guide.icon} 
            size={20} 
            color="#FFD700" 
          />
          <Text style={styles.guideText}>{guide.text}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  guideContainer: {
    position: 'absolute',
    top: 140,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 16,
    padding: 16,
    zIndex: 5,
  },
  guideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  guideTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginLeft: 8,
  },
  guideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  guideText: {
    color: 'white',
    fontSize: 14,
    flex: 1,
  },
});

export default CameraGuide; 