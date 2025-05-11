import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface BookingTypeProps {
  selectedType: 'regular' | 'scenic';
  onSelectType: (type: 'regular' | 'scenic') => void;
}

export default function BookingTypeSelector({ selectedType, onSelectType }: BookingTypeProps) {
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
                color={selectedType === 'regular' ? '#4A90E2' : '#64748B'}
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
                color={selectedType === 'scenic' ? '#4A90E2' : '#64748B'}
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
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 12,
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    borderRadius: 12,
    backgroundColor: 'white',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedCard: {
    borderColor: '#4A90E2',
    backgroundColor: '#F0F9FF',
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
    fontWeight: '600',
    color: '#1E293B',
  },
  selectedText: {
    color: '#4A90E2',
  },
  optionDescription: {
    fontSize: 14,
    color: '#64748B',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  priceLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
  },
});