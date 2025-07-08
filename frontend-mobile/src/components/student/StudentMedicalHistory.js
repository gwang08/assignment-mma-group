import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import colors from "../../styles/colors";

const { width: screenWidth } = Dimensions.get("window");

const getEventLabel = (value, mapping) => mapping[value] || value;

const StudentMedicalHistory = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState({});
  const [animatedValues, setAnimatedValues] = useState({});

  const eventTypeMap = {
    accident: "Tai nạn",
    illness: "Bệnh tật",
    injury: "Chấn thương",
    emergency: "Cấp cứu",
    other: "Khác",
  };

  const severityMap = {
    low: "Nhẹ",
    medium: "Trung bình",
    high: "Nặng",
    critical: "Nghiêm trọng",
  };

  const statusMap = {
    open: "Mở",
    in_progress: "Đang xử lý",
    resolved: "Đã giải quyết",
    referred: "Chuyển tuyến",
  };

  const eventTypeIcons = {
    accident: "🚨",
    illness: "🤒",
    injury: "🩹",
    emergency: "🚑",
    other: "📋",
  };

  // Hàm để lấy màu sắc dựa trên mức độ nghiêm trọng
  const getSeverityColor = (severity) => {
    switch (severity) {
      case "low":
        return colors.success;
      case "medium":
        return colors.warning;
      case "high":
        return colors.error;
      case "critical":
        return "#D32F2F";
      default:
        return colors.gray;
    }
  };

  // Hàm để lấy màu sắc dựa trên trạng thái
  const getStatusColor = (status) => {
    switch (status) {
      case "resolved":
        return colors.success;
      case "in_progress":
        return colors.warning;
      case "referred":
        return colors.info;
      case "open":
        return colors.error;
      default:
        return colors.gray;
    }
  };

  // Animation for card expansion
  const toggleCard = (eventId) => {
    const isExpanded = expandedCards[eventId];
    setExpandedCards((prev) => ({
      ...prev,
      [eventId]: !isExpanded,
    }));

    if (!animatedValues[eventId]) {
      setAnimatedValues((prev) => ({
        ...prev,
        [eventId]: new Animated.Value(isExpanded ? 1 : 0),
      }));
    }

    Animated.timing(animatedValues[eventId], {
      toValue: isExpanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/student/medical-events");
        if (res.data.success) {
          const myEvents = res.data.data.filter(
            (e) => e.student_id === user?._id
          );
          setEvents(myEvents);

          // Initialize animated values for each event
          const initialAnimatedValues = {};
          myEvents.forEach((event) => {
            initialAnimatedValues[event._id] = new Animated.Value(0);
          });
          setAnimatedValues(initialAnimatedValues);
        }
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải lịch sử y tế...</Text>
        </View>
      </View>
    );
  }

  if (events.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconContainer}>
            <Text style={styles.emptyIcon}>🎉</Text>
          </View>
          <Text style={styles.emptyTitle}>Bạn có sức khỏe tốt!</Text>
          <Text style={styles.emptyDescription}>
            Hiện chưa có sự kiện y tế nào được ghi nhận.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Enhanced Header */}
      <View style={styles.header}>
        <View style={styles.headerIconContainer}>
          <Text style={styles.headerIcon}>📋</Text>
        </View>
        <Text style={styles.title}>Lịch sử y tế của tôi</Text>
        <Text style={styles.subtitle}>Theo dõi và quản lý sức khỏe</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{events.length}</Text>
            <Text style={styles.statLabel}>Sự kiện</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {events.filter((e) => e.status === "resolved").length}
            </Text>
            <Text style={styles.statLabel}>Đã giải quyết</Text>
          </View>
        </View>
      </View>

      {events.map((event, idx) => (
        <View key={event._id || idx} style={styles.eventCard}>
          {/* Card Header - Always Visible */}
          <TouchableOpacity
            style={styles.cardHeader}
            onPress={() => toggleCard(event._id)}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeaderLeft}>
              <View
                style={[
                  styles.eventTypeIcon,
                  { backgroundColor: getSeverityColor(event.severity) + "20" },
                ]}
              >
                <Text style={styles.eventTypeIconText}>
                  {eventTypeIcons[event.event_type] || "📋"}
                </Text>
              </View>
              <View style={styles.cardHeaderInfo}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {event.title}
                </Text>
                <Text style={styles.cardDate}>
                  {new Date(event.createdAt).toLocaleDateString("vi-VN")}
                </Text>
              </View>
            </View>

            <View style={styles.cardHeaderRight}>
              <View
                style={[
                  styles.severityBadge,
                  { backgroundColor: getSeverityColor(event.severity) },
                ]}
              >
                <Text style={styles.severityBadgeText}>
                  {getEventLabel(event.severity, severityMap)}
                </Text>
              </View>
              <Text
                style={[
                  styles.expandIcon,
                  {
                    transform: [
                      { rotate: expandedCards[event._id] ? "180deg" : "0deg" },
                    ],
                  },
                ]}
              >
                ▼
              </Text>
            </View>
          </TouchableOpacity>

          {/* Expandable Content */}
          {animatedValues[event._id] && (
            <Animated.View
              style={[
                styles.cardContent,
                {
                  maxHeight: animatedValues[event._id].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1000],
                  }),
                  opacity: animatedValues[event._id],
                },
              ]}
            >
              <View style={styles.contentInner}>
                {/* Description */}
                <View style={styles.descriptionSection}>
                  <Text style={styles.sectionTitle}>📄 Mô tả chi tiết</Text>
                  <Text style={styles.descriptionText}>
                    {event.description}
                  </Text>
                </View>

                {/* Key Information Grid */}
                <View style={styles.infoGrid}>
                  <View style={styles.infoCard}>
                    <Text style={styles.infoCardLabel}>📌 Loại sự kiện</Text>
                    <Text style={styles.infoCardValue}>
                      {getEventLabel(event.event_type, eventTypeMap)}
                    </Text>
                  </View>

                  <View style={styles.infoCard}>
                    <Text style={styles.infoCardLabel}>📈 Trạng thái</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: getStatusColor(event.status) + "20",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(event.status) },
                        ]}
                      >
                        {getEventLabel(event.status, statusMap)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Symptoms */}
                {event.symptoms?.length > 0 && (
                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>🤧 Triệu chứng</Text>
                    <View style={styles.pillContainer}>
                      {event.symptoms.map((symptom, i) => (
                        <View key={i} style={styles.pill}>
                          <Text style={styles.pillText}>{symptom}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Medications */}
                {event.medications_given?.length > 0 && (
                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>💊 Thuốc đã dùng</Text>
                    <View style={styles.pillContainer}>
                      {event.medications_given.map((medication, i) => (
                        <View
                          key={i}
                          style={[styles.pill, styles.medicationPill]}
                        >
                          <Text
                            style={[styles.pillText, styles.medicationPillText]}
                          >
                            {medication}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Treatment */}
                {event.treatment_provided && (
                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>🧑‍⚕️ Điều trị</Text>
                    <View style={styles.treatmentCard}>
                      <Text style={styles.treatmentText}>
                        {event.treatment_provided}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Follow-up */}
                {event.follow_up_required && (
                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>⏰ Cần theo dõi</Text>
                    <View style={styles.followUpCard}>
                      <Text style={styles.followUpDate}>
                        📅{" "}
                        {event.follow_up_date
                          ? new Date(event.follow_up_date).toLocaleDateString(
                              "vi-VN"
                            )
                          : "Chưa có ngày cụ thể"}
                      </Text>
                      {event.follow_up_notes && (
                        <Text style={styles.followUpNotes}>
                          📝 {event.follow_up_notes}
                        </Text>
                      )}
                    </View>
                  </View>
                )}

                {/* Parent Notification */}
                <View style={styles.notificationSection}>
                  <Text style={styles.sectionTitle}>
                    👨‍👩‍👧‍👦 Thông báo phụ huynh
                  </Text>
                  <View style={styles.notificationCard}>
                    <View style={styles.notificationStatus}>
                      <View
                        style={[
                          styles.notificationIndicator,
                          {
                            backgroundColor: event.parent_notified
                              ? colors.success
                              : colors.error,
                          },
                        ]}
                      />
                      <Text style={styles.notificationText}>
                        {event.parent_notified
                          ? "Đã thông báo"
                          : "Chưa thông báo"}
                      </Text>
                    </View>
                    {event.notification_sent_at && (
                      <Text style={styles.notificationTime}>
                        🕒{" "}
                        {new Date(event.notification_sent_at).toLocaleString(
                          "vi-VN"
                        )}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </Animated.View>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 20,
  },
  loadingCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 20,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    maxWidth: 300,
  },
  emptyIconContainer: {
    backgroundColor: colors.primary + "20",
    borderRadius: 50,
    padding: 20,
    marginBottom: 20,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
    textAlign: "center",
  },
  emptyDescription: {
    textAlign: "center",
    color: colors.textSecondary,
    lineHeight: 24,
    fontSize: 16,
  },
  header: {
    backgroundColor: colors.surface,
    margin: 16,
    marginBottom: 12,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  headerIconContainer: {
    backgroundColor: colors.primary + "20",
    borderRadius: 50,
    padding: 16,
    marginBottom: 16,
  },
  headerIcon: {
    fontSize: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: "500",
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: colors.background,
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 12,
  },
  statItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: colors.background,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
  eventCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  eventTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  eventTypeIconText: {
    fontSize: 20,
  },
  cardHeaderInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  cardHeaderRight: {
    alignItems: "flex-end",
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
  },
  severityBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
  },
  expandIcon: {
    fontSize: 16,
    color: colors.textSecondary,
    transform: [{ rotate: "0deg" }],
  },
  cardContent: {
    overflow: "hidden",
  },
  contentInner: {
    padding: 20,
    paddingTop: 0,
  },
  descriptionSection: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  infoGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  infoCard: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  infoCardLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
    textAlign: "center",
  },
  infoCardValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  detailSection: {
    marginBottom: 20,
  },
  pillContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    backgroundColor: colors.primary + "20",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pillText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: "500",
  },
  medicationPill: {
    backgroundColor: colors.success + "20",
  },
  medicationPillText: {
    color: colors.success,
  },
  treatmentCard: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  treatmentText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  followUpCard: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  followUpDate: {
    fontSize: 15,
    color: colors.text,
    fontWeight: "600",
    marginBottom: 8,
  },
  followUpNotes: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    fontStyle: "italic",
  },
  notificationSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 20,
  },
  notificationCard: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 16,
  },
  notificationStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  notificationIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  notificationText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: "600",
  },
  notificationTime: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});

export default StudentMedicalHistory;
