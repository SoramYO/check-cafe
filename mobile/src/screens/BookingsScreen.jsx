import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  SafeAreaView,
  StatusBar,
  Platform,
  Modal,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import reservationAPI from "../services/reservationAPI";
import { useNavigation } from "@react-navigation/native";
import { useAnalytics } from "../utils/analytics";

export default function BookingsScreen() {
  const [activeTab, setActiveTab] = useState("Pending");
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const navigation = useNavigation();
  const { trackScreenView, trackTap, trackAppEvent, isAuthenticated } = useAnalytics();

  const filteredBookings = reservations.filter(
    (booking) => booking.status === activeTab
  );

  useEffect(() => {
    const init = async () => {
      // Only track if user is authenticated
      if (await isAuthenticated()) {
        trackScreenView('Bookings', {
          default_tab: activeTab,
          timestamp: new Date().toISOString()
        });
      }
    };
    init();
    
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      trackAppEvent('bookings_loading_started');
      
      const response = await reservationAPI.HandleReservation("/me");
      setReservations(response.data.reservations);
      
      // Track successful reservations load
      trackAppEvent('bookings_loaded', {
        total_reservations: response.data.reservations.length,
        pending: response.data.reservations.filter(r => r.status === 'Pending').length,
        confirmed: response.data.reservations.filter(r => r.status === 'Confirmed').length,
        completed: response.data.reservations.filter(r => r.status === 'Completed').length
      });
      
    } catch (error) {
      console.error("Error fetching reservations:", error);
      trackAppEvent('bookings_load_failed', {
        error_message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShowQR = (booking) => {
    // Track QR code modal open
    trackTap('booking_qr_code', {
      booking_id: booking._id,
      shop_id: booking.shop_id?._id,
      shop_name: booking.shop_id?.name,
      booking_status: booking.status,
      source: 'bookings_screen'
    });

    setSelectedBooking(booking);
    setShowQRModal(true);
  };

  const renderQRModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showQRModal}
      onRequestClose={() => setShowQRModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Mã QR Check-in</Text>
            <TouchableOpacity
              onPress={() => setShowQRModal(false)}
              style={styles.closeButton}
            >
              <MaterialCommunityIcons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.qrContainer}>
            <Image
              source={{ uri: selectedBooking?.qr_code }}
              style={styles.qrImage}
            />
          </View>

          <View style={styles.bookingInfo}>
            <Text style={styles.cafeName}>
              {selectedBooking?.shop_id?.name}
            </Text>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="calendar"
                size={20}
                color="#64748B"
              />
              <Text style={styles.infoText}>
                {selectedBooking &&
                  new Date(selectedBooking.reservation_date).toLocaleDateString(
                    "vi-VN"
                  )}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={20}
                color="#64748B"
              />
              <Text style={styles.infoText}>
                {selectedBooking?.time_slot_id?.start_time} -{" "}
                {selectedBooking?.time_slot_id?.end_time}
              </Text>
            </View>
          </View>

          <Text style={styles.qrHint}>
            Vui lòng xuất trình mã này khi đến quán để xác nhận đặt chỗ
          </Text>
        </View>
      </View>
    </Modal>
  );

  const renderRequestItem = ({ item }) => (
    <TouchableOpacity
      style={styles.requestCard}
      activeOpacity={0.9}
      onPress={() => {
        trackTap('booking_card', {
          booking_id: item._id,
          shop_id: item.shop_id?._id,
          shop_name: item.shop_id?.name,
          booking_status: item.status,
          source: 'bookings_screen'
        });
        navigation.navigate("BookingDetail", { booking: item });
      }}
    >
      {/* Status Badge - Floating on top */}
      <View style={styles.statusBadge}>
        <View
          style={[
            styles.statusBadgeInner,
            item.status === "Pending" && styles.pendingBadge,
            item.status === "Confirmed" && styles.confirmedBadge,
            item.status === "Completed" && styles.completedBadge,
          ]}
        >
          <MaterialCommunityIcons
            name={
              item.status === "Pending" 
                ? "clock-outline" 
                : item.status === "Confirmed" 
                ? "check-circle" 
                : "check-all"
            }
            size={14}
            color="white"
          />
          <Text style={styles.statusBadgeText}>
            {item.status === "Pending"
              ? "Chờ xác nhận"
              : item.status === "Confirmed"
              ? "Đã xác nhận"
              : "Hoàn thành"}
          </Text>
        </View>
      </View>

      {/* Cafe Image with overlay gradient */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.shop_id?.shopImages[0].url }}
          style={styles.cafeImage}
        />
        <View style={styles.imageOverlay} />
        
        {/* Cafe name on image */}
        <View style={styles.cafeNameOverlay}>
          <Text style={styles.cafeNameOnImage} numberOfLines={1}>
            {item.shop_id?.name}
          </Text>
        </View>
      </View>

      {/* Card Content */}
      <View style={styles.cardContent}>
        {/* Booking Details with Icons */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailCard}>
            <View style={styles.detailIconContainer}>
              <MaterialCommunityIcons name="calendar" size={18} color="#7a5545" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Ngày đặt</Text>
              <Text style={styles.detailValue}>
                {new Date(item?.reservation_date).toLocaleDateString("vi-VN")}
              </Text>
            </View>
          </View>

          <View style={styles.detailCard}>
            <View style={styles.detailIconContainer}>
              <MaterialCommunityIcons name="clock-outline" size={18} color="#7a5545" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Thời gian</Text>
              <Text style={styles.detailValue}>
                {item?.time_slot_id?.start_time} - {item?.time_slot_id?.end_time}
              </Text>
            </View>
          </View>

          <View style={styles.detailCard}>
            <View style={styles.detailIconContainer}>
              <MaterialCommunityIcons name="account-group" size={18} color="#7a5545" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Số người</Text>
              <Text style={styles.detailValue}>
                {item?.number_of_people} người
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          {activeTab === "Pending" ? (
            <>
              <TouchableOpacity
                style={[styles.modernActionButton, styles.cancelButton]}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="close-circle-outline" size={16} color="#EF4444" />
                <Text style={styles.cancelButtonText}>Hủy đặt</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modernActionButton, styles.primaryButton]}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="pencil-outline" size={16} color="white" />
                <Text style={styles.primaryButtonText}>Chỉnh sửa</Text>
              </TouchableOpacity>
            </>
          ) : activeTab === "Confirmed" ? (
            <>
              <TouchableOpacity
                style={[styles.modernActionButton, styles.qrButton]}
                onPress={() => handleShowQR(item)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="qrcode" size={16} color="#7a5545" />
                <Text style={styles.qrButtonText}>QR Code</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modernActionButton, styles.primaryButton]}
                onPress={() =>
                  navigation.navigate("BookingDetail", { booking: item })
                }
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="eye-outline" size={16} color="white" />
                <Text style={styles.primaryButtonText}>Chi tiết</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.modernActionButton, styles.primaryButton, { flex: 1 }]}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="eye-outline" size={16} color="white" />
              <Text style={styles.primaryButtonText}>Xem chi tiết</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Đặt chỗ của tôi</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "Pending" && styles.activeTab]}
                        onPress={() => {
                trackTap('booking_tab_switch', {
                  from_tab: activeTab,
                  to_tab: 'Pending',
                  source: 'bookings_screen'
                });
                setActiveTab("Pending");
              }}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "Pending" && styles.activeTabText,
            ]}
          >
            Chờ xác nhận
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "Confirmed" && styles.activeTab]}
                        onPress={() => {
                trackTap('booking_tab_switch', {
                  from_tab: activeTab,
                  to_tab: 'Confirmed',
                  source: 'bookings_screen'
                });
                setActiveTab("Confirmed");
              }}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "Confirmed" && styles.activeTabText,
            ]}
          >
            Đã xác nhận
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "Completed" && styles.activeTab]}
                        onPress={() => {
                trackTap('booking_tab_switch', {
                  from_tab: activeTab,
                  to_tab: 'Completed',
                  source: 'bookings_screen'
                });
                setActiveTab("Completed");
              }}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "Completed" && styles.activeTabText,
            ]}
          >
            Đã hoàn thành
          </Text>
        </TouchableOpacity>
      </View>

      {filteredBookings.length > 0 ? (
        <FlatList
          data={filteredBookings}
          renderItem={renderRequestItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={fetchReservations}
        />
      ) : (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="calendar-blank"
            size={64}
            color="#CBD5E1"
          />
          <Text style={styles.emptyStateText}>Chưa có đặt chỗ nào</Text>
        </View>
      )}

      {renderQRModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: "Poppins_600SemiBold",
    color: "#7a5545",
    fontWeight: "bold",
  },
  tabContainer: {
    flexDirection: "row",
    padding: 4,
    marginHorizontal: 20,
    marginVertical: 10,
    backgroundColor: "rgba(191, 165, 142, 0.2)",
    borderRadius: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: "#7a5545",
  },
  tabText: {
    fontFamily: "Poppins_500Medium",
    color: "#7a5545",
    fontSize: 14,
  },
  activeTabText: {
    color: "white",
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  requestCard: {
    backgroundColor: "white",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#7a5545",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    position: "relative",
  },
  statusBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
  },
  statusBadgeInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
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
    fontSize: 11,
    fontFamily: "Poppins_600SemiBold",
    color: "white",
  },
  imageContainer: {
    position: "relative",
    height: 160,
  },
  cafeImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  cafeNameOverlay: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 60,
  },
  cafeNameOnImage: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: "white",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  cardContent: {
    padding: 16,
    backgroundColor: "white",
  },
  detailsGrid: {
    gap: 12,
    marginBottom: 16,
  },
  detailCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#7a5545",
  },
  detailIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(122, 85, 69, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    fontFamily: "Poppins_500Medium",
    color: "#64748B",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: "#1E293B",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  modernActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
  },
  cancelButton: {
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  cancelButtonText: {
    color: "#EF4444",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
  },
  primaryButton: {
    backgroundColor: "#7a5545",
  },
  primaryButtonText: {
    color: "white",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
  },
  qrButton: {
    backgroundColor: "rgba(122, 85, 69, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(122, 85, 69, 0.2)",
  },
  qrButtonText: {
    color: "#7a5545",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
    color: "#BFA58E",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxWidth: 340,
    alignItems: "center",
  },
  modalHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
  },
  closeButton: {
    padding: 4,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: "white",
    borderColor: "#BFA58E",
    borderWidth: 1,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrImage: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
  bookingInfo: {
    width: "100%",
    marginTop: 20,
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
  },
  infoText: {
    fontSize: 14,
    color: "#64748B",
  },
  qrHint: {
    marginTop: 16,
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
