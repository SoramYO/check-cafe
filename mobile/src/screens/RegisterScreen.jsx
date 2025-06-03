import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../hooks/useAuth";
import authenticationAPI from "../services/authAPI";
import { Toast } from "react-native-toast-message/lib/src/Toast";

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const validateForm = () => {
    // Kiểm tra các trường bắt buộc
    if (!name.trim()) {
      Toast.show({
        type: "error",
        text1: "Vui lòng nhập họ và tên",
      });
      return false;
    }
    
    if (!email.trim()) {
      Toast.show({
        type: "error",
        text1: "Vui lòng nhập email",
      });
      return false;
    }
    
    if (!phone.trim()) {
      Toast.show({
        type: "error",
        text1: "Vui lòng nhập số điện thoại",
      });
      return false;
    }
    
    if (!password) {
      Toast.show({
        type: "error",
        text1: "Vui lòng nhập mật khẩu",
      });
      return false;
    }
    
    if (!confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Vui lòng xác nhận mật khẩu",
      });
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Toast.show({
        type: "error",
        text1: "Email không hợp lệ",
      });
      return false;
    }

    // Validate phone format (Vietnamese phone numbers)
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!phoneRegex.test(phone)) {
      Toast.show({
        type: "error",
        text1: "Số điện thoại không hợp lệ",
      });
      return false;
    }


    // Validate password confirmation
    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Mật khẩu xác nhận không khớp",
      });
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      
      const response = await authenticationAPI.HandleAuthentication(
        "/sign-up",
        { full_name: name, email, password, phone },
        "post"
      );
      

      // Kiểm tra response structure
      if (response?.status === 201 || response?.code === "201") {
        // Đăng ký thành công, tự động đăng nhập
        const tokens = response.data?.tokens || response.metadata?.tokens;
        const user = response.data?.user || response.metadata?.user;
        
        if (tokens?.accessToken && user) {
          await login(tokens.accessToken, user);
          Toast.show({
            type: "success",
            text1: "Đăng ký thành công!",
          });
          // Navigation sẽ được xử lý tự động bởi AppRouters
        } else {
          Toast.show({
            type: "error",
            text1: "Đăng ký thành công nhưng có lỗi đăng nhập",
          });
        }
      } else {
        // Xử lý lỗi từ server
        const errorMessage = response?.message || response?.error || "Đăng ký thất bại";
        Toast.show({
          type: "error",
          text1: errorMessage,
        });
      }
    } catch (error) {

      let errorMessage = "Có lỗi xảy ra khi đăng ký";
      
      if (error.response) {
        const serverError = error.response.data;
        errorMessage = serverError?.message || serverError?.error || `Lỗi server: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = "Lỗi kết nối mạng. Vui lòng kiểm tra internet";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Image
              source={require("../../assets/logo.png")}
              style={styles.logo}
            />
            <Text style={styles.title}>Đăng ký</Text>
            <Text style={styles.subtitle}>Tạo tài khoản mới</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons
                name="account"
                size={24}
                color="#6b4544"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Họ và tên"
                placeholderTextColor="#6b4544"
                value={name}
                onChangeText={setName}
                editable={!isLoading}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialCommunityIcons
                name="email"
                size={24}
                color="#6b4544"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#6b4544"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialCommunityIcons
                name="phone"
                size={24}
                color="#6b4544"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Số điện thoại (VD: 0901234567)"
                placeholderTextColor="#6b4544"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                editable={!isLoading}
                maxLength={10}
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialCommunityIcons
                name="lock"
                size={24}
                color="#6b4544"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Mật khẩu (tối thiểu 6 ký tự)"
                placeholderTextColor="#6b4544"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!isLoading}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                <MaterialCommunityIcons
                  name={showPassword ? "eye-off" : "eye"}
                  size={24}
                  color="#6b4544"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <MaterialCommunityIcons
                name="lock-check"
                size={24}
                color="#6b4544"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Xác nhận mật khẩu"
                placeholderTextColor="#6b4544"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                editable={!isLoading}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                <MaterialCommunityIcons
                  name={showConfirmPassword ? "eye-off" : "eye"}
                  size={24}
                  color="#6b4544"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.registerButton,
                isLoading && styles.registerButtonDisabled,
              ]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#6b4544" />
              ) : (
                <Text style={styles.registerButtonText}>Đăng ký</Text>
              )}
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Đã có tài khoản? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginLink}>Đăng nhập</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
  },
  logo: {
    width: 150,
    height: 150,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#745745",
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(0,0,0,0.8)",
    marginTop: 5,
  },
  form: {
    gap: 15,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#6b4544",
    fontSize: 16,
  },
  registerButton: {
    backgroundColor: "#745745",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  registerButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  loginText: {
    color: "rgba(0,0,0,0.8)",
    fontSize: 16,
  },
  loginLink: {
    color: "#745745",
    fontSize: 16,
    fontWeight: "bold",
  },
});
