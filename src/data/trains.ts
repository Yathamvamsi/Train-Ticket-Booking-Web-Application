import { ClassAvailability, Station, Train, TrainClassCode, TrainType } from '../types';

export const CLASS_LABELS: Record<TrainClassCode, string> = {
  SL: 'Sleeper (SL)',
  '3AC': 'AC 3 Tier (3AC)',
  '2AC': 'AC 2 Tier (2AC)',
  '1AC': 'AC First Class (1AC)',
};

export const STATIONS: Station[] = [
  { code: 'NDLS', name: 'New Delhi', city: 'New Delhi', state: 'Delhi' },
  { code: 'CSMT', name: 'Mumbai CSMT', city: 'Mumbai', state: 'Maharashtra' },
  { code: 'HWH', name: 'Howrah Jn', city: 'Kolkata', state: 'West Bengal' },
  { code: 'MAS', name: 'MGR Chennai Central', city: 'Chennai', state: 'Tamil Nadu' },
  { code: 'SBC', name: 'KSR Bengaluru', city: 'Bengaluru', state: 'Karnataka' },
  { code: 'HYB', name: 'Hyderabad Deccan', city: 'Hyderabad', state: 'Telangana' },
  { code: 'JP', name: 'Jaipur Jn', city: 'Jaipur', state: 'Rajasthan' },
  { code: 'ADI', name: 'Ahmedabad Jn', city: 'Ahmedabad', state: 'Gujarat' },
  { code: 'PUNE', name: 'Pune Jn', city: 'Pune', state: 'Maharashtra' },
  { code: 'LKO', name: 'Lucknow Charbagh', city: 'Lucknow', state: 'Uttar Pradesh' },
  { code: 'PNBE', name: 'Patna Jn', city: 'Patna', state: 'Bihar' },
  { code: 'BPL', name: 'Bhopal Jn', city: 'Bhopal', state: 'Madhya Pradesh' },
];

export const POPULAR_ROUTES = [
  {
    from: 'NDLS',
    to: 'CSMT',
    label: 'New Delhi → Mumbai',
    distance: '1,384 km',
    startingFare: 645,
    trainsCount: 4,
  },
  {
    from: 'SBC',
    to: 'MAS',
    label: 'Bengaluru → Chennai',
    distance: '362 km',
    startingFare: 265,
    trainsCount: 3,
  },
  {
    from: 'NDLS',
    to: 'JP',
    label: 'New Delhi → Jaipur',
    distance: '308 km',
    startingFare: 245,
    trainsCount: 3,
  },
  {
    from: 'CSMT',
    to: 'PUNE',
    label: 'Mumbai → Pune',
    distance: '192 km',
    startingFare: 185,
    trainsCount: 3,
  },
  {
    from: 'NDLS',
    to: 'HWH',
    label: 'New Delhi → Howrah',
    distance: '1,447 km',
    startingFare: 685,
    trainsCount: 3,
  },
  {
    from: 'ADI',
    to: 'CSMT',
    label: 'Ahmedabad → Mumbai',
    distance: '492 km',
    startingFare: 340,
    trainsCount: 3,
  },
];

function makeClasses(
  sl: number,
  ac3: number,
  ac2: number,
  ac1: number,
  opts?: {
    slAvail?: number;
    ac3Avail?: number;
    ac2Avail?: number;
    ac1Avail?: number;
    noSleeper?: boolean;
    slWl?: number;
  }
): Record<TrainClassCode, ClassAvailability> {
  return {
    SL: opts?.noSleeper
      ? { code: 'SL', name: 'Sleeper', fare: 0, status: 'NOT_AVAILABLE', seats: 0 }
      : opts?.slWl
        ? { code: 'SL', name: 'Sleeper', fare: sl, status: 'WL', seats: opts.slWl }
        : {
            code: 'SL',
            name: 'Sleeper',
            fare: sl,
            status: 'AVAILABLE',
            seats: opts?.slAvail ?? 64,
          },
    '3AC': {
      code: '3AC',
      name: 'AC 3 Tier',
      fare: ac3,
      status: 'AVAILABLE',
      seats: opts?.ac3Avail ?? 38,
    },
    '2AC': {
      code: '2AC',
      name: 'AC 2 Tier',
      fare: ac2,
      status: 'AVAILABLE',
      seats: opts?.ac2Avail ?? 19,
    },
    '1AC': {
      code: '1AC',
      name: 'AC First Class',
      fare: ac1,
      status: 'AVAILABLE',
      seats: opts?.ac1Avail ?? 6,
    },
  };
}

