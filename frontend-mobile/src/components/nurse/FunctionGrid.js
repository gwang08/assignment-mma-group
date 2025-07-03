import React from "react";
import {View, Text, StyleSheet} from "react-native";
import FunctionCard from "./FunctionCard";
import colors from "../../styles/colors";

const FunctionGrid = ({functionCards, onFunctionPress}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Chức Năng Quản Lý</Text>
      <View style={styles.functionGrid}>
        {functionCards.map((card) => (
          <FunctionCard key={card.id} card={card} onPress={onFunctionPress} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 15,
  },
  functionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
  },
});

export default FunctionGrid;
