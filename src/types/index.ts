// Worker types
export type WorkerStatus = 'active' | 'inactive';
export type AttendanceStatus = 'present' | 'absent' | 'half_day';
export type SalaryStatus = 'pending' | 'paid' | 'partial';
export type TractorStatus = 'active' | 'maintenance' | 'inactive';
export type DieselPurpose = 'ploughing' | 'transport' | 'harvesting' | 'cultivation' | 'irrigation' | 'other';
export type ExpenseCategory = 'diesel' | 'seeds' | 'fertilizers' | 'pesticides' | 'labour' | 'repairs' | 'maintenance' | 'equipment' | 'other';
export type ReportType = 'attendance' | 'salary' | 'diesel' | 'expense' | 'tractor' | 'summary';
export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface User {
  id: string;
  email: string;
  name: string;
  farmName: string;
  phone: string;
  role: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Worker {
  id: string;
  userId: string;
  name: string;
  phone: string;
  village: string;
  dailyWage: number;
  joinDate: Date;
  status: WorkerStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attendance {
  id: string;
  workerId: string;
  date: Date;
  status: AttendanceStatus;
  markedBy: string;
  worker?: Worker;
  createdAt: Date;
}

export interface SalaryRecord {
  id: string;
  workerId: string;
  month: number;
  year: number;
  daysWorked: number;
  halfDays: number;
  dailyWage: number;
  totalAmount: number;
  status: SalaryStatus;
  worker?: Worker;
  payments?: SalaryPayment[];
  createdAt: Date;
}

export interface SalaryPayment {
  id: string;
  salaryRecordId: string;
  amount: number;
  paymentDate: Date;
  notes: string;
  createdAt: Date;
}

export interface Tractor {
  id: string;
  userId: string;
  name: string;
  registrationNo: string;
  model: string;
  driverName: string;
  purchaseDate: Date;
  status: TractorStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface DieselLog {
  id: string;
  tractorId: string;
  date: Date;
  liters: number;
  cost: number;
  hoursWorked: number;
  purpose: DieselPurpose;
  notes?: string;
  tractor?: Tractor;
  createdAt: Date;
}

export interface Expense {
  id: string;
  userId: string;
  date: Date;
  category: ExpenseCategory;
  amount: number;
  description: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Land {
  id: string;
  userId: string;
  name: string;
  acres: number;
  location: string;
  crop: string;
  sowingDate?: Date;
  harvestDate?: Date;
  status: 'active' | 'fallow' | 'harvested';
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  createdAt: Date;
}

// Dashboard types
export interface DashboardStats {
  totalWorkers: number;
  presentToday: number;
  monthlySalaryCost: number;
  monthlyDieselCost: number;
  totalExpenses: number;
  activeTractors: number;
  farmArea: number;
  pendingPayments: number;
}

export interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

// Form input types
export interface WorkerFormInput {
  name: string;
  phone: string;
  village: string;
  dailyWage: number;
  joinDate: string;
  status: WorkerStatus;
}

export interface AttendanceFormInput {
  date: string;
  entries: { workerId: string; status: AttendanceStatus }[];
}

export interface DieselFormInput {
  date: string;
  tractorId: string;
  liters: number;
  cost: number;
  hoursWorked: number;
  purpose: DieselPurpose;
  notes?: string;
}

export interface ExpenseFormInput {
  date: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  notes?: string;
}

export interface TractorFormInput {
  name: string;
  registrationNo: string;
  model: string;
  driverName: string;
  purchaseDate: string;
  status: TractorStatus;
}

export interface LandFormInput {
  name: string;
  acres: number;
  location: string;
  crop: string;
  sowingDate?: string;
  harvestDate?: string;
  status: 'active' | 'fallow' | 'harvested';
}

// Report types
export interface ReportConfig {
  type: ReportType;
  period: ReportPeriod;
  startDate: Date;
  endDate: Date;
  format: 'pdf' | 'excel' | 'print';
}

// Daily entry types
export interface DailyEntryData {
  date: string;
  attendance: { workerId: string; status: AttendanceStatus }[];
  diesel: DieselFormInput[];
  expenses: ExpenseFormInput[];
}

// Table pagination
export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}
