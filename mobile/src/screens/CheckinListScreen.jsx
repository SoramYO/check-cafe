import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
  Share,
  StatusBar,
  Animated,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { toast } from 'sonner-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import checkinAPI from '../services/checkinAPI';
import { useAnalytics } from '../utils/analytics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function CheckinListScreen({ route }) {
  const navigation = useNavigation();
  const { trackScreenView, trackTap, isAuthenticated } = useAnalytics();
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [fabScale] = useState(new Animated.Value(1));

  // Comment modal states
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedCheckin, setSelectedCheckin] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  const shouldRefresh = route.params?.refresh;

  // Cache management for liked checkins
  const getLikedCheckins = async () => {
    try {
      const likedData = await AsyncStorage.getItem('likedCheckins');
      return likedData ? JSON.parse(likedData) : {};
    } catch (error) {
      console.error('Error getting liked checkins:', error);
      return {};
    }
  };

  const saveLikedCheckin = async (checkinId, isLiked) => {
    try {
      const likedData = await getLikedCheckins();
      if (isLiked) {
        likedData[checkinId] = true;
      } else {
        delete likedData[checkinId];
      }
      await AsyncStorage.setItem('likedCheckins', JSON.stringify(likedData));
    } catch (error) {
      console.error('Error saving liked checkin:', error);
    }
  };

  // Optional: Clear cache (for testing/debugging)
  const clearLikedCache = async () => {
    try {
      await AsyncStorage.removeItem('likedCheckins');
    } catch (error) {
      console.error('Error clearing liked cache:', error);
    }
  };

  // FAB Animation
  const handleFabPress = () => {
    Animated.sequence([
      Animated.timing(fabScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fabScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    navigation.navigate('CheckinCamera');
  };

  // Comment Functions
  const openCommentModal = async (checkin) => {
    setSelectedCheckin(checkin);
    setCommentModalVisible(true);
    await loadComments(checkin._id);
  };

  const closeCommentModal = () => {
    setCommentModalVisible(false);
    setSelectedCheckin(null);
    setComments([]);
    setNewComment('');
  };

  const loadComments = async (checkinId) => {
    try {
      setLoadingComments(true);
      const response = await checkinAPI.HandleCheckin(`/${checkinId}/comments`);

      if (response.status === 200) {
        setComments(response.data?.comments || response.data || []);
      } else {
        throw new Error(response.message || 'Failed to load comments');
      }
    } catch (error) {
      console.error('Load comments error:', error);
      toast.error('Không thể tải bình luận');
    } finally {
      setLoadingComments(false);
    }
  };

  const submitComment = async () => {
    if (!newComment.trim() || !selectedCheckin) return;

    try {
      setSubmittingComment(true);
      const response = await checkinAPI.HandleCheckin(
        `/${selectedCheckin._id}/comment`,
        { comment: newComment.trim() },
        'post'
      );

      if (response.status === 200 || response.status === 201) {
        const newCommentData = response.data || {
          _id: Date.now().toString(),
          comment: newComment.trim(),
          user_id: {
            full_name: 'Bạn',
            avatar: 'https://via.placeholder.com/40'
          },
          createdAt: new Date().toISOString()
        };

        setComments(prev => [newCommentData, ...prev]);
        setNewComment('');

        // Update comment count in main list
        setCheckins(prev => prev.map(checkin =>
          checkin._id === selectedCheckin._id
            ? { ...checkin, comments_count: (checkin.comments_count || 0) + 1 }
            : checkin
        ));

        toast.success('Đã thêm bình luận');
      } else {
        throw new Error(response.message || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Submit comment error:', error);

      // Don't show error if it's actually a success message
      if (error.message !== 'Comment added successfully' && !error.message?.includes('successfully')) {
        toast.error('Không thể thêm bình luận');
      }
    } finally {
      setSubmittingComment(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        if (await isAuthenticated()) {
          trackScreenView('CheckinList', {
            timestamp: new Date().toISOString()
          });
        }
      };
      init();

      if (shouldRefresh) {
        loadCheckins(1, true);
        // Clear the refresh parameter
        navigation.setParams({ refresh: false });
      }
    }, [shouldRefresh])
  );

  useEffect(() => {
    loadCheckins(1, true);
  }, []);

  const loadCheckins = async (pageNum = 1, reset = false) => {
    try {
      if (pageNum === 1 && !reset) {
        setLoading(true);
      } else if (pageNum > 1) {
        setLoadingMore(true);
      }

      const response = await checkinAPI.HandleCheckin(`?page=${pageNum}&limit=20`);

      // Handle different response formats
      if (response.data || response.status === 200) {
        const newCheckins = response.data?.checkins || response.data || [];

        // Get cached liked status and apply to checkins
        const likedCache = await getLikedCheckins();

        // Ensure each checkin has isLiked field (from cache or backend or default false)
        const processedCheckins = newCheckins.map(checkin => ({
          ...checkin,
          isLiked: likedCache[checkin._id] || checkin.isLiked || false,
          likes_count: checkin.likes_count || 0,
          comments_count: checkin.comments_count || 0
        }));

        if (reset || pageNum === 1) {
          setCheckins(processedCheckins);
        } else {
          setCheckins(prev => [...prev, ...processedCheckins]);
        }

        setPage(pageNum);
        setHasMore(response.data?.hasMore || newCheckins.length === 20);
      } else {
        throw new Error(response.message || 'Failed to load checkins');
      }
    } catch (error) {
      toast.error('Không thể tải danh sách check-in');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadCheckins(1, true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadCheckins(page + 1);
    }
  };

  const handleLikeCheckin = async (checkinId) => {
    try {
      await trackTap('checkin_like', { checkinId });

      const response = await checkinAPI.HandleCheckin(`/${checkinId}/like`, {}, 'post');

      // Check for success - backend might return different formats
      const isSuccess = response.data ||
        response.status === 200 ||
        response.message === 'Checkin liked' ||
        response.message === 'Checkin unliked';

      if (!isSuccess) {
        throw new Error(response.message || 'Failed to like checkin');
      }

      // Update based on actual backend response
      const isLiked = response.message === 'Checkin liked';
      const isUnliked = response.message === 'Checkin unliked';

      // Update cache
      if (isLiked) {
        await saveLikedCheckin(checkinId, true);
      } else if (isUnliked) {
        await saveLikedCheckin(checkinId, false);
      }

      // If response includes updated data, use it
      if (response.data && response.data.checkin) {
        const updatedCheckin = response.data.checkin;
        setCheckins(prev => prev.map(checkin =>
          checkin._id === checkinId
            ? {
              ...checkin,
              ...updatedCheckin,
              isLiked: updatedCheckin.isLiked,
              likes_count: updatedCheckin.likes_count
            }
            : checkin
        ));
      } else {
        // Fallback to manual update
        setCheckins(prev => prev.map(checkin =>
          checkin._id === checkinId
            ? {
              ...checkin,
              isLiked: isLiked ? true : (isUnliked ? false : !checkin.isLiked),
              likes_count: response.data?.likes_count || response.likes_count ||
                (isLiked ? (checkin.likes_count || 0) + 1 :
                  isUnliked ? Math.max((checkin.likes_count || 0) - 1, 0) :
                    checkin.likes_count)
            }
            : checkin
        ));
      }


    } catch (error) {
      console.error('Like checkin error:', error);

      // Don't show error if it's actually a success message
      if (error.message !== 'Checkin liked' && error.message !== 'Checkin unliked') {
        toast.error('Không thể thích check-in');
      }
    }
  };

  const handleShareCheckin = async (checkin) => {
    try {
      await trackTap('checkin_share', { checkinId: checkin._id });

      const shareContent = {
        message: `Check-in tại ${checkin.location?.address || 'một địa điểm'}: ${checkin.title}`,
        url: `checkafe://checkin/${checkin._id}`, // Deep link
      };

      await Share.share(shareContent);
    } catch (error) {
      console.error('Share checkin error:', error);
    }
  };

  const handleDeleteCheckin = (checkinId) => {
    Alert.alert(
      'Xóa check-in',
      'Bạn có chắc chắn muốn xóa check-in này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => deleteCheckin(checkinId)
        }
      ]
    );
  };

  const deleteCheckin = async (checkinId) => {
    try {
      await trackTap('checkin_delete', { checkinId });

      const response = await checkinAPI.HandleCheckin(`/${checkinId}`, {}, 'delete');

      if (response.data) {
        setCheckins(prev => prev.filter(checkin => checkin._id !== checkinId));
        toast.success('Đã xóa check-in');
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Delete checkin error:', error);
      toast.error('Không thể xóa check-in');
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return date.toLocaleDateString('vi-VN');
  };

  const renderCommentItem = ({ item: comment }) => (
    <View style={styles.commentItem}>
      <Image
        source={{ uri: comment.user_id?.avatar || 'https://via.placeholder.com/32' }}
        style={styles.commentAvatar}
      />
      <View style={styles.commentContent}>
        <View style={styles.commentBubble}>
          <Text style={styles.commentUserName}>
            {comment.user_id?.full_name || comment.user_id?.username || 'Unknown User'}
          </Text>
          <Text style={styles.commentText}>{comment.comment}</Text>
        </View>
        <Text style={styles.commentTime}>{formatTimestamp(comment.createdAt)}</Text>
      </View>
    </View>
  );

  const renderCheckinItem = ({ item: checkin }) => {
    const isOwnCheckin = checkin.user_id?._id === checkin.currentUserId; // You'll need to pass current user ID

    return (
      <View style={styles.checkinCard}>
        {/* Header */}
        <View style={styles.checkinHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri: checkin.user_id?.avatar || 'https://via.placeholder.com/40'
                }}
                style={styles.avatar}
              />
              <View style={styles.onlineIndicator} />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>
                {checkin.user_id?.full_name || checkin.user_id?.username || 'Unknown User'}
              </Text>
              <View style={styles.timestampRow}>
                <MaterialCommunityIcons name="clock-outline" size={12} color="#999" />
                <Text style={styles.timestamp}>
                  {formatTimestamp(checkin.createdAt)}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => {
              if (isOwnCheckin) {
                handleDeleteCheckin(checkin._id);
              } else {
                // Show report options
                Alert.alert(
                  'Báo cáo',
                  'Báo cáo nội dung không phù hợp?',
                  [
                    { text: 'Hủy', style: 'cancel' },
                    { text: 'Báo cáo', onPress: () => {/* Handle report */ } }
                  ]
                );
              }
            }}
          >
            <MaterialCommunityIcons name="dots-vertical" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <Text style={styles.checkinTitle}>{checkin.title}</Text>

        {/* Location */}
        {checkin.location?.address && (
          <TouchableOpacity style={styles.locationInfo}>
            <LinearGradient
              colors={['#7a5545', '#8d6e63']}
              style={styles.locationIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialCommunityIcons name="map-marker" size={14} color="white" />
            </LinearGradient>
            <Text style={styles.locationText}>{checkin.location.address}</Text>
          </TouchableOpacity>
        )}

        {/* Image */}
        {checkin.image && (
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={() => navigation.navigate('ImageViewer', {
              imageUrl: checkin.image,
              title: checkin.title,
              userName: checkin.user_id?.full_name
            })}
          >
            <Image source={{ uri: checkin.image }} style={styles.checkinImage} />
            <View style={styles.imageOverlay}>
              <MaterialCommunityIcons name="eye" size={20} color="white" />
            </View>
          </TouchableOpacity>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, checkin.isLiked && styles.actionButtonLiked]}
            onPress={() => handleLikeCheckin(checkin._id)}
          >
            <MaterialCommunityIcons
              name={checkin.isLiked ? "heart" : "heart-outline"}
              size={22}
              color={checkin.isLiked ? "#e74c3c" : "#666"}
            />
            <Text style={[
              styles.actionText,
              checkin.isLiked && styles.actionTextLiked
            ]}>
              {checkin.likes_count || 0}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openCommentModal(checkin)}
          >
            <MaterialCommunityIcons name="comment-outline" size={22} color="#666" />
            <Text style={styles.actionText}>{checkin.comments_count || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleShareCheckin(checkin)}
          >
            <MaterialCommunityIcons name="share-variant-outline" size={22} color="#666" />
            <Text style={styles.actionText}>Chia sẻ</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={['#f8f9fa', '#e9ecef']}
        style={styles.emptyIconContainer}
      >
        <MaterialCommunityIcons name="camera-outline" size={80} color="#7a5545" />
      </LinearGradient>
      <Text style={styles.emptyTitle}>Chưa có check-in nào</Text>
      <Text style={styles.emptySubtitle}>
        Hãy bắt đầu check-in và chia sẻ những khoảnh khắc đẹp của bạn tại các quán cà phê!
      </Text>
      <TouchableOpacity
        style={styles.createCheckinButton}
        onPress={() => navigation.navigate('CafeMap')}
      >
        <LinearGradient
          colors={['#7a5545', '#8d6e63']}
          style={styles.createCheckinGradient}
        >
          <MaterialCommunityIcons name="map" size={20} color="white" />
          <Text style={styles.createCheckinButtonText}>Khám phá bản đồ</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#7a5545" />

      <View style={styles.header}>
        <Text style={styles.title}>Check-in</Text>
      </View>

      <FlatList
        data={checkins}
        renderItem={renderCheckinItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={[
          checkins.length === 0 ? styles.emptyList : styles.list,
          { paddingBottom: 100 } // Space for FAB
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#7a5545']}
            tintColor="#7a5545"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={!loading ? renderEmpty : null}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <Animated.View style={[
        styles.fabContainer,
        { transform: [{ scale: fabScale }] }
      ]}>
        <TouchableOpacity
          style={styles.fab}
          onPress={handleFabPress}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#ff6b6b', '#ff8e8e']}
            style={styles.fabGradient}
          >
            <MaterialCommunityIcons name="camera-plus" size={28} color="white" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Secondary FAB for Map */}
        <TouchableOpacity
          style={styles.secondaryFab}
          onPress={() => navigation.navigate('CheckinMap')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#7a5545', '#8d6e63']}
            style={styles.secondaryFabGradient}
          >
            <MaterialCommunityIcons name="map-outline" size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Comment Modal */}
      <Modal
        visible={commentModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeCommentModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeCommentModal}>
              <MaterialCommunityIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Bình luận</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Checkin Info */}
          {selectedCheckin && (
            <View style={styles.checkinInfo}>
              <Image
                source={{ uri: selectedCheckin.user_id?.avatar || 'https://via.placeholder.com/40' }}
                style={styles.checkinInfoAvatar}
              />
              <View style={styles.checkinInfoContent}>
                <Text style={styles.checkinInfoUser}>
                  {selectedCheckin.user_id?.full_name || 'Unknown User'}
                </Text>
                <Text style={styles.checkinInfoTitle} numberOfLines={2}>
                  {selectedCheckin.title}
                </Text>
              </View>
            </View>
          )}

          {/* Comments List */}
          <FlatList
            data={comments}
            renderItem={renderCommentItem}
            keyExtractor={(item) => item._id}
            style={styles.commentsList}
            contentContainerStyle={styles.commentsContent}
            showsVerticalScrollIndicator={false}
            refreshing={loadingComments}
            onRefresh={() => selectedCheckin && loadComments(selectedCheckin._id)}
            ListEmptyComponent={
              !loadingComments && (
                <View style={styles.emptyComments}>
                  <MaterialCommunityIcons name="comment-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyCommentsText}>Chưa có bình luận nào</Text>
                  <Text style={styles.emptyCommentsSubtext}>Hãy là người đầu tiên bình luận!</Text>
                </View>
              )
            }
          />

          {/* Comment Input */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.commentInputContainer}
          >
            <View style={styles.commentInputRow}>
              <TextInput
                style={styles.commentInput}
                placeholder="Viết bình luận..."
                value={newComment}
                onChangeText={setNewComment}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!newComment.trim() || submittingComment) && styles.sendButtonDisabled
                ]}
                onPress={submitComment}
                disabled={!newComment.trim() || submittingComment}
              >
                {submittingComment ? (
                  <MaterialCommunityIcons name="loading" size={20} color="white" />
                ) : (
                  <MaterialCommunityIcons name="send" size={20} color="white" />
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: "Poppins_600SemiBold",
    color: "#7a5545",
    fontWeight: "bold",
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#7a5545',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
  },
  checkinCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  checkinHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#fff',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 2,
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  menuButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  checkinTitle: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 12,
    lineHeight: 24,
    fontWeight: '500',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  locationIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#7a5545',
    flex: 1,
    fontWeight: '500',
  },
  imageContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  checkinImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
  },
  imageOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  actionButtonLiked: {
    backgroundColor: '#ffe6e6',
  },
  actionText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  actionTextLiked: {
    color: '#e74c3c',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  createCheckinButton: {
    marginTop: 16,
  },
  createCheckinGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 30,
    gap: 8,
  },
  createCheckinButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    alignItems: 'center',
  },
  fab: {
    marginBottom: 12,
  },
  fabGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#ff6b6b',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  secondaryFab: {
    elevation: 6,
  },
  secondaryFabGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7a5545',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
    textAlign: 'center',
  },
  checkinInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  checkinInfoAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#7a5545',
  },
  checkinInfoContent: {
    flex: 1,
  },
  checkinInfoUser: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
  },
  checkinInfoTitle: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
    lineHeight: 20,
  },
  commentsList: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  commentsContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  commentContent: {
    flex: 1,
  },
  commentBubble: {
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  commentUserName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7a5545',
    marginBottom: 2,
  },
  commentText: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
  commentTime: {
    fontSize: 11,
    color: '#95a5a6',
    marginTop: 4,
    marginLeft: 12,
  },
  commentInputContainer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  commentInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    fontSize: 14,
    color: '#2c3e50',
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7a5545',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#7a5545',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#bdc3c7',
    elevation: 0,
    shadowOpacity: 0,
  },
  emptyComments: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyCommentsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7f8c8d',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyCommentsSubtext: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
    lineHeight: 20,
  },
}); 