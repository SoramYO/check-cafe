import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function BasicInfo({ shop }) {
  const handleCall = () => {
    Linking.openURL(`tel:${shop?.phone}`);
  };
  

  const handleDirections = () => {
    const address = encodeURIComponent(shop?.address);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${address}`);
  };

  const handleWebsite = () => {
    if (shop?.website) {
      Linking.openURL(shop?.website)
    }
  };

  const getCurrentDaySchedule = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    return shop?.formatted_opening_hours?.[today] || 'Không có thông tin';
  };

  const isOpenNow = () => {
    const schedule = getCurrentDaySchedule();
    if (schedule === 'Không có thông tin') return false;

    let openTime = '';
    let closeTime = '';
    if (typeof schedule === 'string' && schedule.includes(' - ')) {
      [openTime, closeTime] = schedule.split(' - ');
    }
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [openHour, openMinute] = openTime.split(':').map(Number);
    const [closeHour, closeMinute] = closeTime.split(':').map(Number);
    
    const openMinutes = openHour * 60 + openMinute;
    const closeMinutes = closeHour * 60 + closeMinute;

    return currentTime >= openMinutes && currentTime <= closeMinutes;
  };

  const getStatusColor = () => {
    return isOpenNow() ? '#4CAF50' : '#F44336';
  };

  const getStatusText = () => {
    return isOpenNow() ? 'Đang mở cửa' : 'Đã đóng cửa';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{shop?.name}</Text>
      
      <View style={styles.ratingContainer}>
        <MaterialCommunityIcons name="star" size={20} color="#FFD700" />
        <Text style={styles.rating}>{shop?.rating_avg}</Text>
        <Text style={styles.reviews}>({shop?.rating_count} đánh giá)</Text>
      </View>

      <View style={styles.row}>
        <MaterialCommunityIcons name="palette" size={24} color="#7a5545" />
        <Text style={styles.text}>Chủ đề: {shop?.theme_ids.map(theme => theme.name).join(', ')}</Text>
      </View>

      <TouchableOpacity style={styles.row} onPress={handleDirections}>
        <MaterialCommunityIcons name="map-marker" size={24} color="#7a5545" />
        <Text style={styles.text}>{shop?.address}</Text>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#7a5545" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.row} onPress={handleCall}>
        <MaterialCommunityIcons name="phone" size={24} color="#7a5545" />
        <Text style={styles.text}>{shop?.phone}</Text>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#7a5545" />
      </TouchableOpacity>

      <View style={styles.row}>
        <MaterialCommunityIcons name="clock" size={24} color="#7a5545" />
        <Text style={styles.text}>{getCurrentDaySchedule()}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      </View>

      {shop?.website && (
        <TouchableOpacity style={styles.row} onPress={handleWebsite}>
          <MaterialCommunityIcons name="web" size={24} color="#7a5545" />
          <Text style={styles.text}>Website</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#7a5545" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#BFA58E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6B4F3F",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    gap: 4,
  },
  rating: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6B4F3F",
  },
  reviews: {
    fontSize: 14,
    color: "#BFA58E",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E8D3C3",
    gap: 10,
  },
  text: {
    flex: 1,
    fontSize: 16,
    color: "#6B4F3F",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#FFF9F5",
    fontSize: 12,
    fontWeight: "500",
  },
});