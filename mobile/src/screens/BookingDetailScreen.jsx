import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import { useNavigation } from "@react-navigation/native";

export default function BookingDetailScreen({ route }) {
  const { booking } = route.params;
  const navigation = useNavigation();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* Header with back button */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <MaterialCommunityIcons name="arrow-left" size={26} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đặt chỗ</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Shop Image */}
        <Image
          source={{ uri: booking.shop_id?.shopImages[0]?.url }}
          style={styles.image}
        />
        <View style={styles.card}>
          {/* Shop Name & Address */}
          <Text style={styles.title}>{booking.shop_id?.name}</Text>
          <View style={styles.row}>
            <MaterialCommunityIcons
              name="map-marker"
              size={20}
              color="#4A90E2"
            />
            <Text style={styles.address}>{booking.shop_id?.address}</Text>
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
                {new Date(booking.reservation_date).toLocaleDateString("vi-VN")}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={20}
                color="#64748B"
              />
              <Text style={styles.infoText}>
                {booking.time_slot_id?.start_time} -{" "}
                {booking.time_slot_id?.end_time}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="account-group"
                size={20}
                color="#64748B"
              />
              <Text style={styles.infoText}>
                {booking.number_of_people} người
              </Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="table-chair"
                size={20}
                color="#64748B"
              />
              <Text style={styles.infoText}>{booking.seat_id?.seat_name}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="note-text"
                size={20}
                color="#64748B"
              />
              <Text style={styles.infoText}>{booking.notes || "Không có"}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="check-circle"
                size={20}
                color={
                  booking.status === "Pending"
                    ? "#F59E0B"
                    : booking.status === "Confirmed"
                    ? "#10B981"
                    : "#6366F1"
                }
              />
              <Text
                style={[
                  styles.infoText,
                  {
                    color:
                      booking.status === "Pending"
                        ? "#F59E0B"
                        : booking.status === "Confirmed"
                        ? "#10B981"
                        : "#6366F1",
                  },
                ]}
              >
                {booking.status === "Pending"
                  ? "Chờ xác nhận"
                  : booking.status === "Confirmed"
                  ? "Đã xác nhận"
                  : "Đã hoàn thành"}
              </Text>
            </View>
          </View>

          {/* QR Code Section */}
          {booking?.qr_code && booking?.status === "Confirmed" && (
            <View style={styles.qrSection}>
              <Text style={styles.sectionTitle}>Mã QR Check-in</Text>
              <View style={styles.qrContainer}>
                <Image source={{ uri: booking?.qr_code }} style={styles.qrImage} />
              </View>
              <Text style={styles.qrHint}>
                Vui lòng xuất trình mã này khi đến quán để xác nhận đặt chỗ.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 8,
    backgroundColor: "#F8FAFC",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    elevation: 2,
    zIndex: 10,
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
  container: { flex: 1, backgroundColor: "#F8FAFC" },
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
    color: "#4A90E2",
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
});
