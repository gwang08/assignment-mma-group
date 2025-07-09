const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const {
  GENDER,
  ALLERGY_SEVERITY,
  CHRONIC_DISEASE_STATUS,
  HEARING_STATUS,
  CAMPAIGN_TYPE,
  EVENT_TYPE,
  EVENT_SEVERITY,
  EVENT_STATUS,
} = require("./enums");

const User = require("../models/user/user");
const MedicalEvent = require("../models/medicalEvent");
const Campaign = require("../models/campaign/campaign");
const CampaignResult = require("../models/campaign/campaignResult");
const HealthProfile = require("../models/healthProfile");
const MedicineRequest = require("../models/medicineRequest");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/assignment-sdn";

async function main() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Hash password for nurse and student
    const hashedPassword = await bcrypt.hash("123123", 10);

    // 1. Create nurse
    const nurse = await User.create({
      username: "nurse_example",
      password: hashedPassword,
      first_name: "Jane",
      last_name: "Doe",
      email: "jane.doe@school.edu",
      phone_number: "098-765-4321",
      gender: GENDER.FEMALE,
      dateOfBirth: new Date("1992-05-15"),
      role: "medicalStaff",
      staff_role: "Nurse",
    });
    console.log("Inserted Nurse:", nurse._id);

    // 2. Create student
    const student = await User.create({
      username: "student_example",
      password: hashedPassword,
      first_name: "Nam",
      last_name: "Nguyen",
      email: "nam.nguyen@student.edu",
      phone_number: "0912345678",
      gender: GENDER.MALE,
      dateOfBirth: new Date("2014-09-01"),
      role: "student",
      class_name: "5A",
      student_id: "STU001",
    });
    console.log("Inserted Student:", student._id);

    // 3. Create campaign
    const campaign = await Campaign.create({
      title: "Chiến dịch tiêm chủng sởi 2024",
      campaign_type: "vaccination",
      type: CAMPAIGN_TYPE.VACCINATION,
      description: "Tiêm chủng phòng bệnh sởi cho học sinh lớp 1-5",
      target_classes: ["5A"],
      target_students: [student._id],
      start_date: new Date("2024-05-01"),
      end_date: new Date("2024-05-10"),
      date: new Date("2024-05-01"),
      created_by: nurse._id,
      status: "active",
      requires_consent: true,
      consent_deadline: new Date("2024-04-25"),
      instructions: "Mang theo sổ tiêm chủng",
      vaccineDetails: {
        brand: "MeaslesVax",
        batchNumber: "MSL2024-01",
        dosage: "0.5ml",
      },
    });
    console.log("Inserted Campaign:", campaign._id);

    // 4. Create medical event
    const medicalEvent = await MedicalEvent.create({
      student: student._id,
      created_by: nurse._id,
      event_type: EVENT_TYPE.OTHER,
      description: "Sốt cao 39°C, đau đầu, mệt mỏi",
      severity: EVENT_SEVERITY.MEDIUM,
      status: EVENT_STATUS.OPEN,
      symptoms: ["Sốt", "Đau đầu", "Mệt mỏi"],
      occurred_at: new Date(),
      treatment_notes: "Đã cho uống Paracetamol, theo dõi nhiệt độ",
      medications_administered: [
        {
          name: "Paracetamol",
          dosage: "500mg",
          time: new Date(),
          administered_by: nurse._id,
        },
      ],
      parent_notified: {
        status: true,
        time: new Date(),
        method: "Phone call",
      },
      follow_up_required: true,
      follow_up_notes:
        "Theo dõi thêm 24h, liên hệ phụ huynh nếu không giảm sốt",
    });
    console.log("Inserted MedicalEvent:", medicalEvent._id);

    // 5. Create health profile
    const healthProfile = await HealthProfile.create({
      student: student._id,
      allergies: [
        {
          name: "Trứng",
          severity: ALLERGY_SEVERITY.MILD,
          notes: "Phát ban nhẹ khi ăn trứng",
        },
      ],
      chronicDiseases: [
        {
          name: "Hen suyễn",
          status: CHRONIC_DISEASE_STATUS.MANAGED,
          notes: "Dùng thuốc định kỳ",
        },
      ],
      treatmentHistory: [
        {
          condition: "Viêm họng",
          treatmentDate: new Date("2023-11-10"),
          treatment: "Kháng sinh",
          outcome: "Khỏi",
        },
      ],
      vision: {
        leftEye: 9.5,
        rightEye: 9.0,
        lastCheckDate: new Date("2024-01-15"),
      },
      hearing: {
        leftEar: HEARING_STATUS.NORMAL,
        rightEar: HEARING_STATUS.NORMAL,
        lastCheckDate: new Date("2024-01-15"),
      },
      vaccinations: [
        {
          name: "Sởi",
          date: new Date("2022-06-01"),
          notes: "Không có phản ứng phụ",
        },
      ],
    });
    console.log("Inserted HealthProfile:", healthProfile._id);

    // 6. Create medicine request
    const now = new Date();
    const startDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // tomorrow
    const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    const medicineRequest = await MedicineRequest.create({
      student: student._id,
      created_by: nurse._id,
      startDate,
      endDate,
      medicines: [
        {
          name: "Amoxicillin",
          dosage: "250mg",
          frequency: "2 lần/ngày",
          notes: "Sau ăn",
        },
      ],
      status: "pending",
      notes: "Theo dõi dị ứng",
    });
    console.log("Inserted MedicineRequest:", medicineRequest._id);

    // 7. Create campaign result
    const campaignResult = await CampaignResult.create({
      campaign: campaign._id,
      created_by: nurse._id,
      student: student._id,
      notes: "Đã tiêm, không có phản ứng phụ",
      vaccination_details: {
        vaccinated_at: new Date("2024-05-02T09:00:00Z"),
        vaccine_details: {
          brand: "MeaslesVax",
          batch_number: "MSL2024-01",
          dose_number: 1,
          expiry_date: new Date("2025-12-31"),
        },
        administered_by: "Nurse Jane",
        side_effects: [],
        follow_up_required: false,
        status: "completed",
      },
    });
    console.log("Inserted CampaignResult:", campaignResult._id);
  } catch (err) {
    console.error("Error initializing example data:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

main();
