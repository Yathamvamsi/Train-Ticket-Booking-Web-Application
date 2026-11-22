import { Booking } from '../types';

export function downloadTicketFile(booking: Booking): void {
  const passengerRows = booking.passengers
    .map(
      (p, idx) => `
      <tr>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;">${idx + 1}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;font-weight:600;">${p.name}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;">${p.age} / ${p.gender}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;font-family:monospace;">${p.coach} - ${p.seatNumber}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;">${p.berthAssigned}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;font-weight:600;">${p.status}</td>
      </tr>`
    )
    .join('');

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>RailBook E-Ticket - PNR ${booking.pnr}</title>
</head>
<body style="font-family:Arial,Helvetica,sans-serif;background:#f8fafc;color:#0f172a;padding:32px;">
  <div style="max-width:740px;margin:0 auto;background:#ffffff;border:1px solid #cbd5e1;border-radius:8px;overflow:hidden;">
    <div style="background:#1d4ed8;color:#ffffff;padding:20px 24px;display:flex;justify-content:space-between;align-items:center;">
      <div>
        <div style="font-size:20px;font-weight:700;">RailBook – Electronic Reservation Slip</div>
        <div style="font-size:12px;opacity:0.9;margin-top:4px;">Academic Demo E-Ticket · Non-Commercial Simulation</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:11px;text-transform:uppercase;opacity:0.85;">PNR Number</div>
        <div style="font-size:20px;font-weight:700;font-family:monospace;">${booking.pnr}</div>
      </div>
    </div>
    <div style="padding:24px;">
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:14px;">
        <tr>
          <td style="padding:6px 0;color:#475569;">Train Number & Name</td>
          <td style="padding:6px 0;font-weight:700;">${booking.trainNumber} · ${booking.trainName}</td>
          <td style="padding:6px 0;color:#475569;">Booking Status</td>
          <td style="padding:6px 0;font-weight:700;">${booking.status}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#475569;">From</td>
          <td style="padding:6px 0;font-weight:600;">${booking.sourceName} (${booking.sourceCode}) · ${booking.departureTime}</td>
          <td style="padding:6px 0;color:#475569;">To</td>
          <td style="padding:6px 0;font-weight:600;">${booking.destinationName} (${booking.destinationCode}) · ${booking.arrivalTime}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#475569;">Journey Date</td>
          <td style="padding:6px 0;font-weight:600;">${booking.journeyDate}</td>
          <td style="padding:6px 0;color:#475569;">Travel Class</td>
          <td style="padding:6px 0;font-weight:600;">${booking.travelClass}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#475569;">Transaction ID</td>
          <td style="padding:6px 0;font-family:monospace;">${booking.transactionId}</td>
          <td style="padding:6px 0;color:#475569;">Total Fare Paid</td>
          <td style="padding:6px 0;font-weight:700;">INR ${booking.totalAmount.toLocaleString('en-IN')} (${booking.paymentMethod})</td>
        </tr>
      </table>

      <h3 style="font-size:15px;margin:20px 0 8px 0;color:#1e293b;">Passenger Details</h3>
      <table style="width:100%;border-collapse:collapse;font-size:13px;border:1px solid #e2e8f0;">
        <thead>
          <tr style="background:#eff6ff;text-align:left;">
            <th style="padding:8px 10px;border-bottom:1px solid #cbd5e1;">#</th>
            <th style="padding:8px 10px;border-bottom:1px solid #cbd5e1;">Passenger Name</th>
            <th style="padding:8px 10px;border-bottom:1px solid #cbd5e1;">Age / Gender</th>
            <th style="padding:8px 10px;border-bottom:1px solid #cbd5e1;">Coach / Seat</th>
            <th style="padding:8px 10px;border-bottom:1px solid #cbd5e1;">Berth</th>
            <th style="padding:8px 10px;border-bottom:1px solid #cbd5e1;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${passengerRows}
        </tbody>
      </table>

      <div style="margin-top:20px;padding-top:12px;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b;">
        Contact: ${booking.contactPhone} · ${booking.contactEmail}<br/>
        Booked on: ${new Date(booking.bookedAt).toLocaleString()}
      </div>
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `RailBook_Ticket_${booking.pnr}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
