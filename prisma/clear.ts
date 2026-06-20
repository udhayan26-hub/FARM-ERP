import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("[DB] Starting database clear...");

  // Delete from child tables first to avoid foreign key violations
  await prisma.notification.deleteMany();
  console.log("Deleted notifications");

  await prisma.auditLog.deleteMany();
  console.log("Deleted audit logs");

  await prisma.dieselLog.deleteMany();
  console.log("Deleted diesel logs");

  await prisma.attendance.deleteMany();
  console.log("Deleted attendance records");

  await prisma.salaryPayment.deleteMany();
  console.log("Deleted salary payments");

  await prisma.salaryRecord.deleteMany();
  console.log("Deleted salary records");

  await prisma.tractor.deleteMany();
  console.log("Deleted tractors");

  await prisma.expense.deleteMany();
  console.log("Deleted expenses");

  await prisma.land.deleteMany();
  console.log("Deleted lands");

  await prisma.worker.deleteMany();
  console.log("Deleted workers");

  await prisma.user.deleteMany();
  console.log("Deleted users");

  console.log("[DB] Database cleared successfully!");
}

main()
  .catch((e) => {
    console.error("[DB] Error clearing database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
