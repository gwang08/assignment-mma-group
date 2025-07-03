import React from "react";
import {View, Text, TouchableOpacity, StyleSheet} from "react-native";
import colors from "../../../styles/colors";

const HealthCheckCampaignCard = ({campaign, onPress}) => {
  const isActive = new Date(campaign.date) > new Date();

  return (
    <TouchableOpacity
      style={styles.campaignCard}
      onPress={() => onPress(campaign)}
    >
      <View style={styles.campaignHeader}>
        <Text style={styles.campaignName}>{campaign.title}</Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: isActive ? "#2ED573" : "#FF4757",
            },
          ]}
        >
          <Text style={styles.badgeText}>
            {isActive ? "Đang diễn ra" : "Đã kết thúc"}
          </Text>
        </View>
      </View>
      <Text style={styles.campaignType}>Loại: {campaign.type}</Text>
      <Text style={styles.campaignDescription} numberOfLines={2}>
        {campaign.description}
      </Text>
      <Text style={styles.campaignDate}>
        {new Date(campaign.date).toLocaleDateString("vi-VN")}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
  },
});

export default HealthCheckCampaignCard;
