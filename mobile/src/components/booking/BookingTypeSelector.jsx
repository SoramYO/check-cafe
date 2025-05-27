import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';


export default function BookingTypeSelector({ selectedType, onSelectType }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chọn loại đặt chỗ</Text>
      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[
            styles.optionCard,
            selectedType === 'regular' && styles.selectedCard
          ]}
          onPress={() => onSelectType('regular')}
        >
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?q=80&w=2941&auto=format&fit=crop' }}
            style={styles.optionImage}
          />
          <View style={styles.optionContent}>
            <View style={styles.optionHeader}>
              <MaterialCommunityIcons
                name="table-furniture"
                size={24}
                color={selectedType === 'regular' ? '#7a5545' : '#7a5545'}
              />
              <Text style={[
                styles.optionTitle,
                selectedType === 'regular' && styles.selectedText
              ]}>
                Đặt chỗ thường
              </Text>
            </View>
            <Text style={styles.optionDescription}>
              Đặt bàn thông thường với không gian thoải mái
            </Text>
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Giá từ</Text>
              <Text style={styles.price}>0đ</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.optionCard,
            selectedType === 'scenic' && styles.selectedCard
          ]}
          onPress={() => onSelectType('scenic')}
        >
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?q=80&w=2942&auto=format&fit=crop' }}
            style={styles.optionImage}
          />
          <View style={styles.optionContent}>
            <View style={styles.optionHeader}>
              <MaterialCommunityIcons
                name="image-filter-hdr"
                size={24}
                color={selectedType === 'scenic' ? '#7a5545' : '#7a5545'}
              />
              <Text style={[
                styles.optionTitle,
                selectedType === 'scenic' && styles.selectedText
              ]}>
                Đặt chỗ view đẹp
              </Text>
            </View>
            <Text style={styles.optionDescription}>
              Trải nghiệm không gian với view tuyệt đẹp
            </Text>
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Giá từ</Text>
              <Text style={styles.price}>50.000đ</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    color: "#7a5545",
    marginBottom: 12,
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    borderRadius: 12,
    backgroundColor: "white",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#BFA58E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  selectedCard: {
    borderColor: "#7a5545",
    backgroundColor: "#f1f1f1",
    shadowColor: "#BFA58E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  optionImage: {
    width: '100%',
    height: 120,
  },
  optionContent: {
    padding: 16,
    gap: 8,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7a5545",
  },
  selectedText: {
    color: "#7a5545",
  },
  optionDescription: {
    fontSize: 14,
    color: "#7a5545",
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  priceLabel: {
    fontSize: 14,
    color: "#7a5545",
  },
  price: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7a5545",
  },
});