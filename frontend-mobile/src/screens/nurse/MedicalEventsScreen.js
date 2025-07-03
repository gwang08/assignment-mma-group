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
import MedicalEventCard from "./components/MedicalEventCard";
import MedicalEventForm from "./components/MedicalEventForm";

const MedicalEventsScreen = ({navigation}) => {
  const [events, setEvents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    studentId: "",
    event_type: "",
    description: "",
    severity: "Medium",
    symptoms: "",
    treatment_notes: "",
    follow_up_required: false,
  });

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await nurseAPI.getMedicalEvents();
      setEvents(response);
    } catch (error) {
      console.error("Error loading events:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách sự kiện y tế");
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
    await loadEvents();
    setRefreshing(false);
  };

  useEffect(() => {
    loadEvents();
    loadStudents();
  }, []);

  const handleCreateEvent = () => {
    setFormData({
      studentId: students.length > 0 ? students[0]._id : "",
      event_type: "",
      description: "",
      severity: "Medium",
      symptoms: "",
      treatment_notes: "",
      follow_up_required: false,
    });
    setModalVisible(true);
  };

  const handleSaveEvent = async () => {
    if (!formData.studentId || !formData.event_type || !formData.description) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      const eventData = {
        ...formData,
        symptoms: formData.symptoms
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s),
      };

      await nurseAPI.createMedicalEvent(eventData);
      Alert.alert("Thành công", "Đã tạo sự kiện y tế mới");
      setModalVisible(false);
      loadEvents();
    } catch (error) {
      console.error("Error creating event:", error);
      Alert.alert("Lỗi", "Không thể tạo sự kiện y tế");
    }
  };

  const handleViewEvent = (event) => {
    Alert.alert(
      "Chi Tiết Sự Kiện",
      `Loại: ${event.event_type}\nMức độ: ${event.severity}\nTrạng thái: ${event.status}\nMô tả: ${event.description}`,
      [
        {text: "Đóng"},
        {
          text: "Giải Quyết",
          onPress: async () => {
            try {
              await nurseAPI.resolveEvent(event._id, "Đã xử lý xong");
              Alert.alert("Thành công", "Đã giải quyết sự kiện y tế");
              loadEvents();
            } catch (error) {
              console.error("Error resolving event:", error);
              Alert.alert("Lỗi", "Không thể giải quyết sự kiện y tế");
            }
          },
        },
        {
          text: "Thêm Thuốc",
          onPress: async () => {
            try {
              await nurseAPI.addMedication(event._id, {
                name: "Paracetamol",
                dosage: "500mg",
                time: Date.now(),
              });
              Alert.alert("Thành công", "Đã thêm thuốc");
              loadEvents();
            } catch (error) {
              console.error("Error adding medication:", error);
              Alert.alert("Lỗi", "Không thể thêm thuốc");
            }
          },
        },
        {
          text: "Thông Báo PH",
          onPress: async () => {
            try {
              await nurseAPI.updateParentNotification(event._id, {
                status: true,
                method: "Phone call",
              });
              Alert.alert("Thành công", "Đã thông báo cho phụ huynh");
              loadEvents();
            } catch (error) {
              console.error("Error notifying parent:", error);
              Alert.alert("Lỗi", "Không thể thông báo cho phụ huynh");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <LoadingScreen message="Đang tải sự kiện y tế..." />;
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Quản Lý Sự Kiện Y Tế"
        onBack={() => navigation.goBack()}
        onAdd={handleCreateEvent}
        backgroundColor="#FF6B6B"
      />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{events.length}</Text>
            <Text style={styles.statLabel}>Tổng Sự Kiện</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {events.filter((e) => e.status === "Open").length}
            </Text>
            <Text style={styles.statLabel}>Đang Xử Lý</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {events.filter((e) => e.severity === "Emergency").length}
            </Text>
            <Text style={styles.statLabel}>Khẩn Cấp</Text>
          </View>
        </View>

        <View style={styles.eventsContainer}>
          {events.length === 0 ? (
            <EmptyState message="Không có sự kiện y tế nào" />
          ) : (
            events.map((event, index) => (
              <MedicalEventCard
                key={event._id || index}
                event={event}
                onPress={handleViewEvent}
              />
            ))
          )}
        </View>
      </ScrollView>

      <ModalForm
        visible={modalVisible}
        title="Tạo Sự Kiện Y Tế Mới"
        onClose={() => setModalVisible(false)}
        onSave={handleSaveEvent}
        saveButtonText="Tạo Sự Kiện"
        disabled={
          !formData.studentId || !formData.event_type || !formData.description
        }
      >
        <MedicalEventForm
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
    color: "#FF6B6B",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: "#FF6B6B",
    textAlign: "center",
  },
  eventsContainer: {
    padding: 20,
    gap: 15,
  },
});

export default MedicalEventsScreen;
