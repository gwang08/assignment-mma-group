import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  Dimensions,
} from "react-native";
import { parentAPI } from "../../services/parentApi";
import colors from "../../styles/colors";

const { width } = Dimensions.get("window");

const StudentHealthProfileScreen = ({ route, navigation }) => {
  const { student } = route.params;
  const [healthProfile, setHealthProfile] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHealthProfile();
  }, []);

  const loadHealthProfile = async () => {
    try {
      setLoading(true);
      const profile = await parentAPI.getChildHealthProfile(student.id);
      setHealthProfile(profile);
    } catch (error) {
      console.error("Load health profile error:", error);
      setHealthProfile(null);
      Alert.alert("Lỗi", "Không thể tải hồ sơ sức khỏe");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHealthProfile();
    setRefreshing(false);
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "nghiêm trọng":
        return colors.error;
      case "trung bình":
        return colors.warning;
      case "nhẹ":
        return colors.info;
      default:
        return colors.textSecondary;
    }
  };

  const InfoCard = ({ title, children, actionText, onAction }) => (
    <View style={styles.infoCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        {actionText && (
          <TouchableOpacity onPress={onAction}>
            <Text style={styles.actionText}>{actionText}</Text>
          </TouchableOpacity>
        )}
      </View>
      {children}
    </View>
  );

  const AllergyItem = ({ allergy }) => (
    <View style={styles.listItem}>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{allergy.name}</Text>
        <Text style={styles.itemSubtitle}>{allergy.type}</Text>
      </View>
      <View
        style={[
          styles.severityBadge,
          { backgroundColor: getSeverityColor(allergy.severity) },
        ]}
      >
        <Text style={styles.severityText}>{allergy.severity}</Text>
      </View>
    </View>
  );

  const ChronicDiseaseItem = ({ disease }) => (
    <View style={styles.listItem}>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{disease.name}</Text>
        <Text style={styles.itemSubtitle}>Thuốc: {disease.medication}</Text>
      </View>
      <View
        style={[
          styles.severityBadge,
          { backgroundColor: getSeverityColor(disease.severity) },
        ]}
      >
        <Text style={styles.severityText}>{disease.severity}</Text>
      </View>
    </View>
  );

  const VaccinationItem = ({ vaccination }) => (
    <View style={styles.listItem}>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{vaccination.name}</Text>
        <Text style={styles.itemSubtitle}>
          Tiêm: {new Date(vaccination.date).toLocaleDateString("vi-VN")}
        </Text>
        {vaccination.next_due && (
          <Text style={styles.nextDueText}>
            Mũi tiếp:{" "}
            {new Date(vaccination.next_due).toLocaleDateString("vi-VN")}
          </Text>
        )}
      </View>
      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor: vaccination.next_due
              ? colors.warning
              : colors.success,
          },
        ]}
      >
        <Text style={styles.statusText}>
          {vaccination.next_due ? "Cần tiêm lại" : "Hoàn thành"}
        </Text>
      </View>
    </View>
  );

  const TreatmentItem = ({ treatment }) => (
    <View style={styles.treatmentItem}>
      <View style={styles.treatmentHeader}>
        <Text style={styles.treatmentDate}>
          {new Date(treatment.date).toLocaleDateString("vi-VN")}
        </Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                treatment.status === "Đã khỏi" ? colors.success : colors.info,
            },
          ]}
        >
          <Text style={styles.statusText}>{treatment.status}</Text>
        </View>
      </View>
      <Text style={styles.treatmentCondition}>{treatment.condition}</Text>
      <Text style={styles.treatmentText}>{treatment.treatment}</Text>
      <Text style={styles.treatmentDoctor}>Bác sĩ: {treatment.doctor}</Text>
    </View>
  );

  if (loading || !healthProfile) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hồ sơ sức khỏe</Text>
        <Text style={styles.studentName}>
          {student.first_name} {student.last_name}
        </Text>
        <Text style={styles.studentInfo}>Lớp {student.class_name}</Text>
      </View>

      {/* Emergency Info */}
      <InfoCard title="Thông tin khẩn cấp">
        <View style={styles.emergencyInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nhóm máu:</Text>
            <Text style={styles.infoValue}>
              {healthProfile.emergency_info.blood_type}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Liên hệ khẩn cấp:</Text>
            <Text style={styles.infoValue}>
              {healthProfile.emergency_info.emergency_contact ? "Có" : "Không"}
            </Text>
          </View>
          <View style={styles.noteContainer}>
            <Text style={styles.noteLabel}>Ghi chú y tế:</Text>
            <Text style={styles.noteText}>
              {healthProfile.emergency_info.medical_notes}
            </Text>
          </View>
        </View>
      </InfoCard>

      {/* Medical Measurements */}
      <InfoCard title="Chỉ số sức khỏe">
        <View style={styles.measurementsGrid}>
          <View style={styles.measurementItem}>
            <Text style={styles.measurementLabel}>Chiều cao</Text>
            <Text style={styles.measurementValue}>
              {healthProfile.medical_measurements.height}
            </Text>
          </View>
          <View style={styles.measurementItem}>
            <Text style={styles.measurementLabel}>Cân nặng</Text>
            <Text style={styles.measurementValue}>
              {healthProfile.medical_measurements.weight}
            </Text>
          </View>
          <View style={styles.measurementItem}>
            <Text style={styles.measurementLabel}>BMI</Text>
            <Text style={styles.measurementValue}>
              {healthProfile.medical_measurements.bmi}
            </Text>
          </View>
          <View style={styles.measurementItem}>
            <Text style={styles.measurementLabel}>Huyết áp</Text>
            <Text style={styles.measurementValue}>
              {healthProfile.medical_measurements.blood_pressure}
            </Text>
          </View>
        </View>
        <Text style={styles.lastUpdated}>
          Cập nhật:{" "}
          {new Date(
            healthProfile.medical_measurements.last_updated
          ).toLocaleDateString("vi-VN")}
        </Text>
      </InfoCard>

      {/* Vision & Hearing */}
      <InfoCard title="Thị lực & Thính lực">
        <View style={styles.senseContainer}>
          <View style={styles.senseSection}>
            <Text style={styles.senseTitle}>Thị lực</Text>
            <View style={styles.senseDetails}>
              <Text style={styles.senseText}>
                Mắt trái: {healthProfile.vision_status.left_eye}
              </Text>
              <Text style={styles.senseText}>
                Mắt phải: {healthProfile.vision_status.right_eye}
              </Text>
              <Text style={styles.senseText}>
                Kính:{" "}
                {healthProfile.vision_status.requires_glasses ? "Có" : "Không"}
              </Text>
            </View>
          </View>
          <View style={styles.senseSection}>
            <Text style={styles.senseTitle}>Thính lực</Text>
            <View style={styles.senseDetails}>
              <Text style={styles.senseText}>
                Tai trái: {healthProfile.hearing_status.left_ear}
              </Text>
              <Text style={styles.senseText}>
                Tai phải: {healthProfile.hearing_status.right_ear}
              </Text>
              <Text style={styles.senseText}>
                Máy trợ thính:{" "}
                {healthProfile.hearing_status.requires_aid ? "Có" : "Không"}
              </Text>
            </View>
          </View>
        </View>
      </InfoCard>

      {/* Allergies */}
      <InfoCard
        title="Dị ứng"
        actionText="Cập nhật"
        onAction={() =>
          navigation.navigate("HealthProfileEdit", {
            student,
            section: "allergies",
          })
        }
      >
        {healthProfile.allergies.length > 0 ? (
          healthProfile.allergies.map((allergy, index) => (
            <AllergyItem key={index} allergy={allergy} />
          ))
        ) : (
          <Text style={styles.emptyText}>
            Không có dị ứng nào được ghi nhận
          </Text>
        )}
      </InfoCard>

      {/* Chronic Diseases */}
      <InfoCard
        title="Bệnh mãn tính"
        actionText="Cập nhật"
        onAction={() =>
          navigation.navigate("HealthProfileEdit", {
            student,
            section: "chronic_diseases",
          })
        }
      >
        {healthProfile.chronic_diseases.length > 0 ? (
          healthProfile.chronic_diseases.map((disease, index) => (
            <ChronicDiseaseItem key={index} disease={disease} />
          ))
        ) : (
          <Text style={styles.emptyText}>
            Không có bệnh mãn tính nào được ghi nhận
          </Text>
        )}
      </InfoCard>

      {/* Vaccinations */}
      <InfoCard
        title="Tiêm chủng"
        actionText="Xem lịch sử"
        onAction={() => navigation.navigate("VaccinationRecords", { student })}
      >
        {healthProfile.vaccinations.map((vaccination, index) => (
          <VaccinationItem key={index} vaccination={vaccination} />
        ))}
      </InfoCard>

      {/* Treatment History */}
      <InfoCard
        title="Lịch sử điều trị"
        actionText="Xem tất cả"
        onAction={() =>
          navigation.navigate("HealthProfileHistory", { student })
        }
      >
        {healthProfile.treatment_history.slice(0, 3).map((treatment, index) => (
          <TreatmentItem key={index} treatment={treatment} />
        ))}
      </InfoCard>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => navigation.navigate("HealthProfileEdit", { student })}
        >
          <Text style={styles.actionButtonText}>Chỉnh sửa hồ sơ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.historyButton]}
          onPress={() =>
            navigation.navigate("HealthProfileHistory", { student })
          }
        >
          <Text style={styles.actionButtonText}>Xem lịch sử</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: colors.primary,
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.white,
  },
  studentName: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.white,
    marginTop: 8,
  },
  studentInfo: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: colors.white,
    margin: 16,
    marginBottom: 0,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  actionText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "600",
  },
  emergencyInfo: {
    backgroundColor: colors.error + "10",
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    width: 120,
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  noteContainer: {
    marginTop: 8,
  },
  noteLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  noteText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  measurementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  measurementItem: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 8,
    width: (width - 80) / 2,
    alignItems: "center",
  },
  measurementLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  measurementValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  lastUpdated: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 12,
  },
  senseContainer: {
    flexDirection: "row",
    gap: 16,
  },
  senseSection: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 8,
  },
  senseTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  senseDetails: {
    gap: 4,
  },
  senseText: {
    fontSize: 14,
    color: colors.text,
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  itemSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  nextDueText: {
    fontSize: 12,
    color: colors.warning,
    marginTop: 2,
    fontWeight: "600",
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  severityText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: "600",
  },
  treatmentItem: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  treatmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  treatmentDate: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  treatmentCondition: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  treatmentText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
  },
  treatmentDoctor: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    fontStyle: "italic",
    paddingVertical: 20,
  },
  actionContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  editButton: {
    backgroundColor: colors.primary,
  },
  historyButton: {
    backgroundColor: colors.info,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default StudentHealthProfileScreen;
