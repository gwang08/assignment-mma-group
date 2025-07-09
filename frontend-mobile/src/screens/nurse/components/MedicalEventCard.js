import React from "react";
import {View, Text, TouchableOpacity, StyleSheet} from "react-native";
import colors from "../../../styles/colors";

const MedicalEventCard = ({event, onPress}) => {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case "Emergency":
        return "#FF4757";
      case "High":
        return "#FF6B6B";
      case "Medium":
        return "#FFA502";
      case "Low":
        return "#2ED573";
      default:
        return "#747D8C";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "#FFA502";
      case "In Progress":
        return "#3742FA";
      case "Resolved":
        return "#2ED573";
      case "Referred to Hospital":
        return "#FF4757";
      default:
        return "#747D8C";
    }
  };

  return (
    <TouchableOpacity style={styles.eventCard} onPress={() => onPress(event)}>
      <View style={styles.eventHeader}>
        <Text style={styles.eventType}>{event.event_type}</Text>
        <View style={styles.badgesContainer}>
          <View
            style={[
              styles.severityBadge,
              {backgroundColor: getSeverityColor(event.severity)},
            ]}
          >
            <Text style={styles.badgeText}>{event.severity}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              {backgroundColor: getStatusColor(event.status)},
            ]}
          >
            <Text style={styles.badgeText}>{event.status}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.eventDescription} numberOfLines={2}>
        {event.description}
      </Text>
      <Text style={styles.eventStudent}>
        {typeof event.student === "object" && event.student !== null
          ? `Học sinh: ${event.student.first_name} ${event.student.last_name} - ${event.student.class_name}`
          : "Học sinh: (không có thông tin)"}
      </Text>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={styles.eventDate}>
          {new Date(event.createdAt).toLocaleDateString("vi-VN")}
        </Text>
        <Text style={styles.eventDate}>
          {typeof event.created_by === "object" && event.created_by !== null
            ? `Tạo bởi: ${event.created_by.first_name} ${event.created_by.last_name}`
            : "Tạo bởi: (Không rõ)"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  eventCard: {
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#FF6B6B",
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  eventType: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    flex: 1,
  },
  badgesContainer: {
    flexDirection: "row",
    gap: 8,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
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
  eventDescription: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    lineHeight: 20,
  },
  eventStudent: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default MedicalEventCard;
