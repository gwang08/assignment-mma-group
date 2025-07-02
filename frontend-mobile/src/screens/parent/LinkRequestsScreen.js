import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { parentAPI } from "../../services/parentApi";
import ParentLayout from "../../components/ParentLayout";
import colors from "../../styles/colors";

const LinkRequestsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLinkRequests();
  }, []);

  const loadLinkRequests = async () => {
    try {
      setLoading(true);
      const response = await parentAPI.getLinkRequests();
      setRequests(response.data || []);
    } catch (error) {
      console.error("Load link requests error:", error);
      setRequests([]);
      Alert.alert("Lỗi", "Không thể tải danh sách yêu cầu liên kết");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLinkRequests();
    setRefreshing(false);
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Chờ duyệt";
      case "approved":
        return "Đã duyệt";
      case "rejected":
        return "Từ chối";
      default:
        return "Không rõ";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return colors.warning;
      case "approved":
        return colors.success;
      case "rejected":
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getRelationshipText = (relationship) => {
    switch (relationship) {
      case "parent":
        return "Cha/Mẹ";
      case "guardian":
        return "Người giám hộ";
      case "grandparent":
        return "Ông/Bà";
      case "relative":
        return "Họ hàng";
      case "other":
        return "Khác";
      default:
        return relationship || "Không rõ";
    }
  };

  const RequestCard = ({ request }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <View style={styles.requestInfo}>
          <Text style={styles.studentName}>
            {request.student?.first_name} {request.student?.last_name}
          </Text>
          <Text style={styles.studentClass}>
            Lớp: {request.student?.class || "Không rõ"}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(request.status) },
          ]}
        >
          <Text style={styles.statusText}>{getStatusText(request.status)}</Text>
        </View>
      </View>

      <View style={styles.requestDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Mối quan hệ:</Text>
          <Text style={styles.detailValue}>
            {getRelationshipText(request.relationship)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Liên hệ khẩn cấp:</Text>
          <Text style={styles.detailValue}>
            {request.is_emergency_contact ? "Có" : "Không"}
          </Text>
        </View>

        {request.notes && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Ghi chú:</Text>
            <Text style={styles.detailValue}>{request.notes}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Ngày gửi:</Text>
          <Text style={styles.detailValue}>
            {new Date(request.createdAt).toLocaleDateString("vi-VN")}
          </Text>
        </View>
      </View>
    </View>
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyTitle}>Chưa có yêu cầu liên kết</Text>
      <Text style={styles.emptyMessage}>
        Bạn chưa gửi yêu cầu liên kết với học sinh nào
      </Text>
      <TouchableOpacity
        style={styles.addRequestButton}
        onPress={() => navigation.navigate("LinkStudentRequest")}
      >
        <Text style={styles.addRequestButtonText}>Gửi yêu cầu liên kết</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ParentLayout navigation={navigation} title="Yêu Cầu Liên Kết">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Yêu cầu liên kết học sinh</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("LinkStudentRequest")}
          >
            <Text style={styles.addButtonText}>+ Tạo mới</Text>
          </TouchableOpacity>
        </View>

        {/* Requests List */}
        <FlatList
          data={requests}
          keyExtractor={(item) => item._id.toString()}
          renderItem={({ item }) => <RequestCard request={item} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={!loading ? <EmptyState /> : null}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </ParentLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: "600",
  },
  listContainer: {
    padding: 20,
  },
  requestCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  requestInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  studentClass: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.surface,
  },
  requestDetails: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
    flex: 2,
    textAlign: "right",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  addRequestButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addRequestButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default LinkRequestsScreen;
