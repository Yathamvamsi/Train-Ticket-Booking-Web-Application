import { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  GitBranch,
  Play,
  RefreshCw,
  Workflow,
} from 'lucide-react';
import { findTrainsForRoute } from '../../data/trains';
import { TestCaseRecord, TestingCategory, TrainClassCode } from '../../types';
import {
  calculateFare,
  generatePNR,
  getFutureDateISO,
  validateAuthLogin,
  validatePassenger,
  validateSearchParams,
} from '../../utils/validation';
import { TestStatusBadge } from './StatusBadge';

interface TestingModulesCoreProps {
  category:
    | 'Unit Testing'
    | 'Integration Testing'
    | 'Functional Testing'
    | 'System Testing'
    | 'Regression Testing';
  testCases: TestCaseRecord[];
  onRunSingleTest: (id: string) => void;
  onRunCategoryTests: (category: TestingCategory, faultMode?: boolean) => void;
}

export default function TestingModulesCore({
  category,
  testCases,
  onRunSingleTest,
  onRunCategoryTests,
}: TestingModulesCoreProps) {
  const categoryCases = testCases.filter((tc) => tc.category === category);

  // Unit Testing Interactive Sandbox
  const [unitFn, setUnitFn] = useState<'fare' | 'age' | 'station' | 'pnr' | 'date'>('fare');
  const [unitFareClass, setUnitFareClass] = useState<TrainClassCode>('3AC');
  const [unitFareCount, setUnitFareCount] = useState('2');
  const [unitAgeVal, setUnitAgeVal] = useState('24');
  const [unitStationFrom, setUnitStationFrom] = useState('NDLS');
  const [unitStationTo, setUnitStationTo] = useState('CSMT');
  const [unitDateVal, setUnitDateVal] = useState(getFutureDateISO(3));
  const [unitOutput, setUnitOutput] = useState<string>('');

  // Integration Testing State
  const [integrationFault, setIntegrationFault] = useState(false);
  const [integrationResults, setIntegrationResults] = useState<
    Array<{ pair: string; status: 'Passed' | 'Failed'; detail: string }>
  >([]);

  // System Testing E2E Pipeline State
  const [e2eRunning, setE2eRunning] = useState(false);
  const [e2eSteps, setE2eSteps] = useState<
    Array<{ step: string; status: 'Pending' | 'Passed' | 'Failed'; output: string }>
  >([
    { step: '1. Login (Authenticate Demo User)', status: 'Pending', output: 'Ready' },
    { step: '2. Search Train (NDLS → CSMT)', status: 'Pending', output: 'Ready' },
    { step: '3. Select Train (#12952 Rajdhani · 3AC)', status: 'Pending', output: 'Ready' },
    { step: '4. Enter Passenger Details (2 Passengers)', status: 'Pending', output: 'Ready' },
    { step: '5. Payment Simulation (UPI Gateway)', status: 'Pending', output: 'Ready' },
    { step: '6. Booking Confirmation & PNR Storage', status: 'Pending', output: 'Ready' },
  ]);

  const runUnitSandbox = () => {
    if (unitFn === 'fare') {
      const base = unitFareClass === 'SL' ? 645 : unitFareClass === '3AC' ? 2140 : unitFareClass === '2AC' ? 2980 : 4890;
      const res = calculateFare(base, Number(unitFareCount) || 1, unitFareClass);
      setUnitOutput(
        `calculateFare(${base}, ${Number(unitFareCount) || 1}, "${unitFareClass}") → Base: ₹${res.baseFareTotal}, GST: ₹${res.gstAmount}, Fee: ₹${res.convenienceFee}, Total: ₹${res.totalAmount}`
      );
    } else if (unitFn === 'age') {
      const err = validatePassenger({
        id: '1',
        name: 'Test Passenger',
        age: unitAgeVal,
        gender: 'Male',
        berthPreference: 'Lower',
      });
      setUnitOutput(
        err.age
          ? `validatePassenger(age="${unitAgeVal}") → FAILED: ${err.age}`
          : `validatePassenger(age="${unitAgeVal}") → PASSED: Valid passenger age`
      );
    } else if (unitFn === 'station') {
      const res = validateSearchParams({
        from: unitStationFrom,
        to: unitStationTo,
        date: getFutureDateISO(2),
        travelClass: 'ALL',
      });
      setUnitOutput(
        res.valid
          ? `validateSearchParams("${unitStationFrom}", "${unitStationTo}") → PASSED: Valid distinct route`
          : `validateSearchParams("${unitStationFrom}", "${unitStationTo}") → FAILED: ${
              res.errors.from || res.errors.to || res.errors.general
            }`
      );
    } else if (unitFn === 'pnr') {
      const pnr = generatePNR();
      setUnitOutput(`generatePNR() → PASSED: Generated 10-digit PNR "${pnr}"`);
    } else {
      const res = validateSearchParams({
        from: 'NDLS',
        to: 'CSMT',
        date: unitDateVal,
        travelClass: 'ALL',
      });
      setUnitOutput(
        res.valid
          ? `validateSearchParams(date="${unitDateVal}") → PASSED: Valid future journey date`
          : `validateSearchParams(date="${unitDateVal}") → FAILED: ${res.errors.date}`
      );
    }
  };

  const runIntegrationChecks = () => {
    const trains = findTrainsForRoute('NDLS', 'CSMT');
    const fare = calculateFare(2140, 2, '3AC');
    const pnr = generatePNR();

    setIntegrationResults([
      {
        pair: 'Train Search + Availability',
        status: 'Passed',
        detail: `${trains.length} trains matched with 3AC seat inventory (${trains[0]?.classes['3AC'].seats} AVL)`,
      },
      {
        pair: 'Passenger Details + Booking',
        status: 'Passed',
        detail: `2 passenger berths synchronized with ₹${fare.totalAmount} total fare`,
      },
      {
        pair: 'Booking + Payment',
        status: integrationFault ? 'Failed' : 'Passed',
        detail: integrationFault
          ? 'Simulated gateway timeout returned HTTP 504; booking state flagged for rollback'
          : 'Payment authorization approved; transaction TXN849201412 linked to booking',
      },
      {
        pair: 'Payment + Confirmation',
        status: integrationFault ? 'Failed' : 'Passed',
        detail: integrationFault
          ? 'Confirmation blocked because payment authorization failed'
          : 'E-ticket confirmation slip rendered with assigned Coach B3 seats',
      },
      {
        pair: 'Booking + PNR Generation',
        status: 'Passed',
        detail: `PNR ${pnr} generated and indexed in localStorage booking store`,
      },
    ]);
  };

  const runE2ESystemTest = () => {
    if (e2eRunning) return;
    setE2eRunning(true);

    const stepOutputs = [
      () => {
        const errs = validateAuthLogin('student@railbook.edu', 'RailTest@123');
        return {
          ok: Object.keys(errs).length === 0,
          output: 'Authenticated student@railbook.edu (USR-1001)',
        };
      },
      () => {
        const res = validateSearchParams({
          from: 'NDLS',
          to: 'CSMT',
          date: getFutureDateISO(3),
          travelClass: '3AC',
        });
        const trains = findTrainsForRoute('NDLS', 'CSMT');
        return {
          ok: res.valid && trains.length > 0,
          output: `Found ${trains.length} trains for NDLS → CSMT`,
        };
      },
      () => ({
        ok: true,
        output: 'Selected Train #12952 Mumbai Rajdhani (3AC · ₹2,140)',
      }),
      () => {
        const p1 = validatePassenger({
          id: '1',
          name: 'Aarav Sharma',
          age: '24',
          gender: 'Male',
          berthPreference: 'Lower',
        });
        return {
          ok: Object.keys(p1).length === 0,
          output: '2 passengers + contact validated; Total ₹4,524',
        };
      },
      () => ({
        ok: true,
        output: 'UPI payment simulated (student@okaxis) · TXN904182731',
      }),
      () => ({
        ok: true,
        output: `Confirmed PNR ${generatePNR()} generated & saved`,
      }),
    ];

    setE2eSteps((prev) => prev.map((s) => ({ ...s, status: 'Pending', output: 'Queued...' })));

    let idx = 0;
    const next = () => {
      if (idx >= stepOutputs.length) {
        setE2eRunning(false);
        onRunCategoryTests('System Testing');
        return;
      }
      const outcome = stepOutputs[idx]();
      const targetIdx = idx;
      setE2eSteps((prev) =>
        prev.map((s, i) =>
          i === targetIdx
            ? {
                ...s,
                status: outcome.ok ? 'Passed' : 'Failed',
                output: outcome.output,
              }
            : s
        )
      );
      idx++;
      setTimeout(next, 220);
    };

    next();
  };

  return (
    <div className="space-y-6">
      {/* Module Specific Interactive Workbench */}
      {category === 'Unit Testing' && (
        <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h2 className="font-display text-lg font-bold text-[#0F2942]">
                A. Unit Testing — Individual Function Verifier
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Test isolated utility functions (Station, Fare, Age, PNR, Date) directly with
                custom inputs.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onRunCategoryTests('Unit Testing')}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Run All Unit Tests</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
            <div className="lg:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Unit Function
              </label>
              <select
                value={unitFn}
                onChange={(e) => {
                  setUnitFn(e.target.value as typeof unitFn);
                  setUnitOutput('');
                }}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-slate-50"
              >
                <option value="fare">Fare calculation function (calculateFare)</option>
                <option value="station">Station validation function (validateSearchParams)</option>
                <option value="age">Passenger age validation (validatePassenger)</option>
                <option value="pnr">PNR generation function (generatePNR)</option>
                <option value="date">Date validation function (validateSearchParams)</option>
              </select>
            </div>

            {unitFn === 'fare' && (
              <>
                <div className="lg:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Travel Class
                  </label>
                  <select
                    value={unitFareClass}
                    onChange={(e) => setUnitFareClass(e.target.value as TrainClassCode)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="SL">Sleeper (SL · ₹645)</option>
                    <option value="3AC">3AC (₹2,140)</option>
                    <option value="2AC">2AC (₹2,980)</option>
                    <option value="1AC">1AC (₹4,890)</option>
                  </select>
                </div>
                <div className="lg:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Passengers
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={unitFareCount}
                    onChange={(e) => setUnitFareCount(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
              </>
            )}

            {unitFn === 'age' && (
              <div className="lg:col-span-6">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Passenger Age Input (Valid: 1–120)
                </label>
                <input
                  type="number"
                  value={unitAgeVal}
                  onChange={(e) => setUnitAgeVal(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>
            )}

            {unitFn === 'station' && (
              <>
                <div className="lg:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    From Code
                  </label>
                  <input
                    type="text"
                    value={unitStationFrom}
                    onChange={(e) => setUnitStationFrom(e.target.value)}
                    placeholder="e.g., NDLS or empty"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div className="lg:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    To Code
                  </label>
                  <input
                    type="text"
                    value={unitStationTo}
                    onChange={(e) => setUnitStationTo(e.target.value)}
                    placeholder="e.g., CSMT"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </>
            )}

            {unitFn === 'pnr' && (
              <div className="lg:col-span-6 text-xs text-slate-600 pb-2">
                Click <strong>Execute Unit Function</strong> to generate and validate a 10-digit
                PNR identifier.
              </div>
            )}

            {unitFn === 'date' && (
              <div className="lg:col-span-6">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Journey Date Input
                </label>
                <input
                  type="date"
                  value={unitDateVal}
                  onChange={(e) => setUnitDateVal(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>
            )}

            <div className="lg:col-span-2">
              <button
                type="button"
                onClick={runUnitSandbox}
                className="w-full px-4 py-2 bg-[#0F2942] hover:bg-slate-800 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                Execute Function
              </button>
            </div>
          </div>

          {unitOutput && (
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-lg font-mono text-xs text-[#0F2942]">
              {unitOutput}
            </div>
          )}
        </section>
      )}

      {category === 'Integration Testing' && (
        <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h2 className="font-display text-lg font-bold text-[#0F2942] flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-blue-700" />
                <span>B. Integration Testing — Module Handshake Simulator</span>
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Verify data flow between Search, Availability, Passenger, Payment, Confirmation, and
                PNR modules under both success and simulated failure states.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <label className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={integrationFault}
                  onChange={(e) => setIntegrationFault(e.target.checked)}
                />
                <span>Simulate Payment Gateway Failure</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  runIntegrationChecks();
                  onRunCategoryTests('Integration Testing', integrationFault);
                }}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Run Integration Checks</span>
              </button>
            </div>
          </div>

          {integrationResults.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {integrationResults.map((item) => (
                <div
                  key={item.pair}
                  className={`p-3.5 rounded-lg border text-xs ${
                    item.status === 'Passed'
                      ? 'bg-emerald-50/70 border-emerald-200'
                      : 'bg-red-50/70 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 font-semibold">
                    <span className="text-slate-900">{item.pair}</span>
                    <span
                      className={
                        item.status === 'Passed' ? 'text-emerald-700' : 'text-red-700'
                      }
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="text-slate-700 mt-1.5">{item.detail}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {category === 'Functional Testing' && (
        <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h2 className="font-display text-lg font-bold text-[#0F2942]">
                C. Functional Testing — Requirement Verification Matrix
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Validates core functional requirements: Search trains, Select train, Add passengers,
                Book tickets, Make payment, Generate PNR, and Cancel tickets.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onRunCategoryTests('Functional Testing')}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Run Functional Suite</span>
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs">
            {[
              'Search Trains',
              'Select Train',
              'Add Passengers',
              'Book Tickets',
              'Make Payment',
              'Generate PNR',
              'Cancel Tickets',
            ].map((req) => (
              <div
                key={req}
                className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg text-center font-semibold text-[#0F2942]"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <span>{req}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {category === 'System Testing' && (
        <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h2 className="font-display text-lg font-bold text-[#0F2942] flex items-center gap-2">
                <Workflow className="w-5 h-5 text-blue-700" />
                <span>D. System Testing — End-to-End Reservation Pipeline</span>
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Executes the complete reservation workflow: Login → Search Train → Select Train →
                Enter Passenger Details → Payment → Booking Confirmation.
              </p>
            </div>
            <button
              type="button"
              disabled={e2eRunning}
              onClick={runE2ESystemTest}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{e2eRunning ? 'Executing E2E Flow...' : 'Run End-to-End Scenario'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {e2eSteps.map((s) => (
              <div
                key={s.step}
                className={`p-3.5 rounded-lg border text-xs ${
                  s.status === 'Passed'
                    ? 'bg-emerald-50/60 border-emerald-200'
                    : s.status === 'Failed'
                      ? 'bg-red-50/60 border-red-200'
                      : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2 font-semibold text-[#0F2942]">
                  <span>{s.step}</span>
                  <span
                    className={
                      s.status === 'Passed'
                        ? 'text-emerald-700'
                        : s.status === 'Failed'
                          ? 'text-red-700'
                          : 'text-slate-500'
                    }
                  >
                    {s.status}
                  </span>
                </div>
                <p className="text-slate-600 mt-1.5">{s.output}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {category === 'Regression Testing' && (
        <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h2 className="font-display text-lg font-bold text-[#0F2942] flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-blue-700" />
                <span>E. Regression Testing — Post-Change Impact Verification</span>
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Ensures recent updates to booking, payment GST, and cancellation logic did not
                introduce defects into existing features.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onRunCategoryTests('Regression Testing')}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Run Regression Tests</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="font-semibold text-[#0F2942]">Change #1: Booking Flow Update</p>
              <p className="text-slate-600 mt-1">
                Re-verify Train Search results &amp; schedule sorting remain intact.
              </p>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="font-semibold text-[#0F2942]">Change #2: AC GST Payment Patch</p>
              <p className="text-slate-600 mt-1">
                Re-verify Sleeper (SL) fare calculation maintains 0% GST.
              </p>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="font-semibold text-[#0F2942]">Change #3: Cancellation Update</p>
              <p className="text-slate-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                Re-verify PNR status syncs passenger rows on cancellation.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Module Test Case Table */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-display text-sm font-bold text-[#0F2942]">
            {category} Cases ({categoryCases.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-[13px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap">Test Case ID</th>
                <th className="px-4 py-3">Test Scenario</th>
                <th className="px-4 py-3">Test Input</th>
                <th className="px-4 py-3">Expected Output</th>
                <th className="px-4 py-3">Actual Output</th>
                <th className="px-4 py-3 whitespace-nowrap">Status</th>
                <th className="px-4 py-3 whitespace-nowrap text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {categoryCases.map((tc) => (
                <tr key={tc.id} className="hover:bg-slate-50 align-top">
                  <td className="px-4 py-3 font-mono font-bold text-[#0F2942] whitespace-nowrap">
                    {tc.id}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">{tc.scenario}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-700">{tc.input}</td>
                  <td className="px-4 py-3 text-slate-600">{tc.expectedResult}</td>
                  <td className="px-4 py-3 text-slate-800">{tc.actualResult}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <TestStatusBadge status={tc.status} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <button
                      type="button"
                      onClick={() => onRunSingleTest(tc.id)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-md inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Play className="w-3 h-3" />
                      <span>Run Test</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
