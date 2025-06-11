// Notification Helper Functions
import { Alert } from 'react-native';
import { NOTIFICATION_TYPES, COLORS } from './config';

/**
 * Get notification icon based on type
 * @param {string} type - Notification type
 * @returns {string} Icon name for MaterialCommunityIcons
 */
export const getNotificationIcon = (type) => {
  const iconMap = {
    [NOTIFICATION_TYPES.BOOKING]: 'calendar-check',
    [NOTIFICATION_TYPES.PROMOTION]: 'tag',
    [NOTIFICATION_TYPES.REMINDER]: 'clock-alert',
    [NOTIFICATION_TYPES.UPDATE]: 'update',
    [NOTIFICATION_TYPES.REVIEW]: 'star',
    [NOTIFICATION_TYPES.SYSTEM]: 'cog',
    [NOTIFICATION_TYPES.RESERVATION_CREATED]: 'calendar-plus',
    [NOTIFICATION_TYPES.RESERVATION_CONFIRMED]: 'calendar-check',
    [NOTIFICATION_TYPES.RESERVATION_CANCELLED]: 'calendar-remove',
    [NOTIFICATION_TYPES.RESERVATION_COMPLETED]: 'check-circle',
    [NOTIFICATION_TYPES.CHECK_IN]: 'location-enter',
    [NOTIFICATION_TYPES.FRIEND_REQUEST]: 'account-plus',
    [NOTIFICATION_TYPES.FRIEND_ACCEPTED]: 'account-check',
    [NOTIFICATION_TYPES.FRIEND_CHECKIN]: 'camera-account',
  };

  return iconMap[type] || 'bell';
};

/**
 * Get notification color based on type
 * @param {string} type - Notification type
 * @returns {string} Color hex code
 */
export const getNotificationColor = (type) => {
  return COLORS.NOTIFICATION[type] || COLORS.PRIMARY;
};

/**
 * Format timestamp to relative time in Vietnamese
 * @param {Date} timestamp - Timestamp to format
 * @returns {string} Formatted relative time
 */
export const formatTimestamp = (timestamp) => {
  const now = new Date();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) {
    return 'Vừa xong';
  } else if (minutes < 60) {
    return `${minutes} phút trước`;
  } else if (hours < 24) {
    return `${hours} giờ trước`;
  } else if (days < 7) {
    return `${days} ngày trước`;
  } else {
    return timestamp.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
};

/**
 * Show error alert with Vietnamese message
 * @param {string} title - Alert title
 * @param {string} message - Alert message
 */
export const showErrorAlert = (title = 'Lỗi', message = 'Đã có lỗi xảy ra. Vui lòng thử lại.') => {
  Alert.alert(title, message, [{ text: 'OK' }]);
};

/**
 * Show success alert with Vietnamese message
 * @param {string} title - Alert title
 * @param {string} message - Alert message
 */
export const showSuccessAlert = (title = 'Thành công', message) => {
  Alert.alert(title, message, [{ text: 'OK' }]);
};

/**
 * Handle notification navigation based on type and reference
 * @param {Object} notification - Notification object
 * @param {Object} navigation - React Navigation object
 */
