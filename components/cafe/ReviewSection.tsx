import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';

interface Review {
  id: string;
  username: string;
  userAvatar?: string;
  rating: number;
  date: string;
  comment: string;
  photos?: string[];
}

interface ReviewSectionProps {
  reviews?: Review[];
  averageRating?: number;
  totalReviews?: number;
  cafe?: {
    rating: number;
    reviews: number;
  };
  onReviewPress?: (review: Review) => void;
  onSeeAllPress?: () => void;
  onWriteReviewPress?: () => void;
}


const ReviewSection: React.FC<ReviewSectionProps> = ({
  reviews = [],
  averageRating,
  totalReviews,
  cafe,
  onReviewPress,
  onSeeAllPress,
  onWriteReviewPress,
}) => {
  const { colors } = useTheme();
  const rating = averageRating || (cafe?.rating || 0);
  const reviewCount = totalReviews || (cafe?.reviews || 0);

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<ThemedText key={i} style={styles.star}>★</ThemedText>);
      } else if (i === fullStars + 1 && halfStar) {
        stars.push(<ThemedText key={i} style={styles.star}>✮</ThemedText>);
      } else {
        stars.push(<ThemedText key={i} style={[styles.star, styles.emptyStar]}>☆</ThemedText>);
      }
    }

    return <View style={styles.starsContainer}>{stars}</View>;
  };

  const renderReviewItem = ({ item }: { item: Review }) => (
    <TouchableOpacity
      style={styles.reviewItem}
      onPress={() => onReviewPress && onReviewPress(item)}
    >
      <View style={styles.reviewHeader}>
        <View style={styles.userInfo}>
          {item.userAvatar ? (
            <Image source={{ uri: item.userAvatar }} style={styles.userAvatar} />
          ) : (
            <View style={styles.avatarPlaceholder} />
          )}
          <View>
            <ThemedText style={styles.username}>{item.username}</ThemedText>
            <ThemedText style={styles.date}>{item.date}</ThemedText>
          </View>
        </View>
        {renderStars(item.rating)}
      </View>
      
      <ThemedText style={styles.comment}>{item.comment}</ThemedText>
      
      {item.photos && item.photos.length > 0 && (
        <FlatList
          horizontal
          data={item.photos}
          keyExtractor={(photo, index) => `${item.id}-photo-${index}`}
          renderItem={({ item: photo }) => (
            <Image source={{ uri: photo }} style={styles.reviewPhoto} />
          )}
          contentContainerStyle={styles.photosContainer}
          showsHorizontalScrollIndicator={false}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.ratingOverview}>
        <ThemedText style={styles.averageRating}>{rating.toFixed(1)}</ThemedText>
        {renderStars(rating)}
        <ThemedText style={styles.totalReviews}>
          {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
        </ThemedText>
      </View>

      {reviews.length > 0 ? (
        <FlatList
          data={reviews.slice(0, 3)} // Show only first 3 reviews
          renderItem={renderReviewItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <ThemedText style={styles.noReviewsText}>
          No reviews yet. Be the first to review!
        </ThemedText>
      )}

      <TouchableOpacity
        style={styles.writeReviewButton}
        onPress={onWriteReviewPress}
      >
        <ThemedText style={styles.writeReviewText}>Write a Review</ThemedText>
      </TouchableOpacity>
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
  ratingOverview: {
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  averageRating: {
    fontSize: 36,
    fontWeight:'bold',
    marginBottom: 4,
    paddingVertical: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  star: {
    fontSize: 18,
    color: '#FFD700',
    marginHorizontal: 2,
  },
  emptyStar: {
    color: '#E0E0E0',
  },
  totalReviews: {
    fontSize: 14,
    color: '#666',
  },
  reviewItem: {
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginRight: 8,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  comment: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  photosContainer: {
    marginTop: 8,
  },
  reviewPhoto: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  noReviewsText: {
    textAlign: 'center',
    fontSize: 16,
    marginVertical: 20,
    fontStyle: 'italic',
  },
  writeReviewButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  writeReviewText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReviewSection; 