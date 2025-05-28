import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TimeSlotPicker({ selectedTimeSlot, onSelectTimeSlot, timeSlots }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Chọn khung giờ (2 tiếng)</Text>
      <View style={styles.timeSlotsContainer}>
        {timeSlots && timeSlots.length > 0 ? (
          timeSlots.map((slot) => (
            <TouchableOpacity
              key={slot._id}
              style={[
                styles.timeSlot,
                selectedTimeSlot?._id === slot._id && styles.timeSlotActive,
                !slot.is_active && styles.timeSlotDisabled
              ]}
              onPress={() => slot.is_active && onSelectTimeSlot(slot)}
              disabled={!slot.is_active}
            >
              <View style={styles.timeSlotContent}>
                <Text style={[
                  styles.timeSlotText,
                  selectedTimeSlot?._id === slot._id && styles.timeSlotTextActive,
                  !slot.is_active && styles.timeSlotTextDisabled
                ]}>
                  {slot.start_time} - {slot.end_time}
                </Text>
                {!slot.is_active && (
                  <MaterialCommunityIcons 
                    name="close-circle" 
                    size={16} 
                    color="#94A3B8" 
                    style={styles.disabledIcon}
                  />
                )}
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.noSlotsContainer}>
            <MaterialCommunityIcons name="calendar-clock" size={24} color="#94A3B8" />
            <Text style={styles.noSlotsText}>Không có khung giờ nào cho ngày này</Text>
          </View>
        )}
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
    color: '#7a5545',
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
    backgroundColor: '#f1f1f1',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: "#BFA58E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  timeSlotActive: {
    backgroundColor: '#7a5545',
    borderColor: '#7a5545',
  },
  timeSlotDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    opacity: 0.7,
  },
  timeSlotContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeSlotText: {
    fontSize: 14,
    color: '#7a5545',
    fontWeight: '500',
  },
  timeSlotTextActive: {
    color: 'white',
  },
  timeSlotTextDisabled: {
    color: '#94A3B8',
  },
  disabledIcon: {
    marginLeft: 4,
  },
  noSlotsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f1f1f1',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
  },
  noSlotsText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
});