import AsyncStorage from "@react-native-async-storage/async-storage";
import { addAuth, removeAuth } from "../redux/reducers/authReducer";
import { useDispatch } from "react-redux";

export const useAuth = () => {
  const dispatch = useDispatch();

  const login = async (token, user) => {
    try {
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("userData", JSON.stringify(user));
      dispatch(addAuth({ token, user }));
    } catch (error) {
      console.error("Error during login:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("userData");
      dispatch(removeAuth());
    } catch (error) {
      console.error("Error during logout:", error);
      throw error;
    }
  };

  return {
    login,
    logout,
  };
};
