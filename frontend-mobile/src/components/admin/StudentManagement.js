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
import StudentCreationForm from './StudentCreationForm';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getStudents();
      setStudents(response.data || []);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách học sinh');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStudents();
    setRefreshing(false);
  };

  const handleCreateSuccess = () => {
    fetchStudents();
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setEditingStudent(null);
    fetchStudents();
  };

  const handleDeactivate = (student) => {
    Alert.alert(
      'Xác nhận',
      `Bạn có chắc chắn muốn vô hiệu hóa học sinh ${student.first_name} ${student.last_name}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Vô hiệu hóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminAPI.deactivateStudent(student._id);
              Alert.alert('Thành công', 'Đã vô hiệu hóa học sinh');
              fetchStudents();
            } catch (error) {
              Alert.alert('Lỗi', error.message || 'Không thể vô hiệu hóa học sinh');
            }
          },
        },
      ]
    );
  };

  const renderStudentItem = ({ item }) => (
    <View style={styles.modernCard}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {item.first_name?.charAt(0)}{item.last_name?.charAt(0)}
          </Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.first_name} {item.last_name}</Text>
          <Text style={styles.cardSubtitle}>Lớp {item.class_name}</Text>
        </View>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>Ngày sinh:</Text>
          <Text style={styles.infoText}>{item.dateOfBirth}</Text>
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
        <Text style={styles.loadingText}>Đang tải danh sách học sinh...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={students}
        renderItem={renderStudentItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không có học sinh nào</Text>
          </View>
        }
      />
      
      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Student Creation Modal */}
      <StudentCreationForm
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Student Edit Modal */}
      <StudentCreationForm
        visible={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingStudent(null);
        }}
        onSuccess={handleEditSuccess}
        editingStudent={editingStudent}
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
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  fabIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default StudentManagement;
