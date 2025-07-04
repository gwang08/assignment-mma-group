import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { parentsAPI } from '../../services/parentsAPI';

const ParentStudents = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await parentsAPI.getStudents();
      
      if (response.success && response.data) {
        // API trả về mảng các object với format: { student: {...}, relationship: "...", is_emergency_contact: ... }
        // Chúng ta cần extract ra các student objects
        const studentData = response.data.map((item) => item.student);
        setStudents(studentData);
      }
    } catch (error) {
      console.error('Error loading students:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi tải danh sách học sinh');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStudents();
    setRefreshing(false);
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setIsModalVisible(true);
  };

  const getGenderText = (gender) => {
    const genderLabels = {
      male: 'Nam',
      female: 'Nữ',
      other: 'Khác'
    };
    return genderLabels[gender] || gender;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa có thông tin';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const renderStudentItem = ({ item }) => (
    <View style={styles.studentCard}>
      <View style={styles.studentInfo}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={32} color="white" />
        </View>
        <View style={styles.studentDetails}>
          <Text style={styles.studentName}>
            {item.first_name} {item.last_name}
          </Text>
          <Text style={styles.studentClass}>
            Lớp: {item.class_name || 'Chưa có lớp'}
          </Text>
          <Text style={styles.studentId}>
            Mã HS: {item.student_id || 'Chưa có'}
          </Text>
          <Text style={styles.studentGender}>
            Giới tính: {getGenderText(item.gender)}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.viewButton}
        onPress={() => handleViewDetails(item)}
      >
        <Ionicons name="eye" size={20} color="white" />
        <Text style={styles.viewButtonText}>Xem</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={students}
        renderItem={renderStudentItem}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={colors.lightGray} />
            <Text style={styles.emptyText}>Chưa có học sinh nào</Text>
            <Text style={styles.emptySubtext}>
              Liên hệ với trường để thêm học sinh vào tài khoản của bạn
            </Text>
          </View>
        }
      />

      {/* Student Detail Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thông tin học sinh</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedStudent && (
              <View style={styles.modalBody}>
                <View style={styles.modalAvatar}>
                  <Ionicons name="person" size={48} color="white" />
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Họ và tên</Text>
                  <Text style={styles.detailValue}>
                    {selectedStudent.first_name} {selectedStudent.last_name}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Mã học sinh</Text>
                  <Text style={styles.detailValue}>
                    {selectedStudent.student_id || 'Chưa có'}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Lớp</Text>
                  <Text style={styles.detailValue}>
                    {selectedStudent.class_name || 'Chưa có lớp'}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Giới tính</Text>
                  <Text style={styles.detailValue}>
                    {getGenderText(selectedStudent.gender)}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Ngày sinh</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(selectedStudent.dateOfBirth)}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Địa chỉ</Text>
                  <Text style={styles.detailValue}>
                    {selectedStudent.address ? 
                      `${selectedStudent.address.street || ''}, ${selectedStudent.address.city || ''}, ${selectedStudent.address.state || ''}, ${selectedStudent.address.country || ''}`.replace(/(^,)|(,$)/g, '').replace(/,+/g, ', ') || 'Chưa có thông tin'
                      : 'Chưa có thông tin'}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Trạng thái</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: selectedStudent.is_active ? colors.success : colors.error }
                  ]}>
                    <Text style={styles.statusText}>
                      {selectedStudent.is_active ? 'Đang học' : 'Không hoạt động'}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Ngày tạo</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(selectedStudent.createdAt)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContainer: {
    padding: 20,
  },
  studentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  studentInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  studentClass: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  studentId: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  studentGender: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  viewButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textSecondary,
    marginTop: 15,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    height: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    padding: 20,
  },
  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  detailSection: {
    marginBottom: 15,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textSecondary,
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 16,
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ParentStudents;
