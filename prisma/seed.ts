import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["error", "warn"],
});

// ─── Data ───────────────────────────────────────────────────────────────────

const DEMO_USER_ID = "demo-user-001";

const INDIAN_WORKERS: {
  name: string;
  phone: string;
  village: string;
  dailyWage: number;
  joinDate: string;
}[] = [
  { name: "Ramesh Singh", phone: "9876543210", village: "Sultanpur", dailyWage: 450, joinDate: "2023-03-15" },
  { name: "Suresh Patel", phone: "9812345678", village: "Nagpur Tanda", dailyWage: 400, joinDate: "2023-01-10" },
  { name: "Kamala Devi", phone: "9834567890", village: "Ramnagar", dailyWage: 350, joinDate: "2023-05-20" },
  { name: "Lakshmi Bai", phone: "9856789012", village: "Barwani", dailyWage: 350, joinDate: "2022-11-05" },
  { name: "Ganesh Kumar", phone: "9823456789", village: "Harda", dailyWage: 600, joinDate: "2022-08-12" },
  { name: "Mohan Lal", phone: "9845678901", village: "Balaghat", dailyWage: 420, joinDate: "2023-07-01" },
  { name: "Sita Ram", phone: "9867890123", village: "Seoni", dailyWage: 380, joinDate: "2023-09-14" },
  { name: "Rajendra Prasad", phone: "9889012345", village: "Mandla", dailyWage: 500, joinDate: "2022-12-22" },
  { name: "Priya Kumari", phone: "9801234567", village: "Chhindwara", dailyWage: 360, joinDate: "2024-01-18" },
  { name: "Dinesh Yadav", phone: "9890123456", village: "Vidisha", dailyWage: 440, joinDate: "2023-04-30" },
  { name: "Meena Verma", phone: "9878901234", village: "Raisen", dailyWage: 340, joinDate: "2024-02-05" },
  { name: "Vinod Tiwari", phone: "9856789034", village: "Sehore", dailyWage: 480, joinDate: "2023-06-18" },
  { name: "Savitri Devi", phone: "9834567012", village: "Betul", dailyWage: 360, joinDate: "2023-08-22" },
  { name: "Prakash Sharma", phone: "9812345690", village: "Hoshangabad", dailyWage: 520, joinDate: "2022-10-10" },
  { name: "Anita Mishra", phone: "9890123478", village: "Narsinghpur", dailyWage: 370, joinDate: "2024-03-01" },
  { name: "Bharat Pal", phone: "9823456801", village: "Jabalpur", dailyWage: 430, joinDate: "2023-02-14" },
  { name: "Sunita Rawat", phone: "9845678923", village: "Katni", dailyWage: 355, joinDate: "2023-11-29" },
  { name: "Arjun Singh", phone: "9867890145", village: "Damoh", dailyWage: 490, joinDate: "2022-07-07" },
  { name: "Geeta Bai", phone: "9889012367", village: "Panna", dailyWage: 345, joinDate: "2024-04-15" },
  { name: "Mahesh Kumar", phone: "9801234589", village: "Sagar", dailyWage: 410, joinDate: "2023-10-03" },
  { name: "Radha Devi", phone: "9876501234", village: "Damoh", dailyWage: 360, joinDate: "2024-01-09" },
  { name: "Sunil Gupta", phone: "9812001234", village: "Guna", dailyWage: 460, joinDate: "2023-03-28" },
  { name: "Santosh Kumar", phone: "9834001234", village: "Shivpuri", dailyWage: 400, joinDate: "2023-05-12" },
  { name: "Bimla Devi", phone: "9856001234", village: "Gwalior", dailyWage: 350, joinDate: "2022-09-20" },
  { name: "Ravi Shankar", phone: "9823001234", village: "Morena", dailyWage: 470, joinDate: "2023-01-25" },
  { name: "Pushpa Yadav", phone: "9845001234", village: "Bhind", dailyWage: 355, joinDate: "2024-02-19" },
  { name: "Ashok Prajapati", phone: "9867001234", village: "Datia", dailyWage: 430, joinDate: "2023-07-08" },
  { name: "Champa Bai", phone: "9889001234", village: "Tikamgarh", dailyWage: 365, joinDate: "2023-09-02" },
  { name: "Laxman Das", phone: "9801001234", village: "Chhatarpur", dailyWage: 510, joinDate: "2022-06-14" },
  { name: "Usha Rani", phone: "9890001234", village: "Panna", dailyWage: 345, joinDate: "2024-05-01" },
  { name: "Narayan Singh", phone: "9878001234", village: "Satna", dailyWage: 440, joinDate: "2023-04-17" },
  { name: "Malti Devi", phone: "9856101234", village: "Rewa", dailyWage: 360, joinDate: "2023-06-25" },
  { name: "Harish Chandra", phone: "9834101234", village: "Sidhi", dailyWage: 490, joinDate: "2022-11-30" },
  { name: "Rekha Patel", phone: "9812101234", village: "Singrauli", dailyWage: 370, joinDate: "2024-03-18" },
  { name: "Balram Yadav", phone: "9876101234", village: "Umaria", dailyWage: 420, joinDate: "2023-08-05" },
  { name: "Shanti Devi", phone: "9890101234", village: "Shahdol", dailyWage: 350, joinDate: "2023-10-22" },
  { name: "Kailash Nath", phone: "9823101234", village: "Anuppur", dailyWage: 500, joinDate: "2022-05-18" },
  { name: "Durga Bai", phone: "9845101234", village: "Dindori", dailyWage: 355, joinDate: "2024-04-08" },
  { name: "Om Prakash", phone: "9867101234", village: "Mandla", dailyWage: 480, joinDate: "2023-02-27" },
  { name: "Kavita Rani", phone: "9889101234", village: "Balaghat", dailyWage: 365, joinDate: "2023-11-14" },
  { name: "Jagannath Rao", phone: "9801101234", village: "Seoni", dailyWage: 530, joinDate: "2022-08-30" },
  { name: "Meera Devi", phone: "9812201234", village: "Chhindwara", dailyWage: 360, joinDate: "2024-01-23" },
  { name: "Ramavtar Patel", phone: "9834201234", village: "Harda", dailyWage: 415, joinDate: "2023-05-06" },
  { name: "Sundar Lal", phone: "9856201234", village: "Khandwa", dailyWage: 445, joinDate: "2023-03-11" },
  { name: "Kiran Bai", phone: "9823201234", village: "Khargone", dailyWage: 355, joinDate: "2024-02-28" },
  { name: "Tejpal Singh", phone: "9845201234", village: "Barwani", dailyWage: 470, joinDate: "2023-07-19" },
  { name: "Indira Devi", phone: "9867201234", village: "Alirajpur", dailyWage: 350, joinDate: "2023-09-08" },
  { name: "Deendayal Nath", phone: "9889201234", village: "Jhabua", dailyWage: 420, joinDate: "2022-12-05" },
  { name: "Parvati Bai", phone: "9801201234", village: "Ratlam", dailyWage: 360, joinDate: "2024-05-15" },
  { name: "Vitthal Rao", phone: "9890201234", village: "Mandsaur", dailyWage: 550, joinDate: "2022-04-20" },
];

