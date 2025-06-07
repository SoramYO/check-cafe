import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import queryString from "query-string";

// Thay đổi IP này thành IP của máy chủ của bạn
export const BASE_URL = "https://api.petlove.io.vn/api/v1"; // Thay x bằng số thích hợp
const getAccessToken = async () => {
  const res = await AsyncStorage.getItem("token");
  return res ? res : "";
};

const axiosClient = axios.create({
  baseURL: BASE_URL,
  paramsSerializer: (params) => queryString.stringify(params),
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

axiosClient.interceptors.request.use(async (config) => {
  try {
    const accessToken = await getAccessToken();
    config.headers = {
      ...config.headers,
      Authorization: accessToken ? `Bearer ${accessToken}` : "",
    };

    return config;
  } catch (error) {
    console.error("Request interceptor error:", error);
    return config;
  }
});

axiosClient.interceptors.response.use(
  (response) => {
    if (response.data && response.status === 200) {
      return response.data;
    }
    throw new Error("Error");
  },
  (error) => {
    throw error;
  }
);

export default axiosClient;
