import React from "react";
import {View, Text, StyleSheet} from "react-native";
import colors from "../../styles/colors";

const MedicineRequestsList = ({requests}) => {
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

  if (!requests?.length) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>Không có yêu cầu thuốc gần đây</Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Yêu Cầu Thuốc Gần Đây</Text>
      <View style={styles.requestsContainer}>
        {requests.slice(0, 4).map((request, index) => (
          <View key={request._id || index} style={styles.requestItem}>
            <View style={styles.requestHeader}>
              <Text style={styles.requestMedicine}>
                {request.medicine_name}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  {backgroundColor: getStatusColor(request.status)},
                ]}
              >
                <Text style={styles.statusText}>{request.status}</Text>
              </View>
            </View>
            <Text style={styles.requestReason}>{request.reason}</Text>
            <Text style={styles.requestStudent}>
              Học sinh: {request.student?.first_name}{" "}
              {request.student?.last_name} - {request.student?.class_name}
            </Text>
            <Text style={styles.requestDate}>
              {new Date(request.createdAt).toLocaleDateString("vi-VN")}
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
  requestsContainer: {
    gap: 10,
  },
  requestItem: {
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  requestMedicine: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  requestReason: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 5,
  },
  requestStudent: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 3,
  },
  requestDate: {
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

export default MedicineRequestsList;
