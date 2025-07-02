import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Modal,
  SafeAreaView,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import colors from "../styles/colors";

const { width } = Dimensions.get("window");

const ParentNavigation = ({ navigation, activeScreen = "Dashboard" }) => {
  const { user, signOut } = useAuth();
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const navigationItems = [
    {
      id: "dashboard",
      title: "Tổng quan",
      icon: "📊",
      screen: "ParentDashboard",
      description: "Xem tổng quan thông tin con em",
    },
    {
      id: "students",
      title: "Học sinh đã liên kết",
      icon: "👥",
      screen: "LinkedStudents",
      description: "Quản lý danh sách con em",
    },
    {
      id: "linkRequests",
      title: "Yêu cầu liên kết",
      icon: "🔗",
      screen: "LinkRequests",
      description: "Xem trạng thái yêu cầu liên kết",
    },
    {
      id: "health",
      title: "Hồ sơ sức khỏe",
      icon: "🏥",
      screen: "StudentHealthProfile",
      description: "Xem hồ sơ sức khỏe con em",
    },
    {
      id: "medicine",
      title: "Yêu cầu thuốc",
      icon: "💊",
      screen: "MedicineRequests",
      description: "Quản lý yêu cầu cấp thuốc",
    },
    {
      id: "campaigns",
      title: "Chiến dịch sức khỏe",
      icon: "🏃‍♂️",
      screen: "HealthCampaigns",
      description: "Tham gia các chiến dịch y tế",
    },
    {
      id: "consultations",
      title: "Lịch khám",
      icon: "📅",
      screen: "ConsultationSchedules",
      description: "Đặt lịch và xem lịch khám",
    },
    {
      id: "notifications",
      title: "Thông báo",
      icon: "🔔",
      screen: "Notifications",
      description: "Xem thông báo từ trường",
    },
    {
      id: "profile",
      title: "Thông tin cá nhân",
      icon: "👤",
      screen: "ParentProfile",
      description: "Quản lý thông tin cá nhân",
    },
  ];

  const handleNavigation = (item) => {
    setSidebarVisible(false);
    if (navigation && item.screen) {
      navigation.navigate(item.screen);
    }
  };

  const NavBar = () => (
    <View style={styles.navbar}>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => setSidebarVisible(true)}
      >
        <Text style={styles.menuIcon}>☰</Text>
      </TouchableOpacity>

      <View style={styles.navCenter}>
        <Text style={styles.navTitle}>Phụ Huynh</Text>
        <Text style={styles.navSubtitle}>{activeScreen}</Text>
      </View>

      <View style={styles.navRight}>
        <TouchableOpacity style={styles.notificationButton}>
          <Text style={styles.notificationIcon}>🔔</Text>
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>3</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.profileButton}>
          <Text style={styles.profileIcon}>👤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const SidebarItem = ({ item, isActive }) => (
    <TouchableOpacity
      style={[styles.sidebarItem, isActive && styles.sidebarItemActive]}
      onPress={() => handleNavigation(item)}
    >
      <View style={styles.sidebarItemContent}>
        <Text
          style={[
            styles.sidebarItemIcon,
            isActive && styles.sidebarItemIconActive,
          ]}
        >
          {item.icon}
        </Text>
        <View style={styles.sidebarItemText}>
          <Text
            style={[
              styles.sidebarItemTitle,
              isActive && styles.sidebarItemTitleActive,
            ]}
          >
            {item.title}
          </Text>
          <Text
            style={[
              styles.sidebarItemDescription,
              isActive && styles.sidebarItemDescriptionActive,
            ]}
          >
            {item.description}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const Sidebar = () => (
    <Modal
      visible={sidebarVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setSidebarVisible(false)}
    >
      <View style={styles.sidebarOverlay}>
        <TouchableOpacity
          style={styles.sidebarBackdrop}
          onPress={() => setSidebarVisible(false)}
        />
        <SafeAreaView style={styles.sidebar}>
          {/* Sidebar Header */}
          <View style={styles.sidebarHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSidebarVisible(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            <View style={styles.userInfo}>
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>
                  {user?.first_name?.charAt(0) || "P"}
                </Text>
              </View>
              <Text style={styles.userName}>
                {user?.first_name} {user?.last_name}
              </Text>
              <Text style={styles.userRole}>Phụ huynh</Text>
            </View>
          </View>

          {/* Navigation Items */}
          <ScrollView
            style={styles.sidebarContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sectionTitle}>MENU CHÍNH</Text>
            {navigationItems.map((item) => (
              <SidebarItem
                key={item.id}
                item={item}
                isActive={activeScreen === item.title}
              />
            ))}
          </ScrollView>

          {/* Sidebar Footer */}
          <View style={styles.sidebarFooter}>
            <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
              <Text style={styles.logoutIcon}>🚪</Text>
              <Text style={styles.logoutText}>Đăng xuất</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );

  return (
    <>
      <NavBar />
      <Sidebar />
    </>
  );
};

const styles = StyleSheet.create({
  // Navbar Styles
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
  },
  menuIcon: {
    fontSize: 24,
    color: colors.surface, // Changed from colors.white
  },
  navCenter: {
    flex: 1,
    alignItems: "center",
  },
  navTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.surface, // Changed from colors.white
  },
  navSubtitle: {
    fontSize: 12,
    color: colors.primaryLight,
    marginTop: 2,
  },
  navRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  notificationButton: {
    position: "relative",
    padding: 8,
    borderRadius: 8,
  },
  notificationIcon: {
    fontSize: 20,
    color: colors.surface, // Changed from colors.white
  },
  notificationBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationBadgeText: {
    fontSize: 10,
    color: colors.surface, // Changed from colors.white
    fontWeight: "bold",
  },
  profileButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.primaryDark,
  },
  profileIcon: {
    fontSize: 20,
    color: colors.surface, // Changed from colors.white
  },

  // Sidebar Styles
  sidebarOverlay: {
    flex: 1,
    flexDirection: "row",
  },
  sidebarBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  sidebar: {
    width: width * 0.85,
    backgroundColor: colors.surface, // Changed from colors.white
    elevation: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  sidebarHeader: {
    backgroundColor: colors.primary,
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 8,
    marginBottom: 16,
  },
  closeButtonText: {
    fontSize: 20,
    color: colors.surface, // Changed from colors.white
  },
  userInfo: {
    alignItems: "center",
  },
  userAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryDark,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  userAvatarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.surface, // Changed from colors.white
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.surface, // Changed from colors.white
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: colors.primaryLight,
  },
  sidebarContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.textSecondary,
    marginBottom: 16,
    letterSpacing: 1,
  },
  sidebarItem: {
    marginBottom: 8,
    borderRadius: 12,
    overflow: "hidden",
  },
  sidebarItemActive: {
    backgroundColor: colors.primary + "10",
  },
  sidebarItemContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  sidebarItemIcon: {
    fontSize: 24,
    marginRight: 16,
    width: 32,
    textAlign: "center",
  },
  sidebarItemIconActive: {
    // Keep same style for active
  },
  sidebarItemText: {
    flex: 1,
  },
  sidebarItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  sidebarItemTitleActive: {
    color: colors.primary,
    fontWeight: "bold",
  },
  sidebarItemDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  sidebarItemDescriptionActive: {
    color: colors.primary,
  },
  sidebarFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: 20,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.error + "10",
    borderRadius: 12,
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.error,
  },
});

export default ParentNavigation;
