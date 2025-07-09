import React from "react";
import {View, Text, StyleSheet} from "react-native";
import colors from "../../../styles/colors";

const MedicineRequestStats = ({requests = []}) => {
  return (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{requests.length}</Text>
        <Text style={styles.statLabel}>Tổng Yêu Cầu</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>
          {requests.filter((r) => r.status === "pending").length}
        </Text>
        <Text style={styles.statLabel}>Chờ Xử Lý</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>
          {requests.filter((r) => r.status === "completed").length}
        </Text>
        <Text style={styles.statLabel}>Hoàn Thành</Text>
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
    color: colors.primary,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: colors.primary,
    textAlign: "center",
  },
});

export default MedicineRequestStats;
