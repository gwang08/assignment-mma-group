import React from "react";
import {View, Text, TouchableOpacity, StyleSheet} from "react-native";
import colors from "../../../styles/colors";

const ConsultationCard = ({consultation, onPress}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Scheduled":
        return "#3742FA";
      case "Completed":
        return "#2ED573";
      case "Cancelled":
        return "#FF4757";
      case "No Show":
        return "#FFA502";
      default:
        return "#747D8C";
    }
  };

  return (
    <TouchableOpacity
      style={styles.consultationCard}
      onPress={() => onPress(consultation)}
    >
      <View style={styles.consultationHeader}>
        <Text style={styles.studentName}>
          {consultation.student?.first_name} {consultation.student?.last_name}
        </Text>
        <View
          style={[
            styles.statusBadge,
            {backgroundColor: getStatusColor(consultation.status)},
          ]}
        >
          <Text style={styles.badgeText}>{consultation.status}</Text>
        </View>
      </View>
      <Text style={styles.consultationReason} numberOfLines={2}>
        {consultation.reason}
      </Text>
      <Text style={styles.consultationDate}>
        {new Date(consultation.scheduled_date).toLocaleDateString("vi-VN")} -{" "}
        {consultation.scheduled_time}
      </Text>
      <Text style={styles.consultationClass}>
        Lớp: {consultation.student?.class_name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  consultationCard: {
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#DDA0DD",
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  consultationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  studentName: {
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
  consultationReason: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    lineHeight: 20,
  },
  consultationDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  consultationClass: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default ConsultationCard;
