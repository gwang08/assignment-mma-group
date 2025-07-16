import React, {useState, useEffect} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {useAuth} from "../../context/AuthContext";
import nurseAPI from "../../services/nurseApi";
import colors from "../../styles/colors";
import {useNavigation} from "@react-navigation/native";

// Import components
import DashboardHeader from "../../components/nurse/DashboardHeader";
import DashboardStats from "../../components/nurse/DashboardStats";
import FunctionGrid from "../../components/nurse/FunctionGrid";
import MedicalEventsList from "../../components/nurse/MedicalEventsList";
import MedicineRequestsList from "../../components/nurse/MedicineRequestsList";
import NurseProfile from "../nurse/NurseProfileScreen";
const NurseScreen = () => {
  const {user, signOut} = useAuth();
  const navigation = useNavigation();
  const [dashboardData, setDashboardData] = useState({});
  const [functionCounts, setFunctionCounts] = useState({
    students: 0,
    vaccination: 0,
    healthCheck: 0,
    consultations: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Load dashboard data
  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await nurseAPI.getDashboard();
      setDashboardData(response.data);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      Alert.alert("Lỗi", "Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  // Load function counts
  const loadFunctionCounts = async () => {
    try {
      console.log("Loading function counts...");
      const [
        students,
        vaccinationCampaigns,
        healthCheckCampaigns,
        consultations,
      ] = await Promise.all([
        nurseAPI.getStudents(),
        nurseAPI.getVaccinationCampaigns(),
        nurseAPI.getHealthCheckCampaigns(),
        nurseAPI.getConsultations(),
      ]);

      setFunctionCounts({
        students: students?.length || 0,
        vaccination: vaccinationCampaigns?.length || 0,
        healthCheck: healthCheckCampaigns?.length || 0,
        consultations: consultations?.length || 0,
      });
    } catch (error) {
      console.error("Error loading function counts:", error);
      console.error("Error details:", error.response?.data || error.message);
    }
  };

  // Refresh data
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadDashboard(), loadFunctionCounts()]);
    setRefreshing(false);
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([loadDashboard(), loadFunctionCounts()]);
    };
    loadData();
  }, []);

  // Function cards data
  const functionCards = [
    {
      id: "medical-events",
      title: "Sự Kiện Y Tế",
      description: "Quản lý các sự kiện y tế như tai nạn, sốt, chấn thương",
      icon: "🏥",
      count: dashboardData?.dashboardStats?.activeEvents || 0,
      color: "#FF6B6B",
    },
    {
      id: "medicine-requests",
      title: "Yêu Cầu Thuốc",
      description: "Xử lý yêu cầu thuốc từ học sinh",
      icon: "💊",
      count: dashboardData?.dashboardStats?.pendingRequests || 0,
      color: "#4ECDC4",
    },
    {
      id: "students",
      title: "Quản Lý Học Sinh",
      description: "Xem thông tin sức khỏe và lịch sử y tế học sinh",
      icon: "👨‍🎓",
      count: functionCounts.students,
      color: "#45B7D1",
    },
    {
      id: "vaccination",
      title: "Chiến Dịch Tiêm Chủng",
      description: "Quản lý các chiến dịch tiêm chủng trong trường",
      icon: "💉",
      count: functionCounts.vaccination,
      color: "#96CEB4",
    },
    {
      id: "health-check",
      title: "Kiểm Tra Sức Khỏe",
      description: "Quản lý các đợt kiểm tra sức khỏe định kỳ",
      icon: "🏥",
      count: functionCounts.healthCheck,
      color: "#F39C12",
    },
    {
      id: "consultations",
      title: "Tư Vấn Y Tế",
      description: "Quản lý lịch tư vấn y tế cho học sinh",
      icon: "👩‍⚕️",
      count: functionCounts.consultations,
      color: "#DDA0DD",
    },
  ];

  console.log("Current functionCounts:", functionCounts);
  console.log(
    "Function cards with counts:",
    functionCards.map((card) => ({id: card.id, count: card.count}))
  );

  // Handle function card press
  const handleFunctionPress = async (functionId) => {
    try {
      switch (functionId) {
        case "medical-events":
          navigation.navigate("MedicalEvents");
          break;

        case "medicine-requests":
          navigation.navigate("MedicineRequests");
          break;

        case "students":
          navigation.navigate("Students");
          break;

        case "vaccination":
          navigation.navigate("Vaccination");
          break;

        case "health-check":
          navigation.navigate("HealthCheck");
          break;

        case "consultations":
          navigation.navigate("Consultations");
          break;

        default:
          Alert.alert(
            "Chức Năng",
            `Chức năng ${functionId} sẽ được phát triển trong phiên bản tiếp theo.`,
            [{text: "OK"}]
          );
      }
    } catch (error) {
      console.error(`Error navigating to ${functionId}:`, error);
      Alert.alert(
        "Lỗi",
        `Không thể mở trang ${functionId}. Vui lòng thử lại sau.`,
        [{text: "OK"}]
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Tab bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === "dashboard" && styles.tabBtnActive,
          ]}
          onPress={() => setActiveTab("dashboard")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "dashboard" && styles.tabTextActive,
            ]}
          >
            Tổng quan
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === "profile" && styles.tabBtnActive,
          ]}
          onPress={() => setActiveTab("profile")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "profile" && styles.tabTextActive,
            ]}
          >
            Hồ sơ cá nhân
          </Text>
        </TouchableOpacity>
      </View>
      {/* Tab content */}
      {activeTab === "dashboard" ? (
        <ScrollView
          style={styles.container}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <DashboardHeader user={user} />
          <DashboardStats dashboardData={dashboardData} />
          <FunctionGrid
            functionCards={functionCards}
            onFunctionPress={handleFunctionPress}
          />
          <View style={styles.spacing}>
            <MedicalEventsList events={dashboardData?.recentEvents} />
            <MedicineRequestsList requests={dashboardData?.recentRequests} />
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
            <Text style={styles.logoutText}>Đăng Xuất</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <NurseProfile user={user} />
      )}
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
  spacing: {
    flex: 1,
    gap: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textSecondary,
  },
  logoutButton: {
    backgroundColor: colors.error,
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
  },
  tabBtnActive: {
    borderBottomWidth: 3,
    borderBottomColor: colors.primary,
    backgroundColor: "#f7f7f7",
  },
  tabText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: "bold",
  },
  tabTextActive: {
    color: colors.primary,
  },
});

export default NurseScreen;
