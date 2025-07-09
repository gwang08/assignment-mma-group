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
import {SafeAreaView} from "react-native-safe-area-context";

// Import components
import ScreenHeader from "./components/ScreenHeader";
import LoadingScreen from "./components/LoadingScreen";
import EmptyState from "./components/EmptyState";
import ModalForm from "./components/ModalForm";
import VaccinationCampaignCard from "./components/VaccinationCampaignCard";
import VaccinationResultForm from "./components/VaccinationResultForm";
import FormInput from "../../components/common/FormInput";

const VaccinationScreen = ({navigation}) => {
  const [campaigns, setCampaigns] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [campaignModalVisible, setCampaignModalVisible] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [formData, setFormData] = useState({
    studentId: "",
    notes: "",
  });
  const [campaignFormData, setCampaignFormData] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    vaccineDetails: {
      brand: "",
      batchNumber: "",
      dosage: "",
    },
  });

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const response = await nurseAPI.getVaccinationCampaigns();
      setCampaigns(response);
    } catch (error) {
      console.error("Error loading vaccination campaigns:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách chiến dịch tiêm chủng");
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const response = await nurseAPI.getStudents();
      setStudents(response);
      if (response.length > 0) {
        setFormData((prev) => ({...prev, studentId: response[0]._id}));
      }
    } catch (error) {
      console.error("Error loading students:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCampaigns();
    setRefreshing(false);
  };

  useEffect(() => {
    loadCampaigns();
    loadStudents();
  }, []);

  const handleCreateCampaign = () => {
    setCampaignFormData({
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      vaccineDetails: {
        brand: "",
        batchNumber: "",
        dosage: "",
      },
    });
    setCampaignModalVisible(true);
  };

  const handleSaveCampaign = async () => {
    if (!campaignFormData.title || !campaignFormData.description) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      const campaignData = {
        title: campaignFormData.title,
        description: campaignFormData.description,
        date: new Date(campaignFormData.date),
        vaccineDetails: {
          brand: campaignFormData.vaccineDetails.brand || "Unknown",
          batchNumber: campaignFormData.vaccineDetails.batchNumber || "Unknown",
          dosage: campaignFormData.vaccineDetails.dosage || "Standard",
        },
      };

      await nurseAPI.createVaccinationCampaign(campaignData);
      Alert.alert("Thành công", "Đã tạo chiến dịch tiêm chủng mới");
      setCampaignModalVisible(false);
      loadCampaigns();
    } catch (error) {
      console.error("Error creating campaign:", error);
      Alert.alert("Lỗi", "Không thể tạo chiến dịch tiêm chủng");
    }
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
      const results = await nurseAPI.getVaccinationResults(campaign._id);
      Alert.alert(
        "Kết Quả Chiến Dịch",
        `Chiến dịch: ${campaign.title}\nSố học sinh đã tiêm: ${
          results.length
        }\nTổng kết: ${results.length > 0 ? "Thành công" : "Chưa có dữ liệu"}`
      );
    } catch (error) {
      console.error("Error loading results:", error);
      Alert.alert("Lỗi", "Không thể tải kết quả chiến dịch");
    }
  };

  const handleAddResult = async (campaign) => {
    setSelectedCampaign(campaign);
    setFormData({
      studentId: students.length > 0 ? students[0]._id : "",
      notes: "",
    });
    setModalVisible(true);
  };

  const handleSaveResult = async () => {
    if (!formData.studentId || !formData.notes) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      const resultData = {
        studentId: formData.studentId,
        notes: formData.notes,
      };

      await nurseAPI.createVaccinationResult(selectedCampaign._id, resultData);
      Alert.alert("Thành công", "Đã thêm kết quả tiêm chủng");
      setModalVisible(false);
      loadCampaigns();
    } catch (error) {
      console.error("Error adding result:", error);
      Alert.alert("Lỗi", "Không thể thêm kết quả tiêm chủng");
    }
  };

  if (loading) {
    return <LoadingScreen message="Đang tải chiến dịch tiêm chủng..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader
        title="Chiến Dịch Tiêm Chủng"
        onBack={() => navigation.goBack()}
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
            <EmptyState message="Không có chiến dịch tiêm chủng nào" />
          ) : (
            campaigns.map((campaign, index) => (
              <VaccinationCampaignCard
                key={campaign._id || index}
                campaign={campaign}
                onPress={handleViewCampaign}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Vaccination Result Modal */}
      <ModalForm
        visible={modalVisible}
        title={selectedCampaign ? "Thêm Kết Quả Tiêm Chủng" : ""}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveResult}
        saveButtonText="Thêm Kết Quả"
        disabled={!formData.studentId || !formData.notes}
      >
        <VaccinationResultForm
          formData={formData}
          setFormData={setFormData}
          students={students}
          selectedCampaign={selectedCampaign}
        />
      </ModalForm>

      {/* Campaign Creation Modal */}
      <ModalForm
        visible={campaignModalVisible}
        title="Tạo Chiến Dịch Tiêm Chủng"
        onClose={() => setCampaignModalVisible(false)}
        onSave={handleSaveCampaign}
        saveButtonText="Tạo Chiến Dịch"
        disabled={!campaignFormData.title || !campaignFormData.description}
      >
        <FormInput
          label="Tên chiến dịch"
          value={campaignFormData.title}
          onChangeText={(text) =>
            setCampaignFormData((prev) => ({...prev, title: text}))
          }
          placeholder="Nhập tên chiến dịch tiêm chủng..."
          required={true}
          error={!campaignFormData.title}
        />

        <FormInput
          label="Mô tả"
          value={campaignFormData.description}
          onChangeText={(text) =>
            setCampaignFormData((prev) => ({...prev, description: text}))
          }
          placeholder="Mô tả chi tiết về chiến dịch..."
          multiline={true}
          numberOfLines={4}
          required={true}
          error={!campaignFormData.description}
        />

        <FormInput
          label="Ngày thực hiện"
          value={campaignFormData.date}
          onChangeText={(text) =>
            setCampaignFormData((prev) => ({...prev, date: text}))
          }
          placeholder="YYYY-MM-DD"
        />

        <FormInput
          label="Tên vaccine"
          value={campaignFormData.vaccineDetails.brand}
          onChangeText={(text) =>
            setCampaignFormData((prev) => ({
              ...prev,
              vaccineDetails: {...prev.vaccineDetails, brand: text},
            }))
          }
          placeholder="Ví dụ: Pfizer-BioNTech, Moderna..."
        />

        <FormInput
          label="Số lô vaccine"
          value={campaignFormData.vaccineDetails.batchNumber}
          onChangeText={(text) =>
            setCampaignFormData((prev) => ({
              ...prev,
              vaccineDetails: {...prev.vaccineDetails, batchNumber: text},
            }))
          }
          placeholder="Nhập số lô vaccine..."
        />

        <FormInput
          label="Liều lượng vaccine"
          value={campaignFormData.vaccineDetails.dosage}
          onChangeText={(text) =>
            setCampaignFormData((prev) => ({
              ...prev,
              vaccineDetails: {...prev.vaccineDetails, dosage: text},
            }))
          }
          placeholder="Nhập liều lượng vaccine..."
        />
      </ModalForm>
      {/* FAB Create Button */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={handleCreateCampaign}
      >
        <Text style={styles.createButtonText}>+</Text>
      </TouchableOpacity>
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
    color: "#96CEB4",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: "#96CEB4",
    textAlign: "center",
  },
  campaignsContainer: {
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

export default VaccinationScreen;
