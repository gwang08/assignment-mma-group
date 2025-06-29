import React from "react";
import {NavigationContainer} from "@react-navigation/native";
import {createStackNavigator} from "@react-navigation/stack";
import {StatusBar} from "expo-status-bar";

import {AuthProvider, useAuth} from "./src/context/AuthContext";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import StudentScreen from "./src/screens/StudentScreen";
import ParentScreen from "./src/screens/ParentScreen";
import NurseScreen from "./src/screens/nurse/NurseScreen";
import MedicalEventsScreen from "./src/screens/nurse/MedicalEventsScreen";
import MedicineRequestsScreen from "./src/screens/nurse/MedicineRequestsScreen";
import StudentsScreen from "./src/screens/nurse/StudentsScreen";
import VaccinationScreen from "./src/screens/nurse/VaccinationScreen";
import HealthCheckScreen from "./src/screens/nurse/HealthCheckScreen";
import ConsultationsScreen from "./src/screens/nurse/ConsultationsScreen";
import AdminScreen from "./src/screens/AdminScreen";
import LoadingScreen from "./src/components/LoadingScreen";
import colors from "./src/styles/colors";

const Stack = createStackNavigator();

function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{title: "Đăng Nhập"}}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{title: "Đăng Ký"}}
      />
    </Stack.Navigator>
  );
}

function NurseNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="NurseMain" component={NurseScreen} />
      <Stack.Screen name="MedicalEvents" component={MedicalEventsScreen} />
      <Stack.Screen
        name="MedicineRequests"
        component={MedicineRequestsScreen}
      />
      <Stack.Screen name="Students" component={StudentsScreen} />
      <Stack.Screen name="Vaccination" component={VaccinationScreen} />
      <Stack.Screen name="HealthCheck" component={HealthCheckScreen} />
      <Stack.Screen name="Consultations" component={ConsultationsScreen} />
    </Stack.Navigator>
  );
}

function AppNavigator() {
  const {userType} = useAuth();

  const getScreenComponent = () => {
    switch (userType) {
      case "student":
        return StudentScreen;
      case "parent":
        return ParentScreen;
      case "medicalStaff":
        return NurseNavigator;
      case "admin":
        return AdminScreen;
      default:
        return ParentScreen;
    }
  };

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="Main"
        component={getScreenComponent()}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const {isLoading, isAuthenticated} = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return isAuthenticated ? <AppNavigator /> : <AuthNavigator />;
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
