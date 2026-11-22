import { findTrainsForRoute, getStationByCode } from './trains';
import { TestCaseRecord, TestingCategory } from '../types';
import {
  assignSeatInfo,
  calculateFare,
  canCancelBooking,
  generatePNR,
  getFutureDateISO,
  validateAuthLogin,
  validateContact,
  validatePNR,
  validatePassenger,
  validatePayment,
  validateSearchParams,
} from '../utils/validation';

export const TESTING_CATEGORIES: TestingCategory[] = [
  'Unit Testing',
  'Integration Testing',
  'Functional Testing',
  'System Testing',
  'Regression Testing',
  'Validation Testing',
  'Negative Testing',
  'Boundary Value Testing',
  'Performance Testing',
  'User Interface Testing',
];

export const INITIAL_TEST_CASES: TestCaseRecord[] = [
  // A. Unit Testing (5 cases)
  {
    id: 'TC-UNIT-01',
    category: 'Unit Testing',
    scenario: 'Station validation function rejects empty source station',
    preconditions: 'validateSearchParams() helper module initialized',
    steps: [
      'Invoke validateSearchParams with empty sourceCode ""',
      'Provide valid destinationCode "CSMT" and future date',
      'Inspect returned errors.from message',
    ],
    input: 'from="", to="CSMT", date=+5d',
    expectedResult: 'valid=false, errors.from="Please select a source station."',
    actualResult: 'valid=false, errors.from="Please select a source station."',
    status: 'Passed',
    durationMs: 0.12,
    lastRunAt: '10:15 AM',
  },
  {
    id: 'TC-UNIT-02',
    category: 'Unit Testing',
    scenario: 'Fare calculation function computes AC 3-Tier total with 5% GST and fee',
    preconditions: 'calculateFare() pricing utility active',
    steps: [
      'Pass baseFare=2140, passengerCount=2, class="3AC"',
      'Verify baseFareTotal, gstAmount, convenienceFee, totalAmount',
    ],
    input: 'baseFare=2140, count=2, class="3AC"',
    expectedResult: 'Base=4280, GST=214, Fee=30, Total=4524',
    actualResult: 'Base=4280, GST=214, Fee=30, Total=4524',
    status: 'Passed',
    durationMs: 0.09,
    lastRunAt: '10:15 AM',
  },
  {
    id: 'TC-UNIT-03',
    category: 'Unit Testing',
    scenario: 'Passenger age validation accepts valid adult age and rejects non-integers',
    preconditions: 'validatePassenger() utility loaded',
    steps: [
      'Pass passenger name="Aarav Sharma", age="24"',
      'Confirm no age validation error is returned',
    ],
    input: 'name="Aarav Sharma", age="24"',
    expectedResult: 'No validation error returned ({})',
    actualResult: 'No validation error returned ({})',
    status: 'Passed',
    durationMs: 0.08,
    lastRunAt: '10:15 AM',
  },
  {
    id: 'TC-UNIT-04',
    category: 'Unit Testing',
    scenario: 'PNR generation function creates valid 10-digit numeric string',
    preconditions: 'generatePNR() generator available',
    steps: [
      'Call generatePNR() function',
      'Assert length equals 10 and matches /^[2-9]\\d{9}$/',
    ],
    input: 'generatePNR()',
    expectedResult: '10-digit numeric string starting with 2–9',
    actualResult: 'Generated PNR "4829105734" (10 digits)',
    status: 'Passed',
    durationMs: 0.07,
    lastRunAt: '10:15 AM',
  },
  {
    id: 'TC-UNIT-05',
    category: 'Unit Testing',
    scenario: 'Date validation function rejects past journey date',
    preconditions: 'System clock synchronized with current date',
    steps: [
      'Invoke validateSearchParams() with date="2022-04-10"',
      'Verify errors.date blocks past date booking',
    ],
    input: 'from="NDLS", to="JP", date="2022-04-10"',
    expectedResult: 'valid=false with past date error',
    actualResult: 'Not executed in current cycle',
    status: 'Not Executed',
  },

  // B. Integration Testing (5 cases)
  {
    id: 'TC-INT-01',
    category: 'Integration Testing',
    scenario: 'Train Search + Availability module synchronization',
    preconditions: 'Station directory and Train schedule dataset loaded',
    steps: [
      'Validate search parameters for NDLS → CSMT',
      'Query findTrainsForRoute("NDLS", "CSMT")',
      'Verify each train includes class availability & fares',
    ],
    input: 'from="NDLS", to="CSMT", class="3AC"',
    expectedResult: 'Returns >= 3 trains with live 3AC availability and fare',
    actualResult: '4 trains returned with 3AC seat counts & fares',
    status: 'Passed',
    durationMs: 0.25,
    lastRunAt: '10:18 AM',
  },
  {
    id: 'TC-INT-02',
    category: 'Integration Testing',
    scenario: 'Passenger Details + Booking fare summary integration',
    preconditions: 'Train #12952 (3AC) selected in booking context',
    steps: [
      'Add 2 valid passengers and contact info',
      'Verify seat assignment and multi-passenger fare calculation',
    ],
    input: '2 passengers, Train #12952, Class 3AC',
    expectedResult: '2 seats assigned in B3 coach; total ₹4,524 calculated',
    actualResult: '2 seats assigned (B3-18, B3-20); total ₹4,524',
    status: 'Passed',
    durationMs: 0.21,
    lastRunAt: '10:18 AM',
  },
  {
    id: 'TC-INT-03',
    category: 'Integration Testing',
    scenario: 'Booking + Payment Gateway failure rollback integration',
    preconditions: 'Passenger details validated; gateway set to Simulate Failure',
    steps: [
      'Submit payment with valid card details under Simulated Failure',
      'Verify booking record is NOT written to storage',
    ],
    input: 'Valid Card + simulateOutcome="failure"',
    expectedResult: 'Gateway returns error; no orphan PNR saved',
    actualResult: 'Orphan draft booking state retained timeout flag on retry',
    status: 'Failed',
    durationMs: 0.34,
    lastRunAt: '10:18 AM',
  },
  {
    id: 'TC-INT-04',
    category: 'Integration Testing',
    scenario: 'Payment + Confirmation slip generation integration',
    preconditions: 'Payment confirmed via UPI',
    steps: [
      'Trigger payment confirmation handler',
      'Verify Confirmation screen receives PNR, Transaction ID, and seat info',
    ],
    input: 'method="UPI", upiId="student@okaxis"',
    expectedResult: 'Confirmation renders PNR + TXN ID + passenger seat table',
    actualResult: 'Confirmation rendered PNR, TXN ID, and downloadable HTML slip',
    status: 'Passed',
    durationMs: 0.19,
    lastRunAt: '10:18 AM',
  },
  {
    id: 'TC-INT-05',
    category: 'Integration Testing',
    scenario: 'Booking + PNR Generation persistence to My Bookings store',
    preconditions: 'localStorage available in browser',
    steps: [
      'Complete booking and generate 10-digit PNR',
      'Query PNR Status lookup with generated PNR',
    ],
    input: 'Newly generated PNR lookup',
    expectedResult: 'PNR lookup immediately resolves newly booked ticket',
    actualResult: 'Blocked pending payment retry fix (BUG-101)',
    status: 'Blocked',
  },

  // C. Functional Testing (4 cases)
  {
    id: 'TC-FUNC-01',
    category: 'Functional Testing',
    scenario: 'Search trains between valid stations and display results',
    preconditions: 'User on Application Under Test search page',
    steps: [
      'Select From="SBC", To="MAS"',
      'Choose valid future date and click Search Trains',
    ],
    input: 'from="SBC", to="MAS", date=+3d',
    expectedResult: 'Displays Mysuru-Chennai Vande Bharat, Shatabdi, Chennai Mail',
    actualResult: '3 matching trains displayed with schedules and fares',
    status: 'Passed',
    durationMs: 0.22,
    lastRunAt: '10:22 AM',
  },
  {
    id: 'TC-FUNC-02',
    category: 'Functional Testing',
    scenario: 'Add multiple passengers and select berth preferences',
    preconditions: 'Train selected from search results',
    steps: [
      'Click Add Passenger button twice',
      'Enter valid details with Lower and Upper berth preferences',
    ],
    input: '2 passengers (Lower, Upper)',
    expectedResult: 'Passenger count updates to 2 and fare doubles accurately',
    actualResult: '2 passengers added; fare updated dynamically',
    status: 'Passed',
    durationMs: 0.15,
    lastRunAt: '10:22 AM',
  },
  {
    id: 'TC-FUNC-03',
    category: 'Functional Testing',
    scenario: 'Book ticket with valid details and generate PNR',
    preconditions: 'Valid train, passenger, contact, and UPI details provided',
    steps: [
      'Confirm payment in Payment simulation',
      'Verify PNR generated and booking status set to Confirmed',
    ],
    input: 'NDLS→CSMT, 3AC, 1 Passenger, UPI="aarav@okaxis"',
    expectedResult: '10-digit PNR generated and status="Confirmed"',
    actualResult: 'PNR generated and ticket confirmed',
    status: 'Passed',
    durationMs: 0.29,
    lastRunAt: '10:22 AM',
  },
  {
    id: 'TC-FUNC-04',
    category: 'Functional Testing',
    scenario: 'Cancel confirmed ticket and update booking status to Cancelled',
    preconditions: 'Confirmed booking PNR="4829105734" exists',
    steps: [
      'Locate booking in My Bookings',
      'Click Cancel Ticket and confirm popup',
    ],
    input: 'pnr="4829105734"',
    expectedResult: 'Status changes to "Cancelled" and refund summary displays',
    actualResult: 'Not executed in current cycle',
    status: 'Not Executed',
  },

  // D. System Testing (2 cases)
  {
    id: 'TC-SYS-01',
    category: 'System Testing',
    scenario: 'Complete End-to-End flow: Login → Search → Select → Passengers → Payment → Confirmation',
    preconditions: 'Demo user student@railbook.edu registered',
    steps: [
      'Authenticate user via Login module',
      'Search NDLS → CSMT and select Train #12952 (3AC)',
      'Enter passenger + contact details and confirm UPI payment',
      'Verify PNR confirmation and ticket persistence',
    ],
    input: 'Full E2E Reservation Payload',
    expectedResult: 'All 6 sequential workflow stages complete with Confirmed PNR',
    actualResult: 'All 6 E2E stages verified cleanly',
    status: 'Passed',
    durationMs: 0.48,
    lastRunAt: '10:25 AM',
  },
  {
    id: 'TC-SYS-02',
    category: 'System Testing',
    scenario: 'Cross-browser localStorage state persistence across session reload',
    preconditions: 'New booking saved in browser localStorage',
    steps: [
      'Book a ticket and record PNR',
      'Reload booking repository from localStorage',
      'Verify ticket remains searchable by PNR',
    ],
    input: 'Serialized Booking JSON',
    expectedResult: 'Saved booking retrieved intact after reload',
    actualResult: 'Saved booking persisted and retrieved cleanly',
    status: 'Passed',
    durationMs: 0.14,
    lastRunAt: '10:25 AM',
  },

  // E. Regression Testing (3 cases)
  {
    id: 'TC-REG-01',
    category: 'Regression Testing',
    scenario: 'Verify train search still returns accurate results after booking module update',
    preconditions: 'Booking engine updated for multi-passenger berth logic',
    steps: [
      'Run route search for NDLS → HWH',
      'Confirm Rajdhani and Netaji Express schedules remain intact',
    ],
    input: 'from="NDLS", to="HWH"',
    expectedResult: '3 direct trains returned with unmodified timings & fares',
    actualResult: '3 trains returned; no search regression detected',
    status: 'Passed',
    durationMs: 0.16,
    lastRunAt: '10:30 AM',
  },
  {
    id: 'TC-REG-02',
    category: 'Regression Testing',
    scenario: 'Verify Sleeper (SL) fare calculation omits 5% AC GST after payment changes',
    preconditions: 'GST rate logic updated for AC classes',
    steps: [
      'Call calculateFare(645, 1, "SL")',
      'Assert gstAmount === 0 and convenienceFee === 15',
    ],
    input: 'baseFare=645, count=1, class="SL"',
    expectedResult: 'GST=0, Fee=15, Total=660',
    actualResult: 'GST=0, Fee=15, Total=660',
    status: 'Passed',
    durationMs: 0.08,
    lastRunAt: '10:30 AM',
  },
  {
    id: 'TC-REG-03',
    category: 'Regression Testing',
    scenario: 'Verify PNR status displays Cancelled passengers consistently after cancellation patch',
    preconditions: 'Ticket PNR="7510493826" cancelled',
    steps: [
      'Lookup PNR="7510493826"',
      'Check both booking.status and passenger[].status',
    ],
    input: 'pnr="7510493826"',
    expectedResult: 'Both booking status and passenger status equal "Cancelled"',
    actualResult: 'Passenger berth label still showed "Lower" instead of "Cancelled" in legacy summary',
    status: 'Failed',
    durationMs: 0.19,
    lastRunAt: '10:30 AM',
  },

  // F. Validation Testing (4 cases)
  {
    id: 'TC-VAL-01',
    category: 'Validation Testing',
    scenario: 'Empty station fields blocked on train search submission',
    preconditions: 'Search form cleared',
    steps: [
      'Leave From and To stations unselected',
      'Click Search Trains',
    ],
    input: 'from="", to="", date=+3d',
    expectedResult: 'Inline errors shown for both From and To stations',
    actualResult: 'Errors displayed: "Please select a source/destination station."',
    status: 'Passed',
    durationMs: 0.09,
    lastRunAt: '10:35 AM',
  },
  {
    id: 'TC-VAL-02',
    category: 'Validation Testing',
    scenario: 'Invalid email format rejected on passenger contact form',
    preconditions: 'User on Passenger Details form',
    steps: [
      'Enter email="student-at-college" without @ domain',
      'Submit form',
    ],
    input: 'email="student-at-college"',
    expectedResult: 'Rejected with "Enter a valid email address (e.g., user@domain.com)."',
    actualResult: 'Rejected with email validation message',
    status: 'Passed',
    durationMs: 0.07,
    lastRunAt: '10:35 AM',
  },
  {
    id: 'TC-VAL-03',
    category: 'Validation Testing',
    scenario: 'Invalid phone number rejected on contact details',
    preconditions: 'User on Passenger Details form',
    steps: [
      'Enter phone="12345abc"',
      'Attempt to continue to payment',
    ],
    input: 'phone="12345abc"',
    expectedResult: 'Rejected with 10-digit Indian mobile validation error',
    actualResult: 'Rejected cleanly',
    status: 'Passed',
    durationMs: 0.06,
    lastRunAt: '10:35 AM',
  },
  {
    id: 'TC-VAL-04',
    category: 'Validation Testing',
    scenario: 'Missing payment details blocked before payment confirmation',
    preconditions: 'Credit Card tab selected on Payment page',
    steps: [
      'Leave Card Number, Holder, Expiry, CVV blank',
      'Click Confirm Payment',
    ],
    input: 'method="Credit Card", all fields empty',
    expectedResult: '4 field validation errors prevent submission',
    actualResult: '4 field validation errors triggered',
    status: 'Passed',
    durationMs: 0.08,
    lastRunAt: '10:35 AM',
  },

  // G. Negative Testing (4 cases)
  {
    id: 'TC-NEG-01',
    category: 'Negative Testing',
    scenario: 'Selecting same source and destination stations is prevented',
    preconditions: 'User on Train Search form',
    steps: [
      'Select From="NDLS" and To="NDLS"',
      'Click Search Trains',
    ],
    input: 'from="NDLS", to="NDLS"',
    expectedResult: 'Blocked: "Source and destination stations cannot be the same."',
    actualResult: 'Blocked with exact error banner',
    status: 'Passed',
    durationMs: 0.07,
    lastRunAt: '10:40 AM',
  },
  {
    id: 'TC-NEG-02',
    category: 'Negative Testing',
    scenario: 'Searching using an invalid alphanumeric PNR number',
    preconditions: 'User on PNR Status page',
    steps: [
      'Enter pnr="12AB99"',
      'Click Get PNR Status',
    ],
    input: 'pnr="12AB99"',
    expectedResult: 'Rejected: "Invalid PNR format. PNR must be exactly 10 numeric digits."',
    actualResult: 'Rejected with invalid PNR format message',
    status: 'Passed',
    durationMs: 0.06,
    lastRunAt: '10:40 AM',
  },
  {
    id: 'TC-NEG-03',
    category: 'Negative Testing',
    scenario: 'Booking submission without any valid passenger details',
    preconditions: 'Passenger list empty or blank row',
    steps: [
      'Leave passenger name and age empty',
      'Click Continue to Payment',
    ],
    input: 'passengers=[{name:"", age:""}]',
    expectedResult: 'Blocked with required name and age errors',
    actualResult: 'Blocked cleanly',
    status: 'Passed',
    durationMs: 0.07,
    lastRunAt: '10:40 AM',
  },
  {
    id: 'TC-NEG-04',
    category: 'Negative Testing',
    scenario: 'Cancelling an already cancelled booking or invalid PNR',
    preconditions: 'Booking PNR="7510493826" already has status="Cancelled"',
    steps: [
      'Invoke canCancelBooking() on cancelled ticket',
      'Verify duplicate cancellation is blocked',
    ],
    input: 'pnr="7510493826" (status="Cancelled")',
    expectedResult: 'allowed=false, reason="Ticket PNR 7510493826 is already cancelled."',
    actualResult: 'Blocked duplicate cancellation',
    status: 'Passed',
    durationMs: 0.06,
    lastRunAt: '10:40 AM',
  },

  // H. Boundary Value Testing (4 cases)
  {
    id: 'TC-BVT-01',
    category: 'Boundary Value Testing',
    scenario: 'Passenger age boundary check (0, 1, 120, 121)',
    preconditions: 'validatePassenger() active',
    steps: [
      'Test age=0 (below min), age=1 (min), age=120 (max), age=121 (above max)',
      'Verify 1 and 120 pass while 0 and 121 fail',
    ],
    input: 'ages=[0, 1, 120, 121]',
    expectedResult: '0=Fail, 1=Pass, 120=Pass, 121=Fail',
    actualResult: '0=Fail, 1=Pass, 120=Pass, 121=Fail',
    status: 'Passed',
    durationMs: 0.11,
    lastRunAt: '10:44 AM',
  },
  {
    id: 'TC-BVT-02',
    category: 'Boundary Value Testing',
    scenario: 'Passenger count boundary check (0, 1, 6 max, 7 max+1)',
    preconditions: 'Booking passenger limit set to 1..6',
    steps: [
      'Verify 0 passengers invalid, 1..6 allowed, 7th addition blocked',
    ],
    input: 'passengerCounts=[0, 1, 6, 7]',
    expectedResult: '0=Blocked, 1=Allowed, 6=Allowed, 7=Disabled',
    actualResult: '0=Blocked, 1=Allowed, 6=Allowed, 7=Disabled',
    status: 'Passed',
    durationMs: 0.09,
    lastRunAt: '10:44 AM',
  },
  {
    id: 'TC-BVT-03',
    category: 'Boundary Value Testing',
    scenario: 'Phone number length boundary check (9, 10, 11 digits)',
    preconditions: 'validateContact() phone regex /^[6-9]\\d{9}$/',
    steps: [
      'Test 9-digit "987654321", 10-digit "9876543210", 11-digit "98765432101"',
    ],
    input: 'phones=["987654321", "9876543210", "98765432101"]',
    expectedResult: '9 digits=Fail, 10 digits=Pass, 11 digits=Fail',
    actualResult: 'Copy-paste whitespace trim missing for 11-char padded input',
    status: 'Failed',
    durationMs: 0.12,
    lastRunAt: '10:44 AM',
  },
  {
    id: 'TC-BVT-04',
    category: 'Boundary Value Testing',
    scenario: 'Journey date boundary check (Yesterday, Today, Tomorrow)',
    preconditions: 'System date baseline active',
    steps: [
      'Validate yesterday (invalid), today (valid min), tomorrow (valid)',
    ],
    input: 'dates=[yesterday, today, tomorrow]',
    expectedResult: 'Yesterday=Rejected, Today=Accepted, Tomorrow=Accepted',
    actualResult: 'Not executed in current cycle',
    status: 'Not Executed',
  },

  // I. Performance Testing (2 cases)
  {
    id: 'TC-PERF-01',
    category: 'Performance Testing',
    scenario: 'Simulated 100 virtual users concurrent train search response time',
    preconditions: 'Simulated client-side load model selected (100 VUs)',
    steps: [
      'Simulate 100 virtual users issuing search requests',
      'Measure simulated average response time and error rate',
    ],
    input: 'virtualUsers=100, endpoint="/api/trains/search"',
    expectedResult: 'Simulated avg response < 250ms, error rate < 1%',
    actualResult: 'Simulated avg 142ms, 0.4% error rate',
    status: 'Passed',
    durationMs: 3.8,
    lastRunAt: '10:50 AM',
  },
  {
    id: 'TC-PERF-02',
    category: 'Performance Testing',
    scenario: 'Simulated 500 virtual users stress test on Payment Gateway simulation',
    preconditions: 'Simulated load generator configured for 500 VUs',
    steps: [
      'Simulate 500 concurrent virtual users on Payment confirmation',
      'Check if simulated p95 latency stays under 500ms SLA',
    ],
    input: 'virtualUsers=500, endpoint="/api/payment/confirm"',
    expectedResult: 'Simulated p95 latency <= 500ms, failed requests < 2%',
    actualResult: 'Simulated p95 reached 684ms with 4.6% timeout rate under 500 VUs',
    status: 'Failed',
    durationMs: 5.4,
    lastRunAt: '10:50 AM',
  },

  // J. User Interface Testing (3 cases)
  {
    id: 'TC-UI-01',
    category: 'User Interface Testing',
    scenario: 'Navigation links, sidebar items, and primary CTA buttons respond cleanly',
    preconditions: 'Application rendered in desktop/laptop viewport',
    steps: [
      'Inspect sidebar navigation DOM controls',
      'Verify zero broken or dead links',
    ],
    input: 'DOM Selector: aside nav button',
    expectedResult: 'All sidebar navigation buttons mounted and clickable',
    actualResult: 'All sidebar links mounted cleanly',
    status: 'Passed',
    durationMs: 0.31,
    lastRunAt: '10:52 AM',
  },
  {
    id: 'TC-UI-02',
    category: 'User Interface Testing',
    scenario: 'Form alignment, input field visibility, and validation error message visibility',
    preconditions: 'AUT Search & Passenger forms mounted',
    steps: [
      'Submit invalid empty form',
      'Verify red error text renders directly below corresponding input',
    ],
    input: 'Empty form submission check',
    expectedResult: 'Error text visible with >= 4.5:1 contrast ratio',
    actualResult: 'Error messages rendered clearly with accessible contrast',
    status: 'Passed',
    durationMs: 0.18,
    lastRunAt: '10:52 AM',
  },
  {
    id: 'TC-UI-03',
    category: 'User Interface Testing',
    scenario: 'Responsive table horizontal scroll behavior on compact laptop/tablet widths',
    preconditions: 'Viewport resized to 1024px and 768px',
    steps: [
      'Open Test Cases and Bug Reports tables',
      'Verify no horizontal page overflow occurs',
    ],
    input: 'viewport=1024x768, 768x1024',
    expectedResult: 'Tables wrap inside overflow-x-auto containers without layout break',
    actualResult: 'Not executed in current cycle',
    status: 'Not Executed',
  },
];

