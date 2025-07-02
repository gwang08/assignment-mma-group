import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  Dimensions,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { parentAPI } from "../../services/parentApi";
import colors from "../../styles/colors";

const { width } = Dimensions.get("window");

const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    linkedStudents: [],
    recentEvents: [],
    pendingRequests: 0,
    upcomingConsultations: 0,
    pendingMedicineRequests: 0,
    pendingCampaignConsents: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load children and recent activities
      const children = await parentAPI.getChildren();
      const medicineRequests = await parentAPI.getMedicineRequests();
      const consultations = await parentAPI.getConsultationSchedules();

      setDashboardData({
        linkedStudents: children || [],
        recentEvents: [], // Will be populated from medical events API
        pendingRequests: 0, // Will be calculated from API data
        upcomingConsultations: consultations?.length || 0,
        pendingMedicineRequests:
          medicineRequests?.filter((req) => req.status === "pending")?.length ||
          0,
        pendingCampaignConsents: 0, // Will be calculated from campaigns API
      });
    } catch (error) {
      console.error("Dashboard data loading error:", error);
      setDashboardData({
        linkedStudents: [],
        recentEvents: [],
        pendingRequests: 0,
        upcomingConsultations: 0,
        pendingMedicineRequests: 0,
        pendingCampaignConsents: 0,
      });
      Alert.alert("Lỗi", "Không thể tải dữ liệu dashboard");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const QuickStatCard = ({ title, count, color, onPress, icon }) => (
    <TouchableOpacity
      style={[styles.statCard, { borderLeftColor: color }]}
      onPress={onPress}
    >
      <View style={styles.statContent}>
        <Text style={styles.statIcon}>{icon}</Text>
        <View style={styles.statTextContainer}>
          <Text style={styles.statCount}>{count}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const StudentCard = ({ student }) => (
    <TouchableOpacity
      style={styles.studentCard}
      onPress={() =>
        navigation.navigate("StudentProfile", { studentId: student.id })
      }
    >
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{student.name}</Text>
        <Text style={styles.studentClass}>Lớp: {student.class}</Text>
      </View>
      <View
        style={[
          styles.healthStatus,
          {
            backgroundColor:
              student.healthStatus === "good" ? colors.success : colors.warning,
          },
        ]}
      >
        <Text style={styles.healthStatusText}>
          {student.healthStatus === "good" ? "Tốt" : "Cần chú ý"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const RecentEventItem = ({ event }) => (
    <TouchableOpacity style={styles.eventItem}>
      <View style={styles.eventInfo}>
        <Text style={styles.eventStudent}>{event.studentName}</Text>
        <Text style={styles.eventDescription}>{event.event}</Text>
        <Text style={styles.eventDate}>
          {new Date(event.date).toLocaleDateString("vi-VN")}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Xin chào,</Text>
        <Text style={styles.userName}>
          {user?.first_name} {user?.last_name}
        </Text>
        <Text style={styles.subtitle}>Tổng quan sức khỏe con em</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <QuickStatCard
          title="Yêu cầu liên kết"
          count={dashboardData.pendingRequests}
          color={colors.primary}
          icon="👥"
          onPress={() => navigation.navigate("LinkRequestStatus")}
        />
        <QuickStatCard
          title="Lịch khám"
          count={dashboardData.upcomingConsultations}
          color={colors.success}
          icon="📅"
          onPress={() => navigation.navigate("Consultations")}
        />
        <QuickStatCard
          title="Đơn thuốc"
          count={dashboardData.pendingMedicineRequests}
          color={colors.warning}
          icon="💊"
          onPress={() => navigation.navigate("MedicineRequests")}
        />
        <QuickStatCard
          title="Chiến dịch"
          count={dashboardData.pendingCampaignConsents}
          color={colors.info}
          icon="🏥"
          onPress={() => navigation.navigate("HealthCampaigns")}
        />
      </View>

      {/* Linked Students */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Con em đã liên kết</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("LinkedStudents")}
          >
            <Text style={styles.seeAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>
        {dashboardData.linkedStudents.map((student) => (
          <StudentCard key={student.id} student={student} />
        ))}
        {dashboardData.linkedStudents.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Chưa có học sinh nào được liên kết
            </Text>
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => navigation.navigate("StudentLinkRequest")}
            >
              <Text style={styles.linkButtonText}>Liên kết học sinh</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Recent Events */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("MedicalEvents")}
          >
            <Text style={styles.seeAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>
        {dashboardData.recentEvents.map((event) => (
          <RecentEventItem key={event.id} event={event} />
        ))}
        {dashboardData.recentEvents.length === 0 && (
          <Text style={styles.emptyText}>Chưa có hoạt động nào</Text>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("CreateMedicineRequest")}
          >
            <Text style={styles.actionIcon}>💊</Text>
            <Text style={styles.actionText}>Yêu cầu thuốc</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("StudentLinkRequest")}
          >
            <Text style={styles.actionIcon}>👥</Text>
            <Text style={styles.actionText}>Liên kết học sinh</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("AppointmentScheduling")}
          >
            <Text style={styles.actionIcon}>📅</Text>
            <Text style={styles.actionText}>Đặt lịch khám</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: colors.primary,
    paddingTop: 60,
  },
  welcomeText: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.9,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.white,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.8,
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 20,
    gap: 10,
  },
  statCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    width: (width - 50) / 2,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  statIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  statTextContainer: {
    flex: 1,
  },
  statCount: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
  },
  statTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  section: {
    margin: 20,
    marginTop: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "600",
  },
  studentCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
  },
  studentClass: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  healthStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  healthStatusText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: "600",
  },
  eventItem: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eventInfo: {
    flex: 1,
  },
  eventStudent: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  eventDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  eventDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  actionButton: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    width: (width - 60) / 3,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
  },
  emptyState: {
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 16,
  },
  linkButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  linkButtonText: {
    color: colors.white,
    fontWeight: "600",
  },
});

export default DashboardScreen;
