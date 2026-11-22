import { INITIAL_BUG_REPORTS, INITIAL_EXECUTION_HISTORY } from '../data/qaBugs';
import { INITIAL_TEST_CASES } from '../data/qaTestSuite';
import {
  BugReport,
  ExecutionHistoryEntry,
  PerformanceSimResult,
  TestCaseRecord,
} from '../types';

const TEST_CASES_KEY = 'railtest_cases_v1';
const BUGS_KEY = 'railtest_bugs_v1';
const HISTORY_KEY = 'railtest_history_v1';
const PERF_KEY = 'railtest_perf_v1';

export function loadTestCases(): TestCaseRecord[] {
  try {
    const raw = localStorage.getItem(TEST_CASES_KEY);
    if (!raw) {
      localStorage.setItem(TEST_CASES_KEY, JSON.stringify(INITIAL_TEST_CASES));
      return INITIAL_TEST_CASES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_TEST_CASES;
  } catch {
    return INITIAL_TEST_CASES;
  }
}

export function saveTestCases(cases: TestCaseRecord[]): void {
  localStorage.setItem(TEST_CASES_KEY, JSON.stringify(cases));
}

export function resetTestCasesToDefault(): TestCaseRecord[] {
  localStorage.setItem(TEST_CASES_KEY, JSON.stringify(INITIAL_TEST_CASES));
  return INITIAL_TEST_CASES;
}

export function loadBugs(): BugReport[] {
  try {
    const raw = localStorage.getItem(BUGS_KEY);
    if (!raw) {
      localStorage.setItem(BUGS_KEY, JSON.stringify(INITIAL_BUG_REPORTS));
      return INITIAL_BUG_REPORTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_BUG_REPORTS;
  } catch {
    return INITIAL_BUG_REPORTS;
  }
}

export function saveBugs(bugs: BugReport[]): void {
  localStorage.setItem(BUGS_KEY, JSON.stringify(bugs));
}

export function loadHistory(): ExecutionHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(INITIAL_EXECUTION_HISTORY));
      return INITIAL_EXECUTION_HISTORY;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_EXECUTION_HISTORY;
  } catch {
    return INITIAL_EXECUTION_HISTORY;
  }
}

export function appendHistory(entry: ExecutionHistoryEntry): ExecutionHistoryEntry[] {
  const existing = loadHistory();
  const updated = [entry, ...existing].slice(0, 25);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  return updated;
}

export function loadPerformanceHistory(): PerformanceSimResult[] {
  try {
    const raw = localStorage.getItem(PERF_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function savePerformanceResult(result: PerformanceSimResult): PerformanceSimResult[] {
  const existing = loadPerformanceHistory();
  const updated = [result, ...existing].slice(0, 12);
  localStorage.setItem(PERF_KEY, JSON.stringify(updated));
  return updated;
}
