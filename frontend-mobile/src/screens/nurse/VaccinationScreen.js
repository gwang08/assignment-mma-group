import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  Dimensions,
  FlatList,
} from "react-native";
import { Chip } from "@react-native-material/core";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";
import { Picker } from "@react-native-picker/picker";
import nurseAPI from "../../services/nurseApi";
import colors from "../../styles/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "./components/ScreenHeader";
import LoadingScreen from "./components/LoadingScreen";
import EmptyState from "./components/EmptyState";
import ModalForm from "./components/ModalForm";
import VaccinationCampaignCard from "./components/VaccinationCampaignCard";
import VaccinationResultForm from "./components/VaccinationResultForm";
import FormInput from "../../components/common/FormInput";

const { width: screenWidth } = Dimensions.get("window");

const SIDE_EFFECTS_ENUM = [
  { value: "pain", label: "Đau tại chỗ tiêm" },
  { value: "swelling", label: "Sưng tại chỗ tiêm" },
  { value: "fever", label: "Sốt nhẹ" },
  { value: "headache", label: "Đau đầu" },
  { value: "fatigue", label: "Mệt mỏi" },
  { value: "nausea", label: "Buồn nôn" },
  { value: "dizziness", label: "Chóng mặt" },
  { value: "other", label: "Khác" },
];

const ACTION_LABELS = {
  medication: "Dùng thuốc",
  rest: "Nghỉ ngơi",
  hospital_referral: "Chuyển viện",
  parent_contact: "Liên hệ phụ huynh",
  continue_monitoring: "Tiếp tục theo dõi",
  other: "Khác",
};

