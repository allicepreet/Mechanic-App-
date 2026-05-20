import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';

export interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  vehicle: string;
  serviceType: string;
  price: number;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'rejected';
  date: string;
  time: string;
  notes: string;
  location: string;
}

export interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  service: string;
}

export interface GarageInfo {
  name: string;
  ownerName: string;
  phone: string;
  address: string;
  workingHours: string;
  specialties: string[];
}

interface MechanicContextType {
  bookings: Booking[];
  reviews: Review[];
  garageInfo: GarageInfo;
  notificationsEnabled: boolean;
  darkMode: boolean;
  totalEarnings: number;
  dailyEarnings: number;
  monthlyEarnings: number;
  completedJobsCount: number;
  acceptBooking: (id: string) => void;
  rejectBooking: (id: string) => void;
  updateBookingStatus: (id: string, status: Booking['status']) => void;
  updateGarageInfo: (info: Partial<GarageInfo>) => void;
  toggleNotifications: () => void;
  toggleDarkMode: () => void;
  logout: () => void;
  refreshBookings: () => void;
  isLoggedIn: boolean;
  login: (email: string, password: string) => boolean;
  signup: (name: string, email: string, shopName: string, phone: string) => void;
}

const MechanicContext = createContext<MechanicContextType | undefined>(undefined);

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'B001',
    customerName: 'Alex Rivera',
    customerPhone: '+1 (555) 019-2834',
    vehicle: '2021 Tesla Model 3',
    serviceType: 'Brake Pad Replacement',
    price: 340,
    status: 'pending',
    date: 'Today',
    time: '10:00 AM',
    notes: 'Please paint calipers in Performance Red. The brakes are squeaking slightly when cold.',
    location: '1024 Performance Way (In-Shop)',
  },
  {
    id: 'B003',
    customerName: 'Marcus Vance',
    customerPhone: '+1 (555) 082-1277',
    vehicle: '2023 Tesla Model Y Long Range',
    serviceType: 'HV Battery Diagnostics & System Update',
    price: 550,
    status: 'pending',
    date: 'Today',
    time: '11:15 AM',
    notes: 'Range dropping unexpectedly after last software update. Inspect cell modules.',
    location: 'Mobile Dispatch (On-Site Repair)',
  },
  {
    id: 'B004',
    customerName: 'Chloe Zhao',
    customerPhone: '+1 (555) 039-4411',
    vehicle: '2022 Audi e-tron GT',
    serviceType: 'Suspension Alignment & Air Suspension Calib.',
    price: 290,
    status: 'pending',
    date: 'Today',
    time: '03:30 PM',
    notes: 'Alignment pulling slightly to the left at highway speeds.',
    location: '1024 Performance Way (In-Shop)',
  },
  {
    id: 'B006',
    customerName: 'Julian Sterling',
    customerPhone: '+1 (555) 091-6652',
    vehicle: '2023 Porsche 911 GT3 RS',
    serviceType: 'Track Day Prep & Brake Fluid Flush',
    price: 850,
    status: 'pending',
    date: 'Today',
    time: '01:00 PM',
    notes: 'Flush brakes with Castrol SRF racing fluid and check torque on center locks.',
    location: '1024 Performance Way (In-Shop)',
  },
  {
    id: 'B007',
    customerName: 'Elena Rostova',
    customerPhone: '+1 (555) 073-1994',
    vehicle: '2020 Audi R8 V10 Performance',
    serviceType: 'Valet Exhaust System Installation',
    price: 1200,
    status: 'pending',
    date: 'Today',
    time: '04:15 PM',
    notes: 'Install Capristo valved system and sync with factory home-link button.',
    location: '1024 Performance Way (In-Shop)',
  },
  {
    id: 'B008',
    customerName: 'Chase Campbell',
    customerPhone: '+1 (555) 054-3388',
    vehicle: '2021 Ford Mustang Shelby GT500',
    serviceType: 'Supercharger Pulley Upgrade & ECU Tune',
    price: 950,
    status: 'pending',
    date: 'Today',
    time: '05:00 PM',
    notes: 'Upgrade to 2.7-inch griptec pulley and flash customized dyno tune.',
    location: '1024 Performance Way (In-Shop)',
  },
  {
    id: 'B002',
    customerName: 'Sarah Jenkins',
    customerPhone: '+1 (555) 042-8921',
    vehicle: '2018 Porsche 911 Carrera S',
    serviceType: 'Engine Diagnostics',
    price: 480,
    status: 'accepted',
    date: 'Today',
    time: '11:30 AM',
    notes: 'Engine warning light came on yesterday. Cylinder 3 misfire suspected.',
    location: '1024 Performance Way (In-Shop)',
  },
  {
    id: 'B005',
    customerName: 'David Miller',
    customerPhone: '+1 (555) 021-9988',
    vehicle: '2019 Ford Mustang GT',
    serviceType: 'Oil Change & Filter Replacement',
    price: 125,
    status: 'completed',
    date: 'Yesterday',
    time: '09:00 AM',
    notes: 'Customer requests Royal Purple 5W-50 full synthetic oil.',
    location: '1024 Performance Way (In-Shop)',
  },
];

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'R001',
    customerName: 'David Miller',
    rating: 5,
    comment: 'Exceptional service! Used the Royal Purple synthetic oil as requested and finished in under 30 minutes. The workshop is pristine.',
    date: 'Yesterday',
    service: 'Oil Change & Filter Replacement',
  },
  {
    id: 'R002',
    customerName: 'Emily Watson',
    rating: 5,
    comment: 'Super professional team. My Defender drives perfectly after the lift kit calibration. Highly recommend Apex!',
    date: 'Yesterday',
    service: 'Off-Road Lift Kit Calibration & Alignment',
  },
];

