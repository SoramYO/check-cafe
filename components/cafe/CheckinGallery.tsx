import React from 'react';
import { View, Image, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';

interface Checkin {
  id: string;
  imageUrl: string;
  username: string;
  date: string;
  caption?: string;
}

interface CheckinSpot {
  id: string;
  image: string;
  description: string;
}

interface CheckinGalleryProps {
  spots: CheckinSpot[]; // Changed from checkins to spots
  onCheckinPress?: (spot: CheckinSpot) => void;
  onSeeAllPress?: () => void;
}

const CheckinGallery: React.FC<CheckinGalleryProps> = ({ 
  spots, // Changed prop name from checkins to spots
  onCheckinPress, 
  onSeeAllPress 
}) => {
  const { colors } = useTheme();
  const numColumns = 3;
  const screenWidth = Dimensions.get('window').width;
  const itemWidth = (screenWidth - 48) / numColumns;

  const renderCheckinItem = ({ item }: { item: CheckinSpot }) => (
    <TouchableOpacity 
      style={[styles.checkinItem, { width: itemWidth, height: itemWidth }]}
      onPress={() => onCheckinPress && onCheckinPress(item)}
    >
      <Image 
        source={{ uri: item.image }} // Changed from imageUrl to image
        style={styles.checkinImage}
        resizeMode="cover"
      />
      <View style={styles.usernameContainer}>
        <ThemedText style={styles.username}>{item.description}</ThemedText> // Changed from username to description
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerContainer}>
        <ThemedText style={styles.sectionTitle}>Check-in Spots</ThemedText>
        {spots.length > 6 && ( // Changed checkins to spots
          <TouchableOpacity onPress={onSeeAllPress}>
            <ThemedText style={styles.seeAllButton}>See All</ThemedText>
          </TouchableOpacity>
        )}
      </View>

      {spots.length > 0 ? ( // Changed checkins to spots
        <FlatList
          data={spots.slice(0, 6)} // Changed checkins to spots
          renderItem={renderCheckinItem}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          columnWrapperStyle={styles.columnWrapper}
          scrollEnabled={false}
        />
      ) : (
        <ThemedText style={styles.noCheckinsText}>
          No check-in spots available.
        </ThemedText>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginVertical: 8,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  seeAllButton: {
    fontSize: 16,
    color: '#3498db',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  checkinItem: {
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  checkinImage: {
    width: '100%',
    height: '100%',
  },
  usernameContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 4,
  },
  username: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  noCheckinsText: {
    textAlign: 'center',
    fontSize: 16,
    marginVertical: 20,
    fontStyle: 'italic',
  },
});

export default CheckinGallery; 