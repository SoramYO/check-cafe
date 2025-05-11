import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Text, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';


const ReviewSection = ({
  reviews,
  averageRating,
  totalReviews,
  shop,
  onReviewPress,
  onSeeAllPress,
  onWriteReviewPress,
}) => {
  const [likedReviews, setLikedReviews] = useState(new Set());
  const rating = averageRating || (shop?.rating_avg || 0);
  const reviewCount = totalReviews || (shop?.rating_count || 0);

  const handleLikePress = (reviewId) => {
    setLikedReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  const renderRatingStats = () => {
    const stats = [5, 4, 3, 2, 1].map(stars => ({
      stars,
      percentage: Math.random() * 100, // Replace with actual data
    }));

    return (
      <View style={styles.ratingStats}>
        {stats.map(({ stars, percentage }) => (
          <View key={stars} style={styles.ratingStat}>
            <Text style={styles.ratingStarText}>{stars}</Text>
            <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
            <View style={styles.ratingBar}>
              <View style={[styles.ratingFill, { width: `${percentage}%` }]} />
            </View>
            <Text style={styles.ratingPercentage}>{Math.round(percentage)}%</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderReviewCard = (review) => {
    const isLiked = likedReviews.has(review.id);

    return (
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500 }}
        style={styles.reviewCard}
        key={review.id}
      >
        <View style={styles.reviewHeader}>
          <View style={styles.userInfo}>
            {review.userAvatar ? (
              <Image source={{ uri: review.userAvatar }} style={styles.userAvatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialCommunityIcons name="account" size={24} color="#94A3B8" />
              </View>
            )}
            <View>
              <Text style={styles.username}>{review.username}</Text>
              <Text style={styles.date}>{review.date}</Text>
            </View>
          </View>
          <View style={styles.ratingContainer}>
            {[...Array(5)].map((_, index) => (
              <MaterialCommunityIcons
                key={index}
                name={index < review.rating ? "star" : "star-outline"}
                size={16}
                color="#FFD700"
              />
            ))}
          </View>
        </View>

        <Text style={styles.comment}>{review.comment}</Text>

        {review?.photos && review?.photos?.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.photosContainer}
          >
            {review.photos.map((photo, index) => (
              <TouchableOpacity key={index} style={styles.photoWrapper}>
                <Image source={{ uri: photo }} style={styles.reviewPhoto} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={styles.reviewActions}>
          <TouchableOpacity
            style={[styles.actionButton, isLiked && styles.actionButtonActive]}
            onPress={() => handleLikePress(review.id)}
          >
            <MaterialCommunityIcons
              name={isLiked ? "heart" : "heart-outline"}
              size={20}
              color={isLiked ? "#EF4444" : "#64748B"}
            />
            <Text style={[
              styles.actionButtonText,
              isLiked && styles.actionButtonTextActive
            ]}>
              {review.likes + (isLiked ? 1 : 0)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <MaterialCommunityIcons name="comment-outline" size={20} color="#64748B" />
            <Text style={styles.actionButtonText}>Phản hồi</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <MaterialCommunityIcons name="share-outline" size={20} color="#64748B" />
            <Text style={styles.actionButtonText}>Chia sẻ</Text>
          </TouchableOpacity>
        </View>
      </MotiView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Đánh giá</Text>
        {reviews?.length > 0 && (
          <TouchableOpacity onPress={onSeeAllPress} style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>Xem tất cả</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#4A90E2" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.ratingOverview}>
        <View style={styles.ratingMain}>
          <Text style={styles.averageRating}>{rating.toFixed(1)}</Text>
          <View style={styles.starsContainer}>
            {[...Array(5)].map((_, index) => (
              <MaterialCommunityIcons
                key={index}
                name={index < Math.floor(rating) ? "star" : "star-outline"}
                size={24}
                color="#FFD700"
              />
            ))}
          </View>
          <Text style={styles.totalReviews}>
            {reviewCount} đánh giá
          </Text>
        </View>
        {renderRatingStats()}
      </View>

      {reviews?.length > 0 ? (
        reviews.map(renderReviewCard)
      ) : (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="star-outline" size={48} color="#94A3B8" />
          <Text style={styles.emptyStateText}>
            Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.writeReviewButton}
        onPress={onWriteReviewPress}
      >
        <MaterialCommunityIcons name="pencil" size={20} color="white" />
        <Text style={styles.writeReviewText}>Viết đánh giá</Text>
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
  ratingOverview: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    gap: 24,
  },
  ratingMain: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  averageRating: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  totalReviews: {
    fontSize: 14,
    color: '#64748B',
  },
  ratingStats: {
    flex: 2,
    gap: 8,
  },
  ratingStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingStarText: {
    width: 16,
    textAlign: 'center',
    color: '#64748B',
  },
  ratingBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
  },
  ratingFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 2,
  },
  ratingPercentage: {
    width: 40,
    fontSize: 12,
    color: '#64748B',
    textAlign: 'right',
  },
  reviewCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  date: {
    fontSize: 12,
    color: '#64748B',
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  comment: {
    fontSize: 14,
    color: '#1E293B',
    lineHeight: 20,
  },
  photosContainer: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  photoWrapper: {
    marginRight: 8,
  },
  reviewPhoto: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  reviewActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  actionButtonActive: {
    color: '#EF4444',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#64748B',
  },
  actionButtonTextActive: {
    color: '#EF4444',
  },
  emptyState: {
    alignItems: 'center',
    gap: 12,
    padding: 24,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 12,
  },
  writeReviewText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReviewSection;