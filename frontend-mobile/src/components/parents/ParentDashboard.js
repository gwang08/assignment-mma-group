import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../styles/colors";
import { parentsAPI } from "../../services/parentsAPI";
import { useAuth } from "../../context/AuthContext";

const ParentDashboard = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [students, setStudents] = useState([]);
  const [medicineRequests, setMedicineRequests] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [consultations, setConsultations] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [
        studentsResponse,
        requestsResponse,
        campaignsResponse,
        consultationsResponse,
      ] = await Promise.all([
        parentsAPI.getStudents(),
        parentsAPI.getMedicineRequests(),
        parentsAPI.getCampaigns(),
        parentsAPI.getConsultationSchedules(),
      ]);

      if (studentsResponse.success && studentsResponse.data) {
        const studentData = studentsResponse.data.map((item) => item.student);
        setStudents(studentData);
      }

      if (requestsResponse.success && requestsResponse.data) {
        setMedicineRequests(requestsResponse.data);
      }

      if (campaignsResponse.success && campaignsResponse.data) {
        setCampaigns(campaignsResponse.data);
      }

      if (consultationsResponse.success && consultationsResponse.data) {
        setConsultations(consultationsResponse.data);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "#f39c12",
      approved: "#27ae60",
      rejected: "#e74c3c",
      completed: "#3498db",
      scheduled: "#9b59b6",
      cancelled: "#95a5a6",
    };
    return colors[status] || "#95a5a6";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const DashboardCard = ({
    title,
    icon,
    onPress,
    backgroundColor = colors.primary,
  }) => (
    <TouchableOpacity
      style={[styles.dashboardCard, { backgroundColor }]}
      onPress={onPress}
    >
      <View style={styles.cardContent}>
        <Ionicons name={icon} size={32} color="white" />
        <Text style={styles.cardTitle}>{title}</Text>
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
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>
          Xin chào, {user?.first_name} {user?.last_name}!
        </Text>
        <Text style={styles.welcomeSubtext}>
          Quản lý sức khỏe con em của bạn
        </Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
        <View style={styles.cardGrid}>
          <DashboardCard
            title="Yêu cầu thuốc"
            icon="medical"
            backgroundColor="#e74c3c"
            onPress={() => navigation.navigate("MedicineRequests")}
          />
          <DashboardCard
            title="Hồ sơ sức khỏe"
            icon="heart"
            backgroundColor="#27ae60"
            onPress={() => navigation.navigate("HealthProfiles")}
          />
          <DashboardCard
            title="Chiến dịch"
            icon="shield"
            backgroundColor="#f39c12"
            onPress={() => navigation.navigate("Campaigns")}
          />
          <DashboardCard
            title="Liên kết học sinh"
            icon="link"
            backgroundColor="#9b59b6"
            onPress={() => navigation.navigate("StudentLinkRequests")}
          />
        </View>
      </View>

      {/* Recent Medicine Requests */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Yêu cầu thuốc gần đây</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("MedicineRequests")}
          >
            <Text style={styles.seeAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>
        {medicineRequests.slice(0, 3).map((request, index) => (
          <View key={index} style={styles.listItem}>
            <View style={styles.listItemContent}>
              <Text style={styles.listItemTitle}>
                {request.medicines?.[0]?.name ||
                  request.medicine_name ||
                  "Thuốc"}
              </Text>
              <Text style={styles.listItemSubtext}>
                {formatDate(request.createdAt)}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(request.status) },
              ]}
            >
              <Text style={styles.statusText}>
                {request.status === "pending"
                  ? "Chờ duyệt"
                  : request.status === "approved"
                  ? "Đã duyệt"
                  : request.status === "rejected"
                  ? "Từ chối"
                  : "Hoàn thành"}
              </Text>
            </View>
          </View>
        ))}
        {medicineRequests.length === 0 && (
          <Text style={styles.emptyText}>Chưa có yêu cầu thuốc nào</Text>
        )}
      </View>

      {/* Upcoming Consultations */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Lịch tư vấn sắp tới</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Consultations")}
          >
            <Text style={styles.seeAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>
        {consultations.slice(0, 3).map((consultation, index) => (
          <View key={index} style={styles.listItem}>
            <View style={styles.listItemContent}>
              <Text style={styles.listItemTitle}>{consultation.reason}</Text>
              <Text style={styles.listItemSubtext}>
                {formatDate(
                  consultation.appointment_date || consultation.scheduledDate
                )}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: getStatusColor(
                    consultation.status.toLowerCase()
                  ),
                },
              ]}
            >
              <Text style={styles.statusText}>
                {consultation.status === "scheduled" ||
                consultation.status === "SCHEDULED"
                  ? "Đã lên lịch"
                  : consultation.status === "completed" ||
                    consultation.status === "COMPLETED"
                  ? "Hoàn thành"
                  : consultation.status === "cancelled" ||
                    consultation.status === "CANCELLED"
                  ? "Đã hủy"
                  : "Chờ xác nhận"}
              </Text>
            </View>
          </View>
        ))}
        {consultations.length === 0 && (
          <Text style={styles.emptyText}>Chưa có lịch tư vấn nào</Text>
        )}
      </View>

      {/* Active Campaigns */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Chiến dịch đang diễn ra</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Campaigns")}>
            <Text style={styles.seeAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>
        {campaigns
          .filter((c) => c.status === "active")
          .slice(0, 3)
          .map((campaign, index) => (
            <View key={index} style={styles.listItem}>
              <View style={styles.listItemContent}>
                <Text style={styles.listItemTitle}>{campaign.title}</Text>
                <Text style={styles.listItemSubtext}>
                  {formatDate(campaign.start_date)} -{" "}
                  {formatDate(campaign.end_date)}
                </Text>
              </View>
              <View
                style={[styles.statusBadge, { backgroundColor: "#27ae60" }]}
              >
                <Text style={styles.statusText}>Đang diễn ra</Text>
              </View>
            </View>
          ))}
        {campaigns.filter((c) => c.status === "active").length === 0 && (
          <Text style={styles.emptyText}>
            Không có chiến dịch nào đang diễn ra
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  welcomeSection: {
    backgroundColor: colors.primary,
    padding: 20,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "bold",
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  dashboardCard: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
  },
  cardTitle: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
  },
  listItem: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 5,
  },
  listItemSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    color: colors.textSecondary,
    fontStyle: "italic",
    marginVertical: 20,
  },
});

export default ParentDashboard;
