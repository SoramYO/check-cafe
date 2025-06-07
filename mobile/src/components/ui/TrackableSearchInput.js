import React, { useState, useRef } from 'react';
import { TextInput, View, StyleSheet, Keyboard } from 'react-native';
import { useAnalytics } from '../../utils/analytics';

const TrackableSearchInput = ({
  placeholder = 'Tìm kiếm...',
  onSearch,
  trackingMetadata = {},
  debounceMs = 500,
  style,
  inputStyle,
  ...props
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const analytics = useAnalytics();
  const debounceRef = useRef(null);

  const handleChangeText = (text) => {
    setSearchQuery(text);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new debounce
    debounceRef.current = setTimeout(() => {
      if (text.trim().length > 0) {
        // Track search
        analytics.trackSearch(text.trim(), {
          search_length: text.trim().length,
          search_type: 'text_input',
          ...trackingMetadata
        });

        // Call onSearch callback
        if (onSearch) {
          onSearch(text.trim());
        }
      }
    }, debounceMs);
  };

  const handleSubmitEditing = () => {
    if (searchQuery.trim().length > 0) {
      // Clear debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Track immediate search
      analytics.trackSearch(searchQuery.trim(), {
        search_length: searchQuery.trim().length,
        search_type: 'submit',
        ...trackingMetadata
      });

      // Call onSearch callback
      if (onSearch) {
        onSearch(searchQuery.trim());
      }
    }

    Keyboard.dismiss();
  };

  const handleFocus = () => {
    // Track search input focus
    analytics.trackTap('search_input_focus', {
      action: 'focus',
      ...trackingMetadata
    });
  };

  return (
    <View style={[styles.container, style]}>
      <TextInput
        style={[styles.input, inputStyle]}
        placeholder={placeholder}
        value={searchQuery}
        onChangeText={handleChangeText}
        onSubmitEditing={handleSubmitEditing}
        onFocus={handleFocus}
        returnKeyType="search"
        clearButtonMode="while-editing"
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
});

export default TrackableSearchInput; 