const VaccinationScreen = ({ navigation }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [students, setStudents] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [campaignModalVisible, setCampaignModalVisible] = useState(false);
  const [classModalVisible, setClassModalVisible] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showConsentDeadlinePicker, setShowConsentDeadlinePicker] =
    useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isEditingCampaign, setIsEditingCampaign] = useState(false);
  const [listModalVisible, setListModalVisible] = useState(false);
  const [recordModalVisible, setRecordModalVisible] = useState(false);
  const [vaccinationList, setVaccinationList] = useState(null);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [followUpModalVisible, setFollowUpModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [followUpData, setFollowUpData] = useState({
    follow_up_date: new Date(),
    status: "normal",
    additional_actions: [],
    follow_up_notes: "",
  });
  

  const handleOpenFollowUpModal = (student, record) => {
  setCurrentStudent(student);
  setVaccinationData({
    _id: record._id || "", // Đảm bảo _id được lấy từ record
    vaccinated_at: new Date(record.vaccination_details?.vaccinated_at || new Date()),
    vaccine_brand: record.vaccination_details?.vaccine_details?.brand || "",
    batch_number: record.vaccination_details?.vaccine_details?.batch_number || "",
    dose_number: record.vaccination_details?.vaccine_details?.dose_number?.toString() || "1",
    administered_by: record.vaccination_details?.administered_by || "",
    side_effects: record.vaccination_details?.side_effects || [],
    follow_up_required: !!record.vaccination_details?.follow_up_required,
    follow_up_date: record.vaccination_details?.follow_up_date
      ? new Date(record.vaccination_details.follow_up_date)
      : null,
    notes: record.vaccination_details?.notes || "",
  });
  setFollowUpData({
    follow_up_date: new Date(),
    status: record.vaccination_details?.status || "normal",
    additional_actions: record.vaccination_details?.additional_actions || [],
    follow_up_notes: record.vaccination_details?.follow_up_notes || "",
  });
  console.log("Vaccination record in handleOpenFollowUpModal:", JSON.stringify({
    recordId: record._id,
    studentId: student._id,
    record
  }, null, 2));
  setFollowUpModalVisible(true);
};

const filteredCampaigns = campaigns.filter((campaign) =>
  campaign.title.toLowerCase().includes(searchQuery.toLowerCase())
);

  const handleFollowUp = async () => {
  if (!currentStudent || !vaccinationData || !selectedCampaignDetails) {
    Alert.alert("Lỗi", "Vui lòng chọn học sinh và chiến dịch");
    return;
  }

  const vaccinationRecord = vaccinationList?.vaccination_results?.find(
    (v) => v.student._id === currentStudent._id
  );

  if (!vaccinationRecord) {
    console.error("No vaccination record found for student:", currentStudent?._id);
    Alert.alert("Lỗi", "Không tìm thấy bản ghi kết quả tiêm chủng cho học sinh này");
    return;
  }

  if (!vaccinationRecord._id) {
    console.error("vaccinationRecord missing _id:", vaccinationRecord);
    Alert.alert("Lỗi", "Bản ghi kết quả tiêm chủng không có ID hợp lệ");
    return;
  }

  const payload = {
    follow_up_date: followUpData.follow_up_date.toISOString(), // Chuyển Date thành chuỗi ISO
    status: followUpData.status,
    additional_actions: followUpData.additional_actions,
    follow_up_notes: followUpData.follow_up_notes,
  };

  

  console.log("Submitting follow-up payload:", JSON.stringify(payload, null, 2));
  console.log("resultId:", vaccinationRecord._id);

  try {
    const response = await nurseAPI.updateVaccinationFollowUp(
      vaccinationRecord._id,
      payload
    );
    console.log("Follow-up update response:", JSON.stringify(response, null, 2));
    Alert.alert("Thành công", "Đã cập nhật thông tin theo dõi");
    setFollowUpModalVisible(false);
    setFollowUpData({
      follow_up_date: new Date(),
      status: "normal",
      additional_actions: [],
      follow_up_notes: "",
    });
    await handleViewCampaign(selectedCampaignDetails, "viewList");
  } catch (error) {
    console.error("Error updating follow-up:", error);
    console.error("Error details:", JSON.stringify(error.response?.data, null, 2));
    Alert.alert(
      "Lỗi",
      error.response?.data?.error || "Không thể cập nhật thông tin theo dõi"
    );
  }
};

  const handleActionToggle = (action) => {
    setFollowUpData((prev) => ({
      ...prev,
      additional_actions: prev.additional_actions.includes(action)
        ? prev.additional_actions.filter((a) => a !== action)
        : [...prev.additional_actions, action],
    }));
  };

  const [showFollowUpDatePicker, setShowFollowUpDatePicker] = useState(false);
  const [vaccinationData, setVaccinationData] = useState({
    vaccinated_at: new Date(),
    vaccine_brand: "",
    batch_number: "",
    dose_number: "1",
    administered_by: "",
    side_effects: [],
    follow_up_required: false,
    follow_up_date: null,
    notes: "",
  });
  const [medicalStaff, setMedicalStaff] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showExpiryDatePicker, setShowExpiryDatePicker] = useState(false);

  const [formData, setFormData] = useState({
    studentId: "",
    notes: "",
  });
  const [campaignFormData, setCampaignFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    consent_deadline: "",
    requires_consent: true,
    target_classes: [],
    instructions: "",
    vaccineDetails: {
      brand: "",
      batchNumber: "",
      dosage: "",
    },
  });

  const [editCampaignModalVisible, setEditCampaignModalVisible] =
    useState(false);
  const [editCampaignFormData, setEditCampaignFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    consent_deadline: "",
    target_classes: [],
    instructions: "",
    vaccineDetails: {
      brand: "",
      batchNumber: "",
      dosage: "",
    },
    status: "",
  });

  const handleEditCampaign = (campaign) => {
    setEditCampaignFormData({
      title: campaign.title || "",
      description: campaign.description || "",
      start_date: campaign.start_date || "",
      end_date: campaign.end_date || "",
      consent_deadline: campaign.consent_deadline || "",
      target_classes: campaign.target_classes || [],
      instructions: campaign.instructions || "",
      vaccineDetails: {
        brand: campaign.vaccineDetails?.brand || "",
        batchNumber: campaign.vaccineDetails?.batchNumber || "",
        dosage: campaign.vaccineDetails?.dosage || "",
      },
      status: campaign.status || "draft",
    });
    setEditCampaignModalVisible(true);
  };

  const handleSaveEditCampaign = async () => {
    setFormSubmitted(true);
    const {
      title,
      description,
      start_date,
      end_date,
      consent_deadline,
      target_classes,
      instructions,
      vaccineDetails,
      status,
    } = editCampaignFormData;

    // Validate các trường
    if (
      !title ||
      title.length < 5 ||
      !description ||
      description.length < 5 ||
      !start_date ||
      !end_date ||
      !consent_deadline ||
      !target_classes ||
      target_classes.length === 0 ||
      !vaccineDetails.brand ||
      !vaccineDetails.batchNumber ||
      !vaccineDetails.dosage ||
      !instructions ||
      !status
    ) {
      Alert.alert(
        "Lỗi",
        "Vui lòng điền đầy đủ các trường bắt buộc. Tên chiến dịch và mô tả phải có ít nhất 5 ký tự."
      );
      return;
    }

    

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    const consentDeadline = new Date(consent_deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(startDate) || isNaN(endDate) || isNaN(consentDeadline)) {
      Alert.alert("Lỗi", "Ngày không hợp lệ");
      return;
    }

    if (endDate <= startDate) {
      Alert.alert("Lỗi", "Ngày kết thúc phải sau ngày bắt đầu");
      return;
    }
    if (startDate <= today && status === "draft") {
      Alert.alert(
        "Lỗi",
        "Ngày bắt đầu phải sau ngày hiện tại cho trạng thái Nháp"
      );
      return;
    }
    if (consentDeadline >= startDate) {
      Alert.alert("Lỗi", "Hạn đồng ý phải trước ngày bắt đầu");
      return;
    }
    if (consentDeadline < today) {
      Alert.alert("Lỗi", "Hạn đồng ý không được trước ngày hiện tại");
      return;
    }

    const payload = {
      title,
      description,
      start_date: startDate,
      end_date: endDate,
      consent_deadline: consentDeadline,
      target_classes,
      instructions,
     vaccine_brand: vaccineDetails.brand,
vaccine_batch_number: vaccineDetails.batchNumber,
vaccine_dosage: vaccineDetails.dosage,
      status,
    };

    try {
      await nurseAPI.updateVaccinationCampaign(
        selectedCampaignDetails._id,
        payload
      );
      Alert.alert("Thành công", "Đã cập nhật chiến dịch tiêm chủng");
      setEditCampaignModalVisible(false);
      setEditCampaignFormData({
        title: "",
        description: "",
        start_date: "",
        end_date: "",
        consent_deadline: "",
        target_classes: [],
        instructions: "",
        vaccineDetails: {
          brand: "",
          batchNumber: "",
          dosage: "",
        },
        status: "",
      });
      loadCampaigns();
    } catch (error) {
      console.error("Error updating campaign:", error);
      Alert.alert("Lỗi", "Không thể cập nhật chiến dịch tiêm chủng");
    }
  };

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const response = await nurseAPI.getVaccinationCampaigns();
      console.log("Vaccination campaigns response:", response);
      const data = Array.isArray(response) ? response : response?.data || [];
      setCampaigns(data);
    } catch (error) {
      console.error("Error loading vaccination campaigns:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách chiến dịch tiêm chủng");
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableClasses = async (silent = false) => {
    try {
      setLoadingClasses(true);
      const response = await nurseAPI.getStudents();
      console.log("Students response:", response);
      const data = Array.isArray(response) ? response : response?.data || [];
      const classNames = Array.from(
        new Set(data.map((student) => student.class_name))
      )
        .filter(Boolean)
        .sort();
      setAvailableClasses(classNames);
      if (!silent && classNames.length > 0) {
        Alert.alert(
          "Thành công",
          `Đã tải ${classNames.length} lớp học từ hệ thống`
        );
      } else if (!silent) {
        Alert.alert(
          "Cảnh báo",
          "Không tìm thấy lớp học, sử dụng danh sách mặc định"
        );
        setAvailableClasses([
          "6A",
          "6B",
          "6C",
          "7A",
          "7B",
          "7C",
          "8A",
          "8B",
          "8C",
          "9A",
          "9B",
          "9C",
          "10A1",
          "10A2",
        ]);
      }
    } catch (error) {
      console.error("Error loading classes:", error);
      setAvailableClasses([
        "6A",
        "6B",
        "6C",
        "7A",
        "7B",
        "7C",
        "8A",
        "8B",
        "8C",
        "9A",
        "9B",
        "9C",
        "10A1",
        "10A2",
      ]);
      if (!silent) {
        Alert.alert(
          "Lỗi",
          "Không thể tải danh sách lớp, sử dụng danh sách mặc định"
        );
      }
    } finally {
      setLoadingClasses(false);
    }
  };

  const loadStudents = async () => {
    try {
      const response = await nurseAPI.getStudents();
      console.log("Students response:", response);
      const data = Array.isArray(response) ? response : response?.data || [];
      setStudents(data);
      if (data.length > 0) {
        setFormData((prev) => ({ ...prev, studentId: data[0]._id }));
      }
    } catch (error) {
      console.error("Error loading students:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadCampaigns(), loadAvailableClasses(true)]);
    setRefreshing(false);
  };

  useEffect(() => {
    loadCampaigns();
    loadStudents();
    loadAvailableClasses(true);
  }, []);

  const handleCreateCampaign = () => {
    setCampaignFormData({
      title: "",
      description: "",
      start_date: "",
      end_date: "",
      consent_deadline: "",
      requires_consent: true,
      target_classes: [],
      instructions: "",
      vaccineDetails: {
        brand: "",
        batchNumber: "",
        dosage: "",
      },
    });
    setCampaignModalVisible(true);
  };

  const handleSaveCampaign = async () => {
    setFormSubmitted(true);
    const {
      title,
      description,
      start_date,
      end_date,
      consent_deadline,
      requires_consent,
      instructions,
      target_classes,
      vaccineDetails,
    } = campaignFormData;

    // Validate các trường
    if (
      !title ||
      title.length < 5 ||
      !description ||
      description.length < 5 ||
      !start_date ||
      !end_date ||
      !consent_deadline ||
      !target_classes ||
      target_classes.length === 0 ||
      !vaccineDetails.brand ||
      !vaccineDetails.batchNumber ||
      !vaccineDetails.dosage ||
      !instructions
    ) {
      Alert.alert(
        "Lỗi",
        "Vui lòng điền đầy đủ các trường bắt buộc. Tên chiến dịch và mô tả phải có ít nhất 5 ký tự."
      );
      return;
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    const consentDeadline = new Date(consent_deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(startDate) || isNaN(endDate) || isNaN(consentDeadline)) {
      Alert.alert("Lỗi", "Ngày không hợp lệ");
      return;
    }

    if (endDate <= startDate) {
      Alert.alert("Lỗi", "Ngày kết thúc phải sau ngày bắt đầu");
      return;
    }
    if (startDate <= today) {
      Alert.alert("Lỗi", "Ngày bắt đầu phải sau ngày hiện tại");
      return;
    }
    if (consentDeadline >= startDate) {
      Alert.alert("Lỗi", "Hạn đồng ý phải trước ngày bắt đầu");
      return;
    }
    if (consentDeadline < today) {
      Alert.alert("Lỗi", "Hạn đồng ý không được trước ngày hiện tại");
      return;
    }

    const payload = {
      title,
      description,
      start_date: startDate,
      end_date: endDate,
      consent_deadline: consentDeadline,
      requires_consent,
      instructions,
      target_classes,
      campaign_type: "vaccination",
      type: "VACCINATION",
      vaccineDetails: {
        brand: vaccineDetails.brand,
        batchNumber: vaccineDetails.batchNumber,
        dosage: vaccineDetails.dosage,
      },
    };

    try {
      await nurseAPI.createVaccinationCampaign(payload);
      Alert.alert("Thành công", "Đã tạo chiến dịch tiêm chủng mới");
      setCampaignModalVisible(false);
      setCampaignFormData({
        title: "",
        description: "",
        start_date: "",
        end_date: "",
        consent_deadline: "",
        requires_consent: true,
        target_classes: [],
        instructions: "",
        vaccineDetails: {
          brand: "",
          batchNumber: "",
          dosage: "",
        },
      });
      loadCampaigns();
    } catch (error) {
      console.error("Error creating campaign:", error);
      Alert.alert("Lỗi", "Không thể tạo chiến dịch tiêm chủng");
    }
  };

  const [viewCampaignModalVisible, setViewCampaignModalVisible] =
    useState(false);
  const [selectedCampaignDetails, setSelectedCampaignDetails] = useState(null);

  const handleViewCampaign = async (campaign, action) => {
  setSelectedCampaignDetails(campaign);
  if (action === "viewList") {
    try {
      console.log("Campaign ID:", campaign._id);
      const [vaccinationResponse, medicalStaffResponse] = await Promise.all([
        nurseAPI.getVaccinationList(campaign._id),
        nurseAPI.getMedicalStaff(),
      ]);
      console.log("Vaccination Response:", JSON.stringify(vaccinationResponse.data, null, 2));
      console.log("Medical Staff Response:", JSON.stringify(medicalStaffResponse.data, null, 2));
      const vaccinationData = vaccinationResponse.data || {
        campaign: campaign,
        eligible_students: [],
        vaccinated_students: [],
        pending_students: [],
        consent_summary: { total: 0, approved: 0, declined: 0, pending: 0 },
        vaccination_results: [],
      };
      console.log("Processed vaccinationList:", JSON.stringify(vaccinationData, null, 2));
      setVaccinationList(vaccinationData);
      setMedicalStaff(medicalStaffResponse.data || []);
      setListModalVisible(true);
    } catch (error) {
      console.error("Error loading vaccination list:", error);
      console.error("Error details:", JSON.stringify(error.response?.data, null, 2));
      Alert.alert("Lỗi", "Không thể tải danh sách tiêm chủng");
    }
  } else {
    setViewCampaignModalVisible(true);
  }
};

  const handleOpenRecordModal = (student) => {
  setCurrentStudent(student);
  const vaccinationRecord = vaccinationList?.vaccination_results?.find(
    (v) => v.student._id === student._id
  );

  if (vaccinationRecord && vaccinationRecord.vaccination_details) {
    setVaccinationData({
      vaccinated_at: new Date(vaccinationRecord.vaccination_details?.vaccinated_at || new Date()),
      vaccine_brand: vaccinationRecord.vaccination_details?.vaccine_details?.brand || "",
      batch_number: vaccinationRecord.vaccination_details?.vaccine_details?.batch_number || "",
      dose_number: vaccinationRecord.vaccination_details?.vaccine_details?.dose_number?.toString() || "1",
      administered_by: vaccinationRecord.vaccination_details?.administered_by || "",
      side_effects: vaccinationRecord.vaccination_details?.side_effects || [],
      follow_up_required: !!vaccinationRecord.vaccination_details?.follow_up_required,
      follow_up_date: vaccinationRecord.vaccination_details?.follow_up_date
        ? new Date(vaccinationRecord.vaccination_details.follow_up_date)
        : null,
      notes: vaccinationRecord.vaccination_details?.notes || "",
    });
  } else {
    setVaccinationData({
      vaccinated_at: new Date(),
      vaccine_brand: selectedCampaignDetails?.vaccineDetails?.brand || "",
      batch_number: selectedCampaignDetails?.vaccineDetails?.batchNumber || "",
      dose_number: "1",
      administered_by:
        medicalStaff.length > 0
          ? `${medicalStaff[0].last_name} ${medicalStaff[0].first_name}`
          : "",
      side_effects: [],
      follow_up_required: false,
      follow_up_date: null,
      notes: "",
    });
  }
  setRecordModalVisible(true);
};

  const handleRecordVaccination = async () => {
  if (!currentStudent || !selectedCampaignDetails) {
    Alert.alert("Lỗi", "Vui lòng chọn học sinh và chiến dịch");
    return;
  }

  if (!vaccinationData.vaccine_brand || !vaccinationData.batch_number || !vaccinationData.administered_by) {
    Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin bắt buộc (Tên vaccine, Số lô, Người tiêm)");
    return;
  }
  if (vaccinationData.follow_up_required && !vaccinationData.follow_up_date) {
    Alert.alert("Lỗi", "Vui lòng chọn ngày hạn sử dụng vaccine khi cần theo dõi sau tiêm");
    return;
  }

  if (moment().isAfter(moment(selectedCampaignDetails.consent_deadline))) {
    Alert.alert(
      "Lỗi",
      "Hạn đồng ý của phụ huynh đã qua, không thể ghi nhận kết quả"
    );
    return;
  }

  const existingRecord = vaccinationList?.vaccination_results?.find(
    (record) => record.student._id === currentStudent._id
  );
  if (existingRecord) {
    Alert.alert(
      "Lỗi",
      "Học sinh này đã có kết quả tiêm chủng trong chiến dịch này"
    );
    return;
  }

  try {
    const recordData = {
      student_id: currentStudent._id,
      vaccinated_at: vaccinationData.vaccinated_at,
      vaccine_details: {
        brand: vaccinationData.vaccine_brand,
        batch_number: vaccinationData.batch_number,
        dose_number: parseInt(vaccinationData.dose_number),
        expiry_date: vaccinationData.follow_up_date || new Date(),
      },
      administered_by: vaccinationData.administered_by,
      side_effects: vaccinationData.side_effects,
      follow_up_required: vaccinationData.follow_up_required,
      follow_up_date: vaccinationData.follow_up_required
        ? vaccinationData.follow_up_date
        : null,
      notes: vaccinationData.notes,
    };

    console.log("Submitting vaccination record:", {
      campaignId: selectedCampaignDetails._id,
      recordData,
    });
    const response = await nurseAPI.recordVaccination(
      selectedCampaignDetails._id,
      recordData
    );
    console.log("Vaccination record response:", JSON.stringify(response.data, null, 2));

    // Cập nhật vaccinationList ngay lập tức
    setVaccinationList((prev) => ({
      ...prev,
      vaccination_results: [
        ...(prev.vaccination_results || []),
        {
          student: currentStudent,
          vaccination_details: {
            vaccinated_at: vaccinationData.vaccinated_at,
            vaccine_details: {
              brand: vaccinationData.vaccine_brand,
              batch_number: vaccinationData.batch_number,
              dose_number: parseInt(vaccinationData.dose_number),
              expiry_date: vaccinationData.follow_up_date || new Date(),
            },
            administered_by: vaccinationData.administered_by,
            side_effects: vaccinationData.side_effects,
            follow_up_required: vaccinationData.follow_up_required,
            follow_up_date: vaccinationData.follow_up_required
              ? vaccinationData.follow_up_date
              : null,
            notes: vaccinationData.notes,
          },
          created_by: response.data.created_by,
          createdAt: response.data.createdAt,
          updatedAt: response.data.updatedAt,
          _id: response.data._id,
          campaign: selectedCampaignDetails._id,
          notes: vaccinationData.notes,
        },
      ],
      pending_students: prev.pending_students?.filter(
        (student) => student._id !== currentStudent._id
      ) || [],
      statistics: {
        ...prev.statistics,
        vaccinated: (prev.statistics?.vaccinated || 0) + 1,
        pending: (prev.statistics?.pending || 0) - 1,
      },
    }));

    Alert.alert("Thành công", "Đã ghi nhận kết quả tiêm chủng");
    setRecordModalVisible(false);
    setVaccinationData({
      vaccinated_at: new Date(),
      vaccine_brand: "",
      batch_number: "",
      dose_number: "1",
      administered_by: "",
      side_effects: [],
      follow_up_required: false,
      follow_up_date: null,
      notes: "",
    });
    setCurrentStudent(null);

    // Tải lại danh sách từ API để đồng bộ (chạy bất đồng bộ)
    setTimeout(async () => {
      try {
        const vaccinationResponse = await nurseAPI.getVaccinationList(selectedCampaignDetails._id);
        console.log("Updated Vaccination List:", JSON.stringify(vaccinationResponse.data, null, 2));
        setVaccinationList(
          vaccinationResponse.data || {
            campaign: selectedCampaignDetails,
            eligible_students: [],
            vaccination_results: [],
            pending_students: [],
            consents: [],
            consent_summary: { total: 0, approved: 0, declined: 0, pending: 0 },
            statistics: { total_eligible: 0, vaccinated: 0, pending: 0 },
          }
        );
      } catch (error) {
        console.error("Error refreshing vaccination list:", error);
      }
    }, 1000);
  } catch (error) {
    console.error("Error recording vaccination:", error);
    console.error("Error details:", error.response?.data);
    Alert.alert(
      "Lỗi",
      error.response?.data?.error || "Không thể ghi nhận kết quả tiêm chủng"
    );
  }
};

  const handleSideEffectToggle = (effectValue) => {
    setVaccinationData((prev) => ({
      ...prev,
      side_effects: prev.side_effects.includes(effectValue)
        ? prev.side_effects.filter((e) => e !== effectValue)
        : [...prev.side_effects, effectValue],
    }));
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
    <Text style={styles.statNumber}>{filteredCampaigns.length}</Text>
    <Text style={styles.statLabel}>Tổng Chiến Dịch</Text>
  </View>
  <View style={styles.searchContainer}>
    <TextInput
      style={styles.searchInput}
      placeholder="Tìm kiếm chiến dịch..."
      value={searchQuery}
      onChangeText={setSearchQuery}
    />
  </View>
</View>
        <View style={styles.campaignsContainer}>
  {filteredCampaigns.length === 0 ? (
    <EmptyState message="Không tìm thấy chiến dịch tiêm chủng" />
  ) : (
    filteredCampaigns.map((campaign, index) => (
      <VaccinationCampaignCard
        key={campaign._id || index}
        campaign={campaign}
        onPress={handleViewCampaign}
      />
    ))
  )}
</View>
      </ScrollView>
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
      <ModalForm
        visible={campaignModalVisible}
        title="Tạo Chiến Dịch Tiêm Chủng"
        onClose={() => {
          console.log("campaignFormData:", campaignFormData);
          setCampaignModalVisible(false);
        }}
        onSave={handleSaveCampaign}
        saveButtonText="Tạo Chiến Dịch"
        disabled={false}
      >
        <FormInput
          label="Tên chiến dịch"
          value={campaignFormData.title}
          onChangeText={(text) =>
            setCampaignFormData((prev) => ({ ...prev, title: text }))
          }
          placeholder="Nhập tên chiến dịch (ít nhất 5 ký tự)..."
          required={true}
          error={
            formSubmitted &&
            (!campaignFormData.title || campaignFormData.title.length < 5)
          }
          errorMessage={
            !campaignFormData.title
              ? "Tên chiến dịch không được để trống"
              : campaignFormData.title.length < 5
              ? "Tên chiến dịch phải có ít nhất 5 ký tự"
              : ""
          }
        />
        <FormInput
          label="Mô tả"
          value={campaignFormData.description}
          onChangeText={(text) =>
            setCampaignFormData((prev) => ({ ...prev, description: text }))
          }
          placeholder="Mô tả chi tiết (ít nhất 5 ký tự)..."
          multiline={true}
          numberOfLines={4}
          required={true}
          error={
            formSubmitted &&
            (!campaignFormData.description ||
              campaignFormData.description.length < 5)
          }
          errorMessage={
            !campaignFormData.description
              ? "Mô tả không được để trống"
              : campaignFormData.description.length < 5
              ? "Mô tả phải có ít nhất 5 ký tự"
              : ""
          }
        />

        <FormInput
          label="Tên vaccine"
          value={campaignFormData.vaccineDetails.brand}
          onChangeText={(text) =>
            setCampaignFormData((prev) => ({
              ...prev,
              vaccineDetails: { ...prev.vaccineDetails, brand: text },
            }))
          }
          placeholder="Ví dụ: Pfizer-BioNTech, Moderna..."
          required={true}
          error={formSubmitted && !campaignFormData.vaccineDetails.brand}
          errorMessage="Tên vaccine không được để trống"
        />

        <FormInput
          label="Số lô vaccine"
          value={campaignFormData.vaccineDetails.batchNumber}
          onChangeText={(text) =>
            setCampaignFormData((prev) => ({
              ...prev,
              vaccineDetails: { ...prev.vaccineDetails, batchNumber: text },
            }))
          }
          placeholder="Nhập số lô vaccine..."
          required={true}
          error={formSubmitted && !campaignFormData.vaccineDetails.batchNumber}
          errorMessage="Số lô vaccine không được để trống"
        />

        <FormInput
          label="Liều lượng vaccine"
          value={campaignFormData.vaccineDetails.dosage}
          onChangeText={(text) =>
            setCampaignFormData((prev) => ({
              ...prev,
              vaccineDetails: { ...prev.vaccineDetails, dosage: text },
            }))
          }
          placeholder="Nhập liều lượng vaccine..."
          required={true}
          error={formSubmitted && !campaignFormData.vaccineDetails.dosage}
          errorMessage="Liều lượng vaccine không được để trống"
        />

        {/* Ngày bắt đầu */}
        <View style={styles.datePickerContainer}>
          <Text style={styles.label}>Ngày bắt đầu *</Text>
          <TouchableOpacity
            style={[
              styles.input,
              formSubmitted &&
                !campaignFormData.start_date &&
                styles.inputError,
            ]}
            onPress={() => setShowStartDatePicker(true)}
          >
            <Text>
              {campaignFormData.start_date
                ? new Date(campaignFormData.start_date).toLocaleDateString(
                    "vi-VN"
                  )
                : "Chọn ngày bắt đầu"}
            </Text>
          </TouchableOpacity>
          {showStartDatePicker && (
            <DateTimePicker
              value={
                campaignFormData.start_date
                  ? new Date(campaignFormData.start_date)
                  : new Date()
              }
              mode="date"
              display="default"
              minimumDate={
                new Date(new Date().setDate(new Date().getDate() + 1))
              }
              onChange={(event, selectedDate) => {
                setShowStartDatePicker(false);
                if (selectedDate) {
                  setCampaignFormData((prev) => ({
                    ...prev,
                    start_date: selectedDate.toISOString().split("T")[0],
                  }));
                }
              }}
            />
          )}
          {formSubmitted && !campaignFormData.start_date && (
            <Text style={styles.errorText}>Vui lòng chọn ngày bắt đầu</Text>
          )}
        </View>

        {/* Ngày kết thúc */}
        <View style={styles.datePickerContainer}>
          <Text style={styles.label}>Ngày kết thúc *</Text>
          <TouchableOpacity
            style={[
              styles.input,
              formSubmitted && !campaignFormData.end_date && styles.inputError,
            ]}
            onPress={() => setShowEndDatePicker(true)}
          >
            <Text>
              {campaignFormData.end_date
                ? new Date(campaignFormData.end_date).toLocaleDateString(
                    "vi-VN"
                  )
                : "Chọn ngày kết thúc"}
            </Text>
          </TouchableOpacity>
          {showEndDatePicker && (
            <DateTimePicker
              value={
                campaignFormData.end_date
                  ? new Date(campaignFormData.end_date)
                  : new Date()
              }
              mode="date"
              display="default"
              minimumDate={
                campaignFormData.start_date
                  ? new Date(campaignFormData.start_date)
                  : new Date()
              }
              onChange={(event, selectedDate) => {
                setShowEndDatePicker(false);
                if (selectedDate) {
                  setCampaignFormData((prev) => ({
                    ...prev,
                    end_date: selectedDate.toISOString().split("T")[0],
                  }));
                }
              }}
            />
          )}
          {formSubmitted && !campaignFormData.end_date && (
            <Text style={styles.errorText}>Vui lòng chọn ngày kết thúc</Text>
          )}
        </View>

        {/* Hạn đồng ý */}
        <View style={styles.datePickerContainer}>
          <Text style={styles.label}>Hạn đồng ý của phụ huynh *</Text>
          <TouchableOpacity
            style={[
              styles.input,
              formSubmitted &&
                !campaignFormData.consent_deadline &&
                styles.inputError,
            ]}
            onPress={() => setShowConsentDeadlinePicker(true)}
          >
            <Text>
              {campaignFormData.consent_deadline
                ? new Date(
                    campaignFormData.consent_deadline
                  ).toLocaleDateString("vi-VN")
                : "Chọn hạn đồng ý"}
            </Text>
          </TouchableOpacity>
          {showConsentDeadlinePicker && (
            <DateTimePicker
              value={
                campaignFormData.consent_deadline
                  ? new Date(campaignFormData.consent_deadline)
                  : new Date()
              }
              mode="date"
              display="default"
              minimumDate={new Date()}
              maximumDate={
                campaignFormData.start_date
                  ? new Date(campaignFormData.start_date)
                  : undefined
              }
              onChange={(event, selectedDate) => {
                setShowConsentDeadlinePicker(false);
                if (selectedDate) {
                  setCampaignFormData((prev) => ({
                    ...prev,
                    consent_deadline: selectedDate.toISOString().split("T")[0],
                  }));
                }
              }}
            />
          )}
          {formSubmitted && !campaignFormData.consent_deadline && (
            <Text style={styles.errorText}>Vui lòng chọn hạn đồng ý</Text>
          )}
        </View>
        <FormInput
          label="Hướng dẫn"
          value={campaignFormData.instructions}
          onChangeText={(text) =>
            setCampaignFormData((prev) => ({ ...prev, instructions: text }))
          }
          placeholder="Hướng dẫn chuẩn bị trước khi tiêm..."
          multiline={true}
          required={true}
          error={formSubmitted && !campaignFormData.instructions}
          errorMessage="Hướng dẫn không được để trống"
        />
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Lớp đối tượng *</Text>
          <TouchableOpacity onPress={() => setClassModalVisible(true)}>
            <TextInput
              style={[
                styles.input,
                formSubmitted &&
                  !campaignFormData.target_classes.length &&
                  styles.inputError,
              ]}
              value={campaignFormData.target_classes.join(", ")}
              placeholder="Chọn lớp đối tượng..."
              editable={false}
            />
          </TouchableOpacity>
          {formSubmitted && !campaignFormData.target_classes.length && (
            <Text style={styles.errorText}>Vui lòng chọn ít nhất một lớp</Text>
          )}
        </View>
      </ModalForm>
      <Modal
        visible={classModalVisible}
        animationType="slide"
        onRequestClose={() => setClassModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chọn lớp đối tượng</Text>
            <TouchableOpacity onPress={() => setClassModalVisible(false)}>
              <Text style={styles.closeButton}>Đóng</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <View style={styles.chipContainer}>
              <Text style={styles.label}>
                Lớp đối tượng * {loadingClasses ? "(Đang tải...)" : ""}
              </Text>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={() => loadAvailableClasses()}
                disabled={loadingClasses}
              >
                <Text style={styles.refreshButtonText}>🔄 Tải lại</Text>
              </TouchableOpacity>
              <View style={styles.chipList}>
                <Chip
                  key="selectAll"
                  label={
                    campaignFormData.target_classes.length ===
                    availableClasses.length
                      ? "Bỏ chọn tất cả lớp"
                      : "Chọn tất cả lớp"
                  }
                  style={
                    campaignFormData.target_classes.length ===
                    availableClasses.length
                      ? styles.selectedChip
                      : styles.chip
                  }
                  onPress={() => {
                    setCampaignFormData((prev) => ({
                      ...prev,
                      target_classes:
                        prev.target_classes.length === availableClasses.length
                          ? [] // Bỏ chọn tất cả
                          : [...availableClasses], // Chọn tất cả
                    }));
                  }}
                />
                {availableClasses.map((className) => (
                  <Chip
                    key={className}
                    label={`Lớp ${className}`}
                    style={
                      (campaignFormData.target_classes || []).includes(
                        className
                      )
                        ? styles.selectedChip
                        : styles.chip
                    }
                    onPress={() => {
                      setCampaignFormData((prev) => {
                        const currentClasses = prev.target_classes || [];
                        const newClasses = currentClasses.includes(className)
                          ? currentClasses.filter((c) => c !== className)
                          : [...currentClasses, className];
                        return { ...prev, target_classes: newClasses };
                      });
                    }}
                  />
                ))}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <ModalForm
        visible={editCampaignModalVisible}
        title="Chỉnh Sửa Chiến Dịch Tiêm Chủng"
        onClose={() => setEditCampaignModalVisible(false)}
        onSave={handleSaveEditCampaign}
        saveButtonText="Lưu Thay Đổi"
        disabled={false}
      >
        <FormInput
          label="Tên chiến dịch"
          value={editCampaignFormData.title}
          onChangeText={(text) =>
            setEditCampaignFormData((prev) => ({ ...prev, title: text }))
          }
          placeholder="Nhập tên chiến dịch (ít nhất 5 ký tự)..."
          required={true}
          error={
            formSubmitted &&
            (!editCampaignFormData.title ||
              editCampaignFormData.title.length < 5)
          }
          errorMessage={
            !editCampaignFormData.title
              ? "Tên chiến dịch không được để trống"
              : editCampaignFormData.title.length < 5
              ? "Tên chiến dịch phải có ít nhất 5 ký tự"
              : ""
          }
        />
        <FormInput
          label="Mô tả"
          value={editCampaignFormData.description}
          onChangeText={(text) =>
            setEditCampaignFormData((prev) => ({ ...prev, description: text }))
          }
          placeholder="Mô tả chi tiết (ít nhất 5 ký tự)..."
          multiline={true}
          numberOfLines={4}
          required={true}
          error={
            formSubmitted &&
            (!editCampaignFormData.description ||
              editCampaignFormData.description.length < 5)
          }
          errorMessage={
            !editCampaignFormData.description
              ? "Mô tả không được để trống"
              : editCampaignFormData.description.length < 5
              ? "Mô tả phải có ít nhất 5 ký tự"
              : ""
          }
        />
        <FormInput
          label="Tên vaccine"
          value={editCampaignFormData.vaccineDetails.brand}
          onChangeText={(text) =>
            setEditCampaignFormData((prev) => ({
              ...prev,
              vaccineDetails: { ...prev.vaccineDetails, brand: text },
            }))
          }
          placeholder="Ví dụ: Pfizer-BioNTech, Moderna..."
          required={true}
          error={formSubmitted && !editCampaignFormData.vaccineDetails.brand}
          errorMessage="Tên vaccine không được để trống"
        />
        <FormInput
          label="Số lô vaccine"
          value={editCampaignFormData.vaccineDetails.batchNumber}
          onChangeText={(text) =>
            setEditCampaignFormData((prev) => ({
              ...prev,
              vaccineDetails: { ...prev.vaccineDetails, batchNumber: text },
            }))
          }
          placeholder="Nhập số lô vaccine..."
          required={true}
          error={
            formSubmitted && !editCampaignFormData.vaccineDetails.batchNumber
          }
          errorMessage="Số lô vaccine không được để trống"
        />
        <FormInput
          label="Liều lượng vaccine"
          value={editCampaignFormData.vaccineDetails.dosage}
          onChangeText={(text) =>
            setEditCampaignFormData((prev) => ({
              ...prev,
              vaccineDetails: { ...prev.vaccineDetails, dosage: text },
            }))
          }
          placeholder="Nhập liều lượng vaccine..."
          required={true}
          error={formSubmitted && !editCampaignFormData.vaccineDetails.dosage}
          errorMessage="Liều lượng vaccine không được để trống"
        />
        <View style={styles.datePickerContainer}>
          <Text style={styles.label}>Ngày bắt đầu *</Text>
          <TouchableOpacity
            style={[
              styles.input,
              formSubmitted &&
                !editCampaignFormData.start_date &&
                styles.inputError,
            ]}
            onPress={() => setShowStartDatePicker(true)}
          >
            <Text>
              {editCampaignFormData.start_date
                ? new Date(editCampaignFormData.start_date).toLocaleDateString(
                    "vi-VN"
                  )
                : "Chọn ngày bắt đầu"}
            </Text>
          </TouchableOpacity>
          {showStartDatePicker && (
            <DateTimePicker
              value={
                editCampaignFormData.start_date
                  ? new Date(editCampaignFormData.start_date)
                  : new Date()
              }
              mode="date"
              display="default"
              minimumDate={
                new Date(new Date().setDate(new Date().getDate() + 1))
              }
              onChange={(event, selectedDate) => {
                setShowStartDatePicker(false);
                if (selectedDate) {
                  setEditCampaignFormData((prev) => ({
                    ...prev,
                    start_date: selectedDate.toISOString().split("T")[0],
                  }));
                }
              }}
            />
          )}
          {formSubmitted && !editCampaignFormData.start_date && (
            <Text style={styles.errorText}>Vui lòng chọn ngày bắt đầu</Text>
          )}
        </View>
        <View style={styles.datePickerContainer}>
          <Text style={styles.label}>Ngày kết thúc *</Text>
          <TouchableOpacity
            style={[
              styles.input,
              formSubmitted &&
                !editCampaignFormData.end_date &&
                styles.inputError,
            ]}
            onPress={() => setShowEndDatePicker(true)}
          >
            <Text>
              {editCampaignFormData.end_date
                ? new Date(editCampaignFormData.end_date).toLocaleDateString(
                    "vi-VN"
                  )
                : "Chọn ngày kết thúc"}
            </Text>
          </TouchableOpacity>
          {showEndDatePicker && (
            <DateTimePicker
              value={
                editCampaignFormData.end_date
                  ? new Date(editCampaignFormData.end_date)
                  : new Date()
              }
              mode="date"
              display="default"
              minimumDate={
                editCampaignFormData.start_date
                  ? new Date(editCampaignFormData.start_date)
                  : new Date()
              }
              onChange={(event, selectedDate) => {
                setShowEndDatePicker(false);
                if (selectedDate) {
                  setEditCampaignFormData((prev) => ({
                    ...prev,
                    end_date: selectedDate.toISOString().split("T")[0],
                  }));
                }
              }}
            />
          )}
          {formSubmitted && !editCampaignFormData.end_date && (
            <Text style={styles.errorText}>Vui lòng chọn ngày kết thúc</Text>
          )}
        </View>
        <View style={styles.datePickerContainer}>
          <Text style={styles.label}>Hạn đồng ý của phụ huynh *</Text>
          <TouchableOpacity
            style={[
              styles.input,
              formSubmitted &&
                !editCampaignFormData.consent_deadline &&
                styles.inputError,
            ]}
            onPress={() => setShowConsentDeadlinePicker(true)}
          >
            <Text>
              {editCampaignFormData.consent_deadline
                ? new Date(
                    editCampaignFormData.consent_deadline
                  ).toLocaleDateString("vi-VN")
                : "Chọn hạn đồng ý"}
            </Text>
          </TouchableOpacity>
          {showConsentDeadlinePicker && (
            <DateTimePicker
              value={
                editCampaignFormData.consent_deadline
                  ? new Date(editCampaignFormData.consent_deadline)
                  : new Date()
              }
              mode="date"
              display="default"
              minimumDate={new Date()}
              maximumDate={
                editCampaignFormData.start_date
                  ? new Date(editCampaignFormData.start_date)
                  : undefined
              }
              onChange={(event, selectedDate) => {
                setShowConsentDeadlinePicker(false);
                if (selectedDate) {
                  setEditCampaignFormData((prev) => ({
                    ...prev,
                    consent_deadline: selectedDate.toISOString().split("T")[0],
                  }));
                }
              }}
            />
          )}
          {formSubmitted && !editCampaignFormData.consent_deadline && (
            <Text style={styles.errorText}>Vui lòng chọn hạn đồng ý</Text>
          )}
        </View>
        <FormInput
          label="Hướng dẫn"
          value={editCampaignFormData.instructions}
          onChangeText={(text) =>
            setEditCampaignFormData((prev) => ({ ...prev, instructions: text }))
          }
          placeholder="Hướng dẫn chuẩn bị trước khi tiêm..."
          multiline={true}
          required={true}
          error={formSubmitted && !editCampaignFormData.instructions}
          errorMessage="Hướng dẫn không được để trống"
        />
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Lớp đối tượng *</Text>
          <TouchableOpacity onPress={() => setClassModalVisible(true)}>
            <TextInput
              style={[
                styles.input,
                formSubmitted &&
                  !editCampaignFormData.target_classes.length &&
                  styles.inputError,
              ]}
              value={editCampaignFormData.target_classes.join(", ")}
              placeholder="Chọn lớp đối tượng..."
              editable={false}
            />
          </TouchableOpacity>
          {formSubmitted && !editCampaignFormData.target_classes.length && (
            <Text style={styles.errorText}>Vui lòng chọn ít nhất một lớp</Text>
          )}
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Trạng thái *</Text>
          <View style={styles.chipList}>
            {["draft", "active", "completed", "cancelled"].map((status) => (
              <Chip
                key={status}
                label={
                  {
                    draft: "Nháp",
                    active: "Đang diễn ra",
                    completed: "Đã hoàn thành",
                    cancelled: "Đã hủy",
                  }[status]
                }
                style={
                  editCampaignFormData.status === status
                    ? styles.selectedChip
                    : styles.chip
                }
                onPress={() => {
                  setEditCampaignFormData((prev) => ({ ...prev, status }));
                }}
              />
            ))}
          </View>
          {formSubmitted && !editCampaignFormData.status && (
            <Text style={styles.errorText}>Vui lòng chọn trạng thái</Text>
          )}
        </View>
      </ModalForm>

      <Modal
        visible={viewCampaignModalVisible}
        animationType="slide"
        onRequestClose={() => setViewCampaignModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chi Tiết Chiến Dịch</Text>
            <View style={styles.headerButtonContainer}>
              <TouchableOpacity
                onPress={() => handleEditCampaign(selectedCampaignDetails)}
              >
                <Text style={styles.editButton}>Chỉnh sửa</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setViewCampaignModalVisible(false)}
              >
                <Text style={styles.closeButton}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView style={styles.modalContent}>
            {selectedCampaignDetails && (
              <View>
                <Text style={styles.label}>Tên chiến dịch</Text>
                <Text style={styles.detailText}>
                  {selectedCampaignDetails.title}
                </Text>

                <Text style={styles.label}>Mô tả</Text>
                <Text style={styles.detailText}>
                  {selectedCampaignDetails.description}
                </Text>

                <Text style={styles.label}>Ngày bắt đầu</Text>
                <Text style={styles.detailText}>
                  {selectedCampaignDetails.start_date
                    ? new Date(
                        selectedCampaignDetails.start_date
                      ).toLocaleDateString("vi-VN")
                    : "Chưa xác định"}
                </Text>

                <Text style={styles.label}>Ngày kết thúc</Text>
                <Text style={styles.detailText}>
                  {selectedCampaignDetails.end_date
                    ? new Date(
                        selectedCampaignDetails.end_date
                      ).toLocaleDateString("vi-VN")
                    : "Chưa xác định"}
                </Text>

                <Text style={styles.label}>Trạng thái</Text>
                <Text style={styles.detailText}>
                  {{
                    draft: "Nháp",
                    active: "Đang diễn ra",
                    completed: "Đã hoàn thành",
                    cancelled: "Đã hủy",
                  }[selectedCampaignDetails.status] || "Không xác định"}
                </Text>

                <Text style={styles.label}>Hạn đồng ý của phụ huynh</Text>
                <Text style={styles.detailText}>
                  {selectedCampaignDetails.consent_deadline
                    ? new Date(
                        selectedCampaignDetails.consent_deadline
                      ).toLocaleDateString("vi-VN")
                    : "Chưa xác định"}
                </Text>

                <Text style={styles.label}>Lớp đối tượng</Text>
                <Text style={styles.detailText}>
                  {(selectedCampaignDetails.target_classes || []).join(", ") ||
                    "Không có lớp nào"}
                </Text>

                <Text style={styles.label}>Hướng dẫn</Text>
                <Text style={styles.detailText}>
                  {selectedCampaignDetails.instructions || "Không có hướng dẫn"}
                </Text>

                <Text style={styles.label}>Tên vaccine</Text>
                <Text style={styles.detailText}>
                  {selectedCampaignDetails.vaccineDetails?.brand ||
                    "Không có thông tin"}
                </Text>

                <Text style={styles.label}>Số lô vaccine</Text>
                <Text style={styles.detailText}>
                  {selectedCampaignDetails.vaccineDetails?.batchNumber ||
                    "Không có thông tin"}
                </Text>

                <Text style={styles.label}>Liều lượng vaccine</Text>
                <Text style={styles.detailText}>
                  {selectedCampaignDetails.vaccineDetails?.dosage ||
                    "Không có thông tin"}
                </Text>
              </View>
            )}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  setViewCampaignModalVisible(false);
                  handleViewResults(selectedCampaignDetails);
                }}
              ></TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  setViewCampaignModalVisible(false);
                  handleAddResult(selectedCampaignDetails);
                }}
              ></TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
      <Modal
        visible={listModalVisible}
        animationType="slide"
        onRequestClose={() => setListModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Danh sách tiêm chủng - {selectedCampaignDetails?.title}
            </Text>
            <TouchableOpacity onPress={() => setListModalVisible(false)}>
              <Text style={styles.closeButton}>Đóng</Text>
            </TouchableOpacity>
          </View>
          {vaccinationList &&
            moment().isAfter(
              moment(selectedCampaignDetails?.consent_deadline)
            ) && (
              <View style={styles.alertContainer}>
                <Text style={styles.alertText}>
                  Hạn đồng ý của phụ huynh đã qua. Không thể ghi nhận thêm.
                </Text>
              </View>
            )}
        <FlatList
  data={vaccinationList?.eligible_students || []}
  keyExtractor={(item) => item._id}
  extraData={vaccinationList}
  key={vaccinationList?.vaccination_results?.length || 0} // Sử dụng vaccination_results.length để ép render lại
  renderItem={({ item }) => {
    const consent = vaccinationList.consents?.find(
      (c) => c.student._id === item._id
    );
    const vaccinationRecord = vaccinationList?.vaccination_results?.find(
      (v) => v.student._id === item._id
    );
    const consentDeadlinePassed = selectedCampaignDetails?.consent_deadline
      ? moment().isAfter(moment(selectedCampaignDetails.consent_deadline))
      : false;
    const hasApprovedConsent = consent && consent.status === "Approved";
    const followUpRequired = vaccinationRecord?.vaccination_details?.follow_up_required;
    const hasFollowUpNotes = vaccinationRecord?.vaccination_details?.follow_up_notes;
    const lastFollowUp = vaccinationRecord?.vaccination_details?.last_follow_up;
    const isFollowUpCompleted = hasFollowUpNotes && lastFollowUp;
    const needsFollowUp = followUpRequired && !isFollowUpCompleted;

    console.log(`Student ${item._id} - Has vaccination record: ${!!vaccinationRecord}`);

    return (
      <View style={styles.studentItem}>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>
            {`${item.first_name} ${item.last_name}`}
          </Text>
          <Text style={styles.studentClass}>Lớp: {item.class_name}</Text>
          <Text style={styles.consentStatus}>
            Đồng ý PH:{" "}
            {consent?.status === "Approved"
              ? "Đã đồng ý"
              : consent?.status === "Declined"
              ? "Từ chối"
              : "Chưa có phản hồi"}
          </Text>
          <Text style={styles.vaccinationStatus}>
            Trạng thái:{" "}
            {vaccinationRecord
              ? needsFollowUp
                ? "Cần theo dõi"
                : "Đã tiêm"
              : "Chưa tiêm"}
          </Text>
          {vaccinationRecord && (
            <View>
              <Text style={styles.vaccinationDetail}>
                Vaccine: {vaccinationRecord.vaccination_details?.vaccine_details?.brand || 
                          selectedCampaignDetails?.vaccineDetails?.brand || 
                          "Không có thông tin"}
              </Text>
              <Text style={styles.vaccinationDetail}>
                Mũi số: {vaccinationRecord.vaccination_details?.vaccine_details?.dose_number || 
                         vaccinationData?.dose_number || 
                         "Không có thông tin"}
              </Text>
            </View>
          )}
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {!vaccinationRecord ? (
            <TouchableOpacity
              style={[
                styles.actionButton,
                (consentDeadlinePassed || !hasApprovedConsent) &&
                  styles.disabledButton,
              ]}
              onPress={() => handleOpenRecordModal(item)}
              disabled={consentDeadlinePassed || !hasApprovedConsent}
            >
              <Text style={styles.actionButtonText}>Ghi nhận tiêm</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                setCurrentStudent(item);
                setVaccinationData({
                  vaccinated_at: new Date(vaccinationRecord.vaccination_details?.vaccinated_at || new Date()),
                  vaccine_brand: vaccinationRecord.vaccination_details?.vaccine_details?.brand || "",
                  batch_number: vaccinationRecord.vaccination_details?.vaccine_details?.batch_number || "",
                  dose_number: vaccinationRecord.vaccination_details?.vaccine_details?.dose_number?.toString() || "1",
                  administered_by: vaccinationRecord.vaccination_details?.administered_by || "",
                  side_effects: vaccinationRecord.vaccination_details?.side_effects || [],
                  follow_up_required: !!vaccinationRecord.vaccination_details?.follow_up_required,
                  follow_up_date: vaccinationRecord.vaccination_details?.follow_up_date
                    ? new Date(vaccinationRecord.vaccination_details.follow_up_date)
                    : null,
                  notes: vaccinationRecord.vaccination_details?.notes || "",
                });
                setRecordModalVisible(true);
              }}
            >
              <Text style={styles.actionButtonText}>Xem kết quả</Text>
            </TouchableOpacity>
          )}
          {needsFollowUp && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleOpenFollowUpModal(item, vaccinationRecord)}
            >
              <Text style={styles.actionButtonText}>Theo dõi</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }}
/>
        </SafeAreaView>
      </Modal>

     <Modal
  visible={recordModalVisible}
  animationType="slide"
  onRequestClose={() => setRecordModalVisible(false)}
>
  <SafeAreaView style={styles.modalContainer}>
    <View style={styles.modalHeader}>
      <Text style={styles.modalTitle}>
        {vaccinationList?.vaccination_results?.find(
          (v) => v.student._id === currentStudent?._id
        )
          ? "Chi tiết kết quả tiêm chủng"
          : "Ghi nhận kết quả tiêm chủng"}
      </Text>
      <TouchableOpacity onPress={() => setRecordModalVisible(false)}>
        <Text style={styles.closeButton}>Hủy</Text>
      </TouchableOpacity>
    </View>
    <ScrollView style={styles.modalContent}>
      <Text style={styles.studentInfo}>
        Học sinh: {currentStudent?.first_name} {currentStudent?.last_name} - Lớp: {currentStudent?.class_name}
      </Text>

      {vaccinationList?.vaccination_results?.find(
        (v) => v.student._id === currentStudent?._id
      ) ? (
        // Chế độ chỉ đọc (Xem kết quả)
        <View>
          <Text style={styles.label}>Thời gian tiêm</Text>
          <Text style={styles.input}>
            {vaccinationData?.vaccinated_at
              ? moment(vaccinationData.vaccinated_at).format("DD/MM/YYYY")
              : "Không có thông tin"}
          </Text>

          <Text style={styles.label}>Người tiêm</Text>
          <Text style={styles.input}>
            {vaccinationData?.administered_by || "Không có thông tin"}
          </Text>

          <Text style={styles.label}>Tên vaccine</Text>
          <Text style={styles.input}>
            {vaccinationData?.vaccine_brand || "Không có thông tin"}
          </Text>

          <Text style={styles.label}>Số lô</Text>
          <Text style={styles.input}>
            {vaccinationData?.batch_number || "Không có thông tin"}
          </Text>

          <Text style={styles.label}>Mũi số</Text>
          <Text style={styles.input}>
            {vaccinationData?.dose_number || "Không có thông tin"}
          </Text>

          <Text style={styles.label}>Hạn sử dụng vaccine</Text>
          <Text style={styles.input}>
            {vaccinationData?.follow_up_date
              ? moment(vaccinationData.follow_up_date).format("DD/MM/YYYY")
              : "Không có thông tin"}
          </Text>

          <Text style={styles.label}>Tác dụng phụ</Text>
          <Text style={styles.input}>
            {vaccinationData?.side_effects?.length > 0
              ? vaccinationData.side_effects
                  .map(
                    (effect) =>
                      SIDE_EFFECTS_ENUM.find((e) => e.value === effect)?.label ||
                      effect
                  )
                  .join(", ")
              : "Không có tác dụng phụ"}
          </Text>

          <Text style={styles.label}>Cần theo dõi sau tiêm</Text>
          <Text style={styles.input}>
            {vaccinationData?.follow_up_required ? "Có" : "Không"}
          </Text>

          <Text style={styles.label}>Ghi chú</Text>
          <Text style={[styles.input, { height: 80, textAlignVertical: "top" }]}>
            {vaccinationData?.notes || "Không có ghi chú"}
          </Text>
        </View>
      ) : (
        // Chế độ nhập liệu (Ghi nhận tiêm)
        <View>
          <Text style={styles.label}>Thời gian tiêm</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            disabled={!!vaccinationList?.vaccination_results?.find(
              (v) => v.student._id === currentStudent?._id
            )}
          >
            <Text style={styles.input}>
              {vaccinationData?.vaccinated_at
                ? moment(vaccinationData.vaccinated_at).format("DD/MM/YYYY")
                : "Chọn ngày"}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={vaccinationData?.vaccinated_at || new Date()}
              mode="date"
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) {
                  setVaccinationData({
                    ...vaccinationData,
                    vaccinated_at: date,
                  });
                }
              }}
            />
          )}

          <Text style={styles.label}>Người tiêm</Text>
          <Picker
            selectedValue={vaccinationData?.administered_by || ""}
            onValueChange={(value) =>
              setVaccinationData({
                ...vaccinationData,
                administered_by: value,
              })
            }
            style={styles.picker}
            enabled={
              !!vaccinationList?.vaccination_results?.find(
                (v) => v.student._id === currentStudent?._id
              ) === false
            }
          >
            <Picker.Item label="Chọn người tiêm" value="" />
            {medicalStaff.map((staff) => (
              <Picker.Item
                key={staff._id}
                label={`${staff.last_name} ${staff.first_name}`}
                value={`${staff.last_name} ${staff.first_name}`}
              />
            ))}
          </Picker>

          <Text style={styles.label}>Tên vaccine</Text>
          <TextInput
            style={styles.input}
            value={vaccinationData?.vaccine_brand || ""}
            onChangeText={(text) =>
              setVaccinationData({ ...vaccinationData, vaccine_brand: text })
            }
            placeholder="VD: Gardasil 9"
            editable={
              !!vaccinationList?.vaccination_results?.find(
                (v) => v.student._id === currentStudent?._id
              ) === false
            }
          />

          <Text style={styles.label}>Số lô</Text>
          <TextInput
            style={styles.input}
            value={vaccinationData?.batch_number || ""}
            onChangeText={(text) =>
              setVaccinationData({ ...vaccinationData, batch_number: text })
            }
            placeholder="VD: LOT001"
            editable={
              !!vaccinationList?.vaccination_results?.find(
                (v) => v.student._id === currentStudent?._id
              ) === false
            }
          />

          <Text style={styles.label}>Mũi số</Text>
          <Picker
            selectedValue={vaccinationData?.dose_number || "1"}
            onValueChange={(value) =>
              setVaccinationData({ ...vaccinationData, dose_number: value })
            }
            style={styles.picker}
            enabled={
              !!vaccinationList?.vaccination_results?.find(
                (v) => v.student._id === currentStudent?._id
              ) === false
            }
          >
            <Picker.Item label="Mũi 1" value="1" />
            <Picker.Item label="Mũi 2" value="2" />
            <Picker.Item label="Mũi 3" value="3" />
            <Picker.Item label="Mũi nhắc lại" value="4" />
          </Picker>

          <Text style={styles.label}>Hạn sử dụng vaccine</Text>
          <TouchableOpacity
            onPress={() => setShowExpiryDatePicker(true)}
            disabled={!!vaccinationList?.vaccination_results?.find(
              (v) => v.student._id === currentStudent?._id
            )}
          >
            <Text style={styles.input}>
              {vaccinationData?.follow_up_date
                ? moment(vaccinationData.follow_up_date).format("DD/MM/YYYY")
                : "Chọn ngày"}
            </Text>
          </TouchableOpacity>
          {showExpiryDatePicker && (
            <DateTimePicker
              value={vaccinationData?.follow_up_date || new Date()}
              mode="date"
              onChange={(event, date) => {
                setShowExpiryDatePicker(false);
                if (date) {
                  setVaccinationData({
                    ...vaccinationData,
                    follow_up_date: date,
                  });
                }
              }}
            />
          )}

          <Text style={styles.label}>Tác dụng phụ</Text>
          {SIDE_EFFECTS_ENUM.map((effect) => (
            <View key={effect.value} style={styles.checkboxContainer}>
              <TouchableOpacity
                onPress={() => handleSideEffectToggle(effect.value)}
                style={[
                  styles.checkbox,
                  vaccinationData?.side_effects?.includes(effect.value) &&
                    styles.checkboxSelected,
                ]}
                disabled={!!vaccinationList?.vaccination_results?.find(
                  (v) => v.student._id === currentStudent?._id
                )}
              >
                {vaccinationData?.side_effects?.includes(effect.value) && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
              <Text>{effect.label}</Text>
            </View>
          ))}

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              onPress={() =>
                setVaccinationData({
                  ...vaccinationData,
                  follow_up_required: !vaccinationData?.follow_up_required,
                })
              }
              style={[
                styles.checkbox,
                vaccinationData?.follow_up_required && styles.checkboxSelected,
              ]}
              disabled={!!vaccinationList?.vaccination_results?.find(
                (v) => v.student._id === currentStudent?._id
              )}
            >
              {vaccinationData?.follow_up_required && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
            <Text>Cần theo dõi sau tiêm</Text>
          </View>

          <Text style={styles.label}>Ghi chú</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            value={vaccinationData?.notes || ""}
            onChangeText={(text) =>
              setVaccinationData({ ...vaccinationData, notes: text })
            }
            placeholder="Ghi chú thêm..."
            multiline
            editable={
              !!vaccinationList?.vaccination_results?.find(
                (v) => v.student._id === currentStudent?._id
              ) === false
            }
          />

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleRecordVaccination}
            disabled={
              !vaccinationData?.vaccine_brand ||
              !vaccinationData?.batch_number ||
              !vaccinationData?.administered_by ||
              !!vaccinationList?.vaccination_results?.find(
                (v) => v.student._id === currentStudent?._id
              )
            }
          >
            <Text style={styles.submitButtonText}>Lưu kết quả</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  </SafeAreaView>
</Modal>

      <Modal
  visible={followUpModalVisible}
  animationType="slide"
  onRequestClose={() => setFollowUpModalVisible(false)}
>
  <SafeAreaView style={styles.modalContainer}>
    <View style={styles.modalHeader}>
      <Text style={styles.modalTitle}>Theo dõi sau tiêm</Text>
      <TouchableOpacity onPress={() => setFollowUpModalVisible(false)}>
        <Text style={styles.closeButton}>Hủy</Text>
      </TouchableOpacity>
    </View>
    <ScrollView style={styles.modalContent}>
      <Text style={styles.studentInfo}>
        Học sinh: {currentStudent?.first_name} {currentStudent?.last_name} - Lớp: {currentStudent?.class_name}
      </Text>
      <Text style={styles.label}>Ngày tiêm</Text>
      <Text style={styles.input}>
        {moment(vaccinationData?.vaccinated_at).format("DD/MM/YYYY")}
      </Text>
      <Text style={styles.label}>Ngày theo dõi</Text>
      <TouchableOpacity onPress={() => setShowFollowUpDatePicker(true)}>
        <Text style={styles.input}>
          {moment(followUpData.follow_up_date).format("DD/MM/YYYY")}
        </Text>
      </TouchableOpacity>
      {showFollowUpDatePicker && (
        <DateTimePicker
          value={followUpData.follow_up_date}
          mode="date"
          onChange={(event, date) => {
            setShowFollowUpDatePicker(false);
            if (date) {
              setFollowUpData({ ...followUpData, follow_up_date: date });
            }
          }}
        />
      )}
      <Text style={styles.label}>Trạng thái</Text>
      <Picker
        selectedValue={followUpData.status}
        onValueChange={(value) =>
          setFollowUpData({ ...followUpData, status: value })
        }
        style={styles.picker}
      >
        <Picker.Item label="Bình thường" value="normal" />
        <Picker.Item label="Phản ứng nhẹ" value="mild_reaction" />
        <Picker.Item label="Phản ứng vừa" value="moderate_reaction" />
        <Picker.Item label="Phản ứng nặng" value="severe_reaction" />
        <Picker.Item label="Hoàn thành theo dõi" value="completed" />
      </Picker>
      <Text style={styles.label}>Hành động bổ sung</Text>
{Object.keys(ACTION_LABELS).map((action) => (
  <View key={action} style={styles.checkboxContainer}>
    <TouchableOpacity
      onPress={() => handleActionToggle(action)}
      style={[
        styles.checkbox,
        followUpData.additional_actions.includes(action) && styles.checkboxSelected,
      ]}
    >
      {followUpData.additional_actions.includes(action) && (
        <Text style={styles.checkmark}>✓</Text>
      )}
    </TouchableOpacity>
    <Text>{ACTION_LABELS[action]}</Text>
  </View>
))}
      <Text style={styles.label}>Ghi chú theo dõi</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        value={followUpData.follow_up_notes}
        onChangeText={(text) =>
          setFollowUpData({ ...followUpData, follow_up_notes: text })
        }
        placeholder="Ghi chú về tình trạng sau tiêm..."
        multiline
      />
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleFollowUp}
      >
        <Text style={styles.submitButtonText}>Lưu theo dõi</Text>
      </TouchableOpacity>
    </ScrollView>
  </SafeAreaView>
