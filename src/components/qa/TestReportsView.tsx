import { useMemo } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import { TESTING_CATEGORIES } from '../../data/qaTestSuite';
import {
  BugReport,
  BugSeverity,
  BugStatus,
  ExecutionHistoryEntry,
  TestCaseRecord,
} from '../../types';
import { downloadTestReportCSV } from '../../utils/csvReport';

interface TestReportsViewProps {
  testCases: TestCaseRecord[];
  bugs: BugReport[];
  history: ExecutionHistoryEntry[];
}

export default function TestReportsView({
  testCases,
  bugs,
  history,
}: TestReportsViewProps) {
  const summary = useMemo(() => {
    const total = testCases.length;
    const passed = testCases.filter((t) => t.status === 'Passed').length;
    const failed = testCases.filter((t) => t.status === 'Failed').length;
    const blocked = testCases.filter((t) => t.status === 'Blocked').length;
    const notExecuted = testCases.filter((t) => t.status === 'Not Executed').length;
    const executed = total - notExecuted;
    const coveragePct = total > 0 ? Math.round((executed / total) * 100) : 0;
    const passPct = executed > 0 ? Math.round((passed / executed) * 100) : 0;
    const failPct = executed > 0 ? Math.round((failed / executed) * 100) : 0;
    return {
      total,
      passed,
      failed,
      blocked,
      notExecuted,
      executed,
      coveragePct,
      passPct,
      failPct,
    };
  }, [testCases]);

  const categoryBreakdown = useMemo(() => {
    return TESTING_CATEGORIES.map((cat) => {
      const items = testCases.filter((t) => t.category === cat);
      const passed = items.filter((t) => t.status === 'Passed').length;
      const failed = items.filter((t) => t.status === 'Failed').length;
      const blocked = items.filter((t) => t.status === 'Blocked').length;
      const notExecuted = items.filter((t) => t.status === 'Not Executed').length;
      const executed = items.length - notExecuted;
      const passRate = executed > 0 ? Math.round((passed / executed) * 100) : 0;
      return {
        category: cat,
        total: items.length,
        passed,
        failed,
        blocked,
        notExecuted,
        passRate,
      };
    });
  }, [testCases]);

  const severityCounts = useMemo(() => {
    const list: BugSeverity[] = ['Critical', 'High', 'Medium', 'Low'];
    return list.map((sev) => ({
      severity: sev,
      count: bugs.filter((b) => b.severity === sev).length,
    }));
  }, [bugs]);

  const bugStatusCounts = useMemo(() => {
    const list: BugStatus[] = ['Open', 'In Progress', 'Fixed', 'Retested', 'Closed'];
    return list.map((st) => ({
      status: st,
      count: bugs.filter((b) => b.status === st).length,
    }));
  }, [bugs]);

  return (
    <div className="space-y-6">
      {/* Header & CSV Download */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-[#0F2942] flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-700" />
            <span>Comprehensive Test Summary &amp; Coverage Report</span>
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Aggregated QA metrics across all 10 testing methodologies, defect distribution, and
            downloadable CSV export.
          </p>
        </div>

        <button
          type="button"
          onClick={() => downloadTestReportCSV(testCases, bugs)}
          className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm font-semibold rounded-lg inline-flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Download Test Report (CSV)</span>
        </button>
      </section>

      {/* Overall Metrics Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-5 gap-4 tabular-nums">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-500">Testing Coverage</p>
          <p className="font-display text-2xl font-bold text-[#0F2942] mt-1">
            {summary.coveragePct}%
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {summary.executed}/{summary.total} cases executed
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-emerald-700">Pass Percentage</p>
          <p className="font-display text-2xl font-bold text-emerald-700 mt-1">
            {summary.passPct}%
          </p>
          <p className="text-xs text-slate-500 mt-1">{summary.passed} passed</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-red-700">Failure Percentage</p>
          <p className="font-display text-2xl font-bold text-red-700 mt-1">
            {summary.failPct}%
          </p>
          <p className="text-xs text-slate-500 mt-1">{summary.failed} failed</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-amber-700">Blocked Cases</p>
          <p className="font-display text-2xl font-bold text-amber-700 mt-1">
            {summary.blocked}
          </p>
          <p className="text-xs text-slate-500 mt-1">{summary.notExecuted} not executed</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 col-span-2 lg:col-span-1">
          <p className="text-xs font-semibold text-slate-500">Defects Logged</p>
          <p className="font-display text-2xl font-bold text-[#0F2942] mt-1">{bugs.length}</p>
          <p className="text-xs text-slate-500 mt-1">
            {bugs.filter((b) => b.status === 'Open').length} open defects
          </p>
        </div>
      </section>

      {/* Defect Distribution Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
          <h3 className="font-display text-base font-bold text-[#0F2942] pb-3 border-b border-slate-100">
            Defect Distribution by Severity
          </h3>
          <div className="mt-4 space-y-3">
            {severityCounts.map((item) => {
              const pct = bugs.length > 0 ? Math.round((item.count / bugs.length) * 100) : 0;
              const barColor =
                item.severity === 'Critical'
                  ? 'bg-red-600'
                  : item.severity === 'High'
                    ? 'bg-amber-500'
                    : item.severity === 'Medium'
                      ? 'bg-blue-600'
                      : 'bg-slate-400';
              return (
                <div key={item.severity} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700">{item.severity}</span>
                    <span className="font-mono tabular-nums text-slate-700">
                      {item.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${barColor}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
          <h3 className="font-display text-base font-bold text-[#0F2942] pb-3 border-b border-slate-100">
            Defect Lifecycle Status Breakdown
          </h3>
          <div className="mt-4 space-y-3">
            {bugStatusCounts.map((item) => {
              const pct = bugs.length > 0 ? Math.round((item.count / bugs.length) * 100) : 0;
              const barColor =
                item.status === 'Open'
                  ? 'bg-red-600'
                  : item.status === 'In Progress'
                    ? 'bg-amber-500'
                    : item.status === 'Fixed'
                      ? 'bg-blue-600'
                      : item.status === 'Retested'
                        ? 'bg-indigo-600'
                        : 'bg-emerald-600';
              return (
                <div key={item.status} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700">{item.status}</span>
                    <span className="font-mono tabular-nums text-slate-700">
                      {item.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${barColor}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testing Type-Wise Results Table */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h3 className="font-display text-base font-bold text-[#0F2942]">
            Testing Type-Wise Results Matrix
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm tabular-nums">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
              <tr>
                <th className="px-4 py-3">Testing Methodology</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Passed</th>
                <th className="px-4 py-3 text-right">Failed</th>
                <th className="px-4 py-3 text-right">Blocked</th>
                <th className="px-4 py-3 text-right">Not Executed</th>
                <th className="px-4 py-3 text-right">Pass Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {categoryBreakdown.map((row) => (
                <tr key={row.category} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-[#0F2942]">{row.category}</td>
                  <td className="px-4 py-3 text-right font-mono">{row.total}</td>
                  <td className="px-4 py-3 text-right font-mono text-emerald-700 font-semibold">
                    {row.passed}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-red-700 font-semibold">
                    {row.failed}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-amber-700">{row.blocked}</td>
                  <td className="px-4 py-3 text-right font-mono text-slate-500">
                    {row.notExecuted}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-[#0F2942]">
                    {row.passRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Execution History Log */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h3 className="font-display text-base font-bold text-[#0F2942]">
            Recent Execution History
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm tabular-nums">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Run Action</th>
                <th className="px-4 py-3">Scope</th>
                <th className="px-4 py-3 text-right">Passed</th>
                <th className="px-4 py-3 text-right">Failed</th>
                <th className="px-4 py-3 text-right">Blocked</th>
                <th className="px-4 py-3">Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {history.map((h) => (
                <tr key={h.id}>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500 whitespace-nowrap">
                    {h.timestamp}
                  </td>
                  <td className="px-4 py-3 font-semibold text-[#0F2942]">{h.action}</td>
                  <td className="px-4 py-3 text-slate-700">{h.scope}</td>
                  <td className="px-4 py-3 text-right font-mono text-emerald-700">
                    {h.passedCount}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-red-700">
                    {h.failedCount}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-amber-700">
                    {h.blockedCount}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{h.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
