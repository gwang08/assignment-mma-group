const {MongoClient} = require("mongodb");
const bcrypt = require("bcryptjs");

// Cấu hình kết nối MongoDB
const MONGODB_URI = "mongodb://127.0.0.1:27017/assignment-mma";
const DATABASE_NAME = "assignment-mma";

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
        country: "Vietnam",
      },
      username: "parent_test",
      password: "MatKhau123@",
      phone_number: "0901234567",
      email: "parent@test.com",
      is_active: true,
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
        country: "Vietnam",
      },
      username: "parent_binh",
      password: "MatKhau456@",
      phone_number: "0912345678",
      email: "binh.parent@test.com",
      is_active: true,
    },
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
        country: "Vietnam",
      },
      username: "student_test",
      password: "HocSinh123@",
      class_name: "6A1",
      is_active: true,
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
        country: "Vietnam",
      },
      username: "student_mai",
      password: "HocSinh456@",
      class_name: "5B2",
      is_active: true,
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
        country: "Vietnam",
      },
      username: "student_duc",
      password: "HocSinh789@",
      class_name: "7A3",
      is_active: true,
    },
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
        country: "Vietnam",
      },
      username: "nurse_test",
      password: "YTa123@",
      phone_number: "0912345678",
      email: "nurse@test.com",
      role: "Nurse",
      is_active: true,
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
        country: "Vietnam",
      },
      username: "doctor_hung",
      password: "BacSi123@",
      phone_number: "0923456789",
      email: "hung.doctor@test.com",
      role: "Doctor",
      is_active: true,
    },
  ],

  admins: [
    {
      first_name: "Admin",
      last_name: "Manager",
      gender: "other",
      dateOfBirth: new Date("1990-01-01"),
      address: {
        street: "123 Admin Street",
        city: "Hồ Chí Minh",
        state: "TP.HCM",
        postal_code: "70000",
        country: "Vietnam",
      },
      username: "admin",
      password: "admin",
      email: "admin.manager@school.edu",
      phone_number: "123-456-7890",
      role: "student_manager",
      permissions: {
        create_student: true,
        manage_student_parent: true,
        create_staff: true,
        manage_system: false,
      },
      is_active: true,
    },
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
        country: "Vietnam",
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
        manage_system: false,
      },
      is_active: true,
    },
  ],

  // Thêm dữ liệu cho health profiles, campaigns, consultations, medical events, medicine requests
  healthProfiles: [
    {
      student: null, // Sẽ được set sau khi tạo students
      height: 150,
      weight: 45,
      bloodType: "A+",
      allergies: ["Penicillin"],
      chronicConditions: [],
      emergencyContact: {
        name: "Nguyễn Văn An",
        relationship: "Father",
        phone: "0901234567",
      },
      immunizationHistory: [
        {
          vaccine: "MMR",
          date: new Date("2020-03-15"),
          nextDue: new Date("2025-03-15"),
        },
      ],
      medicalNotes: "Student is generally healthy with no major concerns.",
    },
    {
      student: null,
      height: 148,
      weight: 42,
      bloodType: "O+",
      allergies: [],
      chronicConditions: [],
      emergencyContact: {
        name: "Trần Thị Bình",
        relationship: "Mother",
        phone: "0912345678",
      },
      immunizationHistory: [
        {
          vaccine: "DTaP",
          date: new Date("2021-01-20"),
          nextDue: new Date("2026-01-20"),
        },
      ],
      medicalNotes: "Student has good health records.",
    },
  ],

  campaigns: [
    {
      title: "Tiêm Chủng MMR 2024",
      type: "VACCINATION",
      description:
        "Chiến dịch tiêm chủng sởi, quai bị, rubella cho học sinh toàn trường",
      date: new Date("2024-03-15"),
      start_date: new Date("2024-03-01"),
      end_date: new Date("2024-03-30"),
      targetAudience: "All students",
      status: "Active",
    },
    {
      title: "Kiểm Tra Sức Khỏe Định Kỳ 2024",
      type: "CHECKUP",
      description: "Kiểm tra sức khỏe định kỳ cho học sinh các khối 6, 7, 8",
      date: new Date("2024-04-15"),
      start_date: new Date("2024-04-01"),
      end_date: new Date("2024-04-30"),
      targetAudience: "Grades 6-8",
      status: "Active",
    },
    {
      title: "Tiêm Chủng COVID-19",
      type: "VACCINATION",
      description:
        "Chiến dịch tiêm chủng COVID-19 cho học sinh từ 12 tuổi trở lên",
      date: new Date("2024-01-15"),
      start_date: new Date("2024-01-01"),
      end_date: new Date("2024-01-31"),
      targetAudience: "Students 12+",
      status: "Completed",
    },
  ],

  consultations: [
    {
      student: null,
      medicalStaff: null,
      scheduledDate: new Date("2024-03-20"),
      scheduledTime: "09:00",
      reason: "Tư vấn về chế độ dinh dưỡng",
      status: "Scheduled",
      notes: "Học sinh cần tư vấn về chế độ ăn uống hợp lý",
    },
    {
      student: null,
      medicalStaff: null,
      scheduledDate: new Date("2024-03-22"),
      scheduledTime: "14:00",
      reason: "Kiểm tra sức khỏe sau ốm",
      status: "Scheduled",
      notes: "Học sinh vừa khỏi bệnh, cần kiểm tra lại",
    },
    {
      student: null,
      medicalStaff: null,
      scheduledDate: new Date("2024-03-18"),
      scheduledTime: "10:30",
      reason: "Tư vấn về vấn đề thị lực",
      status: "Completed",
      notes: "Đã hoàn thành tư vấn, học sinh được khuyến nghị khám mắt",
    },
  ],

  medicalEvents: [
    {
      student: null,
      created_by: null,
      event_type: "Fever",
      description: "Học sinh bị sốt 38.5°C trong giờ học",
      severity: "Medium",
      status: "Open",
      symptoms: ["High temperature", "Headache"],
      occurred_at: new Date("2024-03-15T08:30:00Z"),
      treatment_notes: "Đã cho uống paracetamol và nghỉ ngơi",
      parent_notified: {
        status: true,
        time: new Date("2024-03-15T08:45:00Z"),
        method: "Phone call",
      },
      follow_up_required: false,
    },
    {
      student: null,
      created_by: null,
      event_type: "Injury",
      description: "Học sinh bị ngã trong giờ thể dục",
      severity: "Low",
      status: "Resolved",
      symptoms: ["Minor bruising", "Slight pain"],
      occurred_at: new Date("2024-03-10T14:20:00Z"),
      treatment_notes: "Đã bôi thuốc và băng bó nhẹ",
      parent_notified: {
        status: true,
        time: new Date("2024-03-10T14:30:00Z"),
        method: "Phone call",
      },
      follow_up_required: false,
      resolved_at: new Date("2024-03-10T15:00:00Z"),
    },
    {
      student: null,
      created_by: null,
      event_type: "Accident",
      description: "Học sinh bị đau bụng dữ dội",
      severity: "Emergency",
      status: "In Progress",
      symptoms: ["Severe abdominal pain", "Nausea"],
      occurred_at: new Date("2024-03-16T10:15:00Z"),
      treatment_notes: "Đã gọi xe cấp cứu và thông báo cho phụ huynh",
      parent_notified: {
        status: true,
        time: new Date("2024-03-16T10:20:00Z"),
        method: "Emergency call",
      },
      follow_up_required: true,
      follow_up_notes: "Cần theo dõi tình trạng tại bệnh viện",
    },
  ],

  medicineRequests: [
    {
      student: null,
      created_by: null,
      medicine_name: "Paracetamol",
      reason: "Đau đầu và sốt nhẹ",
      dosage: "500mg",
      frequency: "3 times daily",
      status: "Pending",
      notes: "Học sinh cần thuốc để giảm đau đầu",
    },
    {
      student: null,
      created_by: null,
      medicine_name: "Vitamin C",
      reason: "Tăng cường sức đề kháng",
      dosage: "100mg",
      frequency: "Once daily",
      status: "Approved",
      notes: "Đã được phê duyệt và cấp thuốc",
      approved_at: new Date("2024-03-14T09:00:00Z"),
    },
    {
      student: null,
      created_by: null,
      medicine_name: "Ibuprofen",
      reason: "Đau nhức cơ bắp sau thể dục",
      dosage: "400mg",
      frequency: "As needed",
      status: "Rejected",
      notes: "Không cần thiết, học sinh có thể nghỉ ngơi",
      rejected_at: new Date("2024-03-13T16:30:00Z"),
    },
  ],
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
    console.log("🔄 Connecting to MongoDB...");
    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(DATABASE_NAME);
    console.log("✅ Connected to MongoDB successfully!");

    // Import Parents
    console.log("\n📝 Importing Parents...");
    const parentsCollection = db.collection("parents");

    for (let parent of sampleData.parents) {
      try {
        // Check if user already exists
        const existingParent = await parentsCollection.findOne({
          username: parent.username,
        });
        if (existingParent) {
          console.log(
            `⚠️  Parent ${parent.username} already exists, skipping...`
          );
          continue;
        }

        // Hash password
        parent.password = await hashPassword(parent.password);
        parent.createdAt = new Date();
        parent.updatedAt = new Date();

        await parentsCollection.insertOne(parent);
        console.log(`✅ Parent ${parent.username} imported successfully`);
      } catch (error) {
        console.log(
          `❌ Error importing parent ${parent.username}:`,
          error.message
        );
      }
    }

    // Import Students
    console.log("\n📝 Importing Students...");
    const studentsCollection = db.collection("students");

    for (let student of sampleData.students) {
      try {
        const existingStudent = await studentsCollection.findOne({
          username: student.username,
        });
        if (existingStudent) {
          console.log(
            `⚠️  Student ${student.username} already exists, skipping...`
          );
          continue;
        }

        student.password = await hashPassword(student.password);
        student.createdAt = new Date();
        student.updatedAt = new Date();

        await studentsCollection.insertOne(student);
        console.log(`✅ Student ${student.username} imported successfully`);
      } catch (error) {
        console.log(
          `❌ Error importing student ${student.username}:`,
          error.message
        );
      }
    }

    // Import Medical Staff
    console.log("\n📝 Importing Medical Staff...");
    const medicalStaffsCollection = db.collection("medicalstaffs");

    for (let staff of sampleData.medicalStaffs) {
      try {
        const existingStaff = await medicalStaffsCollection.findOne({
          username: staff.username,
        });
        if (existingStaff) {
          console.log(
            `⚠️  Medical Staff ${staff.username} already exists, skipping...`
          );
          continue;
        }

        staff.password = await hashPassword(staff.password);
        staff.createdAt = new Date();
        staff.updatedAt = new Date();

        await medicalStaffsCollection.insertOne(staff);
        console.log(`✅ Medical Staff ${staff.username} imported successfully`);
      } catch (error) {
        console.log(
          `❌ Error importing medical staff ${staff.username}:`,
          error.message
        );
      }
    }

    // Import Admins
    console.log("\n📝 Importing Admins...");
    const adminsCollection = db.collection("admins");

    for (let admin of sampleData.admins) {
      try {
        const existingAdmin = await adminsCollection.findOne({
          username: admin.username,
        });
        if (existingAdmin) {
          console.log(
            `⚠️  Admin ${admin.username} already exists, skipping...`
          );
          continue;
        }

        admin.password = await hashPassword(admin.password);
        admin.createdAt = new Date();
        admin.updatedAt = new Date();

        await adminsCollection.insertOne(admin);
        console.log(`✅ Admin ${admin.username} imported successfully`);
      } catch (error) {
        console.log(
          `❌ Error importing admin ${admin.username}:`,
          error.message
        );
      }
    }

    // Import Health Profiles
    console.log("\n📝 Importing Health Profiles...");
    const healthProfilesCollection = db.collection("healthprofiles");

    for (let profile of sampleData.healthProfiles) {
      try {
        const existingProfile = await healthProfilesCollection.findOne({
          student: profile.student,
        });
        if (existingProfile) {
          console.log(
            `⚠️  Health Profile for student ${profile.student} already exists, skipping...`
          );
          continue;
        }

        profile.createdAt = new Date();
        profile.updatedAt = new Date();

        await healthProfilesCollection.insertOne(profile);
        console.log(
          `✅ Health Profile for student ${profile.student} imported successfully`
        );
      } catch (error) {
        console.log(
          `❌ Error importing health profile for student ${profile.student}:`,
          error.message
        );
      }
    }

    // Import Campaigns
    console.log("\n📝 Importing Campaigns...");
    const campaignsCollection = db.collection("campaigns");

    for (let campaign of sampleData.campaigns) {
      try {
        const existingCampaign = await campaignsCollection.findOne({
          title: campaign.title,
        });
        if (existingCampaign) {
          console.log(
            `⚠️  Campaign ${campaign.title} already exists, skipping...`
          );
          continue;
        }

        campaign.createdAt = new Date();
        campaign.updatedAt = new Date();

        await campaignsCollection.insertOne(campaign);
        console.log(`✅ Campaign ${campaign.title} imported successfully`);
      } catch (error) {
        console.log(
          `❌ Error importing campaign ${campaign.title}:`,
          error.message
        );
      }
    }

    // Import Consultations
    console.log("\n📝 Importing Consultations...");
    const consultationsCollection = db.collection("consultations");

    for (let consultation of sampleData.consultations) {
      try {
        const existingConsultation = await consultationsCollection.findOne({
          student: consultation.student,
          medicalStaff: consultation.medicalStaff,
        });
        if (existingConsultation) {
          console.log(
            `⚠️  Consultation between student ${consultation.student} and medical staff ${consultation.medicalStaff} already exists, skipping...`
          );
          continue;
        }

        consultation.createdAt = new Date();
        consultation.updatedAt = new Date();

        await consultationsCollection.insertOne(consultation);
        console.log(
          `✅ Consultation between student ${consultation.student} and medical staff ${consultation.medicalStaff} imported successfully`
        );
      } catch (error) {
        console.log(
          `❌ Error importing consultation between student ${consultation.student} and medical staff ${consultation.medicalStaff}:`,
          error.message
        );
      }
    }

    // Import Medical Events
    console.log("\n📝 Importing Medical Events...");
    const medicalEventsCollection = db.collection("medicalevents");

    for (let event of sampleData.medicalEvents) {
      try {
        const existingEvent = await medicalEventsCollection.findOne({
          student: event.student,
        });
        if (existingEvent) {
          console.log(
            `⚠️  Medical Event for student ${event.student} already exists, skipping...`
          );
          continue;
        }

        event.createdAt = new Date();
        event.updatedAt = new Date();

        await medicalEventsCollection.insertOne(event);
        console.log(
          `✅ Medical Event for student ${event.student} imported successfully`
        );
      } catch (error) {
        console.log(
          `❌ Error importing medical event for student ${event.student}:`,
          error.message
        );
      }
    }

    // Import Medicine Requests
    console.log("\n📝 Importing Medicine Requests...");
    const medicineRequestsCollection = db.collection("medicinerequests");

    for (let request of sampleData.medicineRequests) {
      try {
        const existingRequest = await medicineRequestsCollection.findOne({
          student: request.student,
        });
        if (existingRequest) {
          console.log(
            `⚠️  Medicine Request for student ${request.student} already exists, skipping...`
          );
          continue;
        }

        request.createdAt = new Date();
        request.updatedAt = new Date();

        await medicineRequestsCollection.insertOne(request);
        console.log(
          `✅ Medicine Request for student ${request.student} imported successfully`
        );
      } catch (error) {
        console.log(
          `❌ Error importing medicine request for student ${request.student}:`,
          error.message
        );
      }
    }

    console.log("\n🎉 Data import completed successfully!");

    // Display summary
    console.log("\n📊 Import Summary:");
    const parentCount = await parentsCollection.countDocuments();
    const studentCount = await studentsCollection.countDocuments();
    const staffCount = await medicalStaffsCollection.countDocuments();
    const adminCount = await adminsCollection.countDocuments();

    console.log(`👥 Parents: ${parentCount}`);
    console.log(`🎓 Students: ${studentCount}`);
    console.log(`🏥 Medical Staff: ${staffCount}`);
    console.log(`👑 Admins: ${adminCount}`);
  } catch (error) {
    console.error("❌ Error during import:", error);
  } finally {
    if (client) {
      await client.close();
      console.log("\n🔌 MongoDB connection closed");
    }
  }
}

