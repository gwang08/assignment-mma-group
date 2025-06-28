import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../context/AuthContext';
import colors from '../styles/colors';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    gender: 'male',
    dateOfBirth: '',
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Vietnam',
    username: '',
    password: '',
    confirmPassword: '',
    phone_number: '',
    email: '',
    class_name: '', // Thêm trường class_name cho student
  });
  const [userType, setUserType] = useState('parent');
  const { signUp, isLoading } = useAuth();

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const required = ['first_name', 'last_name', 'username', 'password'];
    for (let field of required) {
      if (!formData[field].trim()) {
        Alert.alert('Lỗi', `Vui lòng nhập ${field}`);
        return false;
      }
    }

    // Validate class_name for students
    if (userType === 'student' && !formData.class_name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập lớp học');
      return false;
    }

    // Validate email and phone for parents only
    if (userType === 'parent') {
      if (!formData.email.trim()) {
        Alert.alert('Lỗi', 'Vui lòng nhập email');
        return false;
      }
      if (!formData.phone_number.trim()) {
        Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
        return false;
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        Alert.alert('Lỗi', 'Email không hợp lệ');
        return false;
      }
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return false;
    }

    if (formData.password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    const userData = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      gender: formData.gender,
      dateOfBirth: formData.dateOfBirth,
      address: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postal_code,
        country: formData.country,
      },
      username: formData.username,
      password: formData.password,
    };

    // Add additional fields based on user type
    if (userType === 'parent') {
      userData.phone_number = formData.phone_number;
      userData.email = formData.email;
    } else if (userType === 'student') {
      userData.class_name = formData.class_name;
    }

    const result = await signUp(userData, userType);
    
    if (result.success) {
      Alert.alert(
        'Đăng ký thành công',
        'Tài khoản đã được tạo. Vui lòng đăng nhập.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } else {
      Alert.alert('Đăng ký thất bại', result.message);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Đăng Ký</Text>
          <Text style={styles.subtitle}>Tạo tài khoản mới</Text>

          {/* Thông tin cơ bản */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Họ</Text>
              <TextInput
                style={styles.input}
                value={formData.first_name}
                onChangeText={(value) => updateFormData('first_name', value)}
                placeholder="Nhập họ"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Tên</Text>
              <TextInput
                style={styles.input}
                value={formData.last_name}
                onChangeText={(value) => updateFormData('last_name', value)}
                placeholder="Nhập tên"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Giới tính</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.gender}
                  onValueChange={(value) => updateFormData('gender', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Nam" value="male" />
                  <Picker.Item label="Nữ" value="female" />
                </Picker>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Ngày sinh (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                value={formData.dateOfBirth}
                onChangeText={(value) => updateFormData('dateOfBirth', value)}
                placeholder="1990-01-01"
              />
            </View>
          </View>

          {/* Địa chỉ */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Địa chỉ</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Đường</Text>
              <TextInput
                style={styles.input}
                value={formData.street}
                onChangeText={(value) => updateFormData('street', value)}
                placeholder="Số nhà, tên đường"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Thành phố</Text>
              <TextInput
                style={styles.input}
                value={formData.city}
                onChangeText={(value) => updateFormData('city', value)}
                placeholder="Thành phố"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Tỉnh/Thành</Text>
              <TextInput
                style={styles.input}
                value={formData.state}
                onChangeText={(value) => updateFormData('state', value)}
                placeholder="Tỉnh/Thành phố"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mã bưu điện</Text>
              <TextInput
                style={styles.input}
                value={formData.postal_code}
                onChangeText={(value) => updateFormData('postal_code', value)}
                placeholder="Mã bưu điện"
              />
            </View>
          </View>

          {/* Tài khoản */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Thông tin tài khoản</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Loại tài khoản</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={userType}
                  onValueChange={setUserType}
                  style={styles.picker}
                >
                  <Picker.Item label="Phụ huynh" value="parent" />
                  <Picker.Item label="Học sinh" value="student" />
                </Picker>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Tên đăng nhập</Text>
              <TextInput
                style={styles.input}
                value={formData.username}
                onChangeText={(value) => updateFormData('username', value)}
                placeholder="Tên đăng nhập"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mật khẩu</Text>
              <TextInput
                style={styles.input}
                value={formData.password}
                onChangeText={(value) => updateFormData('password', value)}
                placeholder="Mật khẩu"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Xác nhận mật khẩu</Text>
              <TextInput
                style={styles.input}
                value={formData.confirmPassword}
                onChangeText={(value) => updateFormData('confirmPassword', value)}
                placeholder="Xác nhận mật khẩu"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {userType === 'parent' && (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.email}
                    onChangeText={(value) => updateFormData('email', value)}
                    placeholder="email@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Số điện thoại</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.phone_number}
                    onChangeText={(value) => updateFormData('phone_number', value)}
                    placeholder="Số điện thoại"
                    keyboardType="phone-pad"
                  />
                </View>
              </>
            )}

            {userType === 'student' && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Lớp học</Text>
                <TextInput
                  style={styles.input}
                  value={formData.class_name}
                  onChangeText={(value) => updateFormData('class_name', value)}
                  placeholder="Ví dụ: 6A1, 7B2"
                />
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Đăng Ký</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.linkText}>
              Đã có tài khoản? <Text style={styles.linkTextBold}>Đăng nhập ngay</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 40,
  },
  formContainer: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 20,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: colors.textSecondary,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: colors.text,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 5,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: colors.background,
    color: colors.text,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  picker: {
    height: 50,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: colors.primaryLight,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  linkTextBold: {
    fontWeight: 'bold',
    color: colors.primary,
  },
});

export default RegisterScreen;
