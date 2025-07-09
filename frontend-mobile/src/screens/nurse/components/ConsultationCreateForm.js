import React from "react";
import {View, Text, TouchableOpacity, Modal, ScrollView} from "react-native";
import FormPicker from "../../../components/common/FormPicker";
import FormInput from "../../../components/common/FormInput";
import DatePickerField from "../../../components/common/DatePickerField";
import colors from "../../../styles/colors";

function FieldCampaignPicker({value, onChange, campaigns, error}) {
  return (
    <FormPicker
      label="Chiến dịch"
      value={value}
      onValueChange={onChange}
      options={campaigns.map((c) => ({
        value: c._id,
        label: c.name || c.title || c._id,
      }))}
      placeholder="Chọn chiến dịch..."
      required
      error={error}
    />
  );
}
function FieldStudentPicker({value, onChange, students, error}) {
  return (
    <FormPicker
      label="Học sinh"
      value={value}
      onValueChange={onChange}
      options={students.map((s) => ({
        value: s._id,
        label:
          s.first_name +
          " " +
          s.last_name +
          (s.class_name ? " - Lớp " + s.class_name : ""),
      }))}
      placeholder="Chọn học sinh..."
      required
      error={error}
    />
  );
}
function FieldParentPicker({value, onChange, parents, error, disabled}) {
  return (
    <FormPicker
      label="Phụ huynh đi cùng"
      value={value}
      onValueChange={onChange}
      options={parents.map((p) => ({
        value: p._id,
        label:
          p.first_name +
          " " +
          p.last_name +
          (p.phone_number ? " - " + p.phone_number : ""),
      }))}
      placeholder="Chọn phụ huynh..."
      required
      error={error}
      disabled={disabled}
    />
  );
}
function FieldDate({value, onChange, error, disabled}) {
  return (
    <>
      <Text style={{marginBottom: 4}}>Ngày tư vấn:</Text>
      <DatePickerField
        value={value ? new Date(value) : null}
        onDateChange={(date) => onChange(date.toISOString().slice(0, 10))}
        placeholder="Chọn ngày tư vấn..."
        disabled={disabled}
        dateRange="future"
      />
      {error && (
        <Text style={{color: "red", fontSize: 12}}>Vui lòng chọn ngày</Text>
      )}
    </>
  );
}
function FieldDuration({value, onChange}) {
  return (
    <FormInput
      label="Thời lượng (phút)"
      value={value}
      onChangeText={onChange}
      placeholder="30"
      keyboardType="numeric"
    />
  );
}
function FieldReason({value, onChange, error}) {
  return (
    <FormInput
      label="Lý do"
      value={value}
      onChangeText={onChange}
      placeholder="Nhập lý do..."
      required
      error={error}
    />
  );
}
function FieldNotes({value, onChange}) {
  return (
    <FormInput
      label="Ghi chú"
      value={value}
      onChangeText={onChange}
      placeholder="Nhập ghi chú..."
      multiline
      numberOfLines={2}
    />
  );
}

export default function ConsultationCreateForm({
  visible,
  formData,
  setFormData,
  onSave,
  creating,
  onClose,
  campaigns,
  students,
  filteredParents,
}) {
  if (!visible) return null;
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.3)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: "90%",
            maxHeight: "80%",
            backgroundColor: "#fff",
            borderRadius: 12,
            padding: 0,
            overflow: "hidden",
            justifyContent: "flex-start",
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: colors.primary,
              marginBottom: 10,
              textAlign: "center",
              paddingTop: 20,
              paddingBottom: 12,
              backgroundColor: "#fff",
              borderBottomWidth: 1,
              borderBottomColor: "#eee",
            }}
          >
            Tạo lịch tư vấn mới
          </Text>
          <ScrollView
            contentContainerStyle={{
              padding: 20,
              paddingTop: 0,
              paddingBottom: 0,
            }}
            showsVerticalScrollIndicator={false}
          >
            <FieldCampaignPicker
              value={formData.campaignResult}
              onChange={(v) => setFormData((f) => ({...f, campaignResult: v}))}
              campaigns={campaigns}
              error={!formData.campaignResult}
            />
            <FieldStudentPicker
              value={formData.student}
              onChange={(v) => setFormData((f) => ({...f, student: v}))}
              students={students}
              error={!formData.student}
            />
            <FieldParentPicker
              value={formData.attending_parent}
              onChange={(v) =>
                setFormData((f) => ({...f, attending_parent: v}))
              }
              parents={filteredParents}
              error={!formData.attending_parent}
              disabled={filteredParents.length === 0}
            />
            <FieldDate
              value={formData.scheduledDate}
              onChange={(v) => setFormData((f) => ({...f, scheduledDate: v}))}
              error={!formData.scheduledDate}
              disabled={creating}
            />
            <FieldDuration
              value={formData.duration}
              onChange={(v) => setFormData((f) => ({...f, duration: v}))}
            />
            <FieldReason
              value={formData.reason}
              onChange={(v) => setFormData((f) => ({...f, reason: v}))}
              error={!formData.reason}
            />
            <FieldNotes
              value={formData.notes}
              onChange={(v) => setFormData((f) => ({...f, notes: v}))}
            />
          </ScrollView>
          <View
            style={{
              flexDirection: "row",
              gap: 12,
              padding: 20,
              borderTopWidth: 1,
              borderTopColor: "#eee",
              backgroundColor: "#fff",
            }}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: colors.primary,
                borderRadius: 8,
                padding: 12,
                alignItems: "center",
              }}
              onPress={onSave}
              disabled={creating}
            >
              <Text style={{color: "#fff", fontWeight: "bold"}}>
                {creating ? "Đang tạo..." : "Tạo"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: "#ccc",
                borderRadius: 8,
                padding: 12,
                alignItems: "center",
              }}
              onPress={onClose}
              disabled={creating}
            >
              <Text style={{color: "#333", fontWeight: "bold"}}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
