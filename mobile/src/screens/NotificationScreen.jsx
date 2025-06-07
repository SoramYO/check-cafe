import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAnalytics } from '../utils/analytics';

export default function NotificationScreen() {
  const navigation = useNavigation();
  const { trackScreenView, trackTap, isAuthenticated } = useAnalytics();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (await isAuthenticated()) {
        trackScreenView('Notifications', {
          timestamp: new Date().toISOString()
        });
      }
    };
    init();
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockNotifications = [
        {
          id: '1',
          type: 'promotion',
          title: 'Khuyến mãi đặc biệt 50%',
          message: 'Giảm 50% cho tất cả đồ uống tại Highlands Coffee từ 15h-17h hôm nay!',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          isRead: false,
          icon: 'tag',
          color: '#FF6B6B'
        },
        {
          id: '2',
          type: 'booking',
          title: 'Đặt chỗ thành công',
          message: 'Bạn đã đặt chỗ thành công tại The Coffee House - 2 người, 19:30 hôm nay',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          isRead: false,
          icon: 'calendar-check',
          color: '#4ECDC4'
        },
        {
          id: '3',
          type: 'reminder',
          title: 'Nhắc nhở đặt chỗ',
          message: 'Còn 30 phút nữa tới giờ hẹn của bạn tại Starbucks Đà Lạt',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          isRead: true,
          icon: 'clock-alert',
          color: '#FFD93D'
        },
        {
          id: '4',
          type: 'update',
          title: 'Cập nhật ứng dụng',
          message: 'Phiên bản mới của Checkafe đã có sẵn với nhiều tính năng thú vị!',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          isRead: true,
          icon: 'update',
          color: '#6BCF7F'
        },
        {
          id: '5',
          type: 'review',
          title: 'Đánh giá trải nghiệm',
          message: 'Hãy chia sẻ trải nghiệm của bạn tại Trung Nguyên Coffee để nhận voucher 20%',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          isRead: true,
          icon: 'star',
          color: '#A8E6CF'
        }
      ];
      
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = (notification) => {
    trackTap('notification_item', {
      notification_id: notification.id,
      notification_type: notification.type,
      is_read: notification.isRead
    });

    // Mark as read
    setNotifications(prev => 
      prev.map(n => 
        n.id === notification.id ? { ...n, isRead: true } : n
      )
    );

    // Navigate based on type
    switch (notification.type) {
      case 'booking':
        // navigation.navigate('BookingDetail', { bookingId: notification.bookingId });
        break;
      case 'promotion':
        // navigation.navigate('Promotions');
        break;
      default:
        break;
    }
  };

  const markAllAsRead = () => {
    trackTap('mark_all_read', { total_notifications: notifications.length });
    
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes} phút trước`;
    } else if (hours < 24) {
      return `${hours} giờ trước`;
    } else {
      return `${days} ngày trước`;
    }
  };

  const renderNotificationItem = (notification) => (
    <TouchableOpacity
      key={notification.id}
      style={[
        styles.notificationItem,
        !notification.isRead && styles.unreadNotification
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
            !notification.isRead && styles.unreadTitle
          ]}>
            {notification.title}
          </Text>
          {!notification.isRead && <View style={styles.unreadDot} />}
        </View>
        
        <Text style={styles.message} numberOfLines={2}>
          {notification.message}
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

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
            style={styles.markAllButton}
            onPress={markAllAsRead}
          >
            <Text style={styles.markAllText}>Đọc tất cả</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      {loading ? (
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
}); 