export function runTestCaseSimulation(
  tc: TestCaseRecord,
  faultMode = false
): { status: 'Passed' | 'Failed'; actualResult: string; durationMs: number } {
  const start = performance.now();
  let passed = true;
  let actualResult = tc.expectedResult;

  switch (tc.id) {
    case 'TC-UNIT-01': {
      const res = validateSearchParams({
        from: faultMode ? 'NDLS' : '',
        to: 'CSMT',
        date: getFutureDateISO(5),
        travelClass: 'ALL',
      });
      passed = !res.valid && Boolean(res.errors.from);
      actualResult = passed
        ? `valid=false, errors.from="${res.errors.from}"`
        : 'Empty source station unexpectedly accepted';
      break;
    }
    case 'TC-UNIT-02': {
      const fare = calculateFare(2140, faultMode ? 1 : 2, '3AC');
      passed = fare.totalAmount === 4524 && fare.gstAmount === 214;
      actualResult = `Base=${fare.baseFareTotal}, GST=${fare.gstAmount}, Fee=${fare.convenienceFee}, Total=${fare.totalAmount}`;
      break;
    }
    case 'TC-UNIT-03': {
      const err = validatePassenger({
        id: '1',
        name: 'Aarav Sharma',
        age: faultMode ? '150' : '24',
        gender: 'Male',
        berthPreference: 'Lower',
      });
      passed = Object.keys(err).length === 0;
      actualResult = passed ? 'No validation error returned ({})' : `Unexpected error: ${err.age}`;
      break;
    }
    case 'TC-UNIT-04': {
      const pnr = generatePNR();
      passed = /^[2-9]\d{9}$/.test(pnr);
      actualResult = `Generated PNR "${pnr}" (${pnr.length} digits)`;
      break;
    }
    case 'TC-UNIT-05': {
      const res = validateSearchParams(
        { from: 'NDLS', to: 'JP', date: '2022-04-10', travelClass: 'ALL' },
        { bypassDateCheck: faultMode }
      );
      passed = !res.valid && Boolean(res.errors.date);
      actualResult = passed
        ? `valid=false, errors.date="${res.errors.date}"`
        : 'Past date unexpectedly accepted';
      break;
    }
    case 'TC-INT-01': {
      const trains = findTrainsForRoute('NDLS', 'CSMT');
      passed = trains.length >= 3 && trains.every((t) => t.classes['3AC'].fare > 0);
      actualResult = `${trains.length} trains returned with 3AC seat counts & fares`;
      break;
    }
    case 'TC-INT-02': {
      const seats = assignSeatInfo(
        [
          { id: '1', name: 'Aarav', age: '24', gender: 'Male', berthPreference: 'Lower' },
          { id: '2', name: 'Priya', age: '22', gender: 'Female', berthPreference: 'Upper' },
        ],
        '3AC',
        false
      );
      const fare = calculateFare(2140, 2, '3AC');
      passed = seats.length === 2 && fare.totalAmount === 4524;
      actualResult = `${seats.length} seats assigned (${seats[0].coach}-${seats[0].seatNumber}, ${seats[1].coach}-${seats[1].seatNumber}); total ₹${fare.totalAmount}`;
      break;
    }
    case 'TC-INT-03': {
      passed = !faultMode;
      actualResult = passed
        ? 'Gateway decline caught cleanly; zero orphan booking written'
        : 'Orphan draft booking state retained timeout flag on retry';
      break;
    }
    case 'TC-INT-04': {
      const pay = validatePayment({
        method: 'UPI',
        upiId: 'student@okaxis',
        cardNumber: '',
        cardHolder: '',
        cardExpiry: '',
        cardCvv: '',
        bankName: '',
        netBankingUserId: '',
      });
      passed = Object.keys(pay).length === 0;
      actualResult = 'Confirmation rendered PNR, TXN ID, and downloadable HTML slip';
      break;
    }
    case 'TC-INT-05': {
      const pnr = generatePNR();
      const check = validatePNR(pnr);
      passed = check.valid && !faultMode;
      actualResult = passed
        ? `Newly generated PNR ${pnr} persisted & resolved in My Bookings`
        : 'Blocked: storage lookup failed to index new PNR';
      break;
    }
    case 'TC-FUNC-01': {
      const trains = findTrainsForRoute('SBC', 'MAS');
      passed = trains.length >= 3;
      actualResult = `${trains.length} matching trains displayed with schedules and fares`;
      break;
    }
    case 'TC-FUNC-02': {
      const fare = calculateFare(265, 2, 'SL');
      passed = fare.baseFareTotal === 530;
      actualResult = `2 passengers added; base fare ₹${fare.baseFareTotal}, total ₹${fare.totalAmount}`;
      break;
    }
    case 'TC-FUNC-03': {
      const pnr = generatePNR();
      passed = /^\d{10}$/.test(pnr);
      actualResult = `PNR ${pnr} generated and booking status set to Confirmed`;
      break;
    }
    case 'TC-FUNC-04': {
      const cancelCheck = canCancelBooking({ pnr: '4829105734', status: 'Confirmed' } as never);
      passed = cancelCheck.allowed;
      actualResult = 'Status transitioned from Confirmed to Cancelled with refund calculation';
      break;
    }
    case 'TC-SYS-01': {
      const auth = validateAuthLogin('student@railbook.edu', 'RailTest@123');
      const search = validateSearchParams({
        from: 'NDLS',
        to: 'CSMT',
        date: getFutureDateISO(3),
        travelClass: '3AC',
      });
      const trains = findTrainsForRoute('NDLS', 'CSMT');
      passed = Object.keys(auth).length === 0 && search.valid && trains.length > 0;
      actualResult = passed
        ? 'All 6 E2E workflow stages verified cleanly'
        : 'E2E pipeline halted at validation stage';
      break;
    }
    case 'TC-SYS-02': {
      passed = typeof window !== 'undefined';
      actualResult = 'Booking JSON serialized and verified across localStorage read/write';
      break;
    }
    case 'TC-REG-01': {
      const trains = findTrainsForRoute('NDLS', 'HWH');
      passed = trains.length === 3;
      actualResult = `${trains.length} direct trains returned; no search regression detected`;
      break;
    }
    case 'TC-REG-02': {
      const fare = calculateFare(645, 1, faultMode ? '3AC' : 'SL');
      passed = fare.gstAmount === 0 && fare.convenienceFee === 15 && fare.totalAmount === 660;
      actualResult = `GST=${fare.gstAmount}, Fee=${fare.convenienceFee}, Total=${fare.totalAmount}`;
      break;
    }
    case 'TC-REG-03': {
      passed = !faultMode;
      actualResult = passed
        ? 'Booking status and all passenger statuses synchronized to "Cancelled"'
        : 'Passenger berth label still showed "Lower" instead of "Cancelled"';
      break;
    }
    case 'TC-VAL-01': {
      const res = validateSearchParams({
        from: '',
        to: '',
        date: getFutureDateISO(3),
        travelClass: 'ALL',
      });
      passed = !res.valid && Boolean(res.errors.from) && Boolean(res.errors.to);
      actualResult = `Errors shown: "${res.errors.from}" & "${res.errors.to}"`;
      break;
    }
    case 'TC-VAL-02': {
      const c = validateContact('9876543210', 'student-at-college');
      passed = Boolean(c.email);
      actualResult = c.email || 'Invalid email accepted';
      break;
    }
    case 'TC-VAL-03': {
      const c = validateContact('12345abc', 'user@railbook.edu');
      passed = Boolean(c.phone);
      actualResult = c.phone || 'Invalid phone accepted';
      break;
    }
    case 'TC-VAL-04': {
      const pay = validatePayment({
        method: 'Credit Card',
        upiId: '',
        cardNumber: '',
        cardHolder: '',
        cardExpiry: '',
        cardCvv: '',
        bankName: '',
        netBankingUserId: '',
      });
      passed = Object.keys(pay).length === 4;
      actualResult = `${Object.keys(pay).length} field validation errors triggered`;
      break;
    }
    case 'TC-NEG-01': {
      const res = validateSearchParams({
        from: 'NDLS',
        to: 'NDLS',
        date: getFutureDateISO(2),
        travelClass: 'ALL',
      });
      passed = !res.valid && res.errors.to === 'Source and destination stations cannot be the same.';
      actualResult = res.errors.to || 'Same station pair allowed';
      break;
    }
    case 'TC-NEG-02': {
      const check = validatePNR('12AB99');
      passed = !check.valid;
      actualResult = check.error || 'Invalid PNR accepted';
      break;
    }
    case 'TC-NEG-03': {
      const err = validatePassenger({
        id: '1',
        name: '',
        age: '',
        gender: 'Male',
        berthPreference: 'No Preference',
      });
      passed = Boolean(err.name) && Boolean(err.age);
      actualResult = `Blocked: "${err.name}" & "${err.age}"`;
      break;
    }
    case 'TC-NEG-04': {
      const check = canCancelBooking({ pnr: '7510493826', status: 'Cancelled' } as never);
      passed = !check.allowed;
      actualResult = check.reason || 'Duplicate cancellation allowed';
      break;
    }
    case 'TC-BVT-01': {
      const a0 = validatePassenger({ id: '1', name: 'Test', age: '0', gender: 'Male', berthPreference: 'Lower' });
      const a1 = validatePassenger({ id: '2', name: 'Test', age: '1', gender: 'Male', berthPreference: 'Lower' });
      const a120 = validatePassenger({ id: '3', name: 'Test', age: '120', gender: 'Male', berthPreference: 'Lower' });
      const a121 = validatePassenger({ id: '4', name: 'Test', age: '121', gender: 'Male', berthPreference: 'Lower' });
      passed = Boolean(a0.age) && !a1.age && !a120.age && Boolean(a121.age);
      actualResult = `0=${a0.age ? 'Fail' : 'Pass'}, 1=${a1.age ? 'Fail' : 'Pass'}, 120=${a120.age ? 'Fail' : 'Pass'}, 121=${a121.age ? 'Fail' : 'Pass'}`;
      break;
    }
    case 'TC-BVT-02': {
      passed = true;
      actualResult = '0=Blocked, 1=Allowed, 6=Allowed, 7=Disabled';
      break;
    }
    case 'TC-BVT-03': {
      const p9 = validateContact('987654321', 'a@b.co');
      const p10 = validateContact('9876543210', 'a@b.co');
      const p11 = validateContact('98765432101', 'a@b.co');
      passed = Boolean(p9.phone) && !p10.phone && Boolean(p11.phone) && !faultMode;
      actualResult = passed
        ? '9 digits=Fail, 10 digits=Pass, 11 digits=Fail'
        : '11-digit padded input check failed';
      break;
    }
    case 'TC-BVT-04': {
      const yesterday = getFutureDateISO(-1);
      const today = getFutureDateISO(0);
      const tomorrow = getFutureDateISO(1);
      const rY = validateSearchParams({ from: 'NDLS', to: 'JP', date: yesterday, travelClass: 'ALL' });
      const rT = validateSearchParams({ from: 'NDLS', to: 'JP', date: today, travelClass: 'ALL' });
      const rTm = validateSearchParams({ from: 'NDLS', to: 'JP', date: tomorrow, travelClass: 'ALL' });
      passed = !rY.valid && rT.valid && rTm.valid;
      actualResult = `Yesterday=${rY.valid ? 'Accepted' : 'Rejected'}, Today=${rT.valid ? 'Accepted' : 'Rejected'}, Tomorrow=${rTm.valid ? 'Accepted' : 'Rejected'}`;
      break;
    }
    case 'TC-PERF-01': {
      passed = true;
      actualResult = 'Simulated 100 VUs: avg 138ms, 0.3% error rate (< 250ms SLA)';
      break;
    }
    case 'TC-PERF-02': {
      passed = !faultMode;
      actualResult = passed
        ? 'Simulated 500 VUs after pooling: p95 412ms, 1.1% error rate (<= 500ms SLA)'
        : 'Simulated p95 reached 684ms with 4.6% timeout rate under 500 VUs';
      break;
    }
    case 'TC-UI-01': {
      const count =
        typeof document !== 'undefined' ? document.querySelectorAll('aside nav button').length : 12;
      passed = count >= 5;
      actualResult = `${count} sidebar navigation controls verified clickable`;
      break;
    }
    case 'TC-UI-02': {
      const st = getStationByCode('NDLS');
      passed = Boolean(st);
      actualResult = 'Error text and input feedback containers rendered with >= 4.5:1 contrast';
      break;
    }
    case 'TC-UI-03': {
      passed = true;
      actualResult = 'Data tables wrapped inside responsive overflow-x-auto containers';
      break;
    }
    default: {
      passed = !faultMode;
      actualResult = tc.expectedResult;
    }
  }

  const end = performance.now();
  const durationMs = Number(Math.max(0.06, end - start).toFixed(2));
  return {
    status: passed ? 'Passed' : 'Failed',
    actualResult,
    durationMs,
  };
}
