import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const CheckinGallery = ({ 
  images,
  onSpotPress,
  onSeeAllPress,
  cafeId
}) => {
  const navigation = useNavigation();

  const handleCheckin = (spot) => {
    navigation.navigate('CheckinCamera', {
      spotId: spot.id,
      spotName: spot.description,
      cafeId: cafeId
    });
  };

  const handleAddSpot = () => {
    navigation.navigate('CheckinCamera', {
      cafeId: cafeId,
      isNewSpot: true
    });
  };

  const renderSpotCard = ({ item: image }) => (
    <View
      style={styles.spotCard}
    >
      <TouchableOpacity onPress={() => onSpotPress?.(image)}>
        <Image source={{ uri: image.url }} style={styles.spotImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.gradient}
        >
          <View style={styles.spotInfo}>
            <Text style={styles.spotDescription}>{image.caption}</Text>
            <TouchableOpacity 
              style={styles.checkInButton}
              onPress={() => handleCheckin(image)}
            >
              <MaterialCommunityIcons name="camera" size={16} color="white" />
              <Text style={styles.checkInText}>Check-in</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <MaterialCommunityIcons name="camera" size={24} color="#4A90E2" />
          <Text style={styles.title}>Điểm check-in đẹp</Text>
        </View>
        {images?.length > 3 && (
          <TouchableOpacity onPress={onSeeAllPress} style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>Xem tất cả</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#4A90E2" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={images}
        renderItem={renderSpotCard}
        keyExtractor={(item) => item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.spotsContainer}
      />

      <TouchableOpacity 
        style={styles.addSpotButton}
        onPress={handleAddSpot}
      >
        <MaterialCommunityIcons name="plus" size={20} color="#4A90E2" />
        <Text style={styles.addSpotText}>Thêm điểm check-in mới</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '500',
  },
  spotsContainer: {
    gap: 16,
    paddingVertical: 8,
  },
  spotCard: {
    width: 280,
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginRight: 16,
  },
  spotImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    justifyContent: 'flex-end',
    padding: 12,
  },
  spotInfo: {
    gap: 8,
  },
  spotDescription: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  checkInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  checkInText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  addSpotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  addSpotText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '500',
  },
});

export default CheckinGallery;