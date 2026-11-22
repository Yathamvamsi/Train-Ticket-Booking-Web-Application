import { useMemo, useState } from 'react';
import { CheckSquare, Play, PlayCircle, Square, Terminal } from 'lucide-react';
import { TESTING_CATEGORIES, runTestCaseSimulation } from '../../data/qaTestSuite';
import { TestCaseRecord, TestingCategory } from '../../types';
import { TestStatusBadge } from './StatusBadge';

interface TestExecutionViewProps {
  testCases: TestCaseRecord[];
  onApplyBatchResults: (
    updates: Record<string, { status: 'Passed' | 'Failed'; actualResult: string; durationMs: number; lastRunAt: string }>,
    scopeLabel: string
  ) => void;
}

interface LogLine {
  time: string;
  id: string;
  status: 'Passed' | 'Failed';
  message: string;
  durationMs: number;
}

export default function TestExecutionView({
  testCases,
  onApplyBatchResults,
}: TestExecutionViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | TestingCategory>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    testCases.slice(0, 6).map((t) => t.id)
  );
  const [faultMode, setFaultMode] = useState(false);

  const [isExecuting, setIsExecuting] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [lastSummary, setLastSummary] = useState<{
    total: number;
    passed: number;
    failed: number;
    scope: string;
  } | null>(null);

  const visibleCases = useMemo(
    () =>
      selectedCategory === 'ALL'
        ? testCases
        : testCases.filter((tc) => tc.category === selectedCategory),
    [testCases, selectedCategory]
  );

  const toggleId = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAllVisible = () => {
    const visibleIds = visibleCases.map((v) => v.id);
    setSelectedIds(visibleIds);
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const executeBatch = (casesToRun: TestCaseRecord[], scopeLabel: string) => {
    if (casesToRun.length === 0 || isExecuting) return;

    setIsExecuting(true);
    setProgressPct(0);
    setLogs([]);

    const updates: Record<
      string,
      { status: 'Passed' | 'Failed'; actualResult: string; durationMs: number; lastRunAt: string }
    > = {};
    let idx = 0;
    let passed = 0;
    let failed = 0;

    const step = () => {
      if (idx >= casesToRun.length) {
        onApplyBatchResults(updates, scopeLabel);
        setLastSummary({
          total: casesToRun.length,
          passed,
          failed,
          scope: scopeLabel,
        });
        setIsExecuting(false);
        return;
      }

      const tc = casesToRun[idx];
      const res = runTestCaseSimulation(tc, faultMode);
      const nowTime = new Date().toLocaleTimeString();

      if (res.status === 'Passed') passed++;
      else failed++;

      updates[tc.id] = {
        status: res.status,
        actualResult: res.actualResult,
        durationMs: res.durationMs,
        lastRunAt: nowTime,
      };

      setLogs((prev) => [
        {
          time: nowTime,
          id: tc.id,
          status: res.status,
          message: res.actualResult,
          durationMs: res.durationMs,
        },
        ...prev,
      ]);

      idx++;
      setProgressPct(Math.round((idx / casesToRun.length) * 100));
      setTimeout(step, 45);
    };

    step();
  };

  const handleRunSelected = () => {
    const targets = testCases.filter((tc) => selectedIds.includes(tc.id));
    executeBatch(targets, `Selected (${targets.length} Cases)`);
  };

  const handleRunAll = () => {
    const targets = visibleCases;
    executeBatch(
      targets,
      selectedCategory === 'ALL' ? 'All 32 Test Cases' : `${selectedCategory} (${targets.length})`
    );
  };

  return (
    <div className="space-y-6">
      {/* Execution Controls */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-[#0F2942]">
              Test Execution Runner
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Select a testing category or individual test cases, execute the simulation, and inspect
              live step-by-step logs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={faultMode}
                onChange={(e) => setFaultMode(e.target.checked)}
              />
              <span>Inject Regression Faults</span>
            </label>

            <button
              type="button"
              disabled={isExecuting || selectedIds.length === 0}
              onClick={handleRunSelected}
              className="px-4 py-2 bg-white border border-blue-700 text-blue-700 hover:bg-blue-50 disabled:opacity-50 text-xs sm:text-sm font-semibold rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-4 h-4" />
              <span>Run Selected ({selectedIds.length})</span>
            </button>

            <button
              type="button"
              disabled={isExecuting || visibleCases.length === 0}
              onClick={handleRunAll}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white text-xs sm:text-sm font-semibold rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
            >
              <PlayCircle className="w-4 h-4" />
              <span>
                {isExecuting
                  ? `Running (${progressPct}%)`
                  : selectedCategory === 'ALL'
                    ? 'Run All Test Cases'
                    : `Run ${selectedCategory}`}
              </span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700">
              {isExecuting ? 'Live Execution Progress' : 'Execution Progress'}
            </span>
            <span className="font-mono font-bold text-[#0F2942] tabular-nums">
              {progressPct}%
            </span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className="h-full bg-blue-700 transition-all duration-150"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {lastSummary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 tabular-nums">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <span className="text-slate-500 block">Executed Scope</span>
              <strong className="text-[#0F2942] text-sm">{lastSummary.scope}</strong>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
              <span className="text-emerald-700 block">Passed</span>
              <strong className="text-emerald-800 text-lg font-mono">{lastSummary.passed}</strong>
            </div>
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs">
              <span className="text-red-700 block">Failed</span>
              <strong className="text-red-800 text-lg font-mono">{lastSummary.failed}</strong>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
              <span className="text-blue-700 block">Pass Rate</span>
              <strong className="text-blue-900 text-lg font-mono">
                {Math.round((lastSummary.passed / Math.max(1, lastSummary.total)) * 100)}%
              </strong>
            </div>
          </div>
        )}
      </section>

      {/* Main Split: Test Case Selector + Live Execution Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Category & Checkbox List */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <select
              aria-label="Select Testing Category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as 'ALL' | TestingCategory)}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">All Categories ({testCases.length})</option>
              {TESTING_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={selectAllVisible}
                className="px-2.5 py-1.5 font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md inline-flex items-center gap-1 cursor-pointer"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Select All</span>
              </button>
              <button
                type="button"
                onClick={clearSelection}
                className="px-2.5 py-1.5 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md inline-flex items-center gap-1 cursor-pointer"
              >
                <Square className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-200 max-h-[520px] overflow-y-auto">
            {visibleCases.map((tc) => {
              const checked = selectedIds.includes(tc.id);
              return (
                <label
                  key={tc.id}
                  className={`flex items-start justify-between gap-3 p-3.5 cursor-pointer hover:bg-slate-50 ${
                    checked ? 'bg-blue-50/40' : ''
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleId(tc.id)}
                      className="mt-1"
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-mono font-bold text-[#0F2942]">{tc.id}</span>
                        <span className="text-blue-700">{tc.category}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-900 mt-0.5">{tc.scenario}</p>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <TestStatusBadge status={tc.status} />
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Right: Execution Console Logs */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3.5 bg-[#0F2942] text-white flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-300" />
              <span>Test Execution Logs</span>
            </h3>
            <span className="font-mono text-xs text-blue-200 tabular-nums">
              {logs.length} entries
            </span>
          </div>

          <div className="p-4 max-h-[520px] overflow-y-auto space-y-2.5 bg-slate-50">
            {logs.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                Click <strong>Run Selected</strong> or <strong>Run All Test Cases</strong> to
                observe live test execution output and timing logs.
              </div>
            ) : (
              logs.map((log, i) => (
                <div
                  key={`${log.id}-${i}`}
                  className="bg-white border border-slate-200 rounded-lg p-3 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-[#0F2942]">{log.id}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                        {log.durationMs}ms · {log.time}
                      </span>
                      <span
                        className={`font-semibold ${
                          log.status === 'Passed' ? 'text-emerald-700' : 'text-red-700'
                        }`}
                      >
                        [{log.status.toUpperCase()}]
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-700 mt-1">{log.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
