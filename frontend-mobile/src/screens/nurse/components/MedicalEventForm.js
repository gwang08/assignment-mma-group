import React from "react";
import {View, Text, Switch} from "react-native";
import FormPicker from "../../../components/common/FormPicker";
import FormInput from "../../../components/common/FormInput";
import ModalForm from "./ModalForm";
import colors from "../../../styles/colors";

const EVENT_TYPE = [
  {label: "Tai nạn", value: "Accident"},
  {label: "Sốt", value: "Fever"},
  {label: "Chấn thương", value: "Injury"},
  {label: "Dịch bệnh", value: "Epidemic"},
  {label: "Khác", value: "Other"},
];
const EVENT_STATUS = [
  {label: "Mở", value: "Open"},
  {label: "Đang xử lý", value: "In Progress"},
  {label: "Đã giải quyết", value: "Resolved"},
  {label: "Chuyển viện", value: "Referred to Hospital"},
];
const EVENT_SEVERITY = [
  {label: "Thấp", value: "Low"},
  {label: "Trung bình", value: "Medium"},
  {label: "Cao", value: "High"},
  {label: "Khẩn cấp", value: "Emergency"},
];

const MedicalEventForm = ({
  formData,
  setFormData,
  onSave,
  students = [],
  loading,
  isEdit = false,
  onClose,
}) => {
  return (
    <ModalForm
      visible={true}
      title={isEdit ? "Chỉnh Sửa Sự Kiện Y Tế" : "Tạo Sự Kiện Y Tế Mới"}
      onClose={onClose}
      onSave={onSave}
      saveButtonText={isEdit ? "Lưu Thay Đổi" : "Tạo Sự Kiện"}
      disabled={
        !formData.studentId ||
        !formData.event_type ||
        !formData.description ||
        !formData.severity
      }
      loading={loading}
    >
      <View style={{gap: 16}}>
        <FormPicker
          label="Học sinh"
          value={formData.studentId}
          onValueChange={(value) =>
            setFormData((f) => ({...f, studentId: value}))
          }
          options={
            Array.isArray(students)
              ? students.map((student) => ({
                  label: `${student.first_name} ${student.last_name} - ${student.class_name}`,
                  value: student._id,
                }))
              : []
          }
          placeholder={students.length === 0 ? "Đang tải..." : "Chọn học sinh"}
          required={true}
          error={!formData.studentId}
        />
        <FormPicker
          label="Loại sự kiện "
          value={formData.event_type}
          onValueChange={(value) =>
            setFormData((f) => ({...f, event_type: value}))
          }
          options={EVENT_TYPE}
          placeholder="Chọn loại sự kiện"
          required={true}
          error={!formData.event_type}
        />
        <FormPicker
          label="Mức độ nghiêm trọng"
          value={formData.severity}
          onValueChange={(value) =>
            setFormData((f) => ({...f, severity: value}))
          }
          options={EVENT_SEVERITY}
          placeholder="Chọn mức độ"
          required={true}
          error={!formData.severity}
        />
        <FormInput
          label="Mô tả chi tiết"
          value={formData.description}
          onChangeText={(text) =>
            setFormData((f) => ({...f, description: text}))
          }
          placeholder="Mô tả chi tiết về sự kiện y tế..."
          multiline={true}
          numberOfLines={3}
          required={true}
          error={!formData.description}
        />
        <FormPicker
          label="Trạng thái"
          value={formData.status}
          onValueChange={(value) => setFormData((f) => ({...f, status: value}))}
          options={EVENT_STATUS}
          placeholder="Chọn trạng thái"
        />
        <FormInput
          label="Triệu chứng"
          value={formData.symptoms}
          onChangeText={(text) => setFormData((f) => ({...f, symptoms: text}))}
          placeholder="Ví dụ: Sốt, Đau đầu, Buồn nôn (phân cách bằng dấu phẩy)"
        />
        <FormInput
          label="Ghi chú điều trị"
          value={formData.treatment_notes}
          onChangeText={(text) =>
            setFormData((f) => ({...f, treatment_notes: text}))
          }
          placeholder="Ghi chú về điều trị..."
          multiline={true}
          numberOfLines={2}
        />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 10,
            marginBottom: 15,
          }}
        >
          <Text style={{fontSize: 16, fontWeight: "bold"}}>
            Cần theo dõi tiếp
          </Text>
          <Switch
            value={formData.follow_up_required}
            onValueChange={(value) =>
              setFormData((f) => ({...f, follow_up_required: value}))
            }
            trackColor={{false: "#767577", true: colors.primary}}
            thumbColor={formData.follow_up_required ? "#fff" : "#f4f3f4"}
          />
        </View>
      </View>
    </ModalForm>
  );
};

export default MedicalEventForm;
