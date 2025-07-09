import React, {useState, useEffect} from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import nurseAPI from "../../services/nurseApi";
import colors from "../../styles/colors";
import {SafeAreaView} from "react-native-safe-area-context";

// Import components
import ScreenHeader from "./components/ScreenHeader";
import LoadingScreen from "./components/LoadingScreen";
import EventDetailModal from "./components/EventDetailModal";
import MedicalEventStats from "./components/MedicalEventStats";
import MedicalEventList from "./components/MedicalEventList";
import MedicalEventForm from "./components/MedicalEventForm";
import MedicationModalForm from "./components/MedicationModalForm";
import SearchAndFilterBar from "./components/SearchAndFilterBar";
import NotifyParentModal from "./components/NotifyParentModal";
// Enums cho loại sự kiện và trạng thái
const EVENT_TYPE = [
  {label: "Tai nạn", value: "Accident"},
  {label: "Sốt", value: "Fever"},
  {label: "Chấn thương", value: "Injury"},
  {label: "Dịch bệnh", value: "Epidemic"},
  {label: "Khác", value: "Other"},
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
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [notifyModalVisible, setNotifyModalVisible] = useState(false);
  const [notifyMethod, setNotifyMethod] = useState("");
  const [notifying, setNotifying] = useState(false);
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
      severity: "",
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

  const handleEditEvent = (event) => {
    setEditFormData({
      studentId: event.student?._id || "",
      event_type: event.event_type || "",
      description: event.description || "",
      status: event.status || "Open",
      symptoms: Array.isArray(event.symptoms)
        ? event.symptoms.join(", ")
        : event.symptoms || "",
      treatment_notes: event.treatment_notes || "",
      follow_up_required: !!event.follow_up_required,
      severity: event.severity || "",
    });
    setSelectedEvent(event);
    setEditModalVisible(true);
    setDetailModalVisible(false);
  };

  const handleUpdateEvent = async () => {
    if (!editFormData.event_type || !editFormData.description) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }
    try {
      const updateData = {
        ...editFormData,
        symptoms: editFormData.symptoms
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s),
      };
      await nurseAPI.updateMedicalEvent(selectedEvent._id, updateData);
      Alert.alert("Thành công", "Đã cập nhật sự kiện y tế");
      setEditModalVisible(false);
      setSelectedEvent(null);
      loadEvents();
    } catch (error) {
      console.error("Error updating event:", error);
      Alert.alert("Lỗi", "Không thể cập nhật sự kiện y tế");
    }
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

  const handleNotifyParent = async () => {
    if (!selectedEvent || !notifyMethod) return;
    setNotifying(true);
    try {
      await nurseAPI.updateParentNotification(selectedEvent._id, {
        method: notifyMethod,
      });
      Alert.alert("Thành công", "Đã gửi thông báo cho phụ huynh");
      setNotifyModalVisible(false);
      setNotifyMethod("");
    } catch (e) {
      Alert.alert("Lỗi", "Không thể gửi thông báo");
    } finally {
      setNotifying(false);
    }
  };

  // Lọc events theo search/filter
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      !searchValue ||
      event.description?.toLowerCase().includes(searchValue.toLowerCase()) ||
      event.event_type?.toLowerCase().includes(searchValue.toLowerCase());
    const matchesFilter = !filterValue || event.event_type === filterValue;
    return matchesSearch && matchesFilter;
  });

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
          <MedicalEventStats events={events} />
          <SearchAndFilterBar
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            filterValue={filterValue}
            onFilterChange={setFilterValue}
            filterOptions={[{label: "Tất cả", value: ""}, ...EVENT_TYPE]}
            filterLabel="Loại sự kiện"
            searchLabel="Tìm theo loại sự kiện:"
          />
          <MedicalEventList
            events={filteredEvents}
            onViewEvent={handleViewEvent}
          />
        </ScrollView>

        {/* Create Event Modal */}
        {modalVisible && (
          <MedicalEventForm
            formData={formData}
            setFormData={setFormData}
            onSave={handleSaveEvent}
            students={students}
            loading={loading}
            isEdit={false}
            onClose={() => setModalVisible(false)}
            visible={modalVisible}
            onCancel={() => setModalVisible(false)}
          />
        )}

        {/* Edit Event Modal */}
        {editModalVisible && editFormData && (
          <MedicalEventForm
            formData={editFormData}
            setFormData={setEditFormData}
            onSave={handleUpdateEvent}
            students={students}
            loading={loading}
            isEdit={true}
            onClose={() => setEditModalVisible(false)}
            visible={editModalVisible}
            onCancel={() => setEditModalVisible(false)}
          />
        )}

        {/* Medication Modal */}
        <MedicationModalForm
          medicationForm={medicationForm}
          setMedicationForm={setMedicationForm}
          onSave={handleSaveMedication}
          visible={medicationModalVisible}
          onClose={() => setMedicationModalVisible(false)}
          onCancel={() => setMedicationModalVisible(false)}
          loading={loading}
        />
        <EventDetailModal
          visible={detailModalVisible}
          onClose={() => setDetailModalVisible(false)}
          data={selectedEvent || {}}
          title="Chi Tiết Sự Kiện"
          actions={[
            {
              text: "Chỉnh sửa",
              onPress: () => handleEditEvent(selectedEvent),
              style: "default",
            },
            {
              text: "SMS - PH",
              onPress: () => setNotifyModalVisible(true),
              style: "default",
            },
          ]}
        />
        <NotifyParentModal
          visible={notifyModalVisible}
          method={notifyMethod}
          setMethod={setNotifyMethod}
          loading={notifying}
          onSend={handleNotifyParent}
          onClose={() => setNotifyModalVisible(false)}
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
