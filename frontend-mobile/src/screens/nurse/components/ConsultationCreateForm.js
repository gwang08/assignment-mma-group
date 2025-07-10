import React, {useState} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import FormPicker from "../../../components/common/FormPicker";
import FormInput from "../../../components/common/FormInput";
import DatePickerField from "../../../components/common/DatePickerField";
import colors from "../../../styles/colors";
import {formatVietnamesePhoneNumber} from "../../../utils/phoneUtils";
import {formatDuration} from "../../../utils/timeUtils";
import nurseAPI from "../../../services/nurseApi";
import Icon from "react-native-vector-icons/MaterialIcons";

function FieldCampaignPicker({value, onChange, campaigns, error}) {
  // Ensure campaigns is an array and filter out any invalid entries
  const validCampaigns = Array.isArray(campaigns)
    ? campaigns.filter((c) => c && c._id)
    : [];

  return (
    <FormPicker
      label="Kết quả chiến dịch"
      value={value}
      onValueChange={onChange}
      options={validCampaigns.map((c) => {
        const campaignTitle = c.campaign?.title || "Chiến dịch";
        const studentFirstName = c.student?.first_name || "";
        const studentLastName = c.student?.last_name || "";
        const studentName = `${studentFirstName} ${studentLastName}`.trim();

        return {
          value: c._id,
          label: `${campaignTitle} - ${studentName}`,
        };
      })}
      placeholder="Chọn kết quả chiến dịch..."
      required
      error={error}
    />
  );
}

function FieldStudentInfo({campaignResult, campaigns}) {
  if (!campaignResult) {
    return (
      <View style={{marginBottom: 15}}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: colors.text,
            marginBottom: 8,
          }}
        >
          Học sinh
        </Text>
        <Text style={{color: "#999", fontSize: 16}}>
          Vui lòng chọn kết quả chiến dịch
        </Text>
      </View>
    );
  }

  const selectedCampaignResult = campaigns.find(
    (c) => c._id === campaignResult
  );
  if (!selectedCampaignResult?.student) {
    return (
      <View style={{marginBottom: 15}}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: colors.text,
            marginBottom: 8,
          }}
        >
          Học sinh
        </Text>
        <Text style={{color: "#999", fontSize: 16}}>
          Không tìm thấy thông tin học sinh
        </Text>
      </View>
    );
  }

  const student = selectedCampaignResult.student;
  return (
    <View style={{marginBottom: 15}}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: colors.text,
          marginBottom: 8,
        }}
      >
        Học sinh
      </Text>
      <View
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 12,
          backgroundColor: "#f9f9f9",
        }}
      >
        <Text style={{color: colors.text, fontSize: 16}}>
          {student.first_name} {student.last_name}
          {student.class_name ? ` - Lớp ${student.class_name}` : ""}
        </Text>
      </View>
    </View>
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
          (p.phone_number
            ? " - " + formatVietnamesePhoneNumber(p.phone_number)
            : ""),
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
        backgroundColor="white"
      />
      {error && (
        <Text style={{color: "red", fontSize: 12}}>Vui lòng chọn ngày</Text>
      )}
    </>
  );
}
function FieldDuration({value, onChange}) {
  return (
    <View style={{marginBottom: 15}}>
      <FormInput
        label="Thời lượng (phút)"
        value={value}
        onChangeText={onChange}
        placeholder="30"
        keyboardType="numeric"
      />
      {value && (
        <Text style={{fontSize: 12, color: colors.textSecondary, marginTop: 4}}>
          Tương đương: {formatDuration(parseInt(value) || 0)}
        </Text>
      )}
    </View>
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
  filteredParents,
}) {
  const [checkingOverlap, setCheckingOverlap] = useState(false);

  const handleCheckOverlap = async () => {
    if (!formData.scheduledDate) {
      Alert.alert("Lỗi", "Vui lòng chọn ngày tư vấn trước khi kiểm tra");
      return;
    }

    setCheckingOverlap(true);
    try {
      const result = await nurseAPI.checkConsultationOverlap(
        formData.scheduledDate,
        formData.duration
      );

      if (result.data?.hasOverlap) {
        const conflict = result.data.conflictingConsultation;
        const formatDate = (dateString) => {
          const date = new Date(dateString);
          return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
        };

        Alert.alert(
          "Xung đột lịch",
          `Thời gian này xung đột với lịch tư vấn khác:\n\nHọc sinh: ${
            conflict.studentName
          }\nNgày: ${formatDate(
            conflict.scheduledDate
          )}\nThời lượng: ${formatDuration(conflict.duration)}`,
          [{text: "OK"}]
        );
      } else {
        Alert.alert("Thông báo", "Thời gian này có thể sử dụng", [
          {text: "OK"},
        ]);
      }
    } catch (error) {
      Alert.alert("Lỗi", error.message || "Không thể kiểm tra xung đột lịch");
    } finally {
      setCheckingOverlap(false);
    }
  };

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
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: 20,
              paddingBottom: 12,
              paddingHorizontal: 20,
              backgroundColor: "#fff",
              borderBottomWidth: 1,
              borderBottomColor: "#eee",
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: colors.primary,
                flex: 1,
                textAlign: "center",
              }}
            >
              Tạo lịch tư vấn mới
            </Text>
            <TouchableOpacity
              onPress={onClose}
              disabled={creating}
              style={{
                padding: 4,
              }}
            >
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
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
            <FieldStudentInfo
              campaignResult={formData.campaignResult}
              campaigns={campaigns}
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
                opacity: creating ? 0.6 : 1,
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
                backgroundColor: "#FF9500",
                borderRadius: 8,
                padding: 12,
                alignItems: "center",
                opacity: checkingOverlap || creating ? 0.6 : 1,
              }}
              onPress={handleCheckOverlap}
              disabled={checkingOverlap || creating}
            >
              <Text style={{color: "#fff", fontWeight: "bold"}}>
                {checkingOverlap ? "Đang kiểm tra..." : "Kiểm tra xung đột"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
