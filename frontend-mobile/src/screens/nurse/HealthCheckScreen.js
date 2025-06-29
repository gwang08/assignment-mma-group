import React, {useState, useEffect} from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import nurseAPI from "../../services/nurseApi";
import colors from "../../styles/colors";

// Import components
import ScreenHeader from "./components/ScreenHeader";
import LoadingScreen from "./components/LoadingScreen";
import EmptyState from "./components/EmptyState";
import HealthCheckCampaignCard from "./components/HealthCheckCampaignCard";

const HealthCheckScreen = ({navigation}) => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const response = await nurseAPI.getHealthCheckCampaigns();
      setCampaigns(response);
    } catch (error) {
      console.error("Error loading health check campaigns:", error);
      Alert.alert(
        "Lỗi",
        "Không thể tải danh sách chiến dịch kiểm tra sức khỏe"
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCampaigns();
    setRefreshing(false);
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const handleCreateCampaign = () => {
    Alert.alert(
      "Tạo Chiến Dịch",
      "Chức năng tạo chiến dịch kiểm tra sức khỏe sẽ được phát triển sau.",
      [
        {text: "Hủy", style: "cancel"},
        {
          text: "Tạo Demo",
          onPress: async () => {
            try {
              const campaignData = {
                title: "Kiểm Tra Sức Khỏe Định Kỳ 2024",
                description:
                  "Kiểm tra sức khỏe định kỳ cho học sinh toàn trường",
                date: new Date().toISOString(),
                checkupDetails:
                  "Kiểm tra chiều cao, cân nặng, thị lực, thính lực",
              };

              await nurseAPI.createHealthCheckCampaign(campaignData);
              Alert.alert(
                "Thành công",
                "Đã tạo chiến dịch kiểm tra sức khỏe mới"
              );
              loadCampaigns();
            } catch (error) {
              console.error("Error creating campaign:", error);
              Alert.alert("Lỗi", "Không thể tạo chiến dịch kiểm tra sức khỏe");
            }
          },
        },
      ]
    );
  };

  const handleViewCampaign = (campaign) => {
    Alert.alert(
      "Chi Tiết Chiến Dịch",
      `Tên: ${campaign.title}\nLoại: ${campaign.type}\nNgày: ${new Date(
        campaign.date
      ).toLocaleDateString("vi-VN")}\nMô tả: ${campaign.description}`,
      [
        {text: "Đóng"},
        {text: "Xem Kết Quả", onPress: () => handleViewResults(campaign)},
        {text: "Thêm Kết Quả", onPress: () => handleAddResult(campaign)},
      ]
    );
  };

  const handleViewResults = async (campaign) => {
    try {
      const results = await nurseAPI.getHealthCheckResults(campaign._id);
      Alert.alert(
        "Kết Quả Kiểm Tra",
        `Chiến dịch: ${campaign.title}\nSố học sinh đã kiểm tra: ${
          results.length
        }\nTổng kết: ${results.length > 0 ? "Thành công" : "Chưa có dữ liệu"}`
      );
    } catch (error) {
      console.error("Error loading results:", error);
      Alert.alert("Lỗi", "Không thể tải kết quả kiểm tra sức khỏe");
    }
  };

  const handleAddResult = async (campaign) => {
    try {
      const students = await nurseAPI.getStudents();
      if (students.length === 0) {
        Alert.alert("Lỗi", "Không có học sinh nào để thêm kết quả");
        return;
      }

      const resultData = {
        studentId: students[0]._id,
        height: 150,
        weight: 45,
        bloodPressure: "120/80",
        notes: "Sức khỏe tốt",
      };

      await nurseAPI.createHealthCheckResult(campaign._id, resultData);
      Alert.alert("Thành công", "Đã thêm kết quả kiểm tra sức khỏe");
    } catch (error) {
      console.error("Error adding result:", error);
      Alert.alert("Lỗi", "Không thể thêm kết quả kiểm tra sức khỏe");
    }
  };

  if (loading) {
    return <LoadingScreen message="Đang tải chiến dịch kiểm tra sức khỏe..." />;
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Kiểm Tra Sức Khỏe"
        onBack={() => navigation.goBack()}
        onAdd={handleCreateCampaign}
        backgroundColor="#F39C12"
      />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{campaigns.length}</Text>
            <Text style={styles.statLabel}>Tổng Chiến Dịch</Text>
          </View>
        </View>

        <View style={styles.campaignsContainer}>
          {campaigns.length === 0 ? (
            <EmptyState message="Không có chiến dịch kiểm tra sức khỏe nào" />
          ) : (
            campaigns.map((campaign, index) => (
              <HealthCheckCampaignCard
                key={campaign._id || index}
                campaign={campaign}
                onPress={handleViewCampaign}
              />
            ))
          )}
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
    color: "#F39C12",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: "#F39C12",
    textAlign: "center",
  },
  campaignsContainer: {
    padding: 20,
    gap: 15,
  },
});

export default HealthCheckScreen;
