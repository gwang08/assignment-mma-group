import React from "react";
import {View, Text, StyleSheet} from "react-native";
import FormPicker from "./FormPicker";
import FormInput from "./FormInput";
import colors from "../../../styles/colors";

const VaccinationResultForm = ({
  formData,
  setFormData,
  students,
  selectedCampaign,
}) => {
  const studentOptions = students.map((student) => ({
    label: `${student.first_name} ${student.last_name} - ${student.class_name}`,
    value: student._id,
  }));

  return (
    <>
      <View style={styles.campaignInfo}>
        <Text style={styles.campaignInfoTitle}>Chiến dịch:</Text>
        <Text style={styles.campaignInfoText}>{selectedCampaign?.title}</Text>
      </View>

      <FormPicker
        label="Học sinh"
        value={formData.studentId}
        onValueChange={(value) =>
          setFormData((prev) => ({...prev, studentId: value}))
        }
        options={studentOptions}
        placeholder="Chọn học sinh"
        required={true}
        error={!formData.studentId}
        title="Chọn học sinh"
        message="Vui lòng chọn học sinh để thêm kết quả tiêm chủng:"
      />

      <FormInput
        label="Ghi chú"
        value={formData.notes}
        onChangeText={(text) => setFormData((prev) => ({...prev, notes: text}))}
        placeholder="Ghi chú về kết quả tiêm chủng (bắt buộc)..."
        multiline={true}
        numberOfLines={4}
        required={true}
        error={!formData.notes}
        returnKeyType="done"
      />
    </>
  );
};

const styles = StyleSheet.create({
  campaignInfo: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 15,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  campaignInfoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 5,
  },
  campaignInfoText: {
    fontSize: 16,
    color: colors.text,
  },
});

export default VaccinationResultForm;
