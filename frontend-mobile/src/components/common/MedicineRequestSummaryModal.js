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
                          Liều lượng (1 lần): {medicine.dosage} • Tần suất (1
                          ngày): {medicine.frequency}
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

            {/* Summary Action Buttons - Fixed at bottom */}
            <View style={styles.summaryActionsContainer}>
              <View style={styles.summaryFooter}>
                <Ionicons
                  name="shield-checkmark"
                  size={12}
                  color={colors.success}
                />
                <Text style={styles.summaryFooterText}>
                  Thông tin đã được kiểm tra
                </Text>
              </View>

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
    height: "100%",
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    flexDirection: "column",
  },
  summaryHeader: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  modalScrollView: {
    flex: 1,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    paddingBottom: 8,
  },
  summaryCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    margin: 4,
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
  },
  summaryCardFull: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  summaryCardVertical: {
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
  },
  summaryCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryCardLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 2,
    textAlign: "center",
  },
  summaryCardValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text,
    textAlign: "center",
  },
  summaryMedicineList: {
    width: "100%",
    marginTop: 10,
    paddingVertical: 10,
    borderTopWidth: 2,
    borderTopColor: colors.primary + "30",
  },
  summaryMedicineItem: {
    marginBottom: 8,
    paddingLeft: 8,
  },
  summaryMedicineName: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 2,
  },
  summaryMedicineDetails: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  summaryMedicineNotes: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: "italic",
  },
  summaryActionsContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: "white",
  },
  summaryFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.info + "15",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryFooterText: {
    fontSize: 11,
    color: colors.info,
    marginLeft: 4,
    fontStyle: "italic",
  },
  summaryActions: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  summaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  summaryBackButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  summaryBackButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  summaryConfirmButton: {
    backgroundColor: colors.primary,
  },
  summaryConfirmButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default MedicineRequestSummaryModal;
