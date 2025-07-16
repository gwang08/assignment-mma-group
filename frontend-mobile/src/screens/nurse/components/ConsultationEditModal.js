import React, {useState, useEffect} from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import colors from "../../../styles/colors";
import nurseAPI from "../../../services/nurseApi";

function InfoGroup({title, children}) {
  return (
    <View style={{marginBottom: 18}}>
      <Text
        style={{
          fontWeight: "bold",
          color: colors.primary,
          fontSize: 15,
          marginBottom: 6,
        }}
      >
        {title}
      </Text>
      <View style={{paddingLeft: 8}}>{children}</View>
    </View>
  );
}

export default function ConsultationEditModal({
  visible,
  consultation,
  onClose,
  onUpdate,
}) {
  const [formData, setFormData] = useState({
    status: "",
    reason: "",
    notes: "",
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (consultation) {
      setFormData({
        status: consultation.status || "",
        reason: consultation.reason || "",
        notes: consultation.notes || "",
      });
    }
  }, [consultation]);

  const handleUpdate = async () => {
    if (!consultation) return;

    // Check if at least one field has been modified
    const hasChanges =
      formData.status !== consultation.status ||
      formData.reason !== consultation.reason ||
      formData.notes !== consultation.notes;

    if (!hasChanges) {
      Alert.alert("Thông báo", "Không có thay đổi nào để cập nhật");
      return;
    }

    setUpdating(true);
    try {
      const updateData = {};
      if (formData.status !== consultation.status)
        updateData.status = formData.status;
      if (formData.reason !== consultation.reason)
        updateData.reason = formData.reason;
      if (formData.notes !== consultation.notes)
        updateData.notes = formData.notes;

      await nurseAPI.updateConsultationSchedule(consultation._id, updateData);
      Alert.alert("Thành công", "Đã cập nhật thông tin lịch tư vấn");
      onUpdate();
      onClose();
    } catch (error) {
      Alert.alert("Lỗi", error.message || "Không thể cập nhật lịch tư vấn");
    }
    setUpdating(false);
  };

  if (!consultation) return null;

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
              textAlign: "center",
              paddingTop: 20,
              paddingBottom: 12,
              backgroundColor: "#fff",
              borderBottomWidth: 1,
              borderBottomColor: "#eee",
              marginBottom: 0,
            }}
          >
            Chỉnh sửa lịch tư vấn
          </Text>
          <ScrollView
            contentContainerStyle={{padding: 20, paddingBottom: 0}}
            showsVerticalScrollIndicator={false}
          >
            <InfoGroup title="Thông tin học sinh">
              <Text style={{fontSize: 16, marginBottom: 2}}>
                Họ tên: {consultation.student?.first_name || ""}{" "}
                {consultation.student?.last_name || "" || "Không có"}
              </Text>
              <Text style={{fontSize: 16, marginBottom: 0}}>
                Lớp: {consultation.student?.class_name || "Không có"}
              </Text>
            </InfoGroup>

            <InfoGroup title="Trạng thái">
              <View style={{marginBottom: 8}}>
                <Text style={{fontSize: 14, marginBottom: 4, color: "#666"}}>
                  Trạng thái hiện tại:{" "}
                  <Text
                    style={{
                      color:
                        consultation.status === "Scheduled"
                          ? "#007AFF"
                          : consultation.status === "Completed"
                          ? "#34C759"
                          : consultation.status === "Cancelled"
                          ? "#FF3B30"
                          : "#666",
                      fontWeight: "bold",
                    }}
                  >
                    {consultation.status === "Scheduled"
                      ? "Đã lên lịch"
                      : consultation.status === "Completed"
                      ? "Hoàn thành"
                      : consultation.status === "Cancelled"
                      ? "Đã hủy"
                      : consultation.status || "Không có"}
                  </Text>
                </Text>
                <View style={{flexDirection: "row", flexWrap: "wrap", gap: 8}}>
                  {["Scheduled", "Completed", "Cancelled"].map((status) => {
                    const statusColor =
                      status === "Scheduled"
                        ? "#007AFF"
                        : status === "Completed"
                        ? "#34C759"
                        : "#FF3B30";

                    return (
                      <TouchableOpacity
                        key={status}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 6,
                          borderWidth: 1,
                          borderColor:
                            formData.status === status ? statusColor : "#ddd",
                          backgroundColor:
                            formData.status === status ? statusColor : "#fff",
                        }}
                        onPress={() => setFormData({...formData, status})}
                      >
                        <Text
                          style={{
                            color: formData.status === status ? "#fff" : "#333",
                            fontSize: 14,
                          }}
                        >
                          {status === "Scheduled"
                            ? "Đã lên lịch"
                            : status === "Completed"
                            ? "Hoàn thành"
                            : status === "Cancelled"
                            ? "Đã hủy"
                            : status}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </InfoGroup>

            <InfoGroup title="Lý do tư vấn">
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: "#ddd",
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  backgroundColor: "#fff",
                  minHeight: 80,
                  textAlignVertical: "top",
                }}
                value={formData.reason}
                onChangeText={(text) =>
                  setFormData({...formData, reason: text})
                }
                placeholder="Nhập lý do tư vấn..."
                multiline
              />
            </InfoGroup>

            <InfoGroup title="Ghi chú">
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: "#ddd",
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  backgroundColor: "#fff",
                  minHeight: 100,
                  textAlignVertical: "top",
                }}
                value={formData.notes}
                onChangeText={(text) => setFormData({...formData, notes: text})}
                placeholder="Nhập ghi chú..."
                multiline
              />
            </InfoGroup>
          </ScrollView>
          <View
            style={{
              padding: 20,
              borderTopWidth: 1,
              borderTopColor: "#eee",
              backgroundColor: "#fff",
              flexDirection: "row",
              gap: 12,
            }}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: "#f0f0f0",
                borderRadius: 8,
                padding: 14,
                alignItems: "center",
              }}
              onPress={onClose}
              disabled={updating}
            >
              <Text style={{color: "#666", fontWeight: "bold", fontSize: 16}}>
                Hủy
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: colors.primary,
                borderRadius: 8,
                padding: 14,
                alignItems: "center",
                opacity: updating ? 0.6 : 1,
              }}
              onPress={handleUpdate}
              disabled={updating}
            >
              <Text style={{color: "#fff", fontWeight: "bold", fontSize: 16}}>
                {updating ? "Đang cập nhật..." : "Cập nhật"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