export const TRAINS: Train[] = [
  // NDLS <-> CSMT
  {
    trainNumber: '12952',
    trainName: 'Mumbai Rajdhani Express',
    trainType: 'Rajdhani',
    sourceCode: 'NDLS',
    destinationCode: 'CSMT',
    departureTime: '16:55',
    arrivalTime: '08:35',
    duration: '15h 40m',
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    classes: makeClasses(0, 2140, 2980, 4890, { noSleeper: true, ac3Avail: 28, ac2Avail: 14, ac1Avail: 5 }),
  },
  {
    trainNumber: '12954',
    trainName: 'August Kranti Tejas Express',
    trainType: 'Rajdhani',
    sourceCode: 'NDLS',
    destinationCode: 'CSMT',
    departureTime: '17:15',
    arrivalTime: '10:05',
    duration: '16h 50m',
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    classes: makeClasses(0, 2080, 2890, 4750, { noSleeper: true, ac3Avail: 41, ac2Avail: 18, ac1Avail: 4 }),
  },
  {
    trainNumber: '12138',
    trainName: 'Punjab Mail Superfast',
    trainType: 'Superfast',
    sourceCode: 'NDLS',
    destinationCode: 'CSMT',
    departureTime: '05:15',
    arrivalTime: '07:35',
    duration: '26h 20m',
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    classes: makeClasses(645, 1680, 2410, 4050, { slAvail: 52, ac3Avail: 22, ac2Avail: 11, ac1Avail: 3 }),
  },
  {
    trainNumber: '22222',
    trainName: 'CSMT Rajdhani Superfast',
    trainType: 'Superfast',
    sourceCode: 'NDLS',
    destinationCode: 'CSMT',
    departureTime: '19:40',
    arrivalTime: '13:15',
    duration: '17h 35m',
    runningDays: ['Mon', 'Wed', 'Fri', 'Sun'],
    classes: makeClasses(695, 1790, 2540, 4220, { slWl: 8, ac3Avail: 15, ac2Avail: 9, ac1Avail: 2 }),
  },
  {
    trainNumber: '12951',
    trainName: 'New Delhi Rajdhani Express',
    trainType: 'Rajdhani',
    sourceCode: 'CSMT',
    destinationCode: 'NDLS',
    departureTime: '17:00',
    arrivalTime: '08:32',
    duration: '15h 32m',
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    classes: makeClasses(0, 2140, 2980, 4890, { noSleeper: true, ac3Avail: 32, ac2Avail: 16, ac1Avail: 6 }),
  },
  {
    trainNumber: '11057',
    trainName: 'Amritsar Express',
    trainType: 'Express',
    sourceCode: 'CSMT',
    destinationCode: 'NDLS',
    departureTime: '23:30',
    arrivalTime: '04:05',
    duration: '28h 35m',
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    classes: makeClasses(610, 1590, 2290, 3850, { slAvail: 84, ac3Avail: 35, ac2Avail: 15, ac1Avail: 4 }),
  },

  // SBC <-> MAS
  {
    trainNumber: '20608',
    trainName: 'Mysuru–Chennai Vande Bharat',
    trainType: 'Vande Bharat',
    sourceCode: 'SBC',
    destinationCode: 'MAS',
    departureTime: '07:50',
    arrivalTime: '12:20',
    duration: '4h 30m',
    runningDays: ['Mon', 'Tue', 'Thu', 'Fri', 'Sat', 'Sun'],
    classes: makeClasses(0, 1020, 1490, 2120, { noSleeper: true, ac3Avail: 74, ac2Avail: 26, ac1Avail: 10 }),
  },
  {
    trainNumber: '12028',
    trainName: 'KSR Bengaluru Shatabdi',
    trainType: 'Shatabdi',
    sourceCode: 'SBC',
    destinationCode: 'MAS',
    departureTime: '06:00',
    arrivalTime: '11:00',
    duration: '5h 00m',
    runningDays: ['Mon', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    classes: makeClasses(0, 955, 1380, 1960, { noSleeper: true, ac3Avail: 48, ac2Avail: 19, ac1Avail: 8 }),
  },
  {
    trainNumber: '12658',
    trainName: 'Chennai Mail Superfast',
    trainType: 'Superfast',
    sourceCode: 'SBC',
    destinationCode: 'MAS',
    departureTime: '22:40',
    arrivalTime: '04:45',
    duration: '6h 05m',
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    classes: makeClasses(265, 690, 995, 1650, { slAvail: 68, ac3Avail: 29, ac2Avail: 14, ac1Avail: 5 }),
  },
  {
    trainNumber: '12657',
    trainName: 'Bengaluru Mail Superfast',
    trainType: 'Superfast',
    sourceCode: 'MAS',
    destinationCode: 'SBC',
    departureTime: '22:50',
    arrivalTime: '04:35',
    duration: '5h 45m',
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    classes: makeClasses(265, 690, 995, 1650, { slAvail: 56, ac3Avail: 33, ac2Avail: 12, ac1Avail: 4 }),
  },

  // NDLS <-> JP
  {
    trainNumber: '12015',
    trainName: 'Ajmer Shatabdi Express',
    trainType: 'Shatabdi',
    sourceCode: 'NDLS',
    destinationCode: 'JP',
    departureTime: '06:10',
    arrivalTime: '10:35',
    duration: '4h 25m',
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    classes: makeClasses(0, 890, 1290, 1840, { noSleeper: true, ac3Avail: 62, ac2Avail: 21, ac1Avail: 7 }),
  },
  {
    trainNumber: '12958',
    trainName: 'Swarna Jayanti Rajdhani',
    trainType: 'Rajdhani',
    sourceCode: 'NDLS',
    destinationCode: 'JP',
    departureTime: '19:55',
    arrivalTime: '00:25',
    duration: '4h 30m',
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    classes: makeClasses(0, 940, 1340, 1980, { noSleeper: true, ac3Avail: 38, ac2Avail: 15, ac1Avail: 5 }),
  },
  {
    trainNumber: '14660',
    trainName: 'Shalimar Express',
    trainType: 'Express',
    sourceCode: 'NDLS',
    destinationCode: 'JP',
    departureTime: '11:05',
    arrivalTime: '16:50',
    duration: '5h 45m',
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    classes: makeClasses(245, 640, 920, 1520, { slAvail: 92, ac3Avail: 44, ac2Avail: 18, ac1Avail: 6 }),
  },

  // CSMT <-> PUNE
  {
    trainNumber: '12127',
    trainName: 'Mumbai–Pune Intercity Express',
    trainType: 'Superfast',
    sourceCode: 'CSMT',
    destinationCode: 'PUNE',
    departureTime: '06:40',
    arrivalTime: '09:57',
    duration: '3h 17m',
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    classes: makeClasses(185, 510, 745, 1240, { slAvail: 112, ac3Avail: 54, ac2Avail: 24, ac1Avail: 8 }),
  },
  {
    trainNumber: '12123',
    trainName: 'Deccan Queen Superfast',
    trainType: 'Superfast',
    sourceCode: 'CSMT',
    destinationCode: 'PUNE',
    departureTime: '17:10',
    arrivalTime: '20:25',
    duration: '3h 15m',
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    classes: makeClasses(195, 540, 780, 1290, { slWl: 5, ac3Avail: 31, ac2Avail: 14, ac1Avail: 4 }),
  },
  {
    trainNumber: '11007',
    trainName: 'Deccan Express',
    trainType: 'Express',
    sourceCode: 'CSMT',
    destinationCode: 'PUNE',
    departureTime: '07:00',
    arrivalTime: '11:05',
    duration: '4h 05m',
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    classes: makeClasses(175, 495, 710, 1190, { slAvail: 88, ac3Avail: 41, ac2Avail: 19, ac1Avail: 6 }),
  },

  // NDLS <-> HWH
  {
    trainNumber: '12302',
    trainName: 'Howrah Rajdhani Express',
    trainType: 'Rajdhani',
    sourceCode: 'NDLS',
    destinationCode: 'HWH',
    departureTime: '16:50',
    arrivalTime: '09:55',
    duration: '17h 05m',
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    classes: makeClasses(0, 2240, 3120, 5120, { noSleeper: true, ac3Avail: 27, ac2Avail: 13, ac1Avail: 4 }),
  },
  {
    trainNumber: '12314',
    trainName: 'Sealdah Rajdhani Express',
    trainType: 'Rajdhani',
    sourceCode: 'NDLS',
    destinationCode: 'HWH',
    departureTime: '16:30',
    arrivalTime: '10:10',
    duration: '17h 40m',
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    classes: makeClasses(0, 2190, 3050, 4980, { noSleeper: true, ac3Avail: 34, ac2Avail: 17, ac1Avail: 5 }),
  },
  {
    trainNumber: '12312',
    trainName: 'Netaji Express',
    trainType: 'Superfast',
    sourceCode: 'NDLS',
    destinationCode: 'HWH',
    departureTime: '06:15',
    arrivalTime: '08:05',
    duration: '25h 50m',
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    classes: makeClasses(685, 1740, 2490, 4190, { slAvail: 48, ac3Avail: 25, ac2Avail: 11, ac1Avail: 3 }),
  },

  // ADI <-> CSMT
  {
    trainNumber: '20902',
    trainName: 'Gandhinagar–Mumbai Vande Bharat',
    trainType: 'Vande Bharat',
    sourceCode: 'ADI',
    destinationCode: 'CSMT',
    departureTime: '14:40',
    arrivalTime: '20:25',
    duration: '5h 45m',
    runningDays: ['Mon', 'Tue', 'Thu', 'Fri', 'Sat', 'Sun'],
    classes: makeClasses(0, 1280, 1890, 2650, { noSleeper: true, ac3Avail: 58, ac2Avail: 22, ac1Avail: 8 }),
  },
  {
    trainNumber: '12010',
    trainName: 'Ahmedabad–Mumbai Shatabdi',
    trainType: 'Shatabdi',
    sourceCode: 'ADI',
    destinationCode: 'CSMT',
    departureTime: '15:10',
    arrivalTime: '21:35',
    duration: '6h 25m',
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    classes: makeClasses(0, 1190, 1740, 2420, { noSleeper: true, ac3Avail: 43, ac2Avail: 18, ac1Avail: 5 }),
  },
  {
    trainNumber: '12902',
    trainName: 'Gujarat Mail Superfast',
    trainType: 'Superfast',
    sourceCode: 'ADI',
    destinationCode: 'CSMT',
    departureTime: '22:50',
    arrivalTime: '06:15',
    duration: '7h 25m',
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    classes: makeClasses(340, 880, 1260, 2090, { slAvail: 74, ac3Avail: 36, ac2Avail: 16, ac1Avail: 4 }),
  },
];

export function getStationByCode(code: string): Station | undefined {
  return STATIONS.find((s) => s.code === code);
}

/**
 * Returns direct curated trains for the selected route.
 * For any station pair without hardcoded entries, deterministically generates
 * 3 realistic regional express/superfast trains so every station pair can be tested end-to-end.
 */
export function findTrainsForRoute(from: string, to: string): Train[] {
  if (!from || !to || from === to) return [];

  const direct = TRAINS.filter(
    (t) => t.sourceCode === from && t.destinationCode === to
  );
  if (direct.length > 0) return direct;

  const fromStation = getStationByCode(from);
  const toStation = getStationByCode(to);
  if (!fromStation || !toStation) return [];

  // Deterministic seed from station codes
  const seed = (from + to)
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const baseDistFactor = 320 + (seed % 900);
  const slFare = Math.round(baseDistFactor * 0.45);
  const ac3Fare = Math.round(baseDistFactor * 1.18);
  const ac2Fare = Math.round(baseDistFactor * 1.68);
  const ac1Fare = Math.round(baseDistFactor * 2.75);

  const generatedTemplates: Array<{
    offset: number;
    suffix: string;
    type: TrainType;
    dep: string;
    arr: string;
    dur: string;
    wl?: number;
  }> = [
    {
      offset: 101,
      suffix: 'Vande Bharat Express',
      type: 'Vande Bharat',
      dep: '06:30',
      arr: '13:15',
      dur: '6h 45m',
    },
    {
      offset: 204,
      suffix: 'Superfast Express',
      type: 'Superfast',
      dep: '14:20',
      arr: '23:45',
      dur: '9h 25m',
    },
    {
      offset: 309,
      suffix: 'Night Mail Express',
      type: 'Express',
      dep: '21:50',
      arr: '08:10',
      dur: '10h 20m',
      wl: 6,
    },
  ];

  return generatedTemplates.map((tpl, idx) => ({
    trainNumber: String(12400 + ((seed + tpl.offset) % 580)),
    trainName: `${fromStation.city}–${toStation.city} ${tpl.suffix}`,
    trainType: tpl.type,
    sourceCode: from,
    destinationCode: to,
    departureTime: tpl.dep,
    arrivalTime: tpl.arr,
    duration: tpl.dur,
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    classes: makeClasses(slFare, ac3Fare, ac2Fare, ac1Fare, {
      noSleeper: tpl.type === 'Vande Bharat',
      slAvail: 45 + idx * 12,
      slWl: tpl.wl,
      ac3Avail: 26 + idx * 7,
      ac2Avail: 12 + idx * 3,
      ac1Avail: 4 + idx,
    }),
  }));
}
