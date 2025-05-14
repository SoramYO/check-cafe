import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner-native';
import { useDispatch, useSelector } from 'react-redux';
import { authSelector } from '../redux/reducers/authReducer';

const MENU_SECTIONS = [
  {
    title: 'Tài khoản',
    items: [
      { icon: 'account-edit', label: 'Chỉnh sửa thông tin', route: 'EditProfile' },
      { icon: 'bell-outline', label: 'Thông báo', route: 'Notifications' },
      { icon: 'ticket-percent', label: 'Voucher của tôi', route: 'Vouchers' },
      { icon: 'heart-outline', label: 'Yêu thích', route: 'Favorites' },
    ],
  },
  {
    title: 'Cài đặt',
    items: [
      { icon: 'map-marker-outline', label: 'Địa điểm mặc định', route: 'DefaultLocation' },
      { icon: 'translate', label: 'Ngôn ngữ', route: 'Language' },
      { icon: 'theme-light-dark', label: 'Giao diện', route: 'Theme' },
      { icon: 'shield-check-outline', label: 'Quyền riêng tư', route: 'Privacy' },
    ],
  },
  {
    title: 'Khác',
    items: [
      { icon: 'help-circle-outline', label: 'Trợ giúp', route: 'Help' },
      { icon: 'information-outline', label: 'Về ứng dụng', route: 'About' },
      { icon: 'star-outline', label: 'Đánh giá ứng dụng', route: 'Rate' },
      { icon: 'logout', label: 'Đăng xuất', route: 'Logout', color: '#EF4444' },
    ],
  },
];

export default function ProfileScreen() {
  const { logout } = useAuth();
  const { user } = useSelector(authSelector);

  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Đăng xuất thành công');
      // Navigation will be handled automatically by AppRouters
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Có lỗi xảy ra khi đăng xuất');
    }
  };

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{user.bookings}8</Text>
        <Text style={styles.statLabel}>Lượt đặt chỗ</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{user.reviews}9</Text>
        <Text style={styles.statLabel}>Đánh giá</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{user.points}10</Text>
        <Text style={styles.statLabel}>Điểm thưởng</Text>
      </View>
    </View>
  );

  const renderMenuItem = (item) => (
    <TouchableOpacity
      key={item.label}
      style={styles.menuItem}
      onPress={() => {
        if (item.label === 'Đăng xuất') {
          handleLogout();
        } else if (item.label === 'Ngôn ngữ') {
          navigation.navigate('Language');
        } else {
          navigation.navigate(item.route);
        }
      }}
    >
      <View style={styles.menuItemLeft}>
        <MaterialCommunityIcons
          name={item.icon}
          size={24}
          color={item.color || '#64748B'}
        />
        <Text style={[styles.menuItemLabel, item.color && { color: item.color }]}>
          {item.label}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Image source={{ uri: user?.avatar }} style={styles.avatar} />
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user?.full_name}</Text>
              <View style={styles.levelBadge}>
                <MaterialCommunityIcons name="shield-star" size={16} color="#6366F1" />
                <Text style={styles.levelText}>{user?.role}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <MaterialCommunityIcons name="pencil" size={20} color="#4A90E2" />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        {renderStats()}

        {/* Menu Sections */}
        {MENU_SECTIONS.map((section) => (
          <View key={section.title} style={styles.menuSection}>
            <Text style={styles.menuTitle}>{section.title}</Text>
            <View style={styles.menuItems}>
              {section.items.map(renderMenuItem)}
            </View>
          </View>
        ))}

        <Text style={styles.version}>Phiên bản 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#4A90E2',
  },
  userDetails: {
    gap: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1E293B',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  levelText: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '500',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginTop: 1,
    padding: 20,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
  },
  menuSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  menuItems: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemLabel: {
    fontSize: 16,
    color: '#1E293B',
  },
  version: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 14,
    marginVertical: 24,
  },
});