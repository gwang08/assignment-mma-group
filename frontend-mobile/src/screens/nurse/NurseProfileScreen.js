import React, {useState, useEffect} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import {useAuth} from "../../context/AuthContext";
import nurseAPI from "../../services/nurseApi";
import colors from "../../styles/colors";
import NurseProfileHeader from "./components/NurseProfileHeader";
import NurseProfileForm from "./components/NurseProfileForm";
import NurseChangePasswordModal from "./components/NurseChangePasswordModal";

const NurseProfileScreen = () => {
  const {user, signOut, updateUser} = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [passwordModal, setPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirm: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await nurseAPI.getCurrentUser();
      setUserProfile(response.data);
      setFormData(response.data);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải thông tin hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserProfile();
    setRefreshing(false);
  };

  const handleUpdateProfile = async () => {
    try {
      await nurseAPI.updateProfile(formData);
      Alert.alert("Thành công", "Đã cập nhật thông tin hồ sơ");
      setEditing(false);
      fetchUserProfile();
      if (updateUser) {
        updateUser({...user, ...formData});
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật hồ sơ");
    }
  };

  const handleLogout = () => {
    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn đăng xuất?", [
      {text: "Hủy", style: "cancel"},
      {text: "Đăng xuất", style: "destructive", onPress: signOut},
    ]);
  };

  const handleOpenPasswordModal = () => {
    setPasswordData({currentPassword: "", newPassword: "", confirm: ""});
    setPasswordModal(true);
  };

  const handleChangePassword = async () => {
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirm
    ) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirm) {
      console.log(passwordData);
      Alert.alert("Lỗi", "Mật khẩu mới không khớp");
      return;
    }
    setPasswordLoading(true);
    try {
      await nurseAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      Alert.alert("Thành công", "Đổi mật khẩu thành công");
      setPasswordModal(false);
    } catch (error) {
      Alert.alert("Lỗi", error.message || "Không thể đổi mật khẩu");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Đang tải thông tin hồ sơ...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.profileCard}>
        <NurseProfileHeader userProfile={userProfile} />
        <NurseProfileForm
          formData={formData}
          setFormData={setFormData}
          editing={editing}
          setEditing={setEditing}
          onSave={handleUpdateProfile}
          onCancel={() => {
            setEditing(false);
            setFormData(userProfile);
          }}
          onLogout={handleLogout}
        />
        <TouchableOpacity
          style={[
            styles.actionBtn,
            styles.saveBtn,
            {marginHorizontal: 20, marginBottom: 20},
          ]}
          onPress={handleOpenPasswordModal}
        >
          <Text style={styles.actionText}>Đổi mật khẩu</Text>
        </TouchableOpacity>
      </View>
      <NurseChangePasswordModal
        visible={passwordModal}
        onClose={() => setPasswordModal(false)}
        passwordData={passwordData}
        setPasswordData={setPasswordData}
        onSubmit={handleChangePassword}
        loading={passwordLoading}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContent: {
    padding: 16,
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "bold",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "600",
    marginBottom: 2,
  },
  profileUsername: {
    fontSize: 14,
    color: "#7F8C8D",
  },
  profileContent: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
  },
  inputDisabled: {
    backgroundColor: "#F8F9FA",
    color: "#7F8C8D",
  },
  genderContainer: {
    flexDirection: "row",
    gap: 12,
  },
  genderOption: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  genderSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  genderDisabled: {
    backgroundColor: "#F8F9FA",
  },
  genderText: {
    fontSize: 16,
    color: "#2C3E50",
  },
  genderTextSelected: {
    color: "#FFFFFF",
  },
  infoSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#34495E",
  },
  actionButtons: {
    flexDirection: "row",
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
  },
  editBtn: {
    backgroundColor: "#3498DB",
  },
  logoutBtn: {
    backgroundColor: "#E74C3C",
  },
  saveBtn: {
    backgroundColor: "#27AE60",
  },
  cancelBtn: {
    backgroundColor: "#95A5A6",
  },
  actionIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 16,
    textAlign: "center",
  },
});

export default NurseProfileScreen;
