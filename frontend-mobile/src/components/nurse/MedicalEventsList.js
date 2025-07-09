import React from "react";
import {View, Text, StyleSheet} from "react-native";
import colors from "../../styles/colors";

const MedicalEventsList = ({events}) => {
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

  if (!events?.length) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>Không có sự kiện y tế gần đây</Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Sự Kiện Y Tế Gần Đây</Text>
      <View style={styles.eventsContainer}>
        {events.slice(0, 4).map((event, index) => (
          <View key={event._id || index} style={styles.eventItem}>
            <View style={styles.eventHeader}>
              <Text style={styles.eventType}>{event.event_type}</Text>
              <View
                style={[
                  styles.severityBadge,
                  {backgroundColor: getSeverityColor(event.severity)},
                ]}
              >
                <Text style={styles.severityText}>{event.severity}</Text>
              </View>
            </View>
            <Text style={styles.eventDescription}>{event.description}</Text>
            <Text style={styles.eventStudent}>
              Học sinh: {event.student?.first_name} {event.student?.last_name} -{" "}
              {event.student?.class_name}
            </Text>
            <Text style={styles.eventDate}>
              {new Date(event.createdAt).toLocaleDateString("vi-VN")}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 15,
  },
  eventsContainer: {
    gap: 10,
  },
  eventItem: {
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  eventType: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  severityText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  eventDescription: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 5,
  },
  eventStudent: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 3,
  },
  eventDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyState: {
    backgroundColor: colors.surface,
    padding: 30,
    borderRadius: 10,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
  },
});

export default MedicalEventsList;
