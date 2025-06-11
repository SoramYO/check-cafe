import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { toast } from 'sonner-native';
import friendAPI from '../services/friendAPI';
import { useAnalytics } from '../utils/analytics';

const TABS = [
  { key: 'friends', label: 'Bạn bè', icon: 'account-group' },
  { key: 'requests', label: 'Lời mời', icon: 'account-plus' },
  { key: 'search', label: 'Tìm kiếm', icon: 'account-search' },
];

export default function FriendsScreen({ route }) {
  const navigation = useNavigation();
  const { trackScreenView, trackTap, isAuthenticated } = useAnalytics();
  
  // Get initial tab from route params (for navigation from notifications)
  const initialTab = route?.params?.initialTab || 'friends';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searching, setSearching] = useState(false);
  const [processingRequest, setProcessingRequest] = useState({});

  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        if (await isAuthenticated()) {
          trackScreenView('Friends', {
            timestamp: new Date().toISOString()
          });
        }
      };
      init();
      loadInitialData();
    }, [])
  );

  const loadInitialData = async () => {
    setLoading(true);
    await Promise.all([
      loadFriends(),
      loadFriendRequests(),
      loadSuggestions(),
    ]);
    setLoading(false);
  };

  const loadFriends = async () => {
    try {
      const response = await friendAPI.HandleFriend('?page=1&limit=20');
      console.log('Friends response:', response);
      if (response.data) {
        const friends = response.data.friends || response.data || [];
        console.log('Friends data:', friends);
        setFriends(friends);
      }
    } catch (error) {
      console.error('Load friends error:', error);
      toast.error('Không thể tải danh sách bạn bè');
    }
  };

  const loadFriendRequests = async () => {
    try {
      const response = await friendAPI.HandleFriend('/requests?type=received');
      console.log('Friend requests response:', response);
      if (response.data) {
        const requests = response.data.requests || response.data || [];
        console.log('Friend requests data:', requests);
        setFriendRequests(requests);
      }
    } catch (error) {
      console.error('Load friend requests error:', error);
      toast.error('Không thể tải lời mời kết bạn');
    }
  };

  const loadSuggestions = async () => {
    try {
      const response = await friendAPI.HandleFriend('/suggestions?limit=10');
      console.log('Suggestions response:', response);
      if (response.data) {
        const suggestions = response.data.suggestions || response.data || [];
        console.log('Suggestions data:', suggestions);
        setSuggestions(suggestions);
      }
    } catch (error) {
      console.error('Load suggestions error:', error);
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await friendAPI.HandleFriend(`/search?q=${encodeURIComponent(query.trim())}&page=1&limit=20`);
      console.log('Search response:', response);

      if (response.data) {
        // Handle different response formats
        const users = response.data.users || response.data || [];
        console.log('Search users:', users);
        setSearchResults(users);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Không thể tìm kiếm người dùng');
    } finally {
      setSearching(false);
    }
  };

  const handleSendFriendRequest = async (userId) => {
    setProcessingRequest(prev => ({ ...prev, [userId]: true }));

    try {
      await trackTap('send_friend_request', { userId });
      const response = await friendAPI.HandleFriend('/request', { userId }, 'post');

      if (response.data) {
        toast.success('Đã gửi lời mời kết bạn');
        // Update UI to show request sent
        setSearchResults(prev =>
          prev.map(user =>
            user._id === userId
              ? { ...user, friendshipStatus: 'request_sent' }
              : user
          )
        );
        setSuggestions(prev =>
          prev.map(user =>
            user._id === userId
              ? { ...user, friendshipStatus: 'request_sent' }
              : user
          )
        );
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Send friend request error:', error);
      toast.error('Không thể gửi lời mời kết bạn');
    } finally {
      setProcessingRequest(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleAcceptFriendRequest = async (requestId, userId) => {
    setProcessingRequest(prev => ({ ...prev, [requestId]: true }));

    try {
      await trackTap('accept_friend_request', { requestId });
      const response = await friendAPI.HandleFriend(`/request/${requestId}/accept`, {}, 'patch');

      if (response.data) {
        toast.success('Đã chấp nhận lời mời kết bạn');
        // Remove from requests and add to friends
        setFriendRequests(prev => prev.filter(req => req._id !== requestId));
        await loadFriends(); // Reload friends list
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Accept friend request error:', error);
      toast.error('Không thể chấp nhận lời mời kết bạn');
    } finally {
      setProcessingRequest(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const handleRejectFriendRequest = async (requestId) => {
    Alert.alert(
      'Từ chối lời mời',
      'Bạn có chắc chắn muốn từ chối lời mời kết bạn này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Từ chối',
          style: 'destructive',
          onPress: () => rejectFriendRequest(requestId)
        }
      ]
    );
  };

  const rejectFriendRequest = async (requestId) => {
    setProcessingRequest(prev => ({ ...prev, [requestId]: true }));

    try {
      await trackTap('reject_friend_request', { requestId });
      const response = await friendAPI.HandleFriend(`/request/${requestId}/reject`, {}, 'patch');

      if (response.data) {
        toast.success('Đã từ chối lời mời kết bạn');
        setFriendRequests(prev => prev.filter(req => req._id !== requestId));
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Reject friend request error:', error);
      toast.error('Không thể từ chối lời mời kết bạn');
    } finally {
      setProcessingRequest(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const handleUnfriend = (userId, userName) => {
    Alert.alert(
      'Hủy kết bạn',
      `Bạn có chắc chắn muốn hủy kết bạn với ${userName}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Hủy kết bạn',
          style: 'destructive',
          onPress: () => unfriend(userId)
        }
      ]
    );
  };

  const unfriend = async (userId) => {
    try {
      await trackTap('unfriend', { userId });
      const response = await friendAPI.HandleFriend(`/${userId}`, {}, 'delete');

      if (response.data) {
        toast.success('Đã hủy kết bạn');
        setFriends(prev => prev.filter(friend => friend._id !== userId));
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Unfriend error:', error);
      toast.error('Không thể hủy kết bạn');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const renderFriendItem = ({ item: friend }) => (
    <View style={styles.friendCard}>
      <Image
        source={{ uri: friend.avatar || friend.profileImage || 'https://via.placeholder.com/50' }}
        style={styles.avatar}
      />
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>
          {friend.full_name || friend.fullName || friend.username || 'Unknown User'}
        </Text>
        {friend.mutualFriends > 0 && (
          <Text style={styles.mutualFriends}>
            {friend.mutualFriends} bạn chung
          </Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.unfriendButton}
        onPress={() => handleUnfriend(friend._id, friend.full_name || friend.fullName || friend.username)}
      >
        <MaterialCommunityIcons name="account-minus" size={20} color="#e74c3c" />
      </TouchableOpacity>
    </View>
  );

  const renderRequestItem = ({ item: request }) => (
    <View style={styles.requestCard}>
      <Image
        source={{ uri: request.user?.avatar || request.user?.profileImage || 'https://via.placeholder.com/50' }}
        style={styles.avatar}
      />
      <View style={styles.requestInfo}>
        <Text style={styles.requestName}>
          {request.user?.full_name || request.user?.fullName || request.user?.username || 'Unknown User'}
        </Text>
        {request.mutualFriends > 0 && (
          <Text style={styles.mutualFriends}>
            {request.mutualFriends} bạn chung
          </Text>
        )}
      </View>
      <View style={styles.requestActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => handleAcceptFriendRequest(request._id, request.user._id)}
          disabled={processingRequest[request._id]}
        >
          {processingRequest[request._id] ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <MaterialCommunityIcons name="check" size={16} color="white" />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleRejectFriendRequest(request._id)}
          disabled={processingRequest[request._id]}
        >
          <MaterialCommunityIcons name="close" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSearchItem = ({ item: user }) => {
    const isProcessing = processingRequest[user._id];
    const canSendRequest = !user.friendshipStatus || user.friendshipStatus === 'none';
    const requestSent = user.friendshipStatus === 'request_sent';
    const isFriend = user.friendshipStatus === 'friends';

    console.log('Rendering search item:', {
      id: user._id,
      name: user.full_name || user.fullName || user.username,
      avatar: user.avatar || user.profileImage,
      friendshipStatus: user.friendshipStatus
    });

    return (
      <View style={styles.searchCard}>
        <Image
          source={{ uri: user.avatar || user.profileImage || 'https://via.placeholder.com/50' }}
          style={styles.avatar}
        />
        <View style={styles.searchInfo}>
          <Text style={styles.searchName}>
            {user.full_name || user.fullName || user.username || 'Unknown User'}
          </Text>
          {user.mutualFriends > 0 && (
            <Text style={styles.mutualFriends}>
              {user.mutualFriends} bạn chung
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.friendRequestButton,
            requestSent && styles.friendRequestButtonSent,
            isFriend && styles.friendRequestButtonFriend,
          ]}
          onPress={() => canSendRequest && handleSendFriendRequest(user._id)}
          disabled={!canSendRequest || isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <MaterialCommunityIcons
                name={
                  isFriend ? "account-check" :
                    requestSent ? "account-clock" : "account-plus"
                }
                size={16}
                color="white"
              />
              <Text style={styles.friendRequestButtonText}>
                {isFriend ? 'Bạn bè' : requestSent ? 'Đã gửi' : 'Kết bạn'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7a5545" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      );
    }

    switch (activeTab) {
      case 'friends':
        return (
          <FlatList
            data={friends}
            renderItem={renderFriendItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={['#7a5545']}
                tintColor="#7a5545"
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="account-group-outline" size={64} color="#ccc" />
                <Text style={styles.emptyTitle}>Chưa có bạn bè</Text>
                <Text style={styles.emptySubtitle}>
                  Hãy tìm kiếm và kết bạn với mọi người!
                </Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
          />
        );

      case 'requests':
        return (
          <FlatList
            data={friendRequests}
            renderItem={renderRequestItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={['#7a5545']}
                tintColor="#7a5545"
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="account-plus-outline" size={64} color="#ccc" />
                <Text style={styles.emptyTitle}>Không có lời mời mới</Text>
                <Text style={styles.emptySubtitle}>
                  Các lời mời kết bạn sẽ hiển thị ở đây
                </Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
          />
        );

      case 'search':
        return (
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <MaterialCommunityIcons name="magnify" size={20} color="#999" />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  handleSearch(text);
                }}
                placeholder="Tìm kiếm bạn bè..."
                placeholderTextColor="#999"
                returnKeyType="search"
                onSubmitEditing={() => handleSearch(searchQuery)}
              />
              {searching && <ActivityIndicator size="small" color="#7a5545" />}
            </View>

            <FlatList
              data={searchQuery.trim() ? searchResults : suggestions}
              renderItem={renderSearchItem}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.listContainer}
              ListHeaderComponent={
                !searchQuery.trim() && suggestions.length > 0 ? (
                  <Text style={styles.sectionTitle}>Gợi ý kết bạn</Text>
                ) : null
              }
              ListEmptyComponent={
                searchQuery.trim() ? (
                  <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="account-search-outline" size={64} color="#ccc" />
                    <Text style={styles.emptyTitle}>Không tìm thấy</Text>
                    <Text style={styles.emptySubtitle}>
                      Không có người dùng nào khớp với tìm kiếm của bạn
                    </Text>
                  </View>
                ) : (
                  <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="account-search" size={64} color="#ccc" />
                    <Text style={styles.emptyTitle}>Tìm kiếm bạn bè</Text>
                    <Text style={styles.emptySubtitle}>
                      Nhập tên hoặc username để tìm kiếm
                    </Text>
                  </View>
                )
              }
              showsVerticalScrollIndicator={false}
            />
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bạn bè</Text>
        <View style={styles.headerRight}>
          {friendRequests.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{friendRequests.length}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
          >
            <MaterialCommunityIcons
              name={tab.icon}
              size={20}
              color={activeTab === tab.key ? '#7a5545' : '#999'}
            />
            <Text style={[
              styles.tabText,
              activeTab === tab.key && styles.activeTabText
            ]}>
              {tab.label}
            </Text>
            {tab.key === 'requests' && friendRequests.length > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{friendRequests.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {renderTabContent()}
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
  headerRight: {
    position: 'relative',
  },
  badge: {
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
    position: 'relative',
  },
  activeTab: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#7a5545',
    fontWeight: '600',
  },
  tabBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#e74c3c',
    borderRadius: 6,
    minWidth: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBadgeText: {
    color: 'white',
    fontSize: 8,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  listContainer: {
    padding: 16,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  friendInfo: {
    flex: 1,
  },
  requestInfo: {
    flex: 1,
  },
  searchInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  requestName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  searchName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  mutualFriends: {
    fontSize: 12,
    color: '#666',
  },
  unfriendButton: {
    padding: 8,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#f44336',
  },
  friendRequestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7a5545',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  friendRequestButtonSent: {
    backgroundColor: '#666',
  },
  friendRequestButtonFriend: {
    backgroundColor: '#4CAF50',
  },
  friendRequestButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  searchContainer: {
    flex: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
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
  },
}); 