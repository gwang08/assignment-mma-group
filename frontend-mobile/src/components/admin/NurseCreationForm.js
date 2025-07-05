import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminAPI } from '../../services/adminApi';
import colors from '../../styles/colors';

const NurseCreationForm = ({ visible, onClose, onSuccess, editingNurse, isEditing = false }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    password: '',
    email: '',
    phone_number: '',
    gender: '',
    staff_role: 'Nurse'
  });
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load editing data when modal opens
  useEffect(() => {
    if (visible && isEditing && editingNurse) {
      setFormData({
        first_name: editingNurse.first_name || '',
        last_name: editingNurse.last_name || '',
        username: editingNurse.username || '',
        password: '', // Don't load password
        email: editingNurse.email || '',
        phone_number: editingNurse.phone_number || '',
        gender: editingNurse.gender || '',
        staff_role: editingNurse.staff_role || 'Nurse'
      });
    } else if (visible && !isEditing) {
      resetForm();
    }
  }, [visible, isEditing, editingNurse]);

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      username: '',
      password: '',
      email: '',
      phone_number: '',
      gender: '',
      staff_role: 'Nurse'
    });
    setShowGenderPicker(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const requiredFields = ['first_name', 'last_name', 'email', 'phone_number', 'gender'];
    if (!isEditing) {
      requiredFields.push('username', 'password');
    }

    for (const field of requiredFields) {
      if (!formData[field]?.trim()) {
        Alert.alert('Lỗi', `Vui lòng điền ${getFieldName(field)}`);
        return false;
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return false;
    }

    return true;
  };

  const getFieldName = (field) => {
    const fieldNames = {
      first_name: 'Tên',
      last_name: 'Họ',
      username: 'Tên đăng nhập',
      password: 'Mật khẩu',
      email: 'Email',
      phone_number: 'Số điện thoại',
      gender: 'Giới tính'
    };
    return fieldNames[field] || field;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      
      // Prepare data for API
      const nurseData = {
        staffData: {
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          email: formData.email.trim(),
          phone_number: formData.phone_number.trim(),
          gender: formData.gender,
          staff_role: formData.staff_role,
          role: 'medicalStaff'
        }
      };

      // Add username and password only for creation
      if (!isEditing) {
        nurseData.staffData.username = formData.username.trim();
        nurseData.staffData.password = formData.password.trim();
      }

      let response;
      if (isEditing && editingNurse) {
        response = await adminAPI.updateMedicalStaff(editingNurse._id, nurseData.staffData);
      } else {
        response = await adminAPI.createMedicalStaff(nurseData);
      }
      
      if (response.success) {
        Alert.alert('Thành công', isEditing ? 'Y tá đã được cập nhật thành công' : 'Y tá đã được tạo thành công');
        resetForm();
        onSuccess && onSuccess();
        onClose();
      }
    } catch (error) {
      console.error(isEditing ? 'Update nurse error:' : 'Create nurse error:', error);
      Alert.alert('Lỗi', error.message || `Có lỗi xảy ra khi ${isEditing ? 'cập nhật' : 'tạo'} y tá`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{isEditing ? 'Chỉnh sửa y tá' : 'Tạo y tá mới'}</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => {
                resetForm();
                onClose();
              }}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Basic Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
              
              <View style={styles.row}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Họ *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.last_name}
                    onChangeText={(value) => handleInputChange('last_name', value)}
                    placeholder="Nhập họ"
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Tên *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.first_name}
                    onChangeText={(value) => handleInputChange('first_name', value)}
                    placeholder="Nhập tên"
                  />
                </View>
              </View>

              {/* Account Information - Only show for creation */}
              {!isEditing && (
                <View style={styles.row}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Tên đăng nhập *</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.username}
                      onChangeText={(value) => handleInputChange('username', value)}
                      placeholder="Nhập tên đăng nhập"
                      autoCapitalize="none"
                    />
                  </View>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Mật khẩu *</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.password}
                      onChangeText={(value) => handleInputChange('password', value)}
                      placeholder="Nhập mật khẩu"
                      secureTextEntry
                    />
                  </View>
                </View>
              )}

              {/* Contact Information */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  placeholder="Nhập email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Số điện thoại *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.phone_number}
                  onChangeText={(value) => handleInputChange('phone_number', value)}
                  placeholder="Nhập số điện thoại"
                  keyboardType="phone-pad"
                />
              </View>

              {/* Gender Selection */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Giới tính *</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setShowGenderPicker(!showGenderPicker)}
                >
                  <Text style={[styles.pickerText, !formData.gender && styles.placeholderText]}>
                    {formData.gender ? (formData.gender === 'male' ? 'Nam' : 'Nữ') : 'Chọn giới tính'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
                
                {showGenderPicker && (
                  <View style={styles.pickerOptions}>
                    {['male', 'female'].map((gender) => (
                      <TouchableOpacity
                        key={gender}
                        style={styles.pickerOption}
                        onPress={() => {
                          handleInputChange('gender', gender);
                          setShowGenderPicker(false);
                        }}
                      >
                        <Text style={styles.pickerOptionText}>
                          {gender === 'male' ? 'Nam' : 'Nữ'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>{isEditing ? 'Cập nhật' : 'Tạo y tá'}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    maxHeight: 400,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  inputContainer: {
    flex: 1,
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FAFAFA',
  },
  pickerText: {
    fontSize: 16,
    color: colors.text,
  },
  placeholderText: {
    color: '#999',
  },
  pickerOptions: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    marginTop: 5,
  },
  pickerOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  pickerOptionText: {
    fontSize: 16,
    color: colors.text,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#BDC3C7',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NurseCreationForm;
