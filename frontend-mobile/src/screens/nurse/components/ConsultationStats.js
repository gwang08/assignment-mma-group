import React from "react";
import {View, Text, StyleSheet} from "react-native";
import colors from "../../../styles/colors";

function ConsultationStats({consultations}) {
  return (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{consultations.length}</Text>
        <Text style={styles.statLabel}>Tổng Lịch Tư Vấn</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>
          {consultations.filter((c) => c.status === "Scheduled").length}
        </Text>
        <Text style={styles.statLabel}>Đã Lên Lịch</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>
          {consultations.filter((c) => c.status === "Completed").length}
        </Text>
        <Text style={styles.statLabel}>Đã Hoàn Thành</Text>
      </View>
    </View>
  );
}

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
    color: "#DDA0DD",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: "#DDA0DD",
    textAlign: "center",
  },
});

export default ConsultationStats;
