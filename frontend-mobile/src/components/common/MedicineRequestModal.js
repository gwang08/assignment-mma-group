import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../styles/colors";
import DatePickerField from "./DatePickerField";

const MedicineRequestModal = ({
  visible,
  onClose,
  editingRequest,
  selectedStudent,
  students,
  medicines,
  startDate,
  endDate,
  onStudentPress,
  onMedicineUpdate,
  onMedicineAdd,
  onMedicineRemove,
  onStartDateChange,
  onEndDateChange,
  onShowSummary,
  validateMedicines,
  getSelectedStudentInfo,
}) => {
  const resetForm = () => {
    // This function should be passed from parent to reset the form
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {editingRequest ? "Cập nhật yêu cầu thuốc" : "Tạo yêu cầu thuốc"}
          </Text>

          <ScrollView
            style={styles.modalScrollView}
            showsVerticalScrollIndicator={true}
          >
            <Text style={styles.label}>Chọn học sinh:</Text>
            <View style={styles.modernStudentPickerContainer}>
              {students.length === 0 ? (
                <View style={styles.noStudentsContainer}>
                  <Ionicons
                    name="people-outline"
                    size={48}
                    color={colors.lightGray}
                  />
                  <Text style={styles.noStudentsText}>
                    Không có học sinh nào
                  </Text>
                  <Text style={styles.noStudentsSubtext}>
                    Vui lòng thêm học sinh trước khi tạo yêu cầu
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.modernStudentPicker,
                    selectedStudent && styles.modernStudentPickerSelected,
                  ]}
                  onPress={onStudentPress}
                  disabled={!!editingRequest}
                  activeOpacity={0.7}
                >
                  <View style={styles.modernStudentPickerContent}>
                    {selectedStudent ? (
                      <View style={styles.selectedStudentDisplay}>
                        <View
                          style={[
                            styles.studentPickerAvatar,
                            styles.studentPickerAvatarSelected,
                          ]}
                        >
                          <Text style={styles.selectedStudentAvatarText}>
                            {getSelectedStudentInfo()?.first_name?.charAt(0)}
                            {getSelectedStudentInfo()?.last_name?.charAt(0)}
                          </Text>
                        </View>
                        <View style={styles.selectedStudentInfo}>
                          <Text style={styles.selectedStudentName}>
                            {getSelectedStudentInfo()?.first_name}{" "}
                            {getSelectedStudentInfo()?.last_name}
                          </Text>
                          <Text style={styles.selectedStudentClass}>
                            {getSelectedStudentInfo()?.class_name ||
                              "Chưa có lớp"}
                          </Text>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.unselectedStudentDisplay}>
                        <View style={styles.unselectedStudentIcon}>
                          <Ionicons
                            name="person-add-outline"
                            size={24}
                            color={colors.primary}
                          />
                        </View>
                        <View style={styles.unselectedStudentInfo}>
                          <Text style={styles.unselectedStudentText}>
                            Chọn học sinh
                          </Text>
                          <Text style={styles.unselectedStudentSubtext}>
                            Nhấn để chọn từ {students.length} học sinh
                          </Text>
                        </View>
                        <View style={styles.unselectedStudentArrow}>
                          <Ionicons
                            name="chevron-down"
                            size={20}
                            color={colors.textSecondary}
                          />
                        </View>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.medicineSection}>
              <View style={styles.medicineSectionHeader}>
                <Text style={styles.medicineSectionTitle}>
                  <Ionicons name="medical" size={18} color={colors.primary} />{" "}
                  Danh sách thuốc
                </Text>
                <View style={styles.medicineCounter}>
                  <Text style={styles.medicineCounterText}>
                    {medicines.length}
                  </Text>
                </View>
              </View>

              <Text style={styles.medicineListHelper}>
                {medicines.length === 1
                  ? "Thêm thông tin thuốc cần dùng cho học sinh"
                  : `Đang có ${medicines.length} loại thuốc trong yêu cầu này`}
              </Text>

              {/* Validation Helper */}
              <View
                style={[
                  styles.validationHelper,
                  validateMedicines()
                    ? styles.validationHelperSuccess
                    : styles.validationHelperWarning,
                ]}
              >
                <Text style={styles.validationText}>
                  {validateMedicines() ? (
                    <Text style={styles.validationSuccess}>
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={colors.success}
                      />{" "}
                      Tất cả thông tin thuốc đã đầy đủ và hợp lệ
                    </Text>
                  ) : (
                    <Text style={styles.validationWarning}>
                      <Ionicons
                        name="warning-outline"
                        size={16}
                        color={colors.warning}
                      />{" "}
                      Vui lòng điền đầy đủ: tên thuốc, liều lượng và tần suất
                      cho tất cả các thuốc
                    </Text>
                  )}
                </Text>
              </View>
            </View>

            {medicines.map((medicine, index) => (
              <View key={index} style={styles.medicineCard}>
                <View style={styles.medicineHeader}>
                  <View style={styles.medicineIndexContainer}>
                    <Ionicons name="medical" size={16} color={colors.primary} />
                    <Text style={styles.medicineIndex}>Thuốc {index + 1}</Text>
                  </View>
                  {medicines.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeMedicineButton}
                      onPress={() => onMedicineRemove(index)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="trash" size={24} color={colors.error} />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.medicineInputRow}>
                  <View style={styles.medicineInputColumn}>
                    <Text style={styles.subLabel}>
                      <Ionicons
                        name="medical-outline"
                        size={14}
                        color={colors.primary}
                      />{" "}
                      Tên thuốc *
                    </Text>
                    <TextInput
                      style={[styles.input, styles.medicineInput]}
                      value={medicine.name}
                      onChangeText={(value) =>
                        onMedicineUpdate(index, "name", value)
                      }
                      placeholder="Paracetamol"
                    />
                  </View>
                </View>

                <View style={styles.medicineInputRow}>
                  <View style={styles.medicineInputColumn}>
                    <Text style={styles.subLabel}>
                      <Ionicons
                        name="scale-outline"
                        size={14}
                        color={colors.primary}
                      />{" "}
                      Liều lượng (1 lần) *
                    </Text>
                    <TextInput
                      style={[styles.input, styles.medicineInput]}
                      value={medicine.dosage}
                      onChangeText={(value) =>
                        onMedicineUpdate(index, "dosage", value)
                      }
                      placeholder="1 viên, 5ml"
                    />
                  </View>
                  <View style={styles.medicineInputColumn}>
                    <Text style={styles.subLabel}>
                      <Ionicons
                        name="time-outline"
                        size={14}
                        color={colors.primary}
                      />{" "}
                      Tần suất (1 ngày) *
                    </Text>
                    <TextInput
                      style={[styles.input, styles.medicineInput]}
                      value={medicine.frequency}
                      onChangeText={(value) =>
                        onMedicineUpdate(index, "frequency", value)
                      }
                      placeholder="3 lần"
                    />
                  </View>
                </View>

                <View style={styles.medicineInputRow}>
                  <View style={styles.medicineInputColumn}>
                    <Text style={styles.subLabel}>
                      <Ionicons
                        name="document-text-outline"
                        size={14}
                        color={colors.primary}
                      />{" "}
                      Ghi chú
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        styles.textArea,
                        styles.medicineInput,
                      ]}
                      value={medicine.notes}
                      onChangeText={(value) =>
                        onMedicineUpdate(index, "notes", value)
                      }
                      placeholder="Ghi chú thêm về cách dùng thuốc"
                      multiline
                      numberOfLines={2}
                    />
                  </View>
                </View>

                {/* Validation indicator */}
                {medicine.name.trim() !== "" &&
                  medicine.dosage.trim() !== "" &&
                  medicine.frequency.trim() !== "" && (
                    <View style={styles.medicineValidIndicator}>
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={colors.success}
                      />
                      <Text style={styles.medicineValidText}>
                        Thông tin đầy đủ
                      </Text>
                    </View>
                  )}
              </View>
            ))}

            <TouchableOpacity
              style={styles.addMedicineButton}
              onPress={onMedicineAdd}
              activeOpacity={0.7}
            >
              <View style={styles.addMedicineButtonContent}>
                <View style={styles.addMedicineButtonIcon}>
                  <Ionicons name="add" size={20} color={colors.primary} />
                </View>
                <View style={styles.addMedicineButtonInfo}>
                  <Text style={styles.addMedicineButtonText}>
                    Thêm loại thuốc khác
                  </Text>
                  <Text style={styles.addMedicineButtonSubtext}>
                    Nhấn để thêm thuốc vào danh sách
                  </Text>
                </View>
                <View style={styles.addMedicineButtonArrow}>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={colors.textSecondary}
                  />
                </View>
              </View>
            </TouchableOpacity>

            <View style={styles.datePickerSection}>
              <Text style={styles.sectionTitle}>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={colors.primary}
                />{" "}
                Thời gian sử dụng thuốc
              </Text>
              <Text style={styles.sectionSubtitle}>
                Chọn ngày bắt đầu và ngày kết thúc sử dụng thuốc
              </Text>

              <View style={styles.datePickerRow}>
                <View style={styles.datePickerColumn}>
                  <Text style={styles.subLabel}>
                    <Ionicons
                      name="play-outline"
                      size={14}
                      color={colors.primary}
                    />{" "}
                    Ngày bắt đầu *
                  </Text>
                  <DatePickerField
                    value={startDate}
                    placeholder="Chọn ngày bắt đầu"
                    onDateChange={onStartDateChange}
                    includeToday={false}
                    dateRange="future"
                    title="Chọn ngày bắt đầu sử dụng thuốc"
                    style={styles.datePicker}
                  />
                </View>

                <View style={styles.datePickerColumn}>
                  <Text style={styles.subLabel}>
                    <Ionicons
                      name="stop-outline"
                      size={14}
                      color={colors.primary}
                    />{" "}
                    Ngày kết thúc *
                  </Text>
                  <DatePickerField
                    value={endDate}
                    placeholder="Chọn ngày kết thúc"
                    onDateChange={onEndDateChange}
                    includeToday={false}
                    dateRange="future"
                    title="Chọn ngày kết thúc sử dụng thuốc"
                    style={styles.datePicker}
                  />
                </View>
              </View>

              <View style={styles.dateInfoContainer}>
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color={colors.info}
                />
                <Text style={styles.dateInfoText}>
                  {startDate && endDate
                    ? startDate.toDateString() === endDate.toDateString()
                      ? "Yêu cầu sử dụng thuốc trong một ngày"
                      : `Yêu cầu sử dụng thuốc trong ${
                          Math.ceil(
                            (endDate - startDate) / (1000 * 60 * 60 * 24)
                          ) + 1
                        } ngày`
                    : "Chọn ngày bắt đầu và kết thúc để xem thời gian sử dụng"}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Modal Buttons */}
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={resetForm}
              activeOpacity={0.8}
            >
              <Ionicons name="close-outline" size={20} color={colors.text} />
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.previewButton]}
              onPress={onShowSummary}
              activeOpacity={0.8}
            >
              <Ionicons name="eye-outline" size={20} color="white" />
              <Text style={styles.previewButtonText}>Xem trước</Text>
            </TouchableOpacity>
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
    padding: 20,
    width: "90%",
    maxHeight: "85%",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 20,
    textAlign: "center",
  },
  modalScrollView: {
    maxHeight: "80%",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  modernStudentPickerContainer: {
    marginBottom: 20,
  },
  noStudentsContainer: {
    alignItems: "center",
    padding: 30,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noStudentsText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginTop: 10,
  },
  noStudentsSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 5,
  },
  modernStudentPicker: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  modernStudentPickerSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  modernStudentPickerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectedStudentDisplay: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  studentPickerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  studentPickerAvatarSelected: {
    backgroundColor: colors.primary,
  },
  selectedStudentAvatarText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  selectedStudentInfo: {
    flex: 1,
  },
  selectedStudentName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  selectedStudentClass: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  unselectedStudentDisplay: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  unselectedStudentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  unselectedStudentInfo: {
    flex: 1,
  },
  unselectedStudentText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  unselectedStudentSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  unselectedStudentArrow: {
    marginLeft: 8,
  },
  medicineSection: {
    marginBottom: 20,
  },
  medicineSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  medicineSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  medicineCounter: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: "center",
  },
  medicineCounterText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  medicineListHelper: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  validationHelper: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  validationHelperSuccess: {
    backgroundColor: `${colors.success}20`,
    borderColor: colors.success,
    borderWidth: 1,
  },
  validationHelperWarning: {
    backgroundColor: `${colors.warning}20`,
    borderColor: colors.warning,
    borderWidth: 1,
  },
  validationText: {
    fontSize: 12,
  },
  validationSuccess: {
    color: colors.success,
  },
  validationWarning: {
    color: colors.warning,
  },
  medicineCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  medicineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  medicineIndexContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  medicineIndex: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginLeft: 8,
  },
  removeMedicineButton: {
    padding: 5,
  },
  medicineInputRow: {
    flexDirection: "row",
    marginBottom: 15,
  },
  medicineInputColumn: {
    flex: 1,
    marginRight: 10,
  },
  subLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    backgroundColor: "white",
  },
  medicineInput: {
    // Add specific styling for medicine inputs if needed
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  medicineValidIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${colors.success}20`,
    padding: 8,
    borderRadius: 6,
    marginTop: 5,
  },
  medicineValidText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 5,
  },
  addMedicineButton: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
  },
  addMedicineButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  addMedicineButtonIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  addMedicineButtonInfo: {
    flex: 1,
  },
  addMedicineButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  addMedicineButtonSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  addMedicineButtonArrow: {
    marginLeft: 8,
  },
  datePickerSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 15,
  },
  datePickerRow: {
    flexDirection: "row",
    marginBottom: 15,
  },
  datePickerColumn: {
    flex: 1,
    marginRight: 10,
  },
  datePicker: {
    // Add specific styling for date picker if needed
  },
  dateInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${colors.info}20`,
    padding: 10,
    borderRadius: 8,
  },
  dateInfoText: {
    color: colors.info,
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  previewButton: {
    backgroundColor: colors.primary,
  },
  previewButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default MedicineRequestModal;
