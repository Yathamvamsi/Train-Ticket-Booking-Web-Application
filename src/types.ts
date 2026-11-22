export type PlatformRoute =
  | 'dashboard'
  | 'test-cases'
  | 'execution'
  | 'bugs'
  | 'reports'
  | 'module-unit'
  | 'module-integration'
  | 'module-functional'
  | 'module-system'
  | 'module-regression'
  | 'module-validation'
  | 'module-negative'
  | 'module-boundary'
  | 'module-performance'
  | 'module-ui'
  | 'aut';

export type TestingCategory =
  | 'Unit Testing'
  | 'Integration Testing'
  | 'Functional Testing'
  | 'System Testing'
  | 'Regression Testing'
  | 'Validation Testing'
  | 'Negative Testing'
  | 'Boundary Value Testing'
  | 'Performance Testing'
  | 'User Interface Testing';

export type TestStatus = 'Passed' | 'Failed' | 'Blocked' | 'Not Executed';

export interface TestCaseRecord {
  id: string;
  category: TestingCategory;
  scenario: string;
  preconditions: string;
  steps: string[];
  input: string;
  expectedResult: string;
  actualResult: string;
  status: TestStatus;
  durationMs?: number;
  lastRunAt?: string;
}

export type BugSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
export type BugPriority = 'P1 - Urgent' | 'P2 - High' | 'P3 - Medium' | 'P4 - Low';
export type BugStatus = 'Open' | 'In Progress' | 'Fixed' | 'Retested' | 'Closed';

export interface BugReport {
  id: string;
  title: string;
  description: string;
  relatedTestCaseId: string;
  moduleName: string;
  severity: BugSeverity;
  priority: BugPriority;
  status: BugStatus;
  dateReported: string;
  stepsToReproduce?: string;
}

export interface ExecutionHistoryEntry {
  id: string;
  timestamp: string;
  action: string;
  scope: string;
  passedCount: number;
  failedCount: number;
  blockedCount: number;
  summary: string;
}

export interface PerformanceSimResult {
  virtualUsers: number;
  endpoint: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgResponseTimeMs: number;
  p95ResponseTimeMs: number;
  minResponseTimeMs: number;
  maxResponseTimeMs: number;
  errorRatePercent: number;
  throughputRps: number;
  runAt: string;
}

// Application Under Test (AUT) Types
export type TrainClassCode = 'SL' | '3AC' | '2AC' | '1AC';

export type TrainType =
  | 'Rajdhani'
  | 'Shatabdi'
  | 'Vande Bharat'
  | 'Superfast'
  | 'Express';

export type AvailabilityStatus = 'AVAILABLE' | 'WL' | 'NOT_AVAILABLE';

export interface ClassAvailability {
  code: TrainClassCode;
  name: string;
  fare: number;
  status: AvailabilityStatus;
  seats: number;
}

export interface Train {
  trainNumber: string;
  trainName: string;
  trainType: TrainType;
  sourceCode: string;
  destinationCode: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  runningDays: string[];
  classes: Record<TrainClassCode, ClassAvailability>;
}

export interface Station {
  code: string;
  name: string;
  city: string;
  state: string;
}

export interface SearchParams {
  from: string;
  to: string;
  date: string;
  travelClass: TrainClassCode | 'ALL';
}

export type Gender = 'Male' | 'Female' | 'Other';

export type BerthPreference =
  | 'No Preference'
  | 'Lower'
  | 'Middle'
  | 'Upper'
  | 'Side Lower'
  | 'Side Upper';

export interface PassengerInput {
  id: string;
  name: string;
  age: string;
  gender: Gender;
  berthPreference: BerthPreference;
}

export interface BookedPassenger {
  name: string;
  age: number;
  gender: Gender;
  berthPreference: BerthPreference;
  coach: string;
  seatNumber: string;
  berthAssigned: string;
  status: 'Confirmed' | 'Waiting List' | 'Cancelled';
}

export type PaymentMethod = 'UPI' | 'Debit Card' | 'Credit Card' | 'Net Banking';

export type BookingStatus = 'Confirmed' | 'Waiting List' | 'Cancelled';

export interface Booking {
  pnr: string;
  transactionId: string;
  trainNumber: string;
  trainName: string;
  trainType: TrainType;
  sourceCode: string;
  sourceName: string;
  destinationCode: string;
  destinationName: string;
  journeyDate: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  travelClass: TrainClassCode;
  passengers: BookedPassenger[];
  contactPhone: string;
  contactEmail: string;
  paymentMethod: PaymentMethod;
  baseFareTotal: number;
  convenienceFee: number;
  gstAmount: number;
  totalAmount: number;
  status: BookingStatus;
  bookedAt: string;
  cancelledAt?: string;
  bookedByEmail?: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  createdAt: string;
}
