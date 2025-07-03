import React from "react";
import {View, Text, TextInput, Switch, StyleSheet, Alert} from "react-native";
import colors from "../../../styles/colors";
import FormInput from "./FormInput";
import FormPicker from "./FormPicker";

const MedicalEventForm = ({formData, setFormData, students}) => {
  return (
    <View>
      <FormPicker
        label="Học sinh *"
        value={formData.studentId}
        onValueChange={(value) =>
          setFormData((prev) => ({...prev, studentId: value}))
        }
        items={students.map((student) => ({
          label: `${student.first_name} ${student.last_name} - ${student.class_name}`,
          value: student._id,
        }))}
        placeholder="Chọn học sinh"
        required={true}
        error={!formData.studentId}
      />

      <FormInput
        label="Loại sự kiện *"
        value={formData.event_type}
        onChangeText={(text) =>
          setFormData((prev) => ({...prev, event_type: text}))
        }
        placeholder="Ví dụ: Sốt, Chấn thương, Dị ứng..."
        required={true}
        error={!formData.event_type}
      />

      <FormInput
        label="Mô tả chi tiết *"
        value={formData.description}
        onChangeText={(text) =>
          setFormData((prev) => ({...prev, description: text}))
        }
        placeholder="Mô tả chi tiết về sự kiện y tế..."
        multiline={true}
        numberOfLines={3}
        required={true}
        error={!formData.description}
      />

      <FormPicker
        label="Mức độ nghiêm trọng"
        value={formData.severity}
        onValueChange={(value) =>
          setFormData((prev) => ({...prev, severity: value}))
        }
        items={[
          {label: "Thấp", value: "Low"},
          {label: "Trung bình", value: "Medium"},
          {label: "Cao", value: "High"},
          {label: "Khẩn cấp", value: "Emergency"},
        ]}
        placeholder="Chọn mức độ"
      />

      <FormInput
        label="Triệu chứng"
        value={formData.symptoms}
        onChangeText={(text) =>
          setFormData((prev) => ({...prev, symptoms: text}))
        }
        placeholder="Ví dụ: Sốt, Đau đầu, Buồn nôn (phân cách bằng dấu phẩy)"
      />

      <FormInput
        label="Ghi chú điều trị"
        value={formData.treatment_notes}
        onChangeText={(text) =>
          setFormData((prev) => ({...prev, treatment_notes: text}))
        }
        placeholder="Ghi chú về điều trị..."
        multiline={true}
        numberOfLines={2}
      />

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Cần theo dõi tiếp</Text>
        <Switch
          value={formData.follow_up_required}
          onValueChange={(value) =>
            setFormData((prev) => ({
              ...prev,
              follow_up_required: value,
            }))
          }
          trackColor={{false: "#767577", true: colors.primary}}
          thumbColor={formData.follow_up_required ? "#fff" : "#f4f3f4"}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingVertical: 10,
  },
  switchLabel: {
    fontSize: 16,
    color: colors.text,
    fontWeight: "500",
  },
});

export default MedicalEventForm;
