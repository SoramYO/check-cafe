import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Modal, ActivityIndicator } from 'react-native';
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
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [packagesResponse, currentPackageResponse] = await Promise.all([
        packageAPI.HandlePackage(""),
        userPackageAPI.HandleUserPackage("/my-packages")
      ]);
      
      setPackages(packagesResponse.data.packages);
      const active = currentPackageResponse.data.find(pkg => pkg.status === "active");
      setCurrentPackage(active);
    } catch (error) {
      console.error("Error fetching premium data:", error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể tải thông tin gói Premium'
      });
    } finally {
      setLoading(false);
    }
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
      setUpgrading(true);
      const response = await paymentAPI.HandlePayment("/create", {
        packageId,
        amount: packages.find(pkg => pkg._id === packageId)?.price,
        type: "package"
      }, "post");
      
      if (response.status === 201) {
        setPaymentInfo(response.data);
        setPaymentId(response.data._id);
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể tạo thanh toán'
      });
    } finally {
      setUpgrading(false);
    }
  };

  const handleCloseModal = () => {
    if (!checkingStatus) {
      resetPaymentStates();
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7a5545" />
        <Text style={styles.loadingText}>Đang tải gói Premium...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Premium</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Current Package Status */}
      {currentPackage && (
        <View style={styles.currentPackageCard}>
          <View style={styles.currentPackageHeader}>
            <MaterialCommunityIcons name="crown" size={24} color="#FFD700" />
            <Text style={styles.currentPackageTitle}>Gói hiện tại</Text>
          </View>
          <Text style={styles.currentPackageName}>{currentPackage.package_id.name}</Text>
          <Text style={styles.currentPackageExpiry}>
            Hết hạn: {new Date(currentPackage.end_date).toLocaleDateString('vi-VN')}
          </Text>
        </View>
      )}

      {/* Premium Features */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Tính năng Premium</Text>
        {PREMIUM_FEATURES.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <MaterialCommunityIcons 
              name={feature.icon} 
              size={24} 
              color="#7a5545" 
            />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Packages */}
      <View style={styles.packagesSection}>
        <Text style={styles.sectionTitle}>Chọn gói Premium</Text>
        {packages.map((pkg) => (
          <View key={pkg._id} style={styles.packageCard}>
            <View style={styles.packageHeader}>
              <Text style={styles.packageName}>{pkg.name}</Text>
              <Text style={styles.packagePrice}>
                {pkg.price.toLocaleString()}đ/{pkg.duration_months} tháng
              </Text>
            </View>
            <Text style={styles.packageDescription}>{pkg.description}</Text>
            
            <TouchableOpacity 
              style={[
                styles.upgradeButton,
                (upgrading || checkingStatus) && styles.upgradeButtonDisabled
              ]}
              onPress={() => handleUpgrade(pkg._id)}
              disabled={upgrading || checkingStatus}
            >
              {upgrading ? (
                <View style={styles.buttonLoading}>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={styles.upgradeButtonText}>Đang xử lý...</Text>
                </View>
              ) : (
                <Text style={styles.upgradeButtonText}>Nâng cấp ngay</Text>
              )}
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Payment Modal */}
      <Modal
        visible={!!paymentInfo}
        transparent={true}
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
    </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#7a5545',
    fontWeight: '500',
  },
  buttonLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  upgradeButtonDisabled: {
    opacity: 0.7,
  },
  currentPackageCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  currentPackageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  currentPackageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  currentPackageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  currentPackageExpiry: {
    fontSize: 14,
    color: '#64748B',
    fontStyle: 'italic',
  },
  featuresSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  featureDescription: {
    fontSize: 14,
    color: '#64748B',
  },
  packagesSection: {
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
}); 