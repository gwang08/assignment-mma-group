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
  TextInput,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../styles/colors";
import { parentsAPI } from "../../services/parentsAPI";
import DatePickerField from "../common/DatePickerField";

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

      {/* Create/Edit Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
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
              {!showSummary && (
                <>
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
                        onPress={() => setIsStudentPickerVisible(true)}
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
                                  {getSelectedStudentInfo()?.first_name?.charAt(
                                    0
                                  )}
                                  {getSelectedStudentInfo()?.last_name?.charAt(
                                    0
                                  )}
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
                        <Ionicons
                          name="medical"
                          size={18}
                          color={colors.primary}
                        />{" "}
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
                            Vui lòng điền đầy đủ: tên thuốc, liều lượng và tần
                            suất cho tất cả các thuốc
                          </Text>
                        )}
                      </Text>
                    </View>
                  </View>
                  {medicines.map((medicine, index) => (
                    <View key={index} style={styles.medicineCard}>
                      <View style={styles.medicineHeader}>
                        <View style={styles.medicineIndexContainer}>
                          <Ionicons
                            name="medical"
                            size={16}
                            color={colors.primary}
                          />
                          <Text style={styles.medicineIndex}>
                            Thuốc {index + 1}
                          </Text>
                        </View>
                        {medicines.length > 1 && (
                          <TouchableOpacity
                            style={styles.removeMedicineButton}
                            onPress={() => removeMedicine(index)}
                            hitSlop={{
                              top: 10,
                              bottom: 10,
                              left: 10,
                              right: 10,
                            }}
                          >
                            <Ionicons
                              name="trash"
                              size={24}
                              color={colors.error}
                            />
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
                              updateMedicine(index, "name", value)
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
                            Liều lượng *
                          </Text>
                          <TextInput
                            style={[styles.input, styles.medicineInput]}
                            value={medicine.dosage}
                            onChangeText={(value) =>
                              updateMedicine(index, "dosage", value)
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
                            Tần suất *
                          </Text>
                          <TextInput
                            style={[styles.input, styles.medicineInput]}
                            value={medicine.frequency}
                            onChangeText={(value) =>
                              updateMedicine(index, "frequency", value)
                            }
                            placeholder="3 lần/ngày"
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
                              updateMedicine(index, "notes", value)
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
                    onPress={addMedicine}
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
                          onDateChange={setStartDate}
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
                          onDateChange={setEndDate}
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
                </>
              )}
            </ScrollView>

            {/* Modal Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setIsModalVisible(false);
                  setEditingRequest(null);
                  resetForm();
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="close-outline" size={20} color={colors.text} />
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.previewButton]}
                onPress={handleShowSummary}
                activeOpacity={0.8}
              >
                <Ionicons name="eye-outline" size={20} color="white" />
                <Text style={styles.previewButtonText}>Xem trước</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Student Picker Modal */}
      <Modal
        visible={isStudentPickerVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsStudentPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.studentPickerModal}>
            <View style={styles.studentPickerHeader}>
              <Text style={styles.studentPickerTitle}>Chọn học sinh</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsStudentPickerVisible(false)}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Ionicons
                  name="search"
                  size={20}
                  color={colors.textSecondary}
                />
                <TextInput
                  style={styles.searchInput}
                  value={studentSearchQuery}
                  onChangeText={setStudentSearchQuery}
                  placeholder="Tìm kiếm học sinh..."
                />
                {studentSearchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setStudentSearchQuery("")}>
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
                    {studentSearchQuery
                      ? "Không tìm thấy học sinh"
                      : "Không có học sinh nào"}
                  </Text>
                  <Text style={styles.noResultsSubtext}>
                    {studentSearchQuery
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
                    onPress={() => handleStudentSelect(student._id)}
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
                        <View style={styles.studentPickerItemSelected}>
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
                onPress={() => setIsStudentPickerVisible(false)}
              >
                <Text style={styles.studentPickerCancelText}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Detail Modal */}
      <Modal
        visible={isDetailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.detailModalTitle}>
                Chi tiết yêu cầu thuốc
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsDetailModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedRequest && (
              <ScrollView
                style={styles.modalBody}
                showsVerticalScrollIndicator={true}
              >
                {/* Action Buttons - positioned above student name */}
                {canEditRequest(selectedRequest) && (
                  <View style={styles.detailActionButtons}>
                    <TouchableOpacity
                      style={styles.smallEditButton}
                      onPress={() => {
                        setIsDetailModalVisible(false);
                        handleEditRequest(selectedRequest);
                      }}
                    >
                      <Ionicons
                        name="pencil"
                        size={16}
                        color={colors.primary}
                      />
                      <Text style={styles.smallEditButtonText}>Chỉnh sửa</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.smallDeleteButton}
                      onPress={() => {
                        setIsDetailModalVisible(false);
                        handleDeleteRequest(selectedRequest);
                      }}
                    >
                      <Ionicons name="trash" size={16} color={colors.error} />
                      <Text style={styles.smallDeleteButtonText}>Xóa</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Học sinh</Text>
                  <Text style={styles.detailValue}>
                    {getStudentName(selectedRequest)}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Ngày tạo</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(selectedRequest.createdAt)}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Thời gian sử dụng</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(
                      selectedRequest.startDate || selectedRequest.start_date
                    )}{" "}
                    -{" "}
                    {formatDate(
                      selectedRequest.endDate || selectedRequest.end_date
                    )}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Danh sách thuốc</Text>
                  {(selectedRequest.medicines &&
                  selectedRequest.medicines.length > 0
                    ? selectedRequest.medicines
                    : [
                        {
                          name: selectedRequest.medicine_name || "N/A",
                          dosage: selectedRequest.dosage || "N/A",
                          frequency: selectedRequest.frequency || "N/A",
                          notes: selectedRequest.instructions || "",
                        },
                      ]
                  ).map((medicine, index) => (
                    <View key={index} style={styles.medicineDetailCard}>
                      <Text style={styles.medicineDetailName}>
                        {medicine.name}
                      </Text>
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
            )}
          </View>
        </View>
      </Modal>

      {/* Summary Modal */}
      <Modal
        visible={isSummaryModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsSummaryModalVisible(false)}
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
                      {getSelectedStudentInfo()?.first_name}{" "}
                      {getSelectedStudentInfo()?.last_name}
                    </Text>
                  </View>

                  <View
                    style={[styles.summaryCard, styles.summaryCardVertical]}
                  >
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
                      {medicines.filter((m) => m.name.trim() !== "").length}{" "}
                      loại
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
                  onPress={handleBackToEdit}
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
                  onPress={
                    editingRequest ? handleUpdateRequest : handleCreateRequest
                  }
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
    marginBottom: 8,
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
});

export default ParentMedicineRequests;
