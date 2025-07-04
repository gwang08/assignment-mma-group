import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { adminAPI } from '../../services/adminApi';
import colors from '../../styles/colors';

const LinkRequestManagement = () => {
  const [linkRequests, setLinkRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLinkRequests();
  }, []);

  const fetchLinkRequests = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getStudentLinkRequests();
      setLinkRequests(response.data || []);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách yêu cầu liên kết');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLinkRequests();
    setRefreshing(false);
  };

  const handleApprove = async (requestId) => {
    try {
      await adminAPI.approveStudentLinkRequest(requestId);
      Alert.alert('Thành công', 'Đã phê duyệt yêu cầu liên kết');
      fetchLinkRequests();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể phê duyệt yêu cầu');
    }
  };

  const handleReject = async (requestId) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn từ chối yêu cầu này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Từ chối',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminAPI.rejectStudentLinkRequest(requestId);
              Alert.alert('Thành công', 'Đã từ chối yêu cầu liên kết');
              fetchLinkRequests();
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể từ chối yêu cầu');
            }
          },
        },
      ]
    );
  };

  const renderLinkRequestItem = ({ item }) => (
    <View style={styles.modernCard}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {item.parent?.first_name?.charAt(0)}{item.parent?.last_name?.charAt(0)}
          </Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>
            {item.parent?.first_name} {item.parent?.last_name}
          </Text>
          <Text style={styles.cardSubtitle}>
            Yêu cầu liên kết với {item.student?.first_name} {item.student?.last_name}
          </Text>
        </View>
        <View style={[styles.statusBadge, {
          backgroundColor: item.status === 'pending' ? '#FF9800' : 
                          item.status === 'approved' ? '#4CAF50' : '#F44336'
        }]}>
          <Text style={styles.statusText}>
            {item.status === 'pending' ? 'Chờ' : 
             item.status === 'approved' ? 'Duyệt' : 'Từ chối'}
          </Text>
        </View>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>👨‍👩‍👧‍👦</Text>
          <Text style={styles.infoText}>Quan hệ: {item.relationship}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>🏫</Text>
          <Text style={styles.infoText}>Lớp: {item.student?.class_name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📧</Text>
          <Text style={styles.infoText}>{item.parent?.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📱</Text>
          <Text style={styles.infoText}>{item.parent?.phone_number}</Text>
        </View>
      </View>

      {item.status === 'pending' && (
        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={[styles.modernActionBtn, styles.approveBtn]}
            onPress={() => handleApprove(item._id)}
          >
            <Text style={styles.actionIcon}>✅</Text>
            <Text style={styles.actionText}>Phê duyệt</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.modernActionBtn, styles.rejectBtn]}
            onPress={() => handleReject(item._id)}
          >
            <Text style={styles.actionIcon}>❌</Text>
            <Text style={styles.actionText}>Từ chối</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Đang tải yêu cầu liên kết...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={linkRequests}
      renderItem={renderLinkRequestItem}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không có yêu cầu liên kết nào</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  modernCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardContent: {
    padding: 16,
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
  cardActions: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 0,
  },
  modernActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  approveBtn: {
    backgroundColor: '#4CAF50',
  },
  rejectBtn: {
    backgroundColor: '#E74C3C',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
  },
});

export default LinkRequestManagement;
