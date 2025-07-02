import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { parentAPI } from "../../services/parentApi";
import ParentLayout from "../../components/ParentLayout";
import colors from "../../styles/colors";

const LinkStudentRequestScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    studentId: "",
    relationship: "",
    is_emergency_contact: false,
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const relationshipOptions = [
    { value: "parent", label: "Cha/Mẹ" },
    { value: "guardian", label: "Người giám hộ" },
    { value: "grandparent", label: "Ông/Bà" },
    { value: "relative", label: "Họ hàng" },
    { value: "other", label: "Khác" },
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.studentId.trim()) {
      newErrors.studentId = "Vui lòng nhập mã số học sinh";
    }

    if (!formData.relationship.trim()) {
      newErrors.relationship = "Vui lòng chọn mối quan hệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      await parentAPI.requestLinkToStudent({
        studentId: formData.studentId.trim(),
        relationship: formData.relationship,
        is_emergency_contact: formData.is_emergency_contact,
        notes: formData.notes.trim(),
      });

      Alert.alert(
        "Thành công",
        "Yêu cầu liên kết học sinh đã được gửi thành công. Vui lòng đợi admin phê duyệt.",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );

      // Reset form
      setFormData({
        studentId: "",
        relationship: "",
        is_emergency_contact: false,
        notes: "",
      });
      setErrors({});
    } catch (error) {
      console.error("Submit link request error:", error);
      Alert.alert(
        "Lỗi",
        error.message || "Không thể gửi yêu cầu. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const RelationshipPicker = () => (
    <View style={styles.pickerContainer}>
      <Text style={styles.label}>
        Mối quan hệ <Text style={styles.required}>*</Text>
      </Text>
      <View style={styles.relationshipOptions}>
        {relationshipOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.relationshipOption,
              formData.relationship === option.value &&
                styles.relationshipOptionSelected,
            ]}
            onPress={() => updateFormData("relationship", option.value)}
          >
            <Text
              style={[
                styles.relationshipOptionText,
                formData.relationship === option.value &&
                  styles.relationshipOptionTextSelected,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors.relationship && (
        <Text style={styles.errorText}>{errors.relationship}</Text>
      )}
    </View>
  );

  return (
    <ParentLayout navigation={navigation} title="Yêu Cầu Liên Kết Học Sinh">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Yêu Cầu Liên Kết Học Sinh</Text>
              <Text style={styles.subtitle}>
                Điền thông tin để gửi yêu cầu liên kết với học sinh
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Student ID */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Mã số học sinh <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, errors.studentId && styles.inputError]}
                  placeholder="Nhập mã số học sinh"
                  value={formData.studentId}
                  onChangeText={(value) => updateFormData("studentId", value)}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {errors.studentId && (
                  <Text style={styles.errorText}>{errors.studentId}</Text>
                )}
              </View>

              {/* Relationship */}
              <RelationshipPicker />

              {/* Emergency Contact */}
              <View style={styles.inputGroup}>
                <View style={styles.switchContainer}>
                  <View style={styles.switchLabel}>
                    <Text style={styles.label}>Liên hệ khẩn cấp</Text>
                    <Text style={styles.switchDescription}>
                      Đăng ký làm người liên hệ khẩn cấp cho học sinh
                    </Text>
                  </View>
                  <Switch
                    value={formData.is_emergency_contact}
                    onValueChange={(value) =>
                      updateFormData("is_emergency_contact", value)
                    }
                    trackColor={{
                      false: colors.border,
                      true: colors.primaryLight,
                    }}
                    thumbColor={
                      formData.is_emergency_contact
                        ? colors.primary
                        : colors.textSecondary
                    }
                  />
                </View>
              </View>

              {/* Notes */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Ghi chú</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Thông tin bổ sung (tùy chọn)"
                  value={formData.notes}
                  onChangeText={(value) => updateFormData("notes", value)}
                  multiline={true}
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  loading && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? "Đang gửi..." : "Gửi Yêu Cầu"}
                </Text>
              </TouchableOpacity>

              {/* Info */}
              <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>Lưu ý:</Text>
                <Text style={styles.infoText}>
                  • Yêu cầu sẽ được gửi đến admin để xem xét và phê duyệt
                </Text>
                <Text style={styles.infoText}>
                  • Bạn sẽ nhận được thông báo khi yêu cầu được xử lý
                </Text>
                <Text style={styles.infoText}>
                  • Đảm bảo mã số học sinh chính xác để tránh delay
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ParentLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  form: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  required: {
    color: colors.error,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  inputError: {
    borderColor: colors.error,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    marginTop: 4,
  },
  pickerContainer: {
    marginBottom: 8,
  },
  relationshipOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  relationshipOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  relationshipOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  relationshipOptionText: {
    fontSize: 14,
    color: colors.text,
  },
  relationshipOptionTextSelected: {
    color: colors.surface,
    fontWeight: "600",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  switchLabel: {
    flex: 1,
    marginRight: 16,
  },
  switchDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.surface,
  },
  infoContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
});

export default LinkStudentRequestScreen;
