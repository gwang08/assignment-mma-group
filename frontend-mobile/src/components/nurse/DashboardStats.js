import React from "react";
import {View, Text, StyleSheet} from "react-native";
import colors from "../../styles/colors";

const DashboardStats = ({dashboardData}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Thống Kê Tổng Quan</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {dashboardData?.dashboardStats?.activeEvents || 0}
          </Text>
          <Text style={styles.statLabel}>Sự Kiện Đang Xử Lý</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {dashboardData?.dashboardStats?.pendingRequests || 0}
          </Text>
          <Text style={styles.statLabel}>Yêu Cầu Chờ Xử Lý</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: "row",
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 20,
  },
});

export default DashboardStats;