</Modal>

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
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "600", // Đậm hơn một chút
    color: colors.text,
    marginBottom: 8,
    marginLeft: 4, // Căn lề nhẹ
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: colors.surface,
  },
  inputError: {
    borderColor: colors.error,
  },
  datePickerContainer: {
    marginBottom: 15,
  },
  datePicker: {
    width: screenWidth - 40,
    backgroundColor: colors.surface,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  chipContainer: {
    marginBottom: 15,
  },
  refreshButton: {
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  refreshButtonText: {
    color: colors.primary,
    fontSize: 14,
  },
  chipList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
  },
  selectedChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 20, // Bo góc trên
    borderTopRightRadius: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.surface, // Nền nhẹ cho header
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 20, // Tăng kích thước chữ
    fontWeight: "700", // Đậm hơn
    color: colors.text,
    letterSpacing: 0.5, // Giãn chữ nhẹ
  },
  closeButton: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "600",
    padding: 8,
    backgroundColor: "#f0f0f0", // Nền nhẹ cho nút đóng
    borderRadius: 8,
  },
  editButton: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "600",
    padding: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  modalContent: {
    padding: 24, // Tăng padding cho nội dung
    backgroundColor: colors.background,
  },
  detailText: {
    fontSize: 16,
    color: colors.text,
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 10, // Bo góc mạnh hơn
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonContainer: {
    flexDirection: "row", // Sắp xếp nút theo hàng ngang
    justifyContent: "space-between",
    marginTop: 20,
    paddingHorizontal: 10,
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12, // Bo góc nút
    alignItems: "center",
    flex: 1, // Chiếm đều không gian
    marginHorizontal: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    fontSize: 16,
    color: "#007AFF",
  },
  alertContainer: {
    backgroundColor: "#fffbe6",
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  alertText: {
    color: "#d46b08",
  },
  studentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  studentClass: {
    fontSize: 14,
    color: "#666",
  },
  consentStatus: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  vaccinationStatus: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  vaccinationDetail: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  actionButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  modalContent: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 12,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  checkboxSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  checkmark: {
    color: "#fff",
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  searchContainer: {
  flex: 1,
  justifyContent: "center",
},
searchInput: {
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 8,
  padding: 10,
  fontSize: 14,
  backgroundColor: colors.surface,
},
});

export default VaccinationScreen;
