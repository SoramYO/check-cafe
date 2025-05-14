import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  SafeAreaView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import reservationAPI from "../services/reservationAPI";
import { useNavigation } from "@react-navigation/native";

// Mock data for bookings
const MOCK_BOOKINGS = [
  {
    id: "1",
    cafeName: "The Dreamer Coffee",
    date: "2024-03-15",
    time: "14:30",
    guests: 2,
    status: "upcoming",
    image:
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2947&auto=format&fit=crop",
  },
  {
    id: "2",
    cafeName: "Mountain View Café",
    date: "2024-03-20",
    time: "10:00",
    guests: 4,
    status: "upcoming",
    image:
      "https://images.unsplash.com/photo-1493857671505-72967e2e2760?q=80&w=2940&auto=format&fit=crop",
  },
  {
    id: "3",
    cafeName: "Horizon Coffee",
    date: "2024-02-28",
    time: "16:00",
    guests: 2,
    status: "completed",
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2940&auto=format&fit=crop",
  },
];

export default function BookingsScreen() {
  const [activeTab, setActiveTab] = useState("Pending");
  const [reservations, setReservations] = useState([]);
  const filteredBookings = reservations.filter(
    (booking) => booking.status === activeTab
  );
  const navigation = useNavigation();

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await reservationAPI.HandleReservation("/me");
        setReservations(response.data.reservations);
      } catch (error) {
        console.error("Error fetching reservations:", error);
      }
    };

    fetchReservations();
  }, []);

  const renderBookingCard = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("BookingDetail", { booking: item })}
      style={styles.bookingCard}
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
          {activeTab === "Pending" || activeTab === "Confirmed" ? (
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
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
            >
              <Text style={styles.primaryButtonText}>Đặt lại</Text>
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
          renderItem={renderBookingCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    padding: 20,
    backgroundColor: "white",
  },
  title: {
    fontSize: 24,
    fontFamily: "Poppins_600SemiBold",
    color: "#1E293B",
  },
  tabContainer: {
    flexDirection: "row",
    padding: 4,
    marginHorizontal: 20,
    marginVertical: 10,
    backgroundColor: "#E2E8F0",
    borderRadius: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: "white",
  },
  tabText: {
    fontFamily: "Poppins_500Medium",
    color: "#64748B",
    fontSize: 14,
  },
  activeTabText: {
    color: "#1E293B",
  },
  listContainer: {
    padding: 20,
    gap: 16,
  },
  bookingCard: {
    backgroundColor: "white",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
    borderColor: "#E2E8F0",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
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
    height: 180,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  cardContent: {
    padding: 16,
    backgroundColor: "white",
  },
  cafeName: {
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
    color: "#1E293B",
    marginBottom: 12,
  },
  detailsContainer: {
    gap: 12,
    marginBottom: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E2E8F0",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  detailText: {
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    color: "#64748B",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#FEE2E2",
  },
  cancelButtonText: {
    color: "#EF4444",
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: "#4A90E2",
  },
  primaryButtonText: {
    color: "white",
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
  },
  moreButton: {
    padding: 4,
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
    color: "#94A3B8",
  },
});
