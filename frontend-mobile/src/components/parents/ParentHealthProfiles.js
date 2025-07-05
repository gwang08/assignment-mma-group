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
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { colors } from "../../styles/colors";
import parentsAPI from "../../services/parentsAPI";
import DatePickerField from "../common/DatePickerField";

const ParentHealthProfiles = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [students, setStudents] = useState([]);
  const [healthProfiles, setHealthProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [saving, setSaving] = useState(false);

  // Vietnamese allergy severity options for display
  const allergySeverityOptions = [
    { label: "Nhẹ", value: "Nhẹ" },
    { label: "Vừa", value: "Vừa" },
    { label: "Nặng", value: "Nặng" },
  ];

  // Vietnamese hearing status options for display
  const hearingStatusOptions = [
    { label: "Bình thường", value: "Normal" },
    { label: "Giảm nghe nhẹ", value: "Mild Loss" },
    { label: "Giảm nghe vừa", value: "Moderate Loss" },
    { label: "Giảm nghe nặng", value: "Severe Loss" },
  ];

  // Vietnamese chronic disease status options
  const chronicDiseaseStatusOptions = [
    { label: "Đang điều trị", value: "Active" },
    { label: "Đã khỏi", value: "Recovered" },
    { label: "Ổn định", value: "Stable" },
    { label: "Theo dõi", value: "Monitoring" },
  ];

  // Map English enum values to Vietnamese for display
  const mapSeverityToVietnamese = (severity) => {
    if (!severity) return "Nhẹ"; // Default value

    const mapping = {
      Mild: "Nhẹ",
      Moderate: "Vừa",
      Severe: "Nặng",
      // Handle lowercase versions
      mild: "Nhẹ",
      moderate: "Vừa",
      severe: "Nặng",
    };

    return mapping[severity] || severity;
  };

  // Map Vietnamese values back to English for API submission
  const mapSeverityToEnglish = (severity) => {
    const mapping = {
      Nhẹ: "Mild",
      Vừa: "Moderate",
      Nặng: "Severe",
    };
    return mapping[severity] || severity;
  };

  // Map English hearing status to Vietnamese for display
  const mapHearingStatusToVietnamese = (status) => {
    const mapping = {
      Normal: "Bình thường",
      "Mild Loss": "Giảm nghe nhẹ",
      "Moderate Loss": "Giảm nghe vừa",
      "Severe Loss": "Giảm nghe nặng",
    };
    return mapping[status] || status;
  };

  // Map Vietnamese hearing status back to English for API submission
  const mapHearingStatusToEnglish = (status) => {
    const mapping = {
      "Bình thường": "Normal",
      "Giảm nghe nhẹ": "Mild Loss",
      "Giảm nghe vừa": "Moderate Loss",
      "Giảm nghe nặng": "Severe Loss",
    };
    return mapping[status] || status;
  };

  // Map chronic disease status to Vietnamese for display
  const mapChronicStatusToVietnamese = (status) => {
    const mapping = {
      Active: "Đang điều trị",
      Recovered: "Đã khỏi",
      Stable: "Ổn định",
      Monitoring: "Theo dõi",
    };
    return mapping[status] || status;
  };

  // Map Vietnamese chronic disease status back to English for API submission
  const mapChronicStatusToEnglish = (status) => {
    const mapping = {
      "Đang điều trị": "Active",
      "Đã khỏi": "Recovered",
      "Ổn định": "Stable",
      "Theo dõi": "Monitoring",
    };
    return mapping[status] || status;
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const [studentsResponse, profilesResponse] = await Promise.all([
        parentsAPI.getStudents(),
        parentsAPI.getHealthProfiles(),
      ]);

      if (studentsResponse.success && studentsResponse.data) {
        const studentData = studentsResponse.data.map((item) => item.student);
        setStudents(studentData);
      }

      if (profilesResponse.success && profilesResponse.data) {
        setHealthProfiles(profilesResponse.data);
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

  const getStudentName = (profile) => {
    const studentId = profile.student_id || profile.student;
    const student = students.find((s) => s._id === studentId);
    return student ? `${student.first_name} ${student.last_name}` : "N/A";
  };

  const getStudentClass = (profile) => {
    const studentId = profile.student_id || profile.student;
    const student = students.find((s) => s._id === studentId);
    return student?.class_name || "N/A";
  };

  const handleViewDetails = (profile) => {
    setSelectedProfile(profile);
    setIsDetailModalVisible(true);
  };

  const handleEditProfile = (profile) => {
    const mappedAllergies = (profile.allergies || []).map((allergy) => {
      const mappedSeverity = mapSeverityToVietnamese(allergy.severity) || "Nhẹ";
      return {
        ...allergy,
        severity: mappedSeverity,
      };
    });

    const mappedChronicDiseases = (profile.chronicDiseases || []).map(
      (disease) => {
        const mappedStatus =
          mapChronicStatusToVietnamese(disease.status) || "Đang điều trị";
        return {
          ...disease,
          status: mappedStatus,
          diagnosedDate: disease.diagnosedDate
            ? new Date(disease.diagnosedDate).toISOString().split("T")[0]
            : "",
        };
      }
    );

    setEditingProfile({
      ...profile,
      allergies: mappedAllergies,
      chronicDiseases: mappedChronicDiseases,
      treatmentHistory: profile.treatmentHistory || [],
      medications: profile.medications || [],
      vaccinations: profile.vaccinations || [],
      vision: {
        leftEye: profile.vision?.leftEye?.toString() || "",
        rightEye: profile.vision?.rightEye?.toString() || "",
        lastCheckDate: profile.vision?.lastCheckDate
          ? new Date(profile.vision.lastCheckDate).toISOString().split("T")[0]
          : "",
      },
      hearing: {
        leftEar: profile.hearing?.leftEar || "Normal",
        rightEar: profile.hearing?.rightEar || "Normal",
        lastCheckDate: profile.hearing?.lastCheckDate
          ? new Date(profile.hearing.lastCheckDate).toISOString().split("T")[0]
          : "",
      },
    });
    setIsEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    try {
      // Validate required fields
      const validationErrors = validateRequiredFields();
      if (validationErrors.length > 0) {
        Alert.alert("Thiếu thông tin bắt buộc", validationErrors.join("\n"), [
          { text: "OK", style: "default" },
        ]);
        return;
      }

      setSaving(true);
      const studentId = editingProfile.student_id || editingProfile.student;

      // Convert Vietnamese values back to English for API
      const mappedAllergies = editingProfile.allergies.map((allergy) => ({
        ...allergy,
        severity: mapSeverityToEnglish(allergy.severity),
      }));

      const mappedChronicDiseases = editingProfile.chronicDiseases.map(
        (disease) => ({
          ...disease,
          status: mapChronicStatusToEnglish(disease.status),
          diagnosedDate: disease.diagnosedDate
            ? new Date(disease.diagnosedDate)
            : undefined,
        })
      );

      const updateData = {
        allergies: mappedAllergies,
        chronicDiseases: mappedChronicDiseases,
        treatmentHistory: editingProfile.treatmentHistory,
        vaccinations: editingProfile.vaccinations,
        vision: {
          leftEye: editingProfile.vision.leftEye
            ? parseInt(editingProfile.vision.leftEye, 10)
            : undefined,
          rightEye: editingProfile.vision.rightEye
            ? parseInt(editingProfile.vision.rightEye, 10)
            : undefined,
          lastCheckDate: editingProfile.vision.lastCheckDate
            ? new Date(editingProfile.vision.lastCheckDate)
            : undefined,
        },
        hearing: {
          leftEar: editingProfile.hearing.leftEar,
          rightEar: editingProfile.hearing.rightEar,
          lastCheckDate: editingProfile.hearing.lastCheckDate
            ? new Date(editingProfile.hearing.lastCheckDate)
            : undefined,
        },
      };

      const response = await parentsAPI.updateStudentHealthProfile(
        studentId,
        updateData
      );

      if (response.success) {
        Alert.alert("Thành công", "Hồ sơ sức khỏe đã được cập nhật");
        setIsEditModalVisible(false);
        await loadData(); // Reload data to get updated profiles

        // Update the selectedProfile to refresh the detail modal
        const updatedProfiles = await parentsAPI.getHealthProfiles();
        if (updatedProfiles.success && updatedProfiles.data) {
          const updatedProfile = updatedProfiles.data.find(
            (profile) => (profile.student_id || profile.student) === studentId
          );
          if (updatedProfile) {
            setSelectedProfile(updatedProfile);
          }
        }
      } else {
        Alert.alert("Lỗi", response.message || "Không thể cập nhật hồ sơ");
      }
    } catch (error) {
      console.error("Error updating health profile:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi cập nhật hồ sơ");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa có thông tin";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const addAllergy = () => {
    setEditingProfile((prev) => ({
      ...prev,
      allergies: [...prev.allergies, { name: "", severity: "Nhẹ", notes: "" }],
    }));
  };

  const removeAllergy = (index) => {
    setEditingProfile((prev) => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index),
    }));
  };

  const updateAllergy = (index, field, value) => {
    setEditingProfile((prev) => ({
      ...prev,
      allergies: prev.allergies.map((allergy, i) =>
        i === index ? { ...allergy, [field]: value } : allergy
      ),
    }));
  };

  const addChronicDisease = () => {
    setEditingProfile((prev) => ({
      ...prev,
      chronicDiseases: [
        ...prev.chronicDiseases,
        { name: "", status: "Đang điều trị", diagnosedDate: "", notes: "" },
      ],
    }));
  };

  const removeChronicDisease = (index) => {
    setEditingProfile((prev) => ({
      ...prev,
      chronicDiseases: prev.chronicDiseases.filter((_, i) => i !== index),
    }));
  };

  const updateChronicDisease = (index, field, value) => {
    setEditingProfile((prev) => ({
      ...prev,
      chronicDiseases: prev.chronicDiseases.map((disease, i) =>
        i === index ? { ...disease, [field]: value } : disease
      ),
    }));
  };

  const addTreatmentHistory = () => {
    setEditingProfile((prev) => ({
      ...prev,
      treatmentHistory: [
        ...prev.treatmentHistory,
        { condition: "", treatmentDate: "", treatment: "", outcome: "" },
      ],
    }));
  };

  const removeTreatmentHistory = (index) => {
    setEditingProfile((prev) => ({
      ...prev,
      treatmentHistory: prev.treatmentHistory.filter((_, i) => i !== index),
    }));
  };

  const updateTreatmentHistory = (index, field, value) => {
    setEditingProfile((prev) => ({
      ...prev,
      treatmentHistory: prev.treatmentHistory.map((treatment, i) =>
        i === index ? { ...treatment, [field]: value } : treatment
      ),
    }));
  };

  const addVaccination = () => {
    setEditingProfile((prev) => ({
      ...prev,
      vaccinations: [
        ...prev.vaccinations,
        { name: "", date: "", nextDueDate: "", notes: "" },
      ],
    }));
  };

  const removeVaccination = (index) => {
    setEditingProfile((prev) => ({
      ...prev,
      vaccinations: prev.vaccinations.filter((_, i) => i !== index),
    }));
  };

  const updateVaccination = (index, field, value) => {
    setEditingProfile((prev) => ({
      ...prev,
      vaccinations: prev.vaccinations.map((vaccination, i) =>
        i === index ? { ...vaccination, [field]: value } : vaccination
      ),
    }));
  };

  const renderProfileItem = ({ item }) => (
    <TouchableOpacity
      style={styles.profileCard}
      onPress={() => handleViewDetails(item)}
      activeOpacity={0.7}
    >
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Ionicons name="heart" size={24} color="white" />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.studentName}>{getStudentName(item)}</Text>
          <Text style={styles.studentClass}>Lớp: {getStudentClass(item)}</Text>
          <Text style={styles.lastUpdate}>
            Cập nhật: {formatDate(item.updatedAt)}
          </Text>
        </View>
      </View>

      <View style={styles.profileSummary}>
        <View style={styles.summaryItem}>
          <Ionicons name="alert-circle" size={16} color={colors.warning} />
          <Text style={styles.summaryText}>
            Dị ứng: {item.allergies?.length || 0}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Ionicons name="medical" size={16} color={colors.error} />
          <Text style={styles.summaryText}>
            Bệnh mãn tính: {item.chronicDiseases?.length || 0}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Ionicons name="shield-checkmark" size={16} color={colors.success} />
          <Text style={styles.summaryText}>
            Tiêm chủng: {item.vaccinations?.length || 0}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Helper function to validate vision input (integers only)
  const validateVisionInput = (text) => {
    // Allow empty string
    if (text === "") return true;

    // Check if it's a valid integer (only digits)
    if (!/^\d+$/.test(text)) return false;

    const numValue = parseInt(text, 10);
    // Check if it's between 1-10
    return numValue >= 1 && numValue <= 10;
  };

  // Validate required fields before saving
  const validateRequiredFields = () => {
    const errors = [];

    // Validate allergies - name and severity are required
    editingProfile.allergies.forEach((allergy, index) => {
      if (!allergy.name || allergy.name.trim() === "") {
        errors.push(`• Dị ứng ${index + 1}: Tên dị ứng không được để trống`);
      }
      if (!allergy.severity || allergy.severity.trim() === "") {
        errors.push(
          `• Dị ứng ${index + 1}: Mức độ nghiêm trọng không được để trống`
        );
      }
    });

    // Validate chronic diseases - only name is required
    editingProfile.chronicDiseases.forEach((disease, index) => {
      if (!disease.name || disease.name.trim() === "") {
        errors.push(
          `• Bệnh mãn tính ${index + 1}: Tên bệnh không được để trống`
        );
      }
    });

    // Validate treatment history - condition and treatmentDate are required
    editingProfile.treatmentHistory.forEach((treatment, index) => {
      if (!treatment.condition || treatment.condition.trim() === "") {
        errors.push(
          `• Lịch sử điều trị ${
            index + 1
          }: Tình trạng điều trị không được để trống`
        );
      }
      if (!treatment.treatmentDate) {
        errors.push(
          `• Lịch sử điều trị ${index + 1}: Ngày điều trị không được để trống`
        );
      }
    });

    // Validate vaccinations - name and date are required
    editingProfile.vaccinations.forEach((vaccination, index) => {
      if (!vaccination.name || vaccination.name.trim() === "") {
        errors.push(
          `• Tiêm chủng ${index + 1}: Tên vắc xin không được để trống`
        );
      }
      if (!vaccination.date) {
        errors.push(`• Tiêm chủng ${index + 1}: Ngày tiêm không được để trống`);
      }
    });

    // Vision and hearing fields are required in UI
    // Validate vision fields
    if (
      !editingProfile.vision.leftEye ||
      editingProfile.vision.leftEye.trim() === ""
    ) {
      errors.push("• Tình trạng thị lực: Mắt trái không được để trống");
    }
    if (
      !editingProfile.vision.rightEye ||
      editingProfile.vision.rightEye.trim() === ""
    ) {
      errors.push("• Tình trạng thị lực: Mắt phải không được để trống");
    }
    if (!editingProfile.vision.lastCheckDate) {
      errors.push(
        "• Tình trạng thị lực: Ngày kiểm tra cuối không được để trống"
      );
    }

    // Validate hearing fields
    if (
      !editingProfile.hearing.leftEar ||
      editingProfile.hearing.leftEar.trim() === ""
    ) {
      errors.push("• Tình trạng thính lực: Tai trái không được để trống");
    }
    if (
      !editingProfile.hearing.rightEar ||
      editingProfile.hearing.rightEar.trim() === ""
    ) {
      errors.push("• Tình trạng thính lực: Tai phải không được để trống");
    }
    if (!editingProfile.hearing.lastCheckDate) {
      errors.push(
        "• Tình trạng thính lực: Ngày kiểm tra cuối không được để trống"
      );
    }

    return errors;
  };

  // Helper function to get input style with error indication
  const getInputStyle = (value, isRequired = false) => {
    const baseStyle = [styles.textInput];
    if (isRequired && (!value || value.trim() === "")) {
      baseStyle.push(styles.requiredInputEmpty);
    }
    return baseStyle;
  };

  // Helper function to get picker style with error indication
  const getPickerStyle = (value, isRequired = false) => {
    const baseStyle = [styles.picker];
    if (isRequired && (!value || value.trim() === "")) {
      baseStyle.push(styles.requiredPickerEmpty);
    }
    return baseStyle;
  };

  // Helper function to get picker container style with error indication
  const getPickerContainerStyle = (value, isRequired = false) => {
    const baseStyle = [styles.pickerContainer];
    if (isRequired && (!value || value.trim() === "")) {
      baseStyle.push(styles.requiredInputEmpty);
    }
    return baseStyle;
  };

  // Helper function to get date picker style with error indication
  const getDatePickerStyle = (value, isRequired = false) => {
    const baseStyle = [styles.textInput];
    if (isRequired && !value) {
      baseStyle.push(styles.requiredInputEmpty);
    }
    return baseStyle;
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={healthProfiles}
        renderItem={renderProfileItem}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={64} color={colors.lightGray} />
            <Text style={styles.emptyText}>Chưa có hồ sơ sức khỏe</Text>
            <Text style={styles.emptySubtext}>
              Hồ sơ sức khỏe sẽ được tạo sau khi học sinh tham gia khám sức khỏe
            </Text>
          </View>
        }
      />

      {/* Health Profile Detail Modal */}
      <Modal
        visible={isDetailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi tiết hồ sơ sức khỏe</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsDetailModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedProfile && (
              <>
                <ScrollView
                  style={styles.modalBody}
                  showsVerticalScrollIndicator={true}
                  contentContainerStyle={styles.modalBodyContent}
                >
                  <Text style={styles.modalStudentName}>
                    {getStudentName(selectedProfile)}
                  </Text>

                  {/* Small Edit Button under student name */}
                  <TouchableOpacity
                    style={styles.smallEditButton}
                    onPress={() => {
                      handleEditProfile(selectedProfile);
                    }}
                  >
                    <Ionicons name="pencil" size={16} color={colors.primary} />
                    <Text style={styles.smallEditButtonText}>Chỉnh sửa</Text>
                  </TouchableOpacity>

                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Dị ứng</Text>
                    {selectedProfile.allergies?.length > 0 ? (
                      selectedProfile.allergies.map((allergy, index) => (
                        <View key={index}>
                          <Text style={styles.detailItem}>
                            • {allergy.name || allergy} (
                            {mapSeverityToVietnamese(allergy.severity) ||
                              "Chưa xác định"}
                            )
                          </Text>
                          {allergy.notes && (
                            <Text style={styles.detailItem}>
                              &nbsp;&nbsp;Ghi chú: {allergy.notes}
                            </Text>
                          )}
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noDataText}>Không có dị ứng</Text>
                    )}
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Bệnh mãn tính</Text>
                    {selectedProfile.chronicDiseases?.length > 0 ? (
                      selectedProfile.chronicDiseases.map((disease, index) => (
                        <View key={index}>
                          <Text style={styles.detailItem}>
                            • {disease.name} -{" "}
                            {mapChronicStatusToVietnamese(disease.status)}
                          </Text>
                          {disease.diagnosedDate && (
                            <Text style={styles.detailItem}>
                              &nbsp;&nbsp;Ngày chẩn đoán:{" "}
                              {formatDate(disease.diagnosedDate)}
                            </Text>
                          )}
                          {disease.notes && (
                            <Text style={styles.detailItem}>
                              &nbsp;&nbsp;Ghi chú: {disease.notes}
                            </Text>
                          )}
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noDataText}>
                        Không có bệnh mãn tính
                      </Text>
                    )}
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Thuốc đang sử dụng</Text>
                    {selectedProfile.medications?.length > 0 ? (
                      selectedProfile.medications.map((medication, index) => (
                        <Text key={index} style={styles.detailItem}>
                          • {medication.name || medication} -{" "}
                          {medication.dosage || "Chưa xác định"}
                        </Text>
                      ))
                    ) : (
                      <Text style={styles.noDataText}>
                        Không có thuốc đang sử dụng
                      </Text>
                    )}
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Lịch sử điều trị</Text>
                    {selectedProfile.treatmentHistory?.length > 0 ? (
                      selectedProfile.treatmentHistory.map(
                        (treatment, index) => (
                          <View key={index}>
                            <Text style={styles.detailItem}>
                              • {treatment.condition}
                            </Text>
                            <Text style={styles.detailItem}>
                              &nbsp;&nbsp;Ngày điều trị:{" "}
                              {formatDate(treatment.treatmentDate)}
                            </Text>
                            {treatment.treatment && (
                              <Text style={styles.detailItem}>
                                &nbsp;&nbsp;Điều trị: {treatment.treatment}
                              </Text>
                            )}
                            {treatment.outcome && (
                              <Text style={styles.detailItem}>
                                &nbsp;&nbsp;Kết quả: {treatment.outcome}
                              </Text>
                            )}
                          </View>
                        )
                      )
                    ) : (
                      <Text style={styles.noDataText}>
                        Không có lịch sử điều trị
                      </Text>
                    )}
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Tình trạng thị lực</Text>
                    {selectedProfile.vision ? (
                      <>
                        <Text style={styles.detailItem}>
                          Mắt trái:{" "}
                          {selectedProfile.vision.leftEye || "Chưa có"}
                        </Text>
                        <Text style={styles.detailItem}>
                          Mắt phải:{" "}
                          {selectedProfile.vision.rightEye || "Chưa có"}
                        </Text>
                        {selectedProfile.vision.lastCheckDate && (
                          <Text style={styles.detailItem}>
                            Ngày kiểm tra cuối:{" "}
                            {formatDate(selectedProfile.vision.lastCheckDate)}
                          </Text>
                        )}
                      </>
                    ) : (
                      <Text style={styles.noDataText}>
                        Chưa có thông tin thị lực
                      </Text>
                    )}
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>
                      Tình trạng thính lực
                    </Text>
                    {selectedProfile.hearing ? (
                      <>
                        <Text style={styles.detailItem}>
                          Tai trái:{" "}
                          {mapHearingStatusToVietnamese(
                            selectedProfile.hearing.leftEar
                          ) || "Chưa có"}
                        </Text>
                        <Text style={styles.detailItem}>
                          Tai phải:{" "}
                          {mapHearingStatusToVietnamese(
                            selectedProfile.hearing.rightEar
                          ) || "Chưa có"}
                        </Text>
                        {selectedProfile.hearing.lastCheckDate && (
                          <Text style={styles.detailItem}>
                            Ngày kiểm tra cuối:{" "}
                            {formatDate(selectedProfile.hearing.lastCheckDate)}
                          </Text>
                        )}
                      </>
                    ) : (
                      <Text style={styles.noDataText}>
                        Chưa có thông tin thính lực
                      </Text>
                    )}
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Lịch sử tiêm chủng</Text>
                    {selectedProfile.vaccinations?.length > 0 ? (
                      selectedProfile.vaccinations.map((vaccination, index) => (
                        <View key={index}>
                          <Text style={styles.detailItem}>
                            • {vaccination.name} -{" "}
                            {formatDate(vaccination.date)}
                          </Text>
                          {vaccination.nextDueDate && (
                            <Text style={styles.detailItem}>
                              &nbsp;&nbsp;Ngày tiêm tiếp theo:{" "}
                              {formatDate(vaccination.nextDueDate)}
                            </Text>
                          )}
                          {vaccination.notes && (
                            <Text style={styles.detailItem}>
                              &nbsp;&nbsp;Ghi chú: {vaccination.notes}
                            </Text>
                          )}
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noDataText}>
                        Chưa có lịch sử tiêm chủng
                      </Text>
                    )}
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Edit Health Profile Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chỉnh sửa hồ sơ sức khỏe</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsEditModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {editingProfile && (
              <ScrollView
                style={styles.modalBody}
                showsVerticalScrollIndicator={true}
              >
                <Text style={styles.modalStudentName}>
                  {getStudentName(editingProfile)}
                </Text>

                {/* Required fields note */}
                <Text style={styles.requiredFieldsNote}>
                  * Các trường có dấu sao là bắt buộc
                </Text>

                {/* Vision Status Section */}
                <View style={styles.editSection}>
                  <Text style={styles.sectionTitle}>Tình trạng thị lực *</Text>
                  <Text style={styles.helperText}>
                    * Nhập số nguyên từ 1 đến 10 (ví dụ: 8)
                  </Text>

                  <View style={styles.inputRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.fieldLabelRequired}>
                        <Text style={styles.fieldLabel}>Mắt trái </Text>
                        <Text style={styles.asterisk}>*</Text>
                      </Text>
                      <TextInput
                        style={[
                          ...getInputStyle(editingProfile.vision.leftEye, true),
                        ]}
                        placeholder="Nhập số từ 1-10"
                        value={editingProfile.vision.leftEye}
                        keyboardType="numeric"
                        onChangeText={(text) => {
                          if (validateVisionInput(text)) {
                            setEditingProfile((prev) => ({
                              ...prev,
                              vision: { ...prev.vision, leftEye: text },
                            }));
                          }
                        }}
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.fieldLabelRequired}>
                        <Text style={styles.fieldLabel}>Mắt phải </Text>
                        <Text style={styles.asterisk}>*</Text>
                      </Text>
                      <TextInput
                        style={[
                          ...getInputStyle(
                            editingProfile.vision.rightEye,
                            true
                          ),
                        ]}
                        placeholder="Nhập số từ 1-10"
                        value={editingProfile.vision.rightEye}
                        keyboardType="numeric"
                        onChangeText={(text) => {
                          if (validateVisionInput(text)) {
                            setEditingProfile((prev) => ({
                              ...prev,
                              vision: { ...prev.vision, rightEye: text },
                            }));
                          }
                        }}
                      />
                    </View>
                  </View>

                  <Text style={styles.fieldLabelRequired}>
                    <Text style={styles.fieldLabel}>Ngày kiểm tra cuối </Text>
                    <Text style={styles.asterisk}>*</Text>
                  </Text>
                  <DatePickerField
                    value={
                      editingProfile.vision.lastCheckDate
                        ? new Date(editingProfile.vision.lastCheckDate)
                        : null
                    }
                    placeholder="Chọn ngày kiểm tra"
                    onDateChange={(date) =>
                      setEditingProfile((prev) => ({
                        ...prev,
                        vision: {
                          ...prev.vision,
                          lastCheckDate: date.toISOString().split("T")[0],
                        },
                      }))
                    }
                    dateRange="past"
                    title="Chọn ngày kiểm tra thị lực"
                    fieldStyle={getDatePickerStyle(
                      editingProfile.vision.lastCheckDate,
                      true
                    )}
                  />
                </View>

                {/* Hearing Status Section */}
                <View style={styles.editSection}>
                  <Text style={styles.sectionTitle}>
                    Tình trạng thính lực *
                  </Text>

                  <Text style={styles.fieldLabelRequired}>
                    <Text style={styles.fieldLabel}>Tai trái </Text>
                    <Text style={styles.asterisk}>*</Text>
                  </Text>
                  <View
                    style={getPickerContainerStyle(
                      editingProfile.hearing.leftEar,
                      true
                    )}
                  >
                    <Picker
                      selectedValue={editingProfile.hearing.leftEar || "Normal"}
                      style={styles.picker}
                      onValueChange={(itemValue) =>
                        setEditingProfile((prev) => ({
                          ...prev,
                          hearing: { ...prev.hearing, leftEar: itemValue },
                        }))
                      }
                    >
                      {hearingStatusOptions.map((option) => (
                        <Picker.Item
                          key={option.value}
                          label={option.label}
                          value={option.value}
                        />
                      ))}
                    </Picker>
                  </View>

                  <Text style={styles.fieldLabelRequired}>
                    <Text style={styles.fieldLabel}>Tai phải </Text>
                    <Text style={styles.asterisk}>*</Text>
                  </Text>
                  <View
                    style={getPickerContainerStyle(
                      editingProfile.hearing.rightEar,
                      true
                    )}
                  >
                    <Picker
                      selectedValue={
                        editingProfile.hearing.rightEar || "Normal"
                      }
                      style={styles.picker}
                      onValueChange={(itemValue) =>
                        setEditingProfile((prev) => ({
                          ...prev,
                          hearing: { ...prev.hearing, rightEar: itemValue },
                        }))
                      }
                    >
                      {hearingStatusOptions.map((option) => (
                        <Picker.Item
                          key={option.value}
                          label={option.label}
                          value={option.value}
                        />
                      ))}
                    </Picker>
                  </View>

                  <Text style={styles.fieldLabelRequired}>
                    <Text style={styles.fieldLabel}>Ngày kiểm tra cuối </Text>
                    <Text style={styles.asterisk}>*</Text>
                  </Text>
                  <DatePickerField
                    value={
                      editingProfile.hearing.lastCheckDate
                        ? new Date(editingProfile.hearing.lastCheckDate)
                        : null
                    }
                    placeholder="Chọn ngày kiểm tra"
                    onDateChange={(date) =>
                      setEditingProfile((prev) => ({
                        ...prev,
                        hearing: {
                          ...prev.hearing,
                          lastCheckDate: date.toISOString().split("T")[0],
                        },
                      }))
                    }
                    dateRange="past"
                    title="Chọn ngày kiểm tra thính lực"
                    fieldStyle={getDatePickerStyle(
                      editingProfile.hearing.lastCheckDate,
                      true
                    )}
                  />
                </View>

                {/* Allergies Section */}
                <View style={styles.editSection}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Dị ứng</Text>
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={addAllergy}
                    >
                      <Ionicons name="add" size={20} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                  {editingProfile.allergies.map((allergy, index) => (
                    <View key={index} style={styles.itemContainer}>
                      <View style={styles.inputRow}>
                        <TextInput
                          style={[styles.textInput, { flex: 1 }]}
                          placeholder="Tên dị ứng *"
                          value={allergy.name}
                          onChangeText={(text) =>
                            updateAllergy(index, "name", text)
                          }
                        />
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => removeAllergy(index)}
                        >
                          <Ionicons
                            name="trash"
                            size={16}
                            color={colors.error}
                          />
                        </TouchableOpacity>
                      </View>
                      <View style={styles.pickerContainer}>
                        <Text style={styles.pickerLabel}>
                          Mức độ nghiêm trọng{" "}
                        </Text>
                        <Picker
                          selectedValue={allergy.severity || "Nhẹ"}
                          style={styles.picker}
                          onValueChange={(itemValue) =>
                            updateAllergy(index, "severity", itemValue)
                          }
                        >
                          {allergySeverityOptions.map((option) => (
                            <Picker.Item
                              key={option.value}
                              label={option.label}
                              value={option.value}
                            />
                          ))}
                        </Picker>
                      </View>
                      <TextInput
                        style={[styles.textInput, styles.descriptionInput]}
                        placeholder="Ghi chú"
                        multiline
                        value={allergy.notes || ""}
                        onChangeText={(text) =>
                          updateAllergy(index, "notes", text)
                        }
                      />
                    </View>
                  ))}
                </View>

                {/* Chronic Diseases Section */}
                <View style={styles.editSection}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Bệnh mãn tính</Text>
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={addChronicDisease}
                    >
                      <Ionicons name="add" size={20} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                  {editingProfile.chronicDiseases.map((disease, index) => (
                    <View key={index} style={styles.itemContainer}>
                      <View style={styles.inputRow}>
                        <TextInput
                          style={[styles.textInput, { flex: 1 }]}
                          placeholder="Tên bệnh *"
                          value={disease.name}
                          onChangeText={(text) =>
                            updateChronicDisease(index, "name", text)
                          }
                        />
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => removeChronicDisease(index)}
                        >
                          <Ionicons
                            name="trash"
                            size={16}
                            color={colors.error}
                          />
                        </TouchableOpacity>
                      </View>
                      <View style={styles.pickerContainer}>
                        <Text style={styles.pickerLabel}>Tình trạng bệnh</Text>
                        <Picker
                          selectedValue={disease.status || "Đang điều trị"}
                          style={styles.picker}
                          onValueChange={(itemValue) =>
                            updateChronicDisease(index, "status", itemValue)
                          }
                        >
                          {chronicDiseaseStatusOptions.map((option) => (
                            <Picker.Item
                              key={option.value}
                              label={option.label}
                              value={option.value}
                            />
                          ))}
                        </Picker>
                      </View>
                      <DatePickerField
                        value={
                          disease.diagnosedDate
                            ? new Date(disease.diagnosedDate)
                            : null
                        }
                        placeholder="Ngày chẩn đoán"
                        onDateChange={(date) =>
                          updateChronicDisease(
                            index,
                            "diagnosedDate",
                            date.toISOString().split("T")[0]
                          )
                        }
                        dateRange="past"
                        title="Chọn ngày chẩn đoán"
                      />
                      <TextInput
                        style={[styles.textInput, styles.descriptionInput]}
                        placeholder="Ghi chú"
                        multiline
                        value={disease.notes || ""}
                        onChangeText={(text) =>
                          updateChronicDisease(index, "notes", text)
                        }
                      />
                    </View>
                  ))}
                </View>

                {/* Treatment History Section */}
                <View style={styles.editSection}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Lịch sử điều trị</Text>
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={addTreatmentHistory}
                    >
                      <Ionicons name="add" size={20} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                  {editingProfile.treatmentHistory.map((treatment, index) => (
                    <View key={index} style={styles.itemContainer}>
                      <View style={styles.inputRow}>
                        <TextInput
                          style={[styles.textInput, { flex: 2 }]}
                          placeholder="Tình trạng điều trị *"
                          value={treatment.condition}
                          onChangeText={(text) =>
                            updateTreatmentHistory(index, "condition", text)
                          }
                        />
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => removeTreatmentHistory(index)}
                        >
                          <Ionicons
                            name="trash"
                            size={16}
                            color={colors.error}
                          />
                        </TouchableOpacity>
                      </View>
                      <DatePickerField
                        value={
                          treatment.treatmentDate
                            ? new Date(treatment.treatmentDate)
                            : null
                        }
                        placeholder="Ngày điều trị *"
                        onDateChange={(date) =>
                          updateTreatmentHistory(
                            index,
                            "treatmentDate",
                            date.toISOString().split("T")[0]
                          )
                        }
                        dateRange="past"
                        title="Chọn ngày điều trị"
                      />
                      <TextInput
                        style={[styles.textInput]}
                        placeholder="Phương pháp điều trị"
                        value={treatment.treatment || ""}
                        onChangeText={(text) =>
                          updateTreatmentHistory(index, "treatment", text)
                        }
                      />
                      <TextInput
                        style={[styles.textInput, styles.descriptionInput]}
                        placeholder="Kết quả"
                        multiline
                        value={treatment.outcome || ""}
                        onChangeText={(text) =>
                          updateTreatmentHistory(index, "outcome", text)
                        }
                      />
                    </View>
                  ))}
                </View>

                {/* Vaccinations Section */}
                <View style={styles.editSection}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Lịch sử tiêm chủng</Text>
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={addVaccination}
                    >
                      <Ionicons name="add" size={20} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                  {editingProfile.vaccinations.map((vaccination, index) => (
                    <View key={index} style={styles.itemContainer}>
                      <View style={styles.inputRow}>
                        <TextInput
                          style={[styles.textInput, { flex: 2 }]}
                          placeholder="Tên vắc xin *"
                          value={vaccination.name}
                          onChangeText={(text) =>
                            updateVaccination(index, "name", text)
                          }
                        />
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => removeVaccination(index)}
                        >
                          <Ionicons
                            name="trash"
                            size={16}
                            color={colors.error}
                          />
                        </TouchableOpacity>
                      </View>
                      <View style={styles.inputRow}>
                        <View style={{ flex: 1 }}>
                          <DatePickerField
                            value={
                              vaccination.date
                                ? new Date(vaccination.date)
                                : null
                            }
                            placeholder="Ngày tiêm *"
                            onDateChange={(date) =>
                              updateVaccination(
                                index,
                                "date",
                                date.toISOString().split("T")[0]
                              )
                            }
                            dateRange="past"
                            title="Chọn ngày tiêm"
                          />
                        </View>
                      </View>
                      <TextInput
                        style={[styles.textInput, styles.descriptionInput]}
                        placeholder="Ghi chú"
                        multiline
                        value={vaccination.notes || ""}
                        onChangeText={(text) =>
                          updateVaccination(index, "notes", text)
                        }
                      />
                    </View>
                  ))}
                </View>

                {/* Save Button */}
                <TouchableOpacity
                  style={[styles.saveButton, saving && styles.disabledButton]}
                  onPress={handleSaveProfile}
                  disabled={saving}
                >
                  <Text style={styles.saveButtonText}>
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}
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
  listContainer: {
    padding: 20,
  },
  profileCard: {
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
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
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
  profileInfo: {
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
  lastUpdate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 20,
  },
  viewButton: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 20,
  },
  profileSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  summaryText: {
    fontSize: 12,
    color: colors.textSecondary,
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
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalHeaderButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
    flexGrow: 1,
  },
  modalBodyContent: {
    paddingBottom: 20,
  },
  modalStudentName: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    textAlign: "center",
    marginBottom: 10,
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
    alignSelf: "center",
    marginBottom: 20,
  },
  smallEditButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  detailSection: {
    marginBottom: 20,
  },
  editSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  addButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
  },
  detailItem: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
    paddingLeft: 10,
  },
  noDataText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: "italic",
    paddingLeft: 10,
  },
  itemContainer: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  textInput: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: "white",
  },
  dateInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: "white",
    marginBottom: 10,
  },
  pickerLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    paddingLeft: 4,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
    marginTop: 5,
  },
  fieldLabelRequired: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 5,
  },
  asterisk: {
    color: colors.error,
  },
  descriptionInput: {
    height: 80,
    textAlignVertical: "top",
  },
  removeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
  },
  saveButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: colors.textSecondary,
  },
  pickerContainer: {
    borderWidth: 1,
    marginBottom: 10,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: "white",
    overflow: "hidden",
  },
  picker: {
    width: "100%",
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 10,
    fontStyle: "italic",
  },
  requiredFieldsNote: {
    fontSize: 12,
    color: colors.error,
    textAlign: "center",
    fontStyle: "italic",
  },
  requiredInputEmpty: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  requiredPickerEmpty: {
    borderColor: colors.error,
    borderWidth: 2,
  },
});

export default ParentHealthProfiles;
