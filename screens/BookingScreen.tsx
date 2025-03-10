import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Image,
  Modal,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MotiView } from 'moti';
import { toast } from 'sonner-native';
import { CommonActions } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 250;

const TIME_SLOTS = [
  { start: '08:00', end: '10:00' },
  { start: '10:00', end: '12:00' },
  { start: '12:00', end: '14:00' },
  { start: '14:00', end: '16:00' },
  { start: '16:00', end: '18:00' },
  { start: '18:00', end: '20:00' },
  { start: '20:00', end: '22:00' },
];

export default function BookingScreen({ navigation, route }: any) {
  const [currentStep, setCurrentStep] = useState(1);
  
  // Step 1 states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<null | { start: string; end: string }>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [guests, setGuests] = useState("1");
  const [isPriorityBooking, setIsPriorityBooking] = useState(false);
  
  // Step 2 states
  const [seatingPreference, setSeatingPreference] = useState("indoor");
  const [tableType, setTableType] = useState("standard");
  
  // Step 3 states
  const [specialRequests, setSpecialRequests] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { cafeName, cafeAddress } = route.params || {};

  const handleDateChange = (event: DateTimePickerEvent, selected?: Date) => {
    const currentDate = selected || selectedDate;
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    setSelectedDate(currentDate);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!name.trim() || !phone.trim() || !selectedTimeSlot) {
        toast.error('Vui lòng điền đầy đủ thông tin');
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
    }
  };

  const handleBooking = async () => {
    try {
      setIsSubmitting(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Đặt chỗ thành công!', {
        duration: 2000,
        onAutoClose: () => {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                {
                  name: 'MainApp',
                  state: {
                    routes: [{ name: 'Bookings' }],
                    index: 1,
                  },
                },
              ],
            })
          );
        }
      });
    } catch (error) {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDateTimePicker = () => {
    if (Platform.OS === 'ios') {
      return (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showDatePicker}
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Chọn ngày</Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(false)}
                >
                  <MaterialCommunityIcons name="close" size={24} color="#94A3B8" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                  textColor="#1E293B"
                  accentColor="#4A90E2"
                  style={styles.iosDatePicker}
                />
              </View>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.confirmButtonText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      );
    }

    return (
      <>
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            is24Hour={true}
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}
      </>
    );
  };

  const renderTimeSlots = () => (
    <View style={styles.timeSlotsContainer}>
      {TIME_SLOTS.map((slot, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.timeSlot,
            selectedTimeSlot?.start === slot.start && styles.timeSlotActive
          ]}
          onPress={() => setSelectedTimeSlot(slot)}
        >
          <Text style={[
            styles.timeSlotText,
            selectedTimeSlot?.start === slot.start && styles.timeSlotTextActive
          ]}>
            {slot.start} - {slot.end}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPriorityOption = () => (
    <TouchableOpacity
      style={[
        styles.priorityOption,
        isPriorityBooking && styles.priorityOptionActive
      ]}
      onPress={() => setIsPriorityBooking(!isPriorityBooking)}
    >
      <View style={styles.priorityHeader}>
        <View style={styles.priorityTitleContainer}>
          <MaterialCommunityIcons
            name="star"
            size={24}
            color={isPriorityBooking ? '#FFD700' : '#94A3B8'}
          />
          <Text style={[
            styles.priorityTitle,
            isPriorityBooking && styles.priorityTitleActive
          ]}>
            Ưu tiên có chỗ
          </Text>
        </View>
        <Text style={styles.priorityPrice}>10.000đ</Text>
      </View>
      
      <Text style={styles.priorityDescription}>
        Được ưu tiên sắp xếp chỗ trong khung giờ đã chọn. Phí sẽ được hoàn lại hoặc trừ vào hóa đơn khi bạn đến quán.
      </Text>
      
      <View style={styles.priorityBenefits}>
        <View style={styles.benefitItem}>
          <MaterialCommunityIcons name="clock-check" size={20} color="#4A90E2" />
          <Text style={styles.benefitText}>Ưu tiên sắp xếp chỗ</Text>
        </View>
        <View style={styles.benefitItem}>
          <MaterialCommunityIcons name="cash-refund" size={20} color="#4A90E2" />
          <Text style={styles.benefitText}>Hoàn phí nếu không có chỗ</Text>
        </View>
        <View style={styles.benefitItem}>
          <MaterialCommunityIcons name="ticket-percent" size={20} color="#4A90E2" />
          <Text style={styles.benefitText}>Voucher bồi thường nếu chờ quá 10 phút</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderStep1 = () => (
    <>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Thông tin cá nhân</Text>
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="account" size={24} color="#4A90E2" />
          <TextInput
            style={styles.input}
            placeholder="Họ và tên"
            placeholderTextColor="#94A3B8"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="phone" size={24} color="#4A90E2" />
          <TextInput
            style={styles.input}
            placeholder="Số điện thoại"
            placeholderTextColor="#94A3B8"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Thời gian</Text>
        <TouchableOpacity 
          style={[styles.dateTimeButton, styles.dateButton]}
          onPress={() => setShowDatePicker(true)}
        >
          <MaterialCommunityIcons name="calendar" size={24} color="#4A90E2" />
          <View style={styles.dateTimeTextContainer}>
            <Text style={styles.dateTimeLabel}>Ngày</Text>
            <Text style={styles.dateTimeValue}>{formatDate(selectedDate)}</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.timeSlotLabel}>Chọn khung giờ (2 tiếng)</Text>
        {renderTimeSlots()}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Số người</Text>
        <View style={styles.guestsContainer}>
          <TouchableOpacity 
            style={styles.guestButton}
            onPress={() => setGuests(prev => Math.max(1, parseInt(prev) - 1).toString())}
          >
            <MaterialCommunityIcons name="minus" size={24} color="#4A90E2" />
          </TouchableOpacity>
          <Text style={styles.guestsNumber}>{guests}</Text>
          <TouchableOpacity 
            style={styles.guestButton}
            onPress={() => setGuests(prev => (parseInt(prev) + 1).toString())}
          >
            <MaterialCommunityIcons name="plus" size={24} color="#4A90E2" />
          </TouchableOpacity>
        </View>
      </View>

      {renderPriorityOption()}

      <View style={styles.noticeContainer}>
        <MaterialCommunityIcons name="information" size={20} color="#4A90E2" />
        <Text style={styles.noticeText}>
          Chúng tôi sẽ cố gắng sắp xếp chỗ trong khung giờ bạn chọn. Tuy nhiên, nếu quán đông, bạn có thể phải chờ tối đa 10 phút.
        </Text>
      </View>
    </>
  );

  const renderStep2 = () => (
    <>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Vị trí ngồi</Text>
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              seatingPreference === 'indoor' && styles.optionButtonActive
            ]}
            onPress={() => setSeatingPreference('indoor')}
          >
            <MaterialCommunityIcons
              name="home"
              size={24}
              color={seatingPreference === 'indoor' ? 'white' : '#4A90E2'}
            />
            <Text
              style={[
                styles.optionText,
                seatingPreference === 'indoor' && styles.optionTextActive
              ]}
            >
              Trong nhà
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionButton,
              seatingPreference === 'outdoor' && styles.optionButtonActive
            ]}
            onPress={() => setSeatingPreference('outdoor')}
          >
            <MaterialCommunityIcons
              name="tree"
              size={24}
              color={seatingPreference === 'outdoor' ? 'white' : '#4A90E2'}
            />
            <Text
              style={[
                styles.optionText,
                seatingPreference === 'outdoor' && styles.optionTextActive
              ]}
            >
              Ngoài trời
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Loại bàn</Text>
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              tableType === 'standard' && styles.optionButtonActive
            ]}
            onPress={() => setTableType('standard')}
          >
            <MaterialCommunityIcons
              name="table-furniture"
              size={24}
              color={tableType === 'standard' ? 'white' : '#4A90E2'}
            />
            <Text
              style={[
                styles.optionText,
                tableType === 'standard' && styles.optionTextActive
              ]}
            >
              Bàn thường
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionButton,
              tableType === 'private' && styles.optionButtonActive
            ]}
            onPress={() => setTableType('private')}
          >
            <MaterialCommunityIcons
              name="shield-home"
              size={24}
              color={tableType === 'private' ? 'white' : '#4A90E2'}
            />
            <Text
              style={[
                styles.optionText,
                tableType === 'private' && styles.optionTextActive
              ]}
            >
              Phòng riêng
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );

  const renderStep3 = () => (
    <>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Yêu cầu đặc biệt</Text>
        <View style={[styles.inputContainer, styles.textAreaContainer]}>
          <TextInput
            style={styles.textArea}
            placeholder="Nhập yêu cầu đặc biệt của bạn (không bắt buộc)"
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={4}
            value={specialRequests}
            onChangeText={setSpecialRequests}
          />
        </View>
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Thông tin đặt chỗ</Text>
        
        <View style={styles.summaryItem}>
          <MaterialCommunityIcons name="account" size={20} color="#4A90E2" />
          <Text style={styles.summaryText}>{name}</Text>
        </View>
        
        <View style={styles.summaryItem}>
          <MaterialCommunityIcons name="phone" size={20} color="#4A90E2" />
          <Text style={styles.summaryText}>{phone}</Text>
        </View>
        
        <View style={styles.summaryItem}>
          <MaterialCommunityIcons name="calendar-clock" size={20} color="#4A90E2" />
          <Text style={styles.summaryText}>
            {formatDate(selectedDate)} - {selectedTimeSlot?.start} đến {selectedTimeSlot?.end}
          </Text>
        </View>
        
        <View style={styles.summaryItem}>
          <MaterialCommunityIcons name="account-group" size={20} color="#4A90E2" />
          <Text style={styles.summaryText}>{guests} người</Text>
        </View>
        
        <View style={styles.summaryItem}>
          <MaterialCommunityIcons
            name={seatingPreference === 'indoor' ? 'home' : 'tree'}
            size={20}
            color="#4A90E2"
          />
          <Text style={styles.summaryText}>
            {seatingPreference === 'indoor' ? 'Trong nhà' : 'Ngoài trời'}
          </Text>
        </View>
        
        <View style={styles.summaryItem}>
          <MaterialCommunityIcons
            name={tableType === 'standard' ? 'table-furniture' : 'shield-home'}
            size={20}
            color="#4A90E2"
          />
          <Text style={styles.summaryText}>
            {tableType === 'standard' ? 'Bàn thường' : 'Phòng riêng'}
          </Text>
        </View>

        {isPriorityBooking && (
          <View style={styles.summaryItem}>
            <MaterialCommunityIcons name="star" size={20} color="#FFD700" />
            <Text style={styles.summaryText}>Ưu tiên có chỗ</Text>
          </View>
        )}
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2947&auto=format&fit=crop' }}
            style={styles.heroImage}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.heroGradient}
          >
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => {
                if (currentStep === 1) {
                  navigation.goBack();
                } else {
                  handlePrevStep();
                }
              }}
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.heroContent}>
              <Text style={styles.cafeName}>{cafeName}</Text>
              <View style={styles.addressContainer}>
                <MaterialCommunityIcons name="map-marker" size={16} color="white" />
                <Text style={styles.cafeAddress}>{cafeAddress}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Booking Form */}
        <MotiView
          from={{ opacity: 0, translateY: 50 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500 }}
          style={styles.formContainer}
        >
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Thông tin đặt chỗ</Text>
            <View style={styles.stepIndicator}>
              <View style={[styles.step, currentStep >= 1 && styles.stepActive]}>
                <Text style={[styles.stepText, currentStep >= 1 && styles.stepTextActive]}>1</Text>
              </View>
              <View style={[styles.stepLine, currentStep >= 2 && styles.stepLineActive]} />
              <View style={[styles.step, currentStep >= 2 && styles.stepActive]}>
                <Text style={[styles.stepText, currentStep >= 2 && styles.stepTextActive]}>2</Text>
              </View>
              <View style={[styles.stepLine, currentStep >= 3 && styles.stepLineActive]} />
              <View style={[styles.step, currentStep >= 3 && styles.stepActive]}>
                <Text style={[styles.stepText, currentStep >= 3 && styles.stepTextActive]}>3</Text>
              </View>
            </View>
          </View>

          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          {renderDateTimePicker()}

          <View style={styles.buttonContainer}>
            {currentStep > 1 && (
              <TouchableOpacity 
                style={[styles.navigationButton, styles.prevButton]}
                onPress={handlePrevStep}
              >
                <MaterialCommunityIcons name="arrow-left" size={20} color="#4A90E2" />
                <Text style={styles.backButtonText}>Quay lại</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={[
                styles.navigationButton,
                currentStep === 3 ? styles.submitButton : styles.nextButton,
                isSubmitting && styles.buttonDisabled
              ]} 
              onPress={currentStep === 3 ? handleBooking : handleNextStep}
              disabled={isSubmitting}
            >
              <Text style={[
                styles.navigationButtonText,
                currentStep === 3 ? styles.submitButtonText : styles.nextButtonText
              ]}>
                {currentStep === 3 
                  ? (isSubmitting ? 'Đang xử lý...' : 'Xác nhận đặt chỗ')
                  : 'Tiếp tục'}
              </Text>
              {!isSubmitting && currentStep < 3 && (
                <MaterialCommunityIcons name="arrow-right" size={20} color="#4A90E2" />
              )}
            </TouchableOpacity>
          </View>
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  heroContainer: {
    height: HEADER_HEIGHT,
    width: '100%',
  },
  heroImage: {
    height: HEADER_HEIGHT,
    width: '100%',
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    justifyContent: 'space-between',
  },
  heroContent: {
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cafeName: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cafeAddress: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    flex: 1,
  },
  formContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    padding: 20,
    gap: 24,
  },
  formHeader: {
    alignItems: 'center',
    gap: 16,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  step: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepActive: {
    backgroundColor: '#4A90E2',
  },
  stepLine: {
    width: 24,
    height: 2,
    backgroundColor: '#E2E8F0',
  },
  stepLineActive: {
    backgroundColor: '#4A90E2',
  },
  stepText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
  stepTextActive: {
    color: 'white',
  },
  inputGroup: {
    gap: 12,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
  },
  dateTimeContainer: {
    flexDirection: 'column',
    gap: 12,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dateButton: {
    flex: 1,
  },
  timeButton: {
    flex: 1,
  },
  dateTimeTextContainer: {
    flex: 1,
  },
  dateTimeLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  dateTimeValue: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  pickerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iosDatePicker: {
    height: 200,
    width: '100%',
  },
  iosTimePicker: {
    height: 200,
    width: '100%',
  },
  confirmButton: {
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  guestsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  guestButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestsNumber: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    minWidth: 40,
    textAlign: 'center',
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  optionButtonActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  optionText: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '500',
  },
  optionTextActive: {
    color: 'white',
  },
  textAreaContainer: {
    height: 120,
    alignItems: 'flex-start',
  },
  textArea: {
    flex: 1,
    width: '100%',
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#1E293B',
  },
  summaryContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryText: {
    fontSize: 16,
    color: '#1E293B',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  navigationButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  prevButton: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  nextButton: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  submitButton: {
    backgroundColor: '#4A90E2',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  navigationButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  nextButtonText: {
    color: '#4A90E2',
  },
  submitButtonText: {
    color: 'white',
  },
  backButtonText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '600',
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeSlotActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  timeSlotText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  timeSlotTextActive: {
    color: 'white',
  },
  timeSlotLabel: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 12,
  },
  priorityOption: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  priorityOptionActive: {
    backgroundColor: '#F0F9FF',
    borderColor: '#4A90E2',
  },
  priorityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priorityTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  priorityTitleActive: {
    color: '#1E293B',
  },
  priorityPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
  },
  priorityDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  priorityBenefits: {
    gap: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitText: {
    fontSize: 14,
    color: '#1E293B',
  },
  noticeContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    alignItems: 'flex-start',
  },
  noticeText: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    lineHeight: 20,
  }
});  
