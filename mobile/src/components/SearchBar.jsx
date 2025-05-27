import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SearchBar = ({ value, onChangeText, themes, onApplyFilters }) => {
  const [isListening, setIsListening] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedDistance, setSelectedDistance] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [selectedSort, setSelectedSort] = useState('desc');

  const handleApplyFilter = () => {
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
        <TouchableOpacity onPress={() => setFilterVisible(true)} style={styles.iconButton}>
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
});

export default SearchBar;