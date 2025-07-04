# React Native Parent App

Ứng dụng quản lý sức khỏe học sinh cho phụ huynh được xây dựng bằng React Native với bottom tabs navigation.

## Cấu trúc ứng dụng

### Bottom Tabs
1. **Home (Trang chủ)** - Dashboard với các thao tác nhanh và tổng quan
2. **Students (Học sinh)** - Danh sách học sinh và thông tin chi tiết
3. **Settings (Cài đặt)** - Thông tin cá nhân và cài đặt tài khoản

### Tính năng chính trong Home Tab

#### Dashboard (Trang chủ)
- **Thao tác nhanh**: 4 thẻ bấm chính
  - Yêu cầu thuốc (màu đỏ)
  - Đặt lịch tư vấn (màu xanh dương)
  - Hồ sơ sức khỏe (màu xanh lá)
  - Chiến dịch (màu cam)
- **Tổng quan**: Hiển thị dữ liệu gần đây
  - Yêu cầu thuốc gần đây (3 mục)
  - Lịch tư vấn sắp tới (3 mục)
  - Chiến dịch đang diễn ra (3 mục)

#### Hồ sơ sức khỏe
- Xem hồ sơ sức khỏe của từng học sinh
- Chi tiết bao gồm:
  - Dị ứng
  - Bệnh mãn tính
  - Thuốc đang sử dụng
  - Tình trạng thị lực/thính lực
  - Lịch sử tiêm chủng

#### Yêu cầu thuốc
- Tạo yêu cầu thuốc mới
- Chỉnh sửa yêu cầu đang chờ duyệt
- Xóa yêu cầu chưa được duyệt
- Theo dõi trạng thái: Chờ duyệt, Đã duyệt, Từ chối, Hoàn thành

#### Chiến dịch y tế
- Xem danh sách chiến dịch
- Xác nhận tham gia cho từng học sinh
- Chi tiết chiến dịch:
  - Tiêm chủng
  - Khám sức khỏe
  - Chương trình dinh dưỡng
  - Sức khỏe tâm thần

#### Lịch tư vấn
- Đặt lịch tư vấn cho học sinh
- Hủy lịch hẹn
- Theo dõi trạng thái: Chờ xác nhận, Đã lên lịch, Hoàn thành, Đã hủy

### Components

#### Services
- **parentsAPI.js**: API service cho các chức năng phụ huynh
  - Quản lý học sinh
  - Hồ sơ sức khỏe
  - Yêu cầu thuốc
  - Chiến dịch y tế
  - Lịch tư vấn

#### Components Structure
```
src/
├── components/
│   └── parents/
│       ├── ParentDashboard.js
│       ├── ParentStudents.js
│       ├── ParentSettings.js
│       ├── ParentHealthProfiles.js
│       ├── ParentMedicineRequests.js
│       ├── ParentCampaigns.js
│       └── ParentConsultations.js
├── screens/
│   └── ParentScreen.js
├── services/
│   └── parentsAPI.js
└── styles/
    └── colors.js
```

## Tính năng

### React Native Icons
- Sử dụng Ionicons từ @expo/vector-icons
- Không cần cài đặt thêm library icon từ bàn phím

### Date Picker
- Sử dụng @react-native-community/datetimepicker có sẵn
- Không cần cài đặt thêm

### Navigation
- Bottom tabs với 3 tab chính
- Stack navigation trong Home tab để điều hướng giữa các màn hình

### UI/UX
- Thiết kế modern với màu xanh dương làm chủ đạo
- Cards với shadow và border radius
- Responsive layout
- Pull to refresh
- Loading states
- Empty states

## API Integration

### Authentication
- Sử dụng JWT token
- Lưu trữ token trong AsyncStorage
- Tự động thêm token vào header

### Error Handling
- Hiển thị thông báo lỗi bằng Alert
- Retry mechanisms
- Network error handling

## Installation & Setup

1. Cài đặt dependencies:
```bash
npm install
```

2. Chạy ứng dụng:
```bash
npm start
```

3. Cấu hình API URL trong `parentsAPI.js`:
```javascript
const BASE_URL = "http://192.168.1.241:3000"; // Thay IP này bằng IP thực của máy bạn
```

## Features Overview

- ✅ Bottom tab navigation
- ✅ Stack navigation cho Home tab
- ✅ Quản lý học sinh
- ✅ Hồ sơ sức khỏe
- ✅ Yêu cầu thuốc với CRUD operations
- ✅ Chiến dịch y tế với consent management
- ✅ Lịch tư vấn với booking system
- ✅ Pull to refresh
- ✅ Date picker integration
- ✅ Modal dialogs
- ✅ Error handling
- ✅ Loading states
- ✅ Empty states
- ✅ Responsive design
