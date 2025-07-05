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
import NurseCreationForm from './NurseCreationForm';

const NurseManagement = () => {
  const [nurses, setNurses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingNurse, setEditingNurse] = useState(null);

  useEffect(() => {
    fetchNurses();
  }, []);

  const fetchNurses = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getMedicalStaff();
      setNurses(response.data || []);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách y tá');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNurses();
    setRefreshing(false);
  };

  const handleEdit = (nurse) => {
    setEditingNurse(nurse);
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setEditingNurse(null);
    fetchNurses();
  };

  const handleCreateSuccess = () => {
    fetchNurses();
  };

  const handleDeactivate = (nurse) => {
    Alert.alert(
      'Xác nhận',
      `Bạn có chắc chắn muốn vô hiệu hóa y tá ${nurse.first_name} ${nurse.last_name}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Vô hiệu hóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminAPI.deactivateMedicalStaff(nurse._id);
              Alert.alert('Thành công', 'Đã vô hiệu hóa y tá');
              fetchNurses();
            } catch (error) {
              Alert.alert('Lỗi', error.message || 'Không thể vô hiệu hóa y tá');
            }
          },
        },
      ]
    );
  };

  const renderNurseItem = ({ item }) => (
    <View style={styles.modernCard}>
      <View style={styles.cardHeader}>
        <View style={[styles.avatarContainer, { backgroundColor: '#2196F3' }]}>
          <Text style={styles.avatarText}>
            {item.first_name?.charAt(0)}{item.last_name?.charAt(0)}
          </Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.first_name} {item.last_name}</Text>
          <Text style={styles.cardSubtitle}>{item.staff_role}</Text>
        </View>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>Email:</Text>
          <Text style={styles.infoText}>{item.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>Số điện thoại:</Text>
          <Text style={styles.infoText}>{item.phone_number}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>Giới tính:</Text>
          <Text style={styles.infoText}>{item.gender === 'male' ? 'Nam' : 'Nữ'}</Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={[styles.modernActionBtn, styles.editBtn]}
          onPress={() => handleEdit(item)}
        >
          <Text style={styles.actionText}>Sửa</Text>
        </TouchableOpacity>
        {item.is_active !== false && (
          <TouchableOpacity 
            style={[styles.modernActionBtn, styles.deleteBtn]}
            onPress={() => handleDeactivate(item)}
          >
            <Text style={styles.actionText}>Vô hiệu hóa</Text>
          </TouchableOpacity>
        )}
        {item.is_active === false && (
          <View style={[styles.modernActionBtn, styles.disabledBtn]}>
            <Text style={styles.disabledText}>Đã vô hiệu hóa</Text>
          </View>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Đang tải danh sách y tá...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={nurses}
        renderItem={renderNurseItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không có y tá nào</Text>
          </View>
        }
      />

      {/* FAB Create Button */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => setShowCreateModal(true)}
      >
        <Text style={styles.createButtonText}>+</Text>
      </TouchableOpacity>

      {/* Nurse Creation Modal */}
      <NurseCreationForm
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Nurse Edit Modal */}
      <NurseCreationForm
        visible={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingNurse(null);
        }}
        onSuccess={handleEditSuccess}
        editingNurse={editingNurse}
        isEditing={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80, // Space for FAB
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
  editBtn: {
    backgroundColor: '#3498DB',
  },
  deleteBtn: {
    backgroundColor: '#E74C3C',
  },
  disabledBtn: {
    backgroundColor: '#BDC3C7',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  disabledText: {
    color: '#7F8C8D',
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
  createButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default NurseManagement;
