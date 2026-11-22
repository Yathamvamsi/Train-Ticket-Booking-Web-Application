import { useState } from 'react';
import { CheckCircle2, Eye, EyeOff, LogOut, UserCheck } from 'lucide-react';
import { User } from '../types';
import { loginUser, registerUser } from '../utils/storage';
import { validateAuthLogin, validateAuthRegister } from '../utils/validation';

interface AuthScreenProps {
  currentUser: User | null;
  onAuthSuccess: (user: User) => void;
  onLogout: () => void;
  onContinueBooking: () => void;
}

export default function AuthScreen({
  currentUser,
  onAuthSuccess,
  onLogout,
  onContinueBooking,
}: AuthScreenProps) {
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});
  const [authMessage, setAuthMessage] = useState<{
    type: 'error' | 'success';
    text: string;
  } | null>(null);

  // Register State
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMessage(null);
    const errs = validateAuthLogin(loginEmail, loginPassword);
    if (Object.keys(errs).length > 0) {
      setLoginErrors(errs);
      return;
    }
    setLoginErrors({});
    const res = loginUser(loginEmail, loginPassword);
    if (!res.success || !res.user) {
      setAuthMessage({ type: 'error', text: res.message });
      return;
    }
    setAuthMessage({ type: 'success', text: 'Logged in successfully.' });
    onAuthSuccess(res.user);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMessage(null);
    const errs = validateAuthRegister({
      fullName,
      email: regEmail,
      phone: regPhone,
      password: regPassword,
      confirmPassword: regConfirm,
    });
    if (Object.keys(errs).length > 0) {
      setRegErrors(errs);
      return;
    }
    setRegErrors({});
    const newUser: User = {
      id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: fullName.trim(),
      email: regEmail.trim(),
      phone: regPhone.trim(),
      password: regPassword,
      createdAt: new Date().toISOString(),
    };
    const res = registerUser(newUser);
    if (!res.success || !res.user) {
      setAuthMessage({ type: 'error', text: res.message });
      return;
    }
    setAuthMessage({ type: 'success', text: 'Account created and signed in.' });
    onAuthSuccess(res.user);
  };

  if (currentUser) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
            <div className="w-11 h-11 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-slate-900">
                {currentUser.fullName}
              </h1>
              <p className="text-sm text-slate-500">{currentUser.email}</p>
            </div>
          </div>

          <div className="mt-5 space-y-2 text-sm text-slate-700">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">User ID</span>
              <span className="font-mono font-semibold">{currentUser.id}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Mobile Number</span>
              <span className="tabular-nums font-medium">{currentUser.phone}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500">Session Status</span>
              <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Authenticated
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onContinueBooking}
              className="flex-1 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg cursor-pointer"
            >
              Book Train Tickets
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-red-700 text-sm font-semibold rounded-lg inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-10">
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
        <h1 className="font-display text-2xl font-bold text-slate-900">
          {tab === 'login' ? 'Sign in to RailBook' : 'Create a RailBook Account'}
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Access saved passenger profiles, booking history, and ticket management.
        </p>

        {/* Tab Switch */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 mt-5">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setAuthMessage(null);
            }}
            className={`py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
              tab === 'login'
                ? 'bg-white text-blue-700 font-semibold shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setAuthMessage(null);
            }}
            className={`py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
              tab === 'register'
                ? 'bg-white text-blue-700 font-semibold shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Register
          </button>
        </div>

        {authMessage && (
          <div
            role="alert"
            className={`mt-4 px-4 py-3 text-sm rounded-lg border ${
              authMessage.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}
          >
            {authMessage.text}
          </div>
        )}

        {tab === 'login' ? (
          <form onSubmit={handleLogin} noValidate className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => {
                  setLoginEmail(e.target.value);
                  setLoginErrors((prev) => ({ ...prev, email: '' }));
                }}
                placeholder="student@railbook.edu"
                className={`w-full px-3 py-2.5 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                  loginErrors.email ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {loginErrors.email && (
                <p className="text-xs text-red-600 mt-1">{loginErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showLoginPass ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    setLoginErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  placeholder="Enter password"
                  className={`w-full pl-3 pr-10 py-2.5 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                    loginErrors.password ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPass((v) => !v)}
                  aria-label={showLoginPass ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {loginErrors.password && (
                <p className="text-xs text-red-600 mt-1">{loginErrors.password}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Login
            </button>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Demo credentials: student@railbook.edu / RailTest@123</span>
              <button
                type="button"
                onClick={() => {
                  setLoginEmail('student@railbook.edu');
                  setLoginPassword('RailTest@123');
                  setLoginErrors({});
                  setAuthMessage(null);
                }}
                className="text-blue-700 font-semibold hover:underline cursor-pointer shrink-0 ml-2"
              >
                Auto-fill
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} noValidate className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setRegErrors((prev) => ({ ...prev, fullName: '' }));
                }}
                placeholder="e.g., Priya Nair"
                className={`w-full px-3 py-2.5 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                  regErrors.fullName ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {regErrors.fullName && (
                <p className="text-xs text-red-600 mt-1">{regErrors.fullName}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => {
                    setRegEmail(e.target.value);
                    setRegErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  placeholder="you@example.com"
                  className={`w-full px-3 py-2.5 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                    regErrors.email ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                {regErrors.email && (
                  <p className="text-xs text-red-600 mt-1">{regErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={regPhone}
                  onChange={(e) => {
                    setRegPhone(e.target.value);
                    setRegErrors((prev) => ({ ...prev, phone: '' }));
                  }}
                  placeholder="9876543210"
                  className={`w-full px-3 py-2.5 text-sm bg-white border rounded-lg tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                    regErrors.phone ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                {regErrors.phone && (
                  <p className="text-xs text-red-600 mt-1">{regErrors.phone}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password (min 6 characters)
              </label>
              <div className="relative">
                <input
                  type={showRegPass ? 'text' : 'password'}
                  value={regPassword}
                  onChange={(e) => {
                    setRegPassword(e.target.value);
                    setRegErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  placeholder="Create password"
                  className={`w-full pl-3 pr-10 py-2.5 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                    regErrors.password ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowRegPass((v) => !v)}
                  aria-label={showRegPass ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  {showRegPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {regErrors.password && (
                <p className="text-xs text-red-600 mt-1">{regErrors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showRegConfirm ? 'text' : 'password'}
                  value={regConfirm}
                  onChange={(e) => {
                    setRegConfirm(e.target.value);
                    setRegErrors((prev) => ({ ...prev, confirmPassword: '' }));
                  }}
                  placeholder="Repeat password"
                  className={`w-full pl-3 pr-10 py-2.5 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                    regErrors.confirmPassword ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowRegConfirm((v) => !v)}
                  aria-label={showRegConfirm ? 'Hide confirm password' : 'Show confirm password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  {showRegConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {regErrors.confirmPassword && (
                <p className="text-xs text-red-600 mt-1">{regErrors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Create Account
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
