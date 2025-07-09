import React, {useState, useEffect} from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Switch,
} from "react-native";
import nurseAPI from "../../services/nurseApi";
import colors from "../../styles/colors";
import {SafeAreaView} from "react-native-safe-area-context";

// Import components
import ScreenHeader from "./components/ScreenHeader";
import LoadingScreen from "./components/LoadingScreen";
import EmptyState from "./components/EmptyState";
import ModalForm from "./components/ModalForm";
import MedicalEventCard from "./components/MedicalEventCard";
import FormPicker from "../../components/common/FormPicker";
import FormInput from "../../components/common/FormInput";
import EventDetailModal from "./components/EventDetailModal";
// Enums cho loại sự kiện và trạng thái
const EVENT_TYPE = [
  {label: "Tai nạn", value: "Accident"},
  {label: "Sốt", value: "Fever"},
  {label: "Chấn thương", value: "Injury"},
  {label: "Dịch bệnh", value: "Epidemic"},
  {label: "Khác", value: "Other"},
];
const EVENT_STATUS = [
  {label: "Mở", value: "Open"},
  {label: "Đang xử lý", value: "In Progress"},
  {label: "Đã giải quyết", value: "Resolved"},
  {label: "Chuyển viện", value: "Referred to Hospital"},
];
const EVENT_SEVERITY = [
  {label: "Thấp", value: "Low"},
  {label: "Trung bình", value: "Medium"},
  {label: "Cao", value: "High"},
  {label: "Khẩn cấp", value: "Emergency"},
];

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
    status: "Open",
    symptoms: "",
    treatment_notes: "",
    follow_up_required: false,
    severity: "", // Thêm trường severity
  });

  const [medicationModalVisible, setMedicationModalVisible] = useState(false);
  const [medicationForm, setMedicationForm] = useState({
    name: "",
    dosage: "",
    time: new Date(),
  });
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await nurseAPI.getMedicalEvents();
      // Đảm bảo lấy đúng mảng event
      let eventList = [];
      if (Array.isArray(response)) {
        eventList = response;
      } else if (Array.isArray(response.data)) {
        eventList = response.data;
      } else if (response && Array.isArray(response.events)) {
        eventList = response.events;
      }
      console.log("Loaded events:", eventList);
      setEvents(eventList);
    } catch (error) {
      console.error("Error loading events:", error);
      setEvents([]); // Ensure events is always an array
      Alert.alert("Lỗi", "Không thể tải danh sách sự kiện y tế");
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const response = await nurseAPI.getStudents();
      let studentsArr = [];
      if (Array.isArray(response)) {
        studentsArr = response;
      } else if (Array.isArray(response.data)) {
        studentsArr = response.data;
      } else if (response && Array.isArray(response.students)) {
        studentsArr = response.students;
      }
      console.log("Loaded students:", studentsArr);
      setStudents(studentsArr);
      // Nếu chưa có studentId hoặc studentId không nằm trong danh sách, set lại
      if (
        studentsArr.length > 0 &&
        (!formData.studentId ||
          !studentsArr.some((s) => s._id === formData.studentId))
      ) {
        setFormData((prev) => ({...prev, studentId: studentsArr[0]._id}));
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
    if (students.length === 0) {
      Alert.alert("Lỗi", "Chưa có dữ liệu học sinh");
      return;
    }
    setFormData({
      studentId: students[0]._id,
      event_type: "",
      description: "",
      status: "Open",
      symptoms: "",
      treatment_notes: "",
      follow_up_required: false,
      severity: "", // Thêm trường severity
    });
    setModalVisible(true);
  };

  const handleSaveEvent = async () => {
    if (!formData.event_type || !formData.description) {
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
    setSelectedEvent(event);
    setDetailModalVisible(true);
  };

  const handleSaveMedication = async () => {
    if (!medicationForm.name || !medicationForm.dosage) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin thuốc");
      return;
    }
    try {
      await nurseAPI.addMedication(selectedEventId, {
        name: medicationForm.name,
        dosage: medicationForm.dosage,
        time: medicationForm.time.toISOString(),
      });
      Alert.alert("Thành công", "Đã thêm thuốc");
      setMedicationModalVisible(false);
      loadEvents();
    } catch (error) {
      console.error("Error adding medication:", error);
      Alert.alert("Lỗi", "Không thể thêm thuốc");
    }
  };

  if (loading) {
    return <LoadingScreen message="Đang tải sự kiện y tế..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScreenHeader
          title="Quản Lý Sự Kiện Y Tế"
          onBack={() => navigation.goBack()}
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
            !formData.studentId ||
            !formData.event_type ||
            !formData.description ||
            !formData.severity
          }
        >
          <View style={{gap: 16}}>
            <FormPicker
              label="Học sinh"
              value={formData.studentId}
              onValueChange={(value) =>
                setFormData((f) => ({...f, studentId: value}))
              }
              options={
                Array.isArray(students)
                  ? students.map((student) => ({
                      label: `${student.first_name} ${student.last_name} - ${student.class_name}`,
                      value: student._id,
                    }))
                  : []
              }
              placeholder={
                students.length === 0 ? "Đang tải..." : "Chọn học sinh"
              }
              required={true}
              error={!formData.studentId}
            />
            <FormPicker
              label="Loại sự kiện "
              value={formData.event_type}
              onValueChange={(value) =>
                setFormData((f) => ({...f, event_type: value}))
              }
              options={EVENT_TYPE}
              placeholder="Chọn loại sự kiện"
              required={true}
              error={!formData.event_type}
            />
            <FormPicker
              label="Mức độ nghiêm trọng"
              value={formData.severity}
              onValueChange={(value) =>
                setFormData((f) => ({...f, severity: value}))
              }
              options={EVENT_SEVERITY}
              placeholder="Chọn mức độ"
              required={true}
              error={!formData.severity}
            />
            <FormInput
              label="Mô tả chi tiết"
              value={formData.description}
              onChangeText={(text) =>
                setFormData((f) => ({...f, description: text}))
              }
              placeholder="Mô tả chi tiết về sự kiện y tế..."
              multiline={true}
              numberOfLines={3}
              required={true}
              error={!formData.description}
            />
            <FormPicker
              label="Trạng thái"
              value={formData.status}
              onValueChange={(value) =>
                setFormData((f) => ({...f, status: value}))
              }
              options={EVENT_STATUS}
              placeholder="Chọn trạng thái"
            />
            <FormInput
              label="Triệu chứng"
              value={formData.symptoms}
              onChangeText={(text) =>
                setFormData((f) => ({...f, symptoms: text}))
              }
              placeholder="Ví dụ: Sốt, Đau đầu, Buồn nôn (phân cách bằng dấu phẩy)"
            />
            <FormInput
              label="Ghi chú điều trị"
              value={formData.treatment_notes}
              onChangeText={(text) =>
                setFormData((f) => ({...f, treatment_notes: text}))
              }
              placeholder="Ghi chú về điều trị..."
              multiline={true}
              numberOfLines={2}
            />
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Cần theo dõi tiếp</Text>
              <Switch
                value={formData.follow_up_required}
                onValueChange={(value) =>
                  setFormData((f) => ({...f, follow_up_required: value}))
                }
                trackColor={{false: "#767577", true: colors.primary}}
                thumbColor={formData.follow_up_required ? "#fff" : "#f4f3f4"}
              />
            </View>
          </View>
        </ModalForm>

        <ModalForm
          visible={medicationModalVisible}
          title="Thêm Thuốc Cho Sự Kiện"
          onClose={() => setMedicationModalVisible(false)}
          onSave={handleSaveMedication}
          saveButtonText="Lưu Thuốc"
          disabled={!medicationForm.name || !medicationForm.dosage}
        >
          <View style={{gap: 16}}>
            <Text style={{fontWeight: "bold"}}>Tên thuốc *</Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                padding: 10,
              }}
              value={medicationForm.name}
              onChangeText={(text) =>
                setMedicationForm((f) => ({...f, name: text}))
              }
              placeholder="Nhập tên thuốc"
            />
            <Text style={{fontWeight: "bold"}}>Liều lượng *</Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                padding: 10,
              }}
              value={medicationForm.dosage}
              onChangeText={(text) =>
                setMedicationForm((f) => ({...f, dosage: text}))
              }
              placeholder="Nhập liều lượng"
            />
            <Text style={{fontWeight: "bold"}}>Thời gian</Text>
            <View
              style={{
                padding: 10,
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                backgroundColor: "#f5f5f5",
              }}
            >
              <Text>{medicationForm.time.toLocaleString()}</Text>
            </View>
          </View>
        </ModalForm>

        <EventDetailModal
          visible={detailModalVisible}
          onClose={() => setDetailModalVisible(false)}
          data={selectedEvent || {}}
          title="Chi Tiết Sự Kiện"
          actions={[]}
        />

        {/* FAB Create Button */}
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateEvent}
        >
          <Text style={styles.createButtonText}>+</Text>
        </TouchableOpacity>
      </View>
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
  createButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 15,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default MedicalEventsScreen;
