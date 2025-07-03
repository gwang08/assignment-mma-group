import React from "react";
import {View, Text, StyleSheet} from "react-native";
import colors from "../../styles/colors";

const DashboardHeader = ({user}) => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Trang Y Tá</Text>
      <Text style={styles.subtitle}>Quản lý sức khỏe học sinh</Text>
      <Text style={styles.welcomeText}>
        Xin chào, {user?.first_name} {user?.last_name}!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.primaryLight,
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "600",
  },
});

export default DashboardHeader;
