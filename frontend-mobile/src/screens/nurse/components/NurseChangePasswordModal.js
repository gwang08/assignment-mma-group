import React, {useState} from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import colors from "../../../styles/colors";

const NurseChangePasswordModal = ({
  visible,
  onClose,
  passwordData,
  setPasswordData,
  onSubmit,
  loading,
}) => {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Đổi mật khẩu</Text>
          <View style={styles.inputWrapper}>
            <View style={styles.inputBlock}>
              <Text style={styles.label}>Mật khẩu hiện tại</Text>
              <TextInput
                style={styles.input}
                placeholder="Mật khẩu hiện tại"
                secureTextEntry={!showCurrent}
                value={passwordData.current}
                onChangeText={(text) =>
                  setPasswordData({...passwordData, currentPassword: text})
                }
              />
            </View>
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowCurrent((v) => !v)}
            >
              <Text style={styles.eyeIcon}>{showCurrent ? "👁️" : "🙈"}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputWrapper}>
            <View style={styles.inputBlock}>
              <Text style={styles.label}>Mật khẩu mới</Text>
              <TextInput
                style={styles.input}
                placeholder="Mật khẩu mới"
                secureTextEntry={!showNew}
                value={passwordData.new}
                onChangeText={(text) =>
                  setPasswordData({...passwordData, newPassword: text})
                }
              />
            </View>
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowNew((v) => !v)}
            >
              <Text style={styles.eyeIcon}>{showNew ? "👁️" : "🙈"}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputWrapper}>
            <View style={styles.inputBlock}>
              <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
              <TextInput
                style={styles.input}
                placeholder="Xác nhận mật khẩu mới"
                secureTextEntry={!showConfirm}
                value={passwordData.confirm}
                onChangeText={(text) =>
                  setPasswordData({...passwordData, confirm: text})
                }
              />
            </View>
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowConfirm((v) => !v)}
            >
              <Text style={styles.eyeIcon}>{showConfirm ? "👁️" : "🙈"}</Text>
            </TouchableOpacity>
          </View>
          <View style={{flexDirection: "row", gap: 12, marginTop: 16}}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.saveBtn, {flex: 1}]}
              onPress={onSubmit}
              disabled={loading}
            >
              <Text style={styles.actionText}>
                {loading ? "Đang lưu..." : "Lưu"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.cancelBtn, {flex: 1}]}
              onPress={onClose}
            >
              <Text style={styles.actionText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  inputBlock: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 4,
  },
  eyeBtn: {
    marginLeft: 8,
    padding: 4,
  },
  eyeIcon: {
    fontSize: 20,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
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

export default NurseChangePasswordModal;
