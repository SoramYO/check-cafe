import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onPressFilter: () => void;
  onPressVoice: () => void;
}

export default function SearchBar({ value, onChangeText, onPressFilter, onPressVoice }: SearchBarProps) {
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
        <TouchableOpacity onPress={onPressVoice}>
          <MaterialCommunityIcons name="microphone" size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onPressFilter}>
          <MaterialCommunityIcons name="tune-vertical" size={24} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
});