import React from "react";
import {View, Text, StyleSheet} from "react-native";
import colors from "../../../styles/colors";

const MedicalEventStats = ({events = []}) => {
  return (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{events.length}</Text>
        <Text style={styles.statLabel}>Tổng Sự Kiện</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>
          {events.filter((e) => e.status === "Open").length}
        </Text>
        <Text style={styles.statLabel}>Đang Xử Lý</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>
          {events.filter((e) => e.severity === "Emergency").length}
        </Text>
        <Text style={styles.statLabel}>Khẩn Cấp</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: "row",
    padding: 20,
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FF6B6B",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: "#FF6B6B",
    textAlign: "center",
  },
});

export default MedicalEventStats;
