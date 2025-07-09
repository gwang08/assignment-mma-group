import React from "react";
import {View, Text, TextInput} from "react-native";
import ModalForm from "./ModalForm";

const MedicationModalForm = ({
  medicationForm,
  setMedicationForm,
  onSave,
  visible,
  onClose,
  loading,
}) => {
  return (
    <ModalForm
      visible={visible}
      title="Thêm Thuốc Cho Sự Kiện"
      onClose={onClose}
      onSave={onSave}
      saveButtonText="Lưu Thuốc"
      disabled={!medicationForm.name || !medicationForm.dosage}
      loading={loading}
    >
      <View style={{gap: 16}}>
        <Text style={{fontWeight: "bold"}}>Tên thuốc *</Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 8,
            padding: 10,
          }}
          value={medicationForm.name}
          onChangeText={(text) =>
            setMedicationForm((f) => ({...f, name: text}))
          }
          placeholder="Nhập tên thuốc"
        />
        <Text style={{fontWeight: "bold"}}>Liều lượng *</Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 8,
            padding: 10,
          }}
          value={medicationForm.dosage}
          onChangeText={(text) =>
            setMedicationForm((f) => ({...f, dosage: text}))
          }
          placeholder="Nhập liều lượng"
        />
        <Text style={{fontWeight: "bold"}}>Thời gian</Text>
        <View
          style={{
            padding: 10,
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 8,
            backgroundColor: "#f5f5f5",
          }}
        >
          <Text>{medicationForm.time.toLocaleString()}</Text>
        </View>
      </View>
    </ModalForm>
  );
};

export default MedicationModalForm;
