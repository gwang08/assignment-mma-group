import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  TextInput,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { parentAPI } from "../../services/parentApi";
import colors from "../../styles/colors";

const LinkedStudentsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLinkedStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchQuery, students]);

  const loadLinkedStudents = async () => {
    try {
      setLoading(true);
      const children = await parentAPI.getChildren();
      setStudents(children || []);
    } catch (error) {
      console.error("Load linked students error:", error);
      setStudents([]);
      Alert.alert("Lỗi", "Không thể tải danh sách học sinh");
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    if (!searchQuery.trim()) {
      setFilteredStudents(students);
      return;
    }

    const filtered = students.filter((student) => {
      const fullName =
        `${student.first_name} ${student.last_name}`.toLowerCase();
      const className = student.class_name.toLowerCase();
      const query = searchQuery.toLowerCase();

      return fullName.includes(query) || className.includes(query);
    });

    setFilteredStudents(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLinkedStudents();
    setRefreshing(false);
  };

  const getHealthStatusColor = (status) => {
    switch (status) {
      case "good":
        return colors.success;
      case "attention":
        return colors.warning;
      case "critical":
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getHealthStatusText = (status) => {
    switch (status) {
      case "good":
        return "Tốt";
      case "attention":
        return "Cần chú ý";
      case "critical":
        return "Nghiêm trọng";
      default:
        return "Không rõ";
    }
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const StudentCard = ({ student }) => (
    <TouchableOpacity
      style={styles.studentCard}
      onPress={() => navigation.navigate("StudentProfile", { student })}
    >
      <View style={styles.studentHeader}>
        <View style={styles.studentMainInfo}>
          <Text style={styles.studentName}>
            {student.first_name} {student.last_name}
          </Text>
          <Text style={styles.studentClass}>Lớp: {student.class_name}</Text>
          <Text style={styles.studentAge}>
            Tuổi: {calculateAge(student.date_of_birth)} • {student.relationship}
          </Text>
        </View>
        <View style={styles.studentStatus}>
          <View
            style={[
              styles.healthStatus,
              {
                backgroundColor: getHealthStatusColor(student.health_status),
              },
            ]}
          >
            <Text style={styles.healthStatusText}>
              {getHealthStatusText(student.health_status)}
            </Text>
          </View>
          {student.emergency_contact && (
            <View style={styles.emergencyBadge}>
              <Text style={styles.emergencyText}>🚨 Liên hệ khẩn cấp</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.studentDetails}>
        {/* Health Conditions */}
        <View style={styles.conditionsContainer}>
          {student.allergies.length > 0 && (
            <View style={styles.conditionItem}>
              <Text style={styles.conditionLabel}>Dị ứng:</Text>
              <Text style={styles.conditionValue}>
                {student.allergies.join(", ")}
              </Text>
            </View>
          )}
          {student.chronic_diseases.length > 0 && (
            <View style={styles.conditionItem}>
              <Text style={styles.conditionLabel}>Bệnh mãn tính:</Text>
              <Text style={styles.conditionValue}>
                {student.chronic_diseases.join(", ")}
              </Text>
            </View>
          )}
        </View>

        {/* Recent Event */}
        <View style={styles.recentEvent}>
          <Text style={styles.recentEventLabel}>Hoạt động gần nhất:</Text>
          <Text style={styles.recentEventText}>{student.recent_event}</Text>
          <Text style={styles.recentEventDate}>
            {new Date(student.recent_event_date).toLocaleDateString("vi-VN")}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.healthButton]}
            onPress={() =>
              navigation.navigate("StudentHealthProfile", { student })
            }
          >
            <Text style={styles.actionButtonText}>Hồ sơ sức khỏe</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.medicineButton]}
            onPress={() =>
              navigation.navigate("CreateMedicineRequest", { student })
            }
          >
            <Text style={styles.actionButtonText}>Yêu cầu thuốc</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>👥</Text>
      <Text style={styles.emptyTitle}>Chưa có học sinh nào</Text>
      <Text style={styles.emptySubtitle}>
        Bạn chưa liên kết với học sinh nào. Hãy tạo yêu cầu liên kết để bắt đầu.
      </Text>
      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => navigation.navigate("LinkStudentRequest")}
      >
        <Text style={styles.linkButtonText}>Liên kết học sinh</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Học sinh đã liên kết</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("LinkStudentRequest")}
        >
          <Text style={styles.addButtonText}>+ Thêm</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm theo tên hoặc lớp..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Students List */}
      <FlatList
        data={filteredStudents}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <StudentCard student={item} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={!loading ? <EmptyState /> : null}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
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
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: colors.white,
    fontWeight: "600",
  },
  searchContainer: {
    padding: 20,
    backgroundColor: colors.white,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: colors.background,
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
  },
  studentCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  studentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  studentMainInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  studentClass: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  studentAge: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  studentStatus: {
    alignItems: "flex-end",
  },
  healthStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 4,
  },
  healthStatusText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: "600",
  },
  emergencyBadge: {
    backgroundColor: colors.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  emergencyText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: "600",
  },
  studentDetails: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  conditionsContainer: {
    marginBottom: 12,
  },
  conditionItem: {
    flexDirection: "row",
    marginBottom: 4,
  },
  conditionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
    width: 80,
  },
  conditionValue: {
    fontSize: 12,
    color: colors.text,
    flex: 1,
  },
  recentEvent: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  recentEventLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  recentEventText: {
    fontSize: 14,
    color: colors.text,
    marginTop: 4,
  },
  recentEventDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  healthButton: {
    backgroundColor: colors.info,
  },
  medicineButton: {
    backgroundColor: colors.warning,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    padding: 40,
    marginTop: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  linkButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  linkButtonText: {
    color: colors.white,
    fontWeight: "600",
  },
});

export default LinkedStudentsScreen;
