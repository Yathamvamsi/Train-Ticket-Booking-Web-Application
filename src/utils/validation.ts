import {
  BookedPassenger,
  Booking,
  PassengerInput,
  PaymentMethod,
  SearchParams,
  TrainClassCode,
} from '../types';

export interface SearchValidationResult {
  valid: boolean;
  errors: Partial<Record<'from' | 'to' | 'date' | 'general', string>>;
}

export function getTodayISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getFutureDateISO(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function validateSearchParams(
  params: SearchParams,
  options?: { bypassDateCheck?: boolean }
): SearchValidationResult {
  const errors: SearchValidationResult['errors'] = {};

  if (!params.from || params.from.trim() === '') {
    errors.from = 'Please select a source station.';
  }

  if (!params.to || params.to.trim() === '') {
    errors.to = 'Please select a destination station.';
  }

  if (params.from && params.to && params.from === params.to) {
    errors.to = 'Source and destination stations cannot be the same.';
    errors.general = 'Source and destination stations cannot be the same.';
  }

  if (!params.date || params.date.trim() === '') {
    errors.date = 'Please select a journey date.';
  } else if (!options?.bypassDateCheck) {
    const today = getTodayISO();
    if (params.date < today) {
      errors.date = 'Past journey dates are not allowed. Choose today or a future date.';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export interface PassengerError {
  name?: string;
  age?: string;
}

export function validatePassenger(passenger: PassengerInput): PassengerError {
  const err: PassengerError = {};
  const trimmedName = passenger.name.trim();

  if (!trimmedName) {
    err.name = 'Passenger name is required.';
  } else if (trimmedName.length < 2) {
    err.name = 'Name must be at least 2 characters.';
  } else if (!/^[a-zA-Z\s.'-]+$/.test(trimmedName)) {
    err.name = 'Name can only contain letters and spaces.';
  }

  const ageStr = passenger.age.trim();
  if (!ageStr) {
    err.age = 'Age is required.';
  } else {
    const ageNum = Number(ageStr);
    if (!Number.isInteger(ageNum) || ageNum < 1 || ageNum > 120) {
      err.age = 'Enter a valid age between 1 and 120.';
    }
  }

  return err;
}

export interface ContactErrors {
  phone?: string;
  email?: string;
}

export function validateContact(phone: string, email: string): ContactErrors {
  const errors: ContactErrors = {};
  const cleanPhone = phone.trim();
  const cleanEmail = email.trim();

  if (!cleanPhone) {
    errors.phone = 'Contact mobile number is required.';
  } else if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
    errors.phone = 'Enter a valid 10-digit Indian mobile number starting with 6–9.';
  }

  if (!cleanEmail) {
    errors.email = 'Email address is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail)) {
    errors.email = 'Enter a valid email address (e.g., user@domain.com).';
  }

  return errors;
}

export interface PaymentFields {
  method: PaymentMethod;
  upiId: string;
  cardNumber: string;
  cardHolder: string;
  cardExpiry: string;
  cardCvv: string;
  bankName: string;
  netBankingUserId: string;
}

export function validatePayment(fields: PaymentFields): Record<string, string> {
  const errors: Record<string, string> = {};

  if (fields.method === 'UPI') {
    const upi = fields.upiId.trim();
    if (!upi) {
      errors.upiId = 'Please enter your UPI ID.';
    } else if (!/^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/.test(upi)) {
      errors.upiId = 'Enter a valid UPI ID (e.g., rahul@okaxis).';
    }
  } else if (fields.method === 'Debit Card' || fields.method === 'Credit Card') {
    const digits = fields.cardNumber.replace(/\s+/g, '');
    if (!digits) {
      errors.cardNumber = 'Card number is required.';
    } else if (!/^\d{16}$/.test(digits)) {
      errors.cardNumber = 'Card number must be 16 digits.';
    }

    if (!fields.cardHolder.trim() || fields.cardHolder.trim().length < 2) {
      errors.cardHolder = 'Cardholder name is required.';
    }

    if (!fields.cardExpiry.trim()) {
      errors.cardExpiry = 'Expiry date (MM/YY) is required.';
    } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(fields.cardExpiry.trim())) {
      errors.cardExpiry = 'Use MM/YY format (e.g., 08/28).';
    }

    if (!fields.cardCvv.trim()) {
      errors.cardCvv = 'CVV is required.';
    } else if (!/^\d{3}$/.test(fields.cardCvv.trim())) {
      errors.cardCvv = 'CVV must be 3 digits.';
    }
  } else if (fields.method === 'Net Banking') {
    if (!fields.bankName.trim()) {
      errors.bankName = 'Please select a bank.';
    }
    if (!fields.netBankingUserId.trim() || fields.netBankingUserId.trim().length < 4) {
      errors.netBankingUserId = 'Enter your Customer / User ID (min 4 characters).';
    }
  }

  return errors;
}

export function validatePNR(pnr: string): { valid: boolean; error?: string } {
  const cleaned = pnr.trim();
  if (!cleaned) {
    return { valid: false, error: 'Please enter a 10-digit PNR number.' };
  }
  if (!/^\d{10}$/.test(cleaned)) {
    return { valid: false, error: 'Invalid PNR format. PNR must be exactly 10 numeric digits.' };
  }
  return { valid: true };
}

export function validateAuthLogin(email: string, password: string): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
    errors.email = 'Enter a valid email address.';
  }
  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }
  return errors;
}

