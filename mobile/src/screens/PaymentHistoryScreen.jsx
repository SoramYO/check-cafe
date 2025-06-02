import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import paymentAPI from "../services/paymentAPI";

export default function PaymentHistoryScreen({ navigation }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // all, success, pending

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await paymentAPI.HandlePayment("/me");
      setTransactions(res.data.data);
    } catch (error) {
      console.error("Error fetching payment history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "#10B981";
      case "failed":
        return "#EF4444";
      case "pending":
        return "#F59E0B";
      default:
        return "#64748B";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "success":
        return "Thành công";
      case "failed":
        return "Thất bại";
      case "pending":
        return "Đang xử lý";
      default:
        return status;
    }
  };

  const renderTransaction = ({ item }) => (
    <TouchableOpacity style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <View style={styles.transactionLeft}>
          <View style={[styles.iconContainer, { backgroundColor: "#FFF3E9" }]}>
            <MaterialCommunityIcons
              name="package-variant"
              size={20}
              color="#F97316"
            />
          </View>
          <View>
            <Text style={styles.transactionTitle}>
              {item?.package_id?.name}
            </Text>
            <Text style={styles.packageDuration}>
              Thời hạn: {item?.package_id?.duration} ngày
            </Text>
          </View>
        </View>
        <View style={styles.transactionRight}>
          <Text style={styles.transactionAmount}>
            {item?.amount?.toLocaleString()}đ
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${getStatusColor(item?.status)}15` },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item?.status) },
              ]}
            >
              {getStatusText(item?.status)}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.transactionFooter}>
        <MaterialCommunityIcons name="barcode" size={16} color="#64748B" />
        <Text style={styles.paymentMethod}>Mã đơn: {item?.orderCode}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color="#1E293B" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Lịch sử thanh toán gói</Text>
      <View style={styles.placeholder} />
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={[styles.filterButton, filter === "all" && styles.activeFilter]}
        onPress={() => setFilter("all")}
      >
        <Text
          style={[
            styles.filterText,
            filter === "all" && styles.activeFilterText,
          ]}
        >
          Tất cả
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.filterButton,
          filter === "success" && styles.activeFilter,
        ]}
        onPress={() => setFilter("success")}
      >
        <Text
          style={[
            styles.filterText,
            filter === "success" && styles.activeFilterText,
          ]}
        >
          Thành công
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.filterButton,
          filter === "pending" && styles.activeFilter,
        ]}
        onPress={() => setFilter("pending")}
      >
        <Text
          style={[
            styles.filterText,
            filter === "pending" && styles.activeFilterText,
          ]}
        >
          Đang xử lý
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7a5545" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderFilters()}
      <FlatList
        data={transactions.filter(
          (t) => filter === "all" || t.status === filter
        )}
        renderItem={renderTransaction}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="package-variant"
              size={48}
              color="#CBD5E1"
            />
            <Text style={styles.emptyText}>Chưa có giao dịch nào</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: Platform.OS === "android" ? 40 : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  activeFilter: {
    backgroundColor: "#7a5545",
    borderColor: "#7a5545",
  },
  filterText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  activeFilterText: {
    color: "white",
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  transactionCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#BFA58E",
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1E293B",
    marginBottom: 4,
  },
  packageDuration: {
    fontSize: 13,
    color: "#64748B",
  },
  transactionRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  transactionFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  paymentMethod: {
    fontSize: 13,
    color: "#64748B",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
    gap: 8,
  },
  emptyText: {
    fontSize: 15,
    color: "#94A3B8",
    fontWeight: "500",
  },
});
