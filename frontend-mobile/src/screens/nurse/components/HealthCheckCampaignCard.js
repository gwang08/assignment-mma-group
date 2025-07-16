import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  ActivityIndicator,
} from "react-native";
import moment from "moment";
import colors from "../../../styles/colors";
import nurseAPI from "../../../services/nurseApi";

const HealthCheckCampaignCard = ({ campaign, onPress, onEdit, onAddResult, onScheduleConsultation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [eligibleStudents, setEligibleStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getStatusInfo = () => {
    const now = moment().utcOffset("+07:00");
    console.log("Now:", now.format(), "Start:", moment(campaign.start_date).utcOffset("+07:00").format(), 
      "End:", moment(campaign.end_date).utcOffset("+07:00").format(), "Status:", campaign.status);

    switch (campaign.status) {
      case "draft":
        return { text: "Bản nháp", color: "#FFA500" };
      case "active":
        return { text: "Đang diễn ra", color: "#2ED573" };
      case "completed":
        return { text: "Đã hoàn thành", color: "#17A2B8" };
      case "cancelled":
        return { text: "Hủy", color: "#6C757D" };
      default:
        return { text: "Không xác định", color: "#6C757D" };
    }
  };

  const statusInfo = getStatusInfo();

  const handlePrepareStudentList = async () => {
    setLoading(true);
    setError(null);
    try {
      const studentsResponse = await nurseAPI.getStudents();
      const students = studentsResponse.success && Array.isArray(studentsResponse.data) 
        ? studentsResponse.data 
        : [];

      const targetClasses = campaign.target_classes || [];
      let filteredStudents = [];

      if (targetClasses.includes("all_grades")) {
        filteredStudents = students;
      } else if (targetClasses.some((tc) => tc.startsWith("grade_"))) {
        const grades = targetClasses
          .filter((tc) => tc.startsWith("grade_"))
          .map((tc) => tc.replace("grade_", ""));
        filteredStudents = students.filter((student) => {
          const match = student.class_name.match(/^(\d+)/);
          return match && grades.includes(match[1]);
        });
      } else {
        filteredStudents = students.filter((student) =>
          targetClasses.includes(student.class_name)
        );
      }

      const consentsResponse = await nurseAPI.getCampaignConsents(campaign._id);
      const consents = consentsResponse.success && Array.isArray(consentsResponse.data) 
        ? consentsResponse.data 
        : [];

      const studentsWithConsent = filteredStudents.map((student) => {
        const consent = consents.find(
          (c) => c.student._id === student._id
        );
        const consentStatus = consent
          ? consent.status
          : campaign.requires_consent
          ? "Pending"
          : "Approved";
        return {
          ...student,
          consentStatus,
          confirmed: consentStatus === "Approved" || !campaign.requires_consent,
        };
      });

      setEligibleStudents(studentsWithConsent);
      setModalVisible(true);
    } catch (err) {
      setError("Không thể tải danh sách học sinh. Vui lòng thử lại.");
      console.error("Error fetching student list:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleConsultation = () => {
    if (onScheduleConsultation) {
      onScheduleConsultation(campaign); // Gọi hàm từ parent nếu được cung cấp
    } else {
      console.warn("Prop onScheduleConsultation chưa được định nghĩa");
    }
  };

  const renderStudentItem = ({ item }) => (
    <View style={styles.studentItem}>
      <Text style={styles.studentName}>
        {item.first_name} {item.last_name}
      </Text>
      <Text style={styles.studentClass}>{item.class_name}</Text>
      <Text style={styles.studentDob}>
        Ngày sinh: {moment(item.dateOfBirth).format("DD/MM/YYYY")}
      </Text>
      <Text
        style={[
          styles.studentConsent,
          {
            color:
              item.consentStatus === "Approved"
                ? colors.success
                : item.consentStatus === "Declined"
                ? colors.error
                : item.consentStatus === "Pending"
                ? colors.warning
                : colors.textSecondary,
          },
        ]}
      >
        Trạng thái đồng ý: {item.consentStatus === "Approved" ? "Đã đồng ý" : 
                          item.consentStatus === "Declined" ? "Từ chối" : 
                          item.consentStatus === "Pending" ? "Đang chờ" : "Không yêu cầu"}
      </Text>
      <Text
        style={[
          styles.studentConfirmed,
          { color: item.confirmed ? colors.success : colors.warning },
        ]}
      >
        Có thể tham gia: {item.confirmed ? "Có" : "Đang chờ phản hồi"}
      </Text>
    </View>
  );

  return (
    <View>
      <TouchableOpacity
        style={styles.campaignCard}
        onPress={() => onPress(campaign)}
      >
        <View style={styles.campaignHeader}>
          <Text style={styles.campaignName}>{campaign.title}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => onEdit(campaign)}
            >
              <Text style={styles.editButtonText}>Chỉnh sửa</Text>
            </TouchableOpacity>
            {campaign.status !== "draft" && (
              <>
                <TouchableOpacity
                  style={styles.studentListButton}
                  onPress={handlePrepareStudentList}
                >
                  <Text style={styles.studentListButtonText}>Xem DS HS</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.addResultButton}
                  onPress={() => onAddResult(campaign)}
                >
                  <Text style={styles.addResultButtonText}>Ghi Kết Quả</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.scheduleButton}
                  onPress={handleScheduleConsultation}
                >
                  <Text style={styles.scheduleButtonText}>Đặt Lịch Tư Vấn</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
        <Text style={styles.campaignType}>
          Loại: {campaign.campaign_type || "Kiểm tra sức khỏe"}
        </Text>
        <Text style={styles.campaignDescription} numberOfLines={2}>
          {campaign.description}
        </Text>
        <Text style={styles.campaignDate}>
          Thời gian: {moment(campaign.start_date).format("DD/MM/YYYY")} -{" "}
          {moment(campaign.end_date).format("DD/MM/YYYY")}
        </Text>
        <Text style={styles.campaignClasses}>
          Lớp đối tượng: {(campaign.target_classes || []).join(", ") || "Không xác định"}
        </Text>
        <Text style={styles.campaignStatus}>
          Trạng thái: {statusInfo.text}
        </Text>
        <Text style={styles.campaignConsent}>
          Yêu cầu đồng ý: {campaign.requires_consent ? "Có" : "Không"}
        </Text>
        {campaign.requires_consent && campaign.consent_deadline && (
          <Text style={styles.campaignConsentDeadline}>
            Hạn đồng ý: {moment(campaign.consent_deadline).format("DD/MM/YYYY")}
          </Text>
        )}
        <Text style={styles.campaignInstructions} numberOfLines={2}>
          Hướng dẫn: {campaign.instructions || "Không có hướng dẫn"}
        </Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Danh sách học sinh tham gia khám</Text>
            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : (
              <>
                <Text style={styles.summaryText}>
                  Tổng số học sinh đủ điều kiện: {eligibleStudents.length}
                </Text>
                <Text style={styles.summaryText}>
                  Số học sinh được đồng ý: {
                    eligibleStudents.filter((s) => s.confirmed).length
                  }
                </Text>
                <FlatList
                  data={eligibleStudents}
                  renderItem={renderStudentItem}
                  keyExtractor={(item) => item._id}
                  style={styles.studentList}
                />
              </>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  campaignCard: {
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#F39C12",
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    marginBottom: 10,
  },
  campaignHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  campaignName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 8,
  },
  editButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: "flex-end",
  },
  editButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  studentListButton: {
    backgroundColor: "#28a745",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: "flex-end",
  },
  studentListButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  addResultButton: {
    backgroundColor: "#17a2b8",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: "flex-end",
  },
  addResultButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  scheduleButton: {
    backgroundColor: "#6c757d",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: "flex-end",
  },
  scheduleButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  campaignType: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
  },
  campaignDescription: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    lineHeight: 20,
  },
  campaignDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  campaignClasses: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  campaignStatus: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  campaignConsent: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  campaignConsentDeadline: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  campaignInstructions: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 18,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 15,
  },
  studentList: {
    marginTop: 10,
  },
  studentItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
  },
  studentClass: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  studentDob: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  studentConsent: {
    fontSize: 14,
    marginTop: 5,
  },
  studentConfirmed: {
    fontSize: 14,
    marginTop: 5,
  },
  summaryText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: "center",
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: "center",
    marginTop: 20,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default HealthCheckCampaignCard;