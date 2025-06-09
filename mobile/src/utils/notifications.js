import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notificationAPI from '../services/notificationAPI';
import userAPI from '../services/userAPI';

/**
 * Notification Token Management
 * 
 * This file handles Expo push notification tokens with the following strategy:
 * 1. Tokens are only saved to backend when user logs in (new device or new token)
 * 2. Local storage is used to track current token and avoid duplicate saves
 * 3. Tokens are cleared on logout
 * 
 * Usage:
 * - Login: useAuth().login() automatically registers and saves token
 * - Logout: useAuth().logout() automatically clears token
 * - Manual registration: Call registerAndSaveTokenForLogin() if needed
 */

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Register for push notifications
export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    
    token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig.extra.eas.projectId,
    });
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

// Register and save token only when needed (for login)
export async function registerAndSaveTokenForLogin() {
  try {
    const tokenData = await registerForPushNotificationsAsync();
    if (!tokenData?.data) {
      console.log('No push token received');
      return null;
    }

    const newToken = tokenData.data;
    
    // Check if we already have this token stored locally
    const storedToken = await AsyncStorage.getItem('expo_push_token');
    
    if (storedToken === newToken) {
      console.log('Token already saved, skipping save');
      return newToken;
    }

    // Save new token to backend
    await userAPI.HandleUser(
      '/save-expo-token',
      { expoPushToken: newToken },
      "post"
    );
    
    // Store token locally to avoid duplicate saves
    await AsyncStorage.setItem('expo_push_token', newToken);
    
    console.log('✅ New Expo token registered and saved successfully');
    return newToken;
  } catch (error) {
    console.error('❌ Failed to register and save token:', error);
    throw error;
  }
}

// Clear token on logout
export async function clearPushToken() {
  try {
    await AsyncStorage.removeItem('expo_push_token');
    console.log('Push token cleared from local storage');
  } catch (error) {
    console.error('Error clearing push token:', error);
  }
}

// API wrapper functions using the unified HandleNotification method
export const getNotifications = async (page = 1, limit = 20) => {
  return await notificationAPI.HandleNotification(`?page=${page}&limit=${limit}`, null, 'get');
};

export const markNotificationAsRead = async (notificationId) => {
  return await notificationAPI.HandleNotification(`/${notificationId}/read`, {}, 'patch');
};

export const markAllNotificationsAsRead = async () => {
  return await notificationAPI.HandleNotification('/mark-all-read', {}, 'patch');
};

export const getUnreadCount = async () => {
  return await notificationAPI.HandleNotification('/unread-count', null, 'get');
};

export const deleteNotification = async (notificationId) => {
  return await notificationAPI.HandleNotification(`/${notificationId}`, null, 'delete');
};

export const saveExpoToken = async (token) => {
  return await userAPI.HandleUser('/save-expo-token', { expoPushToken: token }, 'post');
};