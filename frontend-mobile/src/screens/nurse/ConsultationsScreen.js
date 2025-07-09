import React, {useState, useEffect} from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import nurseAPI from "../../services/nurseApi";
import colors from "../../styles/colors";
import {SafeAreaView} from "react-native-safe-area-context";

// Import components
import ScreenHeader from "./components/ScreenHeader";
import LoadingScreen from "./components/LoadingScreen";

import ConsultationStats from "./components/ConsultationStats";
import ConsultationList from "./components/ConsultationList";
import SearchAndFilterBar from "./components/SearchAndFilterBar";
import Icon from "react-native-vector-icons/MaterialIcons";

import ConsultationCreateForm from "./components/ConsultationCreateForm";
import ConsultationDetailModal from "./components/ConsultationDetailModal";

const ConsultationsScreen = ({navigation}) => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    campaignResult: "",
    student: "",
    attending_parent: "",
    scheduledDate: "",
    duration: "30",
    reason: "",
    notes: "",
  });
  const [creating, setCreating] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [students, setStudents] = useState([]);
  const [parentRelations, setParentRelations] = useState([]);
  const [filteredParents, setFilteredParents] = useState([]);

  const loadConsultations = async () => {
    try {
      setLoading(true);
      const response = await nurseAPI.getConsultations();
      console.log("response.data:", response);
      let arr = [];
      if (Array.isArray(response)) arr = response;
      else if (Array.isArray(response.data)) arr = response.data;
      else if (response && Array.isArray(response.consultations))
        arr = response.consultations;
      setConsultations(arr);
    } catch (error) {
      console.error("Error loading consultations:", error);
      setConsultations([]);
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

  // Fetch campaign, students, parent relations khi mở modal
  useEffect(() => {
    if (modalVisible) {
      nurseAPI
        .getCampaigns()
        .then((res) => {
          console.log("response.data:", JSON.stringify(res, null, 2));
          let arr = Array.isArray(res) ? res : res?.data || [];
          setCampaigns(arr);
        })
        .catch(() => setCampaigns([]));
      nurseAPI
        .getStudents()
        .then((res) => {
          let arr = Array.isArray(res) ? res : res?.data || [];
          setStudents(arr);
        })
        .catch(() => setStudents([]));
      nurseAPI
        .getStudentParentRelations()
        .then((res) => {
          let arr = Array.isArray(res) ? res : res?.data || [];
          setParentRelations(arr);
        })
        .catch(() => setParentRelations([]));
    }
  }, [modalVisible]);

  // Lọc phụ huynh khi chọn học sinh
  useEffect(() => {
    if (!formData.student) {
      setFilteredParents([]);
      return;
    }
    const relations = parentRelations.filter(
      (r) => r.student?._id === formData.student
    );
    setFilteredParents(relations.map((r) => r.parent));
  }, [formData.student, parentRelations]);

  // Lọc consultations theo search/filter
  const filteredConsultations = consultations.filter((c) => {
    const matchesSearch =
      !searchValue ||
      c.student?.first_name
        ?.toLowerCase()
        .includes(searchValue.toLowerCase()) ||
      c.student?.last_name?.toLowerCase().includes(searchValue.toLowerCase()) ||
      c.reason?.toLowerCase().includes(searchValue.toLowerCase());
    const matchesFilter = !filterValue || c.status === filterValue;
    return matchesSearch && matchesFilter;
  });

  const handleCreateConsultation = async () => {
    if (!formData.student || !formData.scheduledDate || !formData.reason) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin bắt buộc");
      return;
    }
    setCreating(true);
    try {
      await nurseAPI.createConsultationSchedule({
        campaignResult: formData.campaignResult,
        student: formData.student,
        attending_parent: formData.attending_parent,
        scheduledDate: formData.scheduledDate,
        duration: formData.duration,
        reason: formData.reason,
        notes: formData.notes,
      });
      Alert.alert("Thành công", "Đã tạo lịch tư vấn mới");
      setModalVisible(false);
      setFormData({
        campaignResult: "",
        student: "",
        attending_parent: "",
        scheduledDate: "",
        duration: "30",
        reason: "",
        notes: "",
      });
      loadConsultations();
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tạo lịch tư vấn");
    }
    setCreating(false);
  };

  const handleViewConsultation = (consultation) => {
    setSelectedConsultation(consultation);
    setDetailModalVisible(true);
  };

  if (loading) {
    return <LoadingScreen message="Đang tải lịch tư vấn..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
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
          <ConsultationStats consultations={consultations} />
          <SearchAndFilterBar
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            filterValue={filterValue}
            onFilterChange={setFilterValue}
            filterOptions={[
              {label: "Tất cả", value: ""},
              {label: "Đã Lên Lịch", value: "Scheduled"},
              {label: "Đã Hoàn Thành", value: "Completed"},
            ]}
            filterLabel="Trạng thái"
            searchLabel="Tìm tên học sinh, lý do:"
          />

          <ConsultationList
            consultations={filteredConsultations}
            onViewConsultation={handleViewConsultation}
          />
        </ScrollView>
        {/* FAB tạo mới lịch tư vấn */}
        <TouchableOpacity
          style={{
            position: "absolute",
            bottom: 24,
            right: 24,
            backgroundColor: colors.primary,
            width: 60,
            height: 60,
            borderRadius: 30,
            justifyContent: "center",
            alignItems: "center",
            elevation: 8,
            shadowColor: "#000",
            shadowOffset: {width: 0, height: 4},
            shadowOpacity: 0.3,
            shadowRadius: 4.65,
          }}
          onPress={() => setModalVisible(true)}
        >
          <Icon name="add" size={32} color="#fff" />
        </TouchableOpacity>
        {/* Modal chi tiết lịch tư vấn */}
        <ConsultationDetailModal
          visible={detailModalVisible}
          consultation={selectedConsultation}
          onClose={() => setDetailModalVisible(false)}
        />
        {/* Modal tạo mới lịch tư vấn */}
        <ConsultationCreateForm
          visible={modalVisible}
          formData={formData}
          setFormData={setFormData}
          onSave={handleCreateConsultation}
          creating={creating}
          onClose={() => {
            setModalVisible(false);
            setFormData({
              campaignResult: "",
              student: "",
              attending_parent: "",
              scheduledDate: "",
              duration: "30",
              reason: "",
              notes: "",
            });
          }}
          campaigns={campaigns}
          students={students}
          filteredParents={filteredParents}
        />
      </View>
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
