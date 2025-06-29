import React from "react";
import {View, Text, ActivityIndicator, StyleSheet} from "react-native";
import colors from "../../../styles/colors";

const LoadingScreen = ({message = "Đang tải..."}) => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textSecondary,
  },
});

export default LoadingScreen;
