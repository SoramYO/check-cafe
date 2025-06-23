import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { toast } from "sonner-native";
import { useAuth } from "../hooks/useAuth";
import authenticationAPI from "../services/authAPI";
import { useAnalytics } from "../utils/analytics";
import Toast from "react-native-toast-message";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { trackScreenView, trackTap, trackAppEvent, isAuthenticated } = useAnalytics();

  // Note: Login screen analytics are handled differently since users are not authenticated yet
  // We'll only track login attempts and results, not screen views

  const handleLogin = async () => {
    // Track login attempt
    trackAppEvent('login_attempt', {
      email: email ? 'provided' : 'empty',
      password: password ? 'provided' : 'empty'
    });

    if (!email || !password) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      trackAppEvent('login_validation_failed', {
        reason: 'missing_fields',
        email_empty: !email,
        password_empty: !password
      });
      return;
    }

    try {
      setIsLoading(true);
      trackAppEvent('login_api_call_started', { email_domain: email.split('@')[1] });
      
      const response = await authenticationAPI.HandleAuthentication(
        "/sign-in",
        { email, password },
        "post"
      );
      
      if (response.status === 200) {
        await login(response.data.tokens.accessToken, response.data.user);
        Toast.show({
          type: "success",
          text1: "Đăng nhập thành công",
        });
        
        // Track successful login
        trackAppEvent('login_success', {
          user_id: response.data.user.id,
          email_domain: email.split('@')[1],
          login_method: 'email_password'
        });
        
        // Navigation is handled automatically by AppRouters
      } else {
        Toast.show({
          type: "error",
          text1: response.message || "Đăng nhập thất bại",
        });
        trackAppEvent('login_failed', {
          error_message: response.message,
          status_code: response.status
        });
      }
    } catch (error) {
      const message = error.response.data.message;
      Toast.show({
        type: "error",
        text1: message || "Có lỗi xảy ra khi đăng nhập",
      });
      trackAppEvent('login_error', {
        error_message: error.message,
        error_type: error.name
      });
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
            <Image source={require("../../assets/logo.png")} style={styles.logo} />
            <Text style={styles.title}>Đăng nhập</Text>
            <Text style={styles.subtitle}>Chào mừng bạn trở lại!</Text>
          </View>

          <View style={styles.form}>
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
                name="lock"
                size={24}
                color="#6b4544"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Mật khẩu"
                placeholderTextColor="#6b4544"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!isLoading}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity 
                onPress={() => {
                  setShowPassword(!showPassword);
                  trackTap('password_visibility_toggle', {
                    action: showPassword ? 'hide' : 'show'
                  });
                }}
                disabled={isLoading}
              >
                <MaterialCommunityIcons
                  name={showPassword ? "eye-off" : "eye"}
                  size={24}
                  color="#6b4544"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.forgotPassword}
              onPress={() => {
                trackTap('forgot_password_link');
                // Add navigation to forgot password screen when implemented
              }}
            >
              <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#f1f1f1" />
              ) : (
                <Text style={styles.loginButtonText}>Đăng nhập</Text>
              )}
            </TouchableOpacity>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Chưa có tài khoản? </Text>
              <TouchableOpacity onPress={() => {
                trackTap('register_link');
                navigation.navigate("Register");
              }}>
                <Text style={styles.registerLink}>Đăng ký ngay</Text>
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
  forgotPassword: {
    alignSelf: "flex-end",
  },
  forgotPasswordText: {
    color: "#745745",
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: "#745745",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  loginButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  registerText: {
    color: "rgba(0,0,0,0.8)",
    fontSize: 16,
  },
  registerLink: {
    color: "#745745",
    fontSize: 16,
    fontWeight: "bold",
  },
});
