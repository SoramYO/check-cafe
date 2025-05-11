import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function BasicInfo({ cafe }) {
  const handleCall = () => {
    Linking.openURL(`tel:${cafe.phone}`);
  };

  const handleDirections = () => {
    const address = encodeURIComponent(cafe.address);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${address}`);
  };

  const handleWebsite = () => {
    if (cafe.website) {
      Linking.openURL(cafe.website);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{cafe.name}</Text>
      
      <View style={styles.ratingContainer}>
        <MaterialCommunityIcons name="star" size={20} color="#FFD700" />
        <Text style={styles.rating}>{cafe.rating}</Text>
        <Text style={styles.reviews}>({cafe.reviews} đánh giá)</Text>
      </View>

      <TouchableOpacity style={styles.row} onPress={handleDirections}>
        <MaterialCommunityIcons name="map-marker" size={24} color="#666" />
        <Text style={styles.text}>{cafe.address}</Text>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.row} onPress={handleCall}>
        <MaterialCommunityIcons name="phone" size={24} color="#666" />
        <Text style={styles.text}>{cafe.phone}</Text>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
      </TouchableOpacity>

      <View style={styles.row}>
        <MaterialCommunityIcons name="clock" size={24} color="#666" />
        <Text style={styles.text}>{cafe.hours}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Đang mở cửa</Text>
        </View>
      </View>

      {cafe.website && (
        <TouchableOpacity style={styles.row} onPress={handleWebsite}>
          <MaterialCommunityIcons name="web" size={24} color="#666" />
          <Text style={styles.text}>Website</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 4,
  },
  rating: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  reviews: {
    fontSize: 14,
    color: '#666',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
    gap: 10,
  },
  text: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  statusBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
});