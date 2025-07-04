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
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { parentsAPI } from '../../services/parentsAPI';

const ParentConsultations = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [consultations, setConsultations] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [consultationsResponse, studentsResponse] = await Promise.all([
        parentsAPI.getConsultationSchedules(),
        parentsAPI.getStudents()
      ]);

      if (consultationsResponse.success && consultationsResponse.data) {
        setConsultations(consultationsResponse.data);
      }

      if (studentsResponse.success && studentsResponse.data) {
        const studentData = studentsResponse.data.map((item) => item.student);
        setStudents(studentData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    const normalizedStatus = status.toLowerCase();
    const colors = {
      requested: '#f39c12',
      scheduled: '#3498db',
      completed: '#27ae60',
      cancelled: '#e74c3c',
      rescheduled: '#9b59b6'
    };
    return colors[normalizedStatus] || '#95a5a6';
  };

  const getStatusText = (status) => {
    const normalizedStatus = status.toLowerCase();
    const statusText = {
      requested: 'Chờ xác nhận',
      scheduled: 'Đã lên lịch',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy',
      rescheduled: 'Đã dời lịch'
    };
    return statusText[normalizedStatus] || status;
  };

  const getConsultationTypeIcon = (type) => {
    const icons = {
      in_person: 'person',
      phone: 'call',
      video: 'videocam'
    };
    return icons[type] || 'person';
  };

  const getConsultationTypeText = (type) => {
    const typeText = {
      in_person: 'Tại chỗ',
      phone: 'Điện thoại',
      video: 'Video call'
    };
    return typeText[type] || 'Tại chỗ';
  };

  const getStudentName = (consultation) => {
    if (consultation.student) {
      return `${consultation.student.first_name} ${consultation.student.last_name}`;
    }
    const student = students.find(s => s._id === consultation.student_id);
    return student ? `${student.first_name} ${student.last_name}` : 'N/A';
  };

  const getMedicalStaffName = (consultation) => {
    if (consultation.medicalStaff) {
      return `${consultation.medicalStaff.first_name} ${consultation.medicalStaff.last_name}`;
    }
    return 'Chưa phân công';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa có thông tin';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Chưa có thông tin';
    const date = new Date(dateString);
    return `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const handleCancelConsultation = (consultation) => {
    Alert.alert(
      'Xác nhận hủy',
      'Bạn có chắc chắn muốn hủy lịch tư vấn này?',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Hủy lịch',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await parentsAPI.cancelConsultationRequest(consultation._id);
              if (response.success) {
                Alert.alert('Thành công', 'Hủy lịch tư vấn thành công');
                loadData();
              } else {
                Alert.alert('Lỗi', response.message || 'Có lỗi xảy ra');
              }
            } catch (error) {
              Alert.alert('Lỗi', 'Có lỗi xảy ra khi hủy lịch');
            }
          }
        }
      ]
    );
  };

  const renderConsultationItem = ({ item }) => (
    <View style={styles.consultationCard}>
      <View style={styles.consultationHeader}>
        <View style={styles.consultationInfo}>
          <Text style={styles.consultationReason}>{item.reason}</Text>
          <Text style={styles.studentName}>
            Học sinh: {getStudentName(item)}
          </Text>
          <Text style={styles.medicalStaff}>
            Nhân viên y tế: {getMedicalStaffName(item)}
          </Text>
          <Text style={styles.appointmentDate}>
            Ngày hẹn: {formatDate(item.appointment_date || item.scheduledDate)}
          </Text>
        </View>
        <View style={styles.consultationBadges}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.badgeText}>{getStatusText(item.status)}</Text>
          </View>
          <View style={styles.typeBadge}>
            <Ionicons 
              name={getConsultationTypeIcon(item.consultation_type)} 
              size={16} 
              color={colors.primary} 
            />
            <Text style={styles.typeText}>
              {getConsultationTypeText(item.consultation_type)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.consultationActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton]}
          onPress={() => {
            setSelectedConsultation(item);
            setIsDetailModalVisible(true);
          }}
        >
          <Ionicons name="eye" size={16} color="white" />
          <Text style={styles.actionButtonText}>Xem</Text>
        </TouchableOpacity>

        {(item.status === 'requested' || item.status === 'scheduled') && (
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => handleCancelConsultation(item)}
          >
            <Ionicons name="close" size={16} color="white" />
            <Text style={styles.actionButtonText}>Hủy</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={consultations}
        renderItem={renderConsultationItem}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color={colors.lightGray} />
            <Text style={styles.emptyText}>Chưa có lịch tư vấn nào</Text>
            <Text style={styles.emptySubtext}>
              Các lịch tư vấn sẽ hiển thị tại đây
            </Text>
          </View>
        }
      />

      {/* Consultation Detail Modal */}
      <Modal
        visible={isDetailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi tiết lịch tư vấn</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsDetailModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedConsultation && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Lý do tư vấn</Text>
                  <Text style={styles.detailValue}>{selectedConsultation.reason}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Học sinh</Text>
                  <Text style={styles.detailValue}>{getStudentName(selectedConsultation)}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Nhân viên y tế</Text>
                  <Text style={styles.detailValue}>{getMedicalStaffName(selectedConsultation)}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Ngày hẹn</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(selectedConsultation.appointment_date || selectedConsultation.scheduledDate)}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Hình thức tư vấn</Text>
                  <View style={styles.typeRow}>
                    <Ionicons 
                      name={getConsultationTypeIcon(selectedConsultation.consultation_type)} 
                      size={20} 
                      color={colors.primary} 
                    />
                    <Text style={styles.detailValue}>
                      {getConsultationTypeText(selectedConsultation.consultation_type)}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Trạng thái</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedConsultation.status) }]}>
                    <Text style={styles.badgeText}>{getStatusText(selectedConsultation.status)}</Text>
                  </View>
                </View>

                {selectedConsultation.duration && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Thời gian dự kiến</Text>
                    <Text style={styles.detailValue}>{selectedConsultation.duration} phút</Text>
                  </View>
                )}

                {selectedConsultation.notes && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Ghi chú</Text>
                    <Text style={styles.detailValue}>{selectedConsultation.notes}</Text>
                  </View>
                )}

                {selectedConsultation.doctor_notes && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Ghi chú của bác sĩ</Text>
                    <Text style={styles.detailValue}>{selectedConsultation.doctor_notes}</Text>
                  </View>
                )}

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Ngày tạo</Text>
                  <Text style={styles.detailValue}>{formatDate(selectedConsultation.createdAt)}</Text>
                </View>

                {selectedConsultation.follow_up_required && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Cần tái khám</Text>
                    <Text style={styles.detailValue}>
                      Có {selectedConsultation.follow_up_date && `- ${formatDate(selectedConsultation.follow_up_date)}`}
                    </Text>
                    {selectedConsultation.follow_up_notes && (
                      <Text style={styles.detailValue}>{selectedConsultation.follow_up_notes}</Text>
                    )}
                  </View>
                )}
              </ScrollView>
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
  consultationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  consultationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  consultationInfo: {
    flex: 1,
    marginRight: 10,
  },
  consultationReason: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  studentName: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  medicalStaff: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  appointmentDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  consultationBadges: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 5,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 10,
    color: colors.primary,
    marginLeft: 4,
  },
  consultationActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginLeft: 8,
  },
  viewButton: {
    backgroundColor: colors.info,
  },
  cancelButton: {
    backgroundColor: colors.error,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
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
  detailModalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    height: '90%',
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
    textAlign: 'center',
    marginBottom: 15,
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    flex: 1,
    padding: 20,
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
    marginLeft: 5,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default ParentConsultations;
