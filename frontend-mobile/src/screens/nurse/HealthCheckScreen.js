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
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import moment from "moment";
import DateTimePicker from "@react-native-community/datetimepicker";
import nurseAPI from "../../services/nurseApi";
import colors from "../../styles/colors";

// Import components
import ScreenHeader from "./components/ScreenHeader";
import LoadingScreen from "./components/LoadingScreen";
import EmptyState from "./components/EmptyState";
import HealthCheckCampaignCard from "./components/HealthCheckCampaignCard";

const HealthCheckScreen = ({ navigation }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showConsentDeadlinePicker, setShowConsentDeadlinePicker] =
    useState(false);
  const [isResultModalVisible, setIsResultModalVisible] = useState(false); // Thêm state cho modal kết quả
  const [selectedCampaignForResult, setSelectedCampaignForResult] =
    useState(null); // Chiến dịch được chọn
  const [students, setStudents] = useState([]); // Danh sách học sinh
  const [isConsultationModalVisible, setIsConsultationModalVisible] =
    useState(false);
  const [consultationCandidates, setConsultationCandidates] = useState([]);
  const [consultationSchedules, setConsultationSchedules] = useState([]);
  const [selectedCampaignForConsultation, setSelectedCampaignForConsultation] =
    useState(null);
  const [showConsultationDatePicker, setShowConsultationDatePicker] =
    useState(false);
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [selectedConsultationId, setSelectedConsultationId] = useState(null);
  const [tempDate, setTempDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Khai báo useForm cho form chiến dịch
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      date_range: [null, null],
      status: "draft",
      target_classes: [],
      instructions: "",
      requires_consent: true,
      consent_deadline: null,
      campaign_type: "health_check",
    },
  });

  // Khai báo useForm cho form kết quả (luôn gọi để giữ thứ tự Hooks)
  const {
    control: resultControl,
    handleSubmit: handleResultSubmit,
    formState: { errors: resultErrors },
    reset: resetResult,
  } = useForm({
    defaultValues: {
      studentId: "",
      findings: "",
      recommendations: "",
      status: "HEALTHY",
      requiresConsultation: false,
      notes: "",
    },
  });

  // Form cho lịch tư vấn
  const {
    control: consultationControl,
    handleSubmit: handleConsultationSubmit,
    formState: { errors: consultationErrors },
    reset: resetConsultation,
    setValue: setConsultationValue,
  } = useForm({
    defaultValues: {
      studentId: "",
      scheduledDate: null,
      duration: "30",
      notes: "",
    },
  });

  // Form cho hủy lịch tư vấn
  const {
    control: cancelControl,
    handleSubmit: handleCancelSubmit,
    formState: { errors: cancelErrors },
    reset: resetCancel,
  } = useForm({
    defaultValues: {
      cancelReason: "",
    },
  });

  const loadConsultationCandidates = async (campaign) => {
  try {
    console.log("Loading consultation candidates for campaign:", campaign._id);

    // Lấy kết quả chiến dịch
    const resultResponse = await nurseAPI.getCampaignResults(campaign._id);
    console.log("getCampaignResults:", JSON.stringify(resultResponse, null, 2));
    if (!resultResponse.success || !Array.isArray(resultResponse.data)) {
      Alert.alert("Lỗi", "Không thể tải kết quả khám");
      return [];
    }

    // Lấy danh sách lịch tư vấn
    const consultationResponse = await nurseAPI.getConsultationSchedules();
    console.log(
      "getConsultationSchedules:",
      JSON.stringify(consultationResponse, null, 2)
    );
    const consultationData = Array.isArray(consultationResponse)
      ? { success: true, data: consultationResponse }
      : consultationResponse;
    if (!consultationData.success || !Array.isArray(consultationData.data)) {
      Alert.alert("Lỗi", "Không thể tải danh sách lịch tư vấn");
      return [];
    }

    // Lấy quan hệ học sinh-phụ huynh
    const relationsResponse = await nurseAPI.getStudentParentRelations();
    console.log(
      "getStudentParentRelations:",
      JSON.stringify(relationsResponse, null, 2)
    );
    if (!relationsResponse.success || !Array.isArray(relationsResponse.data)) {
      Alert.alert("Lỗi", "Không thể tải danh sách quan hệ phụ huynh");
      return [];
    }

    // Lấy danh sách học sinh
    const studentResponse = await nurseAPI.getStudents();
    console.log("getStudents:", JSON.stringify(studentResponse, null, 2));
    if (!studentResponse.success || !Array.isArray(studentResponse.data)) {
      Alert.alert("Lỗi", "Không thể tải danh sách học sinh");
      return [];
    }

    // Tạo map quan hệ học sinh-phụ huynh
    const studentParentMap = relationsResponse.data.reduce((map, relation) => {
      // Kiểm tra tính hợp lệ của quan hệ
      if (!relation.student || !relation.parent) {
        console.warn("Invalid relation data:", relation);
        return map;
      }
      const studentId =
        typeof relation.student === "object" && relation.student?._id
          ? relation.student._id
          : relation.student;
      const parentId =
        typeof relation.parent === "object" && relation.parent?._id
          ? relation.parent._id
          : relation.parent;
      const parentName =
        relation.parent &&
        relation.parent.first_name &&
        relation.parent.last_name
          ? `${relation.parent.first_name} ${relation.parent.last_name}`
          : "Không xác định";
      map[studentId] = { parentId, parentName };
      return map;
    }, {});

    // Ghi log số lượng quan hệ hợp lệ
    console.log("Valid student-parent relations:", Object.keys(studentParentMap).length);

    // Tạo danh sách học sinh đã có lịch tư vấn
    const studentsWithConsultations = consultationData.data.reduce((set, consultation) => {
      if (!consultation.student) {
        console.warn("Invalid consultation data:", consultation);
        return set;
      }
      const studentId =
        typeof consultation.student === "object" && consultation.student?._id
          ? consultation.student._id
          : consultation.student;
      set.add(studentId);
      return set;
    }, new Set());

    // Lọc kết quả bất thường chưa có lịch tư vấn
    const unscheduledAbnormalResults = resultResponse.data
      .filter((result) => result.checkupDetails?.requiresConsultation)
      .filter((result) => {
        if (!result.student) {
          console.warn("Invalid result data:", result);
          return false;
        }
        const studentId =
          typeof result.student === "object" && result.student?._id
            ? result.student._id
            : result.student;
        return !studentsWithConsultations.has(studentId);
      })
      .map((result) => {
        const studentId =
          typeof result.student === "object" && result.student?._id
            ? result.student._id
            : result.student;
        const student = studentResponse.data.find((s) => s._id === studentId);
        return {
          resultId: result._id,
          studentId,
          studentName: student
            ? `${student.first_name} ${student.last_name}`
            : "Không xác định",
          className: student?.class_name || "Không xác định",
          parentId: studentParentMap[studentId]?.parentId || null,
          parentName: studentParentMap[studentId]?.parentName || "Không xác định",
          reason: result.checkupDetails.recommendations || "Cần tư vấn sức khỏe",
        };
      })
      .filter((candidate) => candidate.parentId); // Chỉ giữ các ứng viên có parentId

    console.log(
      "Unscheduled abnormal results:",
      JSON.stringify(unscheduledAbnormalResults, null, 2)
    );
    if (unscheduledAbnormalResults.length === 0) {
      console.warn("No consultation candidates found. Possible reasons: no abnormal results, all results scheduled, or invalid relations.");
    }
    return unscheduledAbnormalResults;
  } catch (error) {
    console.error("Error loading consultation candidates:", error);
    Alert.alert("Lỗi", "Có lỗi khi tải danh sách học sinh cần tư vấn");
    return [];
  }
};

  const checkForOverlappingConsultations = async (
    scheduledDate,
    duration = 30
  ) => {
    try {
      // Kiểm tra tính hợp lệ của scheduledDate
      const date = new Date(scheduledDate);
      if (isNaN(date.getTime())) {
        console.error("Invalid scheduledDate:", scheduledDate);
        Alert.alert("Lỗi", "Thời gian tư vấn không hợp lệ");
        return true;
      }

      // Kiểm tra duration
      if (!Number.isInteger(duration) || duration <= 0) {
        console.error("Invalid duration:", duration);
        Alert.alert("Lỗi", "Thời lượng tư vấn phải là số nguyên dương");
        return true;
      }

      const payload = {
        scheduledDate: date.toISOString(),
        duration,
      };

      console.log(
        "Sending payload to check overlap:",
        JSON.stringify(payload, null, 2)
      );

      const response = await nurseAPI.checkConsultationOverlap(payload);
      console.log("Check overlap response:", JSON.stringify(response, null, 2));

      if (response.success) {
        if (response.data.hasOverlap) {
          const conflictingConsultation = response.data.conflictingConsultation;
          const student = students.find(
            (s) =>
              s._id ===
              (typeof conflictingConsultation.student === "object"
                ? conflictingConsultation.student._id
                : conflictingConsultation.student)
          );
          // Định dạng ngày giờ thủ công
          const conflictDate = new Date(conflictingConsultation.scheduledDate);
          const formattedDate = `${conflictDate
            .getDate()
            .toString()
            .padStart(2, "0")}/${(conflictDate.getMonth() + 1)
            .toString()
            .padStart(2, "0")}/${conflictDate.getFullYear()} ${conflictDate
            .getHours()
            .toString()
            .padStart(2, "0")}:${conflictDate
            .getMinutes()
            .toString()
            .padStart(2, "0")}`;

          Alert.alert(
            "Lỗi",
            `Lịch tư vấn bị trùng với lịch của học sinh ${
              student ? `${student.first_name} ${student.last_name}` : "khác"
            } vào lúc ${formattedDate}`
          );
          return true;
        }
        return false;
      } else {
        console.error("API error response:", response);
        Alert.alert(
          "Lỗi",
          response.error ||
            response.message ||
            response.details ||
            "Không thể kiểm tra trùng lịch tư vấn"
        );
        return true;
      }
    } catch (error) {
      console.error(
        "Error checking consultation overlap:",
        error.response?.data || error
      );
      Alert.alert(
        "Lỗi",
        error.response?.data?.error ||
          error.response?.data?.details ||
          error.message ||
          "Có lỗi khi kiểm tra trùng lịch tư vấn"
      );
      return true;
    }
  };

  const checkLocalOverlap = (newDate, duration) => {
    const start = new Date(newDate).getTime(); // Chuyển sang milliseconds
    const end = start + duration * 60 * 1000; // Cộng duration (phút) đổi sang milliseconds

    return consultationSchedules.some((cs) => {
      const csStart = new Date(cs.scheduledDate).getTime();
      const csEnd = csStart + (cs.duration || 30) * 60 * 1000;
      return start < csEnd && end > csStart;
    });
  };

  const handleSubmitConsultation = async (values) => {
    if (!selectedCampaignForConsultation) {
      Alert.alert("Lỗi", "Vui lòng chọn chiến dịch");
      return;
    }
    try {
      const selectedCandidate = consultationCandidates.find(
        (candidate) => candidate.studentId === values.studentId
      );
      if (!selectedCandidate) {
        Alert.alert("Lỗi", "Học sinh không hợp lệ");
        return;
      }

      const duration = parseInt(values.duration) || 30;

      // Kiểm tra trùng lịch cục bộ
      if (checkLocalOverlap(values.scheduledDate, duration)) {
        Alert.alert("Lỗi", "Thời gian tư vấn bị trùng với lịch hiện tại");
        return;
      }

      // Kiểm tra scheduledDate hợp lệ trước khi gọi API
      let scheduledDateObj;
      if (values.scheduledDate instanceof Date) {
        scheduledDateObj = values.scheduledDate;
      } else {
        scheduledDateObj = new Date(values.scheduledDate);
      }
      if (!values.scheduledDate || isNaN(scheduledDateObj.getTime())) {
        Alert.alert("Lỗi", "Vui lòng chọn thời gian tư vấn hợp lệ");
        return;
      }

      // Kiểm tra trùng lịch với API
      const hasOverlap = await checkForOverlappingConsultations(
        scheduledDateObj,
        duration
      );
      if (hasOverlap) {
        return;
      }

      const scheduleData = {
        campaignResult: selectedCandidate.resultId,
        student: selectedCandidate.studentId,
        attending_parent: selectedCandidate.parentId,
        scheduledDate: scheduledDateObj.toISOString(),
        duration: duration,
        reason: selectedCandidate.reason,
        notes: values.notes || "",
      };

      console.log(
        "Submitting consultation schedule:",
        JSON.stringify(scheduleData, null, 2)
      );
      const response = await nurseAPI.createConsultationSchedule(scheduleData);
      console.log("API Response:", JSON.stringify(response, null, 2));
      if (response.success) {
        Alert.alert("Thành công", "Đã tạo lịch tư vấn thành công");
        resetConsultation();
        await handleViewConsultationSchedules(selectedCampaignForConsultation);
        setIsConsultationModalVisible(false);
      } else {
        Alert.alert("Lỗi", response.message || "Không thể tạo lịch tư vấn");
      }
    } catch (error) {
      console.error("Error submitting consultation schedule:", error);
      Alert.alert("Lỗi", error.message || "Có lỗi khi tạo lịch tư vấn");
    }
  };

  const handleViewConsultationSchedules = async (campaign) => {
  try {
    console.log("Loading consultation schedules for campaign:", campaign._id);
    const response = await nurseAPI.getConsultationSchedules();
    console.log(
      "API Response getConsultationSchedules:",
      JSON.stringify(response, null, 2)
    );
    if (response.success && Array.isArray(response.data)) {
      const filteredSchedules = response.data
        .filter((schedule) => {
          if (!schedule.campaignResult) {
            console.warn("Skipping schedule with null campaignResult:", schedule);
            return false;
          }
          const campaignId =
            typeof schedule.campaignResult === "object" &&
            schedule.campaignResult.campaign
              ? schedule.campaignResult.campaign
              : schedule.campaignResult;
          return campaignId === campaign._id;
        })
        .map((schedule) => {
          const studentId =
            typeof schedule.student === "object" && schedule.student?._id
              ? schedule.student._id
              : schedule.student;
          const student = students.find((s) => s._id === studentId);
          return {
            ...schedule,
            status: schedule.status || "SCHEDULED",
            studentName: student
              ? `${student.first_name} ${student.last_name}`
              : "Không xác định",
            parentName: schedule.attending_parent
              ? `${schedule.attending_parent.first_name || ""} ${
                  schedule.attending_parent.last_name || ""
                }`
              : "Không xác định",
          };
        });
      console.log(
        "Filtered schedules:",
        JSON.stringify(filteredSchedules, null, 2)
      );
      setConsultationSchedules(filteredSchedules);
      setSelectedCampaignForConsultation(campaign);
      setIsConsultationModalVisible(true);
      const candidates = await loadConsultationCandidates(campaign);
      console.log(
        "Consultation candidates:",
        JSON.stringify(candidates, null, 2)
      );
      setConsultationCandidates(candidates);
      if (filteredSchedules.length === 0 && candidates.length === 0) {
        Alert.alert("Thông báo", "Không có lịch tư vấn hoặc học sinh cần tư vấn");
      }
    } else {
      Alert.alert("Lỗi", "Không thể tải danh sách lịch tư vấn");
      setConsultationSchedules([]);
    }
  } catch (error) {
    console.error("Error loading consultation schedules:", error);
    Alert.alert(
      "Lỗi",
      error.message || "Có lỗi khi tải danh sách lịch tư vấn"
    );
    setConsultationSchedules([]);
  }
};

  const handleCompleteConsultation = async (consultationId) => {
    try {
      const response = await nurseAPI.completeConsultationSchedule(
        consultationId
      );
      if (response.success) {
        Alert.alert("Thành công", "Đã đánh dấu lịch tư vấn là hoàn thành");
        await handleViewConsultationSchedules(selectedCampaignForConsultation);
      } else {
        Alert.alert(
          "Lỗi",
          response.message || "Không thể hoàn thành lịch tư vấn"
        );
      }
    } catch (error) {
      console.error("Error completing consultation:", error);
      Alert.alert("Lỗi", error.message || "Có lỗi khi hoàn thành lịch tư vấn");
    }
  };

  const handleOpenCancelModal = (consultationId) => {
    setSelectedConsultationId(consultationId);
    setIsCancelModalVisible(true);
  };

  const handleSubmitCancel = async (values) => {
    try {
      const response = await nurseAPI.cancelConsultationSchedule(
        selectedConsultationId,
        {
          cancelReason: values.cancelReason,
        }
      );
      if (response.success) {
        Alert.alert("Thành công", "Đã hủy lịch tư vấn");
        setIsCancelModalVisible(false);
        resetCancel();
        await handleViewConsultationSchedules(selectedCampaignForConsultation);
      } else {
        Alert.alert("Lỗi", response.message || "Không thể hủy lịch tư vấn");
      }
    } catch (error) {
      console.error("Error cancelling consultation:", error);
      Alert.alert("Lỗi", error.message || "Có lỗi khi hủy lịch tư vấn");
    }
  };

  const requiresConsent = watch("requires_consent");
  const dateRange = watch("date_range");

  const getStatusText = (status, startDate, endDate) => {
  const now = moment();
  const start = moment(startDate);
  const end = moment(endDate);
  switch (status) {
    case "draft":
      if (now.isAfter(end)) {
        return "Bản nháp (Hết hạn)";
      }
      return "Bản nháp";
    case "active":
      if (now.isSameOrAfter(start) && now.isSameOrBefore(end)) {
        return "Đang diễn ra";
      }
      return "Đã kết thúc";
    case "completed":
      return "Đã hoàn thành";
    case "cancelled":
      return "Hủy";
    default:
      return "Không xác định";
  }
};

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const response = await nurseAPI.getCampaigns();
      console.log("API Response:", JSON.stringify(response, null, 2));
      let campaignsData = [];

      if (response.success && Array.isArray(response.data)) {
        campaignsData = response.data;
      } else if (Array.isArray(response)) {
        campaignsData = response;
      } else {
        console.warn("API response is not an array:", response);
        Alert.alert("Lỗi", "Dữ liệu chiến dịch không đúng định dạng");
        setCampaigns([]);
        return;
      }

      const healthCheckCampaigns = campaignsData.filter(
        (campaign) => campaign.campaign_type === "health_check"
      );
      setCampaigns(healthCheckCampaigns);
    } catch (error) {
      console.error("Error loading health check campaigns:", error);
      setCampaigns([]);
      Alert.alert(
        "Lỗi",
        `Không thể tải danh sách chiến dịch kiểm tra sức khỏe: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableClasses = async (silent = false) => {
    try {
      const response = await nurseAPI.getStudents();
      if (response.success && Array.isArray(response.data)) {
        const classNames = Array.from(
          new Set(response.data.map((student) => student.class_name))
        ).filter(Boolean);
        setAvailableClasses(classNames.sort());
        if (!silent) {
          Alert.alert(
            "Thành công",
            `Đã tải ${classNames.length} lớp học từ hệ thống`
          );
        }
      } else {
        setAvailableClasses(["10A1", "10A2", "11B1", "11B2", "12C1", "12C2"]);
        if (!silent) {
          Alert.alert(
            "Cảnh báo",
            "Không thể tải danh sách lớp, sử dụng danh sách mặc định"
          );
        }
      }
    } catch (error) {
      console.error("Error loading classes:", error);
      setAvailableClasses(["10A1", "10A2", "11B1", "11B2", "12C1", "12C2"]);
      if (!silent) {
        Alert.alert(
          "Lỗi",
          "Có lỗi khi tải danh sách lớp, sử dụng danh sách mặc định"
        );
      }
    }
  };

  const loadStudents = async () => {
    try {
      const response = await nurseAPI.getStudents();
      if (response.success && Array.isArray(response.data)) {
        setStudents(response.data);
      } else {
        setStudents([]);
        Alert.alert("Lỗi", "Không thể tải danh sách học sinh");
      }
    } catch (error) {
      console.error("Error loading students:", error);
      setStudents([]);
      Alert.alert("Lỗi", "Có lỗi khi tải danh sách học sinh");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCampaigns();
    setRefreshing(false);
  };

  useEffect(() => {
    loadCampaigns();
    loadAvailableClasses(true);
    loadStudents();
  }, []);

  const getTargetClassOptions = () => {
    const options = [{ label: "Tất cả các lớp", value: "all_grades" }];
    if (availableClasses.length === 0) return options;

    const grades = Array.from(
      new Set(
        availableClasses
          .map((className) => {
            const match = className.match(/^(\d+)/);
            return match ? match[1] : null;
          })
          .filter(Boolean)
      )
    );

    grades.sort().forEach((grade) => {
      options.push({ label: `Khối ${grade}`, value: `grade_${grade}` });
    });

    availableClasses.forEach((className) => {
      options.push({ label: `Lớp ${className}`, value: className });
    });

    return options;
  };

  const handleCreateCampaign = () => {
    reset();
    setEditingCampaign(null);
    setIsModalVisible(true);
    setTimeout(() => {
      setValue("campaign_type", "health_check");
      setValue("status", "draft");
      setValue("requires_consent", true);
      setValue("target_classes", []);
      setValue("date_range", [
        moment().add(1, "day").toDate(),
        moment().add(7, "days").toDate(),
      ]);
    }, 0);
  };

  const handleEditCampaign = (campaign) => {
    setEditingCampaign(campaign);
    setIsModalVisible(true);
    setTimeout(() => {
      const options = getTargetClassOptions();
      const normalizedTargetClasses = campaign.target_classes?.map((group) => {
        const option = options.find((opt) => opt.label === group);
        return option ? option.value : group;
      });

      setValue("title", campaign.title);
      setValue("description", campaign.description);
      setValue("date_range", [
        moment(campaign.start_date).toDate(),
        moment(campaign.end_date).toDate(),
      ]);
      setValue("status", campaign.status);
      setValue(
        "target_classes",
        normalizedTargetClasses || campaign.target_classes
      );
      setValue("instructions", campaign.instructions || "");
      setValue("requires_consent", campaign.requires_consent);
      setValue(
        "consent_deadline",
        campaign.consent_deadline
          ? moment(campaign.consent_deadline).toDate()
          : null
      );
      setValue("campaign_type", campaign.campaign_type);
    }, 0);
  };

  const handleSubmitCampaign = async (values) => {
    try {
      if (
        !values.date_range ||
        values.date_range.length !== 2 ||
        !moment(values.date_range[0]).isValid() ||
        !moment(values.date_range[1]).isValid()
      ) {
        Alert.alert("Lỗi", "Vui lòng chọn khoảng thời gian hợp lệ");
        return;
      }
      if (
        moment(values.date_range[0]).isBefore(moment().startOf("day")) &&
        !editingCampaign
      ) {
        Alert.alert("Lỗi", "Ngày bắt đầu không thể là ngày trong quá khứ");
        return;
      }
      if (moment(values.date_range[1]).isBefore(values.date_range[0])) {
        Alert.alert("Lỗi", "Ngày kết thúc phải sau ngày bắt đầu");
        return;
      }
      if (
        values.requires_consent &&
        !moment(values.consent_deadline).isValid()
      ) {
        Alert.alert("Lỗi", "Hạn cuối đồng ý không hợp lệ");
        return;
      }
      if (
        values.requires_consent &&
        moment(values.consent_deadline).isSameOrAfter(
          moment(values.date_range[0])
        )
      ) {
        Alert.alert(
          "Lỗi",
          "Hạn cuối đồng ý phải trước ngày bắt đầu chiến dịch"
        );
        return;
      }
      if (!values.target_classes || values.target_classes.length === 0) {
        Alert.alert("Lỗi", "Vui lòng chọn ít nhất một nhóm đối tượng");
        return;
      }
      // Kiểm tra trạng thái hợp lệ khi tạo mới
      if (!editingCampaign && !["draft", "active"].includes(values.status)) {
        Alert.alert("Lỗi", "Trạng thái không hợp lệ khi tạo chiến dịch");
        return;
      }

      const campaignData = {
        title: values.title,
        description: values.description,
        start_date: moment(values.date_range[0]).toISOString(),
        end_date: moment(values.date_range[1]).toISOString(),
        target_classes: values.target_classes.includes("all_grades")
          ? availableClasses
          : values.target_classes.reduce((acc, cls) => {
              if (cls.startsWith("grade_")) {
                const grade = cls.replace("grade_", "");
                const gradeClasses = availableClasses.filter((className) =>
                  className.startsWith(grade)
                );
                return [...acc, ...gradeClasses];
              }
              return cls !== "all_grades" ? [...acc, cls] : acc;
            }, []),
        status: values.status || "draft",
        campaign_type: "health_check",
        requires_consent: values.requires_consent,
        instructions: values.instructions || "",
        consent_deadline:
          values.requires_consent && values.consent_deadline
            ? moment(values.consent_deadline).toISOString()
            : undefined,
      };

      console.log("Payload gửi đi:", JSON.stringify(campaignData, null, 2));

      let response;
      if (editingCampaign) {
        response = await nurseAPI.updateCampaign(
          editingCampaign._id,
          campaignData
        );
      } else {
        response = await nurseAPI.createCampaign(campaignData);
      }

      if (response.success) {
        Alert.alert(
          "Thành công",
          editingCampaign
            ? "Đã cập nhật chiến dịch kiểm tra sức khỏe"
            : "Đã tạo chiến dịch kiểm tra sức khỏe mới"
        );
        setIsModalVisible(false);
        reset();
        setEditingCampaign(null);
        await loadCampaigns();
      } else {
        console.log("Phản hồi lỗi từ API:", JSON.stringify(response, null, 2));
        Alert.alert(
          "Lỗi",
          response.message || "Không thể lưu chiến dịch kiểm tra sức khỏe"
        );
      }
    } catch (error) {
      console.error(
        "Chi tiết lỗi:",
        JSON.stringify(error, null, 2) || error.message
      );
      Alert.alert(
        "Lỗi",
        error.message || "Không thể lưu chiến dịch kiểm tra sức khỏe"
      );
    }
  };

  const handleSubmitExamResult = async (values) => {
    if (!selectedCampaignForResult) {
      Alert.alert("Lỗi", "Vui lòng chọn chiến dịch");
      return;
    }
    try {
      const resultData = {
        campaign: selectedCampaignForResult._id,
        student: values.studentId,
        notes: values.notes || "",
        checkupDetails: {
          findings: values.findings || "Sức khỏe tốt",
          recommendations: values.recommendations || "",
          status: values.status || "HEALTHY",
          requiresConsultation: values.requiresConsultation || false,
        },
      };
      console.log("Submitting result:", JSON.stringify(resultData, null, 2));
      const response = await nurseAPI.submitCampaignResult(resultData);
      if (response.success) {
        Alert.alert("Thành công", "Đã lưu kết quả khám thành công");
        resetResult();
        // Cập nhật lại danh sách học sinh chưa có kết quả ngay lập tức
        await handleAddResult(selectedCampaignForResult);
        // Không đóng modal ngay, để người dùng tiếp tục ghi kết quả cho học sinh khác
        await loadCampaigns();
      } else {
        const student = students.find((s) => s._id === values.studentId);
        if (response.error?.includes("already exists")) {
          Alert.alert(
            "Lỗi",
            `Học sinh ${
              student ? `${student.first_name} ${student.last_name}` : "này"
            } đã có kết quả khám cho chiến dịch này`
          );
        } else {
          Alert.alert("Lỗi", response.message || "Không thể lưu kết quả khám");
        }
      }
    } catch (error) {
      console.error("Error submitting exam result:", error);
      const student = students.find((s) => s._id === values.studentId);
      if (error.message?.includes("already exists")) {
        Alert.alert(
          "Lỗi",
          `Học sinh ${
            student ? `${student.first_name} ${student.last_name}` : "này"
          } đã có kết quả khám cho chiến dịch này`
        );
      } else {
        Alert.alert("Lỗi", error.message || "Có lỗi khi lưu kết quả khám");
      }
    }
  };

  const handleViewCampaign = (campaign) => {
    const statusText = getStatusText(
      campaign.status,
      campaign.start_date,
      campaign.end_date
    );
    Alert.alert(
      "Chi Tiết Chiến Dịch",
      `Tên: ${campaign.title}\n` +
        `Loại: ${campaign.campaign_type || "Không xác định"}\n` +
        `Thời gian: ${moment(campaign.start_date).format(
          "DD/MM/YYYY"
        )} - ${moment(campaign.end_date).format("DD/MM/YYYY")}\n` +
        `Mô tả: ${campaign.description || "Không có mô tả"}\n` +
        `Trạng thái: ${statusText}\n` +
        `Yêu cầu đồng ý: ${campaign.requires_consent ? "Có" : "Không"}\n` +
        (campaign.requires_consent && campaign.consent_deadline
          ? `Hạn đồng ý: ${moment(campaign.consent_deadline).format(
              "DD/MM/YYYY"
            )}\n`
          : "") +
        `Lớp đối tượng: ${
          (campaign.target_classes || []).join(", ") || "Không xác định"
        }\n` +
        `Hướng dẫn: ${campaign.instructions || "Không có hướng dẫn"}`,
      [
        { text: "Đóng" },
        { text: "Chỉnh sửa", onPress: () => handleEditCampaign(campaign) },
        {
          text: "Xem lịch tư vấn",
          onPress: () => handleViewConsultationSchedules(campaign),
        },
      ]
    );
  };

  const handleAddResult = async (campaign) => {
    try {
      if (["completed", "cancelled"].includes(campaign.status)) {
        Alert.alert(
          "Lỗi",
          `Không thể ghi kết quả cho chiến dịch có trạng thái "${
            campaign.status === "completed" ? "Đã hoàn thành" : "Hủy"
          }"`
        );
        return;
      }

      const studentResponse = await nurseAPI.getStudents();
      if (!studentResponse.success || !Array.isArray(studentResponse.data)) {
        Alert.alert("Lỗi", "Không thể tải danh sách học sinh");
        setStudents([]);
        return;
      }

      const targetClasses = campaign.target_classes || [];
      let classesToFilter = [];
      if (targetClasses.includes("all_grades")) {
        classesToFilter = availableClasses;
      } else {
        classesToFilter = targetClasses.reduce((acc, cls) => {
          if (cls.startsWith("grade_")) {
            const grade = cls.replace("grade_", "");
            const gradeClasses = availableClasses.filter((className) =>
              className.startsWith(grade)
            );
            return [...acc, ...gradeClasses];
          }
          return [...acc, cls];
        }, []);
      }

      const filteredStudentsByClass = studentResponse.data.filter((student) =>
        classesToFilter.includes(student.class_name)
      );

      if (filteredStudentsByClass.length === 0) {
        Alert.alert(
          "Thông báo",
          `Không có học sinh nào thuộc các lớp ${
            classesToFilter.join(", ") || "Không xác định"
          }`
        );
        setStudents([]);
        return;
      }

      if (campaign.requires_consent) {
        const consentResponse = await nurseAPI.getCampaignConsents(
          campaign._id
        );
        if (!consentResponse.success || !Array.isArray(consentResponse.data)) {
          Alert.alert("Lỗi", "Không thể tải danh sách đồng ý của phụ huynh");
          return;
        }

        const consents = consentResponse.data;
        if (consents.length === 0) {
          Alert.alert(
            "Thông báo",
            "Chiến dịch này yêu cầu đồng ý của phụ huynh, nhưng chưa có phụ huynh nào đồng ý."
          );
          return;
        }

        const consentedStudentIds = consents
          .filter((consent) => consent.status === "APPROVED")
          .map((consent) =>
            typeof consent.student === "object"
              ? consent.student._id
              : consent.student
          );

        if (consentedStudentIds.length === 0) {
          Alert.alert(
            "Thông báo",
            "Chưa có học sinh nào được phụ huynh đồng ý tham gia chiến dịch này."
          );
          return;
        }

        const resultResponse = await nurseAPI.getCampaignResults(campaign._id);
        let checkedStudentIds = [];
        if (resultResponse.success && Array.isArray(resultResponse.data)) {
          checkedStudentIds = resultResponse.data.map((result) =>
            typeof result.student === "object"
              ? result.student._id
              : result.student
          );
        }

        const filteredStudents = filteredStudentsByClass.filter(
          (student) =>
            consentedStudentIds.includes(student._id) &&
            !checkedStudentIds.includes(student._id)
        );

        if (filteredStudents.length === 0) {
          Alert.alert(
            "Thông báo",
            `Tất cả học sinh được đồng ý trong các lớp ${classesToFilter.join(
              ", "
            )} đã có kết quả khám.`
          );
          setIsResultModalVisible(false);
          setStudents([]);
          return;
        }

        setStudents(filteredStudents);
        setSelectedCampaignForResult(campaign);
        setIsResultModalVisible(true);
      } else {
        const resultResponse = await nurseAPI.getCampaignResults(campaign._id);
        let checkedStudentIds = [];
        if (resultResponse.success && Array.isArray(resultResponse.data)) {
          checkedStudentIds = resultResponse.data.map((result) =>
            typeof result.student === "object"
              ? result.student._id
              : result.student
          );
        }

        const filteredStudents = filteredStudentsByClass.filter(
          (student) => !checkedStudentIds.includes(student._id)
        );

        if (filteredStudents.length === 0) {
          Alert.alert(
            "Thông báo",
            `Tất cả học sinh trong các lớp ${classesToFilter.join(
              ", "
            )} đã được ghi kết quả`
          );
          setIsResultModalVisible(false);
          setStudents([]);
          return;
        }

        setStudents(filteredStudents);
        setSelectedCampaignForResult(campaign);
        setIsResultModalVisible(true);
      }
    } catch (error) {
      console.error("Error loading students, consents, or results:", error);
      Alert.alert(
        "Lỗi",
        "Có lỗi khi tải danh sách học sinh, đồng ý, hoặc kết quả khám"
      );
      setStudents([]);
    }
  };

  if (loading) {
    return <LoadingScreen message="Đang tải chiến dịch kiểm tra sức khỏe..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader
        title="Kiểm Tra Sức Khỏe"
        onBack={() => navigation.goBack()}
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
          {Array.isArray(campaigns) && campaigns.length === 0 ? (
            <EmptyState message="Không có chiến dịch kiểm tra sức khỏe nào" />
          ) : Array.isArray(campaigns) ? (
            campaigns.map((campaign, index) => (
              <HealthCheckCampaignCard
                key={campaign._id || index}
                campaign={campaign}
                onPress={handleViewCampaign}
                onEdit={handleEditCampaign}
                onAddResult={handleAddResult}
                onScheduleConsultation={handleViewConsultationSchedules} // Truyền hàm này
              />
            ))
          ) : (
            <EmptyState message="Dữ liệu chiến dịch không hợp lệ" />
          )}
        </View>
      </ScrollView>
      <TouchableOpacity
        style={styles.createButton}
        onPress={handleCreateCampaign}
      >
        <Text style={styles.createButtonText}>+</Text>
      </TouchableOpacity>
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingCampaign ? "Chỉnh sửa Chiến Dịch" : "Tạo Chiến Dịch Mới"}
            </Text>
            <Controller
              control={control}
              name="title"
              rules={{
                required: "Vui lòng nhập tên chiến dịch",
                minLength: {
                  value: 5,
                  message: "Tên chiến dịch phải có ít nhất 5 ký tự",
                },
              }}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <View style={styles.formItem}>
                  <Text style={styles.label}>Tên chiến dịch</Text>
                  <TextInput
                    style={[styles.input, error && styles.inputError]}
                    value={value}
                    onChangeText={onChange}
                    placeholder="Nhập tên chiến dịch"
                    maxLength={100}
                  />
                  {error && (
                    <Text style={styles.errorText}>{error.message}</Text>
                  )}
                </View>
              )}
            />
            <Controller
              control={control}
              name="description"
              rules={{
                required: "Vui lòng nhập mô tả",
                minLength: {
                  value: 10,
                  message: "Mô tả phải có ít nhất 10 ký tự",
                },
              }}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <View style={styles.formItem}>
                  <Text style={styles.label}>Mô tả</Text>
                  <TextInput
                    style={[
                      styles.input,
                      styles.textArea,
                      error && styles.inputError,
                    ]}
                    value={value}
                    onChangeText={onChange}
                    placeholder="Nhập mô tả chi tiết"
                    multiline
                    numberOfLines={3}
                    maxLength={500}
                  />
                  {error && (
                    <Text style={styles.errorText}>{error.message}</Text>
                  )}
                </View>
              )}
            />
            <Controller
              control={control}
              name="date_range"
              rules={{ required: "Vui lòng chọn thời gian" }}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <View style={styles.formItem}>
                  <Text style={styles.label}>Thời gian thực hiện</Text>
                  <View style={styles.dateRange}>
                    <TouchableOpacity
                      onPress={() => setShowStartDatePicker(true)}
                      style={styles.dateButton}
                    >
                      <Text>
                        {value?.[0]
                          ? moment(value[0]).format("DD/MM/YYYY")
                          : "Chọn ngày bắt đầu"}
                      </Text>
                    </TouchableOpacity>
                    {showStartDatePicker && (
                      <DateTimePicker
                        value={value?.[0] || new Date()}
                        mode="date"
                        display={Platform.OS === "ios" ? "inline" : "default"}
                        onChange={(event, date) => {
                          setShowStartDatePicker(false);
                          if (date) onChange([date, value?.[1]]);
                        }}
                        minimumDate={editingCampaign ? undefined : new Date()}
                      />
                    )}
                    <TouchableOpacity
                      onPress={() => setShowEndDatePicker(true)}
                      style={styles.dateButton}
                    >
                      <Text>
                        {value?.[1]
                          ? moment(value[1]).format("DD/MM/YYYY")
                          : "Chọn ngày kết thúc"}
                      </Text>
                    </TouchableOpacity>
                    {showEndDatePicker && (
                      <DateTimePicker
                        value={value?.[1] || new Date()}
                        mode="date"
                        display={Platform.OS === "ios" ? "inline" : "default"}
                        onChange={(event, date) => {
                          setShowEndDatePicker(false);
                          if (date) onChange([value?.[0], date]);
                        }}
                        minimumDate={value?.[0] || new Date()}
                      />
                    )}
                  </View>
                  {error && (
                    <Text style={styles.errorText}>{error.message}</Text>
                  )}
                </View>
              )}
            />
            <Controller
              control={control}
              name="status"
              rules={{ required: "Vui lòng chọn trạng thái" }}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <View style={styles.formItem}>
                  <Text style={styles.label}>Trạng thái</Text>
                  <View style={styles.select}>
                    {(editingCampaign
                      ? [
                          { value: "draft", label: "Bản nháp" },
                          { value: "active", label: "Đang tiến hành" },
                          { value: "completed", label: "Đã hoàn thành" },
                          { value: "cancelled", label: "Hủy" },
                        ]
                      : [
                          { value: "draft", label: "Bản nháp" },
                          { value: "active", label: "Đang tiến hành" },
                        ]
                    ).map((status) => (
                      <TouchableOpacity
                        key={status.value}
                        style={[
                          styles.selectOption,
                          value === status.value && styles.selectOptionActive,
                        ]}
                        onPress={() => onChange(status.value)}
                      >
                        <Text
                          style={
                            value === status.value
                              ? styles.selectTextActive
                              : styles.selectText
                          }
                        >
                          {status.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {error && (
                    <Text style={styles.errorText}>{error.message}</Text>
                  )}
                </View>
              )}
            />
            <Controller
              control={control}
              name="target_classes"
              rules={{
                required: "Vui lòng chọn nhóm đối tượng",
                validate: (value) =>
                  !value.includes("all_grades") ||
                  value.length === 1 ||
                  "Khi chọn 'Tất cả các lớp' thì không cần chọn thêm lớp nào khác",
              }}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <View style={styles.formItem}>
                  <Text style={styles.label}>Nhóm đối tượng</Text>
                  <View style={styles.select}>
                    {getTargetClassOptions().map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.selectOption,
                          value?.includes(option.value) &&
                            styles.selectOptionActive,
                        ]}
                        onPress={() => {
                          if (option.value === "all_grades") {
                            onChange(["all_grades"]);
                          } else {
                            const newValue = value?.includes(option.value)
                              ? value.filter(
                                  (v) =>
                                    v !== option.value && v !== "all_grades"
                                )
                              : [
                                  ...(value?.filter(
                                    (v) => v !== "all_grades"
                                  ) || []),
                                  option.value,
                                ];
                            onChange(newValue);
                          }
                        }}
                      >
                        <Text
                          style={
                            value?.includes(option.value)
                              ? styles.selectTextActive
                              : styles.selectText
                          }
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {error && (
                    <Text style={styles.errorText}>{error.message}</Text>
                  )}
                </View>
              )}
            />
            <Controller
              control={control}
              name="instructions"
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <View style={styles.formItem}>
                  <Text style={styles.label}>Hướng dẫn thực hiện</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={value}
                    onChangeText={onChange}
                    placeholder="Nhập hướng dẫn chi tiết"
                    multiline
                    numberOfLines={3}
                    maxLength={300}
                  />
                  {error && (
                    <Text style={styles.errorText}>{error.message}</Text>
                  )}
                </View>
              )}
            />
            <Controller
              control={control}
              name="requires_consent"
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <View style={styles.formItem}>
                  <Text style={styles.label}>Yêu cầu đồng ý của phụ huynh</Text>
                  <View style={styles.select}>
                    <TouchableOpacity
                      style={[
                        styles.selectOption,
                        value === true && styles.selectOptionActive,
                      ]}
                      onPress={() => onChange(true)}
                    >
                      <Text
                        style={
                          value === true
                            ? styles.selectTextActive
                            : styles.selectText
                        }
                      >
                        Có
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.selectOption,
                        value === false && styles.selectOptionActive,
                      ]}
                      onPress={() => onChange(false)}
                    >
                      <Text
                        style={
                          value === false
                            ? styles.selectTextActive
                            : styles.selectText
                        }
                      >
                        Không
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {error && (
                    <Text style={styles.errorText}>{error.message}</Text>
                  )}
                </View>
              )}
            />
            <Controller
              control={control}
              name="consent_deadline"
              rules={{
                required: requiresConsent
                  ? "Vui lòng chọn hạn cuối đồng ý"
                  : false,
                validate: (value) => {
                  if (!requiresConsent) return true;
                  if (!value) return "Vui lòng chọn hạn cuối đồng ý";
                  if (moment(value).isBefore(moment().startOf("day")))
                    return "Hạn cuối đồng ý không được trước ngày hiện tại";
                  if (
                    dateRange &&
                    moment(value).isSameOrAfter(moment(dateRange[0]))
                  )
                    return "Hạn cuối đồng ý phải trước ngày bắt đầu chiến dịch";
                  return true;
                },
              }}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <View style={styles.formItem}>
                  <Text style={styles.label}>Hạn cuối đồng ý</Text>
                  <TouchableOpacity
                    style={[
                      styles.dateButton,
                      !requiresConsent && styles.disabledButton,
                    ]}
                    onPress={() =>
                      requiresConsent && setShowConsentDeadlinePicker(true)
                    }
                    disabled={!requiresConsent}
                  >
                    <Text>
                      {value
                        ? moment(value).format("DD/MM/YYYY")
                        : "Chọn hạn cuối đồng ý"}
                    </Text>
                  </TouchableOpacity>
                  {showConsentDeadlinePicker && (
                    <DateTimePicker
                      value={value || new Date()}
                      mode="date"
                      display={Platform.OS === "ios" ? "inline" : "default"}
                      onChange={(event, date) => {
                        setShowConsentDeadlinePicker(false);
                        if (date) onChange(date);
                      }}
                      minimumDate={new Date()}
                      maximumDate={
                        dateRange?.[0]
                          ? moment(dateRange[0]).subtract(1, "day").toDate()
                          : undefined
                      }
                    />
                  )}
                  {error && (
                    <Text style={styles.errorText}>{error.message}</Text>
                  )}
                </View>
              )}
            />
            <View style={styles.formActions}>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit(handleSubmitCampaign)}
              >
                <Text style={styles.submitButtonText}>
                  {editingCampaign ? "Cập nhật" : "Tạo"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setIsModalVisible(false);
                  reset();
                  setEditingCampaign(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={isResultModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ghi Kết Quả Khám Sức Khỏe</Text>
            <Controller
              control={resultControl}
              name="studentId"
              rules={{ required: "Vui lòng chọn học sinh" }}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <View style={styles.formItem}>
                  <Text style={styles.label}>Học sinh</Text>
                  <View style={styles.select}>
                    {students.map((student) => (
                      <TouchableOpacity
                        key={student._id}
                        style={[
                          styles.selectOption,
                          value === student._id && styles.selectOptionActive,
                        ]}
                        onPress={() => onChange(student._id)}
                      >
                        <Text
                          style={
                            value === student._id
                              ? styles.selectTextActive
                              : styles.selectText
                          }
                        >
                          {`${student.first_name} ${student.last_name} - ${student.class_name}`}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {error && (
                    <Text style={styles.errorText}>{error.message}</Text>
                  )}
                </View>
              )}
            />
            <Controller
              control={resultControl}
              name="findings"
              rules={{ required: "Vui lòng nhập kết quả khám" }}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <View style={styles.formItem}>
                  <Text style={styles.label}>Kết quả khám</Text>
                  <TextInput
                    style={[styles.input, error && styles.inputError]}
                    value={value}
                    onChangeText={onChange}
                    placeholder="Nhập kết quả khám"
                    multiline
                    numberOfLines={2}
                  />
                  {error && (
                    <Text style={styles.errorText}>{error.message}</Text>
                  )}
                </View>
              )}
            />
            <Controller
              control={resultControl}
              name="recommendations"
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <View style={styles.formItem}>
                  <Text style={styles.label}>Khuyến nghị</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={value}
                    onChangeText={onChange}
                    placeholder="Nhập khuyến nghị (tùy chọn)"
                    multiline
                    numberOfLines={2}
                  />
                  {error && (
                    <Text style={styles.errorText}>{error.message}</Text>
                  )}
                </View>
              )}
            />
            <Controller
              control={resultControl}
              name="status"
              rules={{ required: "Vui lòng chọn trạng thái" }}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <View style={styles.formItem}>
                  <Text style={styles.label}>Trạng thái</Text>
                  <View style={styles.select}>
                    {["HEALTHY", "NEEDS_ATTENTION", "CRITICAL"].map(
                      (status) => (
                        <TouchableOpacity
                          key={status}
                          style={[
                            styles.selectOption,
                            value === status && styles.selectOptionActive,
                          ]}
                          onPress={() => onChange(status)}
                        >
                          <Text
                            style={
                              value === status
                                ? styles.selectTextActive
                                : styles.selectText
                            }
                          >
                            {status === "HEALTHY"
                              ? "Khỏe mạnh"
                              : status === "NEEDS_ATTENTION"
                              ? "Cần chú ý"
                              : "Nguy cấp"}
                          </Text>
                        </TouchableOpacity>
                      )
                    )}
                  </View>
                  {error && (
                    <Text style={styles.errorText}>{error.message}</Text>
                  )}
                </View>
              )}
            />
            <Controller
              control={resultControl}
              name="requiresConsultation"
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <View style={styles.formItem}>
                  <Text style={styles.label}>Cần tư vấn</Text>
                  <View style={styles.select}>
                    <TouchableOpacity
                      style={[
                        styles.selectOption,
                        value === true && styles.selectOptionActive,
                      ]}
                      onPress={() => onChange(true)}
                    >
                      <Text
                        style={
                          value === true
                            ? styles.selectTextActive
                            : styles.selectText
                        }
                      >
                        Có
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.selectOption,
                        value === false && styles.selectOptionActive,
                      ]}
                      onPress={() => onChange(false)}
                    >
                      <Text
                        style={
                          value === false
                            ? styles.selectTextActive
                            : styles.selectText
                        }
                      >
                        Không
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {error && (
                    <Text style={styles.errorText}>{error.message}</Text>
                  )}
                </View>
              )}
            />
            <Controller
              control={resultControl}
              name="notes"
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <View style={styles.formItem}>
                  <Text style={styles.label}>Ghi chú</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={value}
                    onChangeText={onChange}
                    placeholder="Nhập ghi chú (tùy chọn)"
                    multiline
                    numberOfLines={2}
                  />
                  {error && (
                    <Text style={styles.errorText}>{error.message}</Text>
                  )}
                </View>
              )}
            />
            <View style={styles.formActions}>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleResultSubmit(handleSubmitExamResult)}
              >
                <Text style={styles.submitButtonText}>Lưu Kết Quả</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setIsResultModalVisible(false);
                  resetResult();
                  setSelectedCampaignForResult(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
      <Modal
        visible={isConsultationModalVisible}
        animationType="slide"
        transparent
      >
        <View style={styles.modalContainer}>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>Đặt Lịch Tư Vấn</Text>
            {consultationCandidates.length > 0 ? (
              <>
                <Controller
                  control={consultationControl}
                  name="studentId"
                  rules={{ required: "Vui lòng chọn học sinh" }}
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }) => (
                    <View style={styles.formItem}>
                      <Text style={styles.label}>Học sinh</Text>
                      <View style={styles.select}>
                        {consultationCandidates.map((candidate) => (
                          <TouchableOpacity
                            key={candidate.studentId}
                            style={[
                              styles.selectOption,
                              value === candidate.studentId &&
                                styles.selectOptionActive,
                            ]}
                            onPress={() => {
                              onChange(candidate.studentId);
                              setConsultationValue("notes", candidate.reason);
                            }}
                          >
                            <Text
                              style={
                                value === candidate.studentId
                                  ? styles.selectTextActive
                                  : styles.selectText
                              }
                            >
                              {`${candidate.studentName} - ${candidate.className} (Phụ huynh: ${candidate.parentName})`}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      {error && (
                        <Text style={styles.errorText}>{error.message}</Text>
                      )}
                    </View>
                  )}
                />
                <Controller
                  control={consultationControl}
                  name="scheduledDate"
                  rules={{ required: "Vui lòng chọn thời gian tư vấn" }}
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }) => (
                    <View style={styles.formItem}>
                      <Text style={styles.label}>Thời gian tư vấn</Text>
                      <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => {
                          setTempDate(value || new Date());
                          setShowDatePicker(true);
                        }}
                      >
                        <Text>
                          {value
                            ? `${new Date(value)
                                .getDate()
                                .toString()
                                .padStart(2, "0")}/${(
                                new Date(value).getMonth() + 1
                              )
                                .toString()
                                .padStart(2, "0")}/${new Date(
                                value
                              ).getFullYear()} ${new Date(value)
                                .getHours()
                                .toString()
                                .padStart(2, "0")}:${new Date(value)
                                .getMinutes()
                                .toString()
                                .padStart(2, "0")}`
                            : "Chọn thời gian"}
                        </Text>
                      </TouchableOpacity>

                      {showDatePicker && (
                        <DateTimePicker
                          value={tempDate}
                          mode="date"
                          display="default"
                          onChange={(event, selectedDate) => {
                            setShowDatePicker(false);
                            if (event?.type === "dismissed" || !selectedDate)
                              return;

                            const updatedDate = new Date(selectedDate);
                            setTempDate(updatedDate);
                            setShowTimePicker(true);
                          }}
                          minimumDate={new Date()} // Chỉ cho phép chọn ngày trong tương lai
                        />
                      )}

                      {showTimePicker && (
                        <DateTimePicker
                          value={tempDate}
                          mode="time"
                          display="default"
                          onChange={(event, selectedTime) => {
                            setShowTimePicker(false);
                            if (event?.type === "dismissed" || !selectedTime)
                              return;

                            const finalDate = new Date(tempDate);
                            finalDate.setHours(selectedTime.getHours());
                            finalDate.setMinutes(selectedTime.getMinutes());

                            onChange(finalDate); // Cập nhật giá trị form
                          }}
                        />
                      )}

                      {error && (
                        <Text style={styles.errorText}>{error.message}</Text>
                      )}
                    </View>
                  )}
                />

                <Controller
                  control={consultationControl}
                  name="duration"
                  rules={{ required: "Vui lòng nhập thời lượng" }}
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }) => (
                    <View style={styles.formItem}>
                      <Text style={styles.label}>Thời lượng (phút)</Text>
                      <TextInput
                        style={[styles.input, error && styles.inputError]}
                        value={value}
                        onChangeText={onChange}
                        placeholder="Nhập thời lượng (phút)"
                        keyboardType="numeric"
                      />
                      {error && (
                        <Text style={styles.errorText}>{error.message}</Text>
                      )}
                    </View>
                  )}
                />
                <Controller
                  control={consultationControl}
                  name="notes"
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }) => (
                    <View style={styles.formItem}>
                      <Text style={styles.label}>Ghi chú</Text>
                      <TextInput
                        style={[styles.input, styles.textArea]}
                        value={value}
                        onChangeText={onChange}
                        placeholder="Nhập ghi chú (tùy chọn)"
                        multiline
                        numberOfLines={2}
                      />
                      {error && (
                        <Text style={styles.errorText}>{error.message}</Text>
                      )}
                    </View>
                  )}
                />
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleConsultationSubmit(handleSubmitConsultation)}
                >
                  <Text style={styles.submitButtonText}>Tạo Lịch Tư Vấn</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.noCandidatesText}>
                Không có học sinh nào cần tư vấn
              </Text>
            )}
            <Text style={[styles.modalTitle, { marginTop: 20 }]}>
              Danh sách Lịch Tư Vấn
            </Text>
            {consultationSchedules.length > 0 ? (
              consultationSchedules.map((schedule) => (
                <View key={schedule._id} style={styles.scheduleItem}>
                  <Text>{`Học sinh: ${schedule.studentName}`}</Text>
                  <Text>{`Phụ huynh: ${schedule.parentName}`}</Text>
                  <Text>{`Thời gian: ${new Date(schedule.scheduledDate)
                    .getDate()
                    .toString()
                    .padStart(2, "0")}/${(
                    new Date(schedule.scheduledDate).getMonth() + 1
                  )
                    .toString()
                    .padStart(2, "0")}/${new Date(
                    schedule.scheduledDate
                  ).getFullYear()} ${new Date(schedule.scheduledDate)
                    .getHours()
                    .toString()
                    .padStart(2, "0")}:${new Date(schedule.scheduledDate)
                    .getMinutes()
                    .toString()
                    .padStart(2, "0")}`}</Text>
                  <Text>{`Thời lượng: ${schedule.duration} phút`}</Text>
                  <Text>{`Lý do: ${schedule.reason}`}</Text>
                  <Text>{`Trạng thái: ${
                    schedule.status === "SCHEDULED"
                      ? "Đã đặt"
                      : schedule.status === "COMPLETED"
                      ? "Hoàn thành"
                      : "Hủy"
                  }`}</Text>
                  {schedule.status === "SCHEDULED" && (
                    <View style={styles.scheduleActions}>
                      <TouchableOpacity
                        style={[
                          styles.submitButton,
                          { backgroundColor: colors.success },
                        ]}
                        onPress={() => handleCompleteConsultation(schedule._id)}
                      >
                        <Text style={styles.submitButtonText}>Hoàn thành</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.cancelButton,
                          { backgroundColor: colors.error },
                        ]}
                        onPress={() => handleOpenCancelModal(schedule._id)}
                      >
                        <Text style={styles.cancelButtonText}>Hủy</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.noCandidatesText}>
                Chưa có lịch tư vấn nào
              </Text>
            )}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setIsConsultationModalVisible(false);
                resetConsultation();
                setSelectedCampaignForConsultation(null);
              }}
            >
              <Text style={styles.cancelButtonText}>Đóng</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
      <Modal visible={isCancelModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>Hủy Lịch Tư Vấn</Text>
            <Controller
              control={cancelControl}
              name="cancelReason"
              rules={{ required: "Vui lòng nhập lý do hủy" }}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <View style={styles.formItem}>
                  <Text style={styles.label}>Lý do hủy</Text>
                  <TextInput
                    style={[
                      styles.input,
                      styles.textArea,
                      error && styles.inputError,
                    ]}
                    value={value}
                    onChangeText={onChange}
                    placeholder="Nhập lý do hủy"
                    multiline
                    numberOfLines={2}
                  />
                  {error && (
                    <Text style={styles.errorText}>{error.message}</Text>
                  )}
                </View>
              )}
            />
            <View style={styles.formActions}>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleCancelSubmit(handleSubmitCancel)}
              >
                <Text style={styles.submitButtonText}>Xác nhận Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setIsCancelModalVisible(false);
                  resetCancel();
                }}
              >
                <Text style={styles.cancelButtonText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
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
    shadowOffset: { width: 0, height: 2 },
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalContent: {
    padding: 16,
    backgroundColor: "#fff",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
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
  inputError: {
    borderColor: "#FF0000",
  },
  errorText: {
    color: "#FF0000",
    fontSize: 12,
    marginTop: 4,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  dateRange: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  dateButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.5,
  },
  select: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 15,
  },
  selectOption: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  selectOptionActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  selectText: {
    color: "#666",
    fontSize: 14,
  },
  selectTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  formActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
    gap: 8,
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
  cancelButton: {
    backgroundColor: "#ccc",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  noCandidatesText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginVertical: 20,
  },
  scheduleItem: {
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  scheduleActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
});

export default HealthCheckScreen;
