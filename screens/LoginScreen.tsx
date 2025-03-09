import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { toast } from 'sonner-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();
  const [isGradientSupported, setIsGradientSupported] = useState(true);

  const handleLogin = () => {
    // if (!email || !password) {
    //   toast.error('Vui lòng nhập đầy đủ thông tin');
    //   return;
    // }  
    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // if (!emailRegex.test(email)) {
    //   toast.error('Email không hợp lệ');
    //   return;
    // }

    // // Basic password validation
    // if (password.length < 6) {
    //   toast.error('Mật khẩu phải có ít nhất 6 ký tự');
    //   return;
    // }

    // Add your login logic here
    toast.success('Đăng nhập thành công!');
    navigation.replace('MainApp');
  };
  const GradientContainer = ({ children }) => {
    if (!isGradientSupported) {
      return <View style={[styles.container, { backgroundColor: '#4A90E2' }]}>{children}</View>;
    }
    
    return (
      <LinearGradient
        colors={['#4A90E2', '#50E3C2']}
        style={styles.container}
        onError={() => setIsGradientSupported(false)}
      >
        {children}
      </LinearGradient>
    );
  };

  const renderContent = () => (
    <View style={styles.content}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="coffee" size={50} color="white" />
        <Text style={styles.title}>Đăng nhập</Text>
        <Text style={styles.subtitle}>Chào mừng bạn trở lại!</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="email" size={24} color="white" style={styles.icon} />
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
          <MaterialCommunityIcons name="lock" size={24} color="white" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <MaterialCommunityIcons 
              name={showPassword ? "eye-off" : "eye"} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Đăng nhập</Text>
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Chưa có tài khoản? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Đăng ký ngay</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );


  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {isGradientSupported ? (
        <LinearGradient
          colors={['#4A90E2', '#50E3C2']}
          style={styles.container}
          onError={() => setIsGradientSupported(false)}
        >
          {renderContent()}
        </LinearGradient>
      ) : (
        <View style={[styles.container, { backgroundColor: '#4A90E2' }]}>
          {renderContent()}
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  form: {
    gap: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: 'white',
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    color: 'white',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  loginButtonText: {
    color: '#4A90E2',
    fontSize: 18,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  registerLink: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});