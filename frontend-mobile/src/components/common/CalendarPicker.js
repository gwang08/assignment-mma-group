import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../../styles/colors";

const CalendarPicker = ({
  visible,
  onClose,
  onConfirm,
  selectedDate,
  dateRange = "all", // 'all', 'future', 'past'
  title = "Chọn ngày",
  includeToday = true, // Flag to control whether today's date is selectable
}) => {
  const [tempDate, setTempDate] = useState(new Date());

  useEffect(() => {
    if (selectedDate) {
      setTempDate(new Date(selectedDate));
    } else {
      setTempDate(new Date());
    }
  }, [selectedDate, visible]);

  // Year/Month navigation functions
  const navigateYear = (direction) => {
    const newDate = new Date(tempDate);
    newDate.setFullYear(tempDate.getFullYear() + direction);
    setTempDate(newDate);
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(tempDate);
    newDate.setMonth(tempDate.getMonth() + direction);
    setTempDate(newDate);
  };

  // Calendar helper functions
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarWeeks = () => {
    const year = tempDate.getFullYear();
    const month = tempDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const weeks = [];
    let currentWeek = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      currentWeek.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(day);

      // If we've filled a week (7 days), start a new week
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    // Fill the last week with empty cells if needed
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    return weeks;
  };

  const selectDay = (day) => {
    if (day && !isDayDisabled(day)) {
      const newDate = new Date(tempDate);
      newDate.setDate(day);
      setTempDate(newDate);
    }
  };

  const isDayDisabled = (day) => {
    if (!day) return true;

    const dayDate = new Date(tempDate);
    dayDate.setDate(day);
    dayDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if today should be included based on the includeToday flag
    if (dayDate.getTime() === today.getTime()) {
      return !includeToday;
    }

    switch (dateRange) {
      case "future":
        return dayDate < today;
      case "past":
        return dayDate > today;
      default:
        return false;
    }
  };

  const isSelectedDay = (day) => {
    if (!day) return false;
    return tempDate.getDate() === day;
  };

  const isToday = (day) => {
    if (!day) return false;
    const today = new Date();
    return (
      today.getFullYear() === tempDate.getFullYear() &&
      today.getMonth() === tempDate.getMonth() &&
      today.getDate() === day
    );
  };

  const formatDateForDisplay = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("vi-VN");
  };

  const setQuickDate = (days) => {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + days);
    setTempDate(newDate);
  };

  const confirmDateSelection = () => {
    onConfirm(tempDate);
    onClose();
  };

  const monthNames = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];

  const weekDays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={styles.modalContent}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.calendarContainer}>
            {/* Year Navigation */}
            <View style={styles.yearNavigation}>
              <TouchableOpacity
                style={styles.navigationButton}
                onPress={() => navigateYear(-1)}
              >
                <Ionicons
                  name="chevron-back"
                  size={20}
                  color={colors.primary}
                />
              </TouchableOpacity>
              <Text style={styles.yearText}>{tempDate.getFullYear()}</Text>
              <TouchableOpacity
                style={styles.navigationButton}
                onPress={() => navigateYear(1)}
              >
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>

            {/* Month Navigation */}
            <View style={styles.monthNavigation}>
              <TouchableOpacity
                style={styles.navigationButton}
                onPress={() => navigateMonth(-1)}
              >
                <Ionicons
                  name="chevron-back"
                  size={20}
                  color={colors.primary}
                />
              </TouchableOpacity>
              <Text style={styles.monthText}>
                {monthNames[tempDate.getMonth()]}
              </Text>
              <TouchableOpacity
                style={styles.navigationButton}
                onPress={() => navigateMonth(1)}
              >
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>

            {/* Calendar Header */}
            <View style={styles.calendarHeader}>
              {weekDays.map((day, index) => (
                <View key={index} style={styles.calendarHeaderDay}>
                  <Text style={styles.calendarHeaderText}>{day}</Text>
                </View>
              ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendarGrid}>
              {generateCalendarWeeks().map((week, weekIndex) => (
                <View key={weekIndex} style={styles.calendarWeek}>
                  {week.map((day, dayIndex) => (
                    <TouchableOpacity
                      key={dayIndex}
                      style={[
                        styles.calendarDay,
                        day === null && styles.calendarDayEmpty,
                        isSelectedDay(day) && styles.calendarDaySelected,
                        isDayDisabled(day) && styles.calendarDayDisabled,
                      ]}
                      onPress={() => selectDay(day)}
                      disabled={day === null || isDayDisabled(day)}
                    >
                      {day && (
                        <Text
                          style={[
                            styles.calendarDayText,
                            isSelectedDay(day) &&
                              styles.calendarDayTextSelected,
                            isDayDisabled(day) &&
                              styles.calendarDayTextDisabled,
                          ]}
                        >
                          {day}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={confirmDateSelection}
            >
              <Text style={styles.confirmButtonText}>Xác nhận</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  calendarContainer: {
    alignItems: "center",
  },
  yearNavigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 15,
  },
  monthNavigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 15,
  },
  navigationButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
  },
  navigationText: {
    fontSize: 12,
    color: colors.primary,
    marginHorizontal: 2,
  },
  yearText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  monthText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  selectedDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    padding: 10,
    backgroundColor: colors.lightGray,
    borderRadius: 10,
  },
  selectedDateLabel: {
    fontSize: 14,
    color: colors.text,
    marginRight: 10,
  },
  selectedDateText: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.primary,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 10,
  },
  calendarHeaderDay: {
    flex: 1,
    alignItems: "center",
  },
  calendarHeaderText: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text,
  },
  calendarGrid: {
    width: "100%",
    marginBottom: 20,
  },
  calendarWeek: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 5,
  },
  calendarDay: {
    flex: 1,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    marginHorizontal: 2,
  },
  calendarDayEmpty: {
    backgroundColor: "transparent",
  },
  calendarDaySelected: {
    backgroundColor: colors.primary,
  },
  calendarDayDisabled: {
    backgroundColor: colors.lightGray,
    opacity: 0.3,
  },
  calendarDayText: {
    fontSize: 14,
    color: colors.text,
  },
  calendarDayTextSelected: {
    color: "white",
    fontWeight: "bold",
  },
  calendarDayTextDisabled: {
    color: colors.gray,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    backgroundColor: colors.lightGray,
    borderRadius: 10,
    alignItems: "center",
    marginRight: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.text,
  },
  confirmButton: {
    flex: 1,
    padding: 15,
    backgroundColor: colors.primary,
    borderRadius: 10,
    alignItems: "center",
    marginLeft: 10,
  },
  confirmButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
});

export default CalendarPicker;
