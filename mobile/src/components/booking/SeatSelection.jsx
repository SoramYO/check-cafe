import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SpotSelection({ selectedSeat, onSelectSeat, seats, bookingType }) {
  // Filter seats based on bookingType
  const filteredSeats = seats?.filter(seat => {
    if (bookingType === 'scenic') {
      return seat.is_premium;
    } else {
      return !seat.is_premium;
    }
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chọn vị trí</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.spotsContainer}
      >
        {filteredSeats?.map((seat) => (
          <TouchableOpacity
            key={seat._id}
            style={[
              styles.spotCard,
              selectedSeat?._id === seat._id && styles.spotCardSelected,
              !seat.is_available && styles.spotCardUnavailable,
            ]}
            onPress={() => seat.is_available && onSelectSeat(seat)}
            disabled={!seat.is_available}
          >
            <Image source={{ uri: seat.image }} style={styles.spotImage} />
            <View style={styles.spotContent}>
              <View style={styles.spotHeader}>
                <Text style={styles.spotName}>{seat.seat_name}</Text>
                {!seat.is_available && (
                  <View style={styles.unavailableBadge}>
                    <Text style={styles.unavailableText}>Đã đặt</Text>
                  </View>
                )}
              </View>
              <Text style={styles.spotDescription}>{seat.description}</Text>
              
              <View style={styles.capacityContainer}>
                <MaterialCommunityIcons name="account-group" size={16} color="#7a5545" />
                <Text style={styles.capacityText}>Sức chứa: {seat.capacity} người</Text>
              </View>

              <View style={styles.features}>
                {seat.features?.map((feature, index) => (
                  <View key={index} style={styles.featureBadge}>
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#7a5545',
    marginBottom: 12,
  },
  spotsContainer: {
    paddingHorizontal: 4,
    gap: 16,
  },
  spotCard: {
    width: 280,
    borderRadius: 12,
    backgroundColor: 'white',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: "#BFA58E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  spotCardSelected: {
    borderColor: '#7a5545',
    backgroundColor: '#f1f1f1',
    shadowColor: "#BFA58E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  spotCardUnavailable: {
    opacity: 0.7,
  },
  spotImage: {
    width: '100%',
    height: 160,
  },
  spotContent: {
    padding: 12,
  },
  spotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  spotName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7a5545',
  },
  unavailableBadge: {
    backgroundColor: '#fcedd6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unavailableText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '500',
  },
  spotDescription: {
    fontSize: 14,
    color: '#7a5545',
    marginBottom: 12,
  },
  capacityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  capacityText: {
    fontSize: 14,
    color: '#7a5545',
  },
  regularBadge: {
    backgroundColor: '#fcedd6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  regularText: {
    color: '#7a5545',
    fontSize: 12,
    fontWeight: '500',
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featureText: {
    color: '#7a5545',
    fontSize: 12,
    fontWeight: '500',
  },
});