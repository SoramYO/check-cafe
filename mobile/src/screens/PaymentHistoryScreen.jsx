import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const MOCK_TRANSACTIONS = [
  {
    id: "1",
    type: "booking",
    amount: 150000,
    status: "completed",
    date: "2024-03-15T10:30:00",
    description: "Đặt chỗ tại The Coffee House",
    paymentMethod: "Ví MoMo",
  },
  {
    id: "2",
    type: "topup",
    amount: 500000,
    status: "completed",
    date: "2024-03-14T15:45:00",
    description: "Nạp tiền vào ví",
    paymentMethod: "Thẻ ngân hàng",
  },
  {
    id: "3",
    type: "booking",
    amount: 200000,
    status: "failed",
    date: "2024-03-13T09:15:00",
    description: "Đặt chỗ tại Highland Coffee",
    paymentMethod: "Ví điện tử",
  },
];

export default function PaymentHistoryScreen() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, completed, failed

  useEffect(() => {
    // Simulate API call
    setTransactions(MOCK_TRANSACTIONS);
    setLoading(false);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
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
      case "completed":
        return "Thành công";
      case "failed":
        return "Thất bại";
      case "pending":
        return "Đang xử lý";
      default:
        return status;
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case "booking":
        return "calendar-check";
      case "topup":
        return "wallet-plus";
      default:
        return "cash";
    }
  };

  const renderTransaction = ({ item }) => (
    <TouchableOpacity style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <View style={styles.transactionLeft}>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: item.type === "topup" ? "#DFF7E9" : "#FFF3E9",
              },
            ]}
          >
            <MaterialCommunityIcons
              name={getTransactionIcon(item.type)}
              size={20}
              color={item.type === "topup" ? "#10B981" : "#F97316"}
            />
          </View>
          <View>
            <Text style={styles.transactionTitle}>{item.description}</Text>
            <Text style={styles.transactionDate}>
              {format(new Date(item.date), "dd/MM/yyyy HH:mm", { locale: vi })}
            </Text>
          </View>
        </View>
        <View style={styles.transactionRight}>
          <Text
            style={[
              styles.transactionAmount,
              { color: item.type === "topup" ? "#10B981" : "#1E293B" },
            ]}
          >
            {item.type === "topup" ? "+" : "-"}
            {item.amount.toLocaleString()}đ
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${getStatusColor(item.status)}15` },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.status) },
              ]}
            >
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.transactionFooter}>
        <MaterialCommunityIcons name="credit-card" size={16} color="#64748B" />
        <Text style={styles.paymentMethod}>{item.paymentMethod}</Text>
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
      <Text style={styles.headerTitle}>Lịch sử giao dịch</Text>
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
          filter === "completed" && styles.activeFilter,
        ]}
        onPress={() => setFilter("completed")}
      >
        <Text
          style={[
            styles.filterText,
            filter === "completed" && styles.activeFilterText,
          ]}
        >
          Thành công
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.filterButton,
          filter === "failed" && styles.activeFilter,
        ]}
        onPress={() => setFilter("failed")}
      >
        <Text
          style={[
            styles.filterText,
            filter === "failed" && styles.activeFilterText,
          ]}
        >
          Thất bại
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
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="history" size={48} color="#CBD5E1" />
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
  transactionDate: {
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
