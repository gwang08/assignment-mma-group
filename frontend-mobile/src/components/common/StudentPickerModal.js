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

const StudentPickerModal = ({
  visible,
  onClose,
  students,
  selectedStudent,
  searchQuery,
  onSearchChange,
  onStudentSelect,
  getFilteredStudents,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.studentPickerModal}>
          <View style={styles.studentPickerHeader}>
            <Text style={styles.studentPickerTitle}>Chọn học sinh</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={20} color={colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={onSearchChange}
                placeholder="Tìm kiếm học sinh..."
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => onSearchChange("")}>
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <ScrollView
            style={styles.studentPickerList}
            showsVerticalScrollIndicator={false}
          >
            {getFilteredStudents().length === 0 ? (
              <View style={styles.noResultsContainer}>
                <Ionicons name="search" size={48} color={colors.lightGray} />
                <Text style={styles.noResultsText}>
                  {searchQuery
                    ? "Không tìm thấy học sinh"
                    : "Không có học sinh nào"}
                </Text>
                <Text style={styles.noResultsSubtext}>
                  {searchQuery
                    ? "Thử từ khóa khác"
                    : "Vui lòng thêm học sinh trước"}
                </Text>
              </View>
            ) : (
              getFilteredStudents().map((student, index) => (
                <TouchableOpacity
                  key={student._id}
                  style={[
                    styles.studentPickerItem,
                    selectedStudent === student._id &&
                      styles.studentPickerItemSelected,
                    index === getFilteredStudents().length - 1 &&
                      styles.studentPickerItemLast,
                  ]}
                  onPress={() => onStudentSelect(student._id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.studentPickerItemContent}>
                    <View
                      style={[
                        styles.studentPickerAvatar,
                        selectedStudent === student._id &&
                          styles.studentPickerAvatarSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.studentPickerAvatarText,
                          selectedStudent === student._id &&
                            styles.studentPickerAvatarTextSelected,
                        ]}
                      >
                        {student.first_name?.charAt(0)}
                        {student.last_name?.charAt(0)}
                      </Text>
                    </View>
                    <View style={styles.studentPickerItemInfo}>
                      <Text
                        style={[
                          styles.studentPickerItemName,
                          selectedStudent === student._id &&
                            styles.studentPickerItemNameSelected,
                        ]}
                      >
                        {student.first_name} {student.last_name}
                      </Text>
                      <Text style={styles.studentPickerItemSubtext}>
                        Lớp: {student.class_name || "Chưa có lớp"}
                      </Text>
                    </View>
                    {selectedStudent === student._id && (
                      <View style={styles.studentPickerItemSelectedIcon}>
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color={colors.primary}
                        />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>

          <View style={styles.studentPickerFooter}>
            <TouchableOpacity
              style={styles.studentPickerCancelButton}
              onPress={onClose}
            >
              <Text style={styles.studentPickerCancelText}>Hủy</Text>
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
  studentPickerModal: {
    backgroundColor: "white",
    borderRadius: 20,
    width: "90%",
    maxHeight: "80%",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  studentPickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  studentPickerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  closeButton: {
    padding: 5,
  },
  searchContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 10,
  },
  studentPickerList: {
    maxHeight: "60%",
    paddingHorizontal: 20,
  },
  noResultsContainer: {
    alignItems: "center",
    padding: 30,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginTop: 10,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 5,
  },
  studentPickerItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  studentPickerItemSelected: {
    backgroundColor: `${colors.primary}10`,
  },
  studentPickerItemLast: {
    borderBottomWidth: 0,
  },
  studentPickerItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  studentPickerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  studentPickerAvatarSelected: {
    backgroundColor: colors.primary,
  },
  studentPickerAvatarText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "bold",
  },
  studentPickerAvatarTextSelected: {
    color: "white",
  },
  studentPickerItemInfo: {
    flex: 1,
  },
  studentPickerItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  studentPickerItemNameSelected: {
    color: colors.primary,
  },
  studentPickerItemSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  studentPickerItemSelectedIcon: {
    marginLeft: 10,
  },
  studentPickerFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  studentPickerCancelButton: {
    backgroundColor: colors.background,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  studentPickerCancelText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default StudentPickerModal;
