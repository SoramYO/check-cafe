import React from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function CheckinSuccessScreen({ navigation, route }) {
  const { checkinData } = route.params;

  const formatTime = (timeString) => {
    return timeString || "N/A";
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#7a5545" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Check-in thành công</Text>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.content}>
        <View style={styles.successIcon}>
          <MaterialCommunityIcons
            name="check-circle"
            size={80}
            color="green"
          />
        </View>

        <Text style={styles.successTitle}>Check-in thành công!</Text>
        <Text style={styles.successMessage}>
          Khách hàng đã check-in thành công vào bàn
        </Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="account" size={24} color="#7a5545" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Khách hàng</Text>
              <Text style={styles.infoValue}>
                {checkinData?.reservation?.user_id?.full_name || "N/A"}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="table-furniture"
              size={24}
              color="#7a5545"
            />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Bàn số</Text>
              <Text style={styles.infoValue}>
                {checkinData?.reservation?.seat_id?.seat_name || "N/A"}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={24}
              color="#7a5545"
            />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Thời gian</Text>
              <Text style={styles.infoValue}>
                {formatTime(checkinData?.reservation?.time_slot_id?.start_time)} -{" "}
                {formatTime(checkinData?.reservation?.time_slot_id?.end_time)}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="account-group"
              size={24}
              color="#7a5545"
            />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Số người</Text>
              <Text style={styles.infoValue}>
                {checkinData?.reservation?.number_of_people || "N/A"}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("ScanQR")}
        >
          <MaterialCommunityIcons
            name="qrcode-scan"
            size={24}
            color="#FFFFFF"
          />
          <Text style={styles.buttonText}>Quét mã QR khác</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f1f1",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 20 : 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#7a5545",
  },
  content: {
    flex: 1,
    alignItems: "center",
    padding: 20,
  },
  successIcon: {
    marginTop: 40,
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#7a5545",
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    color: "#94A3B8",
    marginBottom: 32,
    textAlign: "center",
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: "#94A3B8",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: "#7a5545",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 4,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7a5545",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 32,
    gap: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
