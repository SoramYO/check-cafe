import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TimeSlotPicker({ selectedTimeSlot, onSelectTimeSlot, timeSlots }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Chọn khung giờ (2 tiếng)</Text>
      <View style={styles.timeSlotsContainer}>
        {timeSlots?.map((slot, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.timeSlot,
              selectedTimeSlot?.start_time === slot.start_time && styles.timeSlotActive
            ]}
            onPress={() => onSelectTimeSlot(slot)}
          >
            <Text style={[
              styles.timeSlotText,
              selectedTimeSlot?.start_time === slot.start_time && styles.timeSlotTextActive
            ]}>
              {slot.start_time} - {slot.end_time}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeSlotActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  timeSlotText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  timeSlotTextActive: {
    color: 'white',
  },
});