import { useMemo, useState } from 'react';
import {
  Eye,
  Play,
  PlayCircle,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import { TESTING_CATEGORIES } from '../../data/qaTestSuite';
import { TestCaseRecord, TestStatus, TestingCategory } from '../../types';
import { TestStatusBadge } from './StatusBadge';

interface TestCasesViewProps {
  testCases: TestCaseRecord[];
  onRunSingleTest: (id: string) => void;
  onRunAllTests: () => void;
  onResetResults: () => void;
  isRunningAll: boolean;
}

export default function TestCasesView({
  testCases,
  onRunSingleTest,
  onRunAllTests,
  onResetResults,
  isRunningAll,
}: TestCasesViewProps) {
  const [statusFilter, setStatusFilter] = useState<'ALL' | TestStatus>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | TestingCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTest, setSelectedTest] = useState<TestCaseRecord | null>(null);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return testCases.filter((tc) => {
      if (statusFilter !== 'ALL' && tc.status !== statusFilter) return false;
      if (typeFilter !== 'ALL' && tc.category !== typeFilter) return false;
      if (
        q &&
        !tc.id.toLowerCase().includes(q) &&
        !tc.scenario.toLowerCase().includes(q) &&
        !tc.category.toLowerCase().includes(q) &&
        !tc.input.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [testCases, statusFilter, typeFilter, searchQuery]);

  const counts = useMemo(
    () => ({
      ALL: testCases.length,
      Passed: testCases.filter((t) => t.status === 'Passed').length,
      Failed: testCases.filter((t) => t.status === 'Failed').length,
      Blocked: testCases.filter((t) => t.status === 'Blocked').length,
      'Not Executed': testCases.filter((t) => t.status === 'Not Executed').length,
    }),
    [testCases]
  );

  // Keep modal detail synced when user clicks Run Test inside modal
  const activeModalTest = selectedTest
    ? testCases.find((t) => t.id === selectedTest.id) || selectedTest
    : null;

  return (
    <div className="space-y-6">
      {/* Header & Global Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-[#0F2942]">
            Test Case Repository ({testCases.length} Cases)
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Inspect preconditions, test steps, inputs, and execute live simulation assertions per
            test case.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onResetResults}
            className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Results</span>
          </button>
          <button
            type="button"
            disabled={isRunningAll}
            onClick={onRunAllTests}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-60 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
          >
            <PlayCircle className="w-4 h-4" />
            <span>{isRunningAll ? 'Running All...' : 'Run All Tests'}</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {(['ALL', 'Passed', 'Failed', 'Blocked', 'Not Executed'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer tabular-nums ${
                statusFilter === status
                  ? 'bg-[#0F2942] text-white border-[#0F2942]'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {status === 'ALL' ? 'All Test Cases' : status} ({counts[status]})
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-7 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Test ID, scenario, input, or testing type..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="sm:col-span-5">
            <select
              aria-label="Filter by Testing Type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'ALL' | TestingCategory)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">All Testing Types (10)</option>
              {TESTING_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Test Cases Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-[13px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase">
              <tr>
                <th className="px-3.5 py-3 whitespace-nowrap">Test Case ID</th>
                <th className="px-3.5 py-3 whitespace-nowrap">Testing Type</th>
                <th className="px-3.5 py-3 min-w-[200px]">Test Scenario</th>
                <th className="px-3.5 py-3 min-w-[160px]">Preconditions</th>
                <th className="px-3.5 py-3 min-w-[190px]">Test Steps</th>
                <th className="px-3.5 py-3 min-w-[150px]">Test Input</th>
                <th className="px-3.5 py-3 min-w-[170px]">Expected Result</th>
                <th className="px-3.5 py-3 min-w-[170px]">Actual Result</th>
                <th className="px-3.5 py-3 whitespace-nowrap">Status</th>
                <th className="px-3.5 py-3 whitespace-nowrap text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-sm text-slate-500">
                    No test cases match the active filters.
                  </td>
                </tr>
              ) : (
                filtered.map((tc) => (
                  <tr key={tc.id} className="hover:bg-blue-50/30 align-top">
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <span className="font-mono font-bold text-[#0F2942]">{tc.id}</span>
                      {tc.durationMs !== undefined && (
                        <div className="font-mono text-[11px] text-slate-400 tabular-nums mt-0.5">
                          {tc.durationMs} ms
                        </div>
                      )}
                    </td>
                    <td className="px-3.5 py-3 whitespace-nowrap text-blue-800 font-medium">
                      {tc.category}
                    </td>
                    <td className="px-3.5 py-3 font-medium text-slate-900">{tc.scenario}</td>
                    <td className="px-3.5 py-3 text-slate-600">{tc.preconditions}</td>
                    <td className="px-3.5 py-3 text-slate-600">
                      <ol className="list-decimal list-inside space-y-0.5">
                        {tc.steps.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ol>
                    </td>
                    <td className="px-3.5 py-3 font-mono text-xs text-slate-700">{tc.input}</td>
                    <td className="px-3.5 py-3 text-slate-600">{tc.expectedResult}</td>
                    <td className="px-3.5 py-3 text-slate-800">{tc.actualResult}</td>
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <TestStatusBadge status={tc.status} />
                    </td>
                    <td className="px-3.5 py-3 whitespace-nowrap text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onRunSingleTest(tc.id)}
                          className="px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-md inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Play className="w-3 h-3" />
                          <span>Run Test</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedTest(tc)}
                          title="View Test Details"
                          className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Details</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Test Details Modal */}
      {activeModalTest && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Test Case Details"
          className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4"
        >
          <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 bg-[#0F2942] text-white flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-blue-200">
                  {activeModalTest.id} · {activeModalTest.category}
                </p>
                <h3 className="font-display text-base font-bold mt-0.5">
                  {activeModalTest.scenario}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTest(null)}
                aria-label="Close test details"
                className="p-1.5 rounded hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <TestStatusBadge status={activeModalTest.status} />
                <span className="font-mono text-xs text-slate-500 tabular-nums">
                  {activeModalTest.durationMs ? `Runtime: ${activeModalTest.durationMs} ms` : 'Not yet timed'}{' '}
                  {activeModalTest.lastRunAt ? `· Last run: ${activeModalTest.lastRunAt}` : ''}
                </span>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Preconditions</p>
                <p className="text-slate-800 mt-1">{activeModalTest.preconditions}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Test Steps</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-800 mt-1">
                  {activeModalTest.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Test Input</p>
                <p className="font-mono text-xs bg-slate-50 border border-slate-200 rounded-lg p-3 mt-1 text-slate-800">
                  {activeModalTest.input}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="text-xs font-semibold text-slate-500 uppercase">Expected Result</p>
                  <p className="text-slate-800 mt-1 text-xs">{activeModalTest.expectedResult}</p>
                </div>
                <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-lg">
                  <p className="text-xs font-semibold text-blue-800 uppercase">Actual Result</p>
                  <p className="text-slate-900 mt-1 text-xs">{activeModalTest.actualResult}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => onRunSingleTest(activeModalTest.id)}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Run Test Now</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTest(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
