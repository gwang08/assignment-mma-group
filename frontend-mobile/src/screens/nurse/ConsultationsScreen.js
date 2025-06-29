import React, {useState, useEffect} from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
} from "react-native";
import nurseAPI from "../../services/nurseApi";
import colors from "../../styles/colors";

// Import components
import ScreenHeader from "./components/ScreenHeader";
import LoadingScreen from "./components/LoadingScreen";
import EmptyState from "./components/EmptyState";
import ConsultationCard from "./components/ConsultationCard";

const ConsultationsScreen = ({navigation}) => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadConsultations = async () => {
    try {
      setLoading(true);
      const response = await nurseAPI.getConsultations();
      setConsultations(response);
    } catch (error) {
      console.error("Error loading consultations:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách lịch tư vấn");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadConsultations();
    setRefreshing(false);
  };

  useEffect(() => {
    loadConsultations();
  }, []);

  const handleViewConsultation = (consultation) => {
    Alert.alert(
      "Chi Tiết Lịch Tư Vấn",
      `Học sinh: ${consultation.student?.first_name} ${
        consultation.student?.last_name
      }\nNgày: ${new Date(consultation.scheduled_date).toLocaleDateString(
        "vi-VN"
      )}\nThời gian: ${consultation.scheduled_time}\nLý do: ${
        consultation.reason
      }\nTrạng thái: ${consultation.status}`,
      [
        {
          text: "Cập Nhật Trạng Thái",
          onPress: () => handleUpdateStatus(consultation),
        },
        {text: "Đóng"},
      ]
    );
  };

  const handleUpdateStatus = (consultation) => {
    Alert.alert(
      "Cập Nhật Trạng Thái",
      `Chọn trạng thái mới cho lịch tư vấn của ${consultation.student?.first_name} ${consultation.student?.last_name}`,
      [
        {text: "Hủy", style: "cancel"},
        {
          text: "Hoàn Thành",
          onPress: () => {
            Alert.alert(
              "Thông Báo",
              "Chức năng cập nhật trạng thái cần backend API để hoạt động. Hiện tại chỉ có thể xem danh sách."
            );
          },
        },
        {
          text: "Hủy Lịch",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Thông Báo",
              "Chức năng hủy lịch cần backend API để hoạt động. Hiện tại chỉ có thể xem danh sách."
            );
          },
        },
      ]
    );
  };

  if (loading) {
    return <LoadingScreen message="Đang tải lịch tư vấn..." />;
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Tư Vấn Y Tế"
        onBack={() => navigation.goBack()}
        backgroundColor="#DDA0DD"
      />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{consultations.length}</Text>
            <Text style={styles.statLabel}>Tổng Lịch Tư Vấn</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {consultations.filter((c) => c.status === "Scheduled").length}
            </Text>
            <Text style={styles.statLabel}>Đã Lên Lịch</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {consultations.filter((c) => c.status === "Completed").length}
            </Text>
            <Text style={styles.statLabel}>Đã Hoàn Thành</Text>
          </View>
        </View>

        <View style={styles.consultationsContainer}>
          {consultations.length === 0 ? (
            <EmptyState message="Không có lịch tư vấn nào" />
          ) : (
            consultations.map((consultation, index) => (
              <ConsultationCard
                key={consultation._id || index}
                consultation={consultation}
                onPress={handleViewConsultation}
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
    color: "#DDA0DD",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: "#DDA0DD",
    textAlign: "center",
  },
  consultationsContainer: {
    padding: 20,
    gap: 15,
  },
});

export default ConsultationsScreen;
