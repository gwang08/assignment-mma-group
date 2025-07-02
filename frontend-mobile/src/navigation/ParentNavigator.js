import React from "react";
import { StatusBar } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import ParentScreen from "../screens/ParentScreen";
import DashboardScreen from "../screens/parent/DashboardScreen";
import LinkedStudentsScreen from "../screens/parent/LinkedStudentsScreen";
import LinkStudentRequestScreen from "../screens/parent/LinkStudentRequestScreen";
import StudentHealthProfileScreen from "../screens/parent/StudentHealthProfileScreen";
import MedicineRequestsScreen from "../screens/parent/MedicineRequestsScreen";
import LinkRequestsScreen from "../screens/parent/LinkRequestsScreen";
import colors from "../styles/colors";

const Stack = createStackNavigator();

const ParentNavigator = () => {
  return (
    <>
      <StatusBar
        backgroundColor={colors.primary}
        barStyle="light-content"
        translucent={false}
      />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: colors.surface,
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        <Stack.Screen
          name="ParentDashboard"
          component={ParentScreen}
          options={{
            title: "Trang Chủ Phụ Huynh",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ title: "Tổng Quan" }}
        />
        <Stack.Screen
          name="LinkedStudents"
          component={LinkedStudentsScreen}
          options={{ title: "Học Sinh Đã Liên Kết" }}
        />
        <Stack.Screen
          name="StudentHealthProfile"
          component={StudentHealthProfileScreen}
          options={{ title: "Hồ Sơ Sức Khỏe" }}
        />
        <Stack.Screen
          name="MedicineRequests"
          component={MedicineRequestsScreen}
          options={{ title: "Yêu Cầu Thuốc" }}
        />
        <Stack.Screen
          name="LinkStudentRequest"
          component={LinkStudentRequestScreen}
          options={{ title: "Yêu Cầu Liên Kết Học Sinh" }}
        />
        <Stack.Screen
          name="LinkRequests"
          component={LinkRequestsScreen}
          options={{ title: "Yêu Cầu Liên Kết" }}
        />
        {/* Placeholder screens for future development */}
        <Stack.Screen
          name="HealthCampaigns"
          component={PlaceholderScreen("Chiến Dịch Sức Khỏe")}
          options={{ title: "Chiến Dịch Sức Khỏe" }}
        />
        <Stack.Screen
          name="ConsultationSchedules"
          component={PlaceholderScreen("Lịch Khám")}
          options={{ title: "Lịch Khám" }}
        />
        <Stack.Screen
          name="Notifications"
          component={PlaceholderScreen("Thông Báo")}
          options={{ title: "Thông Báo" }}
        />
        <Stack.Screen
          name="ParentProfile"
          component={PlaceholderScreen("Thông Tin Cá Nhân")}
          options={{ title: "Thông Tin Cá Nhân" }}
        />
      </Stack.Navigator>
    </>
  );
};

// Placeholder component for screens that haven't been implemented yet
const PlaceholderScreen = (screenName) => {
  return function PlaceholderComponent({ navigation }) {
    const {
      View,
      Text,
      StyleSheet,
      TouchableOpacity,
    } = require("react-native");

    return (
      <View style={placeholderStyles.container}>
        <View style={placeholderStyles.content}>
          <Text style={placeholderStyles.icon}>🚧</Text>
          <Text style={placeholderStyles.title}>{screenName}</Text>
          <Text style={placeholderStyles.subtitle}>
            Màn hình này đang được phát triển
          </Text>
          <TouchableOpacity
            style={placeholderStyles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={placeholderStyles.backButtonText}>Quay Lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
};

const placeholderStyles = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: 40,
    borderRadius: 16,
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  icon: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "600",
  },
};

export default ParentNavigator;
