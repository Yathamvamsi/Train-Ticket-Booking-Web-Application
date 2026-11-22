import { BugReport, ExecutionHistoryEntry } from '../types';

export const INITIAL_BUG_REPORTS: BugReport[] = [
  {
    id: 'BUG-101',
    title: 'Orphan draft booking state retained after simulated payment gateway decline',
    description:
      'When the Payment Simulation fails with a gateway decline, retrying immediately with a new method retains the previous failure flag until page state resets.',
    relatedTestCaseId: 'TC-INT-03',
    moduleName: 'Payment & Booking Integration',
    severity: 'Critical',
    priority: 'P1 - Urgent',
    status: 'Open',
    dateReported: '2026-11-16',
    stepsToReproduce:
      '1. Fill passenger details\n2. Select Credit Card + Simulate Failure\n3. Click Confirm Payment\n4. Switch to UPI and observe retry state.',
  },
  {
    id: 'BUG-102',
    title: 'Cancelled passenger berth label retains prior berth value in legacy summary',
    description:
      'After cancelling a confirmed ticket, the booking status updates to Cancelled, but the berth assignment column in older cached records still displays "Lower".',
    relatedTestCaseId: 'TC-REG-03',
    moduleName: 'PNR & Cancellation',
    severity: 'High',
    priority: 'P2 - High',
    status: 'In Progress',
    dateReported: '2026-11-15',
    stepsToReproduce:
      '1. Open My Bookings\n2. Cancel Confirmed ticket PNR 7510493826\n3. Inspect passenger berth assignment field.',
  },
  {
    id: 'BUG-103',
    title: 'Padded phone number string bypasses maxLength validation on paste',
    description:
      'Pasting a 10-digit mobile number with trailing whitespace fails validation instead of trimming before regex evaluation.',
    relatedTestCaseId: 'TC-BVT-03',
    moduleName: 'Passenger Contact Validation',
    severity: 'Medium',
    priority: 'P3 - Medium',
    status: 'Fixed',
    dateReported: '2026-11-14',
    stepsToReproduce:
      '1. Navigate to Passenger Details\n2. Paste "9876543210 " into Mobile Number\n3. Click Continue to Payment.',
  },
  {
    id: 'BUG-104',
    title: 'Simulated 500 VU payment confirmation p95 latency exceeds 500ms SLA',
    description:
      'Under simulated 500 virtual user peak load, payment confirmation simulated p95 response time spikes to 684ms with 4.6% request timeout rate.',
    relatedTestCaseId: 'TC-PERF-02',
    moduleName: 'Performance Load Simulation',
    severity: 'High',
    priority: 'P2 - High',
    status: 'Open',
    dateReported: '2026-11-17',
    stepsToReproduce:
      '1. Open Performance Testing module\n2. Select 500 Virtual Users\n3. Run simulated load on Payment Confirmation endpoint.',
  },
  {
    id: 'BUG-105',
    title: 'Station swap button does not re-focus destination field for keyboard users',
    description:
      'Clicking the station swap icon swaps source and destination codes cleanly, though keyboard focus stays on the icon button rather than announcing the swap.',
    relatedTestCaseId: 'TC-UI-01',
    moduleName: 'Train Search UI',
    severity: 'Low',
    priority: 'P4 - Low',
    status: 'Retested',
    dateReported: '2026-11-12',
    stepsToReproduce:
      '1. Select NDLS and CSMT\n2. Tab to Swap button and press Enter\n3. Check active element focus.',
  },
  {
    id: 'BUG-106',
    title: 'Sleeper class GST calculation verified at 0% after tax patch',
    description:
      'Previously Sleeper class inadvertently inherited 5% AC GST when switching classes back from 3AC. Fixed and verified in regression cycle.',
    relatedTestCaseId: 'TC-REG-02',
    moduleName: 'Fare Calculation Engine',
    severity: 'Medium',
    priority: 'P2 - High',
    status: 'Closed',
    dateReported: '2026-11-10',
    stepsToReproduce:
      '1. Select 3AC class\n2. Switch back to SL class\n3. Verify GST drops to ₹0.',
  },
];

export const INITIAL_EXECUTION_HISTORY: ExecutionHistoryEntry[] = [
  {
    id: 'HIST-01',
    timestamp: '2026-11-18 10:52',
    action: 'Baseline QA Regression Suite',
    scope: '27 Executed Cases (10 Modules)',
    passedCount: 21,
    failedCount: 4,
    blockedCount: 2,
    summary: 'Identified 4 failures in Integration, Regression, Boundary, and Performance suites.',
  },
  {
    id: 'HIST-02',
    timestamp: '2026-11-17 16:40',
    action: 'Validation & Negative Suite',
    scope: '8 Cases (Validation + Negative)',
    passedCount: 8,
    failedCount: 0,
    blockedCount: 0,
    summary: 'All station, email, phone, PNR, and duplicate cancellation checks passed.',
  },
  {
    id: 'HIST-03',
    timestamp: '2026-11-16 14:15',
    action: 'Unit Test Build Verification',
    scope: '4 Core Helper Functions',
    passedCount: 4,
    failedCount: 0,
    blockedCount: 0,
    summary: 'Fare calculation, PNR generator, and age validation passed unit assertions.',
  },
];
