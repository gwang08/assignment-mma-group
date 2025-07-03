import React from "react";
import {View, Text, TouchableOpacity, StyleSheet} from "react-native";
import colors from "../../../styles/colors";

const MedicineRequestCard = ({request, onPress}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "#FFA502";
      case "Approved":
        return "#2ED573";
      case "Rejected":
        return "#FF4757";
      case "Completed":
        return "#3742FA";
      default:
        return "#747D8C";
    }
  };

  return (
    <TouchableOpacity
      style={styles.requestCard}
      onPress={() => onPress(request)}
    >
      <View style={styles.requestHeader}>
        <Text style={styles.medicineName}>{request.medicine_name}</Text>
        <View
          style={[
            styles.statusBadge,
            {backgroundColor: getStatusColor(request.status)},
          ]}
        >
          <Text style={styles.badgeText}>{request.status}</Text>
        </View>
      </View>
      <Text style={styles.requestReason} numberOfLines={2}>
        {request.reason}
      </Text>
      <Text style={styles.requestStudent}>
        Học sinh: {request.student?.first_name} {request.student?.last_name} -{" "}
        {request.student?.class_name}
      </Text>
      <Text style={styles.requestDate}>
        {new Date(request.createdAt).toLocaleDateString("vi-VN")}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  requestCard: {
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#4ECDC4",
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  medicineName: {
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
  requestReason: {
    fontSize: 14,
    color: "#4ECDC4",
    marginBottom: 8,
    lineHeight: 20,
  },
  requestStudent: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default MedicineRequestCard;
