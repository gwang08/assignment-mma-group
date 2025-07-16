import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import colors from "../../../styles/colors";

const FIELD_LABELS = {
  event_type: "Loại sự kiện",
  severity: "Mức độ nghiêm trọng",
  status: "Trạng thái",
  description: "Mô tả",
  student: "Học sinh",
  symptoms: "Triệu chứng",
  treatment_notes: "Ghi chú điều trị",
  follow_up_required: "Cần theo dõi tiếp",
  createdAt: "Ngày tạo",
  created_by: "Người tạo",
};

function formatValue(key, value) {
  if (value === null || value === undefined || value === "") return "không có";
  if (key === "student") {
    if (typeof value === "object" && value !== null)
      return `${value.first_name || "không có"} ${
        value.last_name || "không có"
      } - ${value.class_name || "không có"}`;
    return "không có";
  }
  if (key === "created_by") {
    if (typeof value === "object" && value !== null)
      return `${value.first_name || "không có"} ${
        value.last_name || "không có"
      }`;
    return "không có";
  }
  if (key === "createdAt") {
    return value ? new Date(value).toLocaleString("vi-VN") : "không có";
  }
  if (key === "symptoms") {
    return Array.isArray(value)
      ? value.length > 0
        ? value.join(", ")
        : "không có"
      : String(value);
  }
  if (key === "follow_up_required") {
    return value ? "Có" : "Không";
  }
  return String(value);
}

// Hàm lấy màu cho severity
function getSeverityColor(severity) {
  switch (severity) {
    case "Emergency":
      return "#FF4757";
    case "High":
      return "#FF6B6B";
    case "Medium":
      return "#FFA502";
    case "Low":
      return "#2ED573";
    default:
      return "#747D8C";
  }
}
// Hàm lấy màu cho status
function getStatusColor(status) {
  switch (status) {
    case "Open":
      return "#FFA502";
    case "In Progress":
      return "#3742FA";
    case "Resolved":
      return "#2ED573";
    case "Referred to Hospital":
      return "#FF4757";
    default:
      return "#747D8C";
  }
}
// Hàm lấy màu cho event_type (có thể tuỳ chỉnh thêm)
function getTypeColor(type) {
  switch (type) {
    case "Accident":
      return "#FF6B6B";
    case "Fever":
      return "#FFA502";
    case "Injury":
      return "#3742FA";
    case "Epidemic":
      return "#2ED573";
    case "Other":
      return "#747D8C";
    default:
      return "#747D8C";
  }
}

const FIELDS = [
  "event_type",
  "severity",
  "status",
  "description",
  "student",
  "symptoms",
  "treatment_notes",
  "follow_up_required",
  "createdAt",
  "created_by",
];

const EventDetailModal = ({
  visible,
  onClose,
  data = {},
  title = "Chi tiết",
  actions = [],
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>{title}</Text>
          <ScrollView style={{maxHeight: 350}}>
            {FIELDS.map((key) => (
              <View key={key} style={styles.row}>
                <Text style={styles.label}>{FIELD_LABELS[key] || key}:</Text>
                {key === "severity" ? (
                  <Text
                    style={[
                      styles.value,
                      styles.badge,
                      {backgroundColor: getSeverityColor(data[key])},
                    ]}
                  >
                    {formatValue(key, data[key])}
                  </Text>
                ) : key === "status" ? (
                  <Text
                    style={[
                      styles.value,
                      styles.badge,
                      {backgroundColor: getStatusColor(data[key])},
                    ]}
                  >
                    {formatValue(key, data[key])}
                  </Text>
                ) : key === "event_type" ? (
                  <Text
                    style={[
                      styles.value,
                      styles.badge,
                      {backgroundColor: getTypeColor(data[key])},
                    ]}
                  >
                    {formatValue(key, data[key])}
                  </Text>
                ) : (
                  <Text style={styles.value}>
                    {formatValue(key, data[key])}
                  </Text>
                )}
              </View>
            ))}
          </ScrollView>
          <View style={styles.actions}>
            {actions.map((action, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.actionBtn,
                  action.style === "danger" && {backgroundColor: "#FF6B6B"},
                ]}
                onPress={action.onPress}
              >
                <Text style={styles.actionText}>{action.text}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 16,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    marginBottom: 6, // giảm khoảng cách giữa các dòng
    alignItems: "flex-start",
  },
  label: {
    fontWeight: "bold",
    flex: 1, // label chiếm ít hơn
    color: colors.text,
    marginRight: 6, // giảm khoảng cách giữa label và value
    minWidth: 70, // giảm minWidth
  },
  value: {
    flex: 2, // value chiếm nhiều hơn
    color: colors.text,
    marginLeft: 0, // bỏ marginLeft
  },
  badge: {
    color: "#fff",
    borderRadius: 8,
    paddingHorizontal: 8,
    alignSelf: "flex-start",
    textAlign: "center",
    width: 120,
    paddingVertical: 4,
    fontWeight: "bold",
    marginBottom: 0,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 18,
    flexWrap: "no-wrap",
    gap: 8,
  },
  actionBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginLeft: 8,
  },
  actionText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  closeBtn: {
    backgroundColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginLeft: 8,
  },
  closeText: {
    color: "#333",
    fontWeight: "bold",
    fontSize: 15,
  },
});

export default EventDetailModal;
