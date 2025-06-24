import React from 'react';
import { 
  View, 
  TouchableOpacity, 
  Text, 
  TextInput, 
  ScrollView, 
  Image, 
  KeyboardAvoidingView, 
  Platform, 
  StyleSheet 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const VISIBILITY_OPTIONS = [
  { key: 'friends', label: 'Chỉ bạn bè', icon: 'account-group' },
  { key: 'public', label: 'Công khai', icon: 'earth' },
  { key: 'private', label: 'Chỉ mình tôi', icon: 'lock' },
];

const CheckinFormModal = ({
  visible,
  photo,
  title,
  locationName,
  visibility,
  spotName,
  isUploading,
  onClose,
  onTitleChange,
  onVisibilityChange,
  onUpload
}) => {
  return (
    <KeyboardAvoidingView 
      style={[styles.modalContainer, { display: visible ? 'flex' : 'none' }]}
      behavior={'height'}
    >
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <TouchableOpacity 
            onPress={onClose}
            style={styles.modalCloseButton}
          >
            <MaterialCommunityIcons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Thông tin check-in</Text>
          <TouchableOpacity 
            onPress={onUpload}
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
              onChangeText={onTitleChange}
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
                  onPress={() => onVisibilityChange(option.key)}
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

export default CheckinFormModal; 