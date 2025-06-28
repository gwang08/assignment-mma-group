const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// Cấu hình kết nối MongoDB
const MONGODB_URI = 'mongodb://127.0.0.1:27017/assigment-mma';
const DATABASE_NAME = 'assigment-mma';

// Dữ liệu mẫu để import
const sampleData = {
  parents: [
    {
      first_name: "Nguyễn",
      last_name: "Văn An",
      gender: "male",
      dateOfBirth: new Date("1985-03-15"),
      address: {
        street: "123 Đường Lê Lợi",
        city: "Hồ Chí Minh",
        state: "TP.HCM",
        postal_code: "70000",
        country: "Vietnam"
      },
      username: "parent_test",
      password: "MatKhau123@",
      phone_number: "0901234567",
      email: "parent@test.com",
      is_active: true
    },
    {
      first_name: "Trần",
      last_name: "Thị Bình",
      gender: "female",
      dateOfBirth: new Date("1988-07-20"),
      address: {
        street: "456 Đường Nguyễn Trãi",
        city: "Hà Nội",
        state: "Hà Nội",
        postal_code: "10000",
        country: "Vietnam"
      },
      username: "parent_binh",
      password: "MatKhau456@",
      phone_number: "0912345678",
      email: "binh.parent@test.com",
      is_active: true
    }
  ],
  
  students: [
    {
      first_name: "Nguyễn",
      last_name: "Minh Khôi",
      gender: "male",
      dateOfBirth: new Date("2010-08-20"),
      address: {
        street: "456 Đường Nguyễn Thái Học",
        city: "Hồ Chí Minh",
        state: "TP.HCM",
        postal_code: "70000",
        country: "Vietnam"
      },
      username: "student_test",
      password: "HocSinh123@",
      class_name: "6A1",
      is_active: true
    },
    {
      first_name: "Lê",
      last_name: "Thị Mai",
      gender: "female",
      dateOfBirth: new Date("2011-02-14"),
      address: {
        street: "789 Đường Trần Hưng Đạo",
        city: "Đà Nẵng",
        state: "Đà Nẵng",
        postal_code: "50000",
        country: "Vietnam"
      },
      username: "student_mai",
      password: "HocSinh456@",
      class_name: "5B2",
      is_active: true
    },
    {
      first_name: "Phạm",
      last_name: "Văn Đức",
      gender: "male",
      dateOfBirth: new Date("2009-11-30"),
      address: {
        street: "321 Đường Lý Thường Kiệt",
        city: "Cần Thơ",
        state: "Cần Thơ",
        postal_code: "90000",
        country: "Vietnam"
      },
      username: "student_duc",
      password: "HocSinh789@",
      class_name: "7A3",
      is_active: true
    }
  ],
  
  medicalStaffs: [
    {
      first_name: "Trần",
      last_name: "Thị Lan",
      gender: "female",
      dateOfBirth: new Date("1990-12-05"),
      address: {
        street: "789 Đường Cách Mạng Tháng 8",
        city: "Hồ Chí Minh",
        state: "TP.HCM",
        postal_code: "70000",
        country: "Vietnam"
      },
      username: "nurse_test",
      password: "YTa123@",
      phone_number: "0912345678",
      email: "nurse@test.com",
      role: "Nurse",
      is_active: true
    },
    {
      first_name: "Đỗ",
      last_name: "Văn Hùng",
      gender: "male",
      dateOfBirth: new Date("1985-04-18"),
      address: {
        street: "654 Đường Võ Văn Tần",
        city: "Hồ Chí Minh",
        state: "TP.HCM",
        postal_code: "70000",
        country: "Vietnam"
      },
      username: "doctor_hung",
      password: "BacSi123@",
      phone_number: "0923456789",
      email: "hung.doctor@test.com",
      role: "Doctor",
      is_active: true
    }
  ],
  
  admins: [
    {
      first_name: "Lê",
      last_name: "Văn Quản",
      gender: "male",
      dateOfBirth: new Date("1975-06-10"),
      address: {
        street: "321 Đường Điện Biên Phủ",
        city: "Hồ Chí Minh",
        state: "TP.HCM",
        postal_code: "70000",
        country: "Vietnam"
      },
      username: "admin_test",
      password: "QuanTri123@",
      email: "admin@test.com",
      phone_number: "0923456789",
      role: "student_manager",
      permissions: {
        create_student: true,
        manage_student_parent: true,
        create_staff: true,
        manage_system: false
      },
      is_active: true
    }
  ]
};

// Hàm hash password
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

