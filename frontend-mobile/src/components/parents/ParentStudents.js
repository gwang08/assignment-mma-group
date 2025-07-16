import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  ScrollView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../styles/colors";
import { parentsAPI } from "../../services/parentsAPI";

const ParentStudents = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLinkRequestModalVisible, setIsLinkRequestModalVisible] =
    useState(false);
  const [linkRequestForm, setLinkRequestForm] = useState({
    studentId: "",
    relationship: "",
    isEmergencyContact: false,
    notes: "",
  });
  const [submittingLinkRequest, setSubmittingLinkRequest] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await parentsAPI.getStudents();

      if (response.success && response.data) {
        // API trả về mảng các object với format: { student: {...}, relationship: "...", is_emergency_contact: ... }
        // Chúng ta cần extract ra các student objects
        const studentData = response.data.map((item) => item.student);
        setStudents(studentData);
      }
    } catch (error) {
      console.error("Error loading students:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi tải danh sách học sinh");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStudents();
    setRefreshing(false);
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setIsModalVisible(true);
  };

  const getGenderText = (gender) => {
    const genderLabels = {
      male: "Nam",
      female: "Nữ",
      other: "Khác",
    };
    return genderLabels[gender] || gender;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa có thông tin";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const handleAddStudent = () => {
    setLinkRequestForm({
      studentId: "",
      relationship: "",
      isEmergencyContact: false,
      notes: "",
    });
    setIsLinkRequestModalVisible(true);
  };

  const handleSubmitLinkRequest = async () => {
    if (!linkRequestForm.studentId || !linkRequestForm.relationship) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      setSubmittingLinkRequest(true);
      const response = await parentsAPI.createStudentLinkRequest(
        linkRequestForm.studentId,
        linkRequestForm.relationship,
        linkRequestForm.isEmergencyContact,
        linkRequestForm.notes
      );

      if (response.success) {
        Alert.alert(
          "Thành công",
          "Yêu cầu liên kết học sinh đã được gửi và đang chờ duyệt"
        );
        setIsLinkRequestModalVisible(false);
        setLinkRequestForm({
          studentId: "",
          relationship: "",
          isEmergencyContact: false,
          notes: "",
        });
      } else {
        Alert.alert("Lỗi", response.message || "Có lỗi xảy ra khi gửi yêu cầu");
      }
    } catch (error) {
      console.error("Submit link request error:", error);
      Alert.alert("Lỗi", error.message || "Có lỗi xảy ra khi gửi yêu cầu");
    } finally {
      setSubmittingLinkRequest(false);
    }
  };

  const renderStudentItem = ({ item }) => (
    <View style={styles.studentCard}>
      <View style={styles.studentInfo}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={32} color="white" />
        </View>
        <View style={styles.studentDetails}>
          <Text style={styles.studentName}>
            {item.first_name} {item.last_name}
          </Text>
          <Text style={styles.studentClass}>
            Lớp: {item.class_name || "Chưa có lớp"}
          </Text>
          <Text style={styles.studentId}>
            Mã HS: {item.student_id || "Chưa có"}
          </Text>
          <Text style={styles.studentGender}>
            Giới tính: {getGenderText(item.gender)}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.viewButton}
        onPress={() => handleViewDetails(item)}
      >
        <Ionicons name="eye" size={20} color="white" />
        <Text style={styles.viewButtonText}>Xem</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={handleAddStudent}>
        <Ionicons name="add" size={20} color="white" />
        <Text style={styles.addButtonText}>Tạo yêu cầu thuốc</Text>
      </TouchableOpacity>

      <FlatList
        data={students}
        renderItem={renderStudentItem}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="people-outline"
              size={64}
              color={colors.lightGray}
            />
            <Text style={styles.emptyText}>Chưa có học sinh nào</Text>
            <Text style={styles.emptySubtext}>
              Liên hệ với trường để thêm học sinh vào tài khoản của bạn
            </Text>
          </View>
        }
      />

      {/* Student Detail Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thông tin học sinh</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedStudent && (
              <View style={styles.modalBody}>
                <View style={styles.modalAvatar}>
                  <Ionicons name="person" size={48} color="white" />
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Họ và tên</Text>
                  <Text style={styles.detailValue}>
                    {selectedStudent.first_name} {selectedStudent.last_name}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Mã học sinh</Text>
                  <Text style={styles.detailValue}>
                    {selectedStudent.student_id || "Chưa có"}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Lớp</Text>
                  <Text style={styles.detailValue}>
                    {selectedStudent.class_name || "Chưa có lớp"}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Giới tính</Text>
                  <Text style={styles.detailValue}>
                    {getGenderText(selectedStudent.gender)}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Ngày sinh</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(selectedStudent.dateOfBirth)}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Địa chỉ</Text>
                  <Text style={styles.detailValue}>
                    {selectedStudent.address
                      ? `${selectedStudent.address.street || ""}, ${
                          selectedStudent.address.city || ""
                        }, ${selectedStudent.address.state || ""}, ${
                          selectedStudent.address.country || ""
                        }`
                          .replace(/(^,)|(,$)/g, "")
                          .replace(/,+/g, ", ") || "Chưa có thông tin"
                      : "Chưa có thông tin"}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Trạng thái</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: selectedStudent.is_active
                          ? colors.success
                          : colors.error,
                      },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {selectedStudent.is_active
                        ? "Đang học"
                        : "Không hoạt động"}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Ngày tạo</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(selectedStudent.createdAt)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Student Link Request Modal */}
      <Modal
        visible={isLinkRequestModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsLinkRequestModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yêu cầu liên kết học sinh</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsLinkRequestModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Mã học sinh *</Text>
                <TextInput
                  style={styles.textInput}
                  value={linkRequestForm.studentId}
                  onChangeText={(text) =>
                    setLinkRequestForm({
                      ...linkRequestForm,
                      studentId: text,
                    })
                  }
                  placeholder="Nhập mã học sinh"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Mối quan hệ *</Text>
                <View style={styles.relationshipButtons}>
                  {[
                    "father",
                    "mother",
                    "grandparent",
                    "parent",
                    "guardian",
                    "relative",
                    "other",
                  ].map((rel) => (
                    <TouchableOpacity
                      key={rel}
                      style={[
                        styles.relationshipButton,
                        linkRequestForm.relationship === rel &&
                          styles.selectedRelationshipButton,
                      ]}
                      onPress={() =>
                        setLinkRequestForm({
                          ...linkRequestForm,
                          relationship: rel,
                        })
                      }
                    >
                      <Text
                        style={[
                          styles.relationshipButtonText,
                          linkRequestForm.relationship === rel &&
                            styles.selectedRelationshipButtonText,
                        ]}
                      >
                        {rel === "father"
                          ? "Bố"
                          : rel === "mother"
                          ? "Mẹ"
                          : rel === "grandparent"
                          ? "Ông/Bà"
                          : rel === "parent"
                          ? "Phụ huynh"
                          : rel === "guardian"
                          ? "Người giám hộ"
                          : rel === "relative"
                          ? "Người thân"
                          : "Khác"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formSection}>
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() =>
                    setLinkRequestForm({
                      ...linkRequestForm,
                      isEmergencyContact: !linkRequestForm.isEmergencyContact,
                    })
                  }
                >
                  <Ionicons
                    name={
                      linkRequestForm.isEmergencyContact
                        ? "checkbox"
                        : "square-outline"
                    }
                    size={20}
                    color={
                      linkRequestForm.isEmergencyContact
                        ? colors.primary
                        : colors.textSecondary
                    }
                  />
                  <Text style={styles.checkboxLabel}>
                    Đặt làm liên hệ khẩn cấp
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Ghi chú</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={linkRequestForm.notes}
                  onChangeText={(text) =>
                    setLinkRequestForm({
                      ...linkRequestForm,
                      notes: text,
                    })
                  }
                  placeholder="Thêm ghi chú (tùy chọn)"
                  placeholderTextColor={colors.textSecondary}
                  multiline={true}
                  numberOfLines={3}
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setIsLinkRequestModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.submitButton,
                    submittingLinkRequest && styles.disabledButton,
                  ]}
                  onPress={handleSubmitLinkRequest}
                  disabled={submittingLinkRequest}
                >
                  <Text style={styles.submitButtonText}>
                    {submittingLinkRequest ? "Đang gửi..." : "Gửi yêu cầu"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    margin: 20,
    marginBottom: 0,
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 5,
  },
  listContainer: {
    padding: 20,
  },
  studentCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  studentInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  studentClass: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  studentId: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  studentGender: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  viewButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  viewButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textSecondary,
    marginTop: 15,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    width: "90%",
    height: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    padding: 20,
  },
  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  detailSection: {
    marginBottom: 15,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.textSecondary,
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 16,
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: "flex-start",
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },

  // Form Styles
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
    backgroundColor: "white",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  relationshipButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  relationshipButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "white",
  },
  selectedRelationshipButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  relationshipButtonText: {
    fontSize: 14,
    color: colors.text,
  },
  selectedRelationshipButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkboxLabel: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: colors.lightGray,
    marginRight: 10,
  },
  submitButton: {
    backgroundColor: colors.primary,
    marginLeft: 10,
  },
  cancelButtonText: {
    color: colors.text,
    fontWeight: "bold",
  },
  submitButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default ParentStudents;
