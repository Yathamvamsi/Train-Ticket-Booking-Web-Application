import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  Search,
  Ticket,
  X,
  XCircle,
} from 'lucide-react';
import { CLASS_LABELS } from '../data/trains';
import { Booking, BookingStatus } from '../types';
import { downloadTicketFile } from '../utils/ticketDownload';
import { validatePNR } from '../utils/validation';

interface BookingsAndPnrScreenProps {
  mode: 'bookings' | 'pnr';
  bookings: Booking[];
  initialPnrQuery?: string;
  onCancelBooking: (pnr: string) => { success: boolean; message: string };
  onBookNow: () => void;
}

function StatusBadge({ status }: { status: BookingStatus }) {
  if (status === 'Confirmed') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Confirmed</span>
      </span>
    );
  }
  if (status === 'Waiting List') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700">
        <Clock className="w-4 h-4 text-amber-600 shrink-0" />
        <span>Waiting List</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700">
      <XCircle className="w-4 h-4 text-red-600 shrink-0" />
      <span>Cancelled</span>
    </span>
  );
}

export default function BookingsAndPnrScreen({
  mode,
  bookings,
  initialPnrQuery = '',
  onCancelBooking,
  onBookNow,
}: BookingsAndPnrScreenProps) {
  const [pnrInput, setPnrInput] = useState(initialPnrQuery);
  const [pnrError, setPnrError] = useState('');
  const [pnrResult, setPnrResult] = useState<Booking | null>(null);
  const [hasSearchedPnr, setHasSearchedPnr] = useState(false);

  const [statusFilter, setStatusFilter] = useState<'ALL' | BookingStatus>('ALL');
  const [viewTicket, setViewTicket] = useState<Booking | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    if (initialPnrQuery) {
      setPnrInput(initialPnrQuery);
      const found = bookings.find((b) => b.pnr === initialPnrQuery);
      setPnrResult(found || null);
      setHasSearchedPnr(true);
      setPnrError(found ? '' : `No booking found for PNR ${initialPnrQuery}.`);
    }
  }, [initialPnrQuery, bookings]);

  const handlePnrLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setActionFeedback(null);
    const check = validatePNR(pnrInput);
    if (!check.valid) {
      setPnrError(check.error || 'Invalid PNR.');
      setPnrResult(null);
      setHasSearchedPnr(false);
      return;
    }

    const cleaned = pnrInput.trim();
    const match = bookings.find((b) => b.pnr === cleaned) || null;
    setHasSearchedPnr(true);
    setPnrResult(match);
    if (!match) {
      setPnrError(`No reservation found with PNR ${cleaned}.`);
    } else {
      setPnrError('');
    }
  };

  const quickLookup = (samplePnr: string) => {
    setPnrInput(samplePnr);
    const match = bookings.find((b) => b.pnr === samplePnr) || null;
    setHasSearchedPnr(true);
    setPnrResult(match);
    setPnrError(match ? '' : `No reservation found with PNR ${samplePnr}.`);
    setActionFeedback(null);
  };

  const confirmCancel = () => {
    if (!cancelTarget) return;
    const res = onCancelBooking(cancelTarget.pnr);
    setActionFeedback({
      type: res.success ? 'success' : 'error',
      text: res.message,
    });
    if (pnrResult && pnrResult.pnr === cancelTarget.pnr) {
      const updated = bookings.find((b) => b.pnr === cancelTarget.pnr);
      if (updated) {
        setPnrResult({ ...updated, status: 'Cancelled' });
      }
    }
    setCancelTarget(null);
  };

  const filteredBookings = bookings.filter((b) =>
    statusFilter === 'ALL' ? true : b.status === statusFilter
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            {mode === 'pnr' ? 'PNR Status Enquiry' : 'My Bookings & PNR Lookup'}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {mode === 'pnr'
              ? 'Check real-time reservation status, coach/seat details, or manage cancellations by 10-digit PNR.'
              : 'View your booked train tickets, download e-tickets, search by PNR, or cancel reservations.'}
          </p>
        </div>
        <button
          type="button"
          onClick={onBookNow}
          className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
        >
          Book New Ticket
        </button>
      </div>

      {actionFeedback && (
        <div
          role="status"
          className={`px-4 py-3 rounded-xl border text-sm flex items-center justify-between gap-3 ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <span>{actionFeedback.text}</span>
          <button
            type="button"
            onClick={() => setActionFeedback(null)}
            className="p-1 hover:opacity-75 cursor-pointer"
            aria-label="Dismiss message"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* PNR Search Panel */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900">
              Search by 10-Digit PNR Number
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-500">
              <span>Sample PNRs:</span>
              {bookings.slice(0, 3).map((b) => (
                <button
                  key={b.pnr}
                  type="button"
                  onClick={() => quickLookup(b.pnr)}
                  className="font-mono text-blue-700 hover:underline cursor-pointer"
                >
                  {b.pnr} ({b.status})
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handlePnrLookup} noValidate className="flex flex-col sm:flex-row gap-2 sm:w-[440px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                maxLength={10}
                value={pnrInput}
                onChange={(e) => {
                  setPnrInput(e.target.value);
                  setPnrError('');
                }}
                placeholder="Enter 10-digit PNR"
                className={`w-full pl-9 pr-3 py-2 text-sm font-mono bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                  pnrError ? 'border-red-500' : 'border-slate-300'
                }`}
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg whitespace-nowrap cursor-pointer"
            >
              Get PNR Status
            </button>
          </form>
        </div>

        {pnrError && (
          <p role="alert" className="text-xs text-red-600 mt-2.5">
            {pnrError}
          </p>
        )}

        {hasSearchedPnr && pnrResult && (
          <div className="mt-5 pt-5 border-t border-slate-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-blue-50/50 border border-blue-200 rounded-xl p-4 sm:p-5">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-sm font-bold text-slate-900">
                    PNR: {pnrResult.pnr}
                  </span>
                  <span aria-hidden="true" className="text-slate-300">
                    |
                  </span>
                  <StatusBadge status={pnrResult.status} />
                </div>
                <p className="font-display text-base font-bold text-slate-900 mt-1.5">
                  #{pnrResult.trainNumber} · {pnrResult.trainName}
                </p>
                <p className="text-sm text-slate-600 mt-0.5 tabular-nums">
                  {pnrResult.sourceName} ({pnrResult.sourceCode}) → {pnrResult.destinationName} (
                  {pnrResult.destinationCode}) · Date: {pnrResult.journeyDate} · Class:{' '}
                  {pnrResult.travelClass}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewTicket(pnrResult)}
                  className="px-3.5 py-2 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Ticket</span>
                </button>
                <button
                  type="button"
                  disabled={pnrResult.status === 'Cancelled'}
                  onClick={() => setCancelTarget(pnrResult)}
                  className="px-3.5 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 disabled:bg-slate-200 disabled:text-slate-500 text-white rounded-lg cursor-pointer disabled:cursor-not-allowed"
                >
                  {pnrResult.status === 'Cancelled' ? 'Already Cancelled' : 'Cancel Ticket'}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Booked Tickets List */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="font-display text-lg font-bold text-slate-900">
            Reservation History ({filteredBookings.length})
          </h2>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 overflow-x-auto">
            {(['ALL', 'Confirmed', 'Waiting List', 'Cancelled'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  statusFilter === tab
                    ? 'bg-white text-blue-700 font-semibold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab === 'ALL' ? 'All Bookings' : tab}
              </button>
            ))}
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
            <Ticket className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="font-display text-base font-semibold text-slate-900">
              No bookings in this category
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Book a new train ticket or switch status filters to view existing reservations.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <article
                key={booking.pnr}
                className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className="font-mono font-bold text-slate-900">
                        PNR: {booking.pnr}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">
                        ·
                      </span>
                      <StatusBadge status={booking.status} />
                      <span aria-hidden="true" className="text-slate-300">
                        ·
                      </span>
                      <span className="text-slate-500 tabular-nums">
                        Booked {new Date(booking.bookedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-display text-lg font-bold text-slate-900">
                      #{booking.trainNumber} · {booking.trainName}
                    </h3>

                    <p className="text-sm text-slate-600 tabular-nums">
                      {booking.sourceName} ({booking.sourceCode}) → {booking.destinationName} (
                      {booking.destinationCode}) · Journey: <strong>{booking.journeyDate}</strong>{' '}
                      · {booking.departureTime}–{booking.arrivalTime}
                    </p>

                    <p className="text-xs text-slate-500 tabular-nums">
                      Class: {CLASS_LABELS[booking.travelClass]} · Passengers:{' '}
                      {booking.passengers.length} · Amount:{' '}
                      <strong className="text-slate-800">
                        ₹{booking.totalAmount.toLocaleString('en-IN')}
                      </strong>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setViewTicket(booking)}
                      className="px-3.5 py-2 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Ticket</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => downloadTicketFile(booking)}
                      className="px-3.5 py-2 text-xs font-semibold bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-800 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>

                    <button
                      type="button"
                      disabled={booking.status === 'Cancelled'}
                      onClick={() => setCancelTarget(booking)}
                      className="px-3.5 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
                    >
                      {booking.status === 'Cancelled' ? 'Cancelled' : 'Cancel Ticket'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* View Ticket Modal */}
      {viewTicket && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Ticket Details"
          className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4"
        >
          <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 bg-blue-700 text-white flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-blue-100">PNR: {viewTicket.pnr}</p>
                <h3 className="font-display text-lg font-bold">
                  #{viewTicket.trainNumber} · {viewTicket.trainName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewTicket(null)}
                className="p-1.5 rounded-lg hover:bg-blue-600 cursor-pointer"
                aria-label="Close ticket modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200">
                <div className="text-sm text-slate-700 tabular-nums">
                  {viewTicket.sourceName} ({viewTicket.sourceCode}) → {viewTicket.destinationName} (
                  {viewTicket.destinationCode})
                  <div className="text-xs text-slate-500 mt-0.5">
                    Date: {viewTicket.journeyDate} · {viewTicket.departureTime} to{' '}
                    {viewTicket.arrivalTime} ({viewTicket.duration})
                  </div>
                </div>
                <StatusBadge status={viewTicket.status} />
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-xs font-semibold text-slate-600 uppercase">
                    <tr>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Age / Gender</th>
                      <th className="px-3 py-2">Coach / Seat</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {viewTicket.passengers.map((p, idx) => (
                      <tr key={`${p.name}-${idx}`}>
                        <td className="px-3 py-2.5 font-medium text-slate-900">{p.name}</td>
                        <td className="px-3 py-2.5 text-slate-600 tabular-nums">
                          {p.age} · {p.gender}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-slate-900">
                          {p.coach}-{p.seatNumber} ({p.berthAssigned})
                        </td>
                        <td className="px-3 py-2.5 text-xs font-semibold">{p.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="text-sm font-bold text-slate-900 tabular-nums">
                  Total Paid: ₹{viewTicket.totalAmount.toLocaleString('en-IN')} ({viewTicket.paymentMethod})
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => downloadTicketFile(viewTicket)}
                    className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Ticket</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewTicket(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Popup */}
      {cancelTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirm Ticket Cancellation"
          className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4"
        >
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900">
                  Confirm Ticket Cancellation
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Are you sure you want to cancel ticket{' '}
                  <strong className="font-mono text-slate-900">{cancelTarget.pnr}</strong> for{' '}
                  <strong>{cancelTarget.trainName}</strong>?
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 space-y-1 tabular-nums">
              <div>
                Route: {cancelTarget.sourceCode} → {cancelTarget.destinationCode} on{' '}
                {cancelTarget.journeyDate}
              </div>
              <div>
                Estimated Refund: <strong className="text-slate-900">₹{Math.max(0, cancelTarget.totalAmount - 60).toLocaleString('en-IN')}</strong> (after ₹60 cancellation fee)
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setCancelTarget(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg cursor-pointer"
              >
                Keep Ticket
              </button>
              <button
                type="button"
                onClick={confirmCancel}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
