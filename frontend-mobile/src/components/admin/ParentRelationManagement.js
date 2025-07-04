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

const ParentRelationManagement = () => {
  const [parentRelations, setParentRelations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchParentRelations();
  }, []);

  const fetchParentRelations = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getParentStudentRelations();
      setParentRelations(response.data || []);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải quan hệ phụ huynh-học sinh');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchParentRelations();
    setRefreshing(false);
  };

  const handleDeleteRelation = async (relationId) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn xóa mối quan hệ này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminAPI.deleteParentStudentRelation(relationId);
              Alert.alert('Thành công', 'Đã xóa mối quan hệ');
              fetchParentRelations();
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa mối quan hệ');
            }
          },
        },
      ]
    );
  };

  const renderParentRelationItem = ({ item }) => (
    <View style={styles.modernCard}>
      <View style={styles.cardHeader}>
        <View style={styles.relationContainer}>
          <View style={styles.parentSection}>
            <View style={[styles.avatarContainer, { backgroundColor: '#9C27B0' }]}>
              <Text style={styles.avatarText}>
                {item.parent?.first_name?.charAt(0)}{item.parent?.last_name?.charAt(0)}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {item.parent?.first_name} {item.parent?.last_name}
              </Text>
              <Text style={styles.userRole}>Phụ huynh</Text>
            </View>
          </View>

          <View style={styles.relationIndicator}>
            <Text style={styles.relationIcon}>👨‍👩‍👧‍👦</Text>
            <Text style={styles.relationText}>{item.relationship}</Text>
          </View>

          <View style={styles.studentSection}>
            <View style={[styles.avatarContainer, { backgroundColor: '#FF5722' }]}>
              <Text style={styles.avatarText}>
                {item.student?.first_name?.charAt(0)}{item.student?.last_name?.charAt(0)}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {item.student?.first_name} {item.student?.last_name}
              </Text>
              <Text style={styles.userRole}>Học sinh - Lớp {item.student?.class_name}</Text>
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📧</Text>
          <Text style={styles.infoText}>{item.parent?.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📱</Text>
          <Text style={styles.infoText}>{item.parent?.phone_number}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📅</Text>
          <Text style={styles.infoText}>
            Liên kết từ: {new Date(item.createdAt).toLocaleDateString('vi-VN')}
          </Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={[styles.modernActionBtn, styles.deleteBtn]}
          onPress={() => handleDeleteRelation(item._id)}
        >
          <Text style={styles.actionIcon}>🗑️</Text>
          <Text style={styles.actionText}>Xóa mối quan hệ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Đang tải quan hệ phụ huynh...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={parentRelations}
      renderItem={renderParentRelationItem}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không có quan hệ phụ huynh-học sinh nào</Text>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  relationContainer: {
    alignItems: 'center',
  },
  parentSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  studentSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  relationIndicator: {
    alignItems: 'center',
    marginVertical: 8,
  },
  relationIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  relationText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  avatarContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    color: '#7F8C8D',
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
    padding: 16,
    paddingTop: 0,
  },
  modernActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  deleteBtn: {
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

export default ParentRelationManagement;
