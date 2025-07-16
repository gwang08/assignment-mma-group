import React, {useState, useEffect} from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import colors from "../../../styles/colors";

const TAB_INFO = "info";
const TAB_PROFILE = "profile";
const TAB_HISTORY = "history";

const itemBoxStyle = {
  marginLeft: 8,
  marginBottom: 12,
  backgroundColor: "#e0f7fa", // màu xanh nhạt giống button
  borderRadius: 8,
  borderWidth: 0,
  paddingVertical: 12,
  paddingHorizontal: 16,
  shadowColor: colors.shadow,
  shadowOffset: {width: 0, height: 2},
  shadowOpacity: 0.08,
  shadowRadius: 2,
  elevation: 2,
};

function StudentDetailModal({
  visible,
  student,
  healthProfile,
  medicalHistory,
  onClose,
  onViewHealthProfile,
  onViewMedicalHistory,
  loading,
  initialTab = TAB_INFO,
  onTabChange,
}) {
  const [tab, setTab] = useState(initialTab);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab, visible]);

  // Tự động fetch khi chuyển tab
  useEffect(() => {
    if (!student) return;
    if (tab === TAB_PROFILE) {
      onViewHealthProfile && onViewHealthProfile(student);
    } else if (tab === TAB_HISTORY) {
      onViewMedicalHistory && onViewMedicalHistory(student);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, student]);

  const handleTab = (tabKey) => {
    setTab(tabKey);
    onTabChange && onTabChange(tabKey);
  };

  if (!student) return null;
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
            width: "95%",
            backgroundColor: "#fff",
            borderRadius: 12,
            padding: 20,
            maxHeight: "90%",
          }}
        >
          <View style={{flexDirection: "row", marginBottom: 16}}>
            <TouchableOpacity
              style={{
                flex: 1,
                alignItems: "center",
                paddingVertical: 8,
                borderBottomWidth: tab === TAB_INFO ? 2 : 0,
                borderBottomColor: colors.primary,
              }}
              onPress={() => handleTab(TAB_INFO)}
            >
              <Text
                style={{
                  color:
                    tab === TAB_INFO ? colors.primary : colors.textSecondary,
                  fontWeight: "bold",
                }}
              >
                Thông tin
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                alignItems: "center",
                paddingVertical: 8,
                borderBottomWidth: tab === TAB_PROFILE ? 2 : 0,
                borderBottomColor: colors.primary,
              }}
              onPress={() => handleTab(TAB_PROFILE)}
            >
              <Text
                style={{
                  color:
                    tab === TAB_PROFILE ? colors.primary : colors.textSecondary,
                  fontWeight: "bold",
                }}
              >
                Hồ sơ sức khỏe
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                alignItems: "center",
                paddingVertical: 8,
                borderBottomWidth: tab === TAB_HISTORY ? 2 : 0,
                borderBottomColor: colors.primary,
              }}
              onPress={() => handleTab(TAB_HISTORY)}
            >
              <Text
                style={{
                  color:
                    tab === TAB_HISTORY ? colors.primary : colors.textSecondary,
                  fontWeight: "bold",
                }}
              >
                Lịch sử y tế
              </Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <ActivityIndicator
              size="small"
              color={colors.primary}
              style={{marginVertical: 12}}
            />
          ) : (
            <>
              {tab === TAB_INFO && (
                <View>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "bold",
                      color: colors.primary,
                      marginBottom: 12,
                      textAlign: "center",
                    }}
                  >
                    Chi tiết học sinh
                  </Text>
                  <View style={itemBoxStyle}>
                    <Text style={{fontSize: 16, marginBottom: 6}}>
                      Tên: {student.first_name} {student.last_name}
                    </Text>
                    <Text style={{fontSize: 16, marginBottom: 6}}>
                      Lớp: {student.class_name}
                    </Text>
                    <Text style={{fontSize: 16, marginBottom: 6}}>
                      Giới tính: {student.gender}
                    </Text>
                    <Text style={{fontSize: 16, marginBottom: 6}}>
                      Ngày sinh:{" "}
                      {new Date(student.dateOfBirth).toLocaleDateString(
                        "vi-VN"
                      )}
                    </Text>
                  </View>
                </View>
              )}
              {tab === TAB_PROFILE && (
                <View>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: colors.primary,
                      marginBottom: 10,
                      textAlign: "center",
                    }}
                  >
                    Hồ sơ sức khỏe
                  </Text>
                  {healthProfile ? (
                    <View>
                      {healthProfile.allergies &&
                        Array.isArray(healthProfile.allergies) && (
                          <View style={{marginBottom: 8}}>
                            <Text style={{fontWeight: "bold", marginBottom: 2}}>
                              Dị ứng:
                            </Text>
                            {healthProfile.allergies.length === 0 ? (
                              <Text>Không có</Text>
                            ) : (
                              healthProfile.allergies.map((a, idx) => (
                                <View key={a._id || idx} style={itemBoxStyle}>
                                  <Text>
                                    <Text style={{fontWeight: "bold"}}>
                                      Tên:
                                    </Text>{" "}
                                    {a.name}
                                  </Text>
                                  <Text>
                                    <Text style={{fontWeight: "bold"}}>
                                      Mức độ:
                                    </Text>{" "}
                                    {a.severity}
                                  </Text>
                                  {a.notes ? (
                                    <Text>
                                      <Text style={{fontWeight: "bold"}}>
                                        Ghi chú:
                                      </Text>{" "}
                                      {a.notes}
                                    </Text>
                                  ) : null}
                                </View>
                              ))
                            )}
                          </View>
                        )}
                      {healthProfile.chronicDiseases &&
                        Array.isArray(healthProfile.chronicDiseases) && (
                          <View style={{marginBottom: 8}}>
                            <Text style={{fontWeight: "bold", marginBottom: 2}}>
                              Bệnh mãn tính:
                            </Text>
                            {healthProfile.chronicDiseases.length === 0 ? (
                              <Text>Không có</Text>
                            ) : (
                              healthProfile.chronicDiseases.map((c, idx) => (
                                <View key={c._id || idx} style={itemBoxStyle}>
                                  <Text>
                                    <Text style={{fontWeight: "bold"}}>
                                      Tên:
                                    </Text>{" "}
                                    {c.name}
                                  </Text>
                                  <Text>
                                    <Text style={{fontWeight: "bold"}}>
                                      Trạng thái:
                                    </Text>{" "}
                                    {c.status}
                                  </Text>
                                  {c.notes ? (
                                    <Text>
                                      <Text style={{fontWeight: "bold"}}>
                                        Ghi chú:
                                      </Text>{" "}
                                      {c.notes}
                                    </Text>
                                  ) : null}
                                </View>
                              ))
                            )}
                          </View>
                        )}
                      {healthProfile.treatmentHistory &&
                        Array.isArray(healthProfile.treatmentHistory) && (
                          <View style={{marginBottom: 8}}>
                            <Text style={{fontWeight: "bold", marginBottom: 2}}>
                              Lịch sử điều trị:
                            </Text>
                            {healthProfile.treatmentHistory.length === 0 ? (
                              <Text>Không có</Text>
                            ) : (
                              healthProfile.treatmentHistory.map((t, idx) => (
                                <View key={t._id || idx} style={itemBoxStyle}>
                                  <Text>
                                    <Text style={{fontWeight: "bold"}}>
                                      Bệnh:
                                    </Text>{" "}
                                    {t.condition}
                                  </Text>
                                  <Text>
                                    <Text style={{fontWeight: "bold"}}>
                                      Ngày điều trị:
                                    </Text>{" "}
                                    {treatmentDateFormat(t.treatmentDate)}
                                  </Text>
                                  <Text>
                                    <Text style={{fontWeight: "bold"}}>
                                      Phương pháp:
                                    </Text>{" "}
                                    {t.treatment}
                                  </Text>
                                  <Text>
                                    <Text style={{fontWeight: "bold"}}>
                                      Kết quả:
                                    </Text>{" "}
                                    {t.outcome}
                                  </Text>
                                </View>
                              ))
                            )}
                          </View>
                        )}
                      {healthProfile.vaccinations &&
                        Array.isArray(healthProfile.vaccinations) && (
                          <View style={{marginBottom: 8}}>
                            <Text style={{fontWeight: "bold", marginBottom: 2}}>
                              Tiêm chủng:{" "}
                            </Text>
                            {healthProfile.vaccinations.length === 0 ? (
                              <Text>Không có</Text>
                            ) : (
                              healthProfile.vaccinations.map((v, idx) => (
                                <View key={v._id || idx} style={itemBoxStyle}>
                                  <Text>
                                    <Text style={{fontWeight: "bold"}}>
                                      Tên:
                                    </Text>{" "}
                                    {v.name}
                                  </Text>
                                  <Text>
                                    <Text style={{fontWeight: "bold"}}>
                                      Ngày:
                                    </Text>{" "}
                                    {dateFormat(v.date)}
                                  </Text>
                                  {v.notes ? (
                                    <Text>
                                      <Text style={{fontWeight: "bold"}}>
                                        Ghi chú:
                                      </Text>{" "}
                                      {v.notes}
                                    </Text>
                                  ) : null}
                                </View>
                              ))
                            )}
                          </View>
                        )}
                      {/* Render các trường còn lại dạng primitive */}
                      {Object.entries(healthProfile).map(([key, value]) => {
                        if (
                          [
                            "allergies",
                            "chronicDiseases",
                            "treatmentHistory",
                            "vision",
                            "hearing",
                            "vaccinations",
                            "_id",
                            "createdAt",
                            "updatedAt",
                            "__v",
                          ].includes(key)
                        )
                          return null;
                        if (typeof value === "object") return null;
                        return (
                          <Text
                            key={key}
                            style={{fontSize: 15, marginBottom: 4}}
                          >
                            <Text style={{fontWeight: "bold"}}>{key}:</Text>{" "}
                            {String(value)}
                          </Text>
                        );
                      })}
                    </View>
                  ) : (
                    <Text style={{color: colors.textSecondary}}>
                      Chưa có hồ sơ sức khỏe
                    </Text>
                  )}
                </View>
              )}
              {tab === TAB_HISTORY && (
                <View style={{maxHeight: 300}}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: colors.primary,
                      marginBottom: 10,
                      textAlign: "center",
                    }}
                  >
                    Lịch sử y tế
                  </Text>
                  {medicalHistory &&
                  medicalHistory.medicalEvents &&
                  medicalHistory.medicalEvents.length > 0 ? (
                    medicalHistory.medicalEvents.map((event, idx) => (
                      <View key={event._id || idx} style={itemBoxStyle}>
                        <Text style={{fontWeight: "bold"}}>
                          Sự kiện: {event.event_type}
                        </Text>
                        <Text>Mô tả: {event.description}</Text>
                        <Text>
                          Ngày:{" "}
                          {event.date
                            ? new Date(event.date).toLocaleDateString("vi-VN")
                            : "Không có"}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text style={{color: colors.textSecondary}}>
                      Không có lịch sử y tế
                    </Text>
                  )}
                </View>
              )}
            </>
          )}
          <TouchableOpacity
            style={{marginTop: 16, alignItems: "center"}}
            onPress={onClose}
          >
            <Text style={{color: colors.textSecondary, fontWeight: "bold"}}>
              Đóng
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default StudentDetailModal;

// Thêm các hàm format ngày
function dateFormat(dateStr) {
  if (!dateStr) return "Không có";
  try {
    return new Date(dateStr).toLocaleDateString("vi-VN");
  } catch {
    return String(dateStr);
  }
}
function treatmentDateFormat(dateStr) {
  if (!dateStr) return "Không có";
  try {
    return new Date(dateStr).toLocaleDateString("vi-VN");
  } catch {
    return String(dateStr);
  }
}
