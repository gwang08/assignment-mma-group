import React from "react";
import {Modal, View, Text, TouchableOpacity, ScrollView} from "react-native";
import colors from "../../../styles/colors";

const MedicineInventoryModal = ({
  visible,
  onClose,
  inventory,
  loadingInventory,
}) => {
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
            width: "90%",
            backgroundColor: "#fff",
            borderRadius: 12,
            padding: 20,
            maxHeight: "80%",
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: colors.primary,
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            Tồn kho thuốc
          </Text>
          {loadingInventory ? (
            <Text style={{textAlign: "center", marginVertical: 20}}>
              Đang tải...
            </Text>
          ) : (
            <ScrollView style={{maxHeight: 350}}>
              {Array.isArray(inventory) && inventory.length > 0 ? (
                inventory.map((med, idx) => (
                  <View
                    key={idx}
                    style={{
                      marginBottom: 10,
                      borderBottomWidth: 1,
                      borderBottomColor: "#eee",
                      paddingBottom: 8,
                    }}
                  >
                    <Text>
                      <Text style={{fontWeight: "bold"}}>Tên:</Text> {med._id}
                    </Text>
                    <Text>
                      <Text style={{fontWeight: "bold"}}>Số lần yêu cầu:</Text>{" "}
                      {med.totalRequests}
                    </Text>
                    <Text>
                      <Text style={{fontWeight: "bold"}}>
                        Liều lượng phổ biến:
                      </Text>{" "}
                      {med.commonDosage || "không có"}
                    </Text>
                    <Text>
                      <Text style={{fontWeight: "bold"}}>
                        Tần suất phổ biến:
                      </Text>{" "}
                      {med.commonFrequency || "không có"}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={{textAlign: "center", color: "#999"}}>
                  Không có dữ liệu tồn kho
                </Text>
              )}
            </ScrollView>
          )}
          <TouchableOpacity
            style={{
              marginTop: 16,
              backgroundColor: colors.primary,
              borderRadius: 8,
              paddingVertical: 12,
              alignItems: "center",
            }}
            onPress={onClose}
          >
            <Text style={{color: "#fff", fontWeight: "bold", fontSize: 16}}>
              Đóng
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default MedicineInventoryModal;
