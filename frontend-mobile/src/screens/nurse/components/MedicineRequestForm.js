import React from "react";
import {View} from "react-native";
import FormInput from "../../../components/common/FormInput";
import FormPicker from "../../../components/common/FormPicker";

const MedicineRequestForm = ({formData, setFormData, students}) => {
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
        label="Tên thuốc *"
        value={formData.medicine_name}
        onChangeText={(text) =>
          setFormData((prev) => ({...prev, medicine_name: text}))
        }
        placeholder="Nhập tên thuốc..."
        required={true}
        error={!formData.medicine_name}
      />

      <FormInput
        label="Lý do yêu cầu *"
        value={formData.reason}
        onChangeText={(text) =>
          setFormData((prev) => ({...prev, reason: text}))
        }
        placeholder="Mô tả lý do cần thuốc..."
        multiline={true}
        numberOfLines={3}
        required={true}
        error={!formData.reason}
      />

      <FormInput
        label="Liều lượng (1 lần)"
        value={formData.dosage}
        onChangeText={(text) =>
          setFormData((prev) => ({...prev, dosage: text}))
        }
        placeholder="Ví dụ: 500mg, 1 viên..."
      />

      <FormInput
        label="Tần suất (1 ngày)"
        value={formData.frequency}
        onChangeText={(text) =>
          setFormData((prev) => ({...prev, frequency: text}))
        }
        placeholder="Ví dụ: 2 lần/ngày, mỗi 8 giờ..."
      />

      <FormInput
        label="Thời gian điều trị"
        value={formData.duration}
        onChangeText={(text) =>
          setFormData((prev) => ({...prev, duration: text}))
        }
        placeholder="Ví dụ: 7 ngày, 2 tuần..."
      />
    </View>
  );
};

export default MedicineRequestForm;
