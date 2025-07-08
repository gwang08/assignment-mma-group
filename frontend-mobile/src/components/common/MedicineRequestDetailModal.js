import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../styles/colors";

const MedicineRequestDetailModal = ({
  visible,
  onClose,
  request,
  canEditRequest,
  getMedicineRequestStatus,
  getStudentName,
  formatDate,
  onEdit,
  onDelete,
}) => {
  if (!request) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.detailModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.detailModalTitle}>Chi tiết yêu cầu thuốc</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalBody}
            showsVerticalScrollIndicator={true}
          >
            {/* Action Buttons - positioned above student name */}
            {canEditRequest(request) ? (
              <View style={styles.detailActionButtons}>
                <TouchableOpacity
                  style={styles.smallEditButton}
                  onPress={() => {
                    onClose();
                    onEdit(request);
                  }}
                >
                  <Ionicons name="pencil" size={16} color={colors.primary} />
                  <Text style={styles.smallEditButtonText}>Chỉnh sửa</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.smallDeleteButton}
                  onPress={() => {
                    onClose();
                    onDelete(request);
                  }}
                >
                  <Ionicons name="trash" size={16} color={colors.error} />
                  <Text style={styles.smallDeleteButtonText}>Xóa</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.detailStatusWarning}>
                <Ionicons
                  name="warning-outline"
                  size={16}
                  color={colors.warning}
                />
                <Text style={styles.detailStatusWarningMessage}>
                  Yêu cầu {getMedicineRequestStatus(request).text.toLowerCase()}{" "}
                  không thể chỉnh sửa
                </Text>
              </View>
            )}

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Học sinh</Text>
              <Text style={styles.detailValue}>{getStudentName(request)}</Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Ngày tạo</Text>
              <Text style={styles.detailValue}>
                {formatDate(request.createdAt)}
              </Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Thời gian sử dụng</Text>
              <Text style={styles.detailValue}>
                {formatDate(request.startDate || request.start_date)} -{" "}
                {formatDate(request.endDate || request.end_date)}
              </Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Trạng thái</Text>
              <Text
                style={[
                  styles.detailValue,
                  {
                    color: getMedicineRequestStatus(request).color,
                  },
                ]}
              >
                {getMedicineRequestStatus(request).text}
              </Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Danh sách thuốc</Text>
              {(request.medicines && request.medicines.length > 0
                ? request.medicines
                : [
                    {
                      name: request.medicine_name || "N/A",
                      dosage: request.dosage || "N/A",
                      frequency: request.frequency || "N/A",
                      notes: request.instructions || "",
                    },
                  ]
              ).map((medicine, index) => (
                <View key={index} style={styles.medicineDetailCard}>
                  <Text style={styles.medicineDetailName}>{medicine.name}</Text>
                  <Text style={styles.medicineDetailText}>
                    Liều lượng: {medicine.dosage}
                  </Text>
                  <Text style={styles.medicineDetailText}>
                    Tần suất: {medicine.frequency}
                  </Text>
                  {medicine.notes && (
                    <Text style={styles.medicineDetailText}>
                      Ghi chú: {medicine.notes}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  detailModalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    width: "90%",
    maxHeight: "85%",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    padding: 20,
    maxHeight: "80%",
  },
  detailActionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  smallEditButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${colors.primary}20`,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  smallEditButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 5,
  },
  smallDeleteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${colors.error}20`,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.error,
  },
  smallDeleteButtonText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 5,
  },
  detailStatusWarning: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${colors.warning}20`,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  detailStatusWarningMessage: {
    color: colors.warning,
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
    flex: 1,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 5,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  medicineDetailCard: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  medicineDetailName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 5,
  },
  medicineDetailText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 3,
  },
});

export default MedicineRequestDetailModal;
