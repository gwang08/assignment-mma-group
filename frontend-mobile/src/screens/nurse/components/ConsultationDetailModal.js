import React from "react";
import {Modal, View, Text, TouchableOpacity, ScrollView} from "react-native";
import colors from "../../../styles/colors";

function InfoGroup({title, children}) {
  return (
    <View style={{marginBottom: 18}}>
      <Text
        style={{
          fontWeight: "bold",
          color: colors.primary,
          fontSize: 15,
          marginBottom: 6,
        }}
      >
        {title}
      </Text>
      <View style={{paddingLeft: 8}}>{children}</View>
    </View>
  );
}

export default function ConsultationDetailModal({
  visible,
  consultation,
  onClose,
}) {
  if (!consultation) return null;
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
            maxHeight: "80%",
            backgroundColor: "#fff",
            borderRadius: 12,
            padding: 0,
            overflow: "hidden",
            justifyContent: "flex-start",
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: colors.primary,
              textAlign: "center",
              paddingTop: 20,
              paddingBottom: 12,
              backgroundColor: "#fff",
              borderBottomWidth: 1,
              borderBottomColor: "#eee",
              marginBottom: 0,
            }}
          >
            Chi tiết lịch tư vấn
          </Text>
          <ScrollView
            contentContainerStyle={{padding: 20, paddingBottom: 0}}
            showsVerticalScrollIndicator={false}
          >
            <InfoGroup title="Thông tin học sinh">
              <Text style={{fontSize: 16, marginBottom: 4}}>
                Họ tên: {consultation.student?.first_name || ""}{" "}
                {consultation.student?.last_name || "" || "Không có"}
              </Text>
            </InfoGroup>
            <InfoGroup title="Thông tin phụ huynh">
              <Text style={{fontSize: 16, marginBottom: 4}}>
                Họ tên: {consultation.attending_parent?.first_name || ""}{" "}
                {consultation.attending_parent?.last_name || "" || "Không có"}
              </Text>
            </InfoGroup>
            <InfoGroup title="Thông tin lịch tư vấn">
              <Text style={{fontSize: 16, marginBottom: 4}}>
                Chiến dịch:{" "}
                {consultation.campaignResult?.title ||
                  consultation.campaignResult ||
                  "Không có"}
              </Text>
              <Text style={{fontSize: 16, marginBottom: 4}}>
                Ngày:{" "}
                {consultation.scheduledDate
                  ? new Date(consultation.scheduledDate).toLocaleDateString(
                      "vi-VN"
                    )
                  : "Không có"}
              </Text>

              <Text style={{fontSize: 16, marginBottom: 4}}>
                Thời lượng: {consultation.duration || "Không có"} phút
              </Text>
              <Text style={{fontSize: 16, marginBottom: 4}}>
                Lý do: {consultation.reason || "Không có"}
              </Text>
              <Text style={{fontSize: 16, marginBottom: 4}}>
                Trạng thái: {consultation.status || "Không có"}
              </Text>
            </InfoGroup>
            <InfoGroup title="Ghi chú">
              <Text style={{fontSize: 16, marginBottom: 4}}>
                {consultation.notes || "Không có"}
              </Text>
            </InfoGroup>
          </ScrollView>
          <View
            style={{
              padding: 20,
              borderTopWidth: 1,
              borderTopColor: "#eee",
              backgroundColor: "#fff",
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: colors.primary,
                borderRadius: 8,
                padding: 14,
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
      </View>
    </Modal>
  );
}
