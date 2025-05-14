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
    padding: 15,
    backgroundColor: 'white',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 10,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  iconButton: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  filterOption: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  filterOptionSelected: {
    backgroundColor: '#4A90E2',
  },
  filterOptionText: {
    color: '#333',
    fontSize: 14,
  },
  filterOptionTextSelected: {
    color: 'white',
    fontWeight: '500',
  },
  sortOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  applyButton: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    alignItems: 'center',
    padding: 15,
  },
  closeButtonText: {
    color: '#4A90E2',
    fontSize: 16,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
  },
  resetText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SearchBar;