const LANDS = [
  { name: "North Field – Block A", acres: 12.5, location: "Survey No. 45, Sultanpur", crop: "Sugarcane", status: "active", sowingDate: "2025-11-01" },
  { name: "South Block", acres: 8.0, location: "Survey No. 67, Ramnagar", crop: "Wheat", status: "harvested", sowingDate: "2025-10-15", harvestDate: "2026-03-20" },
  { name: "East Parcel", acres: 5.5, location: "Survey No. 23, Nagpur Tanda", crop: "Corn", status: "active", sowingDate: "2026-05-01" },
  { name: "West Field", acres: 15.0, location: "Survey No. 89, Barwani", crop: "Soybean", status: "active", sowingDate: "2026-06-10" },
  { name: "Central Block", acres: 7.2, location: "Survey No. 12, Harda", crop: "Cotton", status: "active", sowingDate: "2025-12-05" },
  { name: "Khasra 101", acres: 10.0, location: "Survey No. 101, Balaghat", crop: "Paddy", status: "active", sowingDate: "2026-06-01" },
  { name: "River Side Plot", acres: 4.8, location: "Near Narmada River", crop: "Banana", status: "active", sowingDate: "2025-09-15" },
  { name: "Hillock Plot", acres: 3.2, location: "Survey No. 78, Mandla", crop: "", status: "fallow", sowingDate: "" },
  { name: "Khasra 212", acres: 9.5, location: "Survey No. 212, Vidisha", crop: "Onion", status: "active", sowingDate: "2025-10-20" },
  { name: "Khasra 305", acres: 6.0, location: "Survey No. 305, Sehore", crop: "Garlic", status: "active", sowingDate: "2025-11-10" },
  { name: "Market Garden", acres: 2.5, location: "Survey No. 55, Raisen", crop: "Vegetables", status: "active", sowingDate: "2026-04-01" },
  { name: "Orchard Block", acres: 8.8, location: "Survey No. 66, Narsinghpur", crop: "Mango", status: "active", sowingDate: "2024-03-01" },
  { name: "Leased Land A", acres: 20.0, location: "Survey No. 144, Betul", crop: "Sugarcane", status: "active", sowingDate: "2025-12-15" },
  { name: "Khasra 411", acres: 5.0, location: "Survey No. 411, Hoshangabad", crop: "Maize", status: "active", sowingDate: "2026-05-20" },
  { name: "Khasra 500", acres: 11.0, location: "Survey No. 500, Seoni", crop: "Tur Dal", status: "active", sowingDate: "2026-06-05" },
  { name: "Dry Land Block", acres: 6.5, location: "Survey No. 33, Chhindwara", crop: "Jowar", status: "fallow" },
  { name: "Pond Side Field", acres: 4.0, location: "Near Reservoir, Katni", crop: "Paddy", status: "active", sowingDate: "2026-06-01" },
  { name: "Khasra 601", acres: 7.8, location: "Survey No. 601, Sagar", crop: "Wheat", status: "harvested", sowingDate: "2025-11-01", harvestDate: "2026-04-10" },
  { name: "Village Common Land", acres: 3.5, location: "Survey No. 99, Damoh", crop: "Groundnut", status: "active", sowingDate: "2026-04-15" },
  { name: "Khasra 700", acres: 18.0, location: "Survey No. 700, Jabalpur", crop: "Soybean", status: "active", sowingDate: "2026-06-12" },
];