export function validateAuthRegister(input: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!input.fullName.trim() || input.fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters.';
  }
  if (!input.email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }
  if (!input.phone.trim()) {
    errors.phone = 'Mobile number is required.';
  } else if (!/^[6-9]\d{9}$/.test(input.phone.trim())) {
    errors.phone = 'Enter a valid 10-digit mobile number.';
  }
  if (!input.password) {
    errors.password = 'Password is required.';
  } else if (input.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }
  if (input.confirmPassword !== input.password) {
    errors.confirmPassword = 'Passwords do not match.';
  }
  return errors;
}

export function calculateFare(
  baseFarePerPassenger: number,
  passengerCount: number,
  travelClass: TrainClassCode
): {
  baseFareTotal: number;
  convenienceFee: number;
  gstAmount: number;
  totalAmount: number;
} {
  const count = Math.max(1, passengerCount);
  const baseFareTotal = baseFarePerPassenger * count;
  const isAc = travelClass !== 'SL';
  const convenienceFee = isAc ? 30 : 15;
  const gstAmount = isAc ? Math.round(baseFareTotal * 0.05) : 0;
  const totalAmount = baseFareTotal + convenienceFee + gstAmount;
  return { baseFareTotal, convenienceFee, gstAmount, totalAmount };
}

export function generatePNR(): string {
  const firstDigit = String(Math.floor(Math.random() * 8) + 2);
  let rest = '';
  for (let i = 0; i < 9; i++) {
    rest += String(Math.floor(Math.random() * 10));
  }
  return firstDigit + rest;
}

export function generateTransactionId(): string {
  const num = Math.floor(100000000 + Math.random() * 900000000);
  return `TXN${num}`;
}

export function assignSeatInfo(
  passengers: PassengerInput[],
  travelClass: TrainClassCode,
  isWaitingList: boolean
): BookedPassenger[] {
  const coachPrefix =
    travelClass === 'SL'
      ? 'S4'
      : travelClass === '3AC'
        ? 'B3'
        : travelClass === '2AC'
          ? 'A2'
          : 'H1';

  const startSeat = 18;
  const berthCycle = ['Lower', 'Middle', 'Upper', 'Side Lower', 'Side Upper'];

  return passengers.map((p, index) => {
    if (isWaitingList) {
      return {
        name: p.name.trim(),
        age: Number(p.age),
        gender: p.gender,
        berthPreference: p.berthPreference,
        coach: 'WL',
        seatNumber: `WL/${index + 1}`,
        berthAssigned: 'Waitlisted',
        status: 'Waiting List',
      };
    }

    const berth =
      p.berthPreference === 'No Preference'
        ? berthCycle[index % berthCycle.length]
        : p.berthPreference;

    return {
      name: p.name.trim(),
      age: Number(p.age),
      gender: p.gender,
      berthPreference: p.berthPreference,
      coach: coachPrefix,
      seatNumber: String(startSeat + index * 2),
      berthAssigned: berth,
      status: 'Confirmed',
    };
  });
}

export function canCancelBooking(booking: Booking | undefined): {
  allowed: boolean;
  reason?: string;
} {
  if (!booking) {
    return { allowed: false, reason: 'Booking not found for the given PNR.' };
  }
  if (booking.status === 'Cancelled') {
    return {
      allowed: false,
      reason: `Ticket PNR ${booking.pnr} is already cancelled.`,
    };
  }
  return { allowed: true };
}
