import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../styles/colors";
import { parentsAPI } from "../../services/parentsAPI";
import MedicineRequestModals from "../common/MedicineRequestModals";

const ParentMedicineRequests = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requests, setRequests] = useState([]);
  const [students, setStudents] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [editingRequest, setEditingRequest] = useState(null);
  const [isStudentPickerVisible, setIsStudentPickerVisible] = useState(false);
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [isSummaryModalVisible, setIsSummaryModalVisible] = useState(false);

  // Form states
  const [selectedStudent, setSelectedStudent] = useState("");
  const [medicines, setMedicines] = useState([
    {
      name: "",
      dosage: "",
      frequency: "",
      notes: "",
    },
  ]);

  // Initialize with future dates
  const getDefaultStartDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  };

  const getDefaultEndDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow; // Same day as start date
  };

  const [startDate, setStartDate] = useState(getDefaultStartDate());
  const [endDate, setEndDate] = useState(getDefaultEndDate());

  useEffect(() => {
    loadData();
  }, []);

  // Medicine management functions
  const addMedicine = () => {
    setMedicines([
      ...medicines,
      { name: "", dosage: "", frequency: "", notes: "" },
    ]);
  };

  const removeMedicine = (index) => {
    if (medicines.length > 1) {
      const newMedicines = medicines.filter((_, i) => i !== index);
      setMedicines(newMedicines);
    } else {
      Alert.alert("Lỗi", "Phải có ít nhất một loại thuốc");
    }
  };

  const updateMedicine = (index, field, value) => {
    const newMedicines = [...medicines];
    newMedicines[index][field] = value;
    setMedicines(newMedicines);
  };

  const validateMedicines = () => {
    return medicines.every(
      (medicine) =>
        medicine.name.trim() !== "" &&
        medicine.dosage.trim() !== "" &&
        medicine.frequency.trim() !== ""
    );
  };

  const validateDates = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      return {
        valid: false,
        message: "Ngày bắt đầu không thể là ngày trong quá khứ",
      };
    }

    if (endDate < startDate) {
      return {
        valid: false,
        message: "Ngày kết thúc không thể trước ngày bắt đầu",
      };
    }

    return { valid: true };
  };

  const validateAllFormData = () => {
    if (!selectedStudent) {
      return { valid: false, message: "Vui lòng chọn học sinh" };
    }

    if (!validateMedicines()) {
      return {
        valid: false,
        message:
          "Vui lòng điền đầy đủ thông tin thuốc: Tên thuốc, Liều lượng và Tần suất",
      };
    }

    return validateDates();
  };

  // Helper function to check for overlapping medicine requests
  const checkOverlappingRequests = (
    studentId,
    requestStartDate,
    requestEndDate,
    excludeRequestId = null
  ) => {
    // Filter requests for the same student
    const studentRequests = requests.filter((request) => {
      // Skip the request being edited (for update scenarios)
      if (excludeRequestId && request._id === excludeRequestId) {
        return false;
      }
      // Check if the request belongs to the same student
      const requestStudentId = request.student?._id || request.student_id;
      return requestStudentId === studentId;
    });

    const newStart = new Date(requestStartDate);
    const newEnd = new Date(requestEndDate);
    newStart.setHours(0, 0, 0, 0);
    newEnd.setHours(0, 0, 0, 0);

    for (const existingRequest of studentRequests) {
      const existingStartDate =
        existingRequest.startDate || existingRequest.start_date;
      const existingEndDate =
        existingRequest.endDate || existingRequest.end_date;

      const existingStart = new Date(existingStartDate);
      const existingEnd = new Date(existingEndDate);
      existingStart.setHours(0, 0, 0, 0);
      existingEnd.setHours(0, 0, 0, 0);

      // Check if the date ranges overlap
      // Two ranges overlap if: start1 <= end2 && start2 <= end1
      if (newStart <= existingEnd && existingStart <= newEnd) {
        return {
          hasOverlap: true,
          overlappingRequest: existingRequest,
          existingStart: existingStart,
          existingEnd: existingEnd,
        };
      }
    }

    return { hasOverlap: false };
  };

  const handleShowSummary = () => {
    const validation = validateAllFormData();
    if (!validation.valid) {
      Alert.alert("Lỗi", validation.message);
      return;
    }

    // Check for overlapping requests
    const overlapCheck = checkOverlappingRequests(
      selectedStudent,
      startDate,
      endDate,
      editingRequest?._id // Exclude current request if editing
    );

    if (overlapCheck.hasOverlap) {
      const existingStartDate =
        overlapCheck.existingStart.toLocaleDateString("vi-VN");
      const existingEndDate =
        overlapCheck.existingEnd.toLocaleDateString("vi-VN");

      Alert.alert(
        "Lỗi trùng lặp thời gian",
        `Đã có yêu cầu cấp thuốc cho học sinh này trong khoảng thời gian từ ${existingStartDate} đến ${existingEndDate}. Vui lòng chọn thời gian khác.`,
        [{ text: "OK" }]
      );
      return;
    }

    setShowSummary(true);
    setIsSummaryModalVisible(true);
  };

  const handleBackToEdit = () => {
    setShowSummary(false);
    setIsSummaryModalVisible(false);
  };

  const getFilteredStudents = () => {
    if (!studentSearchQuery.trim()) return students;
    return students.filter((student) =>
      `${student.first_name} ${student.last_name}`
        .toLowerCase()
        .includes(studentSearchQuery.toLowerCase())
    );
  };

  const getSelectedStudentInfo = () => {
    if (!selectedStudent) return null;
    return students.find((s) => s._id === selectedStudent);
  };

  const handleStudentSelect = (studentId) => {
    setSelectedStudent(studentId);
    setIsStudentPickerVisible(false);
    setStudentSearchQuery("");
  };

  // Helper function to check if a request can be edited/deleted
  const canEditRequest = (request) => {
    if (!request) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    const startDateValue = request.startDate || request.start_date;
    if (!startDateValue) return false;

    const startDate = new Date(startDateValue);
    startDate.setHours(0, 0, 0, 0); // Start of the start date

    // Can edit if start date is today or in the future
    return startDate > today;
  };

  // Helper function to get medicine request status based on dates
  const getMedicineRequestStatus = (request) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    const startDateValue = request.startDate || request.start_date;
    const endDateValue = request.endDate || request.end_date;

    if (!startDateValue || !endDateValue) {
      return { text: "Không xác định", color: colors.textSecondary };
    }

    const startDate = new Date(startDateValue);
    const endDate = new Date(endDateValue);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    if (today < startDate) {
      // Not started yet
      return { text: "Chưa tới ngày", color: colors.warning };
    } else if (today >= startDate && today <= endDate) {
      // In progress
      return { text: "Đang thực hiện", color: colors.primary };
    } else {
      // Completed
      return { text: "Đã hoàn thành", color: colors.success };
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const [requestsResponse, studentsResponse] = await Promise.all([
        parentsAPI.getMedicineRequests(),
        parentsAPI.getStudents(),
      ]);

      if (requestsResponse.success && requestsResponse.data) {
        setRequests(requestsResponse.data);
      }

      if (studentsResponse.success && studentsResponse.data) {
        const studentData = studentsResponse.data.map((item) => item.student);
        setStudents(studentData);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getStudentName = (request) => {
    if (request.student) {
      return `${request.student.first_name} ${request.student.last_name}`;
    }
    const student = students.find((s) => s._id === request.student_id);
    return student ? `${student.first_name} ${student.last_name}` : "N/A";
  };

  const handleCreateRequest = async () => {
    try {
      const validation = validateAllFormData();
      if (!validation.valid) {
        Alert.alert("Lỗi", validation.message);
        return;
      }

      const requestData = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        medicines: medicines.map((medicine) => ({
          name: medicine.name.trim(),
          dosage: medicine.dosage.trim(),
          frequency: medicine.frequency.trim(),
          notes: medicine.notes.trim() || "",
        })),
      };

      const response = await parentsAPI.createMedicineRequestForStudent(
        selectedStudent,
        requestData
      );
      if (response.success) {
        Alert.alert("Thành công", "Tạo yêu cầu thuốc thành công");
        setIsModalVisible(false);
        resetForm();
        loadData();
      } else {
        Alert.alert("Lỗi", response.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Có lỗi xảy ra khi tạo yêu cầu");
    }
  };

  const handleUpdateRequest = async () => {
    try {
      if (!editingRequest) {
        Alert.alert("Lỗi", "Không tìm thấy yêu cầu để cập nhật");
        return;
      }

      const validation = validateAllFormData();
      if (!validation.valid) {
        Alert.alert("Lỗi", validation.message);
        return;
      }

      const updateData = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        medicines: medicines.map((medicine) => ({
          name: medicine.name.trim(),
          dosage: medicine.dosage.trim(),
          frequency: medicine.frequency.trim(),
          notes: medicine.notes.trim() || "",
        })),
      };

      const response = await parentsAPI.updateMedicineRequest(
        editingRequest._id,
        updateData
      );
      if (response.success) {
        Alert.alert("Thành công", "Cập nhật yêu cầu thuốc thành công");
        setIsModalVisible(false);
        setEditingRequest(null);
        resetForm();
        loadData();
      } else {
        Alert.alert("Lỗi", response.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Có lỗi xảy ra khi cập nhật yêu cầu");
    }
  };

  const handleDeleteRequest = (request) => {
    Alert.alert("Xác nhận xóa", "Bạn có chắc chắn muốn xóa yêu cầu này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await parentsAPI.deleteMedicineRequest(
              request._id
            );
            if (response.success) {
              Alert.alert("Thành công", "Xóa yêu cầu thuốc thành công");
              loadData();
            } else {
              Alert.alert("Lỗi", response.message || "Có lỗi xảy ra");
            }
          } catch (error) {
            Alert.alert("Lỗi", "Có lỗi xảy ra khi xóa yêu cầu");
          }
        },
      },
    ]);
  };

  const handleEditRequest = (request) => {
    setEditingRequest(request);

    // Handle medicines array
    const requestMedicines =
      request.medicines && request.medicines.length > 0
        ? request.medicines
        : [
            {
              name: request.medicine_name || "",
              dosage: request.dosage || "",
              frequency: request.frequency || "",
              notes: request.instructions || "",
            },
          ];

    setSelectedStudent(request.student?._id || request.student_id);
    setMedicines(requestMedicines);

    // Ensure we have valid Date objects
    const startDateValue = request.startDate || request.start_date;
    const endDateValue = request.endDate || request.end_date;

    setStartDate(startDateValue ? new Date(startDateValue) : new Date());
    setEndDate(endDateValue ? new Date(endDateValue) : new Date());
    setIsModalVisible(true);
  };

  const resetForm = () => {
    setSelectedStudent("");
    setStudentSearchQuery("");
    setIsStudentPickerVisible(false);
    setShowSummary(false);
    setIsSummaryModalVisible(false);
    setMedicines([
      {
        name: "",
        dosage: "",
        frequency: "",
        notes: "",
      },
    ]);

    // Set default dates to tomorrow (same day as start and end)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    setStartDate(tomorrow);
    setEndDate(new Date(tomorrow)); // Same day as start date
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const formatDateForSummary = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("vi-VN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderRequestItem = ({ item }) => {
    const medicinesList =
      item.medicines && item.medicines.length > 0
        ? item.medicines
        : [
            {
              name: item.medicine_name || "Thuốc",
              dosage: item.dosage || "N/A",
              frequency: item.frequency || "N/A",
            },
          ];

    const firstMedicine = medicinesList[0];
    const medicineCount = medicinesList.length;

    return (
      <TouchableOpacity
        style={styles.requestCard}
        onPress={() => {
          setSelectedRequest(item);
          setIsDetailModalVisible(true);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.requestHeader}>
          <View style={styles.requestInfo}>
            <View style={styles.headerRow}>
              <Text style={styles.studentName}>{getStudentName(item)}</Text>
              <Text style={styles.requestDate}>
                {formatDate(item.createdAt)}
              </Text>
            </View>
            <Text
              style={[
                styles.statusText,
                { color: getMedicineRequestStatus(item).color },
              ]}
            >
              {getMedicineRequestStatus(item).text}
            </Text>
          </View>
        </View>

        <View style={styles.requestDetails}>
          <Text style={styles.detailText}>Số loại thuốc: {medicineCount}</Text>
          <Text style={styles.detailText}>
            Bắt đầu: {formatDate(item.startDate || item.start_date)}
          </Text>
          <Text style={styles.detailText}>
            Kết thúc: {formatDate(item.endDate || item.end_date)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setEditingRequest(null);
          resetForm();
          setIsModalVisible(true);
        }}
      >
        <Ionicons name="add" size={24} color="white" />
        <Text style={styles.addButtonText}>Tạo yêu cầu thuốc</Text>
      </TouchableOpacity>

      <FlatList
        data={requests}
        renderItem={renderRequestItem}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="medical-outline"
              size={64}
              color={colors.lightGray}
            />
            <Text style={styles.emptyText}>Chưa có yêu cầu thuốc nào</Text>
            <Text style={styles.emptySubtext}>
              Tạo yêu cầu thuốc đầu tiên cho con em của bạn
            </Text>
          </View>
        }
      />

      {/* All Medicine Request Modals */}
      <MedicineRequestModals
        // Modal visibility states
        isModalVisible={isModalVisible}
        isStudentPickerVisible={isStudentPickerVisible}
        isDetailModalVisible={isDetailModalVisible}
        isSummaryModalVisible={isSummaryModalVisible}
        // State setters
        setIsModalVisible={setIsModalVisible}
        setIsStudentPickerVisible={setIsStudentPickerVisible}
        setIsDetailModalVisible={setIsDetailModalVisible}
        setIsSummaryModalVisible={setIsSummaryModalVisible}
        // Data
        editingRequest={editingRequest}
        selectedStudent={selectedStudent}
        students={students}
        medicines={medicines}
        startDate={startDate}
        endDate={endDate}
        selectedRequest={selectedRequest}
        studentSearchQuery={studentSearchQuery}
        // State setters for data
        setEditingRequest={setEditingRequest}
        setStudentSearchQuery={setStudentSearchQuery}
        // Functions
        getSelectedStudentInfo={getSelectedStudentInfo}
        validateMedicines={validateMedicines}
        updateMedicine={updateMedicine}
        addMedicine={addMedicine}
        removeMedicine={removeMedicine}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        handleShowSummary={handleShowSummary}
        resetForm={resetForm}
        handleStudentSelect={handleStudentSelect}
        getFilteredStudents={getFilteredStudents}
        canEditRequest={canEditRequest}
        getMedicineRequestStatus={getMedicineRequestStatus}
        getStudentName={getStudentName}
        formatDate={formatDate}
        handleEditRequest={handleEditRequest}
        handleDeleteRequest={handleDeleteRequest}
        formatDateForSummary={formatDateForSummary}
        handleBackToEdit={handleBackToEdit}
        handleCreateRequest={handleCreateRequest}
        handleUpdateRequest={handleUpdateRequest}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  addButton: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    margin: 20,
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  requestCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  requestInfo: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  medicineName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    flex: 1,
  },
  requestDate: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  requestDetails: {
    marginBottom: 15,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  detailText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 2,
  },
  requestActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: colors.warning,
  },
  deleteButton: {
    backgroundColor: colors.error,
  },
  actionButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
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
    padding: 20,
  },
  detailModalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    width: "90%",
    height: "90%",
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
    textAlign: "center",
    marginBottom: 15,
  },
  detailModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "white",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  // Modern Student Picker Styles
  modernStudentPickerContainer: {
    marginBottom: 15,
  },
  modernStudentPicker: {
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  modernStudentPickerSelected: {
    borderColor: colors.success,
    backgroundColor: colors.success + "10",
  },
  modernStudentPickerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectedStudentDisplay: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  selectedStudentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  selectedStudentAvatarText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  selectedStudentInfo: {
    flex: 1,
  },
  selectedStudentName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  selectedStudentClass: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  selectedStudentActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  changeButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  changeButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  unselectedStudentDisplay: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  unselectedStudentIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: "dashed",
  },
  unselectedStudentInfo: {
    flex: 1,
  },
  unselectedStudentText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 2,
  },
  unselectedStudentSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  unselectedStudentArrow: {
    marginLeft: 8,
  },
  // Student Picker Modal Styles
  studentPickerModal: {
    backgroundColor: "white",
    borderRadius: 20,
    width: "90%",
    height: "70%",
    overflow: "hidden",
  },
  studentPickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  studentPickerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: colors.background,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    color: colors.text,
  },
  studentPickerList: {
    flex: 1,
    padding: 16,
  },
  studentPickerItem: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  studentPickerItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + "20",
  },
  studentPickerItemLast: {
    marginBottom: 16,
  },
  studentPickerItemContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  studentPickerAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  studentPickerAvatarSelected: {
    backgroundColor: colors.primary,
  },
  studentPickerAvatarText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
  },
  studentPickerAvatarTextSelected: {
    color: "white",
  },
  studentPickerItemInfo: {
    flex: 1,
  },
  studentPickerItemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 2,
  },
  studentPickerItemNameSelected: {
    color: colors.primary,
  },
  studentPickerItemSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  noResultsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.textSecondary,
    marginTop: 12,
    marginBottom: 4,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
  },
  studentPickerFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  studentPickerCancelButton: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  studentPickerCancelText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.textSecondary,
  },
  // Student Picker Styles
  studentPickerContainer: {
    marginBottom: 15,
  },
  pickerLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 10,
    textAlign: "center",
    fontStyle: "italic",
  },
  studentScrollView: {
    flexGrow: 0,
  },
  studentScrollContent: {
    paddingHorizontal: 5,
  },
  studentCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
    minWidth: 100,
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
  },
  selectedStudentCard: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
    transform: [{ scale: 1.05 }],
  },
  studentAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  selectedStudentAvatar: {
    backgroundColor: colors.primary,
  },
  studentInitials: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  selectedStudentInitials: {
    color: "white",
  },
  studentName: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text,
    textAlign: "center",
    marginBottom: 2,
  },
  selectedStudentName: {
    color: colors.primary,
  },
  studentLastName: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
  },
  selectedStudentLastName: {
    color: colors.primary,
  },
  selectedIndicator: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 2,
  },
  noStudentsContainer: {
    alignItems: "center",
    padding: 30,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: "dashed",
  },
  noStudentsText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.textSecondary,
    marginTop: 10,
  },
  noStudentsSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 5,
  },
  // Legacy styles (keeping for backward compatibility)
  pickerContainer: {
    marginBottom: 10,
  },
  studentOption: {
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "white",
  },
  selectedStudentOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  studentOptionText: {
    fontSize: 16,
    color: colors.text,
  },
  selectedStudentOptionText: {
    color: "white",
    fontWeight: "bold",
  },
  modalScrollView: {
    flexGrow: 1,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: colors.lightGray,
    borderWidth: 1,
    borderColor: colors.border,
  },
  submitButton: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  cancelButtonText: {
    color: colors.text,
    fontWeight: "bold",
    marginLeft: 8,
  },
  submitButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
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
  // Medicine-related styles
  medicineSection: {
    marginBottom: 20,
  },
  medicineSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  medicineSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    flexDirection: "row",
    alignItems: "center",
  },
  medicineCounter: {
    backgroundColor: colors.primary,
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 30,
    alignItems: "center",
  },
  medicineCounterText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  medicineListHelper: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 15,
    textAlign: "center",
    fontStyle: "italic",
  },
  validationHelper: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
  },
  validationHelperSuccess: {
    backgroundColor: colors.success + "15",
    borderColor: colors.success + "50",
  },
  validationHelperWarning: {
    backgroundColor: colors.warning + "15",
    borderColor: colors.warning + "50",
  },
  validationText: {
    textAlign: "center",
    fontSize: 14,
  },
  validationSuccess: {
    color: colors.success,
    fontWeight: "bold",
  },
  validationWarning: {
    color: colors.warning,
    fontWeight: "bold",
  },
  medicineCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medicineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  medicineIndexContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  medicineIndex: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
    marginLeft: 5,
  },
  removeMedicineButton: {
    padding: 5,
  },
  medicineInputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  medicineInputColumn: {
    flex: 1,
    marginHorizontal: 5,
  },
  medicineInput: {
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  medicineValidIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.success + "20",
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
  },
  medicineValidText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 5,
  },
  subLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  addMedicineButton: {
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  addMedicineButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  addMedicineButtonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  addMedicineButtonInfo: {
    flex: 1,
  },
  addMedicineButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  addMedicineButtonSubtext: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  addMedicineButtonArrow: {
    marginLeft: 8,
  },
  // Date Picker Section Styles
  datePickerSection: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 15,
    textAlign: "center",
  },
  datePickerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  datePickerColumn: {
    flex: 1,
    marginHorizontal: 5,
  },
  datePicker: {
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  dateInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.info + "20",
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  dateInfoText: {
    color: colors.info,
    fontSize: 12,
    marginLeft: 5,
    flex: 1,
  },
  // Enhanced Summary Section Styles
  enhancedSummarySection: {
    height: "100%",
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
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
  summaryFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.info + "15",
    padding: 12,
  },
  summaryFooterText: {
    fontSize: 12,
    color: colors.info,
    marginLeft: 6,
    fontStyle: "italic",
  },
  // Summary Medicine List Styles
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
  // Summary Action Buttons
  summaryActions: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 16,
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
  // Preview Button Style
  previewButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    flex: 1,
  },
  previewButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  medicineCount: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "normal",
  },
  medicineDetailCard: {
    backgroundColor: colors.background,
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  medicineDetailName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  medicineDetailText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 2,
  },
  smallEditButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
    flex: 1,
    marginRight: 8,
  },
  smallEditButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  detailActionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  smallDeleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.error,
    backgroundColor: colors.error + "30",
    flex: 1,
    marginLeft: 8,
  },
  smallDeleteButtonText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  statusLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "400",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  detailStatusWarning: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.warningBackground || "#FFF3CD",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
    marginBottom: 16,
  },
  detailStatusWarningMessage: {
    fontSize: 14,
    color: colors.warning,
    fontWeight: "500",
    marginLeft: 8,
    flex: 1,
  },
});

export default ParentMedicineRequests;
