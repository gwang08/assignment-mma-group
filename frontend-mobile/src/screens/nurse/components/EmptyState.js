import React from "react";
import {View, Text, StyleSheet} from "react-native";
import colors from "../../../styles/colors";

const EmptyState = ({message = "Không có dữ liệu"}) => {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyState: {
    backgroundColor: colors.surface,
    padding: 40,
    borderRadius: 12,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
  },
});

export default EmptyState;
