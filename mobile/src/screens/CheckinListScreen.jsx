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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { toast } from 'sonner-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import checkinAPI from '../services/checkinAPI';
import { useAnalytics } from '../utils/analytics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CheckinListScreen({ route }) {
  const navigation = useNavigation();
  const { trackScreenView, trackTap, isAuthenticated } = useAnalytics();
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

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
      console.log('Liked cache cleared');
    } catch (error) {
      console.error('Error clearing liked cache:', error);
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
      console.log('CheckinList response:', response);

      // Handle different response formats
      if (response.data || response.status === 200) {
        const newCheckins = response.data?.checkins || response.data || [];
        console.log('Loaded checkins:', newCheckins);
        
        // Get cached liked status and apply to checkins
        const likedCache = await getLikedCheckins();
        
        // Ensure each checkin has isLiked field (from cache or backend or default false)
        const processedCheckins = newCheckins.map(checkin => ({
          ...checkin,
          isLiked: likedCache[checkin._id] || checkin.isLiked || false,
          likes_count: checkin.likes_count || 0,
          comments_count: checkin.comments_count || 0
        }));
        
        console.log('Applied liked cache:', likedCache);
        console.log('Processed checkins with like status:', processedCheckins.map(c => ({
          id: c._id,
          title: c.title,
          isLiked: c.isLiked,
          likes_count: c.likes_count
        })));
        
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
      console.error('Load checkins error:', error);
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
      console.log('Like response:', response);
      
      // Check for success - backend might return different formats
      const isSuccess = response.success || 
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
      
      if (response.success) {
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

  const renderCheckinItem = ({ item: checkin }) => {
    const isOwnCheckin = checkin.user_id?._id === checkin.currentUserId; // You'll need to pass current user ID
    
    console.log('Rendering checkin item:', {
      id: checkin._id,
      title: checkin.title,
      user: checkin.user_id,
      image: checkin.image
    });

    return (
      <View style={styles.checkinCard}>
        {/* Header */}
        <View style={styles.checkinHeader}>
          <View style={styles.userInfo}>
            <Image 
              source={{ 
                uri: checkin.user_id?.avatar || 'https://via.placeholder.com/40'
              }} 
              style={styles.avatar}
            />
            <View style={styles.userDetails}>
              <Text style={styles.userName}>
                {checkin.user_id?.full_name || checkin.user_id?.username || 'Unknown User'}
              </Text>
              <Text style={styles.timestamp}>
                {formatTimestamp(checkin.createdAt)}
              </Text>
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
                    { text: 'Báo cáo', onPress: () => {/* Handle report */} }
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
          <View style={styles.locationInfo}>
            <MaterialCommunityIcons name="map-marker" size={16} color="#7a5545" />
            <Text style={styles.locationText}>{checkin.location.address}</Text>
          </View>
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
              size={20} 
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
            onPress={() => navigation.navigate('CheckinDetail', { checkinId: checkin._id })}
          >
            <MaterialCommunityIcons name="comment-outline" size={20} color="#666" />
            <Text style={styles.actionText}>{checkin.comments_count || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleShareCheckin(checkin)}
          >
            <MaterialCommunityIcons name="share-outline" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="camera-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>Chưa có check-in nào</Text>
      <Text style={styles.emptySubtitle}>
        Hãy bắt đầu check-in và chia sẻ những khoảnh khắc đẹp của bạn!
      </Text>
      <TouchableOpacity 
        style={styles.createCheckinButton}
        onPress={() => navigation.navigate('CafeMap')}
      >
        <MaterialCommunityIcons name="plus" size={20} color="white" />
        <Text style={styles.createCheckinButtonText}>Tạo check-in đầu tiên</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Check-in</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CafeMap')}>
          <MaterialCommunityIcons name="camera" size={24} color="#7a5545" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={checkins}
        renderItem={renderCheckinItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={checkins.length === 0 ? styles.emptyList : styles.list}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
  },
  checkinCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  checkinHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  menuButton: {
    padding: 4,
  },
  checkinTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  imageContainer: {
    marginBottom: 12,
  },
  checkinImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  actionButtonLiked: {
    backgroundColor: '#ffe6e6',
  },
  actionText: {
    fontSize: 14,
    color: '#666',
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
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  createCheckinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7a5545',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  createCheckinButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 