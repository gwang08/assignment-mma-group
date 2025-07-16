import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import colors from "../../../styles/colors";

const NurseProfileForm = ({
  formData,
  setFormData,
  editing,
  setEditing,
  onSave,
  onCancel,
  onLogout,
}) => (
  <View style={styles.profileContent}>
    <View style={styles.formGroup}>
      <Text style={styles.label}>Họ</Text>
      <TextInput
        style={[styles.input, !editing && styles.inputDisabled]}
        value={formData.first_name || ""}
        onChangeText={(text) => setFormData({...formData, first_name: text})}
        editable={editing}
        placeholder="Nhập họ"
      />
    </View>
    <View style={styles.formGroup}>
      <Text style={styles.label}>Tên</Text>
      <TextInput
        style={[styles.input, !editing && styles.inputDisabled]}
        value={formData.last_name || ""}
        onChangeText={(text) => setFormData({...formData, last_name: text})}
        editable={editing}
        placeholder="Nhập tên"
      />
    </View>
    <View style={styles.formGroup}>
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={[styles.input, !editing && styles.inputDisabled]}
        value={formData.email || ""}
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
        value={formData.phone_number || ""}
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
            formData.gender === "male" && styles.genderSelected,
            !editing && styles.genderDisabled,
          ]}
          onPress={() => editing && setFormData({...formData, gender: "male"})}
          disabled={!editing}
        >
          <Text
            style={[
              styles.genderText,
              formData.gender === "male" && styles.genderTextSelected,
            ]}
          >
            Nam
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.genderOption,
            formData.gender === "female" && styles.genderSelected,
            !editing && styles.genderDisabled,
          ]}
          onPress={() =>
            editing && setFormData({...formData, gender: "female"})
          }
          disabled={!editing}
        >
          <Text
            style={[
              styles.genderText,
              formData.gender === "female" && styles.genderTextSelected,
            ]}
          >
            Nữ
          </Text>
        </TouchableOpacity>
      </View>
    </View>
    <View style={styles.infoSection}>
      <Text style={styles.infoLabel}>Thông tin tài khoản</Text>
      <View style={styles.infoRow}>
        <Text style={styles.infoText}>
          Tạo lúc:{" "}
          {formData.createdAt
            ? new Date(formData.createdAt).toLocaleDateString("vi-VN")
            : "không có"}
        </Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoText}>
          Đăng nhập cuối:{" "}
          {formData.last_login
            ? new Date(formData.last_login).toLocaleDateString("vi-VN")
            : "Chưa có"}
        </Text>
      </View>
    </View>
    <View style={styles.actionButtons}>
      {!editing ? (
        <>
          <TouchableOpacity
            style={[styles.actionBtn, styles.editBtn]}
            onPress={() => setEditing(true)}
          >
            <Text style={styles.actionText}>Chỉnh sửa</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.logoutBtn]}
            onPress={onLogout}
          >
            <Text style={styles.actionText}>Đăng xuất</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity
            style={[styles.actionBtn, styles.saveBtn]}
            onPress={onSave}
          >
            <Text style={styles.actionText}>Lưu</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.cancelBtn]}
            onPress={onCancel}
          >
            <Text style={styles.actionText}>Hủy</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
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
    color: colors.primaryDark,
  },
  genderTextSelected: {
    color: "black",
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
  infoText: {
    fontSize: 14,
    color: "#34495E",
  },
  actionButtons: {
    flexDirection: "row",
    paddingTop: 10,
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
  actionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default NurseProfileForm;
