import React from "react";
import {View, Text, TouchableOpacity, StyleSheet} from "react-native";
import colors from "../../styles/colors";

const FunctionCard = ({card, onPress}) => {
  return (
    <TouchableOpacity
      style={[styles.functionCard, {borderLeftColor: card.color}]}
      onPress={() => onPress(card.id)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardIcon}>{card.icon}</Text>
        <View style={[styles.countBadge, {backgroundColor: card.color}]}>
          <Text style={styles.countText}>{card.count}</Text>
        </View>
      </View>
      <Text style={styles.cardTitle}>{card.title}</Text>
      <Text style={styles.cardDescription}>{card.description}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  functionCard: {
    width: "47%",
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardIcon: {
    fontSize: 24,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: "center",
  },
  countText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
});

export default FunctionCard;
