import React from "react";
import {View, Text, TouchableOpacity, StyleSheet} from "react-native";
import colors from "../../../styles/colors";

const ScreenHeader = ({title, onBack, onAdd, backgroundColor = "#96CEB4"}) => {
  return (
    <View style={[styles.header, {backgroundColor}]}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backText}>← Quay lại</Text>
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
      {onAdd ? (
        <TouchableOpacity onPress={onAdd} style={styles.addButton}>
          <Text style={styles.addText}>+</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 40,
  },
  backButton: {
    padding: 5,
    color: "#fff",
  },
  backText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    textAlign: "center",
  },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(236, 236, 236, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  addText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  placeholder: {
    width: 30,
  },
});

export default ScreenHeader;
