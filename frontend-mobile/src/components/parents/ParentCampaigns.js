import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../styles/colors";
import { parentsAPI } from "../../services/parentsAPI";

const ParentCampaigns = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [submittingConsent, setSubmittingConsent] = useState(false);
  const [campaignResults, setCampaignResults] = useState({});
  const [consultationSchedules, setConsultationSchedules] = useState({});
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filterOptions = [
    { key: "all", label: "Tất cả", icon: "list" },
    { key: "active", label: "Đang diễn ra", icon: "play-circle" },
    { key: "pending_consent", label: "Chờ phản hồi", icon: "time" },
    { key: "completed", label: "Hoàn thành", icon: "checkmark-circle" },
    { key: "vaccination", label: "Tiêm chủng", icon: "medical" },
    { key: "checkup", label: "Khám sức khỏe", icon: "heart" },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [campaignsResponse, studentsResponse] = await Promise.all([
        parentsAPI.getCampaigns(),
        parentsAPI.getStudents(),
      ]);

      if (
        campaignsResponse.success &&
        campaignsResponse.data &&
        Array.isArray(campaignsResponse.data)
      ) {
        const validCampaigns = campaignsResponse.data.filter(
          (campaign) => campaign && campaign._id
        );
        setCampaigns(validCampaigns);

        // Load campaign results and consultation schedules for each student
        await loadCampaignDetails(validCampaigns);
      }

      if (
        studentsResponse.success &&
        studentsResponse.data &&
        Array.isArray(studentsResponse.data)
      ) {
        const studentData = studentsResponse.data
          .filter((item) => item && item.student && item.student._id)
          .map((item) => item.student);
        setStudents(studentData);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const loadCampaignDetails = async (campaigns) => {
    try {
      const results = {};
      const schedules = {};

      // Safety check for campaigns
      if (!campaigns || !Array.isArray(campaigns)) {
        setCampaignResults({});
        setConsultationSchedules({});
        return;
      }

      // Get unique student IDs from campaigns
      const studentIds = new Set();
      campaigns.forEach((campaign) => {
        if (campaign && campaign.students && Array.isArray(campaign.students)) {
          campaign.students.forEach((studentConsent) => {
            if (
              studentConsent &&
              studentConsent.student &&
              studentConsent.student._id
            ) {
              studentIds.add(studentConsent.student._id);
            }
          });
        }
      });

      // Load results and schedules for each student
      for (const studentId of studentIds) {
        try {
          const [resultsResponse, schedulesResponse] = await Promise.all([
            parentsAPI.getCampaignResults(studentId),
            parentsAPI.getConsultationSchedules(),
          ]);

          if (resultsResponse.success) {
            results[studentId] = resultsResponse.data;
          }

          if (
            schedulesResponse.success &&
            schedulesResponse.data &&
            Array.isArray(schedulesResponse.data)
          ) {
            schedules[studentId] = schedulesResponse.data.filter(
              (schedule) =>
                schedule &&
                schedule.student &&
                schedule.student._id === studentId
            );
          }
        } catch (error) {
          console.warn(
            `Failed to load details for student ${studentId}:`,
            error
          );
        }
      }

      setCampaignResults(results);
      setConsultationSchedules(schedules);
    } catch (error) {
      console.warn("Error loading campaign details:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getCampaignTypeColor = (campaign_type) => {
    const colors = {
      vaccination: "#e74c3c",
      health_check: "#3498db",
      screening: "#27ae60",
      other: "#f39c12",
    };
    return colors[campaign_type] || "#95a5a6";
  };

  const getCampaignTypeText = (campaign_type) => {
    const typeText = {
      vaccination: "Tiêm chủng",
      health_check: "Khám sức khỏe",
      screening: "Sàng lọc",
      other: "Khác",
    };
    return typeText[campaign_type] || campaign_type;
  };

  const getCampaignStatusColor = (status) => {
    const colors = {
      draft: "#95a5a6",
      active: "#27ae60",
      completed: "#3498db",
      cancelled: "#e74c3c",
    };
    return colors[status] || "#95a5a6";
  };

  const getCampaignStatusText = (status) => {
    const statusText = {
      draft: "Nháp",
      active: "Đang diễn ra",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
    };
    return statusText[status] || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa có thông tin";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const isDateInRange = (campaignDate, startDate, endDate) => {
    const date = new Date(campaignDate);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return date >= start && date <= end;
  };

  const handleViewDetails = (campaign) => {
    setSelectedCampaign(campaign);
    setIsDetailModalVisible(true);
  };


  const handleSubmitConsent = async (campaign, studentId, consentGiven) => {
    // Show confirmation dialog for declining consent
    if (!consentGiven) {
      Alert.alert(
        "Xác nhận từ chối",
        "Bạn có chắc chắn muốn từ chối tham gia chiến dịch này không?",
        [
          {
            text: "Hủy",
            style: "cancel",
          },
          {
            text: "Từ chối",
            style: "destructive",
            onPress: () => submitConsent(campaign, studentId, consentGiven),
          },
        ]
      );
    } else {
      submitConsent(campaign, studentId, consentGiven);
    }
  };

  const submitConsent = async (campaign, studentId, consentGiven) => {

    try {
      setSubmittingConsent(true);
      const consentData = {

        status: consentGiven ? "Approved" : "Declined",
        notes: consentGiven ? "Đồng ý tham gia" : "Không đồng ý tham gia",

      };

      const response = await parentsAPI.submitCampaignConsent(
        campaign._id,
        studentId,
        consentData
      );
      if (response.success) {
        Alert.alert(
          "Thành công",
          `Đã ${
            status === CAMPAIGN_CONSENT_STATUS.APPROVED ? "đồng ý" : "từ chối"
          } tham gia chiến dịch`
        );
        loadData();
      } else {
        Alert.alert("Lỗi", response.message || "Có lỗi xảy ra");
      }
    } catch (error) {
  console.log("Submit consent error:", error.response?.data || error.message);
  Alert.alert("Lỗi", error.response?.data?.message || "Có lỗi xảy ra khi gửi phản hồi");
} finally {
      setSubmittingConsent(false);
    }
  };

  const getConsentStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return colors.success;
      case "Declined":
        return colors.error;
      case "Pending":
      default:
        return colors.warning;
    }
  };

  const getConsentStatusText = (status) => {
    switch (status) {
      case "Approved":
        return "Đã đồng ý";
      case "Declined":
        return "Đã từ chối";
      case "Pending":
      default:
        return "Chờ phản hồi";
    }
  };

  const getCampaignProgress = (campaign, studentId) => {
    if (!campaign || !campaign._id || !studentId) {
      return { phase: "unknown", progress: 0, text: "Chưa rõ" };
    }

    if (!campaign.students || !Array.isArray(campaign.students)) {
      return { phase: "unknown", progress: 0, text: "Chưa rõ" };
    }

    const studentConsent = campaign.students.find(
      (sc) => sc && sc.student && sc.student._id === studentId
    );
    if (!studentConsent)
      return { phase: "unknown", progress: 0, text: "Chưa rõ" };

    const results = campaignResults[studentId] || [];
    const campaignResult = results.find(
      (r) => r && r.campaign && r.campaign._id === campaign._id
    );

    if (campaign.requires_consent) {
      if (studentConsent.status === "Pending") {
        return { phase: "consent", progress: 25, text: "Chờ xác nhận" };
      } else if (studentConsent.status === "Declined") {
        return { phase: "declined", progress: 100, text: "Đã từ chối" };
      } else if (studentConsent.status === "Approved") {
        if (campaignResult) {
          if (campaignResult.vaccination_details?.status) {
            const status = campaignResult.vaccination_details.status;
            if (status === "follow_up_needed") {
              return { phase: "follow_up", progress: 75, text: "Cần theo dõi" };
            } else {
              return { phase: "completed", progress: 100, text: "Hoàn thành" };
            }
          } else if (campaignResult.checkupDetails?.status) {
            const status = campaignResult.checkupDetails.status;
            if (status === "NEEDS_ATTENTION" || status === "CRITICAL") {
              return { phase: "follow_up", progress: 75, text: "Cần tư vấn" };
            } else {
              return { phase: "completed", progress: 100, text: "Hoàn thành" };
            }
          } else {
            return { phase: "completed", progress: 100, text: "Hoàn thành" };
          }
        } else {
          return { phase: "scheduled", progress: 50, text: "Đã lên lịch" };
        }
      }
    } else {
      // No consent required
      if (campaignResult) {
        return { phase: "completed", progress: 100, text: "Hoàn thành" };
      } else {
        return { phase: "scheduled", progress: 50, text: "Đã lên lịch" };
      }
    }

    return { phase: "unknown", progress: 0, text: "Chưa rõ" };
  };

  const getProgressColor = (phase) => {
    switch (phase) {
      case "consent":
        return colors.warning;
      case "scheduled":
        return colors.info;
      case "completed":
        return colors.success;
      case "follow_up":
        return colors.error;
      case "declined":
        return colors.textSecondary;
      default:
        return colors.textSecondary;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Chưa có thông tin";
    const date = new Date(dateString);
    return (
      date.toLocaleDateString("vi-VN") +
      " " +
      date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  const getCampaignTypeIcon = (campaign_type) => {
    switch (campaign_type) {
      case "vaccination":
        return "medical";
      case "health_check":
        return "heart";
      case "screening":
        return "pulse";
      case "other":
        return "list";
      default:
        return "medical";
    }
  };

  const getFilteredCampaigns = () => {
    if (!campaigns || !Array.isArray(campaigns)) return [];

    let filteredCampaigns = campaigns;

    // Apply filter
    if (selectedFilter !== "all") {
      filteredCampaigns = campaigns.filter((campaign) => {
        if (!campaign || !campaign._id) return false;

        switch (selectedFilter) {
          case "active":
            return campaign.status === "active";
          case "completed":
            return campaign.status === "completed";
          case "pending_consent":
            return (
              campaign.requires_consent &&
              campaign.status === "active" &&
              (campaign.students || []).some(
                (sc) => sc && sc.status === "Pending"
              )
            );
          case "vaccination":
            return campaign.campaign_type === "vaccination";
          case "checkup":
            return (
              campaign.campaign_type === "health_check" ||
              campaign.campaign_type === "screening"
            );
          default:
            return true;
        }
      });
    }

    // Sort by status: active, completed, cancelled
    const statusOrder = { active: 1, completed: 2, cancelled: 3 };

    return filteredCampaigns.sort((a, b) => {
      const aOrder = statusOrder[a.status] || 999;
      const bOrder = statusOrder[b.status] || 999;

      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }

      // If same status, sort by date (newest first)
      const aDate = new Date(a.start_date || a.date || a.createdAt);
      const bDate = new Date(b.start_date || b.date || b.createdAt);
      return bDate - aDate;
    });
  };

  const renderCampaignItem = ({ item }) => {
    // Safety check for item
    if (!item || !item._id) {
      return null;
    }

    return (
      <View style={styles.campaignCard}>
        <View style={styles.campaignHeader}>
          <View style={styles.campaignInfo}>
            <View style={styles.titleRow}>
              <Ionicons
                name={getCampaignTypeIcon(item.campaign_type)}
                size={20}
                color={getCampaignTypeColor(item.campaign_type)}
                style={styles.titleIcon}
              />
              <Text style={styles.campaignTitle}>{item.title}</Text>
            </View>
            <Text style={styles.campaignDescription} numberOfLines={2}>
              {item.description || "Không có mô tả"}
            </Text>
            <View style={styles.dateRow}>
              <Ionicons
                name="calendar"
                size={12}
                color={colors.textSecondary}
              />
              <Text style={styles.campaignDate}>
                {formatDate(item.date || item.start_date)} -{" "}
                {formatDate(item.end_date)}
              </Text>
            </View>

            {/* Consent deadline warning */}
            {item.requires_consent && item.consent_deadline && (
              <View style={styles.deadlineWarning}>
                <Ionicons name="time" size={12} color={colors.warning} />
                <Text style={styles.deadlineText}>
                  Hạn phản hồi: {formatDate(item.consent_deadline)}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.campaignBadges}>
            <View
              style={[
                styles.typeBadge,
                { backgroundColor: getCampaignTypeColor(item.campaign_type) },
              ]}
            >
              <Text style={styles.badgeText}>
                {getCampaignTypeText(item.campaign_type)}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getCampaignStatusColor(item.status) },
              ]}
            >
              <Text style={styles.badgeText}>
                {getCampaignStatusText(item.status)}
              </Text>
            </View>
          </View>
        </View>

        {/* Campaign Progress for each student */}
        {(item.students || []).length > 0 && (
          <View style={styles.progressSection}>
            <Text style={styles.progressTitle}>Tiến độ tham gia:</Text>
            {(item.students || [])
              .filter(
                (studentConsent) =>
                  studentConsent &&
                  studentConsent.student &&
                  studentConsent.student._id
              )
              .map((studentConsent) => {
                const progress = getCampaignProgress(
                  item,
                  studentConsent.student._id
                );
                const results =
                  campaignResults[studentConsent.student._id] || [];
                const campaignResult = results.find(
                  (r) => r && r.campaign && r.campaign._id === item._id
                );

                return (
                  <View
                    key={studentConsent.student._id}
                    style={styles.studentProgressRow}
                  >
                    <View style={styles.studentInfo}>
                      <Text style={styles.studentName}>
                        {studentConsent.student.first_name}{" "}
                        {studentConsent.student.last_name}
                      </Text>
                      <Text
                        style={[
                          styles.progressText,
                          { color: getProgressColor(progress.phase) },
                        ]}
                      >
                        {progress.text}
                      </Text>
                    </View>

                    {/* Campaign results summary */}
                    {campaignResult && (
                      <View style={styles.resultSummary}>
                        {/* Show vaccination details only for vaccination campaigns */}
                        {item.campaign_type === "vaccination" &&
                          campaignResult.vaccination_details && (
                            <View style={styles.resultItem}>
                              <Ionicons
                                name="medical"
                                size={12}
                                color={colors.success}
                              />
                              <Text style={styles.resultText}>
                                Đã tiêm:{" "}
                                {formatDate(
                                  campaignResult.vaccination_details
                                    .vaccinated_at
                                )}
                              </Text>
                              {campaignResult.vaccination_details.side_effects
                                ?.length > 0 && (
                                <View style={styles.sideEffectsBadge}>
                                  <Text style={styles.sideEffectsText}>
                                    Tác dụng phụ:{" "}
                                    {campaignResult.vaccination_details.side_effects.join(
                                      ", "
                                    )}
                                  </Text>
                                </View>
                              )}
                            </View>
                          )}

                        {/* Show checkup results for non-vaccination campaigns */}
                        {item.campaign_type !== "vaccination" &&
                          campaignResult.checkupDetails && (
                            <View style={styles.resultItem}>
                              <Ionicons
                                name="pulse"
                                size={12}
                                color={
                                  campaignResult.checkupDetails.status ===
                                  "HEALTHY"
                                    ? colors.success
                                    : campaignResult.checkupDetails.status ===
                                      "NEEDS_ATTENTION"
                                    ? colors.warning
                                    : colors.error
                                }
                              />
                              <Text style={styles.resultText}>
                                Kết quả:{" "}
                                {campaignResult.checkupDetails.status ===
                                "HEALTHY"
                                  ? "Bình thường"
                                  : campaignResult.checkupDetails.status ===
                                    "NEEDS_ATTENTION"
                                  ? "Cần chú ý"
                                  : "Nghiêm trọng"}
                              </Text>
                              {campaignResult.checkupDetails
                                .requiresConsultation && (
                                <View style={styles.consultationBadge}>
                                  <Text style={styles.consultationText}>
                                    Cần tư vấn
                                  </Text>
                                </View>
                              )}
                            </View>
                          )}
                      </View>
                    )}
                  </View>
                );
              })}
          </View>
        )}

        {/* Consent section - only show for pending consents */}
        {item.requires_consent &&
          item.status === "active" &&
          (item.students || []).some((sc) => sc && sc.status === "Pending") && (
            <View style={styles.consentSection}>
              <Text style={styles.consentTitle}>
                Yêu cầu xác nhận tham gia:
              </Text>


              {(item.students || [])
                .filter(
                  (sc) =>
                    sc &&
                    sc.student &&
                    sc.student._id &&
                    sc.status === "Pending"
                )
                .map((studentConsent) => (
                  <View
                    key={studentConsent.student._id}
                    style={styles.studentConsentRow}
                  >
                    <Text style={styles.studentName}>
                      {studentConsent.student.first_name}{" "}
                      {studentConsent.student.last_name}
                    </Text>
                    <View style={styles.consentButtons}>
                      <TouchableOpacity
                        style={[
                          styles.consentButton,
                          styles.acceptButton,
                          submittingConsent && styles.disabledButton,
                        ]}
                        onPress={() =>
                          handleSubmitConsent(
                            item,
                            studentConsent.student._id,
                            true
                          )
                        }
                        disabled={submittingConsent}
                      >
                        <Ionicons name="checkmark" size={16} color="white" />
                        <Text style={styles.consentButtonText}>Đồng ý</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.consentButton,
                          styles.rejectButton,
                          submittingConsent && styles.disabledButton,
                        ]}
                        onPress={() =>
                          handleSubmitConsent(
                            item,
                            studentConsent.student._id,
                            false
                          )
                        }
                        disabled={submittingConsent}
                      >
                        <Ionicons name="close" size={16} color="white" />
                        <Text style={styles.consentButtonText}>Từ chối</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

            </View>
          )}

        <View style={styles.campaignActions}>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => handleViewDetails(item)}
          >
            <Ionicons name="eye" size={16} color="white" />
            <Text style={styles.viewButtonText}>Xem chi tiết</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const filteredCampaigns = getFilteredCampaigns();

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Ionicons name="medical" size={48} color={colors.primary} />
        <Text style={styles.emptyText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Section */}
      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScrollView}
          contentContainerStyle={styles.filterContainer}
        >
          {filterOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.filterButton,
                selectedFilter === option.key && styles.activeFilterButton,
              ]}
              onPress={() => setSelectedFilter(option.key)}
            >
              <Ionicons name={option.icon} size={16} color="white" />
              <Text style={styles.filterButtonText}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredCampaigns}
        renderItem={renderCampaignItem}
        keyExtractor={(item) => item?._id || Math.random().toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="shield-outline"
              size={64}
              color={colors.lightGray}
            />
            <Text style={styles.emptyText}>Chưa có chiến dịch nào</Text>
            <Text style={styles.emptySubtext}>
              Các chiến dịch y tế sẽ được hiển thị tại đây
            </Text>
          </View>
        }
      />

      {/* Campaign Detail Modal */}
      <Modal
        visible={isDetailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi tiết chiến dịch</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsDetailModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedCampaign && (
              <ScrollView
                style={styles.modalBody}
                showsVerticalScrollIndicator={true}
              >
                <View style={styles.modalTitleRow}>
                  <Ionicons
                    name={getCampaignTypeIcon(selectedCampaign.campaign_type)}
                    size={24}
                    color={getCampaignTypeColor(selectedCampaign.campaign_type)}
                  />
                  <Text style={styles.modalCampaignTitle}>
                    {selectedCampaign.title}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Mô tả</Text>
                  <Text style={styles.detailValue}>
                    {selectedCampaign.description || "Không có mô tả"}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Loại chiến dịch</Text>
                  <View
                    style={[
                      styles.typeBadge,
                      {
                        backgroundColor: getCampaignTypeColor(
                          selectedCampaign.campaign_type
                        ),
                      },
                    ]}
                  >
                    <Text style={styles.badgeText}>
                      {getCampaignTypeText(selectedCampaign.campaign_type)}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Thời gian diễn ra</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(
                      selectedCampaign.date || selectedCampaign.start_date
                    )}{" "}
                    - {formatDate(selectedCampaign.end_date)}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Trạng thái</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: getCampaignStatusColor(
                          selectedCampaign.status
                        ),
                      },
                    ]}
                  >
                    <Text style={styles.badgeText}>
                      {getCampaignStatusText(selectedCampaign.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Lớp tham gia</Text>
                  <Text style={styles.detailValue}>
                    {selectedCampaign.target_classes?.join(", ") ||
                      "Tất cả các lớp"}
                  </Text>
                </View>

                {selectedCampaign.requires_consent && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Yêu cầu xác nhận</Text>
                    <Text style={styles.detailValue}>
                      Có (Hạn chót:{" "}
                      {formatDate(selectedCampaign.consent_deadline)})
                    </Text>
                  </View>
                )}

                {selectedCampaign.vaccineDetails && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Thông tin vaccine</Text>
                    <View style={styles.vaccineDetailsCard}>
                      <View style={styles.vaccineDetailRow}>
                        <Ionicons
                          name="medical"
                          size={16}
                          color={colors.primary}
                        />
                        <Text style={styles.vaccineDetailText}>
                          Nhãn hiệu: {selectedCampaign.vaccineDetails.brand}
                        </Text>
                      </View>
                      <View style={styles.vaccineDetailRow}>
                        <Ionicons
                          name="barcode"
                          size={16}
                          color={colors.primary}
                        />
                        <Text style={styles.vaccineDetailText}>
                          Số lô: {selectedCampaign.vaccineDetails.batchNumber}
                        </Text>
                      </View>
                      <View style={styles.vaccineDetailRow}>
                        <Ionicons
                          name="flask"
                          size={16}
                          color={colors.primary}
                        />
                        <Text style={styles.vaccineDetailText}>
                          Liều lượng: {selectedCampaign.vaccineDetails.dosage}
                        </Text>
                      </View>
                      <View style={styles.vaccineDetailRow}>
                        <Ionicons
                          name="time"
                          size={16}
                          color={colors.warning}
                        />
                        <Text style={styles.vaccineDetailText}>
                          Hạn sử dụng:{" "}
                          {formatDate(
                            selectedCampaign.vaccineDetails.expiry_date
                          )}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Student Progress in Modal */}
                {(selectedCampaign.students || []).length > 0 && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Tiến độ học sinh</Text>
                    {(selectedCampaign.students || [])
                      .filter(
                        (studentConsent) =>
                          studentConsent &&
                          studentConsent.student &&
                          studentConsent.student._id
                      )
                      .map((studentConsent) => {
                        const progress = getCampaignProgress(
                          selectedCampaign,
                          studentConsent.student._id
                        );
                        const results =
                          campaignResults[studentConsent.student._id] || [];
                        const campaignResult = results.find(
                          (r) =>
                            r &&
                            r.campaign &&
                            r.campaign._id === selectedCampaign._id
                        );

                        return (
                          <View
                            key={studentConsent.student._id}
                            style={styles.modalStudentCard}
                          >
                            <View style={styles.modalStudentHeader}>
                              <Text style={styles.modalStudentName}>
                                {studentConsent.student.first_name}{" "}
                                {studentConsent.student.last_name}
                              </Text>
                              <View
                                style={[
                                  styles.modalProgressBadge,
                                  {
                                    backgroundColor: getProgressColor(
                                      progress.phase
                                    ),
                                  },
                                ]}
                              >
                                <Text style={styles.badgeText}>
                                  {progress.text}
                                </Text>
                              </View>
                            </View>

                            {campaignResult && (
                              <View style={styles.modalResultDetails}>
                                {campaignResult.vaccination_details && (
                                  <>
                                    <Text style={styles.modalResultTitle}>
                                      Kết quả tiêm chủng:
                                    </Text>
                                    <Text style={styles.modalResultText}>
                                      Ngày tiêm:{" "}
                                      {formatDateTime(
                                        campaignResult.vaccination_details
                                          .vaccinated_at
                                      )}
                                    </Text>
                                    {campaignResult.vaccination_details
                                      .administered_by && (
                                      <Text style={styles.modalResultText}>
                                        Người thực hiện:{" "}
                                        {
                                          campaignResult.vaccination_details
                                            .administered_by
                                        }
                                      </Text>
                                    )}
                                    {campaignResult.vaccination_details
                                      .side_effects?.length > 0 && (
                                      <Text style={styles.modalResultText}>
                                        Tác dụng phụ:{" "}
                                        {campaignResult.vaccination_details.side_effects.join(
                                          ", "
                                        )}
                                      </Text>
                                    )}
                                    {campaignResult.vaccination_details
                                      .follow_up_required && (
                                      <Text
                                        style={[
                                          styles.modalResultText,
                                          { color: colors.warning },
                                        ]}
                                      >
                                        Cần theo dõi thêm
                                      </Text>
                                    )}
                                  </>
                                )}

                                {campaignResult.checkupDetails && (
                                  <>
                                    <Text style={styles.modalResultTitle}>
                                      Kết quả khám sức khỏe:
                                    </Text>
                                    <Text style={styles.modalResultText}>
                                      Tình trạng:{" "}
                                      {campaignResult.checkupDetails.status ===
                                      "HEALTHY"
                                        ? "Bình thường"
                                        : campaignResult.checkupDetails
                                            .status === "NEEDS_ATTENTION"
                                        ? "Cần chú ý"
                                        : "Nghiêm trọng"}
                                    </Text>
                                    {campaignResult.checkupDetails.findings && (
                                      <Text style={styles.modalResultText}>
                                        Phát hiện:{" "}
                                        {campaignResult.checkupDetails.findings}
                                      </Text>
                                    )}
                                    {campaignResult.checkupDetails
                                      .recommendations && (
                                      <Text style={styles.modalResultText}>
                                        Khuyến nghị:{" "}
                                        {
                                          campaignResult.checkupDetails
                                            .recommendations
                                        }
                                      </Text>
                                    )}
                                    {campaignResult.checkupDetails
                                      .requiresConsultation && (
                                      <Text
                                        style={[
                                          styles.modalResultText,
                                          { color: colors.error },
                                        ]}
                                      >
                                        Cần tư vấn thêm
                                      </Text>
                                    )}
                                  </>
                                )}

                                {campaignResult.notes && (
                                  <Text style={styles.modalResultText}>
                                    Ghi chú: {campaignResult.notes}
                                  </Text>
                                )}
                              </View>
                            )}
                          </View>
                        );
                      })}
                  </View>
                )}

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Hướng dẫn</Text>
                  <Text style={styles.detailValue}>
                    {selectedCampaign.instructions ||
                      "Không có hướng dẫn đặc biệt"}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Ngày tạo</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(selectedCampaign.createdAt)}
                  </Text>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const CAMPAIGN_CONSENT_STATUS = {
  PENDING: "Pending",
  APPROVED: "Approved",
  DECLINED: "Declined",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContainer: {
    padding: 20,
  },
  campaignCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  campaignHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  campaignInfo: {
    flex: 1,
    marginRight: 10,
  },
  campaignTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 5,
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  titleIcon: {
    marginRight: 8,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  deadlineWarning: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.errorLight,
    borderRadius: 4,
  },
  deadlineText: {
    fontSize: 11,
    color: colors.warning,
    fontWeight: "600",
    marginLeft: 4,
  },
  campaignDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 5,
  },
  campaignDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  campaignBadges: {
    alignItems: "flex-end",
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 5,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  consentSection: {
    backgroundColor: colors.lightGray,
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  consentTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 10,
  },
  studentConsentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },
  studentName: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  consentButtons: {
    flexDirection: "row",
  },
  consentButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginLeft: 5,
  },
  acceptButton: {
    backgroundColor: colors.success,
  },
  rejectButton: {
    backgroundColor: colors.error,
  },
  consentButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 3,
  },
  disabledButton: {
    opacity: 0.5,
  },
  consentStatus: {
    alignItems: "flex-end",
  },
  consentDate: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  noStudentsText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 5,
  },
  progressSection: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 10,
  },
  studentProgressRow: {
    marginBottom: 15,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  studentInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
  },
  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: colors.lightGray,
    borderRadius: 3,
    marginRight: 8,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressPercent: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "600",
    minWidth: 35,
  },
  resultSummary: {
    marginTop: 8,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  resultText: {
    fontSize: 11,
    color: colors.text,
    marginLeft: 6,
    flex: 1,
  },
  sideEffectsBadge: {
    backgroundColor: colors.errorLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  sideEffectsText: {
    fontSize: 10,
    color: colors.error,
    fontWeight: "600",
  },
  consultationBadge: {
    backgroundColor: colors.warning,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  consultationText: {
    fontSize: 10,
    color: "white",
    fontWeight: "600",
  },
  campaignActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  viewButton: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
  },
  viewButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textSecondary,
    marginTop: 15,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    width: "90%",
    height: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    padding: 20,
  },
  modalCampaignTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    textAlign: "center",
    marginBottom: 20,
    flex: 1,
    marginLeft: 8,
  },
  modalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  vaccineDetailsCard: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  vaccineDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  vaccineDetailText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  modalStudentCard: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  modalStudentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modalStudentName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    flex: 1,
  },
  modalProgressBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modalResultDetails: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  modalResultTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  modalResultText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  filterSection: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  filterScrollView: {
    flexDirection: "row",
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 15,
    marginRight: 10,
    backgroundColor: colors.secondary,
  },
  activeFilterButton: {
    backgroundColor: colors.success,
  },
  filterButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 5,
  },
});

export default ParentCampaigns;
