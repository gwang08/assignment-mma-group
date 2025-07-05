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

const ParentHealthProfiles = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [students, setStudents] = useState([]);
  const [healthProfiles, setHealthProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [studentsResponse, profilesResponse] = await Promise.all([
        parentsAPI.getStudents(),
        parentsAPI.getHealthProfiles()
      ]);

      if (studentsResponse.success && studentsResponse.data) {
        const studentData = studentsResponse.data.map((item) => item.student);
        setStudents(studentData);
      }

      if (profilesResponse.success && profilesResponse.data) {
        setHealthProfiles(profilesResponse.data);
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

  const getStudentName = (profile) => {
    const studentId = profile.student_id || profile.student;
    const student = students.find(s => s._id === studentId);
    return student ? `${student.first_name} ${student.last_name}` : 'N/A';
  };

  const getStudentClass = (profile) => {
    const studentId = profile.student_id || profile.student;
    const student = students.find(s => s._id === studentId);
    return student?.class_name || 'N/A';
  };

  const handleViewDetails = (profile) => {
    setSelectedProfile(profile);
    setIsDetailModalVisible(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa có thông tin';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const renderProfileItem = ({ item }) => (
    <View style={styles.profileCard}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Ionicons name="heart" size={24} color="white" />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.studentName}>{getStudentName(item)}</Text>
          <Text style={styles.studentClass}>Lớp: {getStudentClass(item)}</Text>
          <Text style={styles.lastUpdate}>
            Cập nhật: {formatDate(item.updatedAt)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => handleViewDetails(item)}
        >
          <Ionicons name="eye" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileSummary}>
        <View style={styles.summaryItem}>
          <Ionicons name="alert-circle" size={16} color={colors.warning} />
          <Text style={styles.summaryText}>
            Dị ứng: {item.allergies?.length || 0}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Ionicons name="medical" size={16} color={colors.error} />
          <Text style={styles.summaryText}>
            Bệnh mãn tính: {(item.chronic_conditions?.length || 0) + (item.chronicDiseases?.length || 0)}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Ionicons name="shield-checkmark" size={16} color={colors.success} />
          <Text style={styles.summaryText}>
            Tiêm chủng: {(item.vaccinations?.length || 0) + (item.vaccination_records?.length || 0)}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={healthProfiles}
        renderItem={renderProfileItem}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={64} color={colors.lightGray} />
            <Text style={styles.emptyText}>Chưa có hồ sơ sức khỏe</Text>
            <Text style={styles.emptySubtext}>
              Hồ sơ sức khỏe sẽ được tạo sau khi học sinh tham gia khám sức khỏe
            </Text>
          </View>
        }
      />

      {/* Health Profile Detail Modal */}
      <Modal
        visible={isDetailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi tiết hồ sơ sức khỏe</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsDetailModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedProfile && (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={true}>
                <Text style={styles.modalStudentName}>
                  {getStudentName(selectedProfile)}
                </Text>

                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Dị ứng</Text>
                  {selectedProfile.allergies?.length > 0 ? (
                    selectedProfile.allergies.map((allergy, index) => (
                      <Text key={index} style={styles.detailItem}>
                        • {allergy.name || allergy} ({allergy.severity || 'Chưa xác định'})
                      </Text>
                    ))
                  ) : (
                    <Text style={styles.noDataText}>Không có dị ứng</Text>
                  )}
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Bệnh mãn tính</Text>
                  {(selectedProfile.chronic_conditions?.length > 0 || selectedProfile.chronicDiseases?.length > 0) ? (
                    <>
                      {selectedProfile.chronic_conditions?.map((condition, index) => (
                        <Text key={index} style={styles.detailItem}>
                          • {condition.name || condition}
                        </Text>
                      ))}
                      {selectedProfile.chronicDiseases?.map((disease, index) => (
                        <Text key={index} style={styles.detailItem}>
                          • {disease.name || disease}
                        </Text>
                      ))}
                    </>
                  ) : (
                    <Text style={styles.noDataText}>Không có bệnh mãn tính</Text>
                  )}
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Thuốc đang sử dụng</Text>
                  {selectedProfile.medications?.length > 0 ? (
                    selectedProfile.medications.map((medication, index) => (
                      <Text key={index} style={styles.detailItem}>
                        • {medication.name || medication} - {medication.dosage || 'Chưa xác định'}
                      </Text>
                    ))
                  ) : (
                    <Text style={styles.noDataText}>Không có thuốc đang sử dụng</Text>
                  )}
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Tình trạng thị lực</Text>
                  <Text style={styles.detailItem}>
                    Trạng thái: {selectedProfile.vision_status || 'Chưa kiểm tra'}
                  </Text>
                  {selectedProfile.vision && (
                    <>
                      <Text style={styles.detailItem}>
                        Mắt trái: {selectedProfile.vision.leftEye || 'Chưa có'}
                      </Text>
                      <Text style={styles.detailItem}>
                        Mắt phải: {selectedProfile.vision.rightEye || 'Chưa có'}
                      </Text>
                    </>
                  )}
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Tình trạng thính lực</Text>
                  <Text style={styles.detailItem}>
                    Trạng thái: {selectedProfile.hearing_status || 'Chưa kiểm tra'}
                  </Text>
                  {selectedProfile.hearing && (
                    <>
                      <Text style={styles.detailItem}>
                        Tai trái: {selectedProfile.hearing.leftEar || 'Chưa có'}
                      </Text>
                      <Text style={styles.detailItem}>
                        Tai phải: {selectedProfile.hearing.rightEar || 'Chưa có'}
                      </Text>
                    </>
                  )}
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Lịch sử tiêm chủng</Text>
                  {(selectedProfile.vaccinations?.length > 0 || selectedProfile.vaccination_records?.length > 0) ? (
                    <>
                      {selectedProfile.vaccinations?.map((vaccination, index) => (
                        <Text key={index} style={styles.detailItem}>
                          • {vaccination.vaccine_name || vaccination.name || vaccination}
                          {vaccination.date_administered && ` - ${formatDate(vaccination.date_administered)}`}
                        </Text>
                      ))}
                      {selectedProfile.vaccination_records?.map((record, index) => (
                        <Text key={index} style={styles.detailItem}>
                          • {record.vaccine_name} - {formatDate(record.date_administered)}
                        </Text>
                      ))}
                    </>
                  ) : (
                    <Text style={styles.noDataText}>Chưa có lịch sử tiêm chủng</Text>
                  )}
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
  profileCard: {
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
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
  profileInfo: {
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
  lastUpdate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  viewButton: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 20,
  },
  profileSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  summaryText: {
    fontSize: 12,
    color: colors.textSecondary,
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
    flexGrow: 1,
  },
  modalStudentName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  detailSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  detailItem: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
    paddingLeft: 10,
  },
  noDataText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    paddingLeft: 10,
  },
});

export default ParentHealthProfiles;
