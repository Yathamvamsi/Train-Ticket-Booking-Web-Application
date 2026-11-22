import { useMemo, useState } from 'react';
import { Bug, Eye, Plus, Search, X } from 'lucide-react';
import {
  BugPriority,
  BugReport,
  BugSeverity,
  BugStatus,
  TestCaseRecord,
} from '../../types';
import { BugStatusBadge, SeverityBadge } from './StatusBadge';

interface BugReportsViewProps {
  bugs: BugReport[];
  testCases: TestCaseRecord[];
  onAddBug: (bug: BugReport) => void;
  onUpdateBugStatus: (bugId: string, status: BugStatus) => void;
}

const SEVERITIES: BugSeverity[] = ['Critical', 'High', 'Medium', 'Low'];
const STATUSES: BugStatus[] = ['Open', 'In Progress', 'Fixed', 'Retested', 'Closed'];
const PRIORITIES: BugPriority[] = ['P1 - Urgent', 'P2 - High', 'P3 - Medium', 'P4 - Low'];

export default function BugReportsView({
  bugs,
  testCases,
  onAddBug,
  onUpdateBugStatus,
}: BugReportsViewProps) {
  const [severityFilter, setSeverityFilter] = useState<'ALL' | BugSeverity>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | BugStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [showNewModal, setShowNewModal] = useState(false);
  const [detailBug, setDetailBug] = useState<BugReport | null>(null);

  // New Bug Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [relatedTc, setRelatedTc] = useState(testCases[0]?.id || 'TC-UNIT-01');
  const [moduleName, setModuleName] = useState('Train Search & Booking');
  const [severity, setSeverity] = useState<BugSeverity>('High');
  const [priority, setPriority] = useState<BugPriority>('P2 - High');
  const [stepsToReproduce, setStepsToReproduce] = useState('');
  const [formError, setFormError] = useState('');

  const filteredBugs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return bugs.filter((b) => {
      if (severityFilter !== 'ALL' && b.severity !== severityFilter) return false;
      if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;
      if (
        q &&
        !b.id.toLowerCase().includes(q) &&
        !b.title.toLowerCase().includes(q) &&
        !b.relatedTestCaseId.toLowerCase().includes(q) &&
        !b.moduleName.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [bugs, severityFilter, statusFilter, searchQuery]);

  const handleCreateBug = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || title.trim().length < 5) {
      setFormError('Bug title must be at least 5 characters.');
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      setFormError('Description must be at least 10 characters.');
      return;
    }

    const nextNumber =
      bugs.reduce((max, b) => {
        const num = Number(b.id.replace(/\D/g, ''));
        return Number.isFinite(num) && num > max ? num : max;
      }, 100) + 1;

    const newBug: BugReport = {
      id: `BUG-${nextNumber}`,
      title: title.trim(),
      description: description.trim(),
      relatedTestCaseId: relatedTc,
      moduleName: moduleName.trim() || 'Core Booking',
      severity,
      priority,
      status: 'Open',
      dateReported: new Date().toISOString().slice(0, 10),
      stepsToReproduce: stepsToReproduce.trim() || undefined,
    };

    onAddBug(newBug);
    setTitle('');
    setDescription('');
    setStepsToReproduce('');
    setFormError('');
    setShowNewModal(false);
  };

  const activeDetail = detailBug
    ? bugs.find((b) => b.id === detailBug.id) || detailBug
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-[#0F2942] flex items-center gap-2">
            <Bug className="w-5 h-5 text-red-600" />
            <span>Bug &amp; Defect Tracking ({bugs.length} Logged)</span>
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Report defects discovered during test execution, track severity/priority, and update
            remediation status.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm font-semibold rounded-lg inline-flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Report New Bug</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Bug ID, title, module, or Test Case ID..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            aria-label="Filter by Severity"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as 'ALL' | BugSeverity)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="ALL">All Severities</option>
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            aria-label="Filter by Defect Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | BugStatus)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="ALL">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Defect Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-[13px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap">Bug ID</th>
                <th className="px-4 py-3 min-w-[230px]">Bug Title &amp; Description</th>
                <th className="px-4 py-3 whitespace-nowrap">Related Test Case</th>
                <th className="px-4 py-3 whitespace-nowrap">Severity</th>
                <th className="px-4 py-3 whitespace-nowrap">Priority</th>
                <th className="px-4 py-3 whitespace-nowrap">Status</th>
                <th className="px-4 py-3 whitespace-nowrap">Date Reported</th>
                <th className="px-4 py-3 whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredBugs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-500">
                    No defect reports match the selected severity or status filters.
                  </td>
                </tr>
              ) : (
                filteredBugs.map((bug) => (
                  <tr key={bug.id} className="hover:bg-blue-50/30 align-top">
                    <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-[#0F2942]">
                      {bug.id}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-slate-900">{bug.title}</p>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">{bug.description}</p>
                      <p className="text-[11px] text-blue-700 mt-1">Module: {bug.moduleName}</p>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs text-slate-700">
                      {bug.relatedTestCaseId}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <SeverityBadge severity={bug.severity} />
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-700 font-medium">
                      {bug.priority}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <select
                        aria-label={`Change status for ${bug.id}`}
                        value={bug.status}
                        onChange={(e) => onUpdateBugStatus(bug.id, e.target.value as BugStatus)}
                        className="px-2 py-1 text-xs font-medium bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        {STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs text-slate-600 tabular-nums">
                      {bug.dateReported}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-right">
                      <button
                        type="button"
                        onClick={() => setDetailBug(bug)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report New Bug Modal */}
      {showNewModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Report New Bug"
          className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4"
        >
          <div className="bg-white border border-slate-200 rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 bg-[#0F2942] text-white flex items-center justify-between">
              <h3 className="font-display text-base font-bold">Report New Defect</h3>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="p-1 rounded hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBug} noValidate className="p-6 space-y-4 text-sm">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bug Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setFormError('');
                  }}
                  placeholder="Short, clear defect summary"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setFormError('');
                  }}
                  placeholder="Expected vs actual behavior observed..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Related Test Case
                  </label>
                  <select
                    value={relatedTc}
                    onChange={(e) => setRelatedTc(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {testCases.map((tc) => (
                      <option key={tc.id} value={tc.id}>
                        {tc.id} ({tc.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Module Name
                  </label>
                  <input
                    type="text"
                    value={moduleName}
                    onChange={(e) => setModuleName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Severity
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as BugSeverity)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {SEVERITIES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as BugPriority)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Steps to Reproduce (Optional)
                </label>
                <textarea
                  rows={2}
                  value={stepsToReproduce}
                  onChange={(e) => setStepsToReproduce(e.target.value)}
                  placeholder="1. Open AUT...\n2. Enter invalid data..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer"
                >
                  Submit Bug Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Bug Details Modal */}
      {activeDetail && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Bug Details"
          className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4"
        >
          <div className="bg-white border border-slate-200 rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 bg-[#0F2942] text-white flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-blue-200">
                  {activeDetail.id} · Related: {activeDetail.relatedTestCaseId}
                </p>
                <h3 className="font-display text-base font-bold mt-0.5">
                  {activeDetail.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailBug(null)}
                className="p-1 rounded hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="flex flex-wrap items-center gap-3 pb-3 border-b border-slate-200">
                <SeverityBadge severity={activeDetail.severity} />
                <BugStatusBadge status={activeDetail.status} />
                <span className="text-xs text-slate-500">
                  Priority: <strong>{activeDetail.priority}</strong>
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Reported: {activeDetail.dateReported}
                </span>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Description</p>
                <p className="text-slate-800 mt-1">{activeDetail.description}</p>
              </div>

              {activeDetail.stepsToReproduce && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">
                    Steps to Reproduce
                  </p>
                  <pre className="mt-1 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs whitespace-pre-wrap font-mono text-slate-700">
                    {activeDetail.stepsToReproduce}
                  </pre>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">Update Status:</span>
                  <select
                    value={activeDetail.status}
                    onChange={(e) =>
                      onUpdateBugStatus(activeDetail.id, e.target.value as BugStatus)
                    }
                    className="px-2.5 py-1.5 text-xs font-medium border border-slate-300 rounded-lg bg-white"
                  >
                    {STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => setDetailBug(null)}
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
