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
  Modal,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { parentAPI } from "../../services/parentApi";
import colors from "../../styles/colors";

const MedicineRequestsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all"); // all, pending, approved, rejected
  const [selectedStudent, setSelectedStudent] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMedicineRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [searchQuery, selectedFilter, selectedStudent, requests]);

  const loadMedicineRequests = async () => {
    try {
      setLoading(true);
      const requests = await parentAPI.getMedicineRequests();
      setRequests(requests || []);
    } catch (error) {
      console.error("Load medicine requests error:", error);
      setRequests([]);
      Alert.alert("Lỗi", "Không thể tải danh sách yêu cầu thuốc");
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = requests;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (request) =>
          request.medicine_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          request.student_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          request.reason.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (selectedFilter !== "all") {
      filtered = filtered.filter(
        (request) => request.status === selectedFilter
      );
    }

    // Filter by student
    if (selectedStudent !== "all") {
      filtered = filtered.filter(
        (request) => request.student_id.toString() === selectedStudent
      );
    }

    setFilteredRequests(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMedicineRequests();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return colors.warning;
      case "approved":
        return colors.success;
      case "rejected":
        return colors.error;
      case "completed":
        return colors.info;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Chờ duyệt";
      case "approved":
        return "Đã duyệt";
      case "rejected":
        return "Từ chối";
      case "completed":
        return "Hoàn thành";
      default:
        return "Không rõ";
    }
  };

  const getUniqueStudents = () => {
    const students = requests.reduce((acc, request) => {
      if (!acc.find((s) => s.id === request.student_id)) {
        acc.push({
          id: request.student_id,
          name: request.student_name,
        });
      }
      return acc;
    }, []);
    return students;
  };

  const MedicineRequestCard = ({ request }) => (
    <TouchableOpacity
      style={styles.requestCard}
      onPress={() => navigation.navigate("MedicineRequestDetails", { request })}
    >
      <View style={styles.requestHeader}>
        <View style={styles.requestMainInfo}>
          <Text style={styles.medicineName}>{request.medicine_name}</Text>
          <Text style={styles.studentInfo}>
            {request.student_name} - {request.student_class}
          </Text>
          <Text style={styles.requestReason}>{request.reason}</Text>
        </View>
        <View style={styles.requestStatus}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(request.status) },
            ]}
          >
            <Text style={styles.statusText}>
              {getStatusText(request.status)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.requestDetails}>
        <View style={styles.dosageInfo}>
          <Text style={styles.dosageLabel}>Liều dùng:</Text>
          <Text style={styles.dosageText}>
            {request.dosage} - {request.frequency}
          </Text>
        </View>
        <View style={styles.durationInfo}>
          <Text style={styles.durationLabel}>Thời gian:</Text>
          <Text style={styles.durationText}>
            {new Date(request.start_date).toLocaleDateString("vi-VN")} -{" "}
            {new Date(request.end_date).toLocaleDateString("vi-VN")}
          </Text>
        </View>

        {request.status === "approved" && (
          <View style={styles.progressInfo}>
            <Text style={styles.progressLabel}>Tiến độ:</Text>
            <Text style={styles.progressText}>
              {request.administered_doses.length} liều đã cho
            </Text>
          </View>
        )}

        {request.status === "rejected" && request.rejection_reason && (
          <View style={styles.rejectionInfo}>
            <Text style={styles.rejectionLabel}>Lý do từ chối:</Text>
            <Text style={styles.rejectionText}>{request.rejection_reason}</Text>
          </View>
        )}
      </View>

      <View style={styles.requestFooter}>
        <Text style={styles.requestDate}>
          Tạo: {new Date(request.created_date).toLocaleDateString("vi-VN")}
        </Text>
        {request.approved_date && (
          <Text style={styles.approvedDate}>
            Duyệt: {new Date(request.approved_date).toLocaleDateString("vi-VN")}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const FilterModal = () => (
    <Modal
      visible={filterModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setFilterModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Bộ lọc</Text>
            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Trạng thái:</Text>
            {["all", "pending", "approved", "rejected", "completed"].map(
              (status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterOption,
                    selectedFilter === status && styles.selectedFilterOption,
                  ]}
                  onPress={() => setSelectedFilter(status)}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedFilter === status &&
                        styles.selectedFilterOptionText,
                    ]}
                  >
                    {status === "all" ? "Tất cả" : getStatusText(status)}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Học sinh:</Text>
            <TouchableOpacity
              style={[
                styles.filterOption,
                selectedStudent === "all" && styles.selectedFilterOption,
              ]}
              onPress={() => setSelectedStudent("all")}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  selectedStudent === "all" && styles.selectedFilterOptionText,
                ]}
              >
                Tất cả
              </Text>
            </TouchableOpacity>
            {getUniqueStudents().map((student) => (
              <TouchableOpacity
                key={student.id}
                style={[
                  styles.filterOption,
                  selectedStudent === student.id.toString() &&
                    styles.selectedFilterOption,
                ]}
                onPress={() => setSelectedStudent(student.id.toString())}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    selectedStudent === student.id.toString() &&
                      styles.selectedFilterOptionText,
                  ]}
                >
                  {student.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => setFilterModalVisible(false)}
          >
            <Text style={styles.applyButtonText}>Áp dụng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>💊</Text>
      <Text style={styles.emptyTitle}>Chưa có yêu cầu thuốc nào</Text>
      <Text style={styles.emptySubtitle}>
        Tạo yêu cầu thuốc đầu tiên cho con em bạn
      </Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate("CreateMedicineRequest")}
      >
        <Text style={styles.createButtonText}>Tạo yêu cầu thuốc</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Yêu cầu thuốc</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("CreateMedicineRequest")}
        >
          <Text style={styles.addButtonText}>+ Tạo mới</Text>
        </TouchableOpacity>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm thuốc, học sinh, lý do..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Text style={styles.filterButtonText}>🔽</Text>
        </TouchableOpacity>
      </View>

      {/* Requests List */}
      <FlatList
        data={filteredRequests}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <MedicineRequestCard request={item} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={!loading ? <EmptyState /> : null}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <FilterModal />
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
    flexDirection: "row",
    padding: 20,
    backgroundColor: colors.white,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
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
  filterButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  filterButtonText: {
    fontSize: 16,
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
  },
  requestCard: {
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
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  requestMainInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  studentInfo: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  requestReason: {
    fontSize: 14,
    color: colors.text,
    marginTop: 4,
    fontStyle: "italic",
  },
  requestStatus: {
    alignItems: "flex-end",
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
  requestDetails: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    gap: 8,
  },
  dosageInfo: {
    flexDirection: "row",
  },
  dosageLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    width: 80,
  },
  dosageText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  durationInfo: {
    flexDirection: "row",
  },
  durationLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    width: 80,
  },
  durationText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  progressInfo: {
    flexDirection: "row",
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    width: 80,
  },
  progressText: {
    fontSize: 14,
    color: colors.success,
    flex: 1,
    fontWeight: "600",
  },
  rejectionInfo: {
    backgroundColor: colors.error + "10",
    padding: 12,
    borderRadius: 8,
  },
  rejectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.error,
    marginBottom: 4,
  },
  rejectionText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 18,
  },
  requestFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  requestDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  approvedDate: {
    fontSize: 12,
    color: colors.success,
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
  createButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: colors.white,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  closeButton: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
  },
  filterOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: colors.background,
  },
  selectedFilterOption: {
    backgroundColor: colors.primary,
  },
  filterOptionText: {
    fontSize: 14,
    color: colors.text,
  },
  selectedFilterOptionText: {
    color: colors.white,
    fontWeight: "600",
  },
  applyButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  applyButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default MedicineRequestsScreen;
