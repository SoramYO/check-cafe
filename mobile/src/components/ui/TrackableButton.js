import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useAnalytics } from '../../utils/analytics';

const TrackableButton = ({ 
  title, 
  onPress, 
  trackingName, 
  trackingMetadata = {}, 
  style,
  textStyle,
  disabled = false,
  ...props 
}) => {
  const analytics = useAnalytics();

  const handlePress = () => {
    // Track the tap
    if (trackingName) {
      analytics.trackTap(trackingName, {
        button_title: title,
        ...trackingMetadata
      });
    }

    // Call the original onPress handler
    if (onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, style, disabled && styles.disabled]}
      onPress={handlePress}
      disabled={disabled}
      {...props}
    >
      <Text style={[styles.buttonText, textStyle, disabled && styles.disabledText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#f57f1f',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    backgroundColor: '#ccc',
  },
  disabledText: {
    color: '#999',
  },
});

export default TrackableButton; 