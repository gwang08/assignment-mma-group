# Backend Schema và Test Data

## Schema Models

### 1. Person Interface (Base Schema)
```javascript
{
  first_name: String (required),
  last_name: String (required),
  gender: String (enum: "male", "female", "other") (required),
  dateOfBirth: Date,
  address: {
    street: String,
    city: String,
    state: String,
    postal_code: String,
    country: String
  },
  is_active: Boolean (default: true)
}
```

### 2. Parent Model
```javascript
{
  // Kế thừa từ Person Interface
  ...personSchema,
  username: String (required, unique),
  password: String (required),
  phone_number: String (required),
  email: String (required, unique)
}
```

### 3. Student Model
```javascript
{
  // Kế thừa từ Person Interface
  ...personSchema,
  username: String (unique, sparse - cho phép null),
  password: String,
  class_name: String (required)
}
```

### 4. Admin Model
```javascript
{
  // Kế thừa từ Person Interface
  ...personSchema,
  username: String (required, unique),
  password: String (required),
  email: String (required, unique),
  phone_number: String (required),
  role: String (enum: ["super_admin", "student_manager"], default: "student_manager"),
  permissions: {
    create_student: Boolean (default: true),
    manage_student_parent: Boolean (default: true),
    create_staff: Boolean (default: false),
    manage_system: Boolean (default: false)
  }
}
```

### 5. Medical Staff Model (Nurse)
```javascript
{
  // Kế thừa từ Person Interface
  ...personSchema,
  username: String (required, unique),
  password: String (required),
  phone_number: String (required),
  email: String (required, unique),
  role: String (enum: ["Nurse", "Doctor", "Healthcare Assistant"])
}
```

## API Endpoints

### Authentication Routes

#### 1. POST /auth/register
**Body:**
```json
{
  "userData": {
    "first_name": "John",
    "last_name": "Smith",
    "gender": "male",
    "dateOfBirth": "1980-05-15",
    "address": {
      "street": "123 Oak Street",
      "city": "Springfield",
      "state": "IL",
      "postal_code": "62704",
      "country": "USA"
    },
    "username": "parent_john",
    "password": "SecureP@ss123",
    "phone_number": "555-123-4567",
    "email": "john.smith@example.com"
  },
  "userType": "parent"
}
```

#### 2. POST /auth/login
**Body:**
```json
{
  "username": "parent_user",
  "password": "SecureP@ss123",
  "userType": "parent"
}
```

## Test Data Examples

### 1. Parent Registration
```json
{
  "userData": {
    "first_name": "Nguyễn",
    "last_name": "Văn An",
    "gender": "male",
    "dateOfBirth": "1985-03-15",
    "address": {
      "street": "123 Đường Lê Lợi",
      "city": "Hồ Chí Minh",
      "state": "TP.HCM",
      "postal_code": "70000",
      "country": "Vietnam"
    },
    "username": "parent_van_an",
    "password": "MatKhau123@",
    "phone_number": "0901234567",
    "email": "vanan@gmail.com"
  },
  "userType": "parent"
}
```

### 2. Student Registration (Admin only)
```json
{
  "userData": {
    "first_name": "Nguyễn",
    "last_name": "Minh Khôi",
    "gender": "male",
    "dateOfBirth": "2010-08-20",
    "address": {
      "street": "456 Đường Nguyễn Thái Học",
      "city": "Hồ Chí Minh",
      "state": "TP.HCM",
      "postal_code": "70000",
      "country": "Vietnam"
    },
    "username": "student_minh_khoi",
    "password": "HocSinh123@",
    "class_name": "6A1"
  },
  "userType": "student"
}
```

### 3. Nurse Registration (Admin only)
```json
{
  "userData": {
    "first_name": "Trần",
    "last_name": "Thị Lan",
    "gender": "female",
    "dateOfBirth": "1990-12-05",
    "address": {
      "street": "789 Đường Cách Mạng Tháng 8",
      "city": "Hồ Chí Minh",
      "state": "TP.HCM",
      "postal_code": "70000",
      "country": "Vietnam"
    },
    "username": "nurse_thi_lan",
    "password": "YTa123@",
    "phone_number": "0912345678",
    "email": "thilan.nurse@gmail.com",
    "role": "Nurse"
  },
  "userType": "medicalStaff"
}
```

### 4. Admin Registration (Super Admin only)
```json
{
  "userData": {
    "first_name": "Lê",
    "last_name": "Văn Quản",
    "gender": "male",
    "dateOfBirth": "1975-06-10",
    "address": {
      "street": "321 Đường Điện Biên Phủ",
      "city": "Hồ Chí Minh",
      "state": "TP.HCM",
      "postal_code": "70000",
      "country": "Vietnam"
    },
    "username": "admin_van_quan",
    "password": "QuanTri123@",
    "email": "vanquan.admin@gmail.com",
    "phone_number": "0923456789",
    "role": "student_manager"
  },
  "userType": "admin"
}
```

## Login Test Cases

### 1. Parent Login
```json
{
  "username": "parent_van_an",
  "password": "MatKhau123@",
  "userType": "parent"
}
```

### 2. Student Login
```json
{
  "username": "student_minh_khoi",
  "password": "HocSinh123@",
  "userType": "student"
}
```

### 3. Nurse Login
```json
{
  "username": "nurse_thi_lan",
  "password": "YTa123@",
  "userType": "medicalStaff"
}
```

### 4. Admin Login
```json
{
  "username": "admin_van_quan",
  "password": "QuanTri123@",
  "userType": "admin"
}
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "ObjectId",
      "username": "username",
      "first_name": "First",
      "last_name": "Last",
      "email": "email@example.com",
      // ... other fields without password
    }
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message"
}
```

## Rules và Limitations

1. **Public Registration**: Chỉ cho phép đăng ký parent
2. **Student/Staff/Admin**: Chỉ có thể được tạo bởi admin
3. **Password**: Được hash bằng bcrypt
4. **JWT Token**: Expires trong 24h
5. **Username**: Phải unique trong mỗi loại user
6. **Email**: Phải unique (parent, admin, medical staff)

## Enums

- **Gender**: "male", "female", "other"
- **Admin Role**: "super_admin", "student_manager"
- **Medical Staff Role**: "Nurse", "Doctor", "Healthcare Assistant"
