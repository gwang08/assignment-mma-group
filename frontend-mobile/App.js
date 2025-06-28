import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import StudentScreen from './src/screens/StudentScreen';
import ParentScreen from './src/screens/ParentScreen';
import NurseScreen from './src/screens/NurseScreen';
import AdminScreen from './src/screens/AdminScreen';
import LoadingScreen from './src/components/LoadingScreen';
import colors from './src/styles/colors';

const Stack = createStackNavigator();

function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ title: 'Đăng Nhập' }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen} 
        options={{ title: 'Đăng Ký' }}
      />
    </Stack.Navigator>
  );
}

function AppNavigator() {
  const { userType } = useAuth();

  const getScreenComponent = () => {
    switch (userType) {
      case 'student':
        return StudentScreen;
      case 'parent':
        return ParentScreen;
      case 'nurse':
        return NurseScreen;
      case 'admin':
        return AdminScreen;
      default:
        return ParentScreen;
    }
  };

  const getScreenTitle = () => {
    switch (userType) {
      case 'student':
        return 'Học Sinh';
      case 'parent':
        return 'Phụ Huynh';
      case 'nurse':
        return 'Y Tá';
      case 'admin':
        return 'Quản Trị';
      default:
        return 'Trang Chủ';
    }
  };

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Main" 
        component={getScreenComponent()} 
        options={{ title: getScreenTitle(), headerLeft: null }}
      />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const { isLoading, isAuthenticated } = useAuth();

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
