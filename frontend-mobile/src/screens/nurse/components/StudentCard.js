import React from "react";
import {View, Text, TouchableOpacity, StyleSheet} from "react-native";
import colors from "../../../styles/colors";

function StudentCard({student, onPress}) {
  return (
    <TouchableOpacity style={styles.studentCard} onPress={onPress}>
      <View style={styles.studentHeader}>
        <Text style={styles.studentName}>
          {student.first_name} {student.last_name}
        </Text>
      </View>
      <Text style={styles.studentClass}>Lớp: {student.class_name}</Text>
      <Text style={styles.studentGender}>Giới tính: {student.gender}</Text>
      <Text style={styles.studentDate}>
        Ngày sinh: {new Date(student.dateOfBirth).toLocaleDateString("vi-VN")}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  studentCard: {
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#45B7D1",
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    marginBottom: 15,
  },
  studentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  studentName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  studentClass: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  studentGender: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  studentDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default StudentCard;
