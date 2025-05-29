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

export default function BookingsScreen() {
  const [activeTab, setActiveTab] = useState("Pending");
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const navigation = useNavigation();

  const filteredBookings = reservations.filter(
    (booking) => booking.status === activeTab
  );

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await reservationAPI.HandleReservation("/me");
      setReservations(response.data.reservations);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowQR = (booking) => {
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
      onPress={() => navigation.navigate("BookingDetail", { booking: item })}
    >
      <View style={styles.ticketHeader}>
        <View style={styles.statusIndicator}>
          <View
            style={[
              styles.statusDot,
              item.status === "Pending" && styles.pendingDot,
              item.status === "Confirmed" && styles.confirmedDot,
              item.status === "Completed" && styles.completedDot,
            ]}
          />
          <Text
            style={[
              styles.statusText,
              item.status === "Pending" && styles.pendingText,
              item.status === "Confirmed" && styles.confirmedText,
              item.status === "Completed" && styles.completedText,
            ]}
          >
            {item.status === "Pending"
              ? "Chờ xác nhận"
              : item.status === "Confirmed"
              ? "Đã xác nhận"
              : "Đã hoàn thành"}
          </Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <MaterialCommunityIcons
            name="dots-horizontal"
            size={24}
            color="#64748B"
          />
        </TouchableOpacity>
      </View>

      <Image
        source={{ uri: item.shop_id?.shopImages[0].url }}
        style={styles.cafeImage}
      />
      <View style={styles.cardContent}>
        <Text style={styles.cafeName}>{item.shop_id?.name}</Text>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="calendar" size={20} color="#64748B" />
            <Text style={styles.detailText}>
              {new Date(item?.reservation_date).toLocaleDateString("vi-VN")}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={20}
              color="#64748B"
            />
            <Text style={styles.detailText}>
              {item?.time_slot_id?.start_time} - {item?.time_slot_id?.end_time}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons
              name="account-group"
              size={20}
              color="#64748B"
            />
            <Text style={styles.detailText}>
              {item?.number_of_people} người
            </Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          {activeTab === "Pending" ? (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
              >
                <Text style={styles.cancelButtonText}>Hủy đặt chỗ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton]}
              >
                <Text style={styles.primaryButtonText}>Chỉnh sửa</Text>
              </TouchableOpacity>
            </>
          ) : activeTab === "Confirmed" ? (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={() => handleShowQR(item)}
              >
                <Text style={styles.secondaryButtonText}>Hiện QR code</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton]}
                onPress={() =>
                  navigation.navigate("BookingDetail", { booking: item })
                }
              >
                <Text style={styles.primaryButtonText}>Xem chi tiết</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
            >
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
          onPress={() => setActiveTab("Pending")}
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
          onPress={() => setActiveTab("Confirmed")}
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
          onPress={() => setActiveTab("Completed")}
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
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    borderColor: "#BFA58E",
    borderWidth: 1,
    shadowColor: "#7a5545",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#BFA58E",
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pendingDot: {
    backgroundColor: "#F59E0B",
  },
  confirmedDot: {
    backgroundColor: "#10B981",
  },
  completedDot: {
    backgroundColor: "#6366F1",
  },
  statusText: {
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
    color: "#7a5545",
  },
  pendingText: {
    color: "#F59E0B",
  },
  confirmedText: {
    color: "#10B981",
  },
  completedText: {
    color: "#6366F1",
  },
  cafeImage: {
    width: "100%",
    height: 140,
    borderBottomWidth: 1,
    borderBottomColor: "#BFA58E",
  },
  cardContent: {
    padding: 12,
    backgroundColor: "white",
  },
  cafeName: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: "#7a5545",
    marginBottom: 8,
  },
  detailsContainer: {
    gap: 8,
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#BFA58E",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: "#7a5545",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#FEE2E2",
  },
  cancelButtonText: {
    color: "#EF4444",
    fontFamily: "Poppins_500Medium",
    fontSize: 12,
  },
  primaryButton: {
    backgroundColor: "#7a5545",
  },
  primaryButtonText: {
    color: "white",
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
  },
  moreButton: {
    padding: 2,
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
  secondaryButton: {
    backgroundColor: "rgba(191, 165, 142, 0.2)",
  },
  secondaryButtonText: {
    color: "#7a5545",
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
