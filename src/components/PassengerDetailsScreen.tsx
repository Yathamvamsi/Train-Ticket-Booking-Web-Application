import { useState } from 'react';
import { ArrowLeft, ArrowRight, Plus, Trash2, UserPlus } from 'lucide-react';
import { CLASS_LABELS, getStationByCode } from '../data/trains';
import {
  BerthPreference,
  Gender,
  PassengerInput,
  SearchParams,
  Train,
  TrainClassCode,
} from '../types';
import {
  ContactErrors,
  PassengerError,
  calculateFare,
  validateContact,
  validatePassenger,
} from '../utils/validation';

interface PassengerDetailsScreenProps {
  train: Train;
  travelClass: TrainClassCode;
  searchParams: SearchParams;
  initialPassengers: PassengerInput[];
  initialPhone: string;
  initialEmail: string;
  onBack: () => void;
  onContinue: (passengers: PassengerInput[], phone: string, email: string) => void;
}

const BERTH_OPTIONS: BerthPreference[] = [
  'No Preference',
  'Lower',
  'Middle',
  'Upper',
  'Side Lower',
  'Side Upper',
];

export default function PassengerDetailsScreen({
  train,
  travelClass,
  searchParams,
  initialPassengers,
  initialPhone,
  initialEmail,
  onBack,
  onContinue,
}: PassengerDetailsScreenProps) {
  const [passengers, setPassengers] = useState<PassengerInput[]>(
    initialPassengers.length > 0
      ? initialPassengers
      : [
          {
            id: 'p-1',
            name: '',
            age: '',
            gender: 'Male',
            berthPreference: 'No Preference',
          },
        ]
  );
  const [phone, setPhone] = useState(initialPhone);
  const [email, setEmail] = useState(initialEmail);

  const [passengerErrors, setPassengerErrors] = useState<Record<string, PassengerError>>({});
  const [contactErrors, setContactErrors] = useState<ContactErrors>({});
  const [formBannerError, setFormBannerError] = useState('');

  const classInfo = train.classes[travelClass];
  const fare = calculateFare(classInfo.fare, passengers.length, travelClass);
  const fromSt = getStationByCode(train.sourceCode);
  const toSt = getStationByCode(train.destinationCode);

  const addPassenger = () => {
    if (passengers.length >= 6) return;
    setPassengers((prev) => [
      ...prev,
      {
        id: `p-${Date.now()}-${prev.length + 1}`,
        name: '',
        age: '',
        gender: 'Male',
        berthPreference: 'No Preference',
      },
    ]);
  };

  const removePassenger = (id: string) => {
    if (passengers.length <= 1) return;
    setPassengers((prev) => prev.filter((p) => p.id !== id));
    setPassengerErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const updatePassenger = <K extends keyof PassengerInput>(
    id: string,
    field: K,
    value: PassengerInput[K]
  ) => {
    setPassengers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
    if (field === 'name' || field === 'age') {
      setPassengerErrors((prev) => ({
        ...prev,
        [id]: { ...prev[id], [field]: undefined },
      }));
    }
    setFormBannerError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextPErrors: Record<string, PassengerError> = {};
    let hasError = false;

    passengers.forEach((p) => {
      const err = validatePassenger(p);
      if (Object.keys(err).length > 0) {
        nextPErrors[p.id] = err;
        hasError = true;
      }
    });

    const nextCErrors = validateContact(phone, email);
    if (Object.keys(nextCErrors).length > 0) {
      hasError = true;
    }

    setPassengerErrors(nextPErrors);
    setContactErrors(nextCErrors);

    if (hasError) {
      setFormBannerError('Please fix the highlighted passenger or contact details before continuing.');
      return;
    }

    setFormBannerError('');
    onContinue(passengers, phone.trim(), email.trim());
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
          <span>Back to Train Search Results</span>
        </button>
        <h1 className="font-display text-2xl font-bold text-slate-900 mt-2">
          Passenger &amp; Contact Details
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Passenger & Contact Form */}
        <form onSubmit={handleSubmit} noValidate className="lg:col-span-8 space-y-6">
          {formBannerError && (
            <div
              role="alert"
              className="px-4 py-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg"
            >
              {formBannerError}
            </div>
          )}

          {/* Passengers Card */}
          <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <h2 className="font-display text-lg font-semibold text-slate-900">
                  Passenger Information
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Add up to 6 passengers per ticket booking ({passengers.length}/6 added)
                </p>
              </div>
              <button
                type="button"
                onClick={addPassenger}
                disabled={passengers.length >= 6}
                className="px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Passenger</span>
              </button>
            </div>

            <div className="divide-y divide-slate-200">
              {passengers.map((p, index) => {
                const errs = passengerErrors[p.id] || {};
                return (
                  <div key={p.id} className="py-5 first:pt-5 last:pb-1">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                        <UserPlus className="w-4 h-4 text-blue-700" />
                        Passenger {index + 1}
                      </span>
                      {passengers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePassenger(p.id)}
                          className="text-xs font-medium text-red-600 hover:text-red-700 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                      {/* Full Name */}
                      <div className="sm:col-span-5">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={p.name}
                          onChange={(e) => updatePassenger(p.id, 'name', e.target.value)}
                          placeholder="e.g., Aarav Sharma"
                          className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                            errs.name ? 'border-red-500' : 'border-slate-300'
                          }`}
                        />
                        {errs.name && (
                          <p className="text-xs text-red-600 mt-1">{errs.name}</p>
                        )}
                      </div>

                      {/* Age */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Age
                        </label>
                        <input
                          type="number"
                          value={p.age}
                          onChange={(e) => updatePassenger(p.id, 'age', e.target.value)}
                          placeholder="1–120"
                          className={`w-full px-3 py-2 text-sm bg-white border rounded-lg tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                            errs.age ? 'border-red-500' : 'border-slate-300'
                          }`}
                        />
                        {errs.age && (
                          <p className="text-xs text-red-600 mt-1">{errs.age}</p>
                        )}
                      </div>

                      {/* Gender */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Gender
                        </label>
                        <select
                          value={p.gender}
                          onChange={(e) =>
                            updatePassenger(p.id, 'gender', e.target.value as Gender)
                          }
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      {/* Berth Preference */}
                      <div className="sm:col-span-3">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Berth Preference
                        </label>
                        <select
                          value={p.berthPreference}
                          onChange={(e) =>
                            updatePassenger(
                              p.id,
                              'berthPreference',
                              e.target.value as BerthPreference
                            )
                          }
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        >
                          {BERTH_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Contact Details Card */}
          <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold text-slate-900 pb-3 border-b border-slate-200">
              Contact Information
            </h2>
            <p className="text-xs text-slate-500 mt-2 mb-4">
              Your e-ticket and PNR updates will be associated with these contact details.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="contact-phone"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Mobile Number (10 digits)
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setContactErrors((prev) => ({ ...prev, phone: undefined }));
                    setFormBannerError('');
                  }}
                  placeholder="e.g., 9876543210"
                  className={`w-full px-3 py-2 text-sm bg-white border rounded-lg tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                    contactErrors.phone ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                {contactErrors.phone && (
                  <p className="text-xs text-red-600 mt-1">{contactErrors.phone}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="contact-email"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Email Address
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setContactErrors((prev) => ({ ...prev, email: undefined }));
                    setFormBannerError('');
                  }}
                  placeholder="e.g., passenger@example.com"
                  className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                    contactErrors.email ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                {contactErrors.email && (
                  <p className="text-xs text-red-600 mt-1">{contactErrors.email}</p>
                )}
              </div>
            </div>
          </section>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={onBack}
              className="w-full sm:w-auto px-5 py-2.5 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg cursor-pointer"
            >
              Back to Results
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Continue to Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Right: Journey & Fare Summary */}
        <aside className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
          <h2 className="font-display text-base font-semibold text-slate-900 pb-3 border-b border-slate-200">
            Journey Summary
          </h2>

          <div>
            <p className="font-mono text-xs font-semibold text-blue-700">
              Train #{train.trainNumber} · {train.trainType}
            </p>
            <p className="font-display text-base font-bold text-slate-900 mt-0.5">
              {train.trainName}
            </p>
            <p className="text-sm text-slate-600 mt-2">
              {fromSt?.name} ({train.sourceCode}) → {toSt?.name} ({train.destinationCode})
            </p>
            <p className="text-xs text-slate-500 mt-1 tabular-nums">
              Date: {searchParams.date} · {train.departureTime} – {train.arrivalTime} ({train.duration})
            </p>
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-600">Selected Class</span>
              <span className="font-semibold text-slate-900">
                {CLASS_LABELS[travelClass]}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-slate-600">Availability</span>
              <span
                className={`font-semibold ${
                  classInfo.status === 'WL' ? 'text-amber-700' : 'text-emerald-700'
                }`}
              >
                {classInfo.status === 'WL'
                  ? `Waiting List (WL ${classInfo.seats})`
                  : `Available (${classInfo.seats} seats)`}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 space-y-2 text-sm tabular-nums">
            <div className="flex justify-between text-slate-600">
              <span>
                Base Fare ({passengers.length} × ₹{classInfo.fare.toLocaleString('en-IN')})
              </span>
              <span>₹{fare.baseFareTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Convenience Fee</span>
              <span>₹{fare.convenienceFee}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>GST (5% on AC)</span>
              <span>₹{fare.gstAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-base">
              <span>Total Payable</span>
              <span>₹{fare.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
