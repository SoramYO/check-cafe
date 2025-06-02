import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Modal,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../hooks/useAuth";
import { toast } from "sonner-native";
import { useDispatch, useSelector } from "react-redux";
import { authSelector, setUser } from "../redux/reducers/authReducer";
import userAPI from "../services/userAPI";

const getMenuSections = (role) => {
  if (role === "STAFF") {
    return [
      {
        title: "Tài khoản",
        items: [
          {
            icon: "account-edit",
            label: "Chỉnh sửa thông tin",
            route: "EditProfile",
          },
          {
            icon: "qrcode-scan",
            label: "Quét mã QR",
            route: "ScanQR",
            color: "#7a5545",
          },
          {
            icon: "calendar-check",
            label: "Quản lý đặt chỗ",
            route: "Bookings",
            color: "#7a5545",
          },
        ],
      },
      {
        title: "Cài đặt",
        items: [
          { icon: "theme-light-dark", label: "Giao diện", route: "Theme" },
          {
            icon: "logout",
            label: "Đăng xuất",
            route: "Logout",
            color: "#EF4444",
          },
        ],
      },
    ];
  }

  return [
    {
      title: "Tài khoản",
      items: [
        {
          icon: "account-edit",
          label: "Chỉnh sửa thông tin",
          route: "EditProfile",
        },
        { icon: "ticket-percent", label: "Voucher của tôi", route: "Vouchers" },
        { icon: "heart-outline", label: "Yêu thích", route: "Favorites" },
        {
          icon: "history",
          label: "Lịch sử giao dịch",
          route: "PaymentHistory",
        },
        {
          icon: "map-marker-outline",
          label: "Địa điểm mặc định",
          route: "DefaultLocation",
        },
        {
          icon: "crown",
          label: "Nâng cấp Premium",
          route: "Premium",
          color: "#FFD700",
        },
      ],
    },
    {
      title: "Cài đặt",
      items: [
        { icon: "theme-light-dark", label: "Giao diện", route: "Theme" },
        {
          icon: "logout",
          label: "Đăng xuất",
          route: "Logout",
          color: "#EF4444",
        },
      ],
    },
  ];
};

export default function ProfileScreen() {
  const { logout } = useAuth();
  const { user } = useSelector(authSelector);
  const [userInfo, setUserInfo] = useState(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const menuSections = getMenuSections(user?.role);

  const navigation = useNavigation();
  const dispatch = useDispatch();

  const getUserInfo = async () => {
    const response = await userAPI.HandleUser("/profile");
    setUserInfo(response.data.user);
    dispatch(setUser(response.data.user));
  };

  useEffect(() => {
    getUserInfo();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Đăng xuất thành công");
      // Navigation will be handled automatically by AppRouters
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Có lỗi xảy ra khi đăng xuất");
    }
  };

  const renderMenuItem = (item) => (
    <TouchableOpacity
      key={item.label}
      style={styles.menuItem}
      onPress={() => {
        if (item.label === "Đăng xuất") {
          handleLogout();
        } else if (item.label === "Nâng cấp Premium") {
          navigation.navigate("Premium");
        } else if (item.label === "Ngôn ngữ") {
          navigation.navigate("Language");
        } else {
          navigation.navigate(item.route);
        }
      }}
    >
      <View style={styles.menuItemLeft}>
        <MaterialCommunityIcons
          name={item.icon}
          size={24}
          color={item.color || "#64748B"}
        />
        <Text
          style={[styles.menuItemLabel, item.color && { color: item.color }]}
        >
          {item.label}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Image
              source={{
                uri: user?.avatar || "https://via.placeholder.com/60",
              }}
              style={styles.avatar}
            />
            <View style={styles.userDetails}>
              <View style={styles.nameContainer}>
                <Text style={styles.userName}>{user?.full_name}</Text>
                {user?.role === "STAFF" && (
                  <View style={styles.staffBadge}>
                    <MaterialCommunityIcons
                      name="badge-account"
                      size={16}
                      color="#7a5545"
                    />
                    <Text style={styles.staffText}>Nhân viên</Text>
                  </View>
                )}
                {user?.role !== "STAFF" && userInfo?.vip_status && (
                  <View style={styles.premiumBadge}>
                    <MaterialCommunityIcons
                      name="crown"
                      size={16}
                      color="#FFD700"
                    />
                    <Text style={styles.premiumText}>Premium</Text>
                  </View>
                )}
              </View>
              <View style={styles.levelBadge}>
                <MaterialCommunityIcons
                  name={
                    user?.role === "STAFF" ? "shield-account" : "shield-star"
                  }
                  size={16}
                  color={user?.role === "STAFF" ? "#7a5545" : "#6366F1"}
                />
                <Text
                  style={[
                    styles.levelText,
                    user?.role === "STAFF" && styles.staffLevelText,
                  ]}
                >
                  {user?.role === "STAFF" ? "Nhân viên" : user?.role}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate("EditProfile")}
          >
            <MaterialCommunityIcons name="pencil" size={20} color="#7a5545" />
          </TouchableOpacity>
        </View>

        {/* Menu Sections */}
        {menuSections.map((section) => (
          <View key={section.title} style={styles.menuSection}>
            <Text style={styles.menuTitle}>{section.title}</Text>
            <View style={styles.menuItems}>
              {section.items.map(renderMenuItem)}
            </View>
          </View>
        ))}

        <Text style={styles.version}>Phiên bản 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: Platform.OS === "android" ? 40 : 0,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "white",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#7a5545",
  },
  userDetails: {
    gap: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
  },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    gap: 4,
  },
  levelText: {
    color: "#7a5545",
    fontSize: 14,
    fontWeight: "500",
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#fcedd6",
    marginTop: 1,
    padding: 20,
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#64748B",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#E2E8F0",
  },
  menuSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7a5545",
    marginBottom: 8,
  },
  menuItems: {
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#BFA58E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#fcedd6",
    borderBottomWidth: 0,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#fcedd6",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuItemLabel: {
    fontSize: 16,
    color: "#1E293B",
  },
  version: {
    textAlign: "center",
    color: "#7a5545",
    fontSize: 14,
    marginVertical: 24,
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  premiumText: {
    color: "#7a5545",
    fontSize: 12,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    maxHeight: "100%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1E293B",
  },
  packageContainer: {
    gap: 16,
  },
  packageCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  recommendedPackage: {
    borderColor: "#7a5545",
    borderWidth: 2,
  },
  recommendedBadge: {
    position: "absolute",
    top: -12,
    right: 16,
    backgroundColor: "#7a5545",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedText: {
    color: "#1E293B",
    fontSize: 12,
    fontWeight: "600",
  },
  packageHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  packageTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
  },
  packagePrice: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 12,
  },
  packageDescription: {
    fontSize: 14,
    color: "#7a5545",
    marginBottom: 16,
    lineHeight: 20,
  },
  upgradeButton: {
    backgroundColor: "#7a5545",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  recommendedButton: {
    backgroundColor: "#7a5545",
  },
  upgradeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  staffBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fcedd6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  staffText: {
    color: "#7a5545",
    fontSize: 12,
    fontWeight: "600",
  },
  staffLevelText: {
    color: "#7a5545",
  },
});
