import React, {useState, useEffect} from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import nurseAPI from "../../services/nurseApi";
import colors from "../../styles/colors";
import {SafeAreaView} from "react-native-safe-area-context";

// Import components
import ScreenHeader from "./components/ScreenHeader";
import LoadingScreen from "./components/LoadingScreen";
import EmptyState from "./components/EmptyState";

const StudentsScreen = ({navigation}) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await nurseAPI.getStudents();
      setStudents(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Error loading students:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách học sinh");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStudents();
    setRefreshing(false);
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleViewStudent = async (student) => {
    try {
      let healthProfile = null;
      let medicalHistory = null;

      try {
        healthProfile = await nurseAPI.getStudentHealthProfile(student._id);
      } catch (error) {
        if (error.status === 404) {
          // Student doesn't have a health profile yet
          healthProfile = null;
        } else {
          throw error;
        }
      }

      try {
        medicalHistory = await nurseAPI.getStudentMedicalHistory(student._id);
      } catch (error) {
        console.error("Error loading medical history:", error);
        medicalHistory = {
          medicalEvents: [],
          medicineRequests: [],
          campaignResults: [],
        };
      }

      Alert.alert(
        "Thông Tin Học Sinh",
        `Tên: ${student.first_name} ${student.last_name}\nLớp: ${
          student.class_name
        }\nSức khỏe: ${
          healthProfile ? "Có hồ sơ" : "Chưa có hồ sơ"
        }\nLịch sử y tế: ${medicalHistory?.medicalEvents?.length || 0} sự kiện`,
        [
          {
            text: "Xem Hồ Sơ Sức Khỏe",
            onPress: () => handleViewHealthProfile(student),
          },
          {
            text: "Xem Lịch Sử Y Tế",
            onPress: () => handleViewMedicalHistory(student),
          },
          {text: "Đóng"},
        ]
      );
    } catch (error) {
      console.error("Error loading student details:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin chi tiết học sinh");
    }
  };

  const handleViewHealthProfile = (student) => {
    Alert.alert(
      "Hồ Sơ Sức Khỏe",
      `Chức năng xem hồ sơ sức khỏe của ${student.first_name} sẽ được phát triển sau.`
    );
  };

  const handleViewMedicalHistory = (student) => {
    Alert.alert(
      "Lịch Sử Y Tế",
      `Chức năng xem lịch sử y tế của ${student.first_name} sẽ được phát triển sau.`
    );
  };

  if (loading) {
    return <LoadingScreen message="Đang tải danh sách học sinh..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader
        title="Quản Lý Học Sinh"
        onBack={() => navigation.goBack()}
        backgroundColor="#45B7D1"
      />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{students.length}</Text>
            <Text style={styles.statLabel}>Tổng Học Sinh</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {students.filter((s) => s.is_active).length}
            </Text>
            <Text style={styles.statLabel}>Đang Học</Text>
          </View>
        </View>

        <View style={styles.studentsContainer}>
          {students.length === 0 ? (
            <EmptyState message="Không có học sinh nào" />
          ) : (
            students.map((student, index) => (
              <TouchableOpacity
                key={student._id || index}
                style={styles.studentCard}
                onPress={() => handleViewStudent(student)}
              >
                <View style={styles.studentHeader}>
                  <Text style={styles.studentName}>
                    {student.first_name} {student.last_name}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: student.is_active
                          ? "#2ED573"
                          : "#FF4757",
                      },
                    ]}
                  >
                    <Text style={styles.badgeText}>
                      {student.is_active ? "Đang học" : "Nghỉ học"}
                    </Text>
                  </View>
                </View>
                <Text style={styles.studentClass}>
                  Lớp: {student.class_name}
                </Text>
                <Text style={styles.studentGender}>
                  Giới tính: {student.gender}
                </Text>
                <Text style={styles.studentDate}>
                  Ngày sinh:{" "}
                  {new Date(student.dateOfBirth).toLocaleDateString("vi-VN")}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    padding: 20,
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#45B7D1",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
  },
  studentsContainer: {
    padding: 20,
    gap: 15,
  },
  studentCard: {
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#45B7D1",
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  studentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  studentName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  studentClass: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  studentGender: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  studentDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default StudentsScreen;
