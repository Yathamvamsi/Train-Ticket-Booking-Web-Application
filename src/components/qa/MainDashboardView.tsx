import { useMemo } from 'react';
import {
  ArrowRight,
  Bug,
  CheckCircle2,
  ClipboardList,
  FileSpreadsheet,
  PlayCircle,
  TrainFront,
} from 'lucide-react';
import { TESTING_CATEGORIES } from '../../data/qaTestSuite';
import {
  BugReport,
  ExecutionHistoryEntry,
  PlatformRoute,
  TestCaseRecord,
  TestingCategory,
} from '../../types';
import { BugStatusBadge, SeverityBadge } from './StatusBadge';

interface MainDashboardViewProps {
  testCases: TestCaseRecord[];
  bugs: BugReport[];
  history: ExecutionHistoryEntry[];
  onNavigate: (route: PlatformRoute) => void;
  onRunAllTests: () => void;
  isRunningAll: boolean;
}

const CATEGORY_TO_ROUTE: Record<TestingCategory, PlatformRoute> = {
  'Unit Testing': 'module-unit',
  'Integration Testing': 'module-integration',
  'Functional Testing': 'module-functional',
  'System Testing': 'module-system',
  'Regression Testing': 'module-regression',
  'Validation Testing': 'module-validation',
  'Negative Testing': 'module-negative',
  'Boundary Value Testing': 'module-boundary',
  'Performance Testing': 'module-performance',
  'User Interface Testing': 'module-ui',
};

