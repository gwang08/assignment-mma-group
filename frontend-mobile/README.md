# School Health Management System - Mobile App

Ứng dụng mobile React Native với Expo cho hệ thống quản lý sức khỏe học sinh.

## Cài đặt và chạy

### Yêu cầu
- Node.js >= 16
- npm hoặc yarn
- Expo CLI
- Android Studio (cho Android) hoặc Xcode (cho iOS)

### Cài đặt dependencies
```bash
cd frontend-mobile
npm install
```

### Chạy ứng dụng

#### Development
```bash
# Chạy trên web browser
npm run web

# Chạy trên Android (cần Android Studio)
npm run android

# Chạy trên iOS (cần macOS và Xcode)
npm run ios

# Chạy Expo development server
npx expo start
```

#### Production
```bash
# Build cho Android
npx expo build:android

# Build cho iOS
npx expo build:ios
```

## Cấu trúc dự án

```
frontend-mobile/
├── src/
│   ├── components/          # Các component tái sử dụng
│   │   └── LoadingScreen.js
│   ├── context/            # React Context
│   │   └── AuthContext.js
│   ├── screens/            # Các màn hình chính
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── StudentScreen.js
│   │   ├── ParentScreen.js
│   │   ├── NurseScreen.js
│   │   └── AdminScreen.js
│   └── services/           # API services
│       └── api.js
├── App.js                  # Entry point
├── app.json               # Expo configuration
└── package.json
```

## Tính năng

### Đã hoàn thành
- ✅ Đăng nhập với 4 role: Student, Parent, Nurse, Admin
- ✅ Đăng ký tài khoản mới
- ✅ Authentication với JWT token
- ✅ Navigation theo role
- ✅ Giao diện responsive
- ✅ Form validation

### Chưa hoàn thành (sẽ phát triển sau)
- ⏳ Dashboard cho từng role
- ⏳ Quản lý hồ sơ sức khỏe
- ⏳ Lịch hẹn khám
- ⏳ Thông báo
- ⏳ Báo cáo sức khỏe

## API Integration

Ứng dụng kết nối với backend tại `http://localhost:3000`

### Authentication Endpoints
- `POST /auth/login` - Đăng nhập
- `POST /auth/register` - Đăng ký

### User Roles
- `student` - Học sinh
- `parent` - Phụ huynh  
- `nurse` - Y tá
- `admin` - Quản trị viên

## Thư viện sử dụng

- **React Native** - Framework mobile
- **Expo** - Development platform
- **React Navigation** - Navigation library
- **Axios** - HTTP client
- **AsyncStorage** - Local storage
- **React Context** - State management

## Ghi chú

- Đảm bảo backend đang chạy tại `http://localhost:3000`
- Cho môi trường development, có thể cần thay đổi BASE_URL trong `src/services/api.js`
- Sử dụng Expo Go app để test trên thiết bị thật
