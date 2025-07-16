import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Chip } from "@react-native-material/core";
import colors from "../../../styles/colors";

const VaccinationCampaignCard = ({ campaign, onPress }) => {
  const {
    title,
    description,
    start_date,
    end_date,
    target_classes,
    vaccineDetails,
    status,
  } = campaign;

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN");
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "draft":
        return "Bản nháp";
      case "active":
        return "Đang tiến hành";
      case "completed":
        return "Đã hoàn tất";
      case "cancelled":
        return "Đã hủy";
      default:
        return "Không rõ";
    }
  };

  return (
    <View style={styles.campaignCard}>
      <TouchableOpacity onPress={() => onPress(campaign, 'viewDetails')}>
        <View style={styles.campaignHeader}>
          <Text style={styles.campaignName}>{title}</Text>
        </View>

        <Text style={styles.vaccineText}>
          {vaccineDetails?.brand || "Tên vắc-xin"} - {vaccineDetails?.dosage || "Liều lượng"}
        </Text>

        <Text style={styles.campaignDate}>
          {formatDate(start_date)} → {formatDate(end_date)}
        </Text>

        <View style={styles.classList}>
          {(target_classes || []).map((className) => (
            <Chip
              key={className}
              label={className}
              style={styles.classChip}
            />
          ))}
        </View>

        <Text style={styles.status}>{getStatusLabel(status)}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.viewListButton}
        onPress={() => onPress(campaign, 'viewList')}
      >
        <Text style={styles.viewListButtonText}>Xem danh sách</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  campaignCard: {
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#96CEB4",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    marginBottom: 12,
  },
  campaignHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  campaignName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    flex: 1,
  },
  vaccineText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  campaignDate: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 6,
  },
  classList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 6,
  },
  classChip: {
    marginRight: 6,
    marginBottom: 6,
    backgroundColor: "#E5F6F3",
  },
  status: {
    color: "green",
    fontWeight: "bold",
  },
  viewListButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  viewListButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default VaccinationCampaignCard;