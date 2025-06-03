import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { toast } from "sonner-native";
import { CommonActions } from "@react-navigation/native";
import BookingHeader from "../components/booking/BookingHeader";
import StepIndicator from "../components/booking/StepIndicator";
import SeatSelection from "../components/booking/SeatSelection";
import TimeSlotPicker from "../components/booking/TimeSlotPicker";
import BookingTypeSelector from "../components/booking/BookingTypeSelector";
import shopAPI from "../services/shopAPI";
import DateTimePicker from "@react-native-community/datetimepicker";
import reservationAPI from "../services/reservationAPI";
import { useSelector } from "react-redux";
import { authSelector } from "../redux/reducers/authReducer";
import { Toast } from "react-native-toast-message/lib/src/Toast";


export default function BookingScreen({ navigation, route }) {
  const { user } = useSelector(authSelector);
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingType, setBookingType] = useState("regular");
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [filteredTimeSlots, setFilteredTimeSlots] = useState([]);

  // Step 1 states
  const [name, setName] = useState(user.full_name);
  const [phone, setPhone] = useState(user.phone);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [guests, setGuests] = useState("1");
  const [isPriorityBooking, setIsPriorityBooking] = useState(false);

  // Step 2 states
  const [specialRequests, setSpecialRequests] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { shopId } = route.params;
  const [shop, setShop] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const fetchShop = async () => {
      const response = await shopAPI.HandleCoffeeShops(`/${shopId}`);
      setShop(response.data.shop);
    };
    fetchShop();
  }, []);

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!selectedDate) {
        toast.error("Vui lòng chọn ngày");
        return;
      }
      if (!selectedTimeSlot) {
        toast.error("Vui lòng chọn thời gian");
        return;
      }
      if (!name.trim() || !phone.trim()) {
        toast.error("Vui lòng nhập thông tin cá nhân");
        return;
      }
      if (!selectedSeat) {
        toast.error("Vui lòng chọn vị trí");
        return;
      }
      if (bookingType === "scenic" && !selectedSeat) {
        toast.error("Vui lòng chọn vị trí view đẹp");
        return;
      }
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      setSelectedDate(selectedDate);
      // Reset selected time slot when date changes
      setSelectedTimeSlot(null);

      // Get day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
      const dayOfWeek = selectedDate.getDay();

      // Filter time slots based on day of week
      const filtered =
        shop?.timeSlots?.filter((slot) => slot.day_of_week === dayOfWeek) || [];
      setFilteredTimeSlots(filtered);
    }
  };

  const handleConfirmDate = () => {
    setShowDatePicker(false);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleBooking = async () => {
    try {
      setIsSubmitting(true);

      const reservationData = {
        shopId: shopId,
        seatId: selectedSeat._id,
        timeSlotId: selectedTimeSlot?._id,
        reservation_date: selectedDate.toISOString(),
        number_of_people: parseInt(guests),
        notes: specialRequests,
        reservation_type: isPriorityBooking ? "Priority" : "Standard",
      };

      const response = await reservationAPI.HandleReservation(
        "",
        reservationData,
        "post"
      );

      if (response.status !== 200) {
        throw new Error("Failed to create reservation");
      }
      Toast.show({
        type: "success",
        text1: "Đặt chỗ thành công!",
        text2: "Đặt chỗ thành công!",
      });
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "TabNavigatorCustomer" }],
        })
      );
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Có lỗi xảy ra. Vui lòng thử lại sau.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <BookingHeader shop={shop} onBack={handlePrevStep} />

        <View style={styles.formContainer}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Thông tin đặt chỗ</Text>
            <StepIndicator currentStep={currentStep} totalSteps={3} />
          </View>

          {currentStep === 1 && (
            <>
              <BookingTypeSelector
                selectedType={bookingType}
                onSelectType={setBookingType}
              />

              <SeatSelection
                seats={shop?.seats}
                selectedSeat={selectedSeat}
                onSelectSeat={setSelectedSeat}
                bookingType={bookingType}
              />

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Chọn ngày</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <MaterialCommunityIcons
                    name="calendar"
                    size={24}
                    color="#7a5545"
                  />
                  <Text style={styles.dateText}>
                    {formatDate(selectedDate)}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <>
                    <DateTimePicker
                      value={selectedDate}
                      mode="date"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={handleDateChange}
                      minimumDate={new Date()}
                    />
                    {Platform.OS === "ios" && (
                      <View style={styles.datePickerButtons}>
                        <TouchableOpacity
                          style={[styles.datePickerButton, styles.cancelButton]}
                          onPress={() => setShowDatePicker(false)}
                        >
                          <Text style={styles.cancelButtonText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.datePickerButton,
                            styles.confirmButton,
                          ]}
                          onPress={handleConfirmDate}
                        >
                          <Text style={styles.confirmButtonText}>Xác nhận</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </>
                )}
              </View>

              <TimeSlotPicker
                selectedTimeSlot={selectedTimeSlot}
                onSelectTimeSlot={setSelectedTimeSlot}
                timeSlots={filteredTimeSlots}
              />

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Thông tin cá nhân</Text>
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons
                    name="account"
                    size={24}
                    color="#7a5545"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Họ và tên"
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons
                    name="phone"
                    size={24}
                    color="#7a5545"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Số điện thoại"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Số người</Text>
                <View style={styles.guestsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.guestButton,
                      parseInt(guests) <= 1 && styles.guestButtonDisabled,
                    ]}
                    onPress={() =>
                      setGuests((prev) =>
                        Math.max(1, parseInt(prev) - 1).toString()
                      )
                    }
                    disabled={parseInt(guests) <= 1}
                  >
                    <MaterialCommunityIcons
                      name="minus"
                      size={24}
                      color={parseInt(guests) <= 1 ? "#94A3B8" : "#7a5545"}
                    />
                  </TouchableOpacity>
                  <View style={styles.guestsNumberContainer}>
                    <Text style={styles.guestsNumber}>{guests}</Text>
                    {selectedSeat && (
                      <Text style={styles.capacityText}>
                        (Tối đa {selectedSeat.capacity} người)
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.guestButton,
                      (!selectedSeat ||
                        parseInt(guests) >= selectedSeat.capacity) &&
                        styles.guestButtonDisabled,
                    ]}
                    onPress={() =>
                      setGuests((prev) => {
                        const newValue = parseInt(prev) + 1;
                        return selectedSeat && newValue <= selectedSeat.capacity
                          ? newValue.toString()
                          : prev;
                      })
                    }
                    disabled={
                      !selectedSeat || parseInt(guests) >= selectedSeat.capacity
                    }
                  >
                    <MaterialCommunityIcons
                      name="plus"
                      size={24}
                      color={
                        !selectedSeat ||
                        parseInt(guests) >= selectedSeat.capacity
                          ? "#94A3B8"
                          : "#7a5545"
                      }
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {bookingType === "regular" && (
                <TouchableOpacity
                  style={[
                    styles.priorityOption,
                    isPriorityBooking && styles.priorityOptionActive,
                  ]}
                  onPress={() => setIsPriorityBooking(!isPriorityBooking)}
                >
                  <View style={styles.priorityHeader}>
                    <View style={styles.priorityTitleContainer}>
                      <MaterialCommunityIcons
                        name="star"
                        size={24}
                        color={isPriorityBooking ? "#FFD700" : "#94A3B8"}
                      />
                      <Text
                        style={[
                          styles.priorityTitle,
                          isPriorityBooking && styles.priorityTitleActive,
                        ]}
                      >
                        Ưu tiên có chỗ
                      </Text>
                    </View>
                    <Text style={styles.priorityPrice}>10.000đ</Text>
                  </View>

                  <Text style={styles.priorityDescription}>
                    Được ưu tiên sắp xếp chỗ trong khung giờ đã chọn. Phí sẽ
                    được hoàn lại hoặc trừ vào hóa đơn khi bạn đến quán.
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}

          {currentStep === 2 && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Yêu cầu đặc biệt</Text>
                <View style={[styles.inputContainer, styles.textAreaContainer]}>
                  <TextInput
                    style={styles.textArea}
                    placeholder="Nhập yêu cầu đặc biệt của bạn (không bắt buộc)"
                    multiline
                    numberOfLines={4}
                    value={specialRequests}
                    onChangeText={setSpecialRequests}
                  />
                </View>
              </View>
            </>
          )}

          {currentStep === 3 && (
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Xác nhận thông tin</Text>

              <View style={styles.summaryItem}>
                <MaterialCommunityIcons
                  name={
                    bookingType === "scenic"
                      ? "image-filter-hdr"
                      : "table-furniture"
                  }
                  size={20}
                  color="#7a5545"
                />
                <Text style={styles.summaryText}>
                  {bookingType === "scenic"
                    ? "Đặt chỗ view đẹp"
                    : "Đặt chỗ thường"}
                </Text>
              </View>

              <View style={styles.summaryItem}>
                <MaterialCommunityIcons
                  name="account"
                  size={20}
                  color="#7a5545"
                />
                <Text style={styles.summaryText}>{name}</Text>
              </View>

              <View style={styles.summaryItem}>
                <MaterialCommunityIcons
                  name="phone"
                  size={20}
                  color="#7a5545"
                />
                <Text style={styles.summaryText}>{phone}</Text>
              </View>

              <View style={styles.summaryItem}>
                <MaterialCommunityIcons
                  name="calendar-clock"
                  size={20}
                  color="#7a5545"
                />
                <Text style={styles.summaryText}>
                  {selectedTimeSlot?.start_time} đến{" "}
                  {selectedTimeSlot?.end_time}
                </Text>
              </View>

              <View style={styles.summaryItem}>
                <MaterialCommunityIcons
                  name="account-group"
                  size={20}
                  color="#7a5545"
                />
                <Text style={styles.summaryText}>{guests} người</Text>
              </View>

              {bookingType === "regular" && isPriorityBooking && (
                <View style={styles.summaryItem}>
                  <MaterialCommunityIcons
                    name="star"
                    size={20}
                    color="#FFD700"
                  />
                  <Text style={styles.summaryText}>Ưu tiên có chỗ</Text>
                </View>
              )}

              {specialRequests && (
                <View style={styles.summaryItem}>
                  <MaterialCommunityIcons
                    name="note-text"
                    size={20}
                    color="#7a5545"
                  />
                  <Text style={styles.summaryText}>{specialRequests}</Text>
                </View>
              )}

              <View style={styles.priceSummary}>
                <Text style={styles.priceTitle}>Tổng cộng:</Text>
                <Text style={styles.totalPrice}>
                  {bookingType === "scenic"
                    ? "50.000đ"
                    : isPriorityBooking
                    ? "10.000đ"
                    : "0đ"}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.navigationButton, styles.prevButton]}
              onPress={handlePrevStep}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={20}
                color="#7a5545"
              />
              <Text style={styles.backButtonText}>Quay lại</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.navigationButton,
                currentStep === 3 ? styles.submitButton : styles.nextButton,
                isSubmitting && styles.buttonDisabled,
              ]}
              onPress={currentStep === 3 ? handleBooking : handleNextStep}
              disabled={isSubmitting}
            >
              <Text
                style={[
                  styles.navigationButtonText,
                  currentStep === 3
                    ? styles.submitButtonText
                    : styles.nextButtonText,
                ]}
              >
                {currentStep === 3
                  ? isSubmitting
                    ? "Đang xử lý..."
                    : "Xác nhận đặt chỗ"
                  : "Tiếp tục"}
              </Text>
              {!isSubmitting && currentStep < 3 && (
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={20}
                  color="#7a5545"
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f1f1",
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    padding: 20,
    gap: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  formHeader: {
    alignItems: "center",
    gap: 16,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#7a5545",
  },
  inputGroup: {
    gap: 12,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#7a5545",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#BFA58E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#7a5545",
  },
  guestsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    backgroundColor: "#f1f1f1",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#BFA58E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  guestButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f1f1",
    justifyContent: "center",
    alignItems: "center",
  },
  guestsNumberContainer: {
    alignItems: "center",
  },
  guestsNumber: {
    fontSize: 20,
    fontWeight: "600",
    color: "#7a5545",
    minWidth: 40,
    textAlign: "center",
  },
  capacityText: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 4,
  },
  guestButtonDisabled: {
    opacity: 0.5,
  },
  textAreaContainer: {
    height: 120,
    alignItems: "flex-start",
  },
  textArea: {
    flex: 1,
    width: "100%",
    textAlignVertical: "top",
    fontSize: 16,
    color: "#7a5545",
  },
  summaryContainer: {
    backgroundColor: "#f1f1f1",
    borderRadius: 12,
    padding: 16,
    gap: 12,
    shadowColor: "#BFA58E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#7a5545",
    marginBottom: 8,
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  summaryText: {
    fontSize: 16,
    color: "#7a5545",
    flex: 1,
  },
  priceSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  priceTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7a5545",
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#7a5545",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  navigationButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  prevButton: {
    backgroundColor: "#f1f1f1",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  nextButton: {
    backgroundColor: "#f1f1f1",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  submitButton: {
    backgroundColor: "#7a5545",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  navigationButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  nextButtonText: {
    color: "#7a5545",
  },
  submitButtonText: {
    color: "white",
  },
  backButtonText: {
    color: "#7a5545",
    fontSize: 16,
    fontWeight: "600",
  },
  priorityOption: {
    backgroundColor: "#f1f1f1",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 12,
  },
  priorityOptionActive: {
    backgroundColor: "#f1f1f1",
    borderColor: "#E2E8F0",
  },
  priorityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priorityTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  priorityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7a5545",
  },
  priorityTitleActive: {
    color: "#7a5545",
  },
  priorityPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7a5545",
  },
  priorityDescription: {
    fontSize: 14,
    color: "#7a5545",
    lineHeight: 20,
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#BFA58E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  dateText: {
    fontSize: 16,
    color: "#7a5545",
  },
  datePickerButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    backgroundColor: "#f1f1f1",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  confirmButton: {
    backgroundColor: "#7a5545",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cancelButtonText: {
    color: "#7a5545",
    fontSize: 16,
    fontWeight: "500",
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});
