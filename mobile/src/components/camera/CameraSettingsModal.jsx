import React from 'react';
import { View, TouchableOpacity, Text, ScrollView, Switch, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const CameraSettingsModal = ({
  visible,
  saveToDevice,
  onClose,
  onSavePreferenceChange
}) => {
  return (
    <View style={[styles.modalContainer, { display: visible ? 'flex' : 'none' }]}>
      <View style={styles.settingsContent}>
        <View style={styles.settingsHeader}>
          <TouchableOpacity 
            onPress={onClose}
            style={styles.modalCloseButton}
          >
            <MaterialCommunityIcons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.settingsTitle}>Cài đặt Camera</Text>
          <View style={styles.modalCloseButton} />
        </View>

        <ScrollView style={styles.settingsBody} showsVerticalScrollIndicator={false}>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <MaterialCommunityIcons name="content-save" size={24} color="#7a5545" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Lưu ảnh vào thư viện</Text>
                <Text style={styles.settingDescription}>
                  Tự động lưu ảnh check-in vào thư viện ảnh của bạn
                </Text>
              </View>
            </View>
            <Switch
              value={saveToDevice}
              onValueChange={onSavePreferenceChange}
              trackColor={{ false: '#ddd', true: '#7a5545' }}
              thumbColor={saveToDevice ? '#fff' : '#f4f3f4'}
            />
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  settingsContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    minHeight: '40%',
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsBody: {
    flex: 1,
    padding: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default CameraSettingsModal; 