import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { formatDateTime } from "../../utils/formatHelpers";
import { toast } from "sonner-native";
import reservationAPI from "../../services/reservationAPI";
import shopAPI from "../../services/shopAPI";
import { useShop } from "../../context/ShopContext";

export default function BookingRequestScreen() {
  const [bookings, setBookings] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("Pending");
  const { updateShopData, shopId } = useShop();

  useEffect(() => {
    fetchShop();
  }, []);

  useEffect(() => {
    if (shopId) {
      fetchBookings();
    }
  }, [shopId]);

  const fetchShop = async () => {
    const response = await shopAPI.HandleCoffeeShops("/staff/list");
    if (response.status === 200) {
      updateShopData({
        shopId: response.data._id,
        shopName: response.data.name,
      });
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await reservationAPI.HandleReservation(
        `/staff/${shopId}`
      );
      if (response.status === 200) {
        setBookings(response.data.reservations);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Không thể tải danh sách đặt chỗ");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      const response = await bookingAPI.HandleBooking(
        `/${bookingId}/status`,
        { status: newStatus },
        "put"
      );
      if (response.status === 200) {
        toast.success("Cập nhật trạng thái thành công");
        fetchBookings();
      }
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error("Không thể cập nhật trạng thái");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "#F59E0B";
      case "Confirmed":
        return "#10B981";
      case "Cancelled":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "Pending":
        return "Chờ xác nhận";
      case "Confirmed":
        return "Đã xác nhận";
      case "Cancelled":
        return "Đã hủy";
      default:
        return "Không xác định";
    }
  };

  const renderBookingCard = ({ item }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={styles.userInfo}>
          <Image
            source={{
              uri: item.user_id?.avatar || "https://via.placeholder.com/40",
            }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.userName}>{item.user_id?.full_name}</Text>
            <Text style={styles.bookingId}>#{item._id.slice(-6)}</Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="calendar" size={20} color="#7a5545" />
          <Text style={styles.detailText}>
            {formatDateTime(item.reservation_date)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons
            name="account-group"
            size={20}
            color="#7a5545"
          />
          <Text style={styles.detailText}>{item.number_of_people} người</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="note-text" size={20} color="#7a5545" />
          <Text style={styles.detailText}>
            {item.note || "Không có ghi chú"}
          </Text>
        </View>
      </View>

      {item.status === "pending" && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.confirmButton]}
            onPress={() => handleUpdateStatus(item._id, "confirmed")}
          >
            <MaterialCommunityIcons name="check" size={20} color="white" />
            <Text style={styles.actionButtonText}>Xác nhận</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => handleUpdateStatus(item._id, "cancelled")}
          >
            <MaterialCommunityIcons name="close" size={20} color="white" />
            <Text style={styles.actionButtonText}>Từ chối</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderStatusFilter = () => (
    <View style={styles.filterContainer}>
      {["Pending", "Confirmed", "Cancelled"].map((status) => (
        <TouchableOpacity
          key={status}
          style={[
            styles.filterButton,
            selectedStatus === status && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedStatus(status)}
        >
          <Text
            style={[
              styles.filterButtonText,
              selectedStatus === status && styles.filterButtonTextActive,
            ]}
          >
            {getStatusText(status)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const filteredBookings = bookings.filter(
    (booking) => selectedStatus === "all" || booking.status === selectedStatus
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quản lý đặt chỗ</Text>
      </View>

      {renderStatusFilter()}

      <FlatList
        data={filteredBookings}
        renderItem={renderBookingCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="calendar-blank"
              size={48}
              color="#BFA58E"
            />
            <Text style={styles.emptyStateText}>
              Chưa có yêu cầu đặt chỗ nào
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fcedd6",
  },
  header: {
    padding: 16,
    backgroundColor: "#7a5545",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFF9F5",
  },
  filterContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#FFF9F5",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8D3C3",
  },
  filterButtonActive: {
    backgroundColor: "#7a5545",
    borderColor: "#7a5545",
  },
  filterButtonText: {
    color: "#7a5545",
    fontSize: 14,
    fontWeight: "500",
  },
  filterButtonTextActive: {
    color: "#FFF9F5",
  },
  listContainer: {
    padding: 16,
    gap: 16,
  },
  bookingCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    gap: 16,
    shadowColor: "#BFA58E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7a5545",
  },
  bookingId: {
    fontSize: 12,
    color: "#BFA58E",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  bookingDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#6B4F3F",
    flex: 1,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  confirmButton: {
    backgroundColor: "#10B981",
  },
  cancelButton: {
    backgroundColor: "#EF4444",
  },
  actionButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#BFA58E",
    textAlign: "center",
  },
});
