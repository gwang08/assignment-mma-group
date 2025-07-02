import React from "react";
import { View, StyleSheet } from "react-native";
import ParentNavigation from "./ParentNavigation";
import colors from "../styles/colors";

const ParentLayout = ({ children, navigation, activeScreen = "Dashboard" }) => {
  return (
    <View style={styles.container}>
      <ParentNavigation navigation={navigation} activeScreen={activeScreen} />
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
});

export default ParentLayout;
