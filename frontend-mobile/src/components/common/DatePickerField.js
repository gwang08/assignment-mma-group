import React, {useState} from "react";
import {View, Text, TouchableOpacity, StyleSheet} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import CalendarPicker from "./CalendarPicker";
import colors from "../../styles/colors";

const DatePickerField = ({
  value,
  placeholder,
  onDateChange,
  dateRange = "all", // 'all', 'future', 'past'
  title = "Chọn ngày",
  style,
  fieldStyle,
  disabled = false,
  includeToday = true, // Flag to control whether today's date is selectable
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const formatDateForDisplay = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("vi-VN");
  };

  const handleDateConfirm = (selectedDate) => {
    onDateChange(selectedDate);
    setModalVisible(false);
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[
          styles.datePickerField,
          disabled && styles.disabled,
          fieldStyle,
        ]}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
      >
        <Text
          style={[
            styles.datePickerText,
            !value && styles.datePickerPlaceholder,
            disabled && styles.disabledText,
          ]}
        >
          {value ? formatDateForDisplay(value) : placeholder}
        </Text>
        <Ionicons
          name="calendar"
          size={20}
          color={disabled ? colors.gray : colors.primary}
        />
      </TouchableOpacity>

      <CalendarPicker
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={handleDateConfirm}
        selectedDate={value}
        dateRange={dateRange}
        title={title}
        includeToday={includeToday}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  datePickerField: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: "white",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border || colors.lightGray,
  },
  disabled: {
    opacity: 0.6,
    backgroundColor: colors.lightGray,
  },
  datePickerText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  datePickerPlaceholder: {
    color: colors.gray,
  },
  disabledText: {
    color: colors.gray,
  },
});

export default DatePickerField;
