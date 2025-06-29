import React from "react";
import {View, Text, TouchableOpacity, Alert, StyleSheet} from "react-native";
import colors from "../../../styles/colors";

const FormPicker = ({
  label,
  value,
  onValueChange,
  options = [],
  placeholder = "Chọn...",
  required = false,
  error = false,
  title = "Chọn tùy chọn",
  message = "Vui lòng chọn:",
}) => {
  const handlePress = () => {
    Alert.alert(
      title,
      message,
      options
        .map((option) => ({
          text: option.label,
          onPress: () => onValueChange(option.value),
        }))
        .concat([{text: "Hủy", style: "cancel"}])
    );
  };

  const selectedOption = options.find((option) => option.value === value);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TouchableOpacity
        style={[styles.pickerContainer, error && styles.pickerContainerError]}
        onPress={handlePress}
      >
        <Text
          style={[styles.pickerText, !selectedOption && styles.placeholderText]}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Text style={styles.pickerButtonText}>▼</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  required: {
    color: "red",
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  pickerContainerError: {
    borderColor: "red",
  },
  pickerText: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
  },
  placeholderText: {
    color: "#999",
  },
  pickerButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default FormPicker;
