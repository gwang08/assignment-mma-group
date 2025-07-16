import React, {useState, useEffect} from "react";
import {StyleSheet, ScrollView, Alert, RefreshControl} from "react-native";
import nurseAPI from "../../services/nurseApi";
import colors from "../../styles/colors";
import {SafeAreaView} from "react-native-safe-area-context";

// Import components
import ScreenHeader from "./components/ScreenHeader";
import LoadingScreen from "./components/LoadingScreen";
import StudentStats from "./components/StudentStats";
import StudentList from "./components/StudentList";
import StudentDetailModal from "./components/StudentDetailModal";
import SearchAndFilterBar from "./components/SearchAndFilterBar";

const StudentsScreen = ({navigation}) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [healthProfile, setHealthProfile] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [detailTab, setDetailTab] = useState("info");

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await nurseAPI.getStudents();
      console.log(response.data);
      let studentsArr = [];
      if (Array.isArray(response)) {
        studentsArr = response;
      } else if (Array.isArray(response.data)) {
        studentsArr = response.data;
      } else if (response && Array.isArray(response.students)) {
        studentsArr = response.students;
      }
      setStudents(studentsArr);
    } catch (error) {
      console.error("Error loading students:", error);
      setStudents([]);
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
    setSelectedStudent(student);
    setDetailModalVisible(true);
    setDetailTab("info");
    setDetailLoading(true);
    let healthProfileData = null;
    let medicalHistoryData = null;
    try {
      try {
        healthProfileData = await nurseAPI.getStudentHealthProfile(student._id);
      } catch (error) {
        if (error.status === 404) {
          healthProfileData = null;
        } else {
          throw error;
        }
      }
      try {
        medicalHistoryData = await nurseAPI.getStudentMedicalHistory(
          student._id
        );
      } catch (error) {
        medicalHistoryData = {
          medicalEvents: [],
          medicineRequests: [],
          campaignResults: [],
        };
      }
    } catch (error) {
      console.error("Error loading student details:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin chi tiết học sinh");
    }
    setHealthProfile(healthProfileData);
    setMedicalHistory(medicalHistoryData);
    setDetailLoading(false);
  };

  // Lọc students theo search/filter
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      !searchValue ||
      student.first_name?.toLowerCase().includes(searchValue.toLowerCase()) ||
      student.last_name?.toLowerCase().includes(searchValue.toLowerCase()) ||
      student.class_name?.toLowerCase().includes(searchValue.toLowerCase());
    return matchesSearch;
  });

  const handleViewHealthProfile = async (student) => {
    setDetailTab("profile");
    setDetailLoading(true);
    try {
      const profile = await nurseAPI.getStudentHealthProfile(student._id);
      setHealthProfile(profile.data);
    } catch (error) {
      setHealthProfile(null);
      Alert.alert("Lỗi", "Không thể tải hồ sơ sức khỏe");
    }
    setDetailLoading(false);
  };

  const handleViewMedicalHistory = async (student) => {
    setDetailTab("history");
    setDetailLoading(true);
    try {
      const history = await nurseAPI.getStudentMedicalHistory(student._id);
      setMedicalHistory(history);
    } catch (error) {
      setMedicalHistory({
        medicalEvents: [],
        medicineRequests: [],
        campaignResults: [],
      });
      Alert.alert("Lỗi", "Không thể tải lịch sử y tế");
    }
    setDetailLoading(false);
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
        <StudentStats students={students} />
        <SearchAndFilterBar
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          filterValue={filterValue}
          onFilterChange={setFilterValue}
          filterOptions={[{label: "Tất cả", value: ""}]}
          searchLabel="Tìm theo tên, lớp:"
        />
        <StudentList
          students={filteredStudents}
          onViewStudent={handleViewStudent}
        />
      </ScrollView>
      <StudentDetailModal
        visible={detailModalVisible}
        student={selectedStudent}
        healthProfile={healthProfile}
        medicalHistory={medicalHistory}
        loading={detailLoading}
        onClose={() => setDetailModalVisible(false)}
        onViewHealthProfile={() => handleViewHealthProfile(selectedStudent)}
        onViewMedicalHistory={() => handleViewMedicalHistory(selectedStudent)}
        initialTab={detailTab}
        onTabChange={setDetailTab}
      />
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
