import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import { useNavigation } from "@react-navigation/native";
import reservationAPI from "../services/reservationAPI";

export default function BookingDetailScreen({ route }) {
  const [reservation, setReservation] = React.useState(null);
  const [shopId, setShopId] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [imageLoadError, setImageLoadError] = React.useState(false);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  const { booking } = route.params || {};
  const navigation = useNavigation();

  const showErrorAlert = (title, message) => {
    Alert.alert(title, message, [{ text: 'OK', onPress: () => navigation.goBack() }]);
  };

  const tryNextImage = () => {
    const displayData = reservation || booking;
    const shopImages = displayData?.shop_id?.shopImages || [];
    
    if (currentImageIndex < shopImages.length - 1) {
      // Try next image
      const nextIndex = currentImageIndex + 1;
      setCurrentImageIndex(nextIndex);
      setImageLoadError(false);
      console.log(`🔄 Trying next image (index ${nextIndex}):`, shopImages[nextIndex]?.url);
      return true;
    } else {
      // No more images to try
      setImageLoadError(true);
      console.log('❌ All images failed, showing placeholder');
      return false;
    }
  };

  const getCurrentImageUrl = () => {
    const displayData = reservation || booking;
    const shopImages = displayData?.shop_id?.shopImages || [];
    
    if (imageLoadError || currentImageIndex >= shopImages.length) {
      return 'https://via.placeholder.com/400x220/cccccc/ffffff?text=No+Image';
    }
    
    const currentImage = shopImages[currentImageIndex];
    return currentImage?.url ? `${currentImage.url}?t=${Date.now()}` : 'https://via.placeholder.com/400x220/cccccc/ffffff?text=No+Image';
  };

  useEffect(() => {
    const fetchReservationDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Case 1: Navigation from notification with reservationId
        if (route.params?.reservationId && route.params?.loadFromAPI) {
          const response = await reservationAPI.HandleReservation(
            `/${route.params.reservationId}`);
          console.log('Response from API:', response);

          if (response?.data?.reservation) {
            const reservationData = response.data.reservation;
            console.log('🔍 Full reservation data:', JSON.stringify(reservationData, null, 2));
            console.log('🔍 QR Code field:', reservationData.qr_code);
            console.log('🔍 Shop data:', reservationData.shop_id);
            console.log('🔍 Shop images:', reservationData.shop_id?.shopImages);
            console.log('🔍 First image URL:', reservationData.shop_id?.shopImages?.[0]?.url);
            console.log('🔍 All keys:', Object.keys(reservationData));
            setReservation(reservationData);
            setImageLoadError(false); // Reset image error when new data is loaded
            setCurrentImageIndex(0); // Reset to first image when new data is loaded

            // Update shop_id from API data
            if (reservationData.shop_id) {
              setShopId(reservationData.shop_id);
            }
          } else {
            throw new Error('No reservation data found');
          }
        }
        // Case 2: Normal navigation with booking object
        else if (booking) {
          setReservation(booking);
          setImageLoadError(false);
          setCurrentImageIndex(0);
          if (booking.shop_id) {
            setShopId(booking.shop_id);
          }
        }
        // Case 3: Navigation with shop_id only
        else if (route.params?.shop_id) {
          setShopId(route.params.shop_id);
        }
        // Case 4: No valid data
        else {
          throw new Error('No booking information provided');
        }

      } catch (error) {
        console.error('Error fetching reservation details:', error);
        setError(error.message);
        showErrorAlert('Lỗi', 'Không thể tải thông tin đặt chỗ');
      } finally {
        setLoading(false);
      }
    };

    fetchReservationDetails();
  }, [route.params?.reservationId, booking]);

  // Use reservation data if available, otherwise fall back to booking
  const displayData = reservation || booking;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <MaterialCommunityIcons name="arrow-left" size={26} color="#7a5545" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết đặt chỗ</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !displayData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <MaterialCommunityIcons name="arrow-left" size={26} color="#7a5545" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết đặt chỗ</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={64} color="#E74C3C" />
          <Text style={styles.errorTitle}>Không thể tải thông tin</Text>
          <Text style={styles.errorMessage}>
            {error || 'Thông tin đặt chỗ không tồn tại hoặc đã bị xóa'}
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with back button */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <MaterialCommunityIcons name="arrow-left" size={26} color="#7a5545" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đặt chỗ</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Shop Image */}
        <Image
          key={`shop-image-${displayData?._id}-${currentImageIndex}-${displayData.shop_id?.shopImages?.[currentImageIndex]?._id}`}
          source={{ 
            uri: getCurrentImageUrl()
          }}
          style={styles.image}
          onError={(error) => {
            const currentUrl = displayData.shop_id?.shopImages?.[currentImageIndex]?.url;
            
            // Try next image
            const hasNext = tryNextImage();
            if (!hasNext) {
              console.log('❌ No more images to try');
            }
          }}
          onLoad={() => {
            const currentUrl = displayData.shop_id?.shopImages?.[currentImageIndex]?.url;
            setImageLoadError(false);
          }}
          onLoadStart={() => {
            const currentUrl = displayData.shop_id?.shopImages?.[currentImageIndex]?.url;
          }}
          resizeMode="cover"
        />
        <View style={styles.card}>
          {/* Shop Name & Address */}
          <Text style={styles.title}>
            {displayData.shop_id?.name || 'Tên quán không có'}
          </Text>
          <View style={styles.row}>
            <MaterialCommunityIcons
              name="map-marker"
              size={20}
              color="#7a5545"
            />
            <Text style={styles.address}>
              {displayData.shop_id?.address || 'Địa chỉ không có'}
            </Text>
          </View>
          <View style={styles.divider} />

          {/* Booking Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin đặt chỗ</Text>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="calendar"
                size={20}
                color="#64748B"
              />
              <Text style={styles.infoText}>
                {displayData.reservation_date 
                  ? new Date(displayData.reservation_date).toLocaleDateString("vi-VN")
                  : 'Ngày không có'
                }
              </Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={20}
                color="#64748B"
              />
              <Text style={styles.infoText}>
                {displayData.time_slot_id?.start_time && displayData.time_slot_id?.end_time
                  ? `${displayData.time_slot_id.start_time} - ${displayData.time_slot_id.end_time}`
                  : 'Thời gian không có'
                }
              </Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="account-group"
                size={20}
                color="#64748B"
              />
              <Text style={styles.infoText}>
                {displayData.number_of_people || 'N/A'} người
              </Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="table-chair"
                size={20}
                color="#64748B"
              />
              <Text style={styles.infoText}>
                {displayData.seat_id?.seat_name || 
                 (displayData.seat_id?.capacity ? `Chỗ ngồi ${displayData.seat_id.capacity} người` : 'Chỗ ngồi không có')}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="note-text"
                size={20}
                color="#64748B"
              />
              <Text style={styles.infoText}>
                {displayData.notes || "Không có"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="check-circle"
                size={20}
                color={
                  displayData.status === "Pending"
                    ? "#F59E0B"
                    : displayData.status === "Confirmed"
                      ? "#10B981"
                      : "#6366F1"
                }
              />
              <Text
                style={[
                  styles.infoText,
                  {
                    color:
                      displayData.status === "Pending"
                        ? "#F59E0B"
                        : displayData.status === "Confirmed"
                          ? "#10B981"
                          : "#6366F1",
                  },
                ]}
              >
                {displayData.status === "Pending"
                  ? "Chờ xác nhận"
                  : displayData.status === "Confirmed"
                    ? "Đã xác nhận"
                    : displayData.status === "Completed"
                      ? "Đã hoàn thành"
                      : displayData.status || "Không xác định"}
              </Text>
            </View>
          </View>

          {/* QR Code Section */}
          {(displayData?.qr_code || displayData?.qrCode) && (
            displayData?.status === "Confirmed" || displayData?.status === "Completed"
          ) && (
            <View style={styles.qrSection}>
              <Text style={styles.sectionTitle}>Mã QR Check-in</Text>
              <View style={styles.qrContainer}>
                <Image
                  source={{ 
                    uri: displayData.qr_code || displayData.qrCode 
                  }}
                  style={styles.qrImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.qrHint}>
                {displayData?.status === "Completed" 
                  ? "Bạn đã hoàn thành đặt chỗ này." 
                  : "Vui lòng xuất trình mã này khi đến quán để xác nhận đặt chỗ."
                }
              </Text>
            </View>
          )}
          
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingTop: Platform.OS === "android" ? 40 : 0,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    backgroundColor: "white",
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    letterSpacing: 0.2,
  },
  image: {
    width: "100%",
    height: 220,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  card: {
    backgroundColor: "white",
    margin: 16,
    marginTop: -32,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 8,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  address: {
    marginLeft: 8,
    color: "#64748B",
    fontSize: 15,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 10,
    borderRadius: 1,
  },
  section: {
    marginTop: 8,
    marginBottom: 8,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7a5545",
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 15,
    color: "#334155",
  },
  qrSection: {
    marginTop: 24,
    alignItems: "center",
  },
  qrContainer: {
    marginTop: 12,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  qrImage: {
    width: 180,
    height: 180,
    resizeMode: "contain",
  },
  qrHint: {
    marginTop: 12,
    color: "#64748B",
    fontSize: 13,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#7a5545",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#E74C3C",
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#7a5545",
    padding: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "white",
  },
  debugSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  debugText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
});
