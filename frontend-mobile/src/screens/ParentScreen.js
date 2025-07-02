import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import ParentNavigation from "../components/ParentNavigation";
import { parentAPI } from "../services/parentApi";
import colors from "../styles/colors";

const { width } = Dimensions.get("window");

const ParentScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    linkedStudents: 0,
    pendingMedicineRequests: 0,
    newNotifications: 0,
    upcomingConsultations: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const data = await parentAPI.getDashboardStats();
      setStats({
        linkedStudents: data.linkedStudentsCount || 0,
        pendingMedicineRequests: data.pendingMedicineRequestsCount || 0,
        newNotifications: data.newNotificationsCount || 0,
        upcomingConsultations: data.upcomingConsultationsCount || 0,
      });
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      setError("Không thể tải thống kê");
      // Keep default values if API fails
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    fetchDashboardStats(true);
  };

  const quickActions = [
    {
      id: "medicine",
      title: "Yêu cầu thuốc",
      icon: "💊",
      description: "Tạo yêu cầu cấp thuốc cho con",
      action: () => navigation?.navigate("MedicineRequests"),
      color: colors.success,
    },
    {
      id: "health",
      title: "Xem hồ sơ sức khỏe",
      icon: "🏥",
      description: "Kiểm tra hồ sơ sức khỏe con em",
      action: () => navigation?.navigate("LinkedStudents"),
      color: colors.info,
    },
    {
      id: "consultation",
      title: "Đặt lịch khám",
      icon: "📅",
      description: "Đặt lịch tư vấn sức khỏe",
      action: () => navigation?.navigate("ConsultationSchedules"),
      color: colors.warning,
    },
    {
      id: "campaigns",
      title: "Chiến dịch sức khỏe",
      icon: "🏃‍♂️",
      description: "Tham gia các hoạt động y tế",
      action: () => navigation?.navigate("HealthCampaigns"),
      color: colors.primary,
    },
  ];

  const QuickActionCard = ({ item }) => (
    <TouchableOpacity
      style={[styles.actionCard, { borderLeftColor: item.color }]}
      onPress={item.action}
    >
      <View style={styles.actionIcon}>
        <Text style={styles.actionIconText}>{item.icon}</Text>
      </View>
      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>{item.title}</Text>
        <Text style={styles.actionDescription}>{item.description}</Text>
      </View>
      <Text style={styles.actionArrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ParentNavigation navigation={navigation} activeScreen="Tổng quan" />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>
            Xin chào, {user?.first_name} {user?.last_name}!
          </Text>
          <Text style={styles.welcomeSubtitle}>
            Chào mừng bạn đến với hệ thống quản lý sức khỏe học sinh
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Tổng quan nhanh</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Đang tải thống kê...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={fetchDashboardStats}
              >
                <Text style={styles.retryButtonText}>Thử lại</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.linkedStudents}</Text>
                <Text style={styles.statLabel}>Học sinh đã liên kết</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {stats.pendingMedicineRequests}
                </Text>
                <Text style={styles.statLabel}>Yêu cầu thuốc chờ duyệt</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.newNotifications}</Text>
                <Text style={styles.statLabel}>Thông báo mới</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {stats.upcomingConsultations}
                </Text>
                <Text style={styles.statLabel}>Lịch khám sắp tới</Text>
              </View>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
          {quickActions.map((item) => (
            <QuickActionCard key={item.id} item={item} />
          ))}
        </View>

        {/* Recent Activities */}
        <View style={styles.activitiesSection}>
          <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
          <View style={styles.activityCard}>
            <View style={styles.activityIcon}>
              <Text style={styles.activityIconText}>💊</Text>
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>
                Yêu cầu thuốc đã được duyệt
              </Text>
              <Text style={styles.activityDescription}>
                Thuốc Paracetamol cho Nguyễn Văn A đã được duyệt
              </Text>
              <Text style={styles.activityTime}>2 giờ trước</Text>
            </View>
          </View>

          <View style={styles.activityCard}>
            <View style={styles.activityIcon}>
              <Text style={styles.activityIconText}>🏥</Text>
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Cập nhật hồ sơ sức khỏe</Text>
              <Text style={styles.activityDescription}>
                Hồ sơ sức khỏe của Nguyễn Thị B đã được cập nhật
              </Text>
              <Text style={styles.activityTime}>1 ngày trước</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
    paddingHorizontal: 20,
  },
  welcomeSection: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: colors.primary,
    marginHorizontal: -20,
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: colors.primaryLight,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 16,
  },
  statsSection: {
    marginBottom: 32,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
  },
  errorContainer: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  statCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    width: (width - 52) / 2,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 16,
  },
  actionsSection: {
    marginBottom: 32,
  },
  actionCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  actionIconText: {
    fontSize: 24,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  actionArrow: {
    fontSize: 24,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  activitiesSection: {
    marginBottom: 32,
  },
  activityCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityIconText: {
    fontSize: 20,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default ParentScreen;
