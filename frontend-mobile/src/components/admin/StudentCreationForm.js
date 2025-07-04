import React, { useState } from 'react';
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
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { adminAPI } from '../../services/adminApi';
import colors from '../../styles/colors';

const StudentCreationForm = ({ visible, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    student_id: '',
    class_name: '',
    gender: '',
    date_of_birth: new Date(),
    address: '',
    phone_number: '',
    email: '',
    notes: ''
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showClassPicker, setShowClassPicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      student_id: '',
      class_name: '',
      gender: '',
      date_of_birth: new Date(),
      address: '',
      phone_number: '',
      email: '',
      notes: ''
    });
    setShowDatePicker(false);
    setShowClassPicker(false);
    setShowGenderPicker(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || formData.date_of_birth;
    setShowDatePicker(Platform.OS === 'ios');
    setFormData(prev => ({
      ...prev,
      date_of_birth: currentDate
    }));
  };

  const formatDate = (date) => {
    if (!date || !(date instanceof Date)) {
      return new Date().toLocaleDateString('vi-VN');
    }
    return date.toLocaleDateString('vi-VN');
  };

  const formatDateForAPI = (date) => {
    // Format: YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const validateForm = () => {
    const required = ['first_name', 'last_name', 'class_name', 'gender'];
    for (let field of required) {
      if (!formData[field] || formData[field].trim() === '') {
        Alert.alert('Lỗi', `Vui lòng điền ${getFieldLabel(field)}`);
        return false;
      }
    }
    return true;
  };

  const getFieldLabel = (field) => {
    const labels = {
      first_name: 'tên',
      last_name: 'họ',
      class_name: 'lớp',
      gender: 'giới tính',
    };
    return labels[field] || field;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      
      // Prepare data for API
      const studentData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        student_id: formData.student_id.trim() || undefined,
        class_name: formData.class_name.trim(),
        gender: formData.gender,
        dateOfBirth: formatDateForAPI(formData.date_of_birth), // Backend expects 'dateOfBirth'
        address: formData.address.trim() || undefined,
        phone_number: formData.phone_number.trim() || undefined,
        email: formData.email.trim() || undefined,
        notes: formData.notes.trim() || undefined
      };

      console.log('Sending student data:', studentData);
      
      const response = await adminAPI.createStudent(studentData);
      
      if (response.success) {
        Alert.alert('Thành công', 'Học sinh đã được tạo thành công');
        resetForm();
        onSuccess && onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Create student error:', error);
      Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra khi tạo học sinh');
    } finally {
      setSubmitting(false);
    }
  };

  const classes = [
    '10A1', '10A2', '10A3', '10A4',
    '11A1', '11A2', '11A3', '11A4',
    '12A1', '12A2', '12A3', '12A4',
    '10B1', '10B2', '11B1', '11B2', '12B1', '12B2'
  ];

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
            <Text style={styles.modalTitle}>Tạo học sinh mới</Text>
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
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Họ *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.last_name}
                    onChangeText={(value) => handleInputChange('last_name', value)}
                    placeholder="Nhập họ"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Tên *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.first_name}
                    onChangeText={(value) => handleInputChange('first_name', value)}
                    placeholder="Nhập tên"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>

     

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Lớp *</Text>
                  <TouchableOpacity
                    style={styles.selectButton}
                    onPress={() => setShowClassPicker(true)}
                  >
                    <Text style={[styles.selectButtonText, !formData.class_name && styles.placeholderText]}>
                      {formData.class_name || 'Chọn lớp'}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Giới tính *</Text>
                  <TouchableOpacity
                    style={styles.selectButton}
                    onPress={() => setShowGenderPicker(true)}
                  >
                    <Text style={[styles.selectButtonText, !formData.gender && styles.placeholderText]}>
                      {formData.gender === 'male' ? 'Nam' : formData.gender === 'female' ? 'Nữ' : 'Chọn giới tính'}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Ngày sinh *</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar" size={20} color={colors.primary} />
                  <Text style={styles.dateText}>{formatDate(formData.date_of_birth)}</Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={formData.date_of_birth}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                  />
                )}
              </View>
            </View>

           
        

            {/* Submit Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  resetForm();
                  onClose();
                }}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="person-add" size={20} color="#fff" />
                    <Text style={styles.submitButtonText}>Tạo học sinh</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Class Picker Modal */}
      <Modal
        visible={showClassPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowClassPicker(false)}
      >
        <View style={styles.pickerModalOverlay}>
          <View style={styles.pickerModalContent}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Chọn lớp</Text>
              <TouchableOpacity onPress={() => setShowClassPicker(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerList}>
              {classes.map((className) => (
                <TouchableOpacity
                  key={className}
                  style={[
                    styles.pickerItem,
                    formData.class_name === className && styles.pickerItemSelected
                  ]}
                  onPress={() => {
                    handleInputChange('class_name', className);
                    setShowClassPicker(false);
                  }}
                >
                  <Text style={[
                    styles.pickerItemText,
                    formData.class_name === className && styles.pickerItemTextSelected
                  ]}>
                    {className}
                  </Text>
                  {formData.class_name === className && (
                    <Ionicons name="checkmark" size={20} color="#fff" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Gender Picker Modal */}
      <Modal
        visible={showGenderPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowGenderPicker(false)}
      >
        <View style={styles.pickerModalOverlay}>
          <View style={styles.pickerModalContent}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Chọn giới tính</Text>
              <TouchableOpacity onPress={() => setShowGenderPicker(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.pickerList}>
              <TouchableOpacity
                style={[
                  styles.pickerItem,
                  formData.gender === 'male' && styles.pickerItemSelected
                ]}
                onPress={() => {
                  handleInputChange('gender', 'male');
                  setShowGenderPicker(false);
                }}
              >
                <Text style={[
                  styles.pickerItemText,
                  formData.gender === 'male' && styles.pickerItemTextSelected
                ]}>
                  Nam
                </Text>
                {formData.gender === 'male' && (
                  <Ionicons name="checkmark" size={20} color="#fff" />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.pickerItem,
                  formData.gender === 'female' && styles.pickerItemSelected
                ]}
                onPress={() => {
                  handleInputChange('gender', 'female');
                  setShowGenderPicker(false);
                }}
              >
                <Text style={[
                  styles.pickerItemText,
                  formData.gender === 'female' && styles.pickerItemTextSelected
                ]}>
                  Nữ
                </Text>
                {formData.gender === 'female' && (
                  <Ionicons name="checkmark" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: colors.surface,
    borderRadius: 16,
    width: '95%',
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.primary,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 8,
  },
  formGroup: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: colors.background,
  },
  selectButtonText: {
    fontSize: 16,
    color: colors.text,
  },
  placeholderText: {
    color: colors.textSecondary,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: colors.background,
  },
  dateText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  
  // Picker Modal Styles
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerModalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '60%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  pickerList: {
    maxHeight: 300,
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerItemSelected: {
    backgroundColor: colors.primary,
  },
  pickerItemText: {
    fontSize: 16,
    color: colors.text,
  },
  pickerItemTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default StudentCreationForm;
