import { BugReport, TestCaseRecord } from '../types';

function csvEscape(value: string | number | undefined): string {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function downloadTestReportCSV(
  testCases: TestCaseRecord[],
  bugs: BugReport[]
): void {
  const total = testCases.length;
  const passed = testCases.filter((t) => t.status === 'Passed').length;
  const failed = testCases.filter((t) => t.status === 'Failed').length;
  const blocked = testCases.filter((t) => t.status === 'Blocked').length;
  const notExecuted = testCases.filter((t) => t.status === 'Not Executed').length;
  const executed = total - notExecuted;
  const execPct = total > 0 ? ((executed / total) * 100).toFixed(1) : '0.0';
  const passPct = executed > 0 ? ((passed / executed) * 100).toFixed(1) : '0.0';

  const lines: string[] = [];

  lines.push('RailTest - Train Booking Software Testing Platform Report');
  lines.push(`Project Title,A Comprehensive Testing Approach for Train Ticket Booking Web Application`);
  lines.push(`Generated At,${csvEscape(new Date().toLocaleString())}`);
  lines.push('');
  lines.push('SUMMARY METRICS');
  lines.push(`Total Test Cases,${total}`);
  lines.push(`Executed Test Cases,${executed}`);
  lines.push(`Passed,${passed}`);
  lines.push(`Failed,${failed}`);
  lines.push(`Blocked,${blocked}`);
  lines.push(`Not Executed,${notExecuted}`);
  lines.push(`Execution Percentage,${execPct}%`);
  lines.push(`Pass Rate (of Executed),${passPct}%`);
  lines.push(`Total Defects Logged,${bugs.length}`);
  lines.push('');

  lines.push('TEST CASE EXECUTION DETAILS');
  lines.push(
    [
      'Test Case ID',
      'Testing Type',
      'Test Scenario',
      'Test Input',
      'Expected Result',
      'Actual Result',
      'Status',
      'Duration (ms)',
      'Last Run',
    ].join(',')
  );

  testCases.forEach((tc) => {
    lines.push(
      [
        csvEscape(tc.id),
        csvEscape(tc.category),
        csvEscape(tc.scenario),
        csvEscape(tc.input),
        csvEscape(tc.expectedResult),
        csvEscape(tc.actualResult),
        csvEscape(tc.status),
        csvEscape(tc.durationMs ?? ''),
        csvEscape(tc.lastRunAt ?? ''),
      ].join(',')
    );
  });

  lines.push('');
  lines.push('DEFECT / BUG REPORT SUMMARY');
  lines.push(
    [
      'Bug ID',
      'Bug Title',
      'Module',
      'Related Test Case',
      'Severity',
      'Priority',
      'Status',
      'Date Reported',
    ].join(',')
  );

  bugs.forEach((bug) => {
    lines.push(
      [
        csvEscape(bug.id),
        csvEscape(bug.title),
        csvEscape(bug.moduleName),
        csvEscape(bug.relatedTestCaseId),
        csvEscape(bug.severity),
        csvEscape(bug.priority),
        csvEscape(bug.status),
        csvEscape(bug.dateReported),
      ].join(',')
    );
  });

  const csvContent = lines.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const today = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `RailTest_Execution_Report_${today}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
