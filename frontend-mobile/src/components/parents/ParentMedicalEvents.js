import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../styles/colors";
import { parentsAPI } from "../../services/parentsAPI";

const ParentMedicalEvents = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [medicalEvents, setMedicalEvents] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filterOptions = [
    { key: "all", label: "Tất cả", icon: "list" },
    { key: "open", label: "Đang xử lý", icon: "time" },
    { key: "resolved", label: "Đã giải quyết", icon: "checkmark-circle" },
    { key: "followup_required", label: "Cần theo dõi", icon: "alert-circle" },
    { key: "injury", label: "Chấn thương", icon: "bandage" },
    { key: "illness", label: "Bệnh tật", icon: "thermometer" },
    { key: "allergy", label: "Dị ứng", icon: "warning" },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const studentsResponse = await parentsAPI.getStudents();

      if (studentsResponse.success && studentsResponse.data) {
        const studentData = studentsResponse.data.map((item) => item.student);
        setStudents(studentData);

        // Load medical events for all students
        const allMedicalEvents = [];
        for (const item of studentsResponse.data) {
          try {
            const eventsResponse = await parentsAPI.getStudentMedicalEvents(
              item.student._id
            );
            if (eventsResponse.success && eventsResponse.data) {
              const eventsWithStudent = eventsResponse.data.map((event) => ({
                ...event,
                studentInfo: item.student,
              }));
              allMedicalEvents.push(...eventsWithStudent);
            }
          } catch (error) {
            console.warn(
              `Failed to load medical events for student ${item.student._id}:`,
              error
            );
          }
        }
        setMedicalEvents(
          allMedicalEvents.sort(
            (a, b) => new Date(b.occurred_at) - new Date(a.occurred_at)
          )
        );
      }
    } catch (error) {
      console.error("Error loading medical events:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getEventTypeIcon = (eventType) => {
    const icons = {
      injury: "bandage",
      illness: "thermometer",
      allergy: "warning",
      medication: "medical",
      emergency: "alert-circle",
      checkup: "heart",
      other: "clipboard",
    };
    return icons[eventType?.toLowerCase()] || "clipboard";
  };

  const getEventTypeText = (eventType) => {
    const typeText = {
      injury: "Chấn thương",
      illness: "Bệnh tật",
      allergy: "Dị ứng",
      medication: "Thuốc",
      emergency: "Cấp cứu",
      checkup: "Khám sức khỏe",
      other: "Khác",
    };
    return typeText[eventType?.toLowerCase()] || eventType;
  };

  const getEventSeverityColor = (severity) => {
    const severityColors = {
      low: "#2ecc71", // Green - Safe/Minor
      medium: "#f39c12", // Orange - Caution
      high: "#e74c3c", // Red - Warning
      emergency: "#9b59b6", // Purple - Emergency
    };
    return severityColors[severity?.toLowerCase()] || "#95a5a6"; // Default gray
  };

  const getEventSeverityText = (severity) => {
    const severityTexts = {
      low: "Nhẹ",
      medium: "Trung bình",
      high: "Nặng",
      emergency: "Cấp cứu",
    };
    return severityTexts[severity?.toLowerCase()] || severity;
  };

  const getEventStatusColor = (status) => {
    const statusColors = {
      open: "#f39c12",
      resolved: "#27ae60",
      followup_required: "#e74c3c",
    };
    return statusColors[status?.toLowerCase()] || "#95a5a6";
  };

  const getEventStatusText = (status) => {
    const statusText = {
      open: "Đang xử lý",
      resolved: "Đã giải quyết",
      followup_required: "Cần theo dõi",
    };
    return statusText[status?.toLowerCase()] || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa có thông tin";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Chưa có thông tin";
    const date = new Date(dateString);
    return (
      date.toLocaleDateString("vi-VN") +
      " " +
      date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setIsDetailModalVisible(true);
  };

  const getFilteredEvents = () => {
    if (!medicalEvents || !Array.isArray(medicalEvents)) return [];

    let filteredEvents = medicalEvents;

    if (selectedFilter !== "all") {
      filteredEvents = medicalEvents.filter((event) => {
        if (!event) return false;

        switch (selectedFilter) {
          case "open":
          case "resolved":
          case "followup_required":
            return event.status === selectedFilter;
          case "injury":
          case "illness":
          case "allergy":
          case "medication":
          case "emergency":
          case "checkup":
          case "other":
            return event.event_type === selectedFilter;
          default:
            return true;
        }
      });
    }

    // Sort by occurrence date (newest first)
    return filteredEvents.sort(
      (a, b) => new Date(b.occurred_at) - new Date(a.occurred_at)
    );
  };

  const renderEventItem = ({ item }) => {
    if (!item || !item._id) {
      return null;
    }

    return (
      <View style={styles.eventCard}>
        <TouchableOpacity
          onPress={() => handleViewDetails(item)}
          activeOpacity={0.7}
        >
          <View style={styles.eventHeader}>
            <View style={styles.eventInfo}>
              <View style={styles.eventTitleRow}>
                <Ionicons
                  name={getEventTypeIcon(item.event_type)}
                  size={20}
                  color={getEventSeverityColor(item.severity)}
                  style={styles.eventIcon}
                />
                <Text style={styles.eventType}>
                  {getEventTypeText(item.event_type)}
                </Text>
                <View
                  style={[
                    styles.severityBadge,
                    { backgroundColor: getEventSeverityColor(item.severity) },
                  ]}
                >
                  <Text style={styles.severityText}>
                    {getEventSeverityText(item.severity)}
                  </Text>
                </View>
              </View>

              <Text style={styles.eventStudent}>
                {item.studentInfo
                  ? `${item.studentInfo.first_name} ${item.studentInfo.last_name}`
                  : "Học sinh không xác định"}
              </Text>

              <Text style={styles.eventDescription} numberOfLines={2}>
                {item.description}
              </Text>

              <Text style={styles.eventDate}>
                {formatDateTime(item.occurred_at)}
              </Text>

              {item.symptoms && item.symptoms.length > 0 && (
                <View style={styles.symptomsContainer}>
                  <Text style={styles.symptomsLabel}>Triệu chứng:</Text>
                  <Text style={styles.symptomsText} numberOfLines={1}>
                    {item.symptoms.join(", ")}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.eventBadges}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getEventStatusColor(item.status) },
                ]}
              >
                <Text style={styles.statusText}>
                  {getEventStatusText(item.status)}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const filteredEvents = getFilteredEvents();

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Ionicons name="medical" size={48} color={colors.primary} />
        <Text style={styles.emptyText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Section */}
      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScrollView}
          contentContainerStyle={styles.filterContainer}
        >
          {filterOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.filterButton,
                selectedFilter === option.key && styles.activeFilterButton,
              ]}
              onPress={() => setSelectedFilter(option.key)}
            >
              <Ionicons name={option.icon} size={16} color="white" />
              <Text style={styles.filterButtonText}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredEvents}
        renderItem={renderEventItem}
        keyExtractor={(item) => item?._id || Math.random().toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="medical-outline"
              size={64}
              color={colors.lightGray}
            />
            <Text style={styles.emptyText}>Chưa có sự cố y tế nào</Text>
            <Text style={styles.emptySubtext}>
              Các sự cố y tế sẽ được hiển thị tại đây
            </Text>
          </View>
        }
      />

      {/* Event Detail Modal */}
      <Modal
        visible={isDetailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi tiết sự cố y tế</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsDetailModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedEvent && (
              <ScrollView
                style={styles.modalBody}
                showsVerticalScrollIndicator={true}
              >
                <View style={styles.modalTitleRow}>
                  <Ionicons
                    name={getEventTypeIcon(selectedEvent.event_type)}
                    size={24}
                    color={getEventSeverityColor(selectedEvent.severity)}
                  />
                  <Text style={styles.modalEventTitle}>
                    {getEventTypeText(selectedEvent.event_type)}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Học sinh</Text>
                  <Text style={styles.detailValue}>
                    {selectedEvent.studentInfo
                      ? `${selectedEvent.studentInfo.first_name} ${selectedEvent.studentInfo.last_name}`
                      : "Học sinh không xác định"}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Mô tả</Text>
                  <Text style={styles.detailValue}>
                    {selectedEvent.description || "Không có mô tả"}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Mức độ nghiêm trọng</Text>
                  <View
                    style={[
                      styles.severityBadge,
                      {
                        backgroundColor: getEventSeverityColor(
                          selectedEvent.severity
                        ),
                      },
                    ]}
                  >
                    <Text style={styles.severityText}>
                      {getEventSeverityText(selectedEvent.severity)}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Trạng thái</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: getEventStatusColor(
                          selectedEvent.status
                        ),
                      },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {getEventStatusText(selectedEvent.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Thời gian xảy ra</Text>
                  <Text style={styles.detailValue}>
                    {formatDateTime(selectedEvent.occurred_at)}
                  </Text>
                </View>

                {selectedEvent.symptoms &&
                  selectedEvent.symptoms.length > 0 && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Triệu chứng</Text>
                      <Text style={styles.detailValue}>
                        {selectedEvent.symptoms.join(", ")}
                      </Text>
                    </View>
                  )}

                {selectedEvent.treatment_notes && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Ghi chú điều trị</Text>
                    <Text style={styles.detailValue}>
                      {selectedEvent.treatment_notes}
                    </Text>
                  </View>
                )}

                {selectedEvent.medications_administered &&
                  selectedEvent.medications_administered.length > 0 && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Thuốc đã dùng</Text>
                      {selectedEvent.medications_administered.map(
                        (medication, index) => (
                          <View key={index} style={styles.medicationCard}>
                            <Text style={styles.medicationName}>
                              {medication.name}
                            </Text>
                            <Text style={styles.medicationDetails}>
                              Liều lượng: {medication.dosage}
                            </Text>
                            <Text style={styles.medicationDetails}>
                              Thời gian: {formatDateTime(medication.time)}
                            </Text>
                          </View>
                        )
                      )}
                    </View>
                  )}

                {selectedEvent.parent_notified &&
                  selectedEvent.parent_notified.status && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>
                        Thông báo phụ huynh
                      </Text>
                      <Text style={styles.detailValue}>
                        Đã thông báo -{" "}
                        {formatDateTime(selectedEvent.parent_notified.time)}
                      </Text>
                      {selectedEvent.parent_notified.method && (
                        <Text style={styles.detailValue}>
                          Phương thức: {selectedEvent.parent_notified.method}
                        </Text>
                      )}
                    </View>
                  )}

                {selectedEvent.follow_up_required && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Cần theo dõi</Text>
                    <Text style={styles.detailValue}>Có</Text>
                    {selectedEvent.follow_up_notes && (
                      <Text style={styles.detailValue}>
                        Ghi chú: {selectedEvent.follow_up_notes}
                      </Text>
                    )}
                  </View>
                )}

                {selectedEvent.resolved_at && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Thời gian giải quyết</Text>
                    <Text style={styles.detailValue}>
                      {formatDateTime(selectedEvent.resolved_at)}
                    </Text>
                  </View>
                )}

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Ngày tạo</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(selectedEvent.createdAt)}
                  </Text>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContainer: {
    padding: 20,
  },
  eventCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  eventInfo: {
    flex: 1,
    marginRight: 10,
  },
  eventTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  eventIcon: {
    marginRight: 8,
  },
  eventType: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 8,
  },
  severityText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  eventStudent: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 5,
  },
  eventDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 5,
  },
  eventDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 5,
  },
  symptomsContainer: {
    marginTop: 5,
  },
  symptomsLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 2,
  },
  symptomsText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  eventBadges: {
    alignItems: "flex-end",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textSecondary,
    marginTop: 15,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  filterSection: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  filterScrollView: {
    flexDirection: "row",
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 15,
    marginRight: 10,
    backgroundColor: colors.secondary,
  },
  activeFilterButton: {
    backgroundColor: colors.success,
  },
  filterButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    width: "90%",
    height: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    padding: 20,
  },
  modalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  modalEventTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginLeft: 8,
  },
  detailSection: {
    marginBottom: 15,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.textSecondary,
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 16,
    color: colors.text,
  },
  medicationCard: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  medicationName: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  medicationDetails: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
});

export default ParentMedicalEvents;
