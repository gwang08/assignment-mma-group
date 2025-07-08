import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../styles/colors";
import { parentsAPI } from "../../services/parentsAPI";
import { useAuth } from "../../context/AuthContext";
import MedicineRequestModals from "../common/MedicineRequestModals";

const ParentDashboard = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [students, setStudents] = useState([]);
  const [medicineRequests, setMedicineRequests] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [consultations, setConsultations] = useState([]);

  // Modal states for medicine request functionality
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isStudentPickerVisible, setIsStudentPickerVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isSummaryModalVisible, setIsSummaryModalVisible] = useState(false);

  // Medicine request form states
  const [editingRequest, setEditingRequest] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [medicines, setMedicines] = useState([
    { name: "", dosage: "", frequency: "", notes: "" },
  ]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [studentSearchQuery, setStudentSearchQuery] = useState("");

  // Default date functions
  const getDefaultStartDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  };

  const getDefaultEndDate = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek;
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Debug effect to track selectedStudent changes
  useEffect(() => {
    if (selectedStudent) {
      const studentInfo = getSelectedStudentInfo();
    }
  }, [selectedStudent, students]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [
        studentsResponse,
        requestsResponse,
        campaignsResponse,
        consultationsResponse,
      ] = await Promise.all([
        parentsAPI.getStudents(),
        parentsAPI.getMedicineRequests(),
        parentsAPI.getCampaigns(),
        parentsAPI.getConsultationSchedules(),
      ]);

      if (studentsResponse.success && studentsResponse.data) {
        const studentData = studentsResponse.data.map((item) => item.student);
        setStudents(studentData);
      }

      if (requestsResponse.success && requestsResponse.data) {
        setMedicineRequests(requestsResponse.data);
      }

      if (campaignsResponse.success && campaignsResponse.data) {
        setCampaigns(campaignsResponse.data);
      }

      if (consultationsResponse.success && consultationsResponse.data) {
        setConsultations(consultationsResponse.data);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  // Helper function to get status color for consultations (not medicine requests)
  const getConsultationStatusColor = (status) => {
    const colors = {
      pending: "#f39c12",
      scheduled: "#9b59b6",
      completed: "#3498db",
      cancelled: "#95a5a6",
    };
    return colors[status] || "#95a5a6";
  };

  // Helper function to get student name from medicine request
  const getStudentName = (request) => {
    // If student object is directly attached
    if (request.student) {
      return `${request.student.first_name} ${request.student.last_name}`;
    }

    // Try to find student by various ID field names
    const studentId = request.student_id || request.studentId;
    if (studentId) {
      const student = students.find((s) => s._id === studentId);
      if (student) {
        return `${student.first_name} ${student.last_name}`;
      }
    }

    return "N/A";
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  // Medicine request modal helper functions
  const getSelectedStudentInfo = () => {
    if (!selectedStudent) return null;

    const student = students.find((s) => s._id === selectedStudent);
    return student;
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
    const studentRequests = medicineRequests.filter((request) => {
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

  const updateMedicine = (index, field, value) => {
    const newMedicines = [...medicines];
    newMedicines[index][field] = value;
    setMedicines(newMedicines);
  };

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

  const resetForm = () => {
    setSelectedStudent("");
    setStudentSearchQuery("");
    setIsStudentPickerVisible(false);
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

  const handleStudentSelect = (studentId) => {
    setSelectedStudent(studentId);
    setIsStudentPickerVisible(false);
  };

  const getFilteredStudents = () => {
    return students.filter((student) =>
      `${student.first_name} ${student.last_name}`
        .toLowerCase()
        .includes(studentSearchQuery.toLowerCase())
    );
  };

  const canEditRequest = (request) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDateValue = request.startDate || request.start_date;
    if (!startDateValue) return false;
    const startDate = new Date(startDateValue);
    startDate.setHours(0, 0, 0, 0);
    return startDate >= today;
  };

  const formatDateForSummary = (date) => {
    return date ? formatDate(date) : "";
  };

  const handleShowSummary = async () => {
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

    setIsSummaryModalVisible(true);
  };

  const handleBackToEdit = () => {
    setIsSummaryModalVisible(false);
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

      await parentsAPI.createMedicineRequestForStudent(
        selectedStudent,
        requestData
      );
      await loadDashboardData(); // Refresh data
      setIsModalVisible(false);
      setIsSummaryModalVisible(false);
      resetForm();
      Alert.alert("Thành công", "Yêu cầu thuốc đã được tạo thành công");
    } catch (error) {
      console.error("Create request error:", error);
      Alert.alert(
        "Lỗi",
        error.message || "Có lỗi xảy ra khi tạo yêu cầu thuốc"
      );
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

      await parentsAPI.updateMedicineRequest(editingRequest._id, updateData);
      await loadDashboardData(); // Refresh data
      setIsModalVisible(false);
      setIsSummaryModalVisible(false);
      resetForm();
      Alert.alert("Thành công", "Yêu cầu thuốc đã được cập nhật thành công");
    } catch (error) {
      console.error("Update request error:", error);
      Alert.alert(
        "Lỗi",
        error.message || "Có lỗi xảy ra khi cập nhật yêu cầu thuốc"
      );
    }
  };

  const handleEditRequest = (request) => {
    setEditingRequest(request);

    // Set student - try multiple possible field names
    const studentId =
      request.student_id ||
      request.studentId ||
      (request.student && request.student._id);
    setSelectedStudent(studentId);

    // Set medicines - ensure we have a proper array
    if (
      request.medicines &&
      Array.isArray(request.medicines) &&
      request.medicines.length > 0
    ) {
      setMedicines(request.medicines);
    } else {
      // Default to single medicine if none provided
      setMedicines([{ name: "", dosage: "", frequency: "", notes: "" }]);
    }

    // Set dates
    if (request.startDate || request.start_date) {
      setStartDate(new Date(request.startDate || request.start_date));
    } else {
      setStartDate(getDefaultStartDate());
    }

    if (request.endDate || request.end_date) {
      setEndDate(new Date(request.endDate || request.end_date));
    } else {
      setEndDate(getDefaultEndDate());
    }

    setIsDetailModalVisible(false);
    setIsModalVisible(true);
  };

  const handleDeleteRequest = (request) => {
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa yêu cầu thuốc này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await parentsAPI.deleteMedicineRequest(request._id);
              await loadDashboardData(); // Refresh data
              setIsDetailModalVisible(false);
              Alert.alert("Thành công", "Yêu cầu thuốc đã được xóa");
            } catch (error) {
              console.error("Delete request error:", error);
              Alert.alert(
                "Lỗi",
                error.message || "Có lỗi xảy ra khi xóa yêu cầu thuốc"
              );
            }
          },
        },
      ]
    );
  };

  const handleRequestPress = (request) => {
    setSelectedRequest(request);
    setIsDetailModalVisible(true);
  };

  const handleCreateNewRequest = () => {
    setEditingRequest(null);
    resetForm();
    setIsModalVisible(true);
  };

  const DashboardCard = ({
    title,
    icon,
    onPress,
    backgroundColor = colors.primary,
  }) => (
    <TouchableOpacity
      style={[styles.dashboardCard, { backgroundColor }]}
      onPress={onPress}
    >
      <View style={styles.cardContent}>
        <Ionicons name={icon} size={32} color="white" />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>
          Xin chào, {user?.first_name} {user?.last_name}!
        </Text>
        <Text style={styles.welcomeSubtext}>
          Quản lý sức khỏe con em của bạn
        </Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
        <View style={styles.cardGrid}>
          <DashboardCard
            title="Tạo yêu cầu thuốc"
            icon="medical"
            backgroundColor="#e74c3c"
            onPress={handleCreateNewRequest}
          />
          <DashboardCard
            title="Hồ sơ sức khỏe"
            icon="heart"
            backgroundColor="#27ae60"
            onPress={() => navigation.navigate("HealthProfiles")}
          />
          <DashboardCard
            title="Chiến dịch"
            icon="shield"
            backgroundColor="#f39c12"
            onPress={() => navigation.navigate("Campaigns")}
          />
          <DashboardCard
            title="Liên kết học sinh"
            icon="link"
            backgroundColor="#9b59b6"
            onPress={() => navigation.navigate("StudentLinkRequests")}
          />
        </View>
      </View>

      {/* Recent Medicine Requests */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Yêu cầu thuốc gần đây</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("MedicineRequests")}
          >
            <Text style={styles.seeAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>
        {medicineRequests.slice(0, 3).map((request, index) => (
          <TouchableOpacity
            key={index}
            style={styles.requestCard}
            onPress={() => handleRequestPress(request)}
            activeOpacity={0.7}
          >
            <View style={styles.requestHeader}>
              <View style={styles.requestInfo}>
                <View style={styles.headerRow}>
                  <Text style={styles.studentName}>
                    {getStudentName(request)}
                  </Text>
                  <Text style={styles.requestDate}>
                    {formatDate(request.createdAt)}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.medicineRequestStatusText,
                    { color: getMedicineRequestStatus(request).color },
                  ]}
                >
                  {getMedicineRequestStatus(request).text}
                </Text>
              </View>
            </View>

            <View style={styles.requestDetails}>
              <Text style={styles.detailText}>
                Số loại thuốc: {request.medicines?.length || 1}
              </Text>
              <Text style={styles.detailText}>
                Bắt đầu: {formatDate(request.startDate || request.start_date)}
              </Text>
              <Text style={styles.detailText}>
                Kết thúc: {formatDate(request.endDate || request.end_date)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
        {medicineRequests.length === 0 && (
          <Text style={styles.emptyText}>Chưa có yêu cầu thuốc nào</Text>
        )}
      </View>

      {/* Upcoming Consultations */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Lịch tư vấn sắp tới</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Consultations")}
          >
            <Text style={styles.seeAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>
        {consultations.slice(0, 3).map((consultation, index) => (
          <View key={index} style={styles.listItem}>
            <View style={styles.listItemContent}>
              <Text style={styles.listItemTitle}>{consultation.reason}</Text>
              <Text style={styles.listItemSubtext}>
                {formatDate(
                  consultation.appointment_date || consultation.scheduledDate
                )}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: getConsultationStatusColor(
                    consultation.status.toLowerCase()
                  ),
                },
              ]}
            >
              <Text style={styles.statusText}>
                {consultation.status === "scheduled" ||
                consultation.status === "SCHEDULED"
                  ? "Đã lên lịch"
                  : consultation.status === "completed" ||
                    consultation.status === "COMPLETED"
                  ? "Hoàn thành"
                  : consultation.status === "cancelled" ||
                    consultation.status === "CANCELLED"
                  ? "Đã hủy"
                  : "Chờ xác nhận"}
              </Text>
            </View>
          </View>
        ))}
        {consultations.length === 0 && (
          <Text style={styles.emptyText}>Chưa có lịch tư vấn nào</Text>
        )}
      </View>

      {/* Active Campaigns */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Chiến dịch đang diễn ra</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Campaigns")}>
            <Text style={styles.seeAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>
        {campaigns
          .filter((c) => c.status === "active")
          .slice(0, 3)
          .map((campaign, index) => (
            <View key={index} style={styles.listItem}>
              <View style={styles.listItemContent}>
                <Text style={styles.listItemTitle}>{campaign.title}</Text>
                <Text style={styles.listItemSubtext}>
                  {formatDate(campaign.start_date)} -{" "}
                  {formatDate(campaign.end_date)}
                </Text>
              </View>
              <View
                style={[styles.statusBadge, { backgroundColor: "#27ae60" }]}
              >
                <Text style={styles.statusText}>Đang diễn ra</Text>
              </View>
            </View>
          ))}
        {campaigns.filter((c) => c.status === "active").length === 0 && (
          <Text style={styles.emptyText}>
            Không có chiến dịch nào đang diễn ra
          </Text>
        )}
      </View>

      {/* Medicine Request Modals */}
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  welcomeSection: {
    backgroundColor: colors.primary,
    padding: 20,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "bold",
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  dashboardCard: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
  },
  cardTitle: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
  },
  listItem: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 5,
  },
  listItemSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
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
  emptyText: {
    textAlign: "center",
    color: colors.textSecondary,
    fontStyle: "italic",
    marginVertical: 20,
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
  medicineRequestStatusText: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 4,
  },
  requestDetails: {
    marginBottom: 0,
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
});

export default ParentDashboard;
