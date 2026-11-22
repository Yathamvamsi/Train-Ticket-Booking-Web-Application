import { CheckCircle2, Download, ListChecks, PlusCircle } from 'lucide-react';
import { CLASS_LABELS } from '../data/trains';
import { Booking } from '../types';
import { downloadTicketFile } from '../utils/ticketDownload';

interface ConfirmationScreenProps {
  booking: Booking;
  onGoToBookings: () => void;
  onBookAnother: () => void;
}

export default function ConfirmationScreen({
  booking,
  onGoToBookings,
  onBookAnother,
}: ConfirmationScreenProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Success Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h1 className="font-display text-xl font-bold text-emerald-950">
              Booking {booking.status === 'Waiting List' ? 'Waitlisted' : 'Confirmed'}!
            </h1>
            <p className="text-sm text-emerald-800 mt-0.5">
              Your railway ticket has been generated and saved to My Bookings.
            </p>
          </div>
        </div>
        <div className="bg-white border border-emerald-200 rounded-lg px-4 py-2.5 text-left sm:text-right shrink-0">
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            PNR Number
          </span>
          <span className="font-mono text-xl font-bold text-slate-900 tabular-nums">
            {booking.pnr}
          </span>
        </div>
      </div>

      {/* Ticket Summary Card */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="bg-blue-700 text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <p className="font-mono text-xs text-blue-100">
              #{booking.trainNumber} · {booking.trainType} · {CLASS_LABELS[booking.travelClass]}
            </p>
            <h2 className="font-display text-lg font-bold">{booking.trainName}</h2>
          </div>
          <div className="text-sm tabular-nums text-blue-100">
            Journey Date: <strong className="text-white">{booking.journeyDate}</strong>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Route & Timing Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-5 border-b border-slate-200 tabular-nums">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Departure</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">
                {booking.departureTime}
              </p>
              <p className="text-sm text-slate-700">
                {booking.sourceName} ({booking.sourceCode})
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Duration</p>
              <p className="text-base font-semibold text-slate-900 mt-0.5">{booking.duration}</p>
              <p className="text-xs text-slate-500">Class: {booking.travelClass}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Arrival</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">{booking.arrivalTime}</p>
              <p className="text-sm text-slate-700">
                {booking.destinationName} ({booking.destinationCode})
              </p>
            </div>
          </div>

          {/* Passenger & Seat Allocation Table */}
          <div>
            <h3 className="font-display text-sm font-semibold text-slate-900 mb-3">
              Passenger &amp; Seat Information
            </h3>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-xs font-semibold text-slate-600 uppercase">
                  <tr>
                    <th className="px-4 py-2.5">#</th>
                    <th className="px-4 py-2.5">Passenger Name</th>
                    <th className="px-4 py-2.5">Age / Gender</th>
                    <th className="px-4 py-2.5">Coach &amp; Seat</th>
                    <th className="px-4 py-2.5">Berth</th>
                    <th className="px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {booking.passengers.map((p, idx) => (
                    <tr key={`${p.name}-${idx}`}>
                      <td className="px-4 py-3 tabular-nums text-slate-500">{idx + 1}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{p.name}</td>
                      <td className="px-4 py-3 text-slate-600 tabular-nums">
                        {p.age} · {p.gender}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-slate-900">
                        {p.coach} · {p.seatNumber}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{p.berthAssigned}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-semibold text-xs ${
                            p.status === 'Confirmed' ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Details */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-200 text-sm">
            <div className="text-slate-600">
              Transaction ID: <span className="font-mono text-slate-900">{booking.transactionId}</span> ·
              Method: <strong className="text-slate-900">{booking.paymentMethod}</strong>
            </div>
            <div className="text-base font-bold text-slate-900 tabular-nums">
              Total Paid: ₹{booking.totalAmount.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => downloadTicketFile(booking)}
          className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg inline-flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Download Ticket</span>
        </button>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onBookAnother}
            className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg inline-flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Book Another Ticket</span>
          </button>
          <button
            type="button"
            onClick={onGoToBookings}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg inline-flex items-center gap-2 cursor-pointer"
          >
            <ListChecks className="w-4 h-4" />
            <span>Go to My Bookings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