// Hàm import dữ liệu
async function importData() {
  let client;
  
  try {
    console.log('🔄 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(DATABASE_NAME);
    console.log('✅ Connected to MongoDB successfully!');
    
    // Import Parents
    console.log('\n📝 Importing Parents...');
    const parentsCollection = db.collection('parents');
    
    for (let parent of sampleData.parents) {
      try {
        // Check if user already exists
        const existingParent = await parentsCollection.findOne({ username: parent.username });
        if (existingParent) {
          console.log(`⚠️  Parent ${parent.username} already exists, skipping...`);
          continue;
        }
        
        // Hash password
        parent.password = await hashPassword(parent.password);
        parent.createdAt = new Date();
        parent.updatedAt = new Date();
        
        await parentsCollection.insertOne(parent);
        console.log(`✅ Parent ${parent.username} imported successfully`);
      } catch (error) {
        console.log(`❌ Error importing parent ${parent.username}:`, error.message);
      }
    }
    
    // Import Students
    console.log('\n📝 Importing Students...');
    const studentsCollection = db.collection('students');
    
    for (let student of sampleData.students) {
      try {
        const existingStudent = await studentsCollection.findOne({ username: student.username });
        if (existingStudent) {
          console.log(`⚠️  Student ${student.username} already exists, skipping...`);
          continue;
        }
        
        student.password = await hashPassword(student.password);
        student.createdAt = new Date();
        student.updatedAt = new Date();
        
        await studentsCollection.insertOne(student);
        console.log(`✅ Student ${student.username} imported successfully`);
      } catch (error) {
        console.log(`❌ Error importing student ${student.username}:`, error.message);
      }
    }
    
    // Import Medical Staff
    console.log('\n📝 Importing Medical Staff...');
    const medicalStaffsCollection = db.collection('medicalstaffs');
    
    for (let staff of sampleData.medicalStaffs) {
      try {
        const existingStaff = await medicalStaffsCollection.findOne({ username: staff.username });
        if (existingStaff) {
          console.log(`⚠️  Medical Staff ${staff.username} already exists, skipping...`);
          continue;
        }
        
        staff.password = await hashPassword(staff.password);
        staff.createdAt = new Date();
        staff.updatedAt = new Date();
        
        await medicalStaffsCollection.insertOne(staff);
        console.log(`✅ Medical Staff ${staff.username} imported successfully`);
      } catch (error) {
        console.log(`❌ Error importing medical staff ${staff.username}:`, error.message);
      }
    }
    
    // Import Admins
    console.log('\n📝 Importing Admins...');
    const adminsCollection = db.collection('admins');
    
    for (let admin of sampleData.admins) {
      try {
        const existingAdmin = await adminsCollection.findOne({ username: admin.username });
        if (existingAdmin) {
          console.log(`⚠️  Admin ${admin.username} already exists, skipping...`);
          continue;
        }
        
        admin.password = await hashPassword(admin.password);
        admin.createdAt = new Date();
        admin.updatedAt = new Date();
        
        await adminsCollection.insertOne(admin);
        console.log(`✅ Admin ${admin.username} imported successfully`);
      } catch (error) {
        console.log(`❌ Error importing admin ${admin.username}:`, error.message);
      }
    }
    
    console.log('\n🎉 Data import completed successfully!');
    
    // Display summary
    console.log('\n📊 Import Summary:');
    const parentCount = await parentsCollection.countDocuments();
    const studentCount = await studentsCollection.countDocuments();
    const staffCount = await medicalStaffsCollection.countDocuments();
    const adminCount = await adminsCollection.countDocuments();
    
    console.log(`👥 Parents: ${parentCount}`);
    console.log(`🎓 Students: ${studentCount}`);
    console.log(`🏥 Medical Staff: ${staffCount}`);
    console.log(`👑 Admins: ${adminCount}`);
    
  } catch (error) {
    console.error('❌ Error during import:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 MongoDB connection closed');
    }
  }
}

// Hàm hiển thị thông tin test accounts
function displayTestAccounts() {
  console.log('\n🔑 TEST ACCOUNTS:');
  console.log('==================');
  
  console.log('\n👥 PARENTS:');
  console.log('Username: parent_test | Password: MatKhau123@ | Type: parent');
  console.log('Username: parent_binh | Password: MatKhau456@ | Type: parent');
  
  console.log('\n🎓 STUDENTS:');
  console.log('Username: student_test | Password: HocSinh123@ | Type: student');
  console.log('Username: student_mai | Password: HocSinh456@ | Type: student');
  console.log('Username: student_duc | Password: HocSinh789@ | Type: student');
  
  console.log('\n🏥 MEDICAL STAFF:');
  console.log('Username: nurse_test | Password: YTa123@ | Type: medicalStaff');
  console.log('Username: doctor_hung | Password: BacSi123@ | Type: medicalStaff');
  
  console.log('\n👑 ADMINS:');
  console.log('Username: admin | Password: admin | Type: admin (default)');
  console.log('Username: admin_test | Password: QuanTri123@ | Type: admin');
  
  console.log('\n🌐 API Endpoints:');
  console.log('POST http://localhost:3000/auth/login');
  console.log('POST http://localhost:3000/auth/register');
}

// Main function
async function main() {
  console.log('🚀 MongoDB Data Import Script');
  console.log('==============================');
  
  await importData();
  displayTestAccounts();
}

// Export cho sử dụng
module.exports = {
  importData,
  sampleData,
  displayTestAccounts
};

// Chạy script nếu được gọi trực tiếp
if (require.main === module) {
  main().catch(console.error);
}
