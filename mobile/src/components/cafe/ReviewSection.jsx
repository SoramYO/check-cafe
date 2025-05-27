import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
  ScrollView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import reviewAPI from "../../services/reviewAPI";
import { toast } from "sonner-native";
import { formatDateTime } from "../../utils/formatHelpers";
import { useSelector } from "react-redux";
import { authSelector } from "../../redux/reducers/authReducer";

const ReviewSection = ({
  averageRating,
  totalReviews,
  shop,
  onSeeAllPress,
  onWriteReviewPress,
}) => {
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState([]);
  const [likedReviews, setLikedReviews] = useState(new Set());
  const rating = averageRating || shop?.rating_avg || 0;
  const [selectedRating, setSelectedRating] = useState(0);
  const reviewCount = totalReviews || shop?.rating_count || 0;
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [reviewComment, setReviewComment] = useState("");
  const { user } = useSelector(authSelector);

  useEffect(() => {
    const fetchReviews = async () => {
      const response = await reviewAPI.HandleReview(`/shop/${shop._id}`);
      setReviews(response.data.reviews);
      setReviewStats(response.data.starCounts);
    };
    fetchReviews();
  }, []);

  const handleLikePress = (reviewId) => {
    setLikedReviews((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  const renderStars = (rating, size = 20, interactive = false) => {
    const stars = [];
    const roundedRating = interactive ? Math.floor(rating) : rating;

    for (let i = 1; i <= 5; i++) {
      if (interactive) {
        stars.push(
          <TouchableOpacity
            key={i}
            onPress={() => setSelectedRating(i)}
            style={styles.starButton}
          >
            <MaterialCommunityIcons
              name={i <= roundedRating ? "star" : "star-outline"}
              size={size}
              color={i <= roundedRating ? "#FFD700" : "#94A3B8"}
            />
          </TouchableOpacity>
        );
      } else {
        const diff = roundedRating - i + 1;
        let starIcon = "star-outline";
        if (diff >= 1) starIcon = "star";
        else if (diff > 0) starIcon = "star-half-full";

        stars.push(
          <MaterialCommunityIcons
            key={i}
            name={starIcon}
            size={size}
            color="#FFD700"
          />
        );
      }
    }
    return stars;
  };

  const renderRatingStats = () => {
    const stats = Object.entries(reviewStats).map(([stars, count]) => {
      const percentage =
        reviewCount && reviewCount > 0 ? (count / reviewCount) * 100 : 0;

      return {
        stars: parseInt(stars),
        percentage,
      };
    });

    return (
      <View style={styles.ratingStats}>
        {stats.map(({ stars, percentage }) => (
          <View key={stars} style={styles.ratingStat}>
            <Text style={styles.ratingStarText}>{stars}</Text>
            <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
            <View style={styles.ratingBar}>
              <View style={[styles.ratingFill, { width: `${percentage}%` }]} />
            </View>
            <Text style={styles.ratingPercentage}>
              {Math.round(percentage)}%
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderReviewCard = (review) => {
    // const isLiked = likedReviews.has(review._id);

    return (
      <View style={styles.reviewCard} key={review?._id}>
        <View style={styles.reviewHeader}>
          <View style={styles.userInfo}>
            {review?.user_id.avatar ? (
              <Image
                source={{ uri: review?.user_id.avatar }}
                style={styles.userAvatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialCommunityIcons
                  name="account"
                  size={24}
                  color="#94A3B8"
                />
              </View>
            )}
            <View>
              <Text style={styles.username}>{review?.user_id.full_name}</Text>
              <Text style={styles.date}>
                {formatDateTime(review?.createdAt)}
              </Text>
            </View>
          </View>
          <View style={styles.ratingContainer}>
            {renderStars(review?.rating)}
          </View>
        </View>

        <Text style={styles.comment}>{review?.comment}</Text>

        {review?.photos && review?.photos?.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.photosContainer}
          >
            {review?.photos?.map((photo, index) => (
              <TouchableOpacity key={index} style={styles.photoWrapper}>
                <Image source={{ uri: photo }} style={styles.reviewPhoto} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={styles.reviewActions}>
          {/* <TouchableOpacity
            style={[styles.actionButton, isLiked && styles.actionButtonActive]}
            onPress={() => handleLikePress(review.id)}
          >
            <MaterialCommunityIcons
              name={isLiked ? "heart" : "heart-outline"}
              size={20}
              color={isLiked ? "#EF4444" : "#64748B"}
            />
            <Text
              style={[
                styles.actionButtonText,
                isLiked && styles.actionButtonTextActive,
              ]}
            >
              {review.likes + (isLiked ? 1 : 0)}
            </Text>
          </TouchableOpacity> */}

          <TouchableOpacity style={styles.actionButton}>
            <MaterialCommunityIcons
              name="comment-outline"
              size={20}
              color="#64748B"
            />
            <Text style={styles.actionButtonText}>Phản hồi</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <MaterialCommunityIcons
              name="share-outline"
              size={20}
              color="#64748B"
            />
            <Text style={styles.actionButtonText}>Chia sẻ</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderStarRating = () => {
    const hasReviewed = reviews.some(
      (review) => review.user_id._id === user._id
    );

    if (hasReviewed) {
      return (
        <View style={styles.writeReviewContainer}>
          <Text style={styles.writeReviewTitle}>Bạn đã đánh giá quán này</Text>
          <View style={styles.reviewedMessage}>
            <MaterialCommunityIcons
              name="check-circle"
              size={24}
              color="#10B981"
            />
            <Text style={styles.reviewedText}>Cảm ơn bạn đã đánh giá!</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.writeReviewContainer}>
        <Text style={styles.writeReviewTitle}>Đánh giá của bạn</Text>
        <View style={styles.starsInputContainer}>
          {renderStars(selectedRating, 32, true)}
        </View>
        <Text style={styles.emptyStateText}>
          Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!
        </Text>
        <TouchableOpacity
          style={[
            styles.writeReviewButton,
            { backgroundColor: selectedRating > 0 ? "#4A90E2" : "#E2E8F0" },
          ]}
          disabled={selectedRating === 0}
          onPress={() => setIsReviewModalVisible(true)}
        >
          <Text
            style={[
              styles.writeReviewButtonText,
              { color: selectedRating > 0 ? "white" : "#94A3B8" },
            ]}
          >
            Viết đánh giá
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const handleSubmitReview = async () => {
    const data = {
      rating: selectedRating,
      comment: reviewComment,
      shop_id: shop?._id,
    };
    const response = await reviewAPI.HandleReview("", data, "post");
    if (response.status === 200) {
      toast.success("Đánh giá đã được gửi thành công");
      setSelectedRating(0);
      setReviewComment("");
      setIsReviewModalVisible(false);
      setReviews([...reviews, response.data]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Đánh giá</Text>
        {reviews?.length > 0 && (
          <TouchableOpacity onPress={onSeeAllPress} style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>Xem tất cả</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color="#4A90E2"
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.ratingOverview}>
        <View style={styles.ratingMain}>
          <Text style={styles.averageRating}>{rating.toFixed(1)}</Text>
          <View style={styles.starsContainer}>{renderStars(rating)}</View>
          <Text style={styles.totalReviews}>{reviewCount} đánh giá</Text>
        </View>
        {renderRatingStats()}
      </View>

      {renderStarRating()}

      {reviews?.length > 0 && reviews.map(renderReviewCard)}

      <Modal
        visible={isReviewModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsReviewModalVisible(false)}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            setIsReviewModalVisible(false);
            Keyboard.dismiss();
          }}
        >
          <View style={styles.modalContainer}>
            <KeyboardAvoidingView behavior="padding">
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Viết đánh giá</Text>
                  <TouchableOpacity
                    onPress={() => setIsReviewModalVisible(false)}
                    style={styles.closeButton}
                  >
                    <MaterialCommunityIcons
                      name="close"
                      size={24}
                      color="#64748B"
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalStars}>
                  {renderStars(selectedRating, 32, true)}
                </View>

                <TextInput
                  style={styles.reviewInput}
                  placeholder="Chia sẻ trải nghiệm của bạn..."
                  multiline
                  numberOfLines={4}
                  value={reviewComment}
                  onChangeText={setReviewComment}
                />

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    { opacity: selectedRating > 0 ? 1 : 0.5 },
                  ]}
                  disabled={selectedRating === 0}
                  onPress={handleSubmitReview}
                >
                  <Text style={styles.submitButtonText}>Gửi đánh giá</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    gap: 16,
    shadowColor: "#BFA58E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#6B4F3F",
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    color: "#7a5545",
    fontWeight: "500",
  },
  ratingOverview: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    gap: 24,
  },
  ratingMain: {
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  averageRating: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#6B4F3F",
  },
  starsContainer: {
    flexDirection: "row",
    gap: 4,
  },
  totalReviews: {
    fontSize: 14,
    color: "#7a5545",
  },
  ratingStats: {
    flex: 2,
    gap: 8,
  },
  ratingStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ratingStarText: {
    width: 16,
    textAlign: "center",
    color: "#7a5545",
  },
  ratingBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#E8D3C3",
    borderRadius: 2,
  },
  ratingFill: {
    height: "100%",
    backgroundColor: "#7a5545",
    borderRadius: 2,
  },
  ratingPercentage: {
    width: 40,
    fontSize: 12,
    color: "#7a5545",
    textAlign: "right",
  },
  reviewCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#E8D3C3",
    shadowColor: "#BFA58E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
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
    backgroundColor: "#f1f1f1",
    justifyContent: "center",
    alignItems: "center",
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B4F3F",
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: "#7a5545",
  },
  ratingContainer: {
    flexDirection: "row",
    gap: 2,
  },
  comment: {
    fontSize: 14,
    color: "#6B4F3F",
    lineHeight: 20,
  },
  photosContainer: {
    flexDirection: "row",
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
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
  },
  actionButtonActive: {
    color: "#EF4444",
  },
  actionButtonText: {
    fontSize: 14,
    color: "#7a5545",
  },
  actionButtonTextActive: {
    color: "#EF4444",
  },
  emptyState: {
    alignItems: "center",
    gap: 12,
    padding: 24,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#7a5545",
    textAlign: "center",
    marginBottom: 16,
  },
  writeReviewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#7a5545",
    padding: 16,
    borderRadius: 12,
  },
  writeReviewText: {
    color: "#FFF9F5",
    fontSize: 16,
    fontWeight: "600",
  },
  writeReviewContainer: {
    padding: 16,
    backgroundColor: "white",
    borderRadius: 12,
  },
  writeReviewTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#7a5545",
    marginBottom: 16,
  },
  starsInputContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  writeReviewButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#FFF9F5",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: "40%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#6B4F3F",
  },
  closeButton: {
    padding: 4,
  },
  modalStars: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
    gap: 8,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: "#E8D3C3",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#6B4F3F",
    height: 120,
    textAlignVertical: "top",
    marginBottom: 24,
    backgroundColor: "#FFF9F5",
  },
  submitButton: {
    backgroundColor: "#7a5545",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFF9F5",
    fontSize: 16,
    fontWeight: "600",
  },
  reviewedMessage: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  reviewedText: {
    fontSize: 16,
    color: "#6B4F3F",
    fontWeight: "500",
  },
});

export default ReviewSection;
