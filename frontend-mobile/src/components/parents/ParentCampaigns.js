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

const ParentCampaigns = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [campaignsResponse, studentsResponse] = await Promise.all([
        parentsAPI.getCampaigns(),
        parentsAPI.getStudents()
      ]);

      if (campaignsResponse.success && campaignsResponse.data) {
        setCampaigns(campaignsResponse.data);
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

  const getCampaignTypeColor = (type) => {
    const colors = {
      Vaccination: '#e74c3c',
      Checkup: '#3498db',
      Health_Check: '#27ae60',
      Nutrition_Program: '#f39c12',
      Mental_Health: '#9b59b6'
    };
    return colors[type] || '#95a5a6';
  };

  const getCampaignTypeText = (type) => {
    const typeText = {
      Vaccination: 'Tiêm chủng',
      Checkup: 'Khám sức khỏe',
      Health_Check: 'Kiểm tra sức khỏe',
      Nutrition_Program: 'Chương trình dinh dưỡng',
      Mental_Health: 'Sức khỏe tâm thần'
    };
    return typeText[type] || type;
  };

  const getCampaignStatusColor = (status) => {
    const colors = {
      draft: '#95a5a6',
      active: '#27ae60',
      completed: '#3498db',
      cancelled: '#e74c3c'
    };
    return colors[status] || '#95a5a6';
  };

  const getCampaignStatusText = (status) => {
    const statusText = {
      draft: 'Nháp',
      active: 'Đang diễn ra',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy'
    };
    return statusText[status] || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa có thông tin';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const isDateInRange = (campaignDate, startDate, endDate) => {
    const date = new Date(campaignDate);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return date >= start && date <= end;
  };

  const handleViewDetails = (campaign) => {
    setSelectedCampaign(campaign);
    setIsDetailModalVisible(true);
  };

  const handleSubmitConsent = async (campaign, studentId, consentGiven) => {
    try {
      const consentData = {
        consent_given: consentGiven,
        notes: consentGiven ? 'Đồng ý tham gia' : 'Không đồng ý tham gia'
      };

      const response = await parentsAPI.submitCampaignConsent(campaign._id, studentId, consentData);
      if (response.success) {
        Alert.alert('Thành công', `Đã ${consentGiven ? 'đồng ý' : 'từ chối'} tham gia chiến dịch`);
        loadData();
      } else {
        Alert.alert('Lỗi', response.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi gửi phản hồi');
    }
  };

  const renderCampaignItem = ({ item }) => (
    <View style={styles.campaignCard}>
      <View style={styles.campaignHeader}>
        <View style={styles.campaignInfo}>
          <Text style={styles.campaignTitle}>{item.title}</Text>
          <Text style={styles.campaignDescription} numberOfLines={2}>
            {item.description || 'Không có mô tả'}
          </Text>
          <Text style={styles.campaignDate}>
            {formatDate(item.date || item.start_date)} - {formatDate(item.end_date)}
          </Text>
        </View>
        <View style={styles.campaignBadges}>
          <View style={[styles.typeBadge, { backgroundColor: getCampaignTypeColor(item.type) }]}>
            <Text style={styles.badgeText}>{getCampaignTypeText(item.type)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getCampaignStatusColor(item.status) }]}>
            <Text style={styles.badgeText}>{getCampaignStatusText(item.status)}</Text>
          </View>
        </View>
      </View>

      {item.requires_consent && item.status === 'active' && (
        <View style={styles.consentSection}>
          <Text style={styles.consentTitle}>Yêu cầu xác nhận tham gia:</Text>
          {students.map((student) => (
            <View key={student._id} style={styles.studentConsentRow}>
              <Text style={styles.studentName}>
                {student.first_name} {student.last_name}
              </Text>
              <View style={styles.consentButtons}>
                <TouchableOpacity
                  style={[styles.consentButton, styles.acceptButton]}
                  onPress={() => handleSubmitConsent(item, student._id, true)}
                >
                  <Ionicons name="checkmark" size={16} color="white" />
                  <Text style={styles.consentButtonText}>Đồng ý</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.consentButton, styles.rejectButton]}
                  onPress={() => handleSubmitConsent(item, student._id, false)}
                >
                  <Ionicons name="close" size={16} color="white" />
                  <Text style={styles.consentButtonText}>Từ chối</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={styles.campaignActions}>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => handleViewDetails(item)}
        >
          <Ionicons name="eye" size={16} color="white" />
          <Text style={styles.viewButtonText}>Xem chi tiết</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={campaigns}
        renderItem={renderCampaignItem}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="shield-outline" size={64} color={colors.lightGray} />
            <Text style={styles.emptyText}>Chưa có chiến dịch nào</Text>
            <Text style={styles.emptySubtext}>
              Các chiến dịch y tế sẽ được hiển thị tại đây
            </Text>
          </View>
        }
      />

      {/* Campaign Detail Modal */}
      <Modal
        visible={isDetailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi tiết chiến dịch</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsDetailModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedCampaign && (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={true}>
                <Text style={styles.modalCampaignTitle}>{selectedCampaign.title}</Text>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Mô tả</Text>
                  <Text style={styles.detailValue}>
                    {selectedCampaign.description || 'Không có mô tả'}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Loại chiến dịch</Text>
                  <View style={[styles.typeBadge, { backgroundColor: getCampaignTypeColor(selectedCampaign.type) }]}>
                    <Text style={styles.badgeText}>{getCampaignTypeText(selectedCampaign.type)}</Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Thời gian diễn ra</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(selectedCampaign.date || selectedCampaign.start_date)} - {formatDate(selectedCampaign.end_date)}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Trạng thái</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getCampaignStatusColor(selectedCampaign.status) }]}>
                    <Text style={styles.badgeText}>{getCampaignStatusText(selectedCampaign.status)}</Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Lớp tham gia</Text>
                  <Text style={styles.detailValue}>
                    {selectedCampaign.target_classes?.join(', ') || 'Tất cả các lớp'}
                  </Text>
                </View>

                {selectedCampaign.requires_consent && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Yêu cầu xác nhận</Text>
                    <Text style={styles.detailValue}>
                      Có (Hạn chót: {formatDate(selectedCampaign.consent_deadline)})
                    </Text>
                  </View>
                )}

                {selectedCampaign.vaccineDetails && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Thông tin vaccine</Text>
                    <Text style={styles.detailValue}>
                      Nhãn hiệu: {selectedCampaign.vaccineDetails.brand}
                    </Text>
                    <Text style={styles.detailValue}>
                      Số lô: {selectedCampaign.vaccineDetails.batchNumber}
                    </Text>
                    <Text style={styles.detailValue}>
                      Liều lượng: {selectedCampaign.vaccineDetails.dosage}
                    </Text>
                  </View>
                )}

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Hướng dẫn</Text>
                  <Text style={styles.detailValue}>
                    {selectedCampaign.instructions || 'Không có hướng dẫn đặc biệt'}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Ngày tạo</Text>
                  <Text style={styles.detailValue}>{formatDate(selectedCampaign.createdAt)}</Text>
                </View>
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
  campaignCard: {
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
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  campaignInfo: {
    flex: 1,
    marginRight: 10,
  },
  campaignTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  campaignDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 5,
  },
  campaignDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  campaignBadges: {
    alignItems: 'flex-end',
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 5,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  consentSection: {
    backgroundColor: colors.lightGray,
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  consentTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  studentConsentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  studentName: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  consentButtons: {
    flexDirection: 'row',
  },
  consentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginLeft: 5,
  },
  acceptButton: {
    backgroundColor: colors.success,
  },
  rejectButton: {
    backgroundColor: colors.error,
  },
  consentButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 3,
  },
  campaignActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  viewButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
  },
  viewButtonText: {
    color: 'white',
    fontSize: 12,
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
  modalCampaignTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
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
    marginBottom: 2,
  },
});

export default ParentCampaigns;
