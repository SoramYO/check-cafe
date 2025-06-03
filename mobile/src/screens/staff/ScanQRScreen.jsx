import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { CameraView, Camera } from "expo-camera";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { toast } from "sonner-native";
import reservationAPI from "../../services/reservationAPI";

const { width } = Dimensions.get("window");
const scanSize = width * 0.7;

export default function ScanQRScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [flashMode, setFlashMode] = useState("off");

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    try {
      if (scanned || isProcessing) return;
      setScanned(true);
      setIsProcessing(true);

      const parsedData = JSON.parse(data);
      const { shop_id, seat_id, time_slot_id, user_id } = parsedData;

      // Format request body
      const requestBody = {
        qr_code: {
          shop_id,
          seat_id,
          time_slot_id,
          user_id,
        },
      };

      const response = await reservationAPI.HandleReservation(
        `/shops/${shop_id}/checkin`,
        requestBody,
        "post"
      );

      if (response.status === 200) {
        toast.success("Check-in thành công!");
        navigation.navigate("CheckinSuccessScreen", { checkinData: response.data });
      } else {
        toast.error("Mã QR không hợp lệ");
        setTimeout(() => setScanned(false), 2000);
      }
    } catch (error) {
      console.error("QR scan error:", error);
      toast.error("Lỗi xử lý mã QR. Vui lòng thử lại.");
      setTimeout(() => setScanned(false), 2000);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleFlash = () => {
    setFlashMode(flashMode === "off" ? "on" : "off");
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7a5545" />
          <Text style={styles.loadingText}>Đang yêu cầu quyền camera...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="camera-off" size={64} color="#EF4444" />
          <Text style={styles.errorText}>Không có quyền sử dụng camera</Text>
          <Text style={styles.errorSubtext}>
            Ứng dụng cần quyền camera để quét mã QR check-in
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CameraView
        style={styles.camera}
        barCodeScannerSettings={{
          barCodeTypes: ["qr"],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        flash={flashMode}
      >
        <View style={styles.overlay}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => navigation.goBack()}
            >
              <MaterialCommunityIcons name="close" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.title}>Quét mã QR</Text>
            <TouchableOpacity style={styles.flashButton} onPress={toggleFlash}>
              <MaterialCommunityIcons
                name={flashMode === "off" ? "flash-off" : "flash"}
                size={24}
                color="white"
              />
            </TouchableOpacity>
          </View>

          {/* Scan Area */}
          <View style={styles.scanArea}>
            <View style={styles.scanFrame}>
              {/* Corner indicators */}
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.instructions}>
            <Text style={styles.instructionText}>
              Đặt mã QR trong khung hình để check-in
            </Text>
            {isProcessing && (
              <View style={styles.processingContainer}>
                <ActivityIndicator size="small" color="white" />
                <Text style={styles.processingText}>Đang xử lý...</Text>
              </View>
            )}
          </View>
        </View>
      </CameraView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 20 : 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(122, 85, 69, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  scannerContainer: {
    flex: 1,
    position: "relative",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  scanArea: {
    width: scanSize,
    height: scanSize,
    borderWidth: 2,
    borderColor: "#7a5545",
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  processingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  processingText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  guideContainer: {
    position: "absolute",
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  guideText: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
    backgroundColor: "rgba(122, 85, 69, 0.7)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  rescanButton: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7a5545",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  rescanText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  text: {
    color: "#7a5545",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#7a5545",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    gap: 16,
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    color: "#EF4444",
    fontWeight: "600",
    textAlign: "center",
  },
  errorSubtext: {
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
    opacity: 0.8,
  },
  retryButton: {
    backgroundColor: "#7a5545",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  processingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  processingText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  camera: {
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  flashButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: scanSize,
    height: scanSize,
    borderWidth: 2,
    borderColor: "#7a5545",
    backgroundColor: "transparent",
  },
  corner: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#7a5545",
    backgroundColor: "transparent",
  },
  topLeft: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  topRight: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  bottomLeft: {
    position: "absolute",
    bottom: 0,
    left: 0,
  },
  bottomRight: {
    position: "absolute",
    bottom: 0,
    right: 0,
  },
  instructions: {
    position: "absolute",
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  instructionText: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
    backgroundColor: "rgba(122, 85, 69, 0.7)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
});
