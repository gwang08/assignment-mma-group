import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import colors from "../../../styles/colors";

const MedicineRequestDetailModal = ({
  visible,
  onClose,
  selectedRequest,
  onUpdateStatus,
  statusUpdate,
  setStatusUpdate,
  notes,
  setNotes,
  updating,
  REQUEST_STATUS,
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
            Chi Tiết Yêu Cầu Thuốc
          </Text>
          {selectedRequest && (
            <ScrollView style={{maxHeight: 300}}>
              <View style={{gap: 8}}>
                <Text>
                  <Text style={{fontWeight: "bold"}}>Người tạo:</Text>{" "}
                  {selectedRequest.created_by?.first_name}{" "}
                  {selectedRequest.created_by?.last_name}
                </Text>
                <Text>
                  <Text style={{fontWeight: "bold"}}>Học sinh:</Text>{" "}
                  {selectedRequest.student?.first_name}{" "}
                  {selectedRequest.student?.last_name}
                </Text>
                <Text style={{fontWeight: "bold", marginTop: 8}}>Thuốc:</Text>
                {Array.isArray(selectedRequest.medicines) &&
                selectedRequest.medicines.length > 0 ? (
                  selectedRequest.medicines.map((med, idx) => (
                    <View key={idx} style={{marginLeft: 8, marginBottom: 4}}>
                      <Text>
                        - <Text style={{fontWeight: "bold"}}>Tên:</Text>{" "}
                        {med.name || "không có"}
                      </Text>
                      {med.dosage && (
                        <Text style={{marginLeft: 12}}>
                          <Text style={{fontWeight: "bold"}}>
                            + Liều lượng:
                          </Text>{" "}
                          {med.dosage}
                        </Text>
                      )}
                      {med.frequency && (
                        <Text style={{marginLeft: 12}}>
                          <Text style={{fontWeight: "bold"}}>+ Tần suất:</Text>{" "}
                          {med.frequency}
                        </Text>
                      )}
                      {med.note && (
                        <Text style={{marginLeft: 12}}>
                          <Text style={{fontWeight: "bold"}}>Ghi chú:</Text>{" "}
                          {med.note}
                        </Text>
                      )}
                    </View>
                  ))
                ) : (
                  <Text style={{marginLeft: 8}}>không có</Text>
                )}
                <View
                  style={{flexDirection: "row", alignItems: "center", gap: 8}}
                >
                  <Text style={{fontWeight: "bold"}}>Trạng thái:</Text>
                  <View
                    style={{
                      backgroundColor:
                        selectedRequest.status === "completed"
                          ? "#3742FA"
                          : selectedRequest.status === "approved"
                          ? "#2ED573"
                          : selectedRequest.status === "rejected"
                          ? "#FF4757"
                          : selectedRequest.status === "pending"
                          ? "#FFA502"
                          : "#747D8C",
                      borderRadius: 8,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      minWidth: 70,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                    >
                      {selectedRequest.status}
                    </Text>
                  </View>
                </View>
                <Text>
                  <Text style={{fontWeight: "bold"}}>Ghi chú:</Text>{" "}
                  {selectedRequest.notes || "không có"}
                </Text>
              </View>
            </ScrollView>
          )}
          <View style={{marginTop: 16}}>
            <Text style={{fontWeight: "bold", marginBottom: 4}}>
              Cập nhật trạng thái
            </Text>
            <View style={{flexDirection: "row", gap: 8, marginBottom: 8}}>
              {REQUEST_STATUS.filter(
                (s) => s.value !== "pending" && s.value
              ).map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={{
                    backgroundColor:
                      statusUpdate === opt.value ? colors.primary : "#eee",
                    borderRadius: 8,
                    paddingVertical: 8,
                    paddingHorizontal: 14,
                    marginRight: 6,
                  }}
                  onPress={() => setStatusUpdate(opt.value)}
                  disabled={updating}
                >
                  <Text
                    style={{
                      color: statusUpdate === opt.value ? "#fff" : colors.text,
                    }}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={{color: colors.text}}>Ghi chú mới:</Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                padding: 8,
                minHeight: 40,
                marginBottom: 8,
              }}
              placeholder="Ghi chú..."
              value={notes}
              onChangeText={setNotes}
              editable={!updating}
              multiline
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
                onPress={onUpdateStatus}
                disabled={updating}
              >
                <Text style={{color: "#fff", fontWeight: "bold"}}>
                  {updating ? "Đang lưu..." : "Lưu"}
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
                disabled={updating}
              >
                <Text style={{color: "#333", fontWeight: "bold"}}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default MedicineRequestDetailModal;
