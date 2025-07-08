import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../styles/colors";
import { useAuth } from "../../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProfileUpdateModal from "../common/ProfileUpdateModal";

const ParentSettings = () => {
  const { user, signOut, updateUser } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleSignOut = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("userToken");
            await AsyncStorage.removeItem("userInfo");
            signOut();
          } catch (error) {
            console.error("Error signing out:", error);
          }
        },
      },
    ]);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa có thông tin";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const formatAddress = (address) => {
    if (!address) return "Chưa có thông tin";
    const parts = [
      address.street,
      address.city,
      address.state,
      address.country,
    ].filter(Boolean);
    return parts.join(", ") || "Chưa có thông tin";
  };

  const handleProfileUpdate = (updatedUser) => {
    // Update the user context with new data
    if (updateUser) {
      updateUser(updatedUser);
    }
    // Also update AsyncStorage
    AsyncStorage.setItem("userData", JSON.stringify(updatedUser));
  };

  const SettingSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );

  const InfoRow = ({ label, value, icon }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={colors.primary}
            style={styles.infoIcon}
          />
        )}
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  const ActionButton = ({
    title,
    icon,
    onPress,
    color = colors.primary,
    textColor = "white",
  }) => (
    <TouchableOpacity
      style={[styles.actionButton, { backgroundColor: color }]}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={20}
        color={textColor}
        style={styles.actionIcon}
      />
      <Text style={[styles.actionText, { color: textColor }]}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Profile Section */}
      <SettingSection title="Thông tin cá nhân">
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={32} color="white" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {user?.first_name} {user?.last_name}
            </Text>
            <Text style={styles.profileRole}>Phụ huynh</Text>
          </View>
        </View>

        <InfoRow
          label="Tên đăng nhập"
          value={user?.username || "Chưa có"}
          icon="person-circle"
        />
        <InfoRow label="Email" value={user?.email || "Chưa có"} icon="mail" />
        <InfoRow
          label="Số điện thoại"
          value={user?.phone_number || "Chưa có"}
          icon="call"
        />
        <InfoRow
          label="Giới tính"
          value={
            user?.gender === "male"
              ? "Nam"
              : user?.gender === "female"
              ? "Nữ"
              : "Khác"
          }
          icon="people"
        />
        <InfoRow
          label="Ngày sinh"
          value={formatDate(user?.dateOfBirth)}
          icon="calendar"
        />
        <InfoRow
          label="Địa chỉ"
          value={formatAddress(user?.address)}
          icon="location"
        />
      </SettingSection>

      {/* Actions */}
      <SettingSection title="Thao tác">
        <ActionButton
          title="Cập nhật thông tin"
          icon="create"
          onPress={() => setShowProfileModal(true)}
          color={colors.primary}
        />
        <ActionButton
          title="Đổi mật khẩu"
          icon="key"
          onPress={() =>
            Alert.alert("Thông báo", "Tính năng đang được phát triển")
          }
          color={colors.warning}
        />
      </SettingSection>

      {/* Sign Out */}
      <View style={styles.signOutSection}>
        <ActionButton
          title="Đăng xuất"
          icon="log-out"
          onPress={handleSignOut}
          color={colors.error}
        />
      </View>

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={styles.appInfoText}>
          Ứng dụng quản lý sức khỏe học sinh
        </Text>
        <Text style={styles.appVersion}>Phiên bản 1.0.0</Text>
      </View>

      {/* Profile Update Modal */}
      <ProfileUpdateModal
        visible={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
        onUpdateSuccess={handleProfileUpdate}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.lightGray,
  },
  sectionContent: {
    backgroundColor: "white",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  infoIcon: {
    marginRight: 10,
  },
  infoLabel: {
    fontSize: 16,
    color: colors.text,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "right",
    flex: 1,
    marginLeft: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginHorizontal: 20,
    marginVertical: 5,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionIcon: {
    marginRight: 10,
  },
  actionText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  signOutSection: {
    marginVertical: 20,
  },
  appInfo: {
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  appInfoText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 5,
  },
  appVersion: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
  },
});

export default ParentSettings;
