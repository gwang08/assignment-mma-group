import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import StudentHealthProfile from "../components/student/StudentHealthProfile";
import StudentMedicalHistory from "../components/student/StudentMedicalHistory";
import StudentSettings from "../components/student/StudentSettings";
import { colors } from "../styles/colors";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack cho Hồ sơ sức khỏe
const HealthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.primary },
      headerTintColor: "white",
      headerTitleStyle: { fontWeight: "bold" },
    }}
  >
    <Stack.Screen
      name="StudentHealthProfile"
      component={StudentHealthProfile}
      options={{ headerTitle: "Hồ sơ sức khỏe", headerTitleAlign: "center" }}
    />
  </Stack.Navigator>
);

// Stack cho Lịch sử y tế
const HistoryStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.primary },
      headerTintColor: "white",
      headerTitleStyle: { fontWeight: "bold" },
    }}
  >
    <Stack.Screen
      name="StudentMedicalHistory"
      component={StudentMedicalHistory}
      options={{ headerTitle: "Lịch sử y tế", headerTitleAlign: "center" }}
    />
  </Stack.Navigator>
);

// Stack cho Cài đặt
const SettingsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.primary },
      headerTintColor: "white",
      headerTitleStyle: { fontWeight: "bold" },
    }}
  >
    <Stack.Screen
      name="StudentSettings"
      component={StudentSettings}
      options={{ headerTitle: "Cài đặt", headerTitleAlign: "center" }}
    />
  </Stack.Navigator>
);

// Main Tab Navigator
const StudentScreen = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;

          if (route.name === "Health") {
            iconName = focused ? "heart" : "heart-outline";
          } else if (route.name === "History") {
            iconName = focused ? "time" : "time-outline";
          } else if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray,
        tabBarStyle: {
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: colors.lightGray,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Health"
        component={HealthStack}
        options={{ title: "Sức khỏe" }}
      />
      <Tab.Screen
        name="History"
        component={HistoryStack}
        options={{ title: "Lịch sử" }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStack}
        options={{ title: "Cài đặt" }}
      />
    </Tab.Navigator>
  );
};

export default StudentScreen;
