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
import { toast } from "sonner-native";
import { useAuth } from "../hooks/useAuth";
import authenticationAPI from "../services/authAPI";

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
    if (!name || !email || !phone || !password || !confirmPassword) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Mật khẩu không khớp");
      return false;
    }
    // Có thể thêm các validation khác ở đây
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const response = await authenticationAPI.HandleAuthentication(
        "/sign-up",
        {full_name: name, email, password, phone},
        "post"
      );

      if (response.code === "201") {
        // Đăng ký thành công, tự động đăng nhập
        await login(
          response.metadata.tokens.accessToken,
          response.metadata.user
        );

        toast.success("Đăng ký thành công!");
        navigation.replace("MainApp");
      } else {
        toast.error(response.message || "Đăng ký thất bại");
      }
    } catch (error) {
      console.error("Register error:", error);
      toast.error(error.message || "Có lỗi xảy ra khi đăng ký");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <LinearGradient colors={["#6B4F3F", "#BFA58E"]} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Image source={require("../../assets/logo.png")} style={styles.logo} />
              <Text style={styles.title}>Đăng ký</Text>
              <Text style={styles.subtitle}>Tạo tài khoản mới</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                  name="account"
                  size={24}
                  color="white"
                  style={styles.icon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Họ và tên"
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                  name="email"
                  size={24}
                  color="white"
                  style={styles.icon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                  name="phone"
                  size={24}
                  color="white"
                  style={styles.icon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Số điện thoại"
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                  name="lock"
                  size={24}
                  color="white"
                  style={styles.icon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Mật khẩu"
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <MaterialCommunityIcons
                    name={showPassword ? "eye-off" : "eye"}
                    size={24}
                    color="white"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                  name="lock-check"
                  size={24}
                  color="white"
                  style={styles.icon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Xác nhận mật khẩu"
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <MaterialCommunityIcons
                    name={showConfirmPassword ? "eye-off" : "eye"}
                    size={24}
                    color="white"
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
                  <ActivityIndicator color="white" />
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
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    color: "white",
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    marginTop: 5,
  },
  form: {
    gap: 15,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(107, 79, 63, 0.2)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "white",
    fontSize: 16,
  },
  registerButton: {
    backgroundColor: "#FFF9F5",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  registerButtonText: {
    color: "#6B4F3F",
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
    color: "rgba(255,255,255,0.8)",
    fontSize: 16,
  },
  loginLink: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
