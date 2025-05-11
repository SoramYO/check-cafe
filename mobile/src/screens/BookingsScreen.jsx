import React, { useState } from "react";
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
  const [activeTab, setActiveTab] = useState("upcoming");
  const filteredBookings = MOCK_BOOKINGS.filter(
    (booking) => booking.status === activeTab
  );

  const renderBookingCard = ({ item }) => (
    <View style={styles.bookingCard}>
      <Image source={{ uri: item.image }} style={styles.cafeImage} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cafeName}>{item.cafeName}</Text>
          <TouchableOpacity style={styles.moreButton}>
            <MaterialCommunityIcons
              name="dots-horizontal"
              size={24}
              color="#64748B"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="calendar" size={20} color="#64748B" />
            <Text style={styles.detailText}>
              {new Date(item.date).toLocaleDateString("vi-VN")}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={20}
              color="#64748B"
            />
            <Text style={styles.detailText}>{item.time}</Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons
              name="account-group"
              size={20}
              color="#64748B"
            />
            <Text style={styles.detailText}>{item.guests} người</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          {activeTab === "upcoming" ? (
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
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Đặt chỗ của tôi</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "upcoming" && styles.activeTab]}
          onPress={() => setActiveTab("upcoming")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "upcoming" && styles.activeTabText,
            ]}
          >
            Sắp tới
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "completed" && styles.activeTab]}
          onPress={() => setActiveTab("completed")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "completed" && styles.activeTabText,
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
          keyExtractor={(item) => item.id}
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
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cafeImage: {
    width: "100%",
    height: 160,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cafeName: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    color: "#1E293B",
  },
  moreButton: {
    padding: 4,
  },
  detailsContainer: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#64748B",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
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
