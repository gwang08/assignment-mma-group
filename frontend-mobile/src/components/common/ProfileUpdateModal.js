import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { colors } from "../../styles/colors";
import { authAPI } from "../../services/api";
import DatePickerField from "./DatePickerField";

const ProfileUpdateModal = ({ visible, onClose, user, onUpdateSuccess }) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    gender: "Male",
    dateOfBirth: new Date(),
    address: {
      street: "",
      city: "",
      state: "",
      postal_code: "",
      country: "Vietnam",
    },
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
        gender: user.gender || "Male",
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : new Date(),
        address: {
          street: user.address?.street || "",
          city: user.address?.city || "",
          state: user.address?.state || "",
          postal_code: user.address?.postal_code || "",
          country: user.address?.country || "Vietnam",
        },
      });
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }

    if (field.includes("address.")) {
      const addressField = field.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }

    // Real-time validation for email and phone
    if (field === "email") {
      validateEmail(value);
    } else if (field === "phone_number") {
      validatePhoneNumber(value);
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setErrors((prev) => ({ ...prev, email: "Email là bắt buộc" }));
      return false;
    } else if (!emailRegex.test(email)) {
      setErrors((prev) => ({ ...prev, email: "Email không hợp lệ" }));
      return false;
    } else {
      setErrors((prev) => ({ ...prev, email: undefined }));
      return true;
    }
  };

  const validatePhoneNumber = (phone) => {
    // Vietnamese phone number patterns
    const phoneRegex = /^(\+84|84|0)(3|5|7|8|9)[0-9]{8}$/;
    if (!phone.trim()) {
      setErrors((prev) => ({
        ...prev,
        phone_number: "Số điện thoại là bắt buộc",
      }));
      return false;
    } else if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
      setErrors((prev) => ({
        ...prev,
        phone_number: "Số điện thoại không hợp lệ",
      }));
      return false;
    } else {
      setErrors((prev) => ({ ...prev, phone_number: undefined }));
      return true;
    }
  };

  const handleDateChange = (selectedDate) => {
    setFormData((prev) => ({
      ...prev,
      dateOfBirth: selectedDate,
    }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    // Validate required fields
    if (!formData.first_name.trim()) {
      newErrors.first_name = "Họ là bắt buộc";
      isValid = false;
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Tên là bắt buộc";
      isValid = false;
    }

    // Validate email
    if (!validateEmail(formData.email)) {
      isValid = false;
    }

    // Validate phone number
    if (!validatePhoneNumber(formData.phone_number)) {
      isValid = false;
    }

    setErrors(newErrors);

    if (!isValid) {
      const firstError =
        Object.values(newErrors)[0] || Object.values(errors)[0];
      if (firstError) {
        Alert.alert("Lỗi", firstError);
      }
    }

    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const updateData = {
        ...formData,
        dateOfBirth: formData.dateOfBirth.toISOString(),
      };

      const response = await authAPI.updateProfile(updateData);

      if (response.success) {
        Alert.alert("Thành công", "Cập nhật thông tin thành công", [
          {
            text: "OK",
            onPress: () => {
              onUpdateSuccess(response.data);
              onClose();
            },
          },
        ]);
      }
    } catch (error) {
      console.error("Profile update error:", error);
      Alert.alert(
        "Lỗi",
        error.message || "Có lỗi xảy ra khi cập nhật thông tin"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("vi-VN");
  };

  const renderInputWithError = (label, value, field, props = {}) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, errors[field] && styles.inputError]}
        value={value}
        onChangeText={(val) => handleInputChange(field, val)}
        {...props}
      />
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cập nhật thông tin</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Personal Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>

            {renderInputWithError("Họ *", formData.first_name, "first_name", {
              placeholder: "Nhập họ",
              placeholderTextColor: colors.textSecondary,
            })}

            {renderInputWithError("Tên *", formData.last_name, "last_name", {
              placeholder: "Nhập tên",
              placeholderTextColor: colors.textSecondary,
            })}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Giới tính</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.gender}
                  style={styles.picker}
                  onValueChange={(value) => handleInputChange("gender", value)}
                >
                  <Picker.Item label="Nam" value="Male" />
                  <Picker.Item label="Nữ" value="Female" />
                  <Picker.Item label="Khác" value="Other" />
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ngày sinh</Text>
              <DatePickerField
                value={formData.dateOfBirth}
                placeholder="Chọn ngày sinh"
                onDateChange={handleDateChange}
                dateRange="past"
                title="Chọn ngày sinh"
                fieldStyle={styles.datePickerField}
              />
            </View>
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>

            {renderInputWithError("Email *", formData.email, "email", {
              placeholder: "Nhập email",
              placeholderTextColor: colors.textSecondary,
              keyboardType: "email-address",
              autoCapitalize: "none",
            })}

            {renderInputWithError(
              "Số điện thoại *",
              formData.phone_number,
              "phone_number",
              {
                placeholder: "Nhập số điện thoại",
                placeholderTextColor: colors.textSecondary,
                keyboardType: "phone-pad",
              }
            )}
          </View>

          {/* Address Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Địa chỉ</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Đường/Số nhà</Text>
              <TextInput
                style={styles.input}
                value={formData.address.street}
                onChangeText={(value) =>
                  handleInputChange("address.street", value)
                }
                placeholder="Nhập địa chỉ cụ thể"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Thành phố</Text>
              <TextInput
                style={styles.input}
                value={formData.address.city}
                onChangeText={(value) =>
                  handleInputChange("address.city", value)
                }
                placeholder="Nhập thành phố"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tỉnh/Thành phố</Text>
              <TextInput
                style={styles.input}
                value={formData.address.state}
                onChangeText={(value) =>
                  handleInputChange("address.state", value)
                }
                placeholder="Nhập tỉnh/thành phố"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mã bưu điện</Text>
              <TextInput
                style={styles.input}
                value={formData.address.postal_code}
                onChangeText={(value) =>
                  handleInputChange("address.postal_code", value)
                }
                placeholder="Nhập mã bưu điện"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Quốc gia</Text>
              <TextInput
                style={styles.input}
                value={formData.address.country}
                onChangeText={(value) =>
                  handleInputChange("address.country", value)
                }
                placeholder="Nhập quốc gia"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onClose}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? "Đang cập nhật..." : "Cập nhật"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: "white",
  },
  closeButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: "white",
  },
  inputError: {
    borderColor: colors.error || "#ff4444",
  },
  errorText: {
    fontSize: 12,
    color: colors.error || "#ff4444",
    marginTop: 4,
    marginLeft: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: "white",
  },
  picker: {
    height: 50,
  },
  datePickerField: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: "white",
    marginBottom: 0,
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: "white",
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: colors.lightGray,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
  },
  submitButton: {
    backgroundColor: colors.primary,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
});

export default ProfileUpdateModal;
