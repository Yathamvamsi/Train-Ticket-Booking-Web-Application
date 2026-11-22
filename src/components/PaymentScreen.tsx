import { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  CreditCard,
  Lock,
  Smartphone,
} from 'lucide-react';
import { CLASS_LABELS, getStationByCode } from '../data/trains';
import {
  PassengerInput,
  PaymentMethod,
  SearchParams,
  Train,
  TrainClassCode,
} from '../types';
import { calculateFare, validatePayment } from '../utils/validation';

interface PaymentScreenProps {
  train: Train;
  travelClass: TrainClassCode;
  searchParams: SearchParams;
  passengers: PassengerInput[];
  contactPhone: string;
  contactEmail: string;
  onBack: () => void;
  onPaymentSuccess: (method: PaymentMethod) => void;
}

const PAYMENT_METHODS: Array<{ id: PaymentMethod; label: string; icon: typeof Smartphone }> = [
  { id: 'UPI', label: 'UPI', icon: Smartphone },
  { id: 'Debit Card', label: 'Debit Card', icon: CreditCard },
  { id: 'Credit Card', label: 'Credit Card', icon: CreditCard },
  { id: 'Net Banking', label: 'Net Banking', icon: Building2 },
];

export default function PaymentScreen({
  train,
  travelClass,
  searchParams,
  passengers,
  contactPhone,
  contactEmail,
  onBack,
  onPaymentSuccess,
}: PaymentScreenProps) {
  const [method, setMethod] = useState<PaymentMethod>('UPI');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [bankName, setBankName] = useState('');
  const [netBankingUserId, setNetBankingUserId] = useState('');

  const [simulateOutcome, setSimulateOutcome] = useState<'success' | 'failure'>('success');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [gatewayFailureMsg, setGatewayFailureMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const classInfo = train.classes[travelClass];
  const fare = calculateFare(classInfo.fare, passengers.length, travelClass);
  const fromSt = getStationByCode(train.sourceCode);
  const toSt = getStationByCode(train.destinationCode);

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setGatewayFailureMsg('');

    const validationErrors = validatePayment({
      method,
      upiId,
      cardNumber,
      cardHolder,
      cardExpiry,
      cardCvv,
      bankName,
      netBankingUserId,
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      if (simulateOutcome === 'failure') {
        setGatewayFailureMsg(
          `Payment failed via ${method}: Bank authorization declined (Simulated Failure). No amount was deducted. Switch simulation mode to "Success" or retry.`
        );
        return;
      }
      onPaymentSuccess(method);
    }, 450);
  };

  const fillSampleDetails = () => {
    setErrors({});
    setGatewayFailureMsg('');
    if (method === 'UPI') {
      setUpiId('student@okaxis');
    } else if (method === 'Debit Card' || method === 'Credit Card') {
      setCardNumber('4532 1234 5678 9012');
      setCardHolder(passengers[0]?.name || 'Aarav Sharma');
      setCardExpiry('08/29');
      setCardCvv('412');
    } else {
      setBankName('State Bank of India');
      setNetBankingUserId('RAILUSER01');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Passenger Details</span>
        </button>
        <h1 className="font-display text-2xl font-bold text-slate-900 mt-2">
          Review &amp; Payment
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Payment Methods & Form */}
        <form onSubmit={handleConfirmPayment} noValidate className="lg:col-span-7 space-y-5">
          {gatewayFailureMsg && (
            <div
              role="alert"
              className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-sm text-red-800"
            >
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Payment Simulation Failed</p>
                <p className="mt-0.5 text-red-700">{gatewayFailureMsg}</p>
              </div>
            </div>
          )}

          <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <h2 className="font-display text-lg font-semibold text-slate-900">
                Select Payment Method
              </h2>
              <button
                type="button"
                onClick={fillSampleDetails}
                className="text-xs font-semibold text-blue-700 hover:underline cursor-pointer"
              >
                Auto-fill Sample {method}
              </button>
            </div>

            {/* Method Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
              {PAYMENT_METHODS.map((item) => {
                const Icon = item.icon;
                const active = method === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setMethod(item.id);
                      setErrors({});
                      setGatewayFailureMsg('');
                    }}
                    className={`flex items-center justify-center gap-2 px-3 py-2.5 text-xs sm:text-sm font-medium rounded-lg border transition-colors cursor-pointer ${
                      active
                        ? 'bg-blue-50 border-blue-600 text-blue-800 font-semibold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Payment Method Inputs */}
            <div className="mt-5 space-y-4">
              {method === 'UPI' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    UPI ID / VPA
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => {
                      setUpiId(e.target.value);
                      setErrors((prev) => ({ ...prev, upiId: '' }));
                    }}
                    placeholder="e.g., name@okaxis"
                    className={`w-full px-3 py-2.5 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                      errors.upiId ? 'border-red-500' : 'border-slate-300'
                    }`}
                  />
                  {errors.upiId && (
                    <p className="text-xs text-red-600 mt-1">{errors.upiId}</p>
                  )}
                </div>
              )}

              {(method === 'Debit Card' || method === 'Credit Card') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {method} Number (16 digits)
                    </label>
                    <input
                      type="text"
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => {
                        setCardNumber(e.target.value);
                        setErrors((prev) => ({ ...prev, cardNumber: '' }));
                      }}
                      placeholder="4532 1234 5678 9012"
                      className={`w-full px-3 py-2.5 text-sm font-mono bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                        errors.cardNumber ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                    {errors.cardNumber && (
                      <p className="text-xs text-red-600 mt-1">{errors.cardNumber}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => {
                        setCardHolder(e.target.value);
                        setErrors((prev) => ({ ...prev, cardHolder: '' }));
                      }}
                      placeholder="Name printed on card"
                      className={`w-full px-3 py-2.5 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                        errors.cardHolder ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                    {errors.cardHolder && (
                      <p className="text-xs text-red-600 mt-1">{errors.cardHolder}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Expiry Date (MM/YY)
                    </label>
                    <input
                      type="text"
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => {
                        setCardExpiry(e.target.value);
                        setErrors((prev) => ({ ...prev, cardExpiry: '' }));
                      }}
                      placeholder="08/29"
                      className={`w-full px-3 py-2.5 text-sm font-mono bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                        errors.cardExpiry ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                    {errors.cardExpiry && (
                      <p className="text-xs text-red-600 mt-1">{errors.cardExpiry}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      CVV (3 digits)
                    </label>
                    <input
                      type="password"
                      maxLength={3}
                      value={cardCvv}
                      onChange={(e) => {
                        setCardCvv(e.target.value);
                        setErrors((prev) => ({ ...prev, cardCvv: '' }));
                      }}
                      placeholder="***"
                      className={`w-full px-3 py-2.5 text-sm font-mono bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                        errors.cardCvv ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                    {errors.cardCvv && (
                      <p className="text-xs text-red-600 mt-1">{errors.cardCvv}</p>
                    )}
                  </div>
                </div>
              )}

              {method === 'Net Banking' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Select Bank
                    </label>
                    <select
                      value={bankName}
                      onChange={(e) => {
                        setBankName(e.target.value);
                        setErrors((prev) => ({ ...prev, bankName: '' }));
                      }}
                      className={`w-full px-3 py-2.5 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                        errors.bankName ? 'border-red-500' : 'border-slate-300'
                      }`}
                    >
                      <option value="">Choose bank</option>
                      <option value="State Bank of India">State Bank of India</option>
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="Punjab National Bank">Punjab National Bank</option>
                    </select>
                    {errors.bankName && (
                      <p className="text-xs text-red-600 mt-1">{errors.bankName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Customer / User ID
                    </label>
                    <input
                      type="text"
                      value={netBankingUserId}
                      onChange={(e) => {
                        setNetBankingUserId(e.target.value);
                        setErrors((prev) => ({ ...prev, netBankingUserId: '' }));
                      }}
                      placeholder="e.g., RAILUSER01"
                      className={`w-full px-3 py-2.5 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                        errors.netBankingUserId ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                    {errors.netBankingUserId && (
                      <p className="text-xs text-red-600 mt-1">{errors.netBankingUserId}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Testing Simulation Control */}
            <div className="mt-6 pt-5 border-t border-slate-200">
              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
                Gateway Outcome Simulation (For Testing)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`flex items-center gap-2.5 p-3 rounded-lg border text-sm cursor-pointer ${
                    simulateOutcome === 'success'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-medium'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="simOutcome"
                    checked={simulateOutcome === 'success'}
                    onChange={() => setSimulateOutcome('success')}
                  />
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Simulate Success</span>
                </label>

                <label
                  className={`flex items-center gap-2.5 p-3 rounded-lg border text-sm cursor-pointer ${
                    simulateOutcome === 'failure'
                      ? 'bg-red-50 border-red-500 text-red-900 font-medium'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="simOutcome"
                    checked={simulateOutcome === 'failure'}
                    onChange={() => setSimulateOutcome('failure')}
                  />
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Simulate Failure</span>
                </label>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-500 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                Demo payment simulation · No real charge
              </span>
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              >
                {isProcessing
                  ? 'Processing Payment...'
                  : `Confirm Payment (₹${fare.totalAmount.toLocaleString('en-IN')})`}
              </button>
            </div>
          </section>
        </form>

        {/* Right: Booking & Passenger Summary */}
        <aside className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-5">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900 pb-3 border-b border-slate-200">
              Booking Summary
            </h2>
            <p className="font-mono text-xs font-semibold text-blue-700 mt-3">
              #{train.trainNumber} · {CLASS_LABELS[travelClass]}
            </p>
            <p className="font-display text-base font-bold text-slate-900 mt-0.5">
              {train.trainName}
            </p>
            <p className="text-sm text-slate-600 mt-1">
              {fromSt?.name} ({train.sourceCode}) → {toSt?.name} ({train.destinationCode})
            </p>
            <p className="text-xs text-slate-500 mt-1 tabular-nums">
              {searchParams.date} · {train.departureTime} to {train.arrivalTime} ({train.duration})
            </p>
          </div>

          <div className="pt-3 border-t border-slate-200">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
              Passengers ({passengers.length})
            </h3>
            <ul className="space-y-1.5 text-sm">
              {passengers.map((p, idx) => (
                <li key={p.id} className="flex items-center justify-between text-slate-700">
                  <span>
                    {idx + 1}. {p.name} ({p.age} yrs, {p.gender})
                  </span>
                  <span className="text-xs text-slate-500">{p.berthPreference}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-slate-500 mt-2">
              Contact: {contactPhone} · {contactEmail}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-200 space-y-2 text-sm tabular-nums">
            <div className="flex justify-between text-slate-600">
              <span>Ticket Fare ({passengers.length} passenger{passengers.length > 1 ? 's' : ''})</span>
              <span>₹{fare.baseFareTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Convenience Fee</span>
              <span>₹{fare.convenienceFee}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>GST</span>
              <span>₹{fare.gstAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-base">
              <span>Total Amount</span>
              <span>₹{fare.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
