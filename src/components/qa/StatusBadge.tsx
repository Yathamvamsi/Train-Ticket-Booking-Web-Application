import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  CircleDashed,
  Clock,
  XCircle,
} from 'lucide-react';
import { BugSeverity, BugStatus, TestStatus } from '../../types';

export function TestStatusBadge({ status }: { status: TestStatus }) {
  if (status === 'Passed') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>Passed</span>
      </span>
    );
  }
  if (status === 'Failed') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-700 border border-red-200 whitespace-nowrap">
        <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
        <span>Failed</span>
      </span>
    );
  }
  if (status === 'Blocked') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap">
        <Ban className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>Blocked</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">
      <CircleDashed className="w-3.5 h-3.5 text-slate-500 shrink-0" />
      <span>Not Executed</span>
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: BugSeverity }) {
  if (severity === 'Critical') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-red-50 text-red-700 border border-red-200 whitespace-nowrap">
        <AlertTriangle className="w-3 h-3 text-red-600 shrink-0" />
        <span>Critical</span>
      </span>
    );
  }
  if (severity === 'High') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap">
        <span>High</span>
      </span>
    );
  }
  if (severity === 'Medium') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 whitespace-nowrap">
        <span>Medium</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
      <span>Low</span>
    </span>
  );
}

export function BugStatusBadge({ status }: { status: BugStatus }) {
  if (status === 'Open') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-red-50 text-red-700 border border-red-200 whitespace-nowrap">
        <XCircle className="w-3 h-3 shrink-0" />
        <span>Open</span>
      </span>
    );
  }
  if (status === 'In Progress') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap">
        <Clock className="w-3 h-3 shrink-0" />
        <span>In Progress</span>
      </span>
    );
  }
  if (status === 'Fixed') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
        <span>Fixed</span>
      </span>
    );
  }
  if (status === 'Retested') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 whitespace-nowrap">
        <span>Retested</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
      <CheckCircle2 className="w-3 h-3 shrink-0" />
      <span>Closed</span>
    </span>
  );
}
