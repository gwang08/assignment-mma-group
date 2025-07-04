import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../services/adminApi';
import colors from '../../styles/colors';

const ProfileManagement = () => {
  const { user, signOut } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getProfile();
      setUserProfile(response.data);
      setFormData(response.data);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải thông tin profile');
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
      await adminAPI.updateProfile(formData);
      Alert.alert('Thành công', 'Đã cập nhật thông tin profile');
      setEditing(false);
      fetchUserProfile();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật profile');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: signOut,
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Đang tải thông tin profile...</Text>
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
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {userProfile?.first_name?.charAt(0)}{userProfile?.last_name?.charAt(0)}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {userProfile?.first_name} {userProfile?.last_name}
            </Text>
            <Text style={styles.profileRole}>Quản trị viên</Text>
            <Text style={styles.profileUsername}>@{userProfile?.username}</Text>
          </View>
        </View>

        <View style={styles.profileContent}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Họ</Text>
            <TextInput
              style={[styles.input, !editing && styles.inputDisabled]}
              value={formData.first_name || ''}
              onChangeText={(text) => setFormData({...formData, first_name: text})}
              editable={editing}
              placeholder="Nhập họ"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Tên</Text>
            <TextInput
              style={[styles.input, !editing && styles.inputDisabled]}
              value={formData.last_name || ''}
              onChangeText={(text) => setFormData({...formData, last_name: text})}
              editable={editing}
              placeholder="Nhập tên"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, !editing && styles.inputDisabled]}
              value={formData.email || ''}
              onChangeText={(text) => setFormData({...formData, email: text})}
              editable={editing}
              placeholder="Nhập email"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput
              style={[styles.input, !editing && styles.inputDisabled]}
              value={formData.phone_number || ''}
              onChangeText={(text) => setFormData({...formData, phone_number: text})}
              editable={editing}
              placeholder="Nhập số điện thoại"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Giới tính</Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[
                  styles.genderOption,
                  formData.gender === 'male' && styles.genderSelected,
                  !editing && styles.genderDisabled
                ]}
                onPress={() => editing && setFormData({...formData, gender: 'male'})}
                disabled={!editing}
              >
                <Text style={[
                  styles.genderText,
                  formData.gender === 'male' && styles.genderTextSelected
                ]}>Nam</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderOption,
                  formData.gender === 'female' && styles.genderSelected,
                  !editing && styles.genderDisabled
                ]}
                onPress={() => editing && setFormData({...formData, gender: 'female'})}
                disabled={!editing}
              >
                <Text style={[
                  styles.genderText,
                  formData.gender === 'female' && styles.genderTextSelected
                ]}>Nữ</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Thông tin tài khoản</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📅</Text>
              <Text style={styles.infoText}>
                Tạo lúc: {new Date(userProfile?.createdAt).toLocaleDateString('vi-VN')}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🕒</Text>
              <Text style={styles.infoText}>
                Đăng nhập cuối: {userProfile?.last_login ? 
                  new Date(userProfile.last_login).toLocaleDateString('vi-VN') : 'Chưa có'
                }
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actionButtons}>
          {!editing ? (
            <>
              <TouchableOpacity
                style={[styles.actionBtn, styles.editBtn]}
                onPress={() => setEditing(true)}
              >
                <Text style={styles.actionIcon}>✏️</Text>
                <Text style={styles.actionText}>Chỉnh sửa</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.logoutBtn]}
                onPress={handleLogout}
              >
                <Text style={styles.actionIcon}>🚪</Text>
                <Text style={styles.actionText}>Đăng xuất</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.actionBtn, styles.saveBtn]}
                onPress={handleUpdateProfile}
              >
                <Text style={styles.actionIcon}>💾</Text>
                <Text style={styles.actionText}>Lưu</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.cancelBtn]}
                onPress={() => {
                  setEditing(false);
                  setFormData(userProfile);
                }}
              >
                <Text style={styles.actionIcon}>❌</Text>
                <Text style={styles.actionText}>Hủy</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    padding: 16,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  profileUsername: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  profileContent: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  inputDisabled: {
    backgroundColor: '#F8F9FA',
    color: '#7F8C8D',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderOption: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  genderSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  genderDisabled: {
    backgroundColor: '#F8F9FA',
  },
  genderText: {
    fontSize: 16,
    color: '#2C3E50',
  },
  genderTextSelected: {
    color: '#FFFFFF',
  },
  infoSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#34495E',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  editBtn: {
    backgroundColor: '#3498DB',
  },
  logoutBtn: {
    backgroundColor: '#E74C3C',
  },
  saveBtn: {
    backgroundColor: '#27AE60',
  },
  cancelBtn: {
    backgroundColor: '#95A5A6',
  },
  actionIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.primary,
  },
});

export default ProfileManagement;
