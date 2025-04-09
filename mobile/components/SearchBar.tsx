import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { toast } from 'sonner-native';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onPressFilter: () => void;
  onPressVoice: () => void;
}

export default function SearchBar({ value, onChangeText, onPressFilter, onPressVoice }: SearchBarProps) {
  const [isListening, setIsListening] = useState(false);

  const startVoiceRecognition = async () => {
    try {
      setIsListening(true);

      // Stop any ongoing speech
      Speech.stop();

      // Start listening
      const thresholds = {
        recognitionThreshold: 0.1,
        modelPoints: 1,
      };

      Speech.speak('Bạn muốn tìm quán cà phê nào?', {
        language: 'vi-VN',
        onDone: () => {
          setTimeout(() => {
            // Simulate voice recognition result after 3 seconds
            const mockResults = [
              'The Dreamer Coffee',
              'Mountain View Café',
              'Horizon Coffee',
            ];
            const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
            onChangeText(randomResult);
            setIsListening(false);
            
            // Provide feedback
            Speech.speak('Đang tìm kiếm ' + randomResult, {
              language: 'vi-VN',
            });
          }, 3000);
        },
        onError: (error) => {
          console.error('Speech error:', error);
          setIsListening(false);
          toast.error('Không thể nhận dạng giọng nói');
        },
      });
    } catch (error) {
      console.error('Voice recognition error:', error);
      setIsListening(false);
      toast.error('Không thể khởi động nhận dạng giọng nói');
    }
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
          onPress={startVoiceRecognition}
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
        <TouchableOpacity onPress={onPressFilter} style={styles.iconButton}>
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
  iconButton: {
    padding: 4,
  },
});