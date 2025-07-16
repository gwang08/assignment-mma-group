import React from "react";
import {Modal, View, Text, TextInput, TouchableOpacity} from "react-native";
import colors from "../../../styles/colors";

function NotifyParentModal({
  visible,
  method,
  setMethod,
  loading,
  onSend,
  onClose,
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.3)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: "85%",
            backgroundColor: "#fff",
            borderRadius: 12,
            padding: 20,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: colors.primary,
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            Thông báo cho phụ huynh
          </Text>
          <Text style={{marginBottom: 8}}>
            Phương thức thông báo (ví dụ: SMS, Zalo, Gọi điện...):
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 8,
              padding: 10,
              fontSize: 16,
              marginBottom: 16,
            }}
            placeholder="Nhập phương thức thông báo..."
            value={method}
            onChangeText={setMethod}
            editable={!loading}
          />
          <View style={{flexDirection: "row", gap: 12}}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: colors.primary,
                borderRadius: 8,
                padding: 12,
                alignItems: "center",
              }}
              onPress={onSend}
              disabled={loading || !method}
            >
              <Text style={{color: "#fff", fontWeight: "bold"}}>
                {loading ? "Đang gửi..." : "Gửi"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: "#ccc",
                borderRadius: 8,
                padding: 12,
                alignItems: "center",
              }}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={{color: "#333", fontWeight: "bold"}}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default NotifyParentModal;
