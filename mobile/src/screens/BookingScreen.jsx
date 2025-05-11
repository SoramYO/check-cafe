import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { toast } from 'sonner-native';
import { CommonActions } from '@react-navigation/native';
import BookingHeader from '../components/booking/BookingHeader';
import StepIndicator from '../components/booking/StepIndicator';
import SpotSelection from '../components/booking/SpotSelection';
import TimeSlotPicker from '../components/booking/TimeSlotPicker';
import BookingTypeSelector from '../components/booking/BookingTypeSelector';

const TIME_SLOTS = [
  { start: '08:00', end: '10:00' },
  { start: '10:00', end: '12:00' },
  { start: '12:00', end: '14:00' },
  { start: '14:00', end: '16:00' },
  { start: '16:00', end: '18:00' },
  { start: '18:00', end: '20:00' },
  { start: '20:00', end: '22:00' },
];

export default function BookingScreen({ navigation, route }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingType, setBookingType] = useState("regular");
  const [selectedSpot, setSelectedSpot] = useState(null);
  
  // Step 1 states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [guests, setGuests] = useState("1");
  const [isPriorityBooking, setIsPriorityBooking] = useState(false);
  
  // Step 2 states
  const [specialRequests, setSpecialRequests] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { cafeName, cafeAddress } = route.params || {};

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!name.trim() || !phone.trim() || !selectedTimeSlot) {
        toast.error('Vui lòng điền đầy đủ thông tin');
        return;
      }
      if (bookingType === 'scenic' && !selectedSpot) {
        toast.error('Vui lòng chọn vị trí view đẹp');
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
              routes: [{ name: "TabNavigator" }],
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <BookingHeader 
          cafeName={cafeName}
          cafeAddress={cafeAddress}
          onBack={handlePrevStep}
        />

        <View
          style={styles.formContainer}
        >
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
              
              {bookingType === 'scenic' && (
                <SpotSelection
                  selectedSpot={selectedSpot}
                  onSelectSpot={setSelectedSpot}
                />
              )}
              
              <TimeSlotPicker
                selectedTimeSlot={selectedTimeSlot}
                onSelectTimeSlot={setSelectedTimeSlot}
                timeSlots={TIME_SLOTS}
              />

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Thông tin cá nhân</Text>
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons name="account" size={24} color="#4A90E2" />
                  <TextInput
                    style={styles.input}
                    placeholder="Họ và tên"
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons name="phone" size={24} color="#4A90E2" />
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

              {bookingType === 'regular' && (
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
                  name={bookingType === 'scenic' ? 'image-filter-hdr' : 'table-furniture'} 
                  size={20} 
                  color="#4A90E2" 
                />
                <Text style={styles.summaryText}>
                  {bookingType === 'scenic' ? 'Đặt chỗ view đẹp' : 'Đặt chỗ thường'}
                </Text>
              </View>

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
                  {selectedTimeSlot?.start} đến {selectedTimeSlot?.end}
                </Text>
              </View>
              
              <View style={styles.summaryItem}>
                <MaterialCommunityIcons name="account-group" size={20} color="#4A90E2" />
                <Text style={styles.summaryText}>{guests} người</Text>
              </View>

              {bookingType === 'regular' && isPriorityBooking && (
                <View style={styles.summaryItem}>
                  <MaterialCommunityIcons name="star" size={20} color="#FFD700" />
                  <Text style={styles.summaryText}>Ưu tiên có chỗ</Text>
                </View>
              )}

              {specialRequests && (
                <View style={styles.summaryItem}>
                  <MaterialCommunityIcons name="note-text" size={20} color="#4A90E2" />
                  <Text style={styles.summaryText}>{specialRequests}</Text>
                </View>
              )}

              <View style={styles.priceSummary}>
                <Text style={styles.priceTitle}>Tổng cộng:</Text>
                <Text style={styles.totalPrice}>
                  {bookingType === 'scenic' ? '50.000đ' : (isPriorityBooking ? '10.000đ' : '0đ')}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.navigationButton, styles.prevButton]}
              onPress={handlePrevStep}
            >
              <MaterialCommunityIcons name="arrow-left" size={20} color="#4A90E2" />
              <Text style={styles.backButtonText}>Quay lại</Text>
            </TouchableOpacity>

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
        </View>
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
  inputGroup: {
    gap: 12,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
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
    flex: 1,
  },
  priceSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  priceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A90E2',
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
});