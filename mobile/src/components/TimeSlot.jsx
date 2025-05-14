import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const TimeSlot = ({ 
  slot, 
  isBooked = false, 
  remainingRegular = 0,
  remainingPremium = 0,
  onPress,
  selected = false
}) => {
  const getSlotStatus = () => {
    if (!slot.is_active) return 'inactive';
    if (isBooked) return 'booked';
    if (remainingRegular === 0 && remainingPremium === 0) return 'full';
    return 'available';
  };

  const status = getSlotStatus();

  const getStatusColor = () => {
    switch (status) {
      case 'inactive':
        return '#9CA3AF';
      case 'booked':
        return '#4ADE80';
      case 'full':
        return '#EF4444';
      case 'available':
        return selected ? '#4A90E2' : '#1E293B';
      default:
        return '#1E293B';
    }
  };

  const getStatusBackground = () => {
    switch (status) {
      case 'inactive':
        return '#F3F4F6';
      case 'booked':
        return '#DCFCE7';
      case 'full':
        return '#FEE2E2';
      case 'available':
        return selected ? '#EBF5FF' : '#FFFFFF';
      default:
        return '#FFFFFF';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'inactive':
        return 'clock-outline';
      case 'booked':
        return 'check-circle';
      case 'full':
        return 'close-circle';
      case 'available':
        return selected ? 'clock-check' : 'clock';
      default:
        return 'clock';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'inactive':
        return 'Không khả dụng';
      case 'booked':
        return 'Đã đặt';
      case 'full':
        return 'Hết chỗ';
      case 'available':
        return `Còn ${remainingRegular + remainingPremium} chỗ`;
      default:
        return '';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: getStatusBackground() },
        selected && styles.selected
      ]}
      onPress={onPress}
      disabled={status !== 'available'}
    >
      <View style={styles.timeContainer}>
        <MaterialCommunityIcons
          name={getStatusIcon()}
          size={20}
          color={getStatusColor()}
        />
        <Text style={[styles.time, { color: getStatusColor() }]}>
          {slot.start_time} - {slot.end_time}
        </Text>
      </View>
      
      <View style={styles.statusContainer}>
        <Text style={[styles.status, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
        {status === 'available' && (
          <View style={styles.seatsContainer}>
            <View style={styles.seatType}>
              <MaterialCommunityIcons name="seat" size={16} color="#4A90E2" />
              <Text style={styles.seatCount}>{remainingRegular}</Text>
            </View>
            <View style={styles.seatType}>
              <MaterialCommunityIcons name="seat-recline-extra" size={16} color="#F59E0B" />
              <Text style={styles.seatCount}>{remainingPremium}</Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selected: {
    borderColor: '#4A90E2',
    borderWidth: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  time: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 28,
  },
  status: {
    fontSize: 14,
  },
  seatsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  seatType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seatCount: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
});

export default TimeSlot; 