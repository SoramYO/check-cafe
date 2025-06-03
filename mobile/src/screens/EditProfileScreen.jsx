import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { authSelector } from "../redux/reducers/authReducer";
import { useSelector, useDispatch } from "react-redux";
import userAPI from "../services/userAPI";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { updateUser } from "../hooks/useAuth";

export default function EditProfileScreen({ navigation }) {
  const { user } = useSelector(authSelector);
  const { setItem: setUserData } = useAsyncStorage("userData");

  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState(user);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await userAPI.HandleUser(
        "/profile",
        {
          full_name: userInfo.full_name,
          phone: userInfo.phone,
        },
        "PATCH"
      );
      if (response.status === 200) {
        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: "Cập nhật thông tin thành công",
        });
        await updateUser(response.data.user);
        setUserInfo(response.data.user);
        await setUserData(JSON.stringify(response.data.user));
        setIsEditing(false);
      } else {
        Toast.show({
          type: "error",
          text1: "Thất bại",
          text2: "Cập nhật thông tin thất bại",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Có lỗi xảy ra khi cập nhật thông tin",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>Chỉnh sửa thông tin</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setIsEditing(!isEditing)}
          disabled={isSaving}
        >
          <MaterialCommunityIcons
            name={isEditing ? "content-save" : "pencil"}
            size={24}
            color={isSaving ? "#94A3B8" : "#7a5545"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.avatarSection}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <TouchableOpacity style={styles.changeAvatarButton}>
            <MaterialCommunityIcons name="camera" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View
              style={[styles.inputContainer, { backgroundColor: "#f3f4f6" }]}
            >
              <MaterialCommunityIcons name="email" size={24} color="#7a5545" />
              <TextInput
                style={styles.input}
                value={userInfo.email}
                editable={false}
                keyboardType="email-address"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Họ và tên</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons
                name="account"
                size={24}
                color="#7a5545"
              />
              <TextInput
                style={styles.input}
                value={userInfo.full_name}
                onChangeText={(text) =>
                  setUserInfo({ ...userInfo, full_name: text })
                }
                editable={isEditing && !isSaving}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số điện thoại</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="phone" size={24} color="#7a5545" />
              <TextInput
                style={styles.input}
                value={userInfo.phone}
                onChangeText={(text) =>
                  setUserInfo({ ...userInfo, phone: text })
                }
                editable={isEditing && !isSaving}
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>

        {isEditing && (
          <TouchableOpacity 
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <View style={styles.saveButtonLoading}>
                <ActivityIndicator size="small" color="white" />
                <Text style={styles.saveButtonText}>Đang lưu...</Text>
              </View>
            ) : (
              <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingTop: Platform.OS === "android" ? 40 : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1E293B",
  },
  editButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  avatarSection: {
    alignItems: "center",
    marginVertical: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#7a5545",
  },
  changeAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: "35%",
    backgroundColor: "#7a5545",
    padding: 8,
    borderRadius: 20,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1E293B",
  },
  saveButton: {
    backgroundColor: "#7a5545",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 32,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButtonLoading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
});
