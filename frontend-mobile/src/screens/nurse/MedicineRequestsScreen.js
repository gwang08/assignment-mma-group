import React, {useState, useEffect} from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import nurseAPI from "../../services/nurseApi";
import colors from "../../styles/colors";
import {SafeAreaView} from "react-native-safe-area-context";

// Import components
import ScreenHeader from "./components/ScreenHeader";
import LoadingScreen from "./components/LoadingScreen";
import EmptyState from "./components/EmptyState";
import SearchAndFilterBar from "./components/SearchAndFilterBar";
import MedicineRequestCard from "./components/MedicineRequestCard";
import MedicineRequestStats from "./components/MedicineRequestStats";
import MedicineRequestList from "./components/MedicineRequestList";
import MedicineRequestDetailModal from "./components/MedicineRequestDetailModal";
import MedicineInventoryModal from "./components/MedicineInventoryModal";

const REQUEST_STATUS = [
  {label: "Tất cả", value: ""},
  {label: "Chờ xử lý", value: "pending"},
  {label: "Đã duyệt", value: "approved"},
  {label: "Đã từ chối", value: "rejected"},
  {label: "Hoàn thành", value: "completed"},
];

const MedicineRequestsScreen = ({navigation}) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState("");
  const [notes, setNotes] = useState("");
  const [updating, setUpdating] = useState(false);
  const [inventoryModalVisible, setInventoryModalVisible] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(false);

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

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // Lọc requests theo search/filter
  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      !searchValue ||
      request.student.first_name
        ?.toLowerCase()
        .includes(searchValue.toLowerCase());
    const matchesFilter = !filterValue || request.status === filterValue;
    return matchesSearch && matchesFilter;
  });

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setStatusUpdate(request.status);
    setNotes(request.notes || "");
    setModalVisible(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedRequest) return;
    setUpdating(true);
    try {
      await nurseAPI.updateMedicineRequestStatus(
        selectedRequest._id,
        statusUpdate,
        notes
      );
      Alert.alert("Cập nhật trạng thái thành công.");
      setModalVisible(false);
      setSelectedRequest(null);
      setNotes("");
      setStatusUpdate("");
      loadRequests();
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái");
    } finally {
      setUpdating(false);
    }
  };

  const handleOpenInventory = async () => {
    setLoadingInventory(true);
    setInventoryModalVisible(true);
    try {
      const data = await nurseAPI.getMedicineInventory();
      setInventory(data);
    } catch (e) {
      setInventory([]);
    } finally {
      setLoadingInventory(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Đang tải yêu cầu thuốc..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScreenHeader
          title="Quản Lý Yêu Cầu Thuốc"
          onBack={() => navigation.goBack()}
          backgroundColor="#4ECDC4"
        />
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <MedicineRequestStats requests={requests} />
          <SearchAndFilterBar
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            filterValue={filterValue}
            onFilterChange={setFilterValue}
            filterOptions={REQUEST_STATUS}
            filterLabel="Trạng thái"
            searchLabel="Tìm theo tên học sinh:"
          />
          <MedicineRequestList
            requests={filteredRequests}
            onViewRequest={handleViewRequest}
          />
        </ScrollView>
        <MedicineRequestDetailModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          selectedRequest={selectedRequest}
          onUpdateStatus={handleUpdateStatus}
          statusUpdate={statusUpdate}
          setStatusUpdate={setStatusUpdate}
          notes={notes}
          setNotes={setNotes}
          updating={updating}
          REQUEST_STATUS={REQUEST_STATUS}
        />
        <MedicineInventoryModal
          visible={inventoryModalVisible}
          onClose={() => setInventoryModalVisible(false)}
          inventory={inventory}
          loadingInventory={loadingInventory}
        />
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleOpenInventory}
        >
          <Text style={styles.createButtonText}>💊</Text>
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
});

export default MedicineRequestsScreen;
