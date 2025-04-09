import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const NOTIFICATION_SETTINGS = [
  {
    id: 'bookings',
    title: 'Đặt chỗ',
    items: [
      { id: 'booking_confirmation', label: 'Xác nhận đặt chỗ', enabled: true },
      { id: 'booking_reminder', label: 'Nhắc nhở trước giờ đặt', enabled: true },
      { id: 'booking_changes', label: 'Thay đổi đặt chỗ', enabled: true },
    ],
  },
  {
    id: 'promotions',
    title: 'Khuyến mãi',
    items: [
      { id: 'new_deals', label: 'Ưu đãi mới', enabled: true },
      { id: 'special_offers', label: 'Ưu đãi đặc biệt', enabled: false },
      { id: 'nearby_deals', label: 'Ưu đãi gần bạn', enabled: true },
    ],
  },
  {
    id: 'system',
    title: 'Hệ thống',
    items: [
      { id: 'app_updates', label: 'Cập nhật ứng dụng', enabled: true },
      { id: 'security_alerts', label: 'Cảnh báo bảo mật', enabled: true },
      { id: 'news', label: 'Tin tức và sự kiện', enabled: false },
    ],
  },
];

export default function NotificationsScreen({ navigation }) {
  const [settings, setSettings] = useState(NOTIFICATION_SETTINGS);

  const toggleNotification = (sectionId: string, itemId: string) => {
    setSettings(prevSettings =>
      prevSettings.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            items: section.items.map(item => {
              if (item.id === itemId) {
                return { ...item, enabled: !item.enabled };
              }
              return item;
            }),
          };
        }
        return section;
      })
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>Thông báo</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.masterToggleContainer}>
          <View style={styles.masterToggleContent}>
            <MaterialCommunityIcons name="bell-ring" size={24} color="#4A90E2" />
            <Text style={styles.masterToggleText}>Bật tất cả thông báo</Text>
          </View>
          <Switch
            value={settings.every(section =>
              section.items.every(item => item.enabled)
            )}
            onValueChange={() => {
              const allEnabled = settings.every(section =>
                section.items.every(item => item.enabled)
              );
              setSettings(prevSettings =>
                prevSettings.map(section => ({
                  ...section,
                  items: section.items.map(item => ({
                    ...item,
                    enabled: !allEnabled,
                  })),
                }))
              );
            }}
            trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
            thumbColor="#4A90E2"
          />
        </View>

        {settings.map(section => (
          <View key={section.id} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map(item => (
              <View key={item.id} style={styles.notificationItem}>
                <Text style={styles.itemLabel}>{item.label}</Text>
                <Switch
                  value={item.enabled}
                  onValueChange={() => toggleNotification(section.id, item.id)}
                  trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
                  thumbColor={item.enabled ? '#4A90E2' : '#F1F5F9'}
                />
              </View>
            ))}
          </View>
        ))}

        <TouchableOpacity style={styles.clearButton}>
          <MaterialCommunityIcons name="notification-clear-all" size={20} color="#EF4444" />
          <Text style={styles.clearButtonText}>Xóa tất cả thông báo</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  masterToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  masterToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  masterToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 12,
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  itemLabel: {
    fontSize: 16,
    color: '#1E293B',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 32,
    gap: 8,
  },
  clearButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
});