import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';

const MOCK_VOUCHERS = [
  {
    id: '1',
    type: 'compensation',
    title: 'Giảm 15% hóa đơn',
    description: 'Áp dụng cho đơn từ 100.000đ',
    expiry: '2024-04-01',
    code: 'COMP15OFF',
    status: 'active',
    cafeName: 'The Dreamer Coffee',
    reason: 'Bồi thường do chờ quá 10 phút',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2947&auto=format&fit=crop',
  },
  {
    id: '2',
    type: 'birthday',
    title: 'Tặng 1 phần bánh sinh nhật',
    description: 'Áp dụng trong tháng sinh nhật',
    expiry: '2024-03-31',
    code: 'BDAYCAKE',
    status: 'active',
    cafeName: 'Mountain View Café',
    image: 'https://images.unsplash.com/photo-1493857671505-72967e2e2760?q=80&w=2940&auto=format&fit=crop',
  },
  {
    id: '3',
    type: 'loyalty',
    title: 'Giảm 50% đồ uống thứ 2',
    description: 'Áp dụng cho tất cả đồ uống',
    expiry: '2024-03-15',
    code: 'LOYAL50',
    status: 'expired',
    cafeName: 'Horizon Coffee',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2940&auto=format&fit=crop',
  },
];

export default function VoucherScreen() {
  const navigation = useNavigation();
  const renderVoucherCard = (voucher) => {
    const isExpired = voucher.status === 'expired';
    const expiryDate = new Date(voucher.expiry).toLocaleDateString('vi-VN');

    return (
      <TouchableOpacity
        key={voucher.id}
        style={[styles.voucherCard, isExpired && styles.expiredCard]}
        activeOpacity={0.8}
      >
        <Image source={{ uri: voucher.image }} style={styles.cafeImage} />
        
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'transparent']}
          style={styles.imageOverlay}
        >
          <Text style={styles.cafeName}>{voucher.cafeName}</Text>
        </LinearGradient>

        <View style={styles.voucherContent}>
          <View style={styles.voucherHeader}>
            <View style={styles.typeContainer}>
              <MaterialCommunityIcons
                name={
                  voucher.type === 'compensation'
                    ? 'clock-check'
                    : voucher.type === 'birthday'
                    ? 'cake'
                    : 'star'
                }
                size={20}
                color={isExpired ? '#94A3B8' : '#4A90E2'}
              />
              <Text
                style={[
                  styles.voucherType,
                  isExpired && styles.expiredText,
                ]}
              >
                {voucher.type === 'compensation'
                  ? 'Bồi thường'
                  : voucher.type === 'birthday'
                  ? 'Sinh nhật'
                  : 'Khách hàng thân thiết'}
              </Text>
            </View>
            {isExpired && (
              <View style={styles.expiredBadge}>
                <Text style={styles.expiredBadgeText}>Hết hạn</Text>
              </View>
            )}
          </View>

          <Text
            style={[styles.voucherTitle, isExpired && styles.expiredText]}
          >
            {voucher.title}
          </Text>
          <Text
            style={[
              styles.voucherDescription,
              isExpired && styles.expiredText,
            ]}
          >
            {voucher.description}
          </Text>

          {voucher.reason && (
            <Text
              style={[styles.voucherReason, isExpired && styles.expiredText]}
            >
              {voucher.reason}
            </Text>
          )}

          <View style={styles.voucherFooter}>
            <View style={styles.codeContainer}>
              <Text
                style={[styles.voucherCode, isExpired && styles.expiredText]}
              >
                {voucher.code}
              </Text>
              <TouchableOpacity>
                <MaterialCommunityIcons
                  name="content-copy"
                  size={20}
                  color={isExpired ? '#94A3B8' : '#4A90E2'}
                />
              </TouchableOpacity>
            </View>
            <Text
              style={[
                styles.expiryDate,
                isExpired && styles.expiredText,
              ]}
            >
              HSD: {expiryDate}
            </Text>
          </View>

          {!isExpired && (
            <TouchableOpacity style={styles.useButton}>
              <Text style={styles.useButtonText}>Sử dụng ngay</Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={20}
                color="white"
              />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Voucher của tôi" navigation={navigation} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {MOCK_VOUCHERS.map(renderVoucherCard)}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f1f1',
  },
  backButton: {
    marginRight: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1E293B',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  voucherCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  expiredCard: {
    opacity: 0.8,
  },
  cafeImage: {
    width: '100%',
    height: 150,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  cafeName: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  voucherContent: {
    padding: 16,
  },
  voucherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  voucherType: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '500',
  },
  voucherTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  voucherDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  voucherReason: {
    fontSize: 14,
    color: '#64748B',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  voucherFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voucherCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
  },
  expiryDate: {
    fontSize: 14,
    color: '#64748B',
  },
  useButton: {
    backgroundColor: '#4A90E2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  useButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  expiredBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  expiredBadgeText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
  },
  expiredText: {
    color: '#94A3B8',
  },
});