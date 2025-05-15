import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { setThemeMode, themeSelector } from "../redux/reducers/themeReducer";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useColorScheme } from "react-native";

const THEME_OPTIONS = [
  { key: "light", label: "Sáng", icon: "white-balance-sunny" },
  { key: "dark", label: "Tối", icon: "weather-night" },
  { key: "system", label: "Theo hệ thống", icon: "cellphone-cog" },
];

export default function ThemeScreen() {
  const dispatch = useDispatch();
  const { mode } = useSelector(themeSelector);
  const systemScheme = useColorScheme();

  const getActiveTheme = () => {
    if (mode === "system") return systemScheme;
    return mode;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chọn giao diện</Text>
      {THEME_OPTIONS.map((option) => (
        <TouchableOpacity
          key={option.key}
          style={[
            styles.option,
            mode === option.key && styles.optionActive,
          ]}
          onPress={() => dispatch(setThemeMode(option.key))}
        >
          <MaterialCommunityIcons
            name={option.icon}
            size={24}
            color={mode === option.key ? "#6366F1" : "#64748B"}
          />
          <Text
            style={[
              styles.optionLabel,
              mode === option.key && { color: "#6366F1", fontWeight: "bold" },
            ]}
          >
            {option.label}
          </Text>
          {mode === option.key && (
            <MaterialCommunityIcons
              name="check-circle"
              size={22}
              color="#6366F1"
              style={{ marginLeft: "auto" }}
            />
          )}
        </TouchableOpacity>
      ))}
      <Text style={styles.preview}>
        Giao diện hiện tại: {getActiveTheme() === "dark" ? "Tối" : "Sáng"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", padding: 24, marginTop: 20 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 24, color: "#1E293B" },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "white",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  optionActive: {
    borderColor: "#6366F1",
    backgroundColor: "#EEF2FF",
  },
  optionLabel: {
    fontSize: 16,
    marginLeft: 16,
    color: "#1E293B",
  },
  preview: {
    marginTop: 32,
    textAlign: "center",
    color: "#64748B",
    fontSize: 16,
  },
});