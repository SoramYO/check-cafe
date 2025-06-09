import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAnalytics } from '../utils/analytics';
import * as Notifications from 'expo-notifications';
import {
  getUnreadCount,
} from '../utils/notifications';
import {
  getNotificationIcon,
  getNotificationColor,
  formatTimestamp,
  showErrorAlert,
  handleNotificationNavigation,
  transformNotification
} from '../utils/notificationHelpers';
import notificationAPI from '../services/notificationAPI';

export default function NotificationScreen() {
  const navigation = useNavigation();
  const { trackScreenView, trackTap, isAuthenticated } = useAnalytics();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const notificationListener = useRef();
  const responseListener = useRef();

  const markAsRead = async (notificationId) => {
    try {
      await notificationAPI.HandleNotification(`/${notificationId}/read`, {}, 'patch');
      // Update UI after marking as read
      setNotifications(prev =>
        prev.map(item =>
          item._id === notificationId
            ? { ...item, is_read: true }
            : item
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (await isAuthenticated()) {
        trackScreenView('Notifications', {
          timestamp: new Date().toISOString()
        });
      }
    };
    init();

    // Load initial notifications
    loadNotifications(1);

    // Listen for incoming notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      // Add new notification to the list
      const notificationData = notification.request.content.data;
      const newNotification = {
        id: notificationData.notification_id || notification.request.identifier,
        type: notificationData.type || 'system',
        title: notification.request.content.title,
        message: notification.request.content.body,
        timestamp: new Date(notificationData.timestamp || Date.now()),
        isRead: false,
        icon: getNotificationIcon(notificationData.type || 'system'),
        color: getNotificationColor(notificationData.type || 'system'),
        reference_id: notificationData.reference_id,
        reference_type: notificationData.reference_type
      };

      setNotifications(prev => [newNotification, ...prev]);
    });

    // Listen for notification responses
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const notificationData = response.notification.request.content.data;
      const content = response.notification.request.content;
      handleNotificationPress({
        id: notificationData.notification_id || response.notification.request.identifier,
        type: notificationData.type || 'system',
        title: content.title,
        message: content.body,
        timestamp: new Date(notificationData.timestamp || Date.now()),
        isRead: false,
        icon: getNotificationIcon(notificationData.type || 'system'),
        color: getNotificationColor(notificationData.type || 'system'),
        reference_id: notificationData.reference_id,
        reference_type: notificationData.reference_type
      });
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  const loadNotifications = async (pageNum = 1) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      }

      const response = await notificationAPI.HandleNotification(`?page=${pageNum}&limit=20`);

      if (!response || !response.data) {
        throw new Error('Invalid response from server');
      }

      // Process received data - handle different response structures
      let newNotifications = [];
      
      if (response.data.data) {
        // Direct data array
        newNotifications = response.data.data.map(transformNotification);
      } else if (response.data.notifications) {
        // Wrapped in notifications property
        newNotifications = response.data.notifications.map(transformNotification);
      } else if (Array.isArray(response.data)) {
        // Data is directly an array
        newNotifications = response.data.map(transformNotification);
      }

      if (pageNum === 1) {
        setNotifications(newNotifications);
      } else {
        setNotifications(prev => [...prev, ...newNotifications]);
      }

      // Update hasMore based on response
      if (response.data.metadata) {
        setHasMore(response.data.metadata.currentPage < response.data.metadata.totalPages);
      } else {
        setHasMore(newNotifications.length === 20); // Assume more if we got full page
      }

      return response;
    } catch (error) {
      console.error('Error loading notifications:', error);
      setError(error.message);
      showErrorAlert('Lỗi', 'Không thể tải thông báo. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await loadNotifications(1);
    setRefreshing(false);
  };

  const loadUnreadCount = async () => {
    try {
      const response = await getUnreadCount();
      if (response.data && response.data.unread_count !== undefined) {
        // Update badge count if needed
        console.log('Unread count:', response.data.unread_count);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadNotifications(nextPage);
    }
  };

  const handleRefresh = () => {
    setPage(1);
    loadNotifications(1);
  };

  const handleNotificationPress = async (notification) => {
    try {
      const notificationId = notification._id || notification.id;

      trackTap('notification_item', {
        notification_id: notificationId,
        notification_type: notification.type,
        is_read: notification.isRead
      });

      // Mark as read using the proper API call
      await notificationAPI.HandleNotification(
        `/${notificationId}/read`,
        {},
        'patch'
      );

      setNotifications(prev =>
        prev.map(n =>
          (n.id === notificationId || n._id === notificationId)
            ? { ...n, isRead: true, is_read: true } // Ensure both fields are updated
            : n
        )
      );

      handleNotificationNavigation(notification, navigation);
    } catch (error) {
      console.error('Error handling notification:', error);
      showErrorAlert('Lỗi', 'Không thể xử lý thông báo');
    }
  };

  const markAllAsRead = async () => {
    if (markingAllRead) return; // Prevent double calls

    try {
      setMarkingAllRead(true);
      trackTap('mark_all_read', { total_notifications: notifications.length });

      // Call API to mark all as read
      await notificationAPI.HandleNotification('/mark-all-read', {}, 'patch');

      // Update local state
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true, is_read: true }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
      showErrorAlert('Lỗi', 'Không thể đánh dấu tất cả thông báo đã đọc');
    } finally {
      setMarkingAllRead(false);
    }
  };

  const renderNotificationItem = (notification) => {
    const isRead = notification.isRead || notification.is_read;
    
    return (
      <TouchableOpacity
        key={notification.id || notification._id}
        style={[
          styles.notificationItem,
          !isRead && styles.unreadNotification
        ]}
        onPress={() => handleNotificationPress(notification)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: notification.color + '20' }]}>
          <MaterialCommunityIcons
            name={notification.icon}
            size={24}
            color={notification.color}
          />
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={[
              styles.title,
              !isRead && styles.unreadTitle
            ]}>
              {notification.title}
            </Text>
            {!isRead && <View style={styles.unreadDot} />}
          </View>

          <Text style={styles.message} numberOfLines={2}>
            {notification.message || notification.content}
          </Text>

          <Text style={styles.timestamp}>
            {formatTimestamp(notification.timestamp)}
          </Text>
        </View>

        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color="#BFA58E"
        />
      </TouchableOpacity>
    );
  };

  const unreadCount = notifications.filter(n => !(n.isRead || n.is_read)).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            trackTap('back_button', { source: 'notifications' });
            navigation.goBack();
          }}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#7a5545" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Thông báo</Text>

        {unreadCount > 0 && (
          <TouchableOpacity
            style={[styles.markAllButton, markingAllRead && styles.markAllButtonDisabled]}
            onPress={markAllAsRead}
            disabled={markingAllRead}
          >
            {markingAllRead ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.markAllText}>Đọc tất cả</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      {loading && page === 1 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7a5545" />
          <Text style={styles.loadingText}>Đang tải thông báo...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#7a5545']}
              tintColor="#7a5545"
            />
          }
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            const paddingToBottom = 20;
            if (layoutMeasurement.height + contentOffset.y >=
              contentSize.height - paddingToBottom) {
              loadMore();
            }
          }}
          scrollEventThrottle={400}
        >
          {notifications.length > 0 ? (
            <>
              {unreadCount > 0 && (
                <View style={styles.summaryCard}>
                  <MaterialCommunityIcons name="bell-ring" size={24} color="#FF6B6B" />
                  <Text style={styles.summaryText}>
                    Bạn có {unreadCount} thông báo chưa đọc
                  </Text>
                </View>
              )}

              <View style={styles.notificationsContainer}>
                {notifications.map(renderNotificationItem)}
              </View>

              {loading && page > 1 && (
                <View style={styles.loadingMoreContainer}>
                  <ActivityIndicator size="small" color="#7a5545" />
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="bell-off" size={64} color="#BFA58E" />
              <Text style={styles.emptyTitle}>Chưa có thông báo</Text>
              <Text style={styles.emptyMessage}>
                Thông báo về đặt chỗ, khuyến mãi và cập nhật sẽ hiển thị ở đây
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D2D2D',
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#7a5545',
    borderRadius: 12,
  },
  markAllText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  markAllButtonDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#7a5545',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9F5',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
    gap: 12,
  },
  summaryText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#2D2D2D',
  },
  notificationsContainer: {
    padding: 16,
    gap: 12,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D2D2D',
    flex: 1,
  },
  unreadTitle: {
    fontWeight: '700',
    color: '#1A1A1A',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B6B',
    marginLeft: 8,
  },
  message: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 12,
    color: '#BFA58E',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D2D2D',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingMoreContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
}); 