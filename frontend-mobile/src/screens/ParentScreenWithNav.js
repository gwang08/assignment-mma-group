import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import ParentDashboard from '../components/parents/ParentDashboard';
import ParentStudents from '../components/parents/ParentStudents';
import ParentSettings from '../components/parents/ParentSettings';
import ParentHealthProfiles from '../components/parents/ParentHealthProfiles';
import ParentMedicineRequests from '../components/parents/ParentMedicineRequests';
import ParentCampaigns from '../components/parents/ParentCampaigns';
import ParentConsultations from '../components/parents/ParentConsultations';
import { colors } from '../styles/colors';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack Navigator cho Home tab
const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Dashboard" 
        component={ParentDashboard} 
        options={{ headerTitle: 'Trang chủ phụ huynh' }}
      />
      <Stack.Screen 
        name="HealthProfiles" 
        component={ParentHealthProfiles} 
        options={{ headerTitle: 'Hồ sơ sức khỏe' }}
      />
      <Stack.Screen 
        name="MedicineRequests" 
        component={ParentMedicineRequests} 
        options={{ headerTitle: 'Yêu cầu thuốc' }}
      />
      <Stack.Screen 
        name="Campaigns" 
        component={ParentCampaigns} 
        options={{ headerTitle: 'Chiến dịch y tế' }}
      />
      <Stack.Screen 
        name="Consultations" 
        component={ParentConsultations} 
        options={{ headerTitle: 'Lịch tư vấn' }}
      />
    </Stack.Navigator>
  );
};

const ParentScreen = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Students') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: colors.lightGray,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerShown: false, // Hide tab navigator header since we have stack headers
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack} 
        options={{ 
          title: 'Trang chủ',
        }} 
      />
      <Tab.Screen 
        name="Students" 
        component={ParentStudents} 
        options={{ 
          title: 'Học sinh',
          headerShown: true,
          headerTitle: 'Danh sách học sinh',
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: 'white',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} 
      />
      <Tab.Screen 
        name="Settings" 
        component={ParentSettings} 
        options={{ 
          title: 'Cài đặt',
          headerShown: true,
          headerTitle: 'Cài đặt',
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: 'white',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} 
      />
    </Tab.Navigator>
  );
};

export default ParentScreen;