export const handleNotificationNavigation = (notification, navigation) => {
  try {
    const { type, reference_id, reference_type } = notification;

    switch (type) {
      case 'RESERVATION_CREATED':
      case 'RESERVATION_CONFIRMED':
      case 'RESERVATION_CANCELLED':
      case 'RESERVATION_COMPLETED':
        // Navigate to BookingDetailScreen with reservationId and loadFromAPI flag
        if (reference_id) {
          navigation.navigate('BookingDetail', { 
            reservationId: reference_id,
            loadFromAPI: true 
          });
        } else {
          console.warn('No reference_id found for reservation notification');
          navigation.navigate('HomeTab');
        }
        break;

      case 'RESERVATION_REMINDER':
        // Same as above for reminder notifications
        if (reference_id) {
          navigation.navigate('BookingDetail', { 
            reservationId: reference_id,
            loadFromAPI: true 
          });
        } else {
          navigation.navigate('HomeTab');
        }
        break;

      case 'CHECK_IN':
        // For check-in notifications, also navigate to booking detail
        if (reference_id) {
          navigation.navigate('BookingDetail', { 
            reservationId: reference_id,
            loadFromAPI: true 
          });
        } else {
          navigation.navigate('HomeTab');
        }
        break;

      case 'FRIEND_REQUEST':
        // Navigate to Friends screen on Requests tab
        navigation.navigate('Friends', { initialTab: 'requests' });
        break;

      case 'FRIEND_ACCEPTED':
        // Navigate to Friends screen on Friends tab
        navigation.navigate('Friends', { initialTab: 'friends' });
        break;

      case 'FRIEND_CHECKIN':
        // Navigate to specific checkin if reference_id exists, otherwise to CheckinList
        if (reference_id) {
          navigation.navigate('CheckinDetail', { checkinId: reference_id });
        } else {
          navigation.navigate('CheckinList');
        }
        break;

      case 'SHOP_REVIEW':
        // Navigate to shop detail if reference_id exists
        if (reference_id) {
          navigation.navigate('ShopDetail', { shopId: reference_id });
        } else {
          navigation.navigate('HomeTab');
        }
        break;

      case 'SPECIAL_OFFER':
      case 'PROMOTION':
        // Navigate to promotion detail
        if (reference_id) {
          navigation.navigate('PromotionDetail', { promotionId: reference_id });
        } else {
          // If no specific promotion, navigate to promotions list
          navigation.navigate('Promotions');
        }
        break;

      case 'SYSTEM':
      case 'UPDATE':
        // For system notifications, go to home or settings
        navigation.navigate('HomeTab');
        break;

      default:
        // For any unknown notification types, safely navigate to home
        console.log(`Unknown notification type: ${type}, navigating to home`);
        navigation.navigate('HomeTab');
        break;
    }
  } catch (error) {
    console.error('Navigation error:', error);
    // Fallback: navigate to home tab on any error
    navigation.navigate('HomeTab');
  }
};

/**
 * Transform backend notification to frontend format
 * @param {Object} backendNotification - Notification from backend
 * @returns {Object} Frontend notification format
 */
export const transformNotification = (backendNotification) => {
  return {
    id: backendNotification._id,
    type: backendNotification.type,
    title: backendNotification.title,
    message: backendNotification.content,
    timestamp: new Date(backendNotification.created_at),
    isRead: backendNotification.is_read,
    icon: getNotificationIcon(backendNotification.type),
    color: getNotificationColor(backendNotification.type),
    reference_id: backendNotification.reference_id,
    reference_type: backendNotification.reference_type
  };
};

/**
 * Get notification type display text in Vietnamese
 * @param {string} type - Notification type
 * @returns {string} Display text
 */
export const getNotificationTypeText = (type) => {
  const typeMap = {
    [NOTIFICATION_TYPES.BOOKING]: 'Đặt chỗ',
    [NOTIFICATION_TYPES.PROMOTION]: 'Khuyến mãi',
    [NOTIFICATION_TYPES.REMINDER]: 'Nhắc nhở',
    [NOTIFICATION_TYPES.UPDATE]: 'Cập nhật',
    [NOTIFICATION_TYPES.REVIEW]: 'Đánh giá',
    [NOTIFICATION_TYPES.SYSTEM]: 'Hệ thống',
    [NOTIFICATION_TYPES.RESERVATION_CREATED]: 'Đặt chỗ mới',
    [NOTIFICATION_TYPES.RESERVATION_CONFIRMED]: 'Xác nhận đặt chỗ',
    [NOTIFICATION_TYPES.RESERVATION_CANCELLED]: 'Hủy đặt chỗ',
    [NOTIFICATION_TYPES.RESERVATION_COMPLETED]: 'Hoàn thành',
    [NOTIFICATION_TYPES.CHECK_IN]: 'Check-in',
    [NOTIFICATION_TYPES.FRIEND_REQUEST]: 'Lời mời kết bạn',
    [NOTIFICATION_TYPES.FRIEND_ACCEPTED]: 'Kết bạn thành công',
    [NOTIFICATION_TYPES.FRIEND_CHECKIN]: 'Check-in bạn bè',
  };

  return typeMap[type] || 'Thông báo';
}; 