# 🌾 FARM ERP

FARM ERP is an enterprise-grade, mobile-responsive farm management platform built using **Next.js 15 (React 19)**, **TypeScript**, **Tailwind CSS**, and **Prisma ORM**. It enables commercial farms to digitize their operations, control financial leakages, manage staff payroll, track machinery logs, and run consolidated business expense analytics.

---

## 🌟 Key Features

* **Live Analytics Dashboard:** Real-time statistics tracking total active workforce count, cultivated land, diesel consumption, and outstanding wage balances. Includes dynamic charts for expense trends.
* **Attendance-Driven Payroll System:** Automatically calculates wages based on worker rosters and calendars. Includes a payment dialog to input custom wage overrides, deductions, and bonuses.
* **running Advance Loan Ledgers:** Disburse worker advances, log repayments, and view running ledger statements with an interactive Net Offset Calculator.
* **Granular Audit Logs:** Captures all database modifications (create, update, delete, status toggle) with detailed before/after diff views.
* **Consolidated Expense Aggregation:** Aggregates labor payroll, machinery diesel costs, and general operating expenses.
* **Dynamic Report Exporting Engine:** Select month/year, inspect scrollable reports in-browser, and export data as Excel-compatible CSVs or printable PDFs (optimized to bypass browser popup blockers).
* **Machinery & Diesel Loggers:** Logs fuel refills, hours operated, and driver allocations.
* **Land Safeguards (Recycle Bin):** Soft-delete land records with validation checks that prevent deletion if active crops are cultivated or referenced in expenses. Includes a trash bin interface for land restoration.

---

## 🏗️ Architecture

The system utilizes Next.js Server Components for server-side data rendering and Server Actions for secure database modifications (RPC patterns), eliminating REST routing boilerplate.

```
┌───────────────────────────────────────────────────────────┐
│                    Next.js App (Client UI)                │
└─────────────────────────────┬─────────────────────────────┘
                              │ Invoke Server Action (RPC)
                              ▼
┌───────────────────────────────────────────────────────────┐
│              Next.js 15 Server Actions (Backend)          │
│          - Zod Validations  - DB Transactions ($tx)       │
└─────────────────────────────┬─────────────────────────────┘
                              │ Prisma Client ORM
                              ▼
┌───────────────────────────────────────────────────────────┐
│              SQLite (Local) / PostgreSQL (Vercel)         │
└───────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

* **Core Framework:** Next.js 15 (App Router, React 19)
* **Programming Language:** TypeScript
* **Database ORM:** Prisma Client
* **Relational Database:** SQLite (Development) / PostgreSQL (Production)
* **Styling & Components:** Tailwind CSS, Radix UI Primitives, Shadcn UI
* **Charts:** Recharts
* **Form Schema Validation:** React Hook Form, Zod

---

## ⚙️ Configuration & Environment Variables

Create a `.env` file in the root directory:

```env
# Local SQLite Setup
DATABASE_URL="file:./dev.db"

# Production PostgreSQL Setup (e.g. Neon, AWS Aurora)
# DATABASE_URL="postgresql://user:password@hostname:5432/dbname?sslmode=require"
# DIRECT_URL="postgresql://user:password@hostname:5432/dbname?sslmode=require"
```

---

## 📂 Folder Structure

```
├── prisma/
│   ├── schema.prisma      # DB Schema definition
│   └── seed.ts            # Local mock data seed script
├── src/
│   ├── actions/           # Next.js Server Actions (report, payment, workers, lands, etc.)
│   ├── app/               # Next.js App Router Pages
│   │   ├── (auth)/        # Auth route groups
│   │   ├── (dashboard)/   # Main shared layout route groups
│   │   └── globals.css    # Global stylesheet
│   ├── components/        # Shared components, layouts, charts, and form dialogs
│   ├── lib/               # Shared utilities (auth, prisma connection, export tools, validation schemas)
│   └── middleware.ts      # Next.js requests routing filters
```

---

## 🚀 Installation & Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/udhayan26-hub/FARM-ERP.git
   cd FARM-ERP
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Initialize the database & seed mock data:**
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

4. **Launch development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📝 API Reference (Server Actions)

### Worker Actions
* `getWorkers()`: Fetches workers roster with monthly attendance stats and current month earnings.
* `createWorker(data)`: Creates a new worker record with Zod validation.
* `updateWorker(id, data)`: Modifies existing worker records.

### Payment Actions
* `recordPayment(data)`: Records worker wage payouts and updates advance balance sheets atomically via Prisma transactions.
* `getMonthlySalariesData(month, year)`: Compiles worker payroll list for a specified month/year.

### Report Actions
* `getExpenseReportData(month, year)`: Compiles operating expenses, fuel logs, and wages.
* `getWorkerSalarySheetReportData(month, year)`: Returns detailed attendance summary and payouts.
* `getTractorUtilizationReportData(month, year)`: Aggregates hours operated and fuel consumption per tractor.
* `getFarmSummaryReportData(month, year)`: Computes key monthly operational metrics.

---

## ☁️ Deployment Guide (Vercel)

1. Connect your GitHub repository to Vercel.
2. In Project Settings, configure the Environment Variables (`DATABASE_URL`, `DIRECT_URL`).
3. Set the **Build Command** to: `prisma generate && prisma db push && next build`.
4. Deploy. Vercel automatically sets up serverless execution environments for pages and server actions.

---

## 🛡️ License

Distributed under the MIT License. See `LICENSE` for more information.

---

## ✍️ Author Information

Developed with ❤️ for agricultural operations optimization.
* **GitHub:** [@udhayan26-hub](https://github.com/udhayan26-hub)
