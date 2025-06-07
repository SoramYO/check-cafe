import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, Pressable, Alert, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAnalytics } from '../utils/analytics';
import * as Speech from 'expo-speech';

const SearchBar = ({ value, onChangeText, themes, onApplyFilters }) => {
  const [isListening, setIsListening] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [voiceModalVisible, setVoiceModalVisible] = useState(false);
  const [selectedDistance, setSelectedDistance] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [selectedSort, setSelectedSort] = useState('desc');
  const { trackTap, trackSearch, trackFilter } = useAnalytics();

  const handleApplyFilter = () => {
    // Track filter usage
    trackFilter({
      distance: selectedDistance,
      theme_id: selectedTheme,
      sort_rating: selectedSort,
      theme_name: themes?.find(t => t._id === selectedTheme)?.name
    });

    onApplyFilters?.({
      distance: selectedDistance,
      themeId: selectedTheme,
      sortRating: selectedSort
    });
    
    setFilterVisible(false);
  };

  const handleReset = () => {
    setSelectedDistance(null);
    setSelectedTheme(null);
    setSelectedSort('desc');
    onApplyFilters?.({
      distance: null,
      themeId: null,
      sortRating: 'desc'
    });
  };

  const handleVoiceSearch = () => {
    trackTap('voice_search_button', { source: 'search_bar' });
    
    if (Platform.OS === 'web') {
      // For web platform, use Web Speech API
      handleWebVoiceSearch();
    } else {
      // For mobile, show voice modal
      setVoiceModalVisible(true);
      Speech.speak('Chức năng tìm kiếm bằng giọng nói sẽ được hỗ trợ trong phiên bản tương lai', {
        language: 'vi-VN',
        pitch: 1.0,
        rate: 0.8
      });
    }
  };

  const handleWebVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'vi-VN';
      
      setIsListening(true);
      
      recognition.onstart = () => {
        Speech.speak('Đang nghe...', { language: 'vi-VN' });
      };
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onChangeText(transcript);
        trackSearch(transcript, { method: 'voice', source: 'search_bar' });
        Speech.speak(`Đã tìm kiếm: ${transcript}`, { language: 'vi-VN' });
      };
      
      recognition.onerror = (event) => {
        Alert.alert('Lỗi', 'Không thể nhận dạng giọng nói. Vui lòng thử lại.');
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
    } else {
      Alert.alert('Không hỗ trợ', 'Trình duyệt của bạn không hỗ trợ nhận dạng giọng nói.');
    }
  };

  const handleVoiceCancel = () => {
    setVoiceModalVisible(false);
    Speech.speak('Đã hủy tìm kiếm bằng giọng nói', { language: 'vi-VN' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={24} color="#666" />
        <TextInput
          style={styles.input}
          placeholder="Tìm quán cà phê ở Đà Lạt"
          value={value}
          onChangeText={onChangeText}
        />
        <TouchableOpacity 
          disabled={isListening}
          style={styles.iconButton}
          onPress={handleVoiceSearch}
        >
          {isListening ? (
            <ActivityIndicator color="#4A90E2" />
          ) : (
            <MaterialCommunityIcons 
              name="microphone" 
              size={24} 
              color={isListening ? "#4A90E2" : "#666"} 
            />
          )}
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => {
            trackTap('filter_button', { source: 'search_bar' });
            setFilterVisible(true);
          }} 
          style={styles.iconButton}
        >
          <MaterialCommunityIcons name="tune-vertical" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <Modal
        visible={filterVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setFilterVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bộ lọc</Text>
              <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
                <MaterialCommunityIcons name="refresh" size={18} color="#4A90E2" />
                <Text style={styles.resetText}>Đặt lại</Text>
              </TouchableOpacity>
            </View>
            
            {/* Distance filter */}
            <Text style={styles.filterLabel}>Khoảng cách</Text>
            <View style={styles.filterOptions}>
              {[1, 3, 5, 10, 20].map(dist => (
                <Pressable
                  key={dist}
                  style={[
                    styles.filterOption,
                    selectedDistance === dist && styles.filterOptionSelected
                  ]}
                  onPress={() => setSelectedDistance(dist)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    selectedDistance === dist && styles.filterOptionTextSelected
                  ]}>{dist} km</Text>
                </Pressable>
              ))}
            </View>

            {/* Theme filter */}
            <Text style={styles.filterLabel}>Chủ đề</Text>
            <View style={styles.filterOptions}>
              {themes?.map(theme => (
                <Pressable
                  key={theme._id}
                  style={[
                    styles.filterOption,
                    selectedTheme === theme._id && styles.filterOptionSelected
                  ]}
                  onPress={() => setSelectedTheme(theme._id)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    selectedTheme === theme._id && styles.filterOptionTextSelected
                  ]}>{theme.name}</Text>
                </Pressable>
              ))}
            </View>

            {/* Rating Sort */}
            <Text style={styles.filterLabel}>Sắp xếp theo đánh giá</Text>
            <View style={styles.filterOptions}>
              <Pressable
                style={[
                  styles.filterOption,
                  selectedSort === 'desc' && styles.filterOptionSelected
                ]}
                onPress={() => setSelectedSort('desc')}
              >
                <View style={styles.sortOptionContent}>
                  <MaterialCommunityIcons 
                    name="star" 
                    size={16} 
                    color={selectedSort === 'desc' ? 'white' : '#666'} 
                  />
                  <Text style={[
                    styles.filterOptionText,
                    selectedSort === 'desc' && styles.filterOptionTextSelected
                  ]}>Cao đến thấp</Text>
                </View>
              </Pressable>
              <Pressable
                style={[
                  styles.filterOption,
                  selectedSort === 'asc' && styles.filterOptionSelected
                ]}
                onPress={() => setSelectedSort('asc')}
              >
                <View style={styles.sortOptionContent}>
                  <MaterialCommunityIcons 
                    name="star-outline" 
                    size={16} 
                    color={selectedSort === 'asc' ? 'white' : '#666'} 
                  />
                  <Text style={[
                    styles.filterOptionText,
                    selectedSort === 'asc' && styles.filterOptionTextSelected
                  ]}>Thấp đến cao</Text>
                </View>
              </Pressable>
            </View>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApplyFilter}
            >
              <Text style={styles.applyButtonText}>Áp dụng</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setFilterVisible(false)}
            >
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Voice Search Modal */}
      <Modal
        visible={voiceModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setVoiceModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.voiceModalContent}>
            <View style={styles.voiceModalHeader}>
              <MaterialCommunityIcons name="microphone" size={64} color="#4A90E2" />
              <Text style={styles.voiceModalTitle}>Tìm kiếm bằng giọng nói</Text>
              <Text style={styles.voiceModalSubtitle}>
                {Platform.OS === 'web' ? 'Nhấn nút bên dưới để bắt đầu' : 'Tính năng sẽ được hỗ trợ trong phiên bản tương lai'}
              </Text>
            </View>

            <View style={styles.voiceMainContainer}>
              <TouchableOpacity
                style={styles.voiceMainButton}
                onPress={() => {
                  if (Platform.OS === 'web') {
                    setVoiceModalVisible(false);
                    handleWebVoiceSearch();
                  } else {
                    Alert.alert(
                      "Tính năng Voice Search", 
                      "Chức năng nhận dạng giọng nói đang được phát triển và sẽ có mặt trong các phiên bản tương lai.\n\nHiện tại bạn có thể sử dụng tìm kiếm bằng văn bản.",
                      [{ text: "Đã hiểu", style: "default" }]
                    );
                  }
                }}
                disabled={Platform.OS !== 'web'}
              >
                <MaterialCommunityIcons 
                  name="microphone" 
                  size={40} 
                  color={Platform.OS === 'web' ? "#FFF9F5" : "#BFA58E"} 
                />
                <Text style={[
                  styles.voiceMainButtonText,
                  Platform.OS !== 'web' && styles.voiceMainButtonTextDisabled
                ]}>
                  {Platform.OS === 'web' ? 'Bắt đầu tìm kiếm' : 'Đang phát triển'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.voiceCloseButton}
              onPress={handleVoiceCancel}
            >
              <MaterialCommunityIcons name="close" size={20} color="#BFA58E" />
              <Text style={styles.voiceCloseButtonText}>Đóng</Text>
            </TouchableOpacity>

            <View style={styles.voiceHelpText}>
              <MaterialCommunityIcons name="information-outline" size={16} color="#BFA58E" />
              <Text style={styles.voiceHelpTextContent}>
                {Platform.OS === 'web' 
                  ? 'Gợi ý: "Quán cà phê gần đây", "Cà phê view đẹp", "Starbucks"'
                  : 'Tính năng này sẽ cho phép bạn tìm kiếm bằng giọng nói'
                }
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9F5',
    borderRadius: 25,
    padding: 2,
    paddingHorizontal: 12,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#6B4F3F',
    fontWeight: '500',
  },
  iconButton: {
    padding: 6,
    backgroundColor: '#F0E6DD',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF9F5',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    minHeight: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8D3C3',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#6B4F3F',
    letterSpacing: 0.5,
  },
  filterLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#6B4F3F',
    marginBottom: 12,
    marginTop: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  filterOption: {
    backgroundColor: '#F0E6DD',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8D3C3',
  },
  filterOptionSelected: {
    backgroundColor: '#BFA58E',
    borderColor: '#8B7355',
  },
  filterOptionText: {
    color: '#6B4F3F',
    fontSize: 15,
    fontWeight: '500',
  },
  filterOptionTextSelected: {
    color: '#FFF9F5',
    fontWeight: '600',
  },
  sortOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  applyButton: {
    backgroundColor: '#6B4F3F',
    padding: 18,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  applyButtonText: {
    color: '#FFF9F5',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  closeButton: {
    alignItems: 'center',
    padding: 16,
    marginTop: 8,
  },
  closeButtonText: {
    color: '#BFA58E',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    backgroundColor: '#F0E6DD',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8D3C3',
  },
  resetText: {
    color: '#6B4F3F',
    fontSize: 15,
    fontWeight: '600',
  },
  // Voice Modal Styles
  voiceModalContent: {
    backgroundColor: '#FFF9F5',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    minHeight: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  voiceModalHeader: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8D3C3',
  },
  voiceModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#6B4F3F',
    marginTop: 12,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  voiceModalSubtitle: {
    fontSize: 16,
    color: '#BFA58E',
    textAlign: 'center',
    fontWeight: '500',
  },
  voiceMainContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  voiceMainButton: {
    backgroundColor: '#6B4F3F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 25,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    minWidth: 200,
  },
  voiceMainButtonText: {
    color: '#FFF9F5',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  voiceMainButtonTextDisabled: {
    color: '#BFA58E',
  },
  voiceCloseButton: {
    backgroundColor: '#F0E6DD',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 20,
    gap: 8,
    borderWidth: 2,
    borderColor: '#E8D3C3',
    marginBottom: 20,
  },
  voiceCloseButtonText: {
    color: '#BFA58E',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  voiceHelpText: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F0E6DD',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8D3C3',
  },
  voiceHelpTextContent: {
    flex: 1,
    fontSize: 14,
    color: '#BFA58E',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },

});

export default SearchBar;