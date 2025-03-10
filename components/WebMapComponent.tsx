// components/WebMapComponent.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface WebMapComponentProps {
  location?: {
    coords: {
      latitude: number;
      longitude: number;
    };
  } | null;
}

const WebMapComponent: React.FC<WebMapComponentProps> = ({ location }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Map view is only available on mobile devices.
      </Text>
      {location && (
        <Text style={styles.locationText}>
          Your current location: {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
        </Text>
      )}
      {!location && (
        <Text style={styles.infoText}>
          Unable to retrieve your current location.
        </Text>
      )}
    </View>
  );
};

export default WebMapComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  locationText: {
    fontSize: 16,
    color: '#666',
  },
  infoText: {
    fontSize: 16,
    color: '#999',
  },
});
