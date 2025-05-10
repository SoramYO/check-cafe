import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { toast } from 'sonner-native';
import Voice from '@react-native-voice/voice';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onPressFilter: () => void;
  onPressVoice: () => void;
}

export default function SearchBar({ value, onChangeText, onPressFilter, onPressVoice }: SearchBarProps) {
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechResults = (event: any) => {
    const results = event.value;
    if (results && results.length > 0) {
      onChangeText(results[0]);
      setIsListening(false);
      Speech.speak('Đang tìm kiếm ' + results[0], { language: 'vi-VN' });
    }
  };

  const onSpeechError = (event: any) => {
    setIsListening(false);
    toast.error('Không thể nhận dạng giọng nói');
  };

  const startVoiceRecognition = async () => {
    try {
      setIsListening(true);
      await Voice.start('vi-VN');
    } catch (error) {
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