export default function MainDashboardView({
  testCases,
  bugs,
  history,
  onNavigate,
  onRunAllTests,
  isRunningAll,
}: MainDashboardViewProps) {
  const stats = useMemo(() => {
    const total = testCases.length;
    const passed = testCases.filter((t) => t.status === 'Passed').length;
    const failed = testCases.filter((t) => t.status === 'Failed').length;
    const blocked = testCases.filter((t) => t.status === 'Blocked').length;
    const notExecuted = testCases.filter((t) => t.status === 'Not Executed').length;
    const executed = total - notExecuted;
    const executionPct = total > 0 ? Math.round((executed / total) * 100) : 0;
    const passRatePct = executed > 0 ? Math.round((passed / executed) * 100) : 0;
    const openBugs = bugs.filter((b) => b.status !== 'Closed').length;
    return {
      total,
      passed,
      failed,
      blocked,
      notExecuted,
      executed,
      executionPct,
      passRatePct,
      totalBugs: bugs.length,
      openBugs,
    };
  }, [testCases, bugs]);

  const byCategory = useMemo(() => {
    return TESTING_CATEGORIES.map((cat) => {
      const items = testCases.filter((t) => t.category === cat);
      const passed = items.filter((t) => t.status === 'Passed').length;
      const failed = items.filter((t) => t.status === 'Failed').length;
      const blocked = items.filter((t) => t.status === 'Blocked').length;
      const notExecuted = items.filter((t) => t.status === 'Not Executed').length;
      return {
        category: cat,
        route: CATEGORY_TO_ROUTE[cat],
        total: items.length,
        passed,
        failed,
        blocked,
        notExecuted,
      };
    });
  }, [testCases]);

  // SVG Donut math (radius 54, circumference ~339.29)
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const total = Math.max(1, stats.total);
  const passArc = (stats.passed / total) * circumference;
  const failArc = (stats.failed / total) * circumference;
  const blockedArc = (stats.blocked / total) * circumference;
  const notExecArc = (stats.notExecuted / total) * circumference;

  return (
    <div className="space-y-6">
      {/* Project Title Banner */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            Academic Software Testing Demonstration
          </p>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-[#0F2942] mt-1">
            A Comprehensive Testing Approach for Train Ticket Booking Web Application
          </h2>
          <p className="text-sm text-slate-600 mt-1.5 max-w-3xl">
            Central QA workspace for executing test suites across 10 methodologies, tracking
            defects, simulating performance loads, and verifying the RailBook train reservation
            Application Under Test.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('execution')}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-[#0F2942] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
          >
            <PlayCircle className="w-4 h-4 text-blue-700" />
            <span>Test Execution Runner</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('reports')}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#0F2942] hover:bg-slate-800 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>View Reports</span>
          </button>
        </div>
      </section>

      {/* 8 Core KPI Metrics */}
      <section aria-label="Testing metrics summary" className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-500">Total Test Cases</p>
          <p className="font-display text-2xl font-bold text-[#0F2942] mt-1 tabular-nums">
            {stats.total}
          </p>
          <p className="text-xs text-slate-500 mt-1">Across 10 testing types</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-emerald-700">Passed Test Cases</p>
          <p className="font-display text-2xl font-bold text-emerald-700 mt-1 tabular-nums">
            {stats.passed}
          </p>
          <p className="text-xs text-slate-500 mt-1 tabular-nums">
            {stats.passRatePct}% pass rate of executed
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-red-700">Failed Test Cases</p>
          <p className="font-display text-2xl font-bold text-red-700 mt-1 tabular-nums">
            {stats.failed}
          </p>
          <p className="text-xs text-slate-500 mt-1">Requires defect triage</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-amber-700">Blocked Test Cases</p>
          <p className="font-display text-2xl font-bold text-amber-700 mt-1 tabular-nums">
            {stats.blocked}
          </p>
          <p className="text-xs text-slate-500 mt-1">Waiting on dependency fix</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-500">Not Executed Cases</p>
          <p className="font-display text-2xl font-bold text-slate-700 mt-1 tabular-nums">
            {stats.notExecuted}
          </p>
          <p className="text-xs text-slate-500 mt-1">Pending execution queue</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-500">Total Bugs Identified</p>
          <p className="font-display text-2xl font-bold text-[#0F2942] mt-1 tabular-nums">
            {stats.totalBugs}
          </p>
          <p className="text-xs text-red-600 font-medium mt-1 tabular-nums">
            {stats.openBugs} active / non-closed
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-blue-700">Test Execution %</p>
          <p className="font-display text-2xl font-bold text-blue-700 mt-1 tabular-nums">
            {stats.executionPct}%
          </p>
          <p className="text-xs text-slate-500 mt-1 tabular-nums">
            {stats.executed} of {stats.total} executed
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">Overall Testing Progress</p>
            <span className="font-mono text-xs font-bold text-[#0F2942] tabular-nums">
              {stats.executionPct}%
            </span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex mt-2">
            <div
              className="bg-emerald-600 h-full transition-all"
              style={{ width: `${(stats.passed / total) * 100}%` }}
              title={`Passed: ${stats.passed}`}
            />
            <div
              className="bg-red-600 h-full transition-all"
              style={{ width: `${(stats.failed / total) * 100}%` }}
              title={`Failed: ${stats.failed}`}
            />
            <div
              className="bg-amber-500 h-full transition-all"
              style={{ width: `${(stats.blocked / total) * 100}%` }}
              title={`Blocked: ${stats.blocked}`}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2 tabular-nums">
            Pass: {stats.passed} · Fail: {stats.failed} · Blocked: {stats.blocked}
          </p>
        </div>
      </section>

      {/* Charts Row: Execution Summary Chart + Pass vs Fail Chart */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Test Execution Summary Chart by Testing Type */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-display text-base font-bold text-[#0F2942]">
                Test Execution Summary by Methodology
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Distribution of Passed, Failed, Blocked, and Not Executed cases across all 10 types
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" /> Passed
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-red-600" /> Failed
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" /> Blocked
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-300" /> Not Executed
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {byCategory.map((row) => {
              const rowTotal = Math.max(1, row.total);
              return (
                <div key={row.category} className="grid grid-cols-12 gap-3 items-center text-xs">
                  <button
                    type="button"
                    onClick={() => onNavigate(row.route)}
                    className="col-span-5 sm:col-span-4 text-left font-medium text-slate-700 hover:text-blue-700 truncate cursor-pointer"
                  >
                    {row.category}
                  </button>
                  <div className="col-span-5 sm:col-span-6 h-5 bg-slate-100 rounded overflow-hidden flex">
                    {row.passed > 0 && (
                      <div
                        className="bg-emerald-600 h-full"
                        style={{ width: `${(row.passed / rowTotal) * 100}%` }}
                      />
                    )}
                    {row.failed > 0 && (
                      <div
                        className="bg-red-600 h-full"
                        style={{ width: `${(row.failed / rowTotal) * 100}%` }}
                      />
                    )}
                    {row.blocked > 0 && (
                      <div
                        className="bg-amber-500 h-full"
                        style={{ width: `${(row.blocked / rowTotal) * 100}%` }}
                      />
                    )}
                    {row.notExecuted > 0 && (
                      <div
                        className="bg-slate-300 h-full"
                        style={{ width: `${(row.notExecuted / rowTotal) * 100}%` }}
                      />
                    )}
                  </div>
                  <div className="col-span-2 text-right font-mono tabular-nums text-slate-600">
                    {row.passed}/{row.total}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Pass vs Fail Donut Chart */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-display text-base font-bold text-[#0F2942]">
              Pass vs Fail Distribution
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Current test suite status ratio
            </p>
          </div>

          <div className="my-5 flex items-center justify-center">
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="18"
                />
                {/* Passed */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="18"
                  strokeDasharray={`${passArc} ${circumference}`}
                  strokeDashoffset={0}
                />
                {/* Failed */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="18"
                  strokeDasharray={`${failArc} ${circumference}`}
                  strokeDashoffset={-passArc}
                />
                {/* Blocked */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="18"
                  strokeDasharray={`${blockedArc} ${circumference}`}
                  strokeDashoffset={-(passArc + failArc)}
                />
                {/* Not Executed */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="18"
                  strokeDasharray={`${notExecArc} ${circumference}`}
                  strokeDashoffset={-(passArc + failArc + blockedArc)}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-display text-2xl font-bold text-[#0F2942] tabular-nums">
                  {stats.passRatePct}%
                </span>
                <span className="text-[11px] text-slate-500">Pass Rate</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs border-t border-slate-100 pt-4 tabular-nums">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" /> Passed
              </span>
              <span className="font-mono font-semibold text-slate-900">
                {stats.passed} ({Math.round((stats.passed / total) * 100)}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-sm bg-red-600" /> Failed
              </span>
              <span className="font-mono font-semibold text-slate-900">
                {stats.failed} ({Math.round((stats.failed / total) * 100)}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" /> Blocked
              </span>
              <span className="font-mono font-semibold text-slate-900">
                {stats.blocked} ({Math.round((stats.blocked / total) * 100)}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-300" /> Not Executed
              </span>
              <span className="font-mono font-semibold text-slate-900">
                {stats.notExecuted} ({Math.round((stats.notExecuted / total) * 100)}%)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access to 10 Testing Modules */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-display text-base font-bold text-[#0F2942]">
              Quick Access: 10 Testing Methodologies
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select any methodology module to run interactive test simulations and inspect results
            </p>
          </div>
          <button
            type="button"
            disabled={isRunningAll}
            onClick={onRunAllTests}
            className="text-xs font-semibold text-blue-700 hover:underline cursor-pointer self-start sm:self-auto"
          >
            {isRunningAll ? 'Running Full Suite...' : 'Execute All 10 Modules →'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-4">
          {byCategory.map((item, idx) => (
            <button
              key={item.category}
              type="button"
              onClick={() => onNavigate(item.route)}
              className="text-left p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-mono font-semibold text-blue-700">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="font-mono tabular-nums">
                  {item.passed}/{item.total} Pass
                </span>
              </div>
              <p className="font-display text-sm font-semibold text-[#0F2942] mt-1.5 group-hover:text-blue-700 truncate">
                {item.category}
              </p>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 tabular-nums">
                <span>
                  {item.failed > 0 ? (
                    <span className="text-red-600 font-semibold">{item.failed} Failed</span>
                  ) : (
                    <span className="text-emerald-700">0 Failed</span>
                  )}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-700" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Recent Defect Reports & Testing Activity History */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recent Defect Reports */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-display text-base font-bold text-[#0F2942] flex items-center gap-2">
              <Bug className="w-4 h-4 text-red-600" />
              <span>Recent Defect Reports</span>
            </h3>
            <button
              type="button"
              onClick={() => onNavigate('bugs')}
              className="text-xs font-semibold text-blue-700 hover:underline cursor-pointer"
            >
              Manage All Bugs →
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {bugs.slice(0, 4).map((bug) => (
              <div key={bug.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-[#0F2942]">{bug.id}</span>
                    <span className="text-slate-400">·</span>
                    <span className="font-mono text-slate-500">{bug.relatedTestCaseId}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-500">{bug.moduleName}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-900 mt-1 truncate">
                    {bug.title}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <SeverityBadge severity={bug.severity} />
                  <BugStatusBadge status={bug.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testing Activity History */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-display text-base font-bold text-[#0F2942] flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-blue-700" />
              <span>Testing Activity History</span>
            </h3>
            <button
              type="button"
              onClick={() => onNavigate('test-cases')}
              className="text-xs font-semibold text-blue-700 hover:underline cursor-pointer"
            >
              All Cases →
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {history.slice(0, 4).map((entry) => (
              <div key={entry.id} className="py-3.5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-[#0F2942]">{entry.action}</span>
                  <span className="font-mono text-slate-400 tabular-nums">{entry.timestamp}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{entry.summary}</p>
                <div className="mt-1.5 flex items-center gap-3 text-[11px] font-mono tabular-nums">
                  <span className="text-emerald-700">{entry.passedCount} Passed</span>
                  <span className="text-red-600">{entry.failedCount} Failed</span>
                  <span className="text-amber-700">{entry.blockedCount} Blocked</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              AUT Ready for Live Verification
            </span>
            <button
              type="button"
              onClick={() => onNavigate('aut')}
              className="text-xs font-semibold text-blue-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <TrainFront className="w-3.5 h-3.5" />
              <span>Launch AUT</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
