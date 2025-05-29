import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { formatDateTime } from "../../utils/formatHelpers";
import { toast } from "sonner-native";
import reservationAPI from "../../services/reservationAPI";
import shopAPI from "../../services/shopAPI";
import { useShop } from "../../context/ShopContext";

const { width } = Dimensions.get("window");
const CARD_PADDING = 16;
const CARD_MARGIN = 8;
const CARD_WIDTH = width - CARD_PADDING * 2;

const BOOKING_STATUSES = [
  {
    key: "Pending",
    label: "Chờ xác nhận",
    icon: "clock-outline",
    color: "#F59E0B",
  },
  {
    key: "Confirmed",
    label: "Đã xác nhận",
    icon: "check-circle-outline",
    color: "#3B82F6",
  },
  {
    key: "Completed",
    label: "Đã hoàn tất",
    icon: "check-circle",
    color: "#10B981",
  },
  {
    key: "Cancelled",
    label: "Đã hủy",
    icon: "close-circle",
    color: "#EF4444",
  },
];

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
      const action = newStatus === "Confirmed" ? "confirm" : "cancel";
      const response = await reservationAPI.HandleReservation(
        `/${bookingId}/${action}`,
        {},
        "patch"
      );
      if (response.status === 200) {
        toast.success("Cập nhật trạng thái thành công");
        onRefresh();
      }
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái");
    }
  };

  const getStatusInfo = (status) => {
    return (
      BOOKING_STATUSES.find((s) => s.key === status) || BOOKING_STATUSES[0]
    );
  };

  const renderBookingCard = ({ item }) => {
    const statusInfo = getStatusInfo(item.status);
    return (
      <View style={styles.bookingCard}>
        <View style={styles.bookingHeader}>
          <View style={styles.userInfo}>
            <Image
              source={{
                uri: item?.user_id?.avatar,
              }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.userName}>{item.user_id?.full_name}</Text>
              <Text style={styles.bookingId}>#{item._id.slice(-6)}</Text>
            </View>
          </View>
          <View
            style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}
          >
            <MaterialCommunityIcons
              name={statusInfo.icon}
              size={16}
              color="white"
              style={styles.statusIcon}
            />
            <Text style={styles.statusText}>{statusInfo.label}</Text>
          </View>
        </View>

        <View style={styles.bookingDetails}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons
              name="calendar-clock"
              size={20}
              color="#7a5545"
            />
            <Text style={styles.detailText}>
              {formatDateTime(item.reservation_date)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons
              name="table-furniture"
              size={20}
              color="#7a5545"
            />
            <Text style={styles.detailText}>
              Bàn {item.seat_id?.seat_name || "N/A"}
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

          {item.notes && (
            <View style={styles.detailRow}>
              <MaterialCommunityIcons
                name="note-text"
                size={20}
                color="#7a5545"
              />
              <Text style={styles.detailText}>{item.notes}</Text>
            </View>
          )}
        </View>

        {item.status === "Pending" && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.confirmButton]}
              onPress={() => handleUpdateStatus(item._id, "Confirmed")}
            >
              <MaterialCommunityIcons name="check" size={20} color="white" />
              <Text style={styles.actionButtonText}>Xác nhận</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleUpdateStatus(item._id, "Cancelled")}
            >
              <MaterialCommunityIcons name="close" size={20} color="white" />
              <Text style={styles.actionButtonText}>Từ chối</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderStatusFilter = () => (
    <View style={styles.filterContainer}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={BOOKING_STATUSES}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedStatus === item.key && styles.filterButtonActive,
              {
                backgroundColor:
                  selectedStatus === item.key ? item.color : "#FFF9F5",
              },
            ]}
            onPress={() => setSelectedStatus(item.key)}
          >
            <MaterialCommunityIcons
              name={item.icon}
              size={20}
              color={selectedStatus === item.key ? "#FFFFFF" : item.color}
            />
            <Text
              style={[
                styles.filterButtonText,
                selectedStatus === item.key && styles.filterButtonTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.filterList}
      />
    </View>
  );

  const filteredBookings = bookings.filter(
    (booking) => booking.status === selectedStatus
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quản lý đặt chỗ</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {bookings.filter((b) => b.status === "Pending").length}
            </Text>
            <Text style={styles.statLabel}>Chờ xác nhận</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {bookings.filter((b) => b.status === "Confirmed").length}
            </Text>
            <Text style={styles.statLabel}>Hôm nay</Text>
          </View>
        </View>
      </View>

      {renderStatusFilter()}

      <FlatList
        data={filteredBookings}
        renderItem={renderBookingCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#7a5545"]}
            tintColor="#7a5545"
          />
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
    backgroundColor: "#f8f9fa",
  },
  header: {
    padding: 20,
    backgroundColor: "#7a5545",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFF9F5",
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFF9F5",
  },
  statLabel: {
    fontSize: 14,
    color: "#FFF9F5",
    opacity: 0.8,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#FFF9F5",
    opacity: 0.2,
  },
  filterContainer: {
    marginTop: -10,
    zIndex: 1,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 4,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E8D3C3",
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7a5545",
  },
  filterButtonTextActive: {
    color: "#FFFFFF",
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  bookingCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: CARD_PADDING,
    width: CARD_WIDTH,
    marginHorizontal: CARD_MARGIN,
    marginBottom: 12,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E8D3C3",
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
    backgroundColor: "#f1f5f9",
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  bookingId: {
    fontSize: 12,
    color: "#6b7280",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  bookingDetails: {
    gap: 12,
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailText: {
    fontSize: 14,
    color: "#4b5563",
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
    borderRadius: 12,
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
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 16,
    backgroundColor: "white",
    margin: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
});