const TRACTORS = [
  { name: "Mahindra 575", registrationNo: "MP-09-AB-1234", model: "Mahindra 575 DI", driverName: "Ganesh Kumar", purchaseDate: "2021-03-15", status: "active" },
  { name: "John Deere 5310", registrationNo: "MP-09-CD-5678", model: "John Deere 5310", driverName: "Narayan Singh", purchaseDate: "2022-07-20", status: "active" },
  { name: "Sonalika DI 750 III", registrationNo: "MP-09-EF-9012", model: "Sonalika DI 750", driverName: "Tejpal Singh", purchaseDate: "2020-11-10", status: "active" },
  { name: "Eicher 485", registrationNo: "MP-09-GH-3456", model: "Eicher 485 Super", driverName: "Arjun Singh", purchaseDate: "2023-01-05", status: "active" },
];

const EXPENSE_TEMPLATES = [
  { category: "fertilizers", descriptions: ["DAP Fertilizer", "Urea Application", "Potash Fertilizer", "Micronutrient Spray", "NPK Complex"], min: 3000, max: 15000 },
  { category: "seeds", descriptions: ["Wheat Seeds", "Soybean Seeds", "Cotton Seeds", "Hybrid Maize Seeds", "Paddy Seeds"], min: 5000, max: 25000 },
  { category: "pesticides", descriptions: ["Herbicide Spray", "Fungicide Application", "Insecticide Treatment", "Weed Control", "Pest Management"], min: 1500, max: 8000 },
  { category: "labour", descriptions: ["Harvesting Labour", "Transplanting Labour", "Weeding Labour", "Loading Labour", "Sowing Labour"], min: 2000, max: 12000 },
  { category: "repairs", descriptions: ["Tractor Repair", "Pump Set Repair", "Irrigation Pipe Repair", "Motor Winding", "Engine Service"], min: 1000, max: 10000 },
  { category: "equipment", descriptions: ["Drip Irrigation Kit", "Sprinkler Set", "Spray Pump", "Harvester Blade", "Cultivator Part"], min: 2000, max: 20000 },
  { category: "other", descriptions: ["Water Tanker", "Transport to Mandi", "Cold Storage", "Electricity Bill", "Land Revenue"], min: 500, max: 5000 },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

// ─── Main Seed ──────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🌱 Starting FARM ERP seed...\n");

  // ── Clean Up ──────────────────────────────────────────────────────────────
  console.log("🗑️  Cleaning existing data...");
  await prisma.salaryPayment.deleteMany();
  await prisma.salaryRecord.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.dieselLog.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.land.deleteMany();
  await prisma.tractor.deleteMany();
  await prisma.worker.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();
  console.log("✅ Cleanup complete\n");

  // ── User ──────────────────────────────────────────────────────────────────
  console.log("👤 Creating demo user...");
  await prisma.user.create({
    data: {
      id: DEMO_USER_ID,
      email: "farmer@farmerp.com",
      name: "Rajesh Kumar",
      farmName: "Green Valley Farms",
      phone: "+91-9876543210",
      role: "owner",
    },
  });
  console.log("✅ Demo user created\n");

  // ── Tractors ──────────────────────────────────────────────────────────────
  console.log("🚜 Creating tractors...");
  const tractorRecords = await Promise.all(
    TRACTORS.map((t) =>
      prisma.tractor.create({
        data: {
          userId: DEMO_USER_ID,
          name: t.name,
          registrationNo: t.registrationNo,
          model: t.model,
          driverName: t.driverName,
          purchaseDate: new Date(t.purchaseDate),
          status: t.status,
        },
      })
    )
  );
  console.log(`✅ Created ${tractorRecords.length} tractors\n`);

  // ── Workers ───────────────────────────────────────────────────────────────
  console.log("👷 Creating 50 workers...");
  const workerRecords = await Promise.all(
    INDIAN_WORKERS.map((w, idx) =>
      prisma.worker.create({
        data: {
          userId: DEMO_USER_ID,
          name: w.name,
          phone: w.phone,
          village: w.village,
          dailyWage: w.dailyWage,
          joinDate: new Date(w.joinDate),
          status: idx < 45 ? "active" : "inactive", // last 5 are inactive
        },
      })
    )
  );
  console.log(`✅ Created ${workerRecords.length} workers\n`);

  // ── Lands ──────────────────────────────────────────────────────────────────
  console.log("🌾 Creating land records...");
  await Promise.all(
    LANDS.map((l) =>
      prisma.land.create({
        data: {
          userId: DEMO_USER_ID,
          name: l.name,
          acres: l.acres,
          location: l.location ?? "",
          crop: l.crop ?? "",
          status: l.status,
          sowingDate: l.sowingDate ? new Date(l.sowingDate) : null,
          harvestDate: l.harvestDate ? new Date(l.harvestDate) : null,
        },
      })
    )
  );
  console.log(`✅ Created ${LANDS.length} land parcels\n`);

  // ── Attendance (last 6 months) ────────────────────────────────────────────
  console.log("📅 Generating 6 months of attendance...");
  const activeWorkers = workerRecords.filter((_, i) => i < 45);
  const now = new Date();
  let totalAttendance = 0;

  for (let m = 5; m >= 0; m--) {
    const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const year = d.getFullYear();
    const month = d.getMonth(); // 0-indexed
    const days = daysInMonth(year, month + 1);
    const daysToProcess = m === 0 ? Math.min(now.getDate(), days) : days;

    for (let day = 1; day <= daysToProcess; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      // Skip Sundays (most farms rest)
      if (dayOfWeek === 0) continue;

      for (const worker of activeWorkers) {
        // Each worker has a personal attendance pattern
        const rand = (worker.name.charCodeAt(0) + day + month) % 100;
        let status: string;
        if (rand < 75) status = "present";       // 75% present
        else if (rand < 85) status = "half";      // 10% half day
        else status = "absent";                    // 15% absent

        try {
          await prisma.attendance.create({
            data: { workerId: worker.id, date, status, markedBy: DEMO_USER_ID },
          });
          totalAttendance++;
        } catch {
          // skip duplicates
        }
      }
    }
  }
  console.log(`✅ Created ${totalAttendance} attendance records\n`);

  // ── Expenses (6 months) ───────────────────────────────────────────────────
  console.log("💰 Generating expenses...");
  let totalExpenses = 0;

  for (let m = 5; m >= 0; m--) {
    const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const days = daysInMonth(d.getFullYear(), d.getMonth() + 1);

    // 3-6 expenses per month
    const expenseCount = randomBetween(3, 6);
    const expenseData = [];

    for (let i = 0; i < expenseCount; i++) {
      const template = randomElement(EXPENSE_TEMPLATES);
      const day = randomBetween(1, days);
      const expenseDate = new Date(d.getFullYear(), d.getMonth(), day);
      expenseData.push({
        userId: DEMO_USER_ID,
        date: expenseDate,
        category: template.category,
        amount: randomBetween(template.min, template.max),
        description: randomElement(template.descriptions),
        notes: "",
      });
    }

    for (const exp of expenseData) {
      try {
        await prisma.expense.create({ data: exp });
        totalExpenses++;
      } catch {
        // skip on error
      }
    }
  }
  console.log(`✅ Created ${totalExpenses} expense records\n`);

  // ── Diesel Logs ───────────────────────────────────────────────────────────
  console.log("⛽ Generating diesel logs...");
  const DIESEL_PURPOSES = ["ploughing", "transport", "harvesting", "cultivation", "irrigation", "other"];
  let dieselCount = 0;

  for (const tractor of tractorRecords) {
    for (let m = 5; m >= 0; m--) {
      const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const days = daysInMonth(d.getFullYear(), d.getMonth() + 1);
      // 3-5 diesel logs per tractor per month
      const logCount = randomBetween(3, 5);

      for (let i = 0; i < logCount; i++) {
        const day = randomBetween(1, days);
        const liters = randomBetween(30, 80);
        const pricePerLiter = randomBetween(92, 98);
        await prisma.dieselLog.create({
          data: {
            tractorId: tractor.id,
            date: new Date(d.getFullYear(), d.getMonth(), day),
            liters,
            cost: liters * pricePerLiter,
            hoursWorked: randomBetween(4, 12),
            purpose: randomElement(DIESEL_PURPOSES),
            notes: "",
          },
        });
        dieselCount++;
      }
    }
  }
  console.log(`✅ Created ${dieselCount} diesel log entries\n`);

  // ── Salary Records (last 5 complete months) ───────────────────────────────
  console.log("💵 Generating salary records from attendance...");
  let salaryCount = 0;

  for (let m = 5; m >= 1; m--) {
    const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1; // 1-indexed
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    for (const worker of activeWorkers) {
      const workerAttendance = await prisma.attendance.findMany({
        where: {
          workerId: worker.id,
          date: { gte: startOfMonth, lte: endOfMonth },
        },
      });

      const daysWorked = workerAttendance.filter((a) => a.status === "present").length;
      const halfDays = workerAttendance.filter((a) => a.status === "half").length;
      const effectiveDays = daysWorked + halfDays * 0.5;
      const totalAmount = effectiveDays * worker.dailyWage;

      if (totalAmount > 0) {
        // Older months are more likely to be paid
        const isPaid = m >= 3 ? Math.random() > 0.1 : Math.random() > 0.5;
        await prisma.salaryRecord.upsert({
          where: { workerId_month_year: { workerId: worker.id, month, year } },
          update: {},
          create: {
            workerId: worker.id,
            month,
            year,
            daysWorked,
            halfDays,
            dailyWage: worker.dailyWage,
            totalAmount,
            status: isPaid ? "paid" : "pending",
          },
        });
        salaryCount++;
      }
    }
  }
  console.log(`✅ Created ${salaryCount} salary records\n`);

  // ─── Summary ─────────────────────────────────────────────────────────────
  console.log("═══════════════════════════════════════");
  console.log("🎉 FARM ERP Seed Complete!");
  console.log("═══════════════════════════════════════");
  console.log(`  👤 Users:       1`);
  console.log(`  👷 Workers:     ${workerRecords.length} (45 active, 5 inactive)`);
  console.log(`  🌾 Lands:       ${LANDS.length}`);
  console.log(`  🚜 Tractors:    ${tractorRecords.length}`);
  console.log(`  📅 Attendance:  ~${totalAttendance} records`);
  console.log(`  💰 Expenses:    ${totalExpenses} records`);
  console.log(`  ⛽ Diesel:      ${dieselCount} records`);
  console.log(`  💵 Salaries:    ${salaryCount} records`);
  console.log("═══════════════════════════════════════\n");
  console.log("Login credentials:");
  console.log("  Email:    farmer@farmerp.com");
  console.log("  Password: (any password works in demo mode)");
  console.log("\n🚀 Run: npm run dev");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