const INITIAL_GARAGE: GarageInfo = {
  name: 'Apex Auto Works',
  ownerName: 'Dominic T.',
  phone: '+1 (555) 999-8800',
  address: '1024 Performance Way, Suite C',
  workingHours: 'Mon - Sat: 8:00 AM - 6:00 PM',
  specialties: ['Performance Tuning', 'Diagnostics', 'Brake Systems', 'High-End Alignment', 'EV Drivetrains'],
};

export const MechanicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useDeviceColorScheme();
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [garageInfo, setGarageInfo] = useState<GarageInfo>(INITIAL_GARAGE);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = (email: string, password: string) => {
    setIsLoggedIn(true);
    return true;
  };

  const signup = (name: string, email: string, shopName: string, phone: string) => {
    setGarageInfo({
      name: shopName || 'Apex Auto Works',
      ownerName: name || 'Dominic T.',
      phone: phone || '+1 (555) 999-8800',
      address: '1024 Performance Way, Suite C',
      workingHours: 'Mon - Sat: 8:00 AM - 6:00 PM',
      specialties: ['Performance Tuning', 'Diagnostics', 'Brake Systems', 'High-End Alignment', 'EV Drivetrains'],
    });
    setIsLoggedIn(true);
  };

  // Stats derived from State
  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const completedJobsCount = completedBookings.length;
  
  // Totals calculations
  const totalEarnings = completedBookings.reduce((sum, b) => sum + b.price, 0);
  const dailyEarnings = completedBookings
    .filter((b) => b.date === 'Today' || b.date === 'Yesterday') // simulated daily/recent
    .reduce((sum, b) => sum + (b.date === 'Today' ? b.price : b.price * 0.4), 0); // simulated today portion
  const monthlyEarnings = totalEarnings + 1250; // include historic baseline

  const acceptBooking = (id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'accepted' as const } : b))
    );
  };

  const rejectBooking = (id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'rejected' as const } : b))
    );
  };

  const updateBookingStatus = (id: string, status: Booking['status']) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b))
    );
  };

  const updateGarageInfo = (info: Partial<GarageInfo>) => {
    setGarageInfo((prev) => ({ ...prev, ...info }));
  };

  const toggleNotifications = () => {
    setNotificationsEnabled((prev) => !prev);
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const logout = () => {
    // Reset or perform cleanup
    setBookings(INITIAL_BOOKINGS);
    setIsLoggedIn(false);
  };

  const refreshBookings = () => {
    setBookings(INITIAL_BOOKINGS);
  };

  return (
    <MechanicContext.Provider
      value={{
        bookings,
        reviews,
        garageInfo,
        notificationsEnabled,
        darkMode,
        totalEarnings,
        dailyEarnings,
        monthlyEarnings,
        completedJobsCount,
        acceptBooking,
        rejectBooking,
        updateBookingStatus,
        updateGarageInfo,
        toggleNotifications,
        toggleDarkMode,
        logout,
        refreshBookings,
        isLoggedIn,
        login,
        signup,
      }}
    >
      {children}
    </MechanicContext.Provider>
  );
};

export const useMechanic = () => {
  const context = useContext(MechanicContext);
  if (!context) {
    throw new Error('useMechanic must be used within a MechanicProvider');
  }
  return context;
};
