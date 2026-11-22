import { ReactNode, useState } from 'react';
import {
  Activity,
  BarChart3,
  Bug,
  ClipboardList,
  FileSpreadsheet,
  FlaskConical,
  Gauge,
  GitBranch,
  LayoutDashboard,
  LayoutGrid,
  Menu,
  PlayCircle,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  TrainFront,
  Workflow,
  X,
} from 'lucide-react';
import { PlatformRoute } from '../../types';

interface PlatformShellProps {
  activeRoute: PlatformRoute;
  onNavigate: (route: PlatformRoute) => void;
  onRunAllTests: () => void;
  isRunningAll: boolean;
  openBugCount: number;
  children: ReactNode;
}

interface NavGroup {
  title: string;
  items: Array<{
    route: PlatformRoute;
    label: string;
    icon: typeof LayoutDashboard;
    badge?: number;
  }>;
}

const ROUTE_TITLES: Record<PlatformRoute, { group: string; title: string }> = {
  dashboard: { group: 'Overview', title: 'Testing Dashboard' },
  'test-cases': { group: 'QA Management', title: 'Test Case Management' },
  execution: { group: 'QA Management', title: 'Test Execution Runner' },
  bugs: { group: 'QA Management', title: 'Bug & Defect Reports' },
  reports: { group: 'QA Management', title: 'Test Reports & Export' },
  'module-unit': { group: 'Testing Modules', title: 'A. Unit Testing' },
  'module-integration': { group: 'Testing Modules', title: 'B. Integration Testing' },
  'module-functional': { group: 'Testing Modules', title: 'C. Functional Testing' },
  'module-system': { group: 'Testing Modules', title: 'D. System Testing (E2E)' },
  'module-regression': { group: 'Testing Modules', title: 'E. Regression Testing' },
  'module-validation': { group: 'Testing Modules', title: 'F. Validation Testing' },
  'module-negative': { group: 'Testing Modules', title: 'G. Negative Testing' },
  'module-boundary': { group: 'Testing Modules', title: 'H. Boundary Value Testing' },
  'module-performance': { group: 'Testing Modules', title: 'I. Performance Testing (Simulated)' },
  'module-ui': { group: 'Testing Modules', title: 'J. User Interface Testing' },
  aut: { group: 'Sample System', title: 'Application Under Test (Train Booking)' },
};

export default function PlatformShell({
  activeRoute,
  onNavigate,
  onRunAllTests,
  isRunningAll,
  openBugCount,
  children,
}: PlatformShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navGroups: NavGroup[] = [
    {
      title: 'Core QA Workspace',
      items: [
        { route: 'dashboard', label: 'Testing Dashboard', icon: LayoutDashboard },
        { route: 'test-cases', label: 'Test Cases', icon: ClipboardList },
        { route: 'execution', label: 'Test Execution', icon: PlayCircle },
        { route: 'bugs', label: 'Bug Reports', icon: Bug, badge: openBugCount },
        { route: 'reports', label: 'Test Reports', icon: FileSpreadsheet },
      ],
    },
    {
      title: 'Testing Methodologies',
      items: [
        { route: 'module-unit', label: 'A. Unit Testing', icon: FlaskConical },
        { route: 'module-integration', label: 'B. Integration Testing', icon: GitBranch },
        { route: 'module-functional', label: 'C. Functional Testing', icon: Activity },
        { route: 'module-system', label: 'D. System Testing', icon: Workflow },
        { route: 'module-regression', label: 'E. Regression Testing', icon: RefreshCw },
        { route: 'module-validation', label: 'F. Validation Testing', icon: ShieldCheck },
        { route: 'module-negative', label: 'G. Negative Testing', icon: ShieldAlert },
        { route: 'module-boundary', label: 'H. Boundary Value', icon: SlidersHorizontal },
        { route: 'module-performance', label: 'I. Performance Testing', icon: Gauge },
        { route: 'module-ui', label: 'J. UI Testing', icon: LayoutGrid },
      ],
    },
    {
      title: 'System Under Test',
      items: [
        { route: 'aut', label: 'Application Under Test', icon: TrainFront },
      ],
    },
  ];

  const handleSelect = (route: PlatformRoute) => {
    onNavigate(route);
    setMobileMenuOpen(false);
  };

  const currentMeta = ROUTE_TITLES[activeRoute];

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0F2942] text-slate-100">
      {/* Brand Header */}
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => handleSelect('dashboard')}
          className="flex items-center gap-2.5 text-left cursor-pointer"
        >
          <span className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0">
            <BarChart3 className="w-4 h-4" />
          </span>
          <div>
            <span className="font-display text-base font-bold tracking-tight text-white block leading-none">
              RailTest
            </span>
            <span className="text-[11px] text-blue-200 block mt-1">
              QA Testing Platform
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden p-1.5 text-slate-300 hover:text-white"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Groups */}
      <nav aria-label="QA platform navigation" className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navGroups.map((group) => (
          <div key={group.title}>
            <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-blue-300/80">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = activeRoute === item.route;
                return (
                  <button
                    key={item.route}
                    type="button"
                    onClick={() => handleSelect(item.route)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
                      active
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-slate-200 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <Icon className="w-4 h-4 shrink-0 opacity-90" />
                      <span className="truncate">{item.label}</span>
                    </span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-red-500/90 text-white tabular-nums shrink-0 ml-2">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Academic Project Context Footer inside Sidebar */}
      <div className="p-4 border-t border-white/10 text-[11px] text-blue-200/80 leading-relaxed">
        <p className="font-semibold text-white">Academic QA Project</p>
        <p className="mt-0.5">
          Comprehensive Testing Approach for Train Ticket Booking Web App
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#F4F7FB] text-slate-900">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="w-68 max-w-[82vw] h-full shadow-xl">{renderSidebarContent()}</div>
          <div
            className="flex-1 bg-slate-900/50"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
        </div>
      )}

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Context Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 truncate">
                RailTest / {currentMeta.group}
              </p>
              <h1 className="font-display text-base sm:text-lg font-bold text-[#0F2942] truncate">
                {currentMeta.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {activeRoute !== 'aut' && (
              <button
                type="button"
                onClick={() => onNavigate('aut')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0F2942] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <TrainFront className="w-3.5 h-3.5 text-blue-700" />
                <span>Open Sample Train App</span>
              </button>
            )}
            <button
              type="button"
              disabled={isRunningAll}
              onClick={onRunAllTests}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-60 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <PlayCircle className="w-4 h-4" />
              <span>{isRunningAll ? 'Executing...' : 'Run All Tests'}</span>
            </button>
          </div>
        </header>

        {/* Page Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
