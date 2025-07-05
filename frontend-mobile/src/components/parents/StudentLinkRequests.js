import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { parentsAPI } from '../../services/parentsAPI';

const StudentLinkRequests = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [linkRequests, setLinkRequests] = useState([]);
  const [isRequestModalVisible, setIsRequestModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isRelationshipModalVisible, setIsRelationshipModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  // Form states
  const [studentId, setStudentId] = useState('');
  const [relationship, setRelationship] = useState('');
  const [isEmergencyContact, setIsEmergencyContact] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await parentsAPI.getStudentLinkRequests();
      if (response.success && response.data) {
        setLinkRequests(response.data);
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

  const handleCreateRequest = async () => {
    if (!studentId.trim() || !relationship) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      const response = await parentsAPI.createStudentLinkRequest(
        studentId.trim(), 
        relationship, 
        isEmergencyContact, 
        notes.trim()
      );
      
      if (response.success) {
        Alert.alert('Thành công', 'Yêu cầu liên kết đã được gửi thành công');
        setIsRequestModalVisible(false);
        resetForm();
        loadData();
      }
    } catch (error) {
      console.error('Error creating request:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi gửi yêu cầu');
    }
  };

  const resetForm = () => {
    setStudentId('');
    setRelationship('');
    setIsEmergencyContact(false);
    setNotes('');
    setIsRelationshipModalVisible(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#faad14',
      approved: '#52c41a',
      rejected: '#ff4d4f'
    };
    return colors[status] || '#d9d9d9';
  };

  const getStatusText = (status) => {
    const statusText = {
      pending: 'Chờ duyệt',
      approved: 'Đã duyệt',
      rejected: 'Đã từ chối'
    };
    return statusText[status] || status;
  };

  const getRelationshipText = (relationship) => {
    const relationshipText = {
      'Father': 'Bố',
      'Mother': 'Mẹ',
      'Guardian': 'Người giám hộ',
      'Grandfather': 'Ông',
      'Grandmother': 'Bà',
      'Uncle': 'Chú/Bác',
      'Aunt': 'Cô/Dì',
      'Other': 'Khác'
    };
    return relationshipText[relationship] || relationship;
  };

  const relationshipOptions = [
    { label: 'Bố', value: 'Father' },
    { label: 'Mẹ', value: 'Mother' },
    { label: 'Người giám hộ', value: 'Guardian' },
    { label: 'Ông', value: 'Grandfather' },
    { label: 'Bà', value: 'Grandmother' },
    { label: 'Chú/Bác', value: 'Uncle' },
    { label: 'Cô/Dì', value: 'Aunt' },
    { label: 'Khác', value: 'Other' },
  ];

  const handleRelationshipSelect = (value) => {
    console.log('handleRelationshipSelect called with:', value);
    setRelationship(value);
    setIsRelationshipModalVisible(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const renderStatCard = (title, value, iconName, color) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statContent}>
        <Ionicons name={iconName} size={24} color={color} />
        <View style={styles.statText}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
      </View>
    </View>
  );

  const renderRequestItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.requestCard}
      onPress={() => {
        setSelectedRequest(item);
        setIsDetailModalVisible(true);
      }}
    >
      <View style={styles.requestHeader}>
        <View style={styles.studentInfo}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={24} color="#fff" />
          </View>
          <View style={styles.studentDetails}>
            <Text style={styles.studentName}>
              {item.student?.first_name} {item.student?.last_name}
            </Text>
            <Text style={styles.studentClass}>Lớp: {item.student?.class_name}</Text>
            {item.student?.student_id && (
              <Text style={styles.studentId}>MSHS: {item.student.student_id}</Text>
            )}
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <View style={styles.requestDetails}>
        <View style={styles.relationshipContainer}>
          <View style={styles.relationshipBadge}>
            <Text style={styles.relationshipText}>{getRelationshipText(item.relationship)}</Text>
          </View>
          {item.is_emergency_contact && (
            <View style={styles.emergencyBadge}>
              <Ionicons name="call" size={12} color="#fff" />
              <Text style={styles.emergencyText}>Liên hệ khẩn cấp</Text>
            </View>
          )}
        </View>
        <Text style={styles.dateText}>Ngày tạo: {formatDate(item.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderDetailModal = () => {
    if (!selectedRequest) return null;

    return (
      <Modal
        visible={isDetailModalVisible}
        animationType="slide"
        onRequestClose={() => {
          setIsDetailModalVisible(false);
          setSelectedRequest(null);
        }}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chi tiết yêu cầu liên kết</Text>
            <TouchableOpacity
              onPress={() => setIsDetailModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={true}>
            {/* Status Section */}
            <View style={styles.detailSection}>
              <View style={styles.statusHeader}>
                <Text style={styles.sectionTitle}>Trạng thái</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedRequest.status) }]}>
                  <Text style={styles.statusText}>{getStatusText(selectedRequest.status)}</Text>
                </View>
              </View>
            </View>

            {/* Student Info Section */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Thông tin học sinh</Text>
              <View style={styles.studentInfoCard}>
                <View style={styles.studentHeader}>
                  <View style={styles.avatarLarge}>
                    <Ionicons name="person" size={32} color="#fff" />
                  </View>
                  <View style={styles.studentDetailsLarge}>
                    <Text style={styles.studentNameLarge}>
                      {selectedRequest.student?.first_name} {selectedRequest.student?.last_name}
                    </Text>
                    <Text style={styles.studentInfo}>Lớp: {selectedRequest.student?.class_name}</Text>
                    <Text style={styles.studentInfo}>MSHS: {selectedRequest.student?.student_id || 'Chưa có'}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Relationship Info */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Thông tin mối quan hệ</Text>
              <View style={styles.infoGrid}>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Mối quan hệ</Text>
                  <View style={styles.relationshipBadge}>
                    <Text style={styles.relationshipText}>{getRelationshipText(selectedRequest.relationship)}</Text>
                  </View>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Liên hệ khẩn cấp</Text>
                  {selectedRequest.is_emergency_contact ? (
                    <View style={styles.emergencyBadge}>
                      <Ionicons name="call" size={12} color="#fff" />
                      <Text style={styles.emergencyText}>Có</Text>
                    </View>
                  ) : (
                    <Text style={styles.noEmergencyText}>Không</Text>
                  )}
                </View>
              </View>
            </View>

            {/* Time Info */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Thông tin thời gian</Text>
              <View style={styles.timeInfo}>
                <View style={styles.timeItem}>
                  <Text style={styles.timeLabel}>Ngày tạo:</Text>
                  <Text style={styles.timeValue}>{formatDateTime(selectedRequest.createdAt)}</Text>
                </View>
                <View style={styles.timeItem}>
                  <Text style={styles.timeLabel}>Cập nhật cuối:</Text>
                  <Text style={styles.timeValue}>{formatDateTime(selectedRequest.updatedAt)}</Text>
                </View>
                <View style={styles.timeItem}>
                  <Text style={styles.timeLabel}>Trạng thái hoạt động:</Text>
                  <Text style={[styles.timeValue, { color: selectedRequest.is_active ? '#52c41a' : '#666' }]}>
                    {selectedRequest.is_active ? 'Đang hoạt động' : 'Không hoạt động'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Notes Section */}
            {selectedRequest.notes && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Ghi chú</Text>
                <View style={styles.notesCard}>
                  <Text style={styles.notesText}>{selectedRequest.notes}</Text>
                </View>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  const renderCreateModal = () => (
    <Modal
      visible={isRequestModalVisible}
      animationType="slide"
      onRequestClose={() => {
        setIsRequestModalVisible(false);
        resetForm();
      }}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Tạo yêu cầu liên kết học sinh</Text>
          <TouchableOpacity
            onPress={() => {
              setIsRequestModalVisible(false);
              resetForm();
            }}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={true}>
          <View style={styles.formContainer}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Mã số học sinh (MSHS) *</Text>
              <TextInput
                style={styles.textInput}
                value={studentId}
                onChangeText={setStudentId}
                placeholder="Nhập mã số học sinh (VD: SE1701)"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Mối quan hệ *</Text>
              <TouchableOpacity
                style={styles.relationshipSelector}
                onPress={() => {
                  console.log('Relationship selector pressed');
                  // Sử dụng Alert.alert với options thay vì modal
                  Alert.alert(
                    'Chọn mối quan hệ',
                    'Vui lòng chọn mối quan hệ của bạn với học sinh',
                    relationshipOptions.map(option => ({
                      text: option.label,
                      onPress: () => {
                        console.log('Selected relationship:', option.value);
                        setRelationship(option.value);
                      }
                    })).concat([
                      {
                        text: 'Hủy',
                        style: 'cancel',
                        onPress: () => console.log('Cancelled relationship selection')
                      }
                    ]),
                    { cancelable: true }
                  );
                }}
              >
                <Text style={[styles.relationshipSelectorText, !relationship && styles.placeholderText]}>
                  {relationship ? getRelationshipText(relationship) : 'Chọn mối quan hệ với học sinh'}
                </Text>
                <Ionicons name="chevron-down" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <View style={styles.switchContainer}>
                <Text style={styles.formLabel}>Liên hệ khẩn cấp</Text>
                <Switch
                  value={isEmergencyContact}
                  onValueChange={setIsEmergencyContact}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={isEmergencyContact ? '#f5dd4b' : '#f4f3f4'}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Ghi chú</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Ghi chú thêm về mối quan hệ (nếu có)"
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              setIsRequestModalVisible(false);
              resetForm();
            }}
          >
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleCreateRequest}
          >
            <Text style={styles.submitButtonText}>Gửi yêu cầu</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );

  const pendingRequests = linkRequests.filter(r => r.status === 'pending');
  const approvedRequests = linkRequests.filter(r => r.status === 'approved');
  const emergencyContacts = linkRequests.filter(r => r.is_emergency_contact && r.status === 'approved');

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1890ff" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Liên kết học sinh</Text>
        <Text style={styles.subtitle}>Quản lý yêu cầu liên kết với học sinh</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={true}
      >
        {/* Statistics */}
        <View style={styles.statsContainer}>
          {renderStatCard('Tổng yêu cầu', linkRequests.length, 'people-outline', '#3f8600')}
          {renderStatCard('Chờ duyệt', pendingRequests.length, 'time-outline', '#fa8c16')}
          {renderStatCard('Đã duyệt', approvedRequests.length, 'checkmark-circle-outline', '#52c41a')}
          {renderStatCard('Liên hệ khẩn cấp', emergencyContacts.length, 'call-outline', '#1890ff')}
        </View>

        {/* Add New Request Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsRequestModalVisible(true)}
        >
          <Ionicons name="person-add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Yêu cầu liên kết mới</Text>
        </TouchableOpacity>

        {/* Requests List */}
        <View style={styles.requestsContainer}>
          <Text style={styles.sectionTitle}>Danh sách yêu cầu liên kết</Text>
          {linkRequests.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="folder-open-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>Chưa có yêu cầu liên kết nào</Text>
            </View>
          ) : (
            <FlatList
              data={linkRequests}
              renderItem={renderRequestItem}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
            />
          )}
        </View>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <View style={styles.requestsContainer}>
            <Text style={styles.sectionTitle}>Yêu cầu cần xử lý</Text>
            <FlatList
              data={pendingRequests.slice(0, 5)}
              renderItem={renderRequestItem}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
            />
          </View>
        )}
      </ScrollView>

      {renderCreateModal()}
      {renderDetailModal()}

      {/* Relationship Selection Modal */}
      <Modal
        visible={isRelationshipModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          console.log('Relationship modal close requested');
          setIsRelationshipModalVisible(false);
        }}
      >
        <View style={[styles.relationshipModalOverlay, { backgroundColor: 'rgba(255, 0, 0, 0.5)' }]}>
          <View style={styles.relationshipModalContent}>
            <View style={styles.relationshipModalHeader}>
              <Text style={styles.relationshipModalTitle}>Chọn mối quan hệ</Text>
              <TouchableOpacity
                onPress={() => {
                  console.log('Close button pressed');
                  setIsRelationshipModalVisible(false);
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.relationshipList}>
              {relationshipOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.relationshipOption,
                    relationship === option.value && styles.selectedRelationshipOption
                  ]}
                  onPress={() => {
                    console.log('Selected relationship:', option.value);
                    handleRelationshipSelect(option.value);
                  }}
                >
                  <Text style={[
                    styles.relationshipOptionText,
                    relationship === option.value && styles.selectedRelationshipOptionText
                  ]}>
                    {option.label}
                  </Text>
                  {relationship === option.value && (
                    <Ionicons name="checkmark" size={20} color="#1890ff" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
  },
  addButton: {
    backgroundColor: '#1890ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  requestsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1890ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLarge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1890ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentDetails: {
    marginLeft: 12,
    flex: 1,
  },
  studentDetailsLarge: {
    marginLeft: 16,
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  studentNameLarge: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  studentClass: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  studentId: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  requestDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  relationshipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  relationshipBadge: {
    backgroundColor: '#1890ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  relationshipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  emergencyBadge: {
    backgroundColor: '#ff4d4f',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  emergencyText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
    marginLeft: 4,
  },
  noEmergencyText: {
    color: '#666',
    fontSize: 12,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  detailSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  studentInfoCard: {
    marginTop: 12,
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  infoCard: {
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  timeInfo: {
    marginTop: 12,
  },
  timeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
  },
  timeValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  notesCard: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d9d9d9',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
  },
  relationshipSelector: {
    borderWidth: 1,
    borderColor: '#d9d9d9',
    borderRadius: 6,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  relationshipSelectorText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d9d9d9',
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalFooter: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e8e8e8',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 6,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#1890ff',
    padding: 16,
    borderRadius: 6,
    marginLeft: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  relationshipModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  relationshipModalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '70%',
  },
  relationshipModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
  },
  relationshipModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  relationshipList: {
    maxHeight: 400,
  },
  relationshipOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedRelationshipOption: {
    backgroundColor: '#f0f8ff',
  },
  relationshipOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedRelationshipOptionText: {
    color: '#1890ff',
    fontWeight: '600',
  },
});

export default StudentLinkRequests;
