import React from "react";
import {View, Text, StyleSheet} from "react-native";
import colors from "../../../styles/colors";

const NurseProfileHeader = ({userProfile}) => (
  <View style={styles.profileHeader}>
    <View style={styles.avatarContainer}>
      <Text style={styles.avatarText}>
        {userProfile?.first_name?.charAt(0)}
        {userProfile?.last_name?.charAt(0)}
      </Text>
    </View>
    <View style={styles.profileInfo}>
      <Text style={styles.profileName}>
        {userProfile?.first_name} {userProfile?.last_name}
      </Text>
      <Text style={styles.profileRole}>Y tá</Text>
      <Text style={styles.profileUsername}>@{userProfile?.username}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "bold",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "600",
    marginBottom: 2,
  },
  profileUsername: {
    fontSize: 14,
    color: "#7F8C8D",
  },
});

export default NurseProfileHeader;
