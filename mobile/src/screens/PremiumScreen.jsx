import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import packageAPI from '../services/packageAPI';
import userPackageAPI from '../services/userPackageAPI';
import QRCode from 'react-native-qrcode-svg';
import userAPI from '../services/userAPI';
import Toast from 'react-native-toast-message';
import paymentAPI from '../services/paymentAPI';

export default function PremiumScreen() {
  const navigation = useNavigation();
  const [packages, setPackages] = useState([]);
  const [currentPackage, setCurrentPackage] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [paymentId, setPaymentId] = useState("");
  const [checkingStatus, setCheckingStatus] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [packagesResponse, currentPackageResponse] = await Promise.all([
      packageAPI.HandlePackage(""),
      userPackageAPI.HandleUserPackage("/my-packages")
    ]);
    
    setPackages(packagesResponse.data.packages);
    const active = currentPackageResponse.data.find(pkg => pkg.status === "active");
    setCurrentPackage(active);
  };

  // Reset all payment states
  const resetPaymentStates = () => {
    setPaymentInfo(null);
    setPaymentId("");
    setCheckingStatus(false);
  };

  useEffect(() => {
    let intervalId;

    const checkPaymentStatus = async () => {
      if (paymentId && !checkingStatus) {
        try {
          setCheckingStatus(true);
          const response = await paymentAPI.HandlePayment(`/${paymentId}/status`);
          if (response.data.status === "success") {
            Toast.show({
              type: 'success',
              text1: 'Thanh toán thành công',
              text2: 'Gói Premium của bạn đã được kích hoạt'
            });
            resetPaymentStates();
            fetchData();
          } else if (response.data.status === "failed") {
            Toast.show({
              type: 'error',
              text1: 'Thanh toán thất bại',
              text2: 'Vui lòng thử lại sau'
            });
            resetPaymentStates();
          }
        } catch (error) {
          console.error("Error checking payment status:", error);
        } finally {
          setCheckingStatus(false);
        }
      }
    };

    if (paymentId) {
      checkPaymentStatus();
      intervalId = setInterval(checkPaymentStatus, 5000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [paymentId]);
  
  const handleUpgrade = async (packageId) => {
    try {
      const response = await userAPI.HandleUser("/buy-vip-package", { packageId }, "post");
      
      if (response.status === 200) {
        setPaymentInfo(response.data.paymentLinkResponse);
        setPaymentId(response.data.paymentId);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể tạo đơn hàng. Vui lòng thử lại sau'
      });
    }
  };

  const handleCloseModal = () => {
    if (!checkingStatus) {
      resetPaymentStates();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>Nâng cấp Premium</Text>
        <View style={{ width: 28 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {packages.length === 0 ? (
          <Text style={{ textAlign: 'center', color: '#64748B', marginTop: 40 }}>Không có gói nào khả dụng.</Text>
        ) : (
          packages.map((pkg, idx) => {
            const isCurrent = currentPackage && currentPackage.package_id._id === pkg._id;
            return (
              <View
                key={pkg._id}
                style={[styles.packageCard, idx === 1 && styles.recommendedPackage]}
              >
                {idx === 0 && (
                  <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedText}>Khuyến nghị</Text>
                  </View>
                )}
                <View style={styles.packageHeader}>
                  <MaterialCommunityIcons name={pkg.icon} size={24} color="#FFD700" />
                  <Text style={styles.packageTitle}>{pkg.name}</Text>
                </View>
                <Text style={styles.packagePrice}>{pkg.price.toLocaleString('vi-VN')}đ</Text>
                <Text style={styles.packageDuration}>Thời hạn: {pkg.duration} ngày</Text>
                <View style={styles.packageDescriptionList}>
                  {pkg.description && pkg.description.map((desc, i) => (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 }}>
                      <Text style={{ color: '#4A90E2', fontWeight: 'bold', marginRight: 6 }}>•</Text>
                      <Text style={styles.packageDescription}>{desc}</Text>
                    </View>
                  ))}
                </View>
                <TouchableOpacity
                  style={[
                    styles.upgradeButton,
                    idx === 1 && styles.recommendedButton,
                    isCurrent && { opacity: 0.5 }
                  ]}
                  onPress={() => !isCurrent && handleUpgrade(pkg._id)}
                  disabled={isCurrent}
                >
                  <Text style={styles.upgradeButtonText}>
                    {isCurrent ? 'Đang sử dụng' : 'Nâng cấp ngay'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>
      <Modal
        visible={!!paymentInfo}
        transparent
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={styles.paymentTitle}>Thông tin thanh toán</Text>
              <TouchableOpacity onPress={handleCloseModal} disabled={checkingStatus}>
                <MaterialCommunityIcons 
                  name="close" 
                  size={24} 
                  color={checkingStatus ? "#CBD5E1" : "#64748B"} 
                />
              </TouchableOpacity>
            </View>
            {paymentInfo && (
              <>
                <Text>Tài khoản: {paymentInfo.accountName}</Text>
                <Text>Số tài khoản: {paymentInfo.accountNumber}</Text>
                <Text>Số tiền: {paymentInfo.amount.toLocaleString('vi-VN')}đ</Text>
                <Text>Mô tả: {paymentInfo.description}</Text>
                <View style={{ alignItems: 'center', marginTop: 16 }}>
                  <QRCode
                    value={paymentInfo.qrCode}
                    size={180}
                  />
                  <Text selectable style={{ marginTop: 10, fontSize: 12, color: '#64748B', textAlign: 'center' }}>
                    Quét mã QR để thanh toán
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
      <Toast />
    </View>
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
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 16,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    padding: 20,
    gap: 24,
  },
  packageCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#4A90E2',
    marginBottom: 16,
  },
  recommendedPackage: {
    borderColor: '#FFD700',
    borderWidth: 2,
  },
  recommendedBadge: {
    position: 'absolute',
    top: -12,
    right: 16,
    backgroundColor: '#4A90E2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  recommendedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  packageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  packageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  packagePrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  packageDuration: { fontSize: 14, color: '#64748B', marginBottom: 8, fontStyle: 'italic' },
  packageDescriptionList: { marginBottom: 16 },
  packageDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 20,
  },
  upgradeButton: {
    backgroundColor: '#4A90E2',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  recommendedButton: {
    backgroundColor: '#FFD700',
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  paymentBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  paymentTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    color: '#1E293B',
  },
  payButton: {
    marginTop: 12,
    backgroundColor: '#4A90E2',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '90%' },
  disabledButton: {
    opacity: 0.5,
  },
}); 