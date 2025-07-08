import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Avatar } from "react-native-paper";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import colors from "../../styles/colors";

const StudentHealthProfile = () => {
  const { user } = useAuth();
  const [healthProfile, setHealthProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHealthProfile = async () => {
    try {
      const res = await api.get("/student/health-profile");
      if (res.data.success) {
        setHealthProfile(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching health profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Đang tải thông tin sức khỏe...</Text>
      </View>
    );
  }

  if (!healthProfile) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyCard}>
          <Avatar.Icon
            size={80}
            icon="alert"
            style={{ backgroundColor: colors.warning }}
          />
          <Text style={styles.emptyTitle}>Chưa có hồ sơ sức khỏe</Text>
          <Text style={styles.emptyDescription}>
            Vui lòng liên hệ phụ huynh hoặc y tá trường để tạo hồ sơ.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerIcon}>🏥</Text>
        <Text style={styles.title}>Hồ sơ sức khỏe của tôi</Text>
        <Text style={styles.subtitle}>Thông tin y tế cá nhân</Text>
      </View>

      {/* Thông tin cá nhân */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>👤</Text>
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
        </View>
        <View style={styles.infoGrid}>
          <View style={styles.infoRow}>
            <View style={styles.iconLabelContainer}>
              <Text style={styles.icon}>👨‍🎓</Text>
              <Text style={styles.label}>Họ tên:</Text>
            </View>
            <Text style={styles.value}>
              {user?.first_name} {user?.last_name}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconLabelContainer}>
              <Text style={styles.icon}>👁</Text>
              <Text style={styles.label}>Thị lực:</Text>
            </View>
            <Text style={[styles.value, { color: colors.success }]}>
              {healthProfile.vision_status || "Chưa kiểm tra"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconLabelContainer}>
              <Text style={styles.icon}>👂</Text>
              <Text style={styles.label}>Thính lực:</Text>
            </View>
            <Text style={[styles.value, { color: colors.success }]}>
              {healthProfile.hearing_status || "Chưa kiểm tra"}
            </Text>
          </View>
        </View>
      </View>

      {/* Dị ứng */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>💊</Text>
          <Text style={styles.sectionTitle}>Dị ứng</Text>
        </View>
        <View style={styles.contentContainer}>
          {healthProfile.allergies.length > 0 ? (
            <View style={styles.listContainer}>
              {healthProfile.allergies.map((item, idx) => (
                <View key={idx} style={styles.allergyItem}>
                  <View style={styles.allergyBadge}>
                    <Text style={styles.allergyIcon}>⚠️</Text>
                    <Text style={styles.allergyText}>{item}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateIcon}>✅</Text>
              <Text style={styles.emptyStateText}>
                Không có dị ứng nào được ghi nhận
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Tiền sử bệnh */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>📝</Text>
          <Text style={styles.sectionTitle}>Tiền sử bệnh</Text>
        </View>
        <View style={styles.contentContainer}>
          {healthProfile.medical_history.length > 0 ? (
            <View style={styles.listContainer}>
              {healthProfile.medical_history.map((item, idx) => (
                <View key={idx} style={styles.historyItem}>
                  <Text style={styles.historyBullet}>•</Text>
                  <Text style={styles.historyText}>{item}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateIcon}>🎉</Text>
              <Text style={styles.emptyStateText}>Không có tiền sử bệnh</Text>
            </View>
          )}
        </View>
      </View>

      {/* Lịch sử tiêm chủng */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>🛡️</Text>
          <Text style={styles.sectionTitle}>Lịch sử tiêm chủng</Text>
        </View>
        <View style={styles.contentContainer}>
          {healthProfile.vaccination_records.length > 0 ? (
            <View style={styles.vaccineContainer}>
              {healthProfile.vaccination_records.map((vaccine, idx) => (
                <View key={idx} style={styles.vaccineCard}>
                  <View style={styles.vaccineHeader}>
                    <Text style={styles.vaccineIcon}>💉</Text>
                    <Text style={styles.vaccineName}>
                      {vaccine.vaccine_name}
                    </Text>
                    <View style={styles.doseBadge}>
                      <Text style={styles.doseText}>
                        Mũi {vaccine.dose_number}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.vaccineDetails}>
                    <View style={styles.vaccineDetailItem}>
                      <Text style={styles.detailLabel}>📅 Ngày tiêm:</Text>
                      <Text style={styles.detailValue}>
                        {new Date(vaccine.date_administered).toLocaleDateString(
                          "vi-VN"
                        )}
                      </Text>
                    </View>

                    <View style={styles.vaccineDetailItem}>
                      <Text style={styles.detailLabel}>👨‍⚕️ Người tiêm:</Text>
                      <Text style={styles.detailValue}>
                        {vaccine.administered_by}
                      </Text>
                    </View>

                    {vaccine.notes && (
                      <View style={styles.vaccineDetailItem}>
                        <Text style={styles.detailLabel}>📝 Ghi chú:</Text>
                        <Text style={styles.detailValue}>{vaccine.notes}</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateIcon}>💉</Text>
              <Text style={styles.emptyStateText}>
                Chưa có dữ liệu tiêm chủng
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.lastUpdateLabel}>🕒 Cập nhật lần cuối:</Text>
        <Text style={styles.lastUpdateValue}>
          {new Date(healthProfile.updatedAt).toLocaleString("vi-VN")}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: 20,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginVertical: 12,
  },
  emptyDescription: {
    textAlign: "center",
    color: colors.textSecondary,
    lineHeight: 24,
  },
  header: {
    backgroundColor: colors.surface,
    margin: 16,
    marginBottom: 8,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  section: {
    backgroundColor: colors.surface,
    margin: 16,
    marginTop: 8,
    borderRadius: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  contentContainer: {
    padding: 16,
  },
  infoGrid: {
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "600",
    minWidth: 120,
    marginRight: 12,
  },
  infoValue: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  statusContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-end",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  listContainer: {
    gap: 8,
  },
  allergyItem: {
    marginBottom: 4,
  },
  allergyBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.error + "10",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error + "30",
  },
  allergyIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  allergyText: {
    fontSize: 14,
    color: colors.error,
    fontWeight: "500",
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 4,
  },
  historyBullet: {
    fontSize: 16,
    color: colors.primary,
    marginRight: 8,
    marginTop: 2,
  },
  historyText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  emptyStateContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyStateIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
  },
  vaccineContainer: {
    gap: 12,
  },
  vaccineCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  vaccineHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  vaccineIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  vaccineName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    flex: 1,
  },
  doseBadge: {
    backgroundColor: colors.info + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  doseText: {
    fontSize: 12,
    color: colors.info,
    fontWeight: "600",
  },
  vaccineDetails: {
    gap: 6,
  },
  vaccineDetailItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  detailLabel: {
    fontSize: 12,
    color: colors.text,
    fontWeight: "600",
    width: 100,
  },
  detailValue: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },
  footer: {
    backgroundColor: colors.surface,
    margin: 16,
    marginTop: 8,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  lastUpdateLabel: {
    fontSize: 12,
    color: colors.text,
    fontWeight: "600",
    marginBottom: 4,
  },
  lastUpdateValue: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: "italic",
  },
  infoLabelContainer: {
    minWidth: 110,
  },
  infoValueContainer: {
    flex: 1,
    alignItems: "flex-start",
  },
  iconLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: 120,
  },
  icon: {
    marginRight: 6,
    fontSize: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text,
  },
  value: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
    textAlign: "left",
  },
});

export default StudentHealthProfile;
