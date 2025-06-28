import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  FlatList, 
  Modal, 
  TextInput, 
  Alert,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  Dimensions,
  StatusBar,
  Animated,
  ImageBackground,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAuth } from '../context/AuthContext';
import colors from '../styles/colors';
import { adminAPI } from '../services/adminApi';

const { width, height } = Dimensions.get('window');

const AdminScreen = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('students');
  const [students, setStudents] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [linkRequests, setLinkRequests] = useState([]);
  const [parentRelations, setParentRelations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    loadTabData();
  }, [activeTab]);

  const loadTabData = async () => {
    switch (activeTab) {
      case 'students':
        await fetchStudents();
        break;
      case 'nurses':
        await fetchNurses();
        break;
      case 'requests':
        await fetchLinkRequests();
        break;
      case 'relations':
        await fetchParentRelations();
        break;
      case 'profile':
        await fetchUserProfile();
        break;
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTabData();
    setRefreshing(false);
  };

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

  const fetchLinkRequests = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getStudentLinkRequests();
      setLinkRequests(response || []);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách yêu cầu liên kết');
    } finally {
      setLoading(false);
    }
  };

  const fetchParentRelations = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getStudentParentRelations();
      setParentRelations(response.data || []);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách quan hệ phụ huynh');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getCurrentUser();
      setUserProfile(response.data);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải thông tin cá nhân');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = (type) => {
    setEditingItem(null);
    if (type === 'student') {
      setFormData({
        first_name: '',
        last_name: '',
        gender: 'male',
        dateOfBirth: '',
        address: {
          street: '',
          city: '',
          state: '',
          postal_code: '',
          country: ''
        },
        is_active: true,
        class_name: ''
      });
    } else if (type === 'nurse') {
      setFormData({
        first_name: '',
        last_name: '',
        gender: 'male',
        dateOfBirth: '',
        address: {
          street: '',
          city: '',
          state: '',
          postal_code: '',
          country: ''
        },
        is_active: true,
        username: '',
        password: '',
        phone_number: '',
        email: '',
        role: 'Nurse'
      });
    }
    setModalVisible(true);
  };

  const handleEdit = (item, type) => {
    setEditingItem({ ...item, type });
    setFormData(item);
    setModalVisible(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (editingItem) {
        // Update existing item
        if (editingItem.type === 'student' || activeTab === 'students') {
          await adminAPI.updateStudent(editingItem._id, formData);
          fetchStudents();
        } else {
          await adminAPI.updateMedicalStaff(editingItem._id, formData);
          fetchNurses();
        }
        Alert.alert('Thành công', 'Cập nhật thành công');
      } else {
        // Create new item
        if (activeTab === 'students') {
          await adminAPI.createStudent(formData);
          fetchStudents();
        } else {
          await adminAPI.createMedicalStaff(formData);
          fetchNurses();
        }
        Alert.alert('Thành công', 'Tạo mới thành công');
      }
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (item, type) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn vô hiệu hóa?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            try {
              if (type === 'student') {
                await adminAPI.deactivateStudent(item._id);
                fetchStudents();
              } else {
                await adminAPI.deactivateMedicalStaff(item._id);
                fetchNurses();
              }
              Alert.alert('Thành công', 'Vô hiệu hóa thành công');
            } catch (error) {
              Alert.alert('Lỗi', 'Có lỗi xảy ra');
            }
          }
        }
      ]
    );
  };

  const handleProcessRequest = async (requestId, action) => {
    Alert.alert(
      'Xác nhận',
      `Bạn có chắc chắn muốn ${action === 'approve' ? 'duyệt' : 'từ chối'} yêu cầu này?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            try {
              await adminAPI.processStudentLinkRequest(requestId, { status: action });
              Alert.alert('Thành công', `${action === 'approve' ? 'Duyệt' : 'Từ chối'} yêu cầu thành công`);
              fetchLinkRequests();
            } catch (error) {
              Alert.alert('Lỗi', 'Có lỗi xảy ra');
            }
          }
        }
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
        <View style={[styles.modernStatusBadge, { 
          backgroundColor: item.is_active ? '#4CAF50' : '#F44336' 
        }]}>
          <Text style={styles.statusText}>
            {item.is_active ? '✓' : '✗'}
          </Text>
        </View>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>🎂</Text>
          <Text style={styles.infoText}>{item.dateOfBirth}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>{item.gender === 'male' ? '👦' : '👧'}</Text>
          <Text style={styles.infoText}>{item.gender === 'male' ? 'Nam' : 'Nữ'}</Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={[styles.modernActionBtn, styles.editBtn]}
          onPress={() => handleEdit(item, 'student')}
        >
          <Text style={styles.actionIcon}>✏️</Text>
          <Text style={styles.actionText}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.modernActionBtn, styles.deleteBtn]}
          onPress={() => handleDeactivate(item, 'student')}
        >
          <Text style={styles.actionIcon}>🗑️</Text>
          <Text style={styles.actionText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
          <Text style={styles.cardSubtitle}>@{item.username}</Text>
        </View>
        <View style={[styles.modernStatusBadge, { 
          backgroundColor: item.is_active ? '#4CAF50' : '#F44336' 
        }]}>
          <Text style={styles.statusText}>
            {item.is_active ? '✓' : '✗'}
          </Text>
        </View>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📧</Text>
          <Text style={styles.infoText}>{item.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📱</Text>
          <Text style={styles.infoText}>{item.phone_number}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>🏥</Text>
          <Text style={styles.infoText}>{item.role}</Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={[styles.modernActionBtn, styles.editBtn]}
          onPress={() => handleEdit(item, 'nurse')}
        >
          <Text style={styles.actionIcon}>✏️</Text>
          <Text style={styles.actionText}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.modernActionBtn, styles.deleteBtn]}
          onPress={() => handleDeactivate(item, 'nurse')}
        >
          <Text style={styles.actionIcon}>🗑️</Text>
          <Text style={styles.actionText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderLinkRequestItem = ({ item }) => (
    <View style={styles.modernCard}>
      <View style={styles.requestHeader}>
        <Text style={styles.requestTitle}>Yêu cầu liên kết</Text>
        <View style={[styles.requestStatus, { 
          backgroundColor: item.status === 'pending' ? '#FF9800' : 
                         item.status === 'approved' ? '#4CAF50' : '#F44336' 
        }]}>
          <Text style={styles.statusText}>
            {item.status === 'pending' ? '⏳' : 
             item.status === 'approved' ? '✅' : '❌'}
          </Text>
        </View>
      </View>
      
      <View style={styles.relationshipCard}>
        <View style={styles.personInfo}>
          <Text style={styles.personTitle}>Học sinh</Text>
          <Text style={styles.personName}>{item.student?.first_name} {item.student?.last_name}</Text>
          <Text style={styles.personDetail}>Lớp {item.student?.class_name}</Text>
        </View>
        
        <View style={styles.connectionLine}>
          <Text style={styles.connectionIcon}>🔗</Text>
          <Text style={styles.relationshipText}>{item.relationship}</Text>
        </View>
        
        <View style={styles.personInfo}>
          <Text style={styles.personTitle}>Phụ huynh</Text>
          <Text style={styles.personName}>{item.parent?.first_name} {item.parent?.last_name}</Text>
          <Text style={styles.personDetail}>{item.parent?.email}</Text>
        </View>
      </View>

      {item.notes && (
        <View style={styles.notesSection}>
          <Text style={styles.notesTitle}>📝 Ghi chú</Text>
          <Text style={styles.notesText}>{item.notes}</Text>
        </View>
      )}
      
      {item.status === 'pending' && (
        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={[styles.modernActionBtn, styles.approveBtn]}
            onPress={() => handleProcessRequest(item._id, 'approve')}
          >
            <Text style={styles.actionIcon}>✅</Text>
            <Text style={styles.actionText}>Duyệt</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.modernActionBtn, styles.rejectBtn]}
            onPress={() => handleProcessRequest(item._id, 'reject')}
          >
            <Text style={styles.actionIcon}>❌</Text>
            <Text style={styles.actionText}>Từ chối</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderParentRelationItem = ({ item }) => (
    <View style={styles.modernCard}>
      <View style={styles.requestHeader}>
        <Text style={styles.requestTitle}>Quan hệ đã thiết lập</Text>
        <View style={[styles.requestStatus, { backgroundColor: '#4CAF50' }]}>
          <Text style={styles.statusText}>✅</Text>
        </View>
      </View>
      
      <View style={styles.relationshipCard}>
        <View style={styles.personInfo}>
          <Text style={styles.personTitle}>Học sinh</Text>
          <Text style={styles.personName}>{item.student?.first_name} {item.student?.last_name}</Text>
          <Text style={styles.personDetail}>Lớp {item.student?.class_name}</Text>
        </View>
        
        <View style={styles.connectionLine}>
          <Text style={styles.connectionIcon}>👨‍👩‍👧‍👦</Text>
          <Text style={styles.relationshipText}>{item.relationship}</Text>
        </View>
        
        <View style={styles.personInfo}>
          <Text style={styles.personTitle}>Phụ huynh</Text>
          <Text style={styles.personName}>{item.parent?.first_name} {item.parent?.last_name}</Text>
          <Text style={styles.personDetail}>{item.parent?.email}</Text>
        </View>
      </View>

      <View style={styles.dateSection}>
        <Text style={styles.dateTitle}>📅 Thông tin thời gian</Text>
        <Text style={styles.dateText}>Tạo: {new Date(item.createdAt).toLocaleDateString('vi-VN')}</Text>
        {item.processed_at && (
          <Text style={styles.dateText}>Xử lý: {new Date(item.processed_at).toLocaleDateString('vi-VN')}</Text>
        )}
      </View>
    </View>
  );

  const renderTabContent = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      );
    }

    const getTabConfig = () => {
      switch (activeTab) {
        case 'students':
          return {
            title: 'Quản lý Học sinh',
            data: students,
            renderItem: renderStudentItem,
            onAdd: () => handleCreate('student'),
            addButtonText: '+ Thêm học sinh'
          };
        case 'nurses':
          return {
            title: 'Quản lý Y tá',
            data: nurses,
            renderItem: renderNurseItem,
            onAdd: () => handleCreate('nurse'),
            addButtonText: '+ Thêm y tá'
          };
        case 'requests':
          return {
            title: 'Yêu cầu liên kết',
            data: linkRequests,
            renderItem: renderLinkRequestItem,
            addButtonText: null
          };
        case 'relations':
          return {
            title: 'Quan hệ Phụ huynh',
            data: parentRelations,
            renderItem: renderParentRelationItem,
            addButtonText: null
          };
        case 'profile':
          return null;
      }
    };

    if (activeTab === 'profile') {
      return (
        <ScrollView 
          style={styles.profileContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={styles.profileHeader}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>
                {userProfile?.first_name?.charAt(0)}{userProfile?.last_name?.charAt(0)}
              </Text>
            </View>
            <Text style={styles.profileName}>
              {userProfile?.first_name} {userProfile?.last_name}
            </Text>
            <Text style={styles.profileRole}>Administrator</Text>
          </View>

          <View style={styles.profileDetails}>
            <View style={styles.profileItem}>
              <Text style={styles.profileItemIcon}>👤</Text>
              <View style={styles.profileItemContent}>
                <Text style={styles.profileItemLabel}>Username</Text>
                <Text style={styles.profileItemValue}>{userProfile?.username}</Text>
              </View>
            </View>

            <View style={styles.profileItem}>
              <Text style={styles.profileItemIcon}>📧</Text>
              <View style={styles.profileItemContent}>
                <Text style={styles.profileItemLabel}>Email</Text>
                <Text style={styles.profileItemValue}>{userProfile?.email}</Text>
              </View>
            </View>

            <View style={styles.profileItem}>
              <Text style={styles.profileItemIcon}>🆔</Text>
              <View style={styles.profileItemContent}>
                <Text style={styles.profileItemLabel}>User ID</Text>
                <Text style={styles.profileItemValue}>{userProfile?._id}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.modernLogoutButton} onPress={signOut}>
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </ScrollView>
      );
    }

    const config = getTabConfig();
    if (!config) return null;

    return (
      <View style={styles.contentContainer}>
        <View style={styles.modernTabHeader}>
          <Text style={styles.modernTabTitle}>{config.title}</Text>
          <Text style={styles.tabCounter}>({config.data?.length || 0})</Text>
        </View>
        
        <FlatList
          data={config.data}
          renderItem={config.renderItem}
          keyExtractor={(item) => item._id || item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={() => (
            <View style={styles.modernEmptyState}>
              <Text style={styles.emptyIcon}>
                {activeTab === 'students' ? '👨‍🎓' : 
                 activeTab === 'nurses' ? '👩‍⚕️' : 
                 activeTab === 'requests' ? '📋' : '👨‍👩‍👧‍👦'}
              </Text>
              <Text style={styles.emptyTitle}>Chưa có dữ liệu</Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === 'students' && 'Chưa có học sinh nào trong hệ thống'}
                {activeTab === 'nurses' && 'Chưa có y tá nào trong hệ thống'}
                {activeTab === 'requests' && 'Không có yêu cầu liên kết nào'}
                {activeTab === 'relations' && 'Chưa có quan hệ phụ huynh nào'}
              </Text>
            </View>
          )}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
      {/* Header với gradient đẹp */}
      <View style={styles.gradientHeader}>
        <View style={styles.headerContent}>
          <Text style={styles.mainTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSubtitle}>Hệ thống quản lý trường học</Text>
        </View>
        <View style={styles.headerDecoration}>
          <Text style={styles.headerEmoji}>🎓</Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {renderTabContent()}
      </View>

      {/* Floating Action Button */}
      {(activeTab === 'students' || activeTab === 'nurses') && (
        <TouchableOpacity 
          style={styles.floatingActionButton}
          onPress={() => handleCreate(activeTab === 'students' ? 'student' : 'nurse')}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}

      {/* Modern Bottom Navigation */}
      <View style={styles.modernBottomNav}>
        {[
          { key: 'students', icon: '👨‍🎓', label: 'Học sinh' },
          { key: 'nurses', icon: '👩‍⚕️', label: 'Y tá' },
          { key: 'requests', icon: '📋', label: 'Yêu cầu' },
          { key: 'relations', icon: '👨‍👩‍👧‍�', label: 'Quan hệ' },
          { key: 'profile', icon: '👤', label: 'Hồ sơ' }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.modernTab, activeTab === tab.key && styles.activeModernTab]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.modernTabIcon, activeTab === tab.key && styles.activeTabIcon]}>
              {tab.icon}
            </Text>
            <Text style={[styles.modernTabLabel, activeTab === tab.key && styles.activeTabLabel]}>
              {tab.label}
            </Text>
            {activeTab === tab.key && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Enhanced Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modernModalOverlay}>
          <View style={styles.modernModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modernModalTitle}>
                {editingItem ? '✏️ Chỉnh sửa' : '➕ Thêm mới'}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>👤 Họ và tên</Text>
                <View style={styles.nameInputRow}>
                  <TextInput
                    style={[styles.modernInput, { flex: 1, marginRight: 10 }]}
                    placeholder="Tên"
                    value={formData.first_name}
                    onChangeText={(text) => setFormData({...formData, first_name: text})}
                  />
                  <TextInput
                    style={[styles.modernInput, { flex: 1 }]}
                    placeholder="Họ"
                    value={formData.last_name}
                    onChangeText={(text) => setFormData({...formData, last_name: text})}
                  />
                </View>
              </View>

              {activeTab === 'nurses' && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>🔐 Thông tin đăng nhập</Text>
                    <TextInput
                      style={styles.modernInput}
                      placeholder="Tên đăng nhập"
                      value={formData.username}
                      onChangeText={(text) => setFormData({...formData, username: text})}
                    />
                    <TextInput
                      style={styles.modernInput}
                      placeholder="Mật khẩu"
                      value={formData.password}
                      onChangeText={(text) => setFormData({...formData, password: text})}
                      secureTextEntry
                    />
                  </View>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>📞 Thông tin liên hệ</Text>
                    <TextInput
                      style={styles.modernInput}
                      placeholder="Email"
                      value={formData.email}
                      onChangeText={(text) => setFormData({...formData, email: text})}
                    />
                    <TextInput
                      style={styles.modernInput}
                      placeholder="Số điện thoại"
                      value={formData.phone_number}
                      onChangeText={(text) => setFormData({...formData, phone_number: text})}
                    />
                  </View>
                </>
              )}

              {activeTab === 'students' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>🏫 Thông tin học tập</Text>
                  <TextInput
                    style={styles.modernInput}
                    placeholder="Lớp học"
                    value={formData.class_name}
                    onChangeText={(text) => setFormData({...formData, class_name: text})}
                  />
                </View>
              )}
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>📅 Ngày sinh</Text>
                <TextInput
                  style={styles.modernInput}
                  placeholder="YYYY-MM-DD"
                  value={formData.dateOfBirth}
                  onChangeText={(text) => setFormData({...formData, dateOfBirth: text})}
                />
              </View>
            </ScrollView>

            <View style={styles.modernModalActions}>
              <TouchableOpacity 
                style={[styles.modernModalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modernModalButton, styles.saveButton]}
                onPress={handleSave}
                disabled={loading}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? 'Đang lưu...' : 'Lưu'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  
  // Gradient Header
  gradientHeader: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundColor: '#667eea',
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  headerContent: {
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
    textAlign: 'center',
  },
  headerDecoration: {
    position: 'absolute',
    right: 20,
    top: 20,
  },
  headerEmoji: {
    fontSize: 40,
    opacity: 0.3,
  },

  // Main Content
  mainContent: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  contentContainer: {
    flex: 1,
  },
  modernTabHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  modernTabTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
  },
  tabCounter: {
    fontSize: 16,
    color: '#95a5a6',
    marginLeft: 8,
    fontWeight: '500',
  },

  // Loading States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#667eea',
    fontWeight: '500',
  },

  // Empty States
  modernEmptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },

  // Modern Cards
  modernCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  
  // Card Header for Students/Nurses
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  modernStatusBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Card Content
  cardContent: {
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 10,
    width: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#34495e',
    flex: 1,
  },

  // Card Actions
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  modernActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  editBtn: {
    backgroundColor: '#3498db',
  },
  deleteBtn: {
    backgroundColor: '#e74c3c',
  },
  approveBtn: {
    backgroundColor: '#27ae60',
  },
  rejectBtn: {
    backgroundColor: '#e74c3c',
  },
  actionIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  // Request Cards
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
  },
  requestStatus: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  relationshipCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  personInfo: {
    alignItems: 'center',
    marginBottom: 10,
  },
  personTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#95a5a6',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  personName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 2,
  },
  personDetail: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  connectionLine: {
    alignItems: 'center',
    marginVertical: 10,
  },
  connectionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  relationshipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
  notesSection: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 6,
  },
  notesText: {
    fontSize: 13,
    color: '#856404',
    lineHeight: 18,
  },
  dateSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  dateTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d',
    marginBottom: 6,
  },
  dateText: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 2,
  },

  // Profile Styles
  profileContainer: {
    flex: 1,
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileAvatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 5,
  },
  profileRole: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
  },
  profileDetails: {
    marginBottom: 30,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileItemIcon: {
    fontSize: 20,
    marginRight: 15,
    width: 30,
  },
  profileItemContent: {
    flex: 1,
  },
  profileItemLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#95a5a6',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  profileItemValue: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  modernLogoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#e74c3c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  // Bottom Navigation
  modernBottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  modernTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    position: 'relative',
  },
  activeModernTab: {
    transform: [{ translateY: -5 }],
  },
  modernTabIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  activeTabIcon: {
    transform: [{ scale: 1.2 }],
  },
  modernTabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#95a5a6',
  },
  activeTabLabel: {
    color: '#667eea',
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 40,
    height: 3,
    backgroundColor: '#667eea',
    borderRadius: 2,
  },

  // Floating Action Button
  floatingActionButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  fabText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },

  // Modern Modal
  modernModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modernModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: width * 0.9,
    maxHeight: height * 0.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  modernModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ecf0f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#95a5a6',
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
  },
  nameInputRow: {
    flexDirection: 'row',
  },
  modernInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    marginBottom: 10,
  },
  modernModalActions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  modernModalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#ecf0f1',
  },
  saveButton: {
    backgroundColor: '#667eea',
  },
  cancelButtonText: {
    color: '#95a5a6',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  // List Container
  listContainer: {
    paddingBottom: 20,
  },
});

export default AdminScreen;
