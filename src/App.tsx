import { useState } from 'react';
import ApplicationUnderTest from './components/qa/ApplicationUnderTest';
import BugReportsView from './components/qa/BugReportsView';
import MainDashboardView from './components/qa/MainDashboardView';
import PlatformShell from './components/qa/PlatformShell';
import TestCasesView from './components/qa/TestCasesView';
import TestExecutionView from './components/qa/TestExecutionView';
import TestReportsView from './components/qa/TestReportsView';
import TestingModulesCore from './components/qa/TestingModulesCore';
import TestingModulesSpecialized from './components/qa/TestingModulesSpecialized';
import { runTestCaseSimulation } from './data/qaTestSuite';
import {
  BugReport,
  BugStatus,
  ExecutionHistoryEntry,
  PerformanceSimResult,
  PlatformRoute,
  TestCaseRecord,
  TestingCategory,
} from './types';
import {
  appendHistory,
  loadBugs,
  loadHistory,
  loadPerformanceHistory,
  loadTestCases,
  resetTestCasesToDefault,
  saveBugs,
  savePerformanceResult,
  saveTestCases,
} from './utils/qaStorage';

export default function App() {
  const [activeRoute, setActiveRoute] = useState<PlatformRoute>('dashboard');
  const [testCases, setTestCases] = useState<TestCaseRecord[]>(() => loadTestCases());
  const [bugs, setBugs] = useState<BugReport[]>(() => loadBugs());
  const [history, setHistory] = useState<ExecutionHistoryEntry[]>(() => loadHistory());
  const [perfHistory, setPerfHistory] = useState<PerformanceSimResult[]>(() =>
    loadPerformanceHistory()
  );
  const [isRunningAll, setIsRunningAll] = useState(false);

  const openBugCount = bugs.filter((b) => b.status === 'Open' || b.status === 'In Progress').length;

  const logHistory = (
    action: string,
    scope: string,
    casesSnapshot: TestCaseRecord[],
    summary: string
  ) => {
    const passedCount = casesSnapshot.filter((t) => t.status === 'Passed').length;
    const failedCount = casesSnapshot.filter((t) => t.status === 'Failed').length;
    const blockedCount = casesSnapshot.filter((t) => t.status === 'Blocked').length;
    const entry: ExecutionHistoryEntry = {
      id: `HIST-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      action,
      scope,
      passedCount,
      failedCount,
      blockedCount,
      summary,
    };
    setHistory(appendHistory(entry));
  };

  const handleRunSingleTest = (id: string) => {
    const nowTime = new Date().toLocaleTimeString();
    let ranScenario = id;
    let ranStatus: 'Passed' | 'Failed' = 'Passed';

    const updated = testCases.map((tc) => {
      if (tc.id !== id) return tc;
      const res = runTestCaseSimulation(tc, false);
      ranScenario = tc.id;
      ranStatus = res.status;
      return {
        ...tc,
        status: res.status,
        actualResult: res.actualResult,
        durationMs: res.durationMs,
        lastRunAt: nowTime,
      };
    });

    setTestCases(updated);
    saveTestCases(updated);
    logHistory(
      `Executed ${ranScenario}`,
      'Single Test Case',
      updated,
      `${ranScenario} completed with status: ${ranStatus}.`
    );
  };

  const handleRunAllTests = () => {
    if (isRunningAll) return;
    setIsRunningAll(true);

    setTimeout(() => {
      const nowTime = new Date().toLocaleTimeString();
      const updated = testCases.map((tc) => {
        const res = runTestCaseSimulation(tc, false);
        return {
          ...tc,
          status: res.status,
          actualResult: res.actualResult,
          durationMs: res.durationMs,
          lastRunAt: nowTime,
        };
      });

      setTestCases(updated);
      saveTestCases(updated);
      setIsRunningAll(false);
      logHistory(
        'Full Suite Execution',
        `${updated.length} Test Cases (All 10 Modules)`,
        updated,
        `Executed full ${updated.length}-case verification suite.`
      );
    }, 300);
  };

  const handleRunCategoryTests = (category: TestingCategory, faultMode = false) => {
    const nowTime = new Date().toLocaleTimeString();
    const updated = testCases.map((tc) => {
      if (tc.category !== category) return tc;
      const res = runTestCaseSimulation(tc, faultMode);
      return {
        ...tc,
        status: res.status,
        actualResult: res.actualResult,
        durationMs: res.durationMs,
        lastRunAt: nowTime,
      };
    });

    setTestCases(updated);
    saveTestCases(updated);
    logHistory(
      `${category} Run`,
      category,
      updated,
      `Executed ${category} suite${faultMode ? ' (with simulated fault injection)' : ''}.`
    );
  };

  const handleApplyBatchResults = (
    updates: Record<
      string,
      { status: 'Passed' | 'Failed'; actualResult: string; durationMs: number; lastRunAt: string }
    >,
    scopeLabel: string
  ) => {
    const updated = testCases.map((tc) => {
      const patch = updates[tc.id];
      if (!patch) return tc;
      return {
        ...tc,
        status: patch.status,
        actualResult: patch.actualResult,
        durationMs: patch.durationMs,
        lastRunAt: patch.lastRunAt,
      };
    });

    setTestCases(updated);
    saveTestCases(updated);
    logHistory(
      'Batch Test Execution',
      scopeLabel,
      updated,
      `Completed batch test run for ${scopeLabel}.`
    );
  };

  const handleResetResults = () => {
    const reset = resetTestCasesToDefault();
    setTestCases(reset);
    logHistory(
      'Reset Test Results',
      'Baseline QA Snapshot',
      reset,
      'Restored baseline QA test execution snapshot.'
    );
  };

  const handleAddBug = (bug: BugReport) => {
    const updated = [bug, ...bugs];
    setBugs(updated);
    saveBugs(updated);
    logHistory(
      `Logged ${bug.id}`,
      bug.relatedTestCaseId,
      testCases,
      `New ${bug.severity} defect reported: ${bug.title}`
    );
  };

  const handleUpdateBugStatus = (bugId: string, status: BugStatus) => {
    const updated = bugs.map((b) => (b.id === bugId ? { ...b, status } : b));
    setBugs(updated);
    saveBugs(updated);
    logHistory(
      `Updated ${bugId}`,
      'Defect Lifecycle',
      testCases,
      `Defect ${bugId} status changed to ${status}.`
    );
  };

  const handleSavePerfResult = (result: PerformanceSimResult) => {
    const updatedPerf = savePerformanceResult(result);
    setPerfHistory(updatedPerf);
    logHistory(
      `Simulated Load (${result.virtualUsers} VUs)`,
      result.endpoint,
      testCases,
      `Simulated ${result.totalRequests} requests: avg ${result.avgResponseTimeMs}ms, ${result.errorRatePercent}% error rate.`
    );
  };

  return (
    <PlatformShell
      activeRoute={activeRoute}
      onNavigate={(route) => {
        setActiveRoute(route);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      onRunAllTests={handleRunAllTests}
      isRunningAll={isRunningAll}
      openBugCount={openBugCount}
    >
      {activeRoute === 'dashboard' && (
        <MainDashboardView
          testCases={testCases}
          bugs={bugs}
          history={history}
          onNavigate={setActiveRoute}
          onRunAllTests={handleRunAllTests}
          isRunningAll={isRunningAll}
        />
      )}

      {activeRoute === 'test-cases' && (
        <TestCasesView
          testCases={testCases}
          onRunSingleTest={handleRunSingleTest}
          onRunAllTests={handleRunAllTests}
          onResetResults={handleResetResults}
          isRunningAll={isRunningAll}
        />
      )}

      {activeRoute === 'execution' && (
        <TestExecutionView
          testCases={testCases}
          onApplyBatchResults={handleApplyBatchResults}
        />
      )}

      {activeRoute === 'bugs' && (
        <BugReportsView
          bugs={bugs}
          testCases={testCases}
          onAddBug={handleAddBug}
          onUpdateBugStatus={handleUpdateBugStatus}
        />
      )}

      {activeRoute === 'reports' && (
        <TestReportsView testCases={testCases} bugs={bugs} history={history} />
      )}

      {activeRoute === 'module-unit' && (
        <TestingModulesCore
          category="Unit Testing"
          testCases={testCases}
          onRunSingleTest={handleRunSingleTest}
          onRunCategoryTests={handleRunCategoryTests}
        />
      )}

      {activeRoute === 'module-integration' && (
        <TestingModulesCore
          category="Integration Testing"
          testCases={testCases}
          onRunSingleTest={handleRunSingleTest}
          onRunCategoryTests={handleRunCategoryTests}
        />
      )}

      {activeRoute === 'module-functional' && (
        <TestingModulesCore
          category="Functional Testing"
          testCases={testCases}
          onRunSingleTest={handleRunSingleTest}
          onRunCategoryTests={handleRunCategoryTests}
        />
      )}

      {activeRoute === 'module-system' && (
        <TestingModulesCore
          category="System Testing"
          testCases={testCases}
          onRunSingleTest={handleRunSingleTest}
          onRunCategoryTests={handleRunCategoryTests}
        />
      )}

      {activeRoute === 'module-regression' && (
        <TestingModulesCore
          category="Regression Testing"
          testCases={testCases}
          onRunSingleTest={handleRunSingleTest}
          onRunCategoryTests={handleRunCategoryTests}
        />
      )}

      {activeRoute === 'module-validation' && (
        <TestingModulesSpecialized
          category="Validation Testing"
          testCases={testCases}
          perfHistory={perfHistory}
          onRunSingleTest={handleRunSingleTest}
          onRunCategoryTests={handleRunCategoryTests}
          onSavePerfResult={handleSavePerfResult}
        />
      )}

      {activeRoute === 'module-negative' && (
        <TestingModulesSpecialized
          category="Negative Testing"
          testCases={testCases}
          perfHistory={perfHistory}
          onRunSingleTest={handleRunSingleTest}
          onRunCategoryTests={handleRunCategoryTests}
          onSavePerfResult={handleSavePerfResult}
        />
      )}

      {activeRoute === 'module-boundary' && (
        <TestingModulesSpecialized
          category="Boundary Value Testing"
          testCases={testCases}
          perfHistory={perfHistory}
          onRunSingleTest={handleRunSingleTest}
          onRunCategoryTests={handleRunCategoryTests}
          onSavePerfResult={handleSavePerfResult}
        />
      )}

      {activeRoute === 'module-performance' && (
        <TestingModulesSpecialized
          category="Performance Testing"
          testCases={testCases}
          perfHistory={perfHistory}
          onRunSingleTest={handleRunSingleTest}
          onRunCategoryTests={handleRunCategoryTests}
          onSavePerfResult={handleSavePerfResult}
        />
      )}

      {activeRoute === 'module-ui' && (
        <TestingModulesSpecialized
          category="User Interface Testing"
          testCases={testCases}
          perfHistory={perfHistory}
          onRunSingleTest={handleRunSingleTest}
          onRunCategoryTests={handleRunCategoryTests}
          onSavePerfResult={handleSavePerfResult}
        />
      )}

      {activeRoute === 'aut' && <ApplicationUnderTest />}
    </PlatformShell>
  );
}
