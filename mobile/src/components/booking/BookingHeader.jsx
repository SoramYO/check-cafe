import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function BookingHeader({ shop, onBack }) {
  return (
    <View style={styles.heroContainer}>
      <Image 
        source={{ uri: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2947&auto=format&fit=crop' }}
        style={styles.heroImage}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.heroGradient}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onBack}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.heroContent}>
          <Text style={styles.cafeName}>{shop?.name}</Text>
          <View style={styles.addressContainer}>
            <MaterialCommunityIcons name="map-marker" size={16} color="white" />
            <Text style={styles.cafeAddress}>{shop?.address}</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  heroContainer: {
    height: 250,
    width: '100%',
  },
  heroImage: {
    height: 250,
    width: '100%',
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    justifyContent: 'space-between',
  },
  heroContent: {
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cafeName: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cafeAddress: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    flex: 1,
  },
});