import { Booking, User } from '../types';
import { getFutureDateISO } from './validation';

const BOOKINGS_KEY = 'railbook_bookings_v1';
const USERS_KEY = 'railbook_users_v1';
const SESSION_KEY = 'railbook_session_v1';

const SEED_BOOKINGS: Booking[] = [
  {
    pnr: '4829105734',
    transactionId: 'TXN784210945',
    trainNumber: '12952',
    trainName: 'Mumbai Rajdhani Express',
    trainType: 'Rajdhani',
    sourceCode: 'NDLS',
    sourceName: 'New Delhi',
    destinationCode: 'CSMT',
    destinationName: 'Mumbai CSMT',
    journeyDate: getFutureDateISO(5),
    departureTime: '16:55',
    arrivalTime: '08:35',
    duration: '15h 40m',
    travelClass: '3AC',
    passengers: [
      {
        name: 'Aarav Sharma',
        age: 24,
        gender: 'Male',
        berthPreference: 'Lower',
        coach: 'B3',
        seatNumber: '18',
        berthAssigned: 'Lower',
        status: 'Confirmed',
      },
      {
        name: 'Priya Sharma',
        age: 22,
        gender: 'Female',
        berthPreference: 'Upper',
        coach: 'B3',
        seatNumber: '20',
        berthAssigned: 'Upper',
        status: 'Confirmed',
      },
    ],
    contactPhone: '9876543210',
    contactEmail: 'student@railbook.edu',
    paymentMethod: 'UPI',
    baseFareTotal: 4280,
    convenienceFee: 30,
    gstAmount: 214,
    totalAmount: 4524,
    status: 'Confirmed',
    bookedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    bookedByEmail: 'student@railbook.edu',
  },
  {
    pnr: '6391820451',
    transactionId: 'TXN512904318',
    trainNumber: '12123',
    trainName: 'Deccan Queen Superfast',
    trainType: 'Superfast',
    sourceCode: 'CSMT',
    sourceName: 'Mumbai CSMT',
    destinationCode: 'PUNE',
    destinationName: 'Pune Jn',
    journeyDate: getFutureDateISO(9),
    departureTime: '17:10',
    arrivalTime: '20:25',
    duration: '3h 15m',
    travelClass: 'SL',
    passengers: [
      {
        name: 'Rohan Verma',
        age: 29,
        gender: 'Male',
        berthPreference: 'Side Lower',
        coach: 'WL',
        seatNumber: 'WL/5',
        berthAssigned: 'Waitlisted',
        status: 'Waiting List',
      },
    ],
    contactPhone: '9811223344',
    contactEmail: 'student@railbook.edu',
    paymentMethod: 'Debit Card',
    baseFareTotal: 195,
    convenienceFee: 15,
    gstAmount: 0,
    totalAmount: 210,
    status: 'Waiting List',
    bookedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    bookedByEmail: 'student@railbook.edu',
  },
  {
    pnr: '7510493826',
    transactionId: 'TXN398120477',
    trainNumber: '12015',
    trainName: 'Ajmer Shatabdi Express',
    trainType: 'Shatabdi',
    sourceCode: 'NDLS',
    sourceName: 'New Delhi',
    destinationCode: 'JP',
    destinationName: 'Jaipur Jn',
    journeyDate: getFutureDateISO(12),
    departureTime: '06:10',
    arrivalTime: '10:35',
    duration: '4h 25m',
    travelClass: '2AC',
    passengers: [
      {
        name: 'Sneha Nair',
        age: 26,
        gender: 'Female',
        berthPreference: 'Lower',
        coach: 'A2',
        seatNumber: '12',
        berthAssigned: 'Lower',
        status: 'Cancelled',
      },
    ],
    contactPhone: '9900112233',
    contactEmail: 'student@railbook.edu',
    paymentMethod: 'Net Banking',
    baseFareTotal: 1290,
    convenienceFee: 30,
    gstAmount: 65,
    totalAmount: 1385,
    status: 'Cancelled',
    bookedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    cancelledAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    bookedByEmail: 'student@railbook.edu',
  },
];

const SEED_USERS: User[] = [
  {
    id: 'USR-1001',
    fullName: 'Aarav Sharma',
    email: 'student@railbook.edu',
    phone: '9876543210',
    password: 'RailTest@123',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
];

export function getBookings(): Booking[] {
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    if (!raw) {
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(SEED_BOOKINGS));
      return [...SEED_BOOKINGS];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [...SEED_BOOKINGS];
  } catch {
    return [...SEED_BOOKINGS];
  }
}

export function saveBooking(booking: Booking): Booking[] {
  const existing = getBookings();
  const updated = [booking, ...existing];
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(updated));
  return updated;
}

export function findBookingByPNR(pnr: string): Booking | undefined {
  const cleaned = pnr.trim();
  return getBookings().find((b) => b.pnr === cleaned);
}

export function cancelBookingByPNR(pnr: string): {
  success: boolean;
  message: string;
  bookings: Booking[];
} {
  const bookings = getBookings();
  const target = bookings.find((b) => b.pnr === pnr);
  if (!target) {
    return {
      success: false,
      message: `No booking found with PNR ${pnr}.`,
      bookings,
    };
  }
  if (target.status === 'Cancelled') {
    return {
      success: false,
      message: `Ticket PNR ${pnr} has already been cancelled.`,
      bookings,
    };
  }

  const updated = bookings.map((b) => {
    if (b.pnr !== pnr) return b;
    return {
      ...b,
      status: 'Cancelled' as const,
      cancelledAt: new Date().toISOString(),
      passengers: b.passengers.map((p) => ({
        ...p,
        status: 'Cancelled' as const,
      })),
    };
  });

  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(updated));
  return {
    success: true,
    message: `Booking PNR ${pnr} cancelled successfully.`,
    bookings: updated,
  };
}

export function getUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      localStorage.setItem(USERS_KEY, JSON.stringify(SEED_USERS));
      return [...SEED_USERS];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [...SEED_USERS];
  } catch {
    return [...SEED_USERS];
  }
}

export function registerUser(user: User): { success: boolean; message: string; user?: User } {
  const users = getUsers();
  if (users.some((u) => u.email.toLowerCase() === user.email.toLowerCase())) {
    return { success: false, message: 'An account with this email already exists.' };
  }
  const updated = [...users, user];
  localStorage.setItem(USERS_KEY, JSON.stringify(updated));
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return { success: true, message: 'Registration successful.', user };
}

export function loginUser(
  email: string,
  password: string
): { success: boolean; message: string; user?: User } {
  const users = getUsers();
  const found = users.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
  );
  if (!found) {
    return { success: false, message: 'Invalid email or password.' };
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(found));
  return { success: true, message: 'Login successful.', user: found };
}

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function logoutUser(): void {
  localStorage.removeItem(SESSION_KEY);
}
