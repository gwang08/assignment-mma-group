import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../styles/colors';

// Import admin components
import StudentManagement from '../components/admin/StudentManagement';
import NurseManagement from '../components/admin/NurseManagement';
import LinkRequestManagement from '../components/admin/LinkRequestManagement';
import ParentRelationManagement from '../components/admin/ParentRelationManagement';
import ProfileManagement from '../components/admin/ProfileManagement';

const AdminScreen = () => {
  const [activeTab, setActiveTab] = useState('students');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'students':
        return <StudentManagement />;
      case 'nurses':
        return <NurseManagement />;
      case 'requests':
        return <LinkRequestManagement />;
      case 'relations':
        return <ParentRelationManagement />;
      case 'profile':
        return <ProfileManagement />;
      default:
        return <StudentManagement />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>Hệ thống quản lý trường học</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {renderTabContent()}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {[
          { key: 'students', icon: 'school-outline', label: 'Học sinh' },
          { key: 'nurses', icon: 'medical-outline', label: 'Y tá' },
          { key: 'requests', icon: 'clipboard-outline', label: 'Yêu cầu' },
          { key: 'relations', icon: 'people-outline', label: 'Quan hệ' },
          { key: 'profile', icon: 'person-outline', label: 'Hồ sơ' }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons 
              name={tab.icon} 
              size={20} 
              color={activeTab === tab.key ? '#fff' : '#666'} 
              style={styles.tabIcon}
            />
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.activeTabLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabIcon: {
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default AdminScreen;