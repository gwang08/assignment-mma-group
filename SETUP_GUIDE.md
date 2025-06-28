# HƯỚNG DẪN SỬ DỤNG - Import Data và Test App

## 🎨 Thay đổi màu sắc
Toàn bộ app đã được chuyển sang theme **xanh nước biển nhạt**:
- Primary: `#4fc3f7` (Light Blue)
- Background: `#e1f5fe` (Very Light Blue)
- Text: `#0d47a1` (Dark Blue)
- Border: `#b3e5fc` (Light Blue Border)

## 📁 Cấu trúc màu sắc
File màu được lưu tại: `frontend-mobile/src/styles/colors.js`

## 🗄️ Import dữ liệu test vào MongoDB

### Bước 1: Đảm bảo MongoDB đang chạy
```bash
# Khởi động MongoDB service (Windows)
net start MongoDB

# Hoặc chạy MongoDB manually
mongod
```

### Bước 2: Chạy script import data
```bash
cd "c:\Users\lemin\OneDrive\Máy tính\mma gr\assigment_mma"
npm run import-data
```

### Hoặc chạy trực tiếp:
```bash
node import-data.js
```

## 🔑 Tài khoản test sau khi import

### 👥 PARENTS
- Username: `parent_test` | Password: `MatKhau123@` | Type: `parent`
- Username: `parent_binh` | Password: `MatKhau456@` | Type: `parent`

### 🎓 STUDENTS  
- Username: `student_test` | Password: `HocSinh123@` | Type: `student`
- Username: `student_mai` | Password: `HocSinh456@` | Type: `student`
- Username: `student_duc` | Password: `HocSinh789@` | Type: `student`

### 🏥 MEDICAL STAFF
- Username: `nurse_test` | Password: `YTa123@` | Type: `medicalStaff`
- Username: `doctor_hung` | Password: `BacSi123@` | Type: `medicalStaff`

### 👑 ADMINS
- Username: `admin` | Password: `admin` | Type: `admin` *(default)*
- Username: `admin_test` | Password: `QuanTri123@` | Type: `admin`

## 🚀 Khởi động ứng dụng

### Backend:
```bash
cd "c:\Users\lemin\OneDrive\Máy tính\mma gr\assigment_mma"
npm start
```

### Frontend Mobile (React Native Expo):
```bash
cd "c:\Users\lemin\OneDrive\Máy tính\mma gr\assigment_mma\frontend-mobile"
npx expo start
```

## 📱 Test trên Android Studio

1. Mở Android Studio
2. Khởi động AVD (Android Virtual Device)
3. Sau khi chạy `npx expo start`, nhấn `a` để mở trên Android emulator
4. Hoặc quét QR code bằng Expo Go app trên điện thoại thật

## 🧪 Test Cases

### Test Login trên Mobile App:
1. **Admin Login:**
   - Username: `admin`
   - Password: `admin`
   - User Type: `admin`
   - Expected: Chuyển đến AdminScreen với header màu xanh đậm

2. **Parent Login:**
   - Username: `parent_test`
   - Password: `MatKhau123@`
   - User Type: `parent`
   - Expected: Chuyển đến ParentScreen với header màu xanh nhạt

3. **Student Login:**
   - Username: `student_test`
   - Password: `HocSinh123@`
   - User Type: `student`
   - Expected: Chuyển đến StudentScreen

4. **Nurse Login:**
   - Username: `nurse_test`
   - Password: `YTa123@`
   - User Type: `medicalStaff`
   - Expected: Chuyển đến NurseScreen

### Test Registration:
- Chỉ có Parent registration được phép cho public
- Các role khác cần admin tạo qua API

## 📝 API Test với Postman/Thunder Client

### Login Endpoint:
```
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin", 
  "userType": "admin"
}
```

### Register Parent:
```
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "userData": {
    "first_name": "Test",
    "last_name": "User",
    "gender": "male",
    "username": "test_user_new",
    "password": "Test123@",
    "email": "test@new.com",
    "phone_number": "0987654321"
  },
  "userType": "parent"
}
```

## 🎯 Kết quả mong đợi

✅ **Frontend Mobile:**
- Giao diện màu xanh nước biển nhạt
- Login/Register form với validation
- Navigation theo role sau khi login
- Logout functionality

✅ **Backend:**
- Authentication API hoạt động
- Dữ liệu test được import thành công
- JWT token generation và validation

✅ **Database:**
- MongoDB chứa dữ liệu test
- Hash password đúng cách
- Collections: parents, students, medicalstaffs, admins

## 🔧 Troubleshooting

### Lỗi MongoDB Connection:
- Kiểm tra MongoDB service đang chạy
- Kiểm tra port 27017 không bị block
- Kiểm tra connection string trong .env

### Lỗi Expo:
- Xóa node_modules và chạy `npm install` lại
- Chạy `npx expo install --fix` để fix dependencies
- Kiểm tra Android Studio/emulator đang chạy

### Lỗi Backend:
- Kiểm tra port 3000 có bị sử dụng
- Kiểm tra .env file có đúng cấu hình
- Kiểm tra MongoDB URI trong .env
