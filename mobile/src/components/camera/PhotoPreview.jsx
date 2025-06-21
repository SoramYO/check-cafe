import React from 'react';
import { View, TouchableOpacity, Text, Image, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const PhotoPreview = ({
  photo,
  spotName,
  onRetake,
  onSave
}) => {
  return (
    <View style={styles.previewContainer}>
      <Image source={{ uri: photo.uri }} style={styles.preview} />
      <LinearGradient
        colors={['rgba(0,0,0,0.7)', 'transparent', 'rgba(0,0,0,0.7)']}
        style={styles.overlay}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={onRetake}
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
            onPress={onRetake}
          >
            <MaterialCommunityIcons name="camera-retake" size={24} color="white" />
            <Text style={styles.actionButtonText}>Chụp lại</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.saveButton]}
            onPress={onSave}
          >
            <MaterialCommunityIcons name="check" size={24} color="white" />
            <Text style={styles.actionButtonText}>Lưu</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  previewContainer: {
    flex: 1,
  },
  preview: {
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
    paddingTop: 0,
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
  spotName: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
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
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
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
});

export default PhotoPreview; 