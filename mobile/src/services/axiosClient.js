import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import queryString from "query-string";

// Thay đổi IP này thành IP của máy chủ của bạn
export const BASE_URL = "https://api.checkafe.online/api/v1"; // Thay x bằng số thích hợp

const getAccessToken = async () => {
  const res = await AsyncStorage.getItem("token");
  return res ? res : "";
};

// Variable to store logout handler - will be set by useAuth hook
let logoutHandler = null;

export const setLogoutHandler = (handler) => {
  logoutHandler = handler;
};

const axiosClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 seconds timeout
  paramsSerializer: (params) => queryString.stringify(params),
  headers: {
    Accept: "application/json",
  },
});

axiosClient.interceptors.request.use(async (config) => {
  try {
    const accessToken = await getAccessToken();
    
    // Nếu data là FormData, không set Content-Type để axios tự động xử lý
    if (config.data instanceof FormData) {
      config.headers = {
        ...config.headers,
        Authorization: accessToken ? `Bearer ${accessToken}` : "",
        // Xóa Content-Type để axios tự set cho FormData
      };
      delete config.headers['Content-Type'];
    } else {
      config.headers = {
        ...config.headers,
        Authorization: accessToken ? `Bearer ${accessToken}` : "",
        "Content-Type": "application/json",
      };
    }

    return config;
  } catch (error) {
    console.error("Request interceptor error:", error);
    return config;
  }
});

axiosClient.interceptors.response.use(
  (response) => {
    if (response.data && (response.status >= 200 && response.status < 300)) {
      return response.data;
    }
    throw new Error("Response error");
  },
  async (error) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      console.log("401 Unauthorized - Token expired or invalid");
      
      try {
        // Clear stored auth data
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("userData");
        await AsyncStorage.removeItem("analytics_session");
        await AsyncStorage.removeItem("expo_push_token");
        
        // Call logout handler if available (will trigger Redux state reset)
        if (logoutHandler) {
          logoutHandler();
        }
        
        console.log("Cleared auth data due to 401 error");
      } catch (clearError) {
        console.error("Error clearing auth data:", clearError);
      }
    }
    
    throw error;
  }
);

export default axiosClient;