// Hàm hiển thị thông tin test accounts
function displayTestAccounts() {
  console.log("\n🔑 TEST ACCOUNTS:");
  console.log("==================");

  console.log("\n👥 PARENTS:");
  console.log("Username: parent_test | Password: MatKhau123@ | Type: parent");
  console.log("Username: parent_binh | Password: MatKhau456@ | Type: parent");

  console.log("\n🎓 STUDENTS:");
  console.log("Username: student_test | Password: HocSinh123@ | Type: student");
  console.log("Username: student_mai | Password: HocSinh456@ | Type: student");
  console.log("Username: student_duc | Password: HocSinh789@ | Type: student");

  console.log("\n🏥 MEDICAL STAFF:");
  console.log("Username: nurse_test | Password: YTa123@ | Type: medicalStaff");
  console.log(
    "Username: doctor_hung | Password: BacSi123@ | Type: medicalStaff"
  );

  console.log("\n👑 ADMINS:");
  console.log("Username: admin | Password: admin | Type: admin (default)");
  console.log("Username: admin_test | Password: QuanTri123@ | Type: admin");

  console.log("\n🌐 API Endpoints:");
  console.log("POST http://localhost:3000/auth/login");
  console.log("POST http://localhost:3000/auth/register");
}

// Main function
async function main() {
  console.log("🚀 MongoDB Data Import Script");
  console.log("==============================");

  await importData();
  displayTestAccounts();
}

// Export cho sử dụng
module.exports = {
  importData,
  sampleData,
  displayTestAccounts,
};

// Chạy script nếu được gọi trực tiếp
if (require.main === module) {
  main().catch(console.error);
}
