import { useState } from 'react';
import {
  ArrowLeftRight,
  Calendar,
  MapPin,
  Search,
  TrainFront,
} from 'lucide-react';
import { CLASS_LABELS, STATIONS, findTrainsForRoute, getStationByCode } from '../../data/trains';
import {
  Booking,
  PassengerInput,
  PaymentMethod,
  SearchParams,
  Train,
  TrainClassCode,
  User,
} from '../../types';
import {
  cancelBookingByPNR,
  getBookings,
  getCurrentUser,
  logoutUser,
  saveBooking,
} from '../../utils/storage';
import {
  assignSeatInfo,
  calculateFare,
  generatePNR,
  generateTransactionId,
  getFutureDateISO,
  validateSearchParams,
} from '../../utils/validation';
import AuthScreen from '../AuthScreen';
import BookingsAndPnrScreen from '../BookingsAndPnrScreen';
import ConfirmationScreen from '../ConfirmationScreen';
import PassengerDetailsScreen from '../PassengerDetailsScreen';
import PaymentScreen from '../PaymentScreen';
import SearchResultsScreen from '../SearchResultsScreen';

type AutTab = 'search' | 'results' | 'passengers' | 'payment' | 'confirmation' | 'pnr' | 'auth';

export default function ApplicationUnderTest() {
  const [tab, setTab] = useState<AutTab>('search');
  const [currentUser, setCurrentUser] = useState<User | null>(() => getCurrentUser());
  const [bookings, setBookings] = useState<Booking[]>(() => getBookings());

  const [from, setFrom] = useState('NDLS');
  const [to, setTo] = useState('CSMT');
  const [date, setDate] = useState(getFutureDateISO(3));
  const [travelClass, setTravelClass] = useState<TrainClassCode | 'ALL'>('ALL');
  const [searchErrors, setSearchErrors] = useState<
    Partial<Record<'from' | 'to' | 'date' | 'general', string>>
  >({});

  const [searchParams, setSearchParams] = useState<SearchParams>({
    from: 'NDLS',
    to: 'CSMT',
    date: getFutureDateISO(3),
    travelClass: 'ALL',
  });
  const [selectedTrain, setSelectedTrain] = useState<Train>(
    () => findTrainsForRoute('NDLS', 'CSMT')[0]
  );
  const [selectedClass, setSelectedClass] = useState<TrainClassCode>('3AC');
  const [passengers, setPassengers] = useState<PassengerInput[]>([
    { id: 'p-1', name: '', age: '', gender: 'Male', berthPreference: 'No Preference' },
  ]);
  const [contactPhone, setContactPhone] = useState(currentUser?.phone || '');
  const [contactEmail, setContactEmail] = useState(currentUser?.email || '');
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: SearchParams = { from, to, date, travelClass };
    const res = validateSearchParams(next);
    if (!res.valid) {
      setSearchErrors(res.errors);
      return;
    }
    setSearchErrors({});
    setSearchParams(next);
    setTab('results');
  };

  const handleUpdateSearch = (next: SearchParams) => {
    setFrom(next.from);
    setTo(next.to);
    setDate(next.date);
    setTravelClass(next.travelClass);
    setSearchParams(next);
    setTab('results');
  };

  const handleSelectTrain = (train: Train, cls: TrainClassCode) => {
    setSelectedTrain(train);
    setSelectedClass(cls);
    setTab('passengers');
  };

  const handlePassengersContinue = (
    nextPassengers: PassengerInput[],
    phone: string,
    email: string
  ) => {
    setPassengers(nextPassengers);
    setContactPhone(phone);
    setContactEmail(email);
    setTab('payment');
  };

  const handlePaymentSuccess = (method: PaymentMethod) => {
    const classInfo = selectedTrain.classes[selectedClass];
    const isWaitlisted = classInfo.status === 'WL';
    const fare = calculateFare(classInfo.fare, passengers.length, selectedClass);
    const assigned = assignSeatInfo(passengers, selectedClass, isWaitlisted);
    const fromSt = getStationByCode(selectedTrain.sourceCode);
    const toSt = getStationByCode(selectedTrain.destinationCode);

    const booking: Booking = {
      pnr: generatePNR(),
      transactionId: generateTransactionId(),
      trainNumber: selectedTrain.trainNumber,
      trainName: selectedTrain.trainName,
      trainType: selectedTrain.trainType,
      sourceCode: selectedTrain.sourceCode,
      sourceName: fromSt?.name || selectedTrain.sourceCode,
      destinationCode: selectedTrain.destinationCode,
      destinationName: toSt?.name || selectedTrain.destinationCode,
      journeyDate: searchParams.date,
      departureTime: selectedTrain.departureTime,
      arrivalTime: selectedTrain.arrivalTime,
      duration: selectedTrain.duration,
      travelClass: selectedClass,
      passengers: assigned,
      contactPhone,
      contactEmail,
      paymentMethod: method,
      baseFareTotal: fare.baseFareTotal,
      convenienceFee: fare.convenienceFee,
      gstAmount: fare.gstAmount,
      totalAmount: fare.totalAmount,
      status: isWaitlisted ? 'Waiting List' : 'Confirmed',
      bookedAt: new Date().toISOString(),
      bookedByEmail: currentUser?.email,
    };

    const updated = saveBooking(booking);
    setBookings(updated);
    setConfirmedBooking(booking);
    setTab('confirmation');
  };

  const handleCancelBooking = (pnr: string) => {
    const res = cancelBookingByPNR(pnr);
    setBookings(res.bookings);
    return { success: res.success, message: res.message };
  };

  return (
    <div className="space-y-5">
      {/* SUT Frame Banner */}
      <div className="bg-white border border-blue-200 rounded-xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0">
            <TrainFront className="w-5 h-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              System Under Test (SUT)
            </p>
            <h2 className="font-display text-base font-bold text-[#0F2942]">
              Sample Train Ticket Booking Web Application
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Interactive target application used to verify search validation, booking flows,
              payment failures, PNR generation, and cancellations.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
          {[
            { id: 'search', label: '1. Train Search' },
            { id: 'results', label: '2. Results' },
            { id: 'pnr', label: '3. PNR & Bookings' },
            { id: 'auth', label: currentUser ? `Account (${currentUser.fullName.split(' ')[0]})` : '4. Login' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id as AutTab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                tab === item.id ||
                (item.id === 'results' &&
                  (tab === 'passengers' || tab === 'payment' || tab === 'confirmation'))
                  ? 'bg-white text-blue-700 font-semibold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* SUT Viewport */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {tab === 'search' && (
          <div className="p-6 sm:p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="font-display text-xl font-bold text-[#0F2942]">
                  Train Search (AUT Entry Form)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Try clearing stations, selecting identical stations, or choosing a past date to
                  observe live validation rules.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFrom('');
                  setTo('');
                  setSearchErrors({});
                }}
                className="text-xs font-semibold text-blue-700 hover:underline cursor-pointer"
              >
                Clear Stations
              </button>
            </div>

            {searchErrors.general && (
              <div
                role="alert"
                className="mb-4 px-3.5 py-2.5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg"
              >
                {searchErrors.general}
              </div>
            )}

            <form
              onSubmit={handleSearchSubmit}
              noValidate
              className="bg-blue-50/50 border border-blue-200 rounded-xl p-5 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-11 gap-3 items-start">
                <div className="sm:col-span-5">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Source Station
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={from}
                      onChange={(e) => {
                        setFrom(e.target.value);
                        setSearchErrors((p) => ({ ...p, from: undefined, general: undefined }));
                      }}
                      className={`w-full pl-9 pr-3 py-2.5 text-sm bg-white border rounded-lg ${
                        searchErrors.from ? 'border-red-500' : 'border-slate-300'
                      }`}
                    >
                      <option value="">Select source station</option>
                      {STATIONS.map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.name} ({s.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  {searchErrors.from && (
                    <p className="text-xs text-red-600 mt-1">{searchErrors.from}</p>
                  )}
                </div>

                <div className="sm:col-span-1 flex sm:pt-6 justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setFrom(to);
                      setTo(from);
                      setSearchErrors({});
                    }}
                    aria-label="Swap stations"
                    className="w-9 h-9 rounded-lg bg-white border border-slate-300 text-blue-700 flex items-center justify-center cursor-pointer"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="sm:col-span-5">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Destination Station
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={to}
                      onChange={(e) => {
                        setTo(e.target.value);
                        setSearchErrors((p) => ({ ...p, to: undefined, general: undefined }));
                      }}
                      className={`w-full pl-9 pr-3 py-2.5 text-sm bg-white border rounded-lg ${
                        searchErrors.to ? 'border-red-500' : 'border-slate-300'
                      }`}
                    >
                      <option value="">Select destination station</option>
                      {STATIONS.map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.name} ({s.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  {searchErrors.to && (
                    <p className="text-xs text-red-600 mt-1">{searchErrors.to}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                <div className="sm:col-span-5">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Journey Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => {
                        setDate(e.target.value);
                        setSearchErrors((p) => ({ ...p, date: undefined }));
                      }}
                      className={`w-full pl-9 pr-3 py-2.5 text-sm bg-white border rounded-lg tabular-nums ${
                        searchErrors.date ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                  </div>
                  {searchErrors.date && (
                    <p className="text-xs text-red-600 mt-1">{searchErrors.date}</p>
                  )}
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Travel Class
                  </label>
                  <select
                    value={travelClass}
                    onChange={(e) => setTravelClass(e.target.value as TrainClassCode | 'ALL')}
                    className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg"
                  >
                    <option value="ALL">All Classes</option>
                    {(['SL', '3AC', '2AC', '1AC'] as TrainClassCode[]).map((c) => (
                      <option key={c} value={c}>
                        {CLASS_LABELS[c]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3 sm:pt-5">
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search Trains</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {tab === 'results' && (
          <SearchResultsScreen
            searchParams={searchParams}
            onUpdateSearch={handleUpdateSearch}
            onSelectTrain={handleSelectTrain}
          />
        )}

        {tab === 'passengers' && (
          <PassengerDetailsScreen
            train={selectedTrain}
            travelClass={selectedClass}
            searchParams={searchParams}
            initialPassengers={passengers}
            initialPhone={contactPhone}
            initialEmail={contactEmail}
            onBack={() => setTab('results')}
            onContinue={handlePassengersContinue}
          />
        )}

        {tab === 'payment' && (
          <PaymentScreen
            train={selectedTrain}
            travelClass={selectedClass}
            searchParams={searchParams}
            passengers={passengers}
            contactPhone={contactPhone}
            contactEmail={contactEmail}
            onBack={() => setTab('passengers')}
            onPaymentSuccess={handlePaymentSuccess}
          />
        )}

        {tab === 'confirmation' && confirmedBooking && (
          <ConfirmationScreen
            booking={confirmedBooking}
            onGoToBookings={() => setTab('pnr')}
            onBookAnother={() => setTab('search')}
          />
        )}

        {tab === 'pnr' && (
          <BookingsAndPnrScreen
            mode="bookings"
            bookings={bookings}
            onCancelBooking={handleCancelBooking}
            onBookNow={() => setTab('search')}
          />
        )}

        {tab === 'auth' && (
          <AuthScreen
            currentUser={currentUser}
            onAuthSuccess={(u) => {
              setCurrentUser(u);
              setContactPhone(u.phone);
              setContactEmail(u.email);
            }}
            onLogout={() => {
              logoutUser();
              setCurrentUser(null);
            }}
            onContinueBooking={() => setTab('search')}
          />
        )}
      </div>
    </div>
  );
}
