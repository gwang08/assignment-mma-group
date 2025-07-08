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

const MedicineRequestSummaryModal = ({
  visible,
  onClose,
  editingRequest,
  selectedStudentInfo,
  startDate,
  endDate,
  medicines,
  formatDateForSummary,
  onBackToEdit,
  onConfirm,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.enhancedSummarySection}>
            <View style={styles.summaryHeader}>
              <View style={styles.summaryIcon}>
                <Ionicons name="document-text" size={20} color="white" />
              </View>
              <Text style={styles.summaryTitle}>Tóm tắt yêu cầu</Text>
            </View>

            <ScrollView
              style={styles.modalScrollView}
              showsVerticalScrollIndicator={true}
            >
              <View style={styles.summaryGrid}>
                <View style={styles.summaryCard}>
                  <Ionicons name="person" size={16} color={colors.primary} />
                  <Text style={styles.summaryCardLabel}>Học sinh</Text>
                  <Text style={styles.summaryCardValue}>
                    {selectedStudentInfo?.first_name}{" "}
                    {selectedStudentInfo?.last_name}
                  </Text>
                </View>

                <View style={[styles.summaryCard, styles.summaryCardVertical]}>
                  <View style={styles.summaryCardHeader}>
                    <Ionicons
                      name="calendar"
                      size={16}
                      color={colors.primary}
                    />
                    <Text style={styles.summaryCardLabel}>
                      Thời gian sử dụng
                    </Text>
                  </View>
                  <Text style={styles.summaryCardValue}>
                    {formatDateForSummary(startDate)} -{" "}
                    {formatDateForSummary(endDate)}
                  </Text>
                </View>

                <View style={styles.summaryCard}>
                  <Ionicons name="medical" size={16} color={colors.primary} />
                  <Text style={styles.summaryCardLabel}>Chi tiết thuốc</Text>
                  <Text style={styles.summaryCardValue}>
                    {medicines.filter((m) => m.name.trim() !== "").length} loại
                  </Text>
                  <View style={styles.summaryMedicineList}>
                    {medicines.map((medicine, index) => (
                      <View key={index} style={styles.summaryMedicineItem}>
                        <Text style={styles.summaryMedicineName}>
                          {index + 1}. {medicine.name}
                        </Text>
                        <Text style={styles.summaryMedicineDetails}>
                          Liều lượng: {medicine.dosage} • Tần suất:{" "}
                          {medicine.frequency}
                        </Text>
                        {medicine.notes && (
                          <Text style={styles.summaryMedicineNotes}>
                            Ghi chú: {medicine.notes}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Summary Action Buttons */}
            <View style={styles.summaryActions}>
              <TouchableOpacity
                style={[styles.summaryButton, styles.summaryBackButton]}
                onPress={onBackToEdit}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="chevron-back"
                  size={20}
                  color={colors.primary}
                />
                <Text style={styles.summaryBackButtonText}>Quay lại</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.summaryButton, styles.summaryConfirmButton]}
                onPress={onConfirm}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={editingRequest ? "checkmark-done" : "send"}
                  size={20}
                  color="white"
                />
                <Text style={styles.summaryConfirmButtonText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.summaryFooter}>
              <Ionicons
                name="shield-checkmark"
                size={14}
                color={colors.success}
              />
              <Text style={styles.summaryFooterText}>
                Thông tin đã được kiểm tra và sẵn sàng gửi
              </Text>
            </View>
          </View>
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
  modalContent: {
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
  enhancedSummarySection: {
    padding: 20,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  modalScrollView: {
    maxHeight: "60%",
  },
  summaryGrid: {
    gap: 15,
  },
  summaryCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  summaryCardVertical: {
    // Additional styling for vertical cards if needed
  },
  summaryCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryCardLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    marginLeft: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  summaryCardValue: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginTop: 5,
  },
  summaryMedicineList: {
    marginTop: 10,
  },
  summaryMedicineItem: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryMedicineName: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 5,
  },
  summaryMedicineDetails: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 3,
  },
  summaryMedicineNotes: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: "italic",
  },
  summaryActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 15,
  },
  summaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  summaryBackButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  summaryBackButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  summaryConfirmButton: {
    backgroundColor: colors.primary,
  },
  summaryConfirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  summaryFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.success}20`,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.success,
  },
  summaryFooterText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default MedicineRequestSummaryModal;
