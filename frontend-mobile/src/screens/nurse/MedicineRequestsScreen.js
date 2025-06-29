import React, {useState, useEffect} from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
} from "react-native";
import nurseAPI from "../../services/nurseApi";
import colors from "../../styles/colors";

// Import components
import ScreenHeader from "./components/ScreenHeader";
import LoadingScreen from "./components/LoadingScreen";
import EmptyState from "./components/EmptyState";
import ModalForm from "./components/ModalForm";
import MedicineRequestCard from "./components/MedicineRequestCard";
import MedicineRequestForm from "./components/MedicineRequestForm";

const MedicineRequestsScreen = ({navigation}) => {
  const [requests, setRequests] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    studentId: "",
    medicine_name: "",
    reason: "",
    dosage: "",
    frequency: "",
    duration: "",
  });

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await nurseAPI.getMedicineRequests();
      setRequests(response);
    } catch (error) {
      console.error("Error loading requests:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách yêu cầu thuốc");
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const response = await nurseAPI.getStudents();
      setStudents(response);
      if (response.length > 0) {
        setFormData((prev) => ({...prev, studentId: response[0]._id}));
      }
    } catch (error) {
      console.error("Error loading students:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  };

  useEffect(() => {
    loadRequests();
    loadStudents();
  }, []);

  const handleViewRequest = (request) => {
    Alert.alert(
      "Chi Tiết Yêu Cầu",
      `Thuốc: ${request.medicine_name}\nLý do: ${request.reason}\nTrạng thái: ${request.status}\nHọc sinh: ${request.student?.first_name} ${request.student?.last_name}`,
      [
        {
          text: "Từ chối",
          style: "destructive",
          onPress: () => handleRejectRequest(request),
        },
        {text: "Phê duyệt", onPress: () => handleApproveRequest(request)},
        {text: "Đóng"},
      ]
    );
  };

  const handleApproveRequest = (request) => {
    Alert.alert(
      "Phê duyệt",
      "Chức năng phê duyệt yêu cầu sẽ được phát triển sau."
    );
  };

  const handleRejectRequest = (request) => {
    Alert.alert("Từ chối", "Chức năng từ chối yêu cầu sẽ được phát triển sau.");
  };

  const handleCreateRequest = () => {
    setFormData({
      studentId: students.length > 0 ? students[0]._id : "",
      medicine_name: "",
      reason: "",
      dosage: "",
      frequency: "",
      duration: "",
    });
    setModalVisible(true);
  };

  const handleSaveRequest = async () => {
    if (!formData.studentId || !formData.medicine_name || !formData.reason) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      Alert.alert(
        "Thông Báo",
        "Chức năng tạo yêu cầu thuốc cần backend API để hoạt động. Hiện tại chỉ có thể xem danh sách."
      );
      setModalVisible(false);
    } catch (error) {
      console.error("Error creating request:", error);
      Alert.alert("Lỗi", "Không thể tạo yêu cầu thuốc");
    }
  };

  if (loading) {
    return <LoadingScreen message="Đang tải yêu cầu thuốc..." />;
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Quản Lý Yêu Cầu Thuốc"
        onBack={() => navigation.goBack()}
        onAdd={handleCreateRequest}
        backgroundColor="#4ECDC4"
      />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{requests.length}</Text>
            <Text style={styles.statLabel}>Tổng Yêu Cầu</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {requests.filter((r) => r.status === "Pending").length}
            </Text>
            <Text style={styles.statLabel}>Chờ Xử Lý</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {requests.filter((r) => r.status === "Approved").length}
            </Text>
            <Text style={styles.statLabel}>Đã Phê Duyệt</Text>
          </View>
        </View>

        <View style={styles.requestsContainer}>
          {requests.length === 0 ? (
            <EmptyState message="Không có yêu cầu thuốc nào" />
          ) : (
            requests.map((request, index) => (
              <MedicineRequestCard
                key={request._id || index}
                request={request}
                onPress={handleViewRequest}
              />
            ))
          )}
        </View>
      </ScrollView>

      <ModalForm
        visible={modalVisible}
        title="Tạo Yêu Cầu Thuốc"
        onClose={() => setModalVisible(false)}
        onSave={handleSaveRequest}
        saveButtonText="Tạo Yêu Cầu"
        disabled={
          !formData.studentId || !formData.medicine_name || !formData.reason
        }
      >
        <MedicineRequestForm
          formData={formData}
          setFormData={setFormData}
          students={students}
        />
      </ModalForm>
    </View>
  );
};

const styles = StyleSheet.create({
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
    color: "#4ECDC4",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: "#4ECDC4",
    textAlign: "center",
  },
  requestsContainer: {
    padding: 20,
    gap: 15,
  },
});

export default MedicineRequestsScreen;
