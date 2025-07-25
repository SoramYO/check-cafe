import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAnalytics } from '../utils/analytics';

export default function HomeScreen({ navigation }) {
  const { trackScreenView, trackTap } = useAnalytics();

  // Track screen view
  useEffect(() => {
    trackScreenView('Home_Welcome', {
      is_onboarding: true,
      timestamp: new Date().toISOString()
    });
  }, []);

  return (
    <ImageBackground
      source={{ uri: 'https://api.a0.dev/assets/image?text=beautiful+dalat+coffee+shop+with+mountain+view&aspect=9:16' }}
      style={styles.container}
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <MaterialCommunityIcons name="coffee" size={60} color="white" />
            <Text style={styles.title}>Check-in Đà Lạt</Text>
            <Text style={styles.subtitle}>Khám phá không gian cà phê tuyệt vời</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.loginButton]} 
              onPress={() => {
                trackTap('home_login_button');
                navigation.navigate('Login');
              }}
            >
              <Text style={styles.buttonText}>Đăng nhập</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.registerButton]}
              onPress={() => {
                trackTap('home_register_button');
                navigation.navigate('Register');
              }}
            >
              <Text style={[styles.buttonText, styles.registerText]}>Đăng ký</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
    paddingTop: 100,
    paddingBottom: 50,
  },
  header: {
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 10,
  },
  buttonContainer: {
    gap: 15,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  loginButton: {
    backgroundColor: '#FF6B6B',
  },
  registerButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'white',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  registerText: {
    color: 'white',
  },
});