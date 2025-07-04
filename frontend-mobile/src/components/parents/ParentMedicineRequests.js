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
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { parentsAPI } from '../../services/parentsAPI';
import DateTimePicker from '@react-native-community/datetimepicker';

const ParentMedicineRequests = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requests, setRequests] = useState([]);
  const [students, setStudents] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [editingRequest, setEditingRequest] = useState(null);

  // Form states
  const [selectedStudent, setSelectedStudent] = useState('');
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [instructions, setInstructions] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [requestsResponse, studentsResponse] = await Promise.all([
        parentsAPI.getMedicineRequests(),
        parentsAPI.getStudents()
      ]);

      if (requestsResponse.success && requestsResponse.data) {
        setRequests(requestsResponse.data);
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
    const colors = {
      pending: '#f39c12',
      approved: '#27ae60',
      rejected: '#e74c3c',
      completed: '#3498db'
    };
    return colors[status] || '#95a5a6';
  };

  const getStatusText = (status) => {
    const statusText = {
      pending: 'Chờ duyệt',
      approved: 'Đã duyệt',
      rejected: 'Bị từ chối',
      completed: 'Hoàn thành'
    };
    return statusText[status] || status;
  };

  const getStudentName = (request) => {
    if (request.student) {
      return `${request.student.first_name} ${request.student.last_name}`;
    }
    const student = students.find(s => s._id === request.student_id);
    return student ? `${student.first_name} ${student.last_name}` : 'N/A';
  };

  const handleCreateRequest = async () => {
    try {
      if (!selectedStudent || !medicineName || !dosage || !frequency) {
        Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
        return;
      }

      const requestData = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        medicines: [{
          name: medicineName,
          dosage: dosage,
          frequency: frequency,
          notes: instructions
        }]
      };

      const response = await parentsAPI.createMedicineRequestForStudent(selectedStudent, requestData);
      if (response.success) {
        Alert.alert('Thành công', 'Tạo yêu cầu thuốc thành công');
        setIsModalVisible(false);
        resetForm();
        loadData();
      } else {
        Alert.alert('Lỗi', response.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi tạo yêu cầu');
    }
  };

  const handleUpdateRequest = async () => {
    try {
      if (!editingRequest || !medicineName || !dosage || !frequency) {
        Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
        return;
      }

      const updateData = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        medicines: [{
          name: medicineName,
          dosage: dosage,
          frequency: frequency,
          notes: instructions
        }]
      };

      const response = await parentsAPI.updateMedicineRequest(editingRequest._id, updateData);
      if (response.success) {
        Alert.alert('Thành công', 'Cập nhật yêu cầu thuốc thành công');
        setIsModalVisible(false);
        setEditingRequest(null);
        resetForm();
        loadData();
      } else {
        Alert.alert('Lỗi', response.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi cập nhật yêu cầu');
    }
  };

  const handleDeleteRequest = (request) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa yêu cầu này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await parentsAPI.deleteMedicineRequest(request._id);
              if (response.success) {
                Alert.alert('Thành công', 'Xóa yêu cầu thuốc thành công');
                loadData();
              } else {
                Alert.alert('Lỗi', response.message || 'Có lỗi xảy ra');
              }
            } catch (error) {
              Alert.alert('Lỗi', 'Có lỗi xảy ra khi xóa yêu cầu');
            }
          }
        }
      ]
    );
  };

  const handleEditRequest = (request) => {
    setEditingRequest(request);
    const medicine = request.medicines?.[0] || {};
    setSelectedStudent(request.student_id);
    setMedicineName(medicine.name || request.medicine_name || '');
    setDosage(medicine.dosage || request.dosage || '');
    setFrequency(medicine.frequency || request.frequency || '');
    setInstructions(medicine.notes || request.instructions || '');
    setStartDate(new Date(request.startDate || request.start_date || new Date()));
    setEndDate(new Date(request.endDate || request.end_date || new Date()));
    setIsModalVisible(true);
  };

  const resetForm = () => {
    setSelectedStudent('');
    setMedicineName('');
    setDosage('');
    setFrequency('');
    setInstructions('');
    setStartDate(new Date());
    setEndDate(new Date());
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const renderRequestItem = ({ item }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <View style={styles.requestInfo}>
          <Text style={styles.medicineName}>
            {item.medicines?.[0]?.name || item.medicine_name || 'Thuốc'}
          </Text>
          <Text style={styles.studentName}>
            Học sinh: {getStudentName(item)}
          </Text>
          <Text style={styles.requestDate}>
            Ngày tạo: {formatDate(item.createdAt)}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.requestDetails}>
        <Text style={styles.detailText}>
          Liều lượng: {item.medicines?.[0]?.dosage || item.dosage || 'N/A'}
        </Text>
        <Text style={styles.detailText}>
          Tần suất: {item.medicines?.[0]?.frequency || item.frequency || 'N/A'}
        </Text>
        <Text style={styles.detailText}>
          Thời gian: {formatDate(item.startDate || item.start_date)} - {formatDate(item.endDate || item.end_date)}
        </Text>
      </View>

      <View style={styles.requestActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton]}
          onPress={() => {
            setSelectedRequest(item);
            setIsDetailModalVisible(true);
          }}
        >
          <Ionicons name="eye" size={16} color="white" />
          <Text style={styles.actionButtonText}>Xem</Text>
        </TouchableOpacity>

        {item.status === 'pending' && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => handleEditRequest(item)}
            >
              <Ionicons name="create" size={16} color="white" />
              <Text style={styles.actionButtonText}>Sửa</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteRequest(item)}
            >
              <Ionicons name="trash" size={16} color="white" />
              <Text style={styles.actionButtonText}>Xóa</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setEditingRequest(null);
          resetForm();
          setIsModalVisible(true);
        }}
      >
        <Ionicons name="add" size={24} color="white" />
        <Text style={styles.addButtonText}>Tạo yêu cầu thuốc</Text>
      </TouchableOpacity>

      <FlatList
        data={requests}
        renderItem={renderRequestItem}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="medical-outline" size={64} color={colors.lightGray} />
            <Text style={styles.emptyText}>Chưa có yêu cầu thuốc nào</Text>
            <Text style={styles.emptySubtext}>
              Tạo yêu cầu thuốc đầu tiên cho con em của bạn
            </Text>
          </View>
        }
      />

      {/* Create/Edit Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingRequest ? 'Cập nhật yêu cầu thuốc' : 'Tạo yêu cầu thuốc'}
            </Text>
            
            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={true}>
              <Text style={styles.label}>Chọn học sinh:</Text>
              <View style={styles.pickerContainer}>
                {students.map((student) => (
                  <TouchableOpacity
                    key={student._id}
                    style={[
                      styles.studentOption,
                      selectedStudent === student._id && styles.selectedStudentOption
                    ]}
                    onPress={() => setSelectedStudent(student._id)}
                    disabled={!!editingRequest}
                  >
                    <Text style={[
                      styles.studentOptionText,
                      selectedStudent === student._id && styles.selectedStudentOptionText
                    ]}>
                      {student.first_name} {student.last_name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Tên thuốc:</Text>
              <TextInput
                style={styles.input}
                value={medicineName}
                onChangeText={setMedicineName}
                placeholder="Nhập tên thuốc"
              />

              <Text style={styles.label}>Liều lượng:</Text>
              <TextInput
                style={styles.input}
                value={dosage}
                onChangeText={setDosage}
                placeholder="Ví dụ: 1 viên"
              />

              <Text style={styles.label}>Tần suất:</Text>
              <TextInput
                style={styles.input}
                value={frequency}
                onChangeText={setFrequency}
                placeholder="Ví dụ: 2 lần/ngày"
              />

              <Text style={styles.label}>Ngày bắt đầu:</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text>{startDate.toLocaleDateString('vi-VN')}</Text>
              </TouchableOpacity>

              <Text style={styles.label}>Ngày kết thúc:</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Text>{endDate.toLocaleDateString('vi-VN')}</Text>
              </TouchableOpacity>

              <Text style={styles.label}>Ghi chú:</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={instructions}
                onChangeText={setInstructions}
                placeholder="Ghi chú thêm"
                multiline
                numberOfLines={3}
              />
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setIsModalVisible(false);
                  setEditingRequest(null);
                  resetForm();
                }}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={editingRequest ? handleUpdateRequest : handleCreateRequest}
              >
                <Text style={styles.submitButtonText}>
                  {editingRequest ? 'Cập nhật' : 'Tạo yêu cầu'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {showStartDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowStartDatePicker(false);
              if (selectedDate) setStartDate(selectedDate);
            }}
          />
        )}

        {showEndDatePicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowEndDatePicker(false);
              if (selectedDate) setEndDate(selectedDate);
            }}
          />
        )}
      </Modal>

      {/* Detail Modal */}
      <Modal
        visible={isDetailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.detailModalTitle}>Chi tiết yêu cầu thuốc</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsDetailModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedRequest && (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={true}>
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Tên thuốc</Text>
                  <Text style={styles.detailValue}>
                    {selectedRequest.medicines?.[0]?.name || selectedRequest.medicine_name || 'N/A'}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Học sinh</Text>
                  <Text style={styles.detailValue}>{getStudentName(selectedRequest)}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Liều lượng</Text>
                  <Text style={styles.detailValue}>
                    {selectedRequest.medicines?.[0]?.dosage || selectedRequest.dosage || 'N/A'}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Tần suất</Text>
                  <Text style={styles.detailValue}>
                    {selectedRequest.medicines?.[0]?.frequency || selectedRequest.frequency || 'N/A'}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Thời gian sử dụng</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(selectedRequest.startDate || selectedRequest.start_date)} - {formatDate(selectedRequest.endDate || selectedRequest.end_date)}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Trạng thái</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedRequest.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(selectedRequest.status)}</Text>
                  </View>
                </View>

                {selectedRequest.medicines?.[0]?.notes || selectedRequest.instructions ? (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Ghi chú</Text>
                    <Text style={styles.detailValue}>
                      {selectedRequest.medicines?.[0]?.notes || selectedRequest.instructions}
                    </Text>
                  </View>
                ) : null}

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Ngày tạo</Text>
                  <Text style={styles.detailValue}>{formatDate(selectedRequest.createdAt)}</Text>
                </View>

                {selectedRequest.approved_at && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Ngày duyệt</Text>
                    <Text style={styles.detailValue}>{formatDate(selectedRequest.approved_at)}</Text>
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
  addButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    margin: 20,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  requestCard: {
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
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  requestInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  studentName: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  requestDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  requestDetails: {
    marginBottom: 15,
  },
  detailText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 2,
  },
  requestActions: {
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
  editButton: {
    backgroundColor: colors.warning,
  },
  deleteButton: {
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
    padding: 20,
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
  detailModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    marginBottom: 10,
  },
  studentOption: {
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: 'white',
  },
  selectedStudentOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  studentOptionText: {
    fontSize: 16,
    color: colors.text,
  },
  selectedStudentOptionText: {
    color: 'white',
    fontWeight: 'bold',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
  },
  modalScrollView: {
    flexGrow: 1,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: colors.lightGray,
  },
  submitButton: {
    backgroundColor: colors.primary,
  },
  cancelButtonText: {
    color: colors.text,
    fontWeight: 'bold',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
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
});

export default ParentMedicineRequests;
