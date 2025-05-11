import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { toast } from 'sonner-native';

const MOCK_USER = {
  name: 'Nguyễn Văn A',
  email: 'nguyenvana@gmail.com',
  phone: '0123456789',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2940&auto=format&fit=crop',
  address: '123 Đường ABC, Phường XYZ, Đà Lạt',
  birthday: '1990-01-01',
};

export default function EditProfileScreen({ navigation }) {
  const [user, setUser] = useState(MOCK_USER);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: 'Đang cập nhật...',
        success: (result) => {
          console.log(result);
          return 'Cập nhật thành công!';
        },
        error: 'Có lỗi xảy ra',
      }
    );
    setIsEditing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>Chỉnh sửa thông tin</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setIsEditing(!isEditing)}
        >
          <MaterialCommunityIcons
            name={isEditing ? "content-save" : "pencil"}
            size={24}
            color="#4A90E2"
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.avatarSection}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <TouchableOpacity style={styles.changeAvatarButton}>
            <MaterialCommunityIcons name="camera" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Họ và tên</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="account" size={24} color="#4A90E2" />
              <TextInput
                style={styles.input}
                value={user.name}
                onChangeText={(text) => setUser({ ...user, name: text })}
                editable={isEditing}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="email" size={24} color="#4A90E2" />
              <TextInput
                style={styles.input}
                value={user.email}
                onChangeText={(text) => setUser({ ...user, email: text })}
                editable={isEditing}
                keyboardType="email-address"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số điện thoại</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="phone" size={24} color="#4A90E2" />
              <TextInput
                style={styles.input}
                value={user.phone}
                onChangeText={(text) => setUser({ ...user, phone: text })}
                editable={isEditing}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Địa chỉ</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="map-marker" size={24} color="#4A90E2" />
              <TextInput
                style={styles.input}
                value={user.address}
                onChangeText={(text) => setUser({ ...user, address: text })}
                editable={isEditing}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ngày sinh</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="calendar" size={24} color="#4A90E2" />
              <TextInput
                style={styles.input}
                value={user.birthday}
                onChangeText={(text) => setUser({ ...user, birthday: text })}
                editable={isEditing}
              />
            </View>
          </View>
        </View>

        {isEditing && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
  },
  editButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#4A90E2',
  },
  changeAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: '#4A90E2',
    padding: 8,
    borderRadius: 20,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
  },
  saveButton: {
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});