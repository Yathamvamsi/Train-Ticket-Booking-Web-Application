import { useMemo, useState } from 'react';
import {
  ArrowLeftRight,
  ArrowRight,
  Clock,
  Filter,
  RotateCcw,
  Search,
  TrainFront,
} from 'lucide-react';
import { CLASS_LABELS, STATIONS, findTrainsForRoute, getStationByCode } from '../data/trains';
import { SearchParams, Train, TrainClassCode, TrainType } from '../types';
import { validateSearchParams } from '../utils/validation';

interface SearchResultsScreenProps {
  searchParams: SearchParams;
  onUpdateSearch: (params: SearchParams) => void;
  onSelectTrain: (train: Train, travelClass: TrainClassCode) => void;
}

type DepartureSlot = 'ALL' | 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';

const TRAIN_TYPES: TrainType[] = [
  'Rajdhani',
  'Shatabdi',
  'Vande Bharat',
  'Superfast',
  'Express',
];

const CLASS_CODES: TrainClassCode[] = ['SL', '3AC', '2AC', '1AC'];

function getDepartureSlot(time: string): DepartureSlot {
  const hour = Number(time.split(':')[0]);
  if (hour >= 6 && hour < 12) return 'MORNING';
  if (hour >= 12 && hour < 18) return 'AFTERNOON';
  if (hour >= 18 && hour < 24) return 'EVENING';
  return 'NIGHT';
}

export default function SearchResultsScreen({
  searchParams,
  onUpdateSearch,
  onSelectTrain,
}: SearchResultsScreenProps) {
  const [from, setFrom] = useState(searchParams.from);
  const [to, setTo] = useState(searchParams.to);
  const [date, setDate] = useState(searchParams.date);
  const [searchError, setSearchError] = useState('');

  // Filters
  const [selectedTypes, setSelectedTypes] = useState<TrainType[]>([]);
  const [departureSlot, setDepartureSlot] = useState<DepartureSlot>('ALL');
  const [classFilter, setClassFilter] = useState<TrainClassCode | 'ALL'>(
    searchParams.travelClass
  );

  // Per-train selected class
  const [chosenClassMap, setChosenClassMap] = useState<Record<string, TrainClassCode>>({});

  const allTrains = useMemo(
    () => findTrainsForRoute(searchParams.from, searchParams.to),
    [searchParams.from, searchParams.to]
  );

  const filteredTrains = useMemo(() => {
    return allTrains.filter((train) => {
      if (selectedTypes.length > 0 && !selectedTypes.includes(train.trainType)) {
        return false;
      }
      if (departureSlot !== 'ALL' && getDepartureSlot(train.departureTime) !== departureSlot) {
        return false;
      }
      if (classFilter !== 'ALL') {
        const cls = train.classes[classFilter];
        if (!cls || cls.status === 'NOT_AVAILABLE') return false;
      }
      return true;
    });
  }, [allTrains, selectedTypes, departureSlot, classFilter]);

  const toggleTrainType = (type: TrainType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const resetFilters = () => {
    setSelectedTypes([]);
    setDepartureSlot('ALL');
    setClassFilter('ALL');
  };

  const handleModifySearch = (e: React.FormEvent) => {
    e.preventDefault();
    const next: SearchParams = {
      from,
      to,
      date,
      travelClass: classFilter,
    };
    const res = validateSearchParams(next);
    if (!res.valid) {
      setSearchError(
        res.errors.general ||
          res.errors.from ||
          res.errors.to ||
          res.errors.date ||
          'Invalid search criteria.'
      );
      return;
    }
    setSearchError('');
    onUpdateSearch(next);
  };

  const getDefaultClassForTrain = (train: Train): TrainClassCode => {
    const manual = chosenClassMap[train.trainNumber];
    if (manual && train.classes[manual].status !== 'NOT_AVAILABLE') {
      return manual;
    }
    if (
      classFilter !== 'ALL' &&
      train.classes[classFilter].status !== 'NOT_AVAILABLE'
    ) {
      return classFilter;
    }
    const firstAvailable = CLASS_CODES.find(
      (code) => train.classes[code].status !== 'NOT_AVAILABLE'
    );
    return firstAvailable || '3AC';
  };

  const fromStation = getStationByCode(searchParams.from);
  const toStation = getStationByCode(searchParams.to);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Modify Search Bar */}
      <form
        onSubmit={handleModifySearch}
        className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 mb-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-slate-600 mb-1">From</label>
            <select
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setSearchError('');
              }}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Select source</option>
              {STATIONS.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-1 flex justify-center">
            <button
              type="button"
              onClick={() => {
                setFrom(to);
                setTo(from);
                setSearchError('');
              }}
              aria-label="Swap stations"
              className="w-9 h-9 rounded-lg border border-slate-300 text-blue-700 hover:bg-blue-50 flex items-center justify-center cursor-pointer"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-slate-600 mb-1">To</label>
            <select
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setSearchError('');
              }}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Select destination</option>
              {STATIONS.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Journey Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setSearchError('');
              }}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Modify</span>
            </button>
          </div>
        </div>
        {searchError && (
          <p role="alert" className="text-xs text-red-600 mt-2.5">
            {searchError}
          </p>
        )}
      </form>

      {/* Route Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            {fromStation?.name || searchParams.from} ({searchParams.from}) →{' '}
            {toStation?.name || searchParams.to} ({searchParams.to})
          </h1>
          <p className="text-sm text-slate-600 mt-0.5 tabular-nums">
            Journey Date: {searchParams.date} · {filteredTrains.length} of {allTrains.length}{' '}
            trains shown
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="font-display text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-700" />
              <span>Filter Trains</span>
            </h2>
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-medium text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Ticket Class Filter */}
          <div className="mt-4">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2.5">
              Ticket Class
            </h3>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="classFilter"
                  checked={classFilter === 'ALL'}
                  onChange={() => setClassFilter('ALL')}
                  className="text-blue-700"
                />
                <span>All Classes</span>
              </label>
              {CLASS_CODES.map((code) => (
                <label
                  key={code}
                  className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="classFilter"
                    checked={classFilter === code}
                    onChange={() => setClassFilter(code)}
                    className="text-blue-700"
                  />
                  <span>{CLASS_LABELS[code]}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Departure Time Filter */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2.5">
              Departure Time
            </h3>
            <div className="space-y-1.5 text-sm">
              {[
                { id: 'ALL', label: 'Any Time' },
                { id: 'MORNING', label: 'Morning (06:00 – 12:00)' },
                { id: 'AFTERNOON', label: 'Afternoon (12:00 – 18:00)' },
                { id: 'EVENING', label: 'Evening (18:00 – 24:00)' },
                { id: 'NIGHT', label: 'Night (00:00 – 06:00)' },
              ].map((slot) => (
                <label
                  key={slot.id}
                  className="flex items-center gap-2 text-slate-700 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="depSlot"
                    checked={departureSlot === slot.id}
                    onChange={() => setDepartureSlot(slot.id as DepartureSlot)}
                  />
                  <span>{slot.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Train Type Filter */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2.5">
              Train Type
            </h3>
            <div className="space-y-1.5 text-sm">
              {TRAIN_TYPES.map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-2 text-slate-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(type)}
                    onChange={() => toggleTrainType(type)}
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Train Results List */}
        <div className="lg:col-span-9 space-y-4">
          {filteredTrains.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
              <TrainFront className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="font-display text-lg font-semibold text-slate-900">
                No trains match your selected filters
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Try clearing train type, departure time, or class filters to view all available
                trains on this route.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredTrains.map((train) => {
              const selectedClass = getDefaultClassForTrain(train);
              const activeClassInfo = train.classes[selectedClass];

              return (
                <article
                  key={train.trainNumber}
                  className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6"
                >
                  {/* Top Row: Train Identity & Schedule */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-mono font-semibold text-blue-700">
                          #{train.trainNumber}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{train.trainType}</span>
                        <span aria-hidden="true">·</span>
                        <span>Runs: {train.runningDays.join(', ')}</span>
                      </div>
                      <h2 className="font-display text-lg font-bold text-slate-900 mt-1">
                        {train.trainName}
                      </h2>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6 tabular-nums">
                      <div>
                        <div className="text-lg font-bold text-slate-900">
                          {train.departureTime}
                        </div>
                        <div className="text-xs text-slate-500">{train.sourceCode}</div>
                      </div>

                      <div className="flex flex-col items-center text-xs text-slate-500 px-2">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {train.duration}
                        </span>
                        <span className="w-20 h-px bg-slate-300 my-1" />
                      </div>

                      <div>
                        <div className="text-lg font-bold text-slate-900">
                          {train.arrivalTime}
                        </div>
                        <div className="text-xs text-slate-500">{train.destinationCode}</div>
                      </div>
                    </div>
                  </div>

                  {/* Classes Grid + Book CTA */}
                  <div className="mt-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 flex-1">
                      {CLASS_CODES.map((code) => {
                        const cls = train.classes[code];
                        const isUnavailable = cls.status === 'NOT_AVAILABLE';
                        const isSelected = selectedClass === code && !isUnavailable;

                        return (
                          <button
                            key={code}
                            type="button"
                            disabled={isUnavailable}
                            onClick={() =>
                              setChosenClassMap((prev) => ({
                                ...prev,
                                [train.trainNumber]: code,
                              }))
                            }
                            className={`text-left p-3 rounded-lg border transition-colors ${
                              isUnavailable
                                ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                                : isSelected
                                  ? 'bg-blue-50 border-blue-600 text-slate-900 cursor-pointer'
                                  : 'bg-white border-slate-200 hover:border-blue-300 cursor-pointer'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-mono text-xs font-bold">{code}</span>
                              {!isUnavailable && (
                                <span className="text-sm font-bold tabular-nums text-slate-900">
                                  ₹{cls.fare.toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>
                            <div className="mt-1 text-xs font-medium tabular-nums">
                              {cls.status === 'AVAILABLE' && (
                                <span className="text-emerald-700">AVL {cls.seats}</span>
                              )}
                              {cls.status === 'WL' && (
                                <span className="text-amber-700">WL {cls.seats}</span>
                              )}
                              {cls.status === 'NOT_AVAILABLE' && (
                                <span className="text-slate-400">Not Available</span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="shrink-0 flex flex-col items-stretch sm:items-end gap-1">
                      <button
                        type="button"
                        onClick={() => onSelectTrain(train, selectedClass)}
                        className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <span>Book {selectedClass}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <span className="text-xs text-slate-500 tabular-nums text-center sm:text-right">
                        Fare: ₹{activeClassInfo.fare.toLocaleString('en-IN')} / passenger
                      </span>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
