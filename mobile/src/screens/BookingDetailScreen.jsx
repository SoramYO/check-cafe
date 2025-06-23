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
  Linking,
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
    Alert.alert(title, message, [
      { text: "OK", onPress: () => navigation.goBack() },
    ]);
  };

  const tryNextImage = () => {
    const displayData = reservation || booking;
    const shopImages = displayData?.shop_id?.shopImages || [];

    if (currentImageIndex < shopImages.length - 1) {
      // Try next image
      const nextIndex = currentImageIndex + 1;
      setCurrentImageIndex(nextIndex);
      setImageLoadError(false);
      console.log(
        `🔄 Trying next image (index ${nextIndex}):`,
        shopImages[nextIndex]?.url
      );
      return true;
    } else {
      // No more images to try
      setImageLoadError(true);
      console.log("❌ All images failed, showing placeholder");
      return false;
    }
  };

  const getCurrentImageUrl = () => {
    const displayData = reservation || booking;
    const shopImages = displayData?.shop_id?.shopImages || [];

    if (imageLoadError || currentImageIndex >= shopImages.length) {
      return "https://via.placeholder.com/400x220/cccccc/ffffff?text=No+Image";
    }

    const currentImage = shopImages[currentImageIndex];
    return currentImage?.url
      ? `${currentImage.url}?t=${Date.now()}`
      : "https://via.placeholder.com/400x220/cccccc/ffffff?text=No+Image";
  };

  const handleOpenGoogleMaps = () => {
    const address = encodeURIComponent(reservation?.shop_id?.address || "");
    if (address) {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${address}`);
    }
  };

  useEffect(() => {
    const fetchReservationDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Case 1: Navigation from notification with reservationId
        if (route.params?.reservationId && route.params?.loadFromAPI) {
          const response = await reservationAPI.HandleReservation(
            `/${route.params.reservationId}`
          );
          console.log("Response from API:", response);

          if (response?.data?.reservation) {
            const reservationData = response.data.reservation;
            console.log(
              "🔍 Full reservation data:",
              JSON.stringify(reservationData, null, 2)
            );
            console.log("🔍 QR Code field:", reservationData.qr_code);
            console.log("🔍 Shop data:", reservationData.shop_id);
            console.log("🔍 Shop images:", reservationData.shop_id?.shopImages);
            console.log(
              "🔍 First image URL:",
              reservationData.shop_id?.shopImages?.[0]?.url
            );
            console.log("🔍 All keys:", Object.keys(reservationData));
            setReservation(reservationData);
            setImageLoadError(false); // Reset image error when new data is loaded
            setCurrentImageIndex(0); // Reset to first image when new data is loaded

            // Update shop_id from API data
            if (reservationData.shop_id) {
              setShopId(reservationData.shop_id);
            }
          } else {
            throw new Error("No reservation data found");
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
          throw new Error("No booking information provided");
        }
      } catch (error) {
        console.error("Error fetching reservation details:", error);
        setError(error.message);
        showErrorAlert("Lỗi", "Không thể tải thông tin đặt chỗ");
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
            <MaterialCommunityIcons
              name="arrow-left"
              size={26}
              color="#7a5545"
            />
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
            <MaterialCommunityIcons
              name="arrow-left"
              size={26}
              color="#7a5545"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết đặt chỗ</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="alert-circle"
            size={64}
            color="#E74C3C"
          />
          <Text style={styles.errorTitle}>Không thể tải thông tin</Text>
          <Text style={styles.errorMessage}>
            {error || "Thông tin đặt chỗ không tồn tại hoặc đã bị xóa"}
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
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image Section with Floating Header */}
        <View style={styles.heroSection}>
          <Image
            key={`shop-image-${displayData?._id}-${currentImageIndex}-${displayData.shop_id?.shopImages?.[currentImageIndex]?._id}`}
            source={{
              uri: getCurrentImageUrl(),
            }}
            style={styles.heroImage}
            onError={(error) => {
              const currentUrl =
                displayData.shop_id?.shopImages?.[currentImageIndex]?.url;

              // Try next image
              const hasNext = tryNextImage();
              if (!hasNext) {
                console.log("❌ No more images to try");
              }
            }}
            onLoad={() => {
              const currentUrl =
                displayData.shop_id?.shopImages?.[currentImageIndex]?.url;
              setImageLoadError(false);
            }}
            onLoadStart={() => {
              const currentUrl =
                displayData.shop_id?.shopImages?.[currentImageIndex]?.url;
            }}
            resizeMode="cover"
          />

          {/* Gradient Overlay */}
          <View style={styles.heroGradient} />

          {/* Floating Header */}
          <View style={styles.floatingHeader}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.floatingBackBtn}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={24}
                color="white"
              />
            </TouchableOpacity>
            <View
              style={[
                styles.statusBadgeContent,
                displayData.status === "Pending" && styles.pendingBadge,
                displayData.status === "Confirmed" && styles.confirmedBadge,
                displayData.status === "Completed" && styles.completedBadge,
              ]}
            >
              <MaterialCommunityIcons
                name={
                  displayData.status === "Pending"
                    ? "clock-outline"
                    : displayData.status === "Confirmed"
                    ? "check-circle"
                    : "check-all"
                }
                size={16}
                color="white"
              />
              <Text style={styles.statusBadgeText}>
                {displayData.status === "Pending"
                  ? "Chờ xác nhận"
                  : displayData.status === "Confirmed"
                  ? "Đã xác nhận"
                  : "Hoàn thành"}
              </Text>
            </View>
          </View>
        </View>

        {/* Main Content Card */}
        <View style={styles.mainCard}>
          {/* Shop Header Section */}
          <View style={styles.shopHeader}>
            <View style={styles.shopInfo}>
              <Text style={styles.shopTitle}>
                {displayData.shop_id?.name || "Tên quán không có"}
              </Text>
              <View style={styles.locationRow}>
                <View style={styles.locationIcon}>
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={16}
                    color="#7a5545"
                  />
                </View>
                <Text style={styles.shopAddress}>
                  {displayData.shop_id?.address || "Địa chỉ không có"}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.directionBtn} onPress={handleOpenGoogleMaps}>
              <MaterialCommunityIcons
                name="directions"
                size={18}
                color="#7a5545"
              />
            </TouchableOpacity>
          </View>

          {/* Booking Details Cards */}
          <View style={styles.bookingSection}>
            <Text style={styles.sectionTitle}>Chi tiết đặt chỗ</Text>

            <View style={styles.detailsGrid}>
              {/* Date Card */}
              <View style={styles.detailCard}>
                <View style={styles.detailIconWrapper}>
                  <MaterialCommunityIcons
                    name="calendar"
                    size={20}
                    color="#7a5545"
                  />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Ngày đặt</Text>
                  <Text style={styles.detailValue}>
                    {displayData.reservation_date
                      ? new Date(
                          displayData.reservation_date
                        ).toLocaleDateString("vi-VN")
                      : "Ngày không có"}
                  </Text>
                </View>
              </View>

              {/* Time Card */}
              <View style={styles.detailCard}>
                <View style={styles.detailIconWrapper}>
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={20}
                    color="#7a5545"
                  />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Thời gian</Text>
                  <Text style={styles.detailValue}>
                    {displayData.time_slot_id?.start_time &&
                    displayData.time_slot_id?.end_time
                      ? `${displayData.time_slot_id.start_time} - ${displayData.time_slot_id.end_time}`
                      : "Thời gian không có"}
                  </Text>
                </View>
              </View>

              {/* Guests Card */}
              <View style={styles.detailCard}>
                <View style={styles.detailIconWrapper}>
                  <MaterialCommunityIcons
                    name="account-group"
                    size={20}
                    color="#7a5545"
                  />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Số khách</Text>
                  <Text style={styles.detailValue}>
                    {displayData.number_of_people || "N/A"} người
                  </Text>
                </View>
              </View>

              {/* Table Card */}
              <View style={styles.detailCard}>
                <View style={styles.detailIconWrapper}>
                  <MaterialCommunityIcons
                    name="table-chair"
                    size={20}
                    color="#7a5545"
                  />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Chỗ ngồi</Text>
                  <Text style={styles.detailValue}>
                    {displayData.seat_id?.seat_name ||
                      (displayData.seat_id?.capacity
                        ? `Chỗ ngồi ${displayData.seat_id.capacity} người`
                        : "Chỗ ngồi không có")}
                  </Text>
                </View>
              </View>

              {/* Notes Card */}
              {displayData.notes && displayData.notes !== "Không có" && (
                <View style={styles.notesCard}>
                  <View style={styles.detailIconWrapper}>
                    <MaterialCommunityIcons
                      name="note-text"
                      size={20}
                      color="#7a5545"
                    />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Ghi chú</Text>
                    <Text style={styles.notesValue}>{displayData.notes}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* QR Code Section */}
          {(displayData?.qr_code || displayData?.qrCode) &&
            (displayData?.status === "Confirmed" ||
              displayData?.status === "Completed") && (
              <View style={styles.qrSection}>
                <View style={styles.qrHeader}>
                  <View style={styles.qrTitleContainer}>
                    <MaterialCommunityIcons
                      name="qrcode"
                      size={24}
                      color="#7a5545"
                    />
                    <Text style={styles.qrSectionTitle}>Mã QR Check-in</Text>
                  </View>
                  {displayData?.status === "Confirmed" && (
                    <View style={styles.qrStatusChip}>
                      <MaterialCommunityIcons
                        name="flash"
                        size={14}
                        color="#10B981"
                      />
                      <Text style={styles.qrStatusText}>Sẵn sàng</Text>
                    </View>
                  )}
                </View>

                <View style={styles.qrCardContainer}>
                  <View style={styles.qrCard}>
                    <View style={styles.qrImageContainer}>
                      <Image
                        source={{
                          uri: displayData.qr_code || displayData.qrCode,
                        }}
                        style={styles.qrImage}
                        resizeMode="contain"
                      />
                    </View>

                    <View style={styles.qrInfo}>
                      <Text style={styles.qrBookingId}>
                        #{displayData._id?.slice(-8)?.toUpperCase() || "N/A"}
                      </Text>
                      <Text style={styles.qrShopName}>
                        {displayData.shop_id?.name}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.qrHint}>
                    {displayData?.status === "Completed"
                      ? "✅ Bạn đã hoàn thành đặt chỗ này thành công!"
                      : "📱 Vui lòng xuất trình mã QR này khi đến quán để xác nhận đặt chỗ"}
                  </Text>

                  {displayData?.status === "Confirmed" && (
                    <TouchableOpacity style={styles.shareQrBtn}>
                      <MaterialCommunityIcons
                        name="share-variant"
                        size={18}
                        color="#7a5545"
                      />
                      <Text style={styles.shareQrText}>Chia sẻ mã QR</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
        </View>

        <View style={{ height: 100 }}></View>
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
  heroSection: {
    position: "relative",
    height: 300,
  },
  heroImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  heroGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 50%, rgba(0,0,0,0.6) 100%)",
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  floatingHeader: {
    position: "absolute",
    top: Platform.OS === "android" ? 20 : 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    zIndex: 10,
  },
  floatingBackBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(10px)",
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(10px)",
  },
  heroStatusBadge: {
    position: "absolute",
    top: Platform.OS === "android" ? 80 : 110,
    right: 20,
    zIndex: 10,
  },
  statusBadgeContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  pendingBadge: {
    backgroundColor: "#F59E0B",
  },
  confirmedBadge: {
    backgroundColor: "#10B981",
  },
  completedBadge: {
    backgroundColor: "#6366F1",
  },
  statusBadgeText: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
    color: "white",
  },
  mainCard: {
    backgroundColor: "white",
    margin: 16,
    marginTop: -60,
    borderRadius: 24,
    padding: 24,
    shadowColor: "#7a5545",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 16,
    zIndex: 5,
  },
  shopHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  shopInfo: {
    flex: 1,
    marginRight: 16,
  },
  shopTitle: {
    fontSize: 24,
    fontFamily: "Poppins_700Bold",
    color: "#1E293B",
    marginBottom: 8,
    lineHeight: 32,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(122, 85, 69, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  shopAddress: {
    fontSize: 14,
    color: "#64748B",
    flex: 1,
    lineHeight: 20,
  },
  directionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(122, 85, 69, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(122, 85, 69, 0.2)",
  },
  bookingSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    color: "#7a5545",
    marginBottom: 16,
  },
  detailsGrid: {
    gap: 12,
  },
  detailCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#7a5545",
  },
  notesCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFF7ED",
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
  },
  detailIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(122, 85, 69, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    color: "#64748B",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: "#1E293B",
    lineHeight: 22,
  },
  notesValue: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#92400E",
    lineHeight: 20,
  },
  qrSection: {
    marginTop: 8,
  },
  qrHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  qrTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  qrSectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    color: "#7a5545",
  },
  qrStatusChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  qrStatusText: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
    color: "#10B981",
  },
  qrCardContainer: {
    alignItems: "center",
  },
  qrCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#7a5545",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: "#F1F5F9",
    marginBottom: 16,
  },
  qrImageContainer: {
    padding: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    marginBottom: 16,
  },
  qrImage: {
    width: 160,
    height: 160,
    resizeMode: "contain",
  },
  qrInfo: {
    alignItems: "center",
    gap: 4,
  },
  qrBookingId: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: "#7a5545",
    letterSpacing: 1,
  },
  qrShopName: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: "#64748B",
  },
  qrHint: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  shareQrBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(122, 85, 69, 0.1)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(122, 85, 69, 0.2)",
  },
  shareQrText: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: "#7a5545",
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
