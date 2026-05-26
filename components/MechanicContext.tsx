import AsyncStorage from '@react-native-async-storage/async-storage';
import { Client } from '@stomp/stompjs';
import axios from 'axios';
import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { Platform, Vibration } from 'react-native';
import { Audio } from 'expo-av';
import SockJS from 'sockjs-client';

export interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  vehicle: string;
  serviceType: string;
  price: number;
  notes: string;
  location: string;
  time: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'arrived' | 'completed' | 'rejected';
  latitude?: number;
  longitude?: number;
  eta?: string;
  distance?: string;
  date?: string;
  customerId?: string | number;
}

export interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  service: string;
}

export interface DashboardStats {
  totalJobs: number;
  completedJobs: number;
  acceptedJobs: number;
  pendingJobs: number;
  rejectedJobs: number;
}

export const getVehicleImage = (vehicleName: string): any => {
  const name = vehicleName.toLowerCase();
  if (name.includes('tesla')) return require('@/assets/images/tesla.png');
  if (name.includes('audi') || name.includes('e-tron')) return require('@/assets/images/audi.png');
  if (name.includes('porsche') || name.includes('911') || name.includes('taycan')) return require('@/assets/images/porsche.png');
  if (name.includes('mustang') || name.includes('shelby') || name.includes('ford') || name.includes('corvette')) return require('@/assets/images/mustang.png');
  return require('@/assets/images/banner.png');
};

interface GarageInfo {
  name: string;
  ownerName: string;
  phone: string;
  address: string;
  workingHours: string;
  specialties: string[];
}

interface MechanicContextType {
  isLoggedIn: boolean;
  authToken: string | null;
  authLoading: boolean;
  bookings: Booking[];
  darkMode: boolean;
  isOnline: boolean;
  isSocketConnected: boolean;
  currentCoords: { latitude: number; longitude: number } | null;
  mechanicId: string;
  completedJobsCount: number;
  dailyEarnings: number;
  monthlyEarnings: number;
  totalEarnings: number;
  garageInfo: GarageInfo;
  dashboardStats: DashboardStats | null;
  weeklyJobs: { day: string; totalJobs: number }[];
  reviews: Review[];
  notificationsEnabled: boolean;
  setIsOnline: (online: boolean) => void;
  setCurrentCoords: (coords: { latitude: number; longitude: number }) => void;
  toggleDarkMode: () => void;
  toggleNotifications: () => void;
  login: (email: string, password: string) => Promise<{ success: boolean; isOffline?: boolean; error?: string }>;
  logout: () => Promise<void>;
  signup: (name: string, email: string, phone: string, password: string, lat: number, lng: number, shopName: string) => Promise<{ success: boolean; isOffline?: boolean; error?: string }>;
  updateBookingStatus: (id: string, status: Booking['status']) => Promise<{ success: boolean; isOffline?: boolean; error?: string }>;
  acceptBooking: (id: string) => Promise<{ success: boolean; isOffline?: boolean; error?: string }>;
  rejectBooking: (id: string) => Promise<{ success: boolean; isOffline?: boolean; error?: string }>;
  generateBill: (id: string, billDetails?: any) => Promise<{ success: boolean; isOffline?: boolean; error?: string }>;
  refreshBookings: () => void;
  addSimulatedBooking: (bookingData: any) => void;
  updateGarageInfo: (info: Partial<GarageInfo>) => void;
  updateProfileOnServer: (name: string, phoneNo: string, experience: string) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (email: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  sendLocationToCustomer: (bookingId: string) => Promise<{ success: boolean; isOffline?: boolean; error?: string }>;
}

const MechanicContext = createContext<MechanicContextType | null>(null);

const BASE_HTTP_URL = 'http://192.168.0.42:8080';
const BASE_WS_URL = 'ws://192.168.0.42:8080/ws/websocket';

// ─── Web-Safe Storage Helper ─────────────────────────────────────────────────
const Storage = {
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await AsyncStorage.setItem(key, value);
    }
  },
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return await AsyncStorage.getItem(key);
  },
  removeItem: async (key: string) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await AsyncStorage.removeItem(key);
    }
  },
};

export const MechanicProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [weeklyJobs, setWeeklyJobs] = useState<{ day: string; totalJobs: number }[]>([]);

  // Sync bookings to storage
  useEffect(() => {
    if (bookings.length > 0) {
      Storage.setItem('mechanic_bookings', JSON.stringify(bookings)).catch(console.error);
    }
  }, [bookings]);
  const [currentCoords, setCurrentCoordsState] = useState<{ latitude: number; longitude: number } | null>(
    { latitude: 12.9352, longitude: 77.6245 }
  );
  const currentCoordsRef = useRef<{ latitude: number; longitude: number } | null>({ latitude: 12.9352, longitude: 77.6245 });
  const bookingsRef = useRef<Booking[]>([]);

  useEffect(() => {
    bookingsRef.current = bookings;
  }, [bookings]);

  useEffect(() => {
    if (isLoggedIn && authToken) {
      refreshBookings();
    }
  }, [isLoggedIn, authToken]);

  const [mechanicId, setMechanicId] = useState<string>('5');

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await axios.get(`${BASE_HTTP_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('[PROFILE] Fetched user profile:', response.data);
      if (response.data) {
        const profile = response.data;
        if (profile.id) {
          setMechanicId(String(profile.id));
        }
        setGarageInfo((prev) => ({
          ...prev,
          ownerName: profile.name || prev.ownerName,
          phone: profile.phone || prev.phone,
        }));
      }
    } catch (err) {
      console.error('[PROFILE] Failed to fetch user profile:', err);
    }
  };

  const [garageInfo, setGarageInfo] = useState<GarageInfo>({
    name: '',
    ownerName: '',
    phone: '',
    address: '',
    workingHours: '',
    specialties: [],
  });

  const stompClientRef = useRef<any>(null);

  const playNotificationSound = async () => {
    try {
      Vibration.vibrate([0, 500, 200, 500]);
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/bell.wav')
      );
      await sound.playAsync();
    } catch (error) {
      console.log('[AUDIO] Error playing notification sound', error);
    }
  };

  // ─── WebSocket / STOMP Connection ─────────────────────────────────────────
  useEffect(() => {
    if (!isLoggedIn) {
      if (stompClientRef.current) stompClientRef.current.deactivate();
      return;
    }

    const connectToStompBroker = () => {
      console.log('[STOMP] Initializing network socket stream...');

      const client = new Client({
        brokerURL: `${BASE_HTTP_URL.replace('http', 'ws')}/ws/websocket`,
        connectHeaders: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        debug: (str) => {
          console.log('[STOMP DEBUG]', str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      client.onConnect = (frame) => {
        console.log('[STOMP] Connected to Message Broker!', frame);
        setIsSocketConnected(true);

        client.subscribe(`/topic/mechanic/${mechanicId}`, (message) => {
          if (message.body) {
            try {
              const parsedPayload = JSON.parse(message.body);
              const incomingRequest: Booking = {
                id: parsedPayload.id ? String(parsedPayload.id) : parsedPayload.bookingId ? String(parsedPayload.bookingId) : `B00${Date.now()}`,
                customerName: parsedPayload.customerName || 'Emergency Dispatch Client',
                customerPhone: parsedPayload.customerPhone || '+1 (555) 999-8800',
                vehicle: parsedPayload.vehicle || parsedPayload.problem || 'Unknown Vehicle Type',
                serviceType: parsedPayload.serviceType || parsedPayload.problem || 'Diagnostic Overview',
                price: parsedPayload.price || 120,
                notes: parsedPayload.notes || parsedPayload.problem || 'Awaiting telemetry specs',
                location: parsedPayload.location || 'Stranded Point Coordinates',
                time: parsedPayload.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: 'pending',
                latitude: parsedPayload.latitude || parsedPayload.lat || 12.9716,
                longitude: parsedPayload.longitude || parsedPayload.lon || 77.5946,
                customerId: parsedPayload.customerId || parsedPayload.userId || parsedPayload.id,
              };
              setBookings((prev) => {
                // avoid duplicate bookings
                if (prev.some(b => b.id === incomingRequest.id)) return prev;
                
                // New incoming booking! Play notification immediately
                playNotificationSound();
                
                return [incomingRequest, ...prev];
              });
            } catch (err) {
              console.error('[STOMP] Message parsing execution error:', err);
            }
          }
        });
      };

      client.onStompError = (frame) => {
        console.error('[STOMP] Broker reported error: ' + frame.headers['message']);
        console.error('[STOMP] Additional details: ' + frame.body);
      };

      client.onWebSocketClose = () => {
        setIsSocketConnected(false);
      };

      client.activate();
      stompClientRef.current = client;
    };

    connectToStompBroker();
    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [isLoggedIn, authToken, mechanicId]);

  // ─── Restore Session on App Launch ────────────────────────────────────────
  useEffect(() => {
    const loadStoredSession = async () => {
      try {
        const savedToken = await Storage.getItem('user_token');
        console.log('[SESSION] Restored token from storage:', savedToken ? 'FOUND' : 'NOT FOUND');
        if (savedToken) {
          setAuthToken(savedToken);
          axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
          await fetchUserProfile(savedToken);
          setIsLoggedIn(true);

          // Restore bookings
          try {
            const savedBookings = await Storage.getItem('mechanic_bookings');
            if (savedBookings) {
              setBookings(JSON.parse(savedBookings));
              console.log('[SESSION] Restored active bookings from local storage.');
            }
          } catch (e) {
            console.error('[SESSION] Failed to restore bookings');
          }
        }
      } catch (error) {
        console.error('[SESSION] Failed to load session token:', error);
      } finally {
        setAuthLoading(false);
      }
    };
    loadStoredSession();
  }, []);

  // ─── Location + Telemetry ──────────────────────────────────────────────────
  const setCurrentCoords = (coords: { latitude: number; longitude: number }) => {
    setCurrentCoordsState(coords);
    currentCoordsRef.current = coords;
  };

  // Broadcast location to WebSocket every 3 seconds ONLY if there is an active job en route
  useEffect(() => {
    if (!isLoggedIn || !isSocketConnected || !stompClientRef.current) return;

    const intervalId = setInterval(() => {
      // Find a booking that should actively broadcast location (before completion)
      const trackingBooking = bookingsRef.current.find(b => ['accepted', 'in_progress', 'arrived'].includes(b.status));
      const targetUserId = trackingBooking?.customerId ? Number(trackingBooking.customerId) : null;
      let coords = currentCoordsRef.current;

      // Find a booking that is currently en route to trigger the simulated movement
      const movingBooking = bookingsRef.current.find(b => ['accepted', 'in_progress'].includes(b.status));

      if (movingBooking && coords) {
        // SIMULATE MOVEMENT: continuously move the mechanic slightly while en route
        coords = {
          latitude: coords.latitude + 0.00005,
          longitude: coords.longitude + 0.00005,
        };
        currentCoordsRef.current = coords;
        setCurrentCoordsState(coords);
      }

      // Only send if we have a target user (customer) and coordinates
      if (targetUserId && coords && stompClientRef.current?.connected) {
        stompClientRef.current.publish({
          destination: `/topic/user/tracking/${targetUserId}`,
          body: JSON.stringify({
            userId: targetUserId,
            mechanicId: mechanicId,
            latitude: coords.latitude,
            longitude: coords.longitude,
          }),
        });
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [isLoggedIn, isSocketConnected, mechanicId]);

  // ─── Auth ──────────────────────────────────────────────────────────────────
  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${BASE_HTTP_URL}/api/auth/login`, { email, password });

      // Debug: log full server response so you can see exact field names
      console.log('[LOGIN] Full server response:', JSON.stringify(response.data));

      let token: string | null = null;
      if (response.data) {
        if (typeof response.data === 'string') {
          token = response.data;
        } else {
          token =
            response.data.token ||
            response.data.accessToken ||
            response.data.access_token ||
            response.data.jwt ||
            response.data.bearerToken ||
            response.data.authToken ||
            null;
        }
      }

      console.log('[LOGIN] Token extracted:', token ? 'SUCCESS' : 'NULL — check field name above');

      if (token) {
        try {
          await Storage.setItem('user_token', token);
          console.log('[LOGIN] Token saved to storage successfully');
        } catch (storageError) {
          console.error('[LOGIN] Storage save failed:', storageError);
          // Continue anyway — session will work for this app launch
        }
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setAuthToken(token);
        await fetchUserProfile(token);
        setIsLoggedIn(true);
        return { success: true };
      }

      return { success: false, error: 'Authentication token not found in server response.' };
    } catch (error: any) {
      console.error('[LOGIN] Request failed:', error?.response?.data || error?.message);
      if (!error.response) return { success: false, isOffline: true };
      return { success: false, error: error.response.data?.message || 'Invalid credentials.' };
    }
  };

  const signup = async (
    name: string,
    email: string,
    phone: string,
    password: string,
    lat: number,
    lng: number,
    shopName: string
  ) => {
    try {
      const response = await axios.post(`${BASE_HTTP_URL}/api/auth/register`, {
        name, email, phone, password, lat, lng, shopName,
      });
      if (response.data) return { success: true };
      return { success: false, error: 'Registration failed' };
    } catch (error: any) {
      if (!error.response) return { success: false, isOffline: true };
      return { success: false, error: error.response.data?.message };
    }
  };

  const logout = async () => {
    try {
      if (stompClientRef.current) stompClientRef.current.deactivate();
      await Storage.removeItem('user_token');
      console.log('[LOGOUT] Token cleared from storage');
    } catch (error) {
      console.error('[LOGOUT] Failed to clear token:', error);
    } finally {
      delete axios.defaults.headers.common['Authorization'];
      setAuthToken(null);
      setIsLoggedIn(false);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const response = await axios.post(`${BASE_HTTP_URL}/api/auth/forgot-password?email=${encodeURIComponent(email)}`);
      return { success: true };
    } catch (error: any) {
      console.error('[AUTH] Forgot password failed:', error?.response?.data || error?.message);
      return { success: false, error: error.response?.data?.message || 'Failed to send OTP.' };
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    try {
      const response = await axios.post(`${BASE_HTTP_URL}/api/auth/verify-otp`, { email, otp });
      return { success: true };
    } catch (error: any) {
      console.error('[AUTH] Verify OTP failed:', error?.response?.data || error?.message);
      return { success: false, error: error.response?.data?.message || 'Invalid OTP.' };
    }
  };

  const resetPassword = async (oldPassword: string, newPassword: string) => {
    try {
      const response = await axios.post(`${BASE_HTTP_URL}/api/auth/reset-password`, { oldPassword, newPassword });
      return { success: true };
    } catch (error: any) {
      console.error('[AUTH] Reset password failed:', error?.response?.data || error?.message);
      return { success: false, error: error.response?.data?.message || 'Failed to reset password.' };
    }
  };

  const updateBookingStatus = async (id: string, status: Booking['status']) => {
    try {
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));

      const numericId = parseInt(id.replace(/\D/g, ''), 10);
      if (isNaN(numericId)) {
        console.warn(`[BOOKING] Could not parse numeric ID from booking ID: ${id}`);
        return { success: false, error: 'Invalid booking ID format.' };
      }

      if (status === 'accepted') {
        await axios.patch(`${BASE_HTTP_URL}/api/booking/accept/${numericId}`);
        console.log(`[BOOKING] Successfully accepted booking ${numericId} on server`);
      } else if (status === 'rejected') {
        await axios.patch(`${BASE_HTTP_URL}/api/booking/reject/${numericId}`);
        console.log(`[BOOKING] Successfully rejected booking ${numericId} on server`);
      } else if (status === 'completed') {
        // Only complete booking here
        await axios.patch(`${BASE_HTTP_URL}/api/booking/complete/${numericId}`);
        console.log(`[BOOKING] Successfully completed booking ${numericId} on server`);
      } else {
        console.log(`[BOOKING] Local status update only for status: ${status}`);
      }

      // Broadcast location and status change via WebSocket to customer
      const booking = bookingsRef.current.find(b => String(b.id) === String(id));
      const targetUserId = booking?.customerId ? Number(booking.customerId) : null;
      const coords = currentCoordsRef.current;

      if (targetUserId && stompClientRef.current?.connected) {
        if (status === 'arrived') {
          stompClientRef.current.publish({
            destination: `/topic/user/tracking/${targetUserId}`,
            body: JSON.stringify({
              userId: targetUserId,
              mechanicId: mechanicId,
              latitude: coords ? coords.latitude : 12.9352,
              longitude: coords ? coords.longitude : 77.6245,
              status: 'arrived',
              arrived: true
            }),
          });
          console.log(`[SOCKET] Broadcasted arrived status and location for booking: ${id}`);
        } else if (status === 'completed') {
          stompClientRef.current.publish({
            destination: `/topic/user/tracking/${targetUserId}`,
            body: JSON.stringify({
              userId: targetUserId,
              mechanicId: mechanicId,
              latitude: coords ? coords.latitude : 12.9352,
              longitude: coords ? coords.longitude : 77.6245,
              status: 'completed',
              completed: true
            }),
          });
          console.log(`[SOCKET] Broadcasted completed status and location for booking: ${id}`);
        }
      }

      return { success: true };
    } catch (error: any) {
      console.error(`[BOOKING] Failed to update status to ${status} on server:`, error?.response?.data || error?.message);

      // If server says it is already in the target state (e.g. COMPLETED conflict), treat as success
      if (error?.response?.status === 409 && error?.response?.data?.message?.includes(status.toUpperCase())) {
        console.log(`[BOOKING] Server indicates booking is already ${status}. Treating as success.`);
        return { success: true };
      }

      return { success: false, isOffline: true, error: error.response?.data?.message || 'Failed to update status.' };
    }
  };

  const generateBill = async (id: string, billDetails?: any) => {
    try {
      const numericId = parseInt(id.replace(/\D/g, ''), 10);
      if (isNaN(numericId)) {
        console.warn(`[BOOKING] Could not parse numeric ID for bill generation: ${id}. Simulating offline mode.`);
        return { success: false, isOffline: true };
      }

      const defaultBill = {
        bookingId: numericId,
        serviceCharge: billDetails?.serviceCharge || 0,
        partsCost: billDetails?.partsCost || 0,
        extraCharges: billDetails?.extraCharges || 0,
        billingDetails: billDetails?.billingDetails || "Standard Service Completion"
      };

      const newTotal = defaultBill.serviceCharge + defaultBill.partsCost + defaultBill.extraCharges;
      setBookings((prev) => prev.map(b => b.id === id ? { ...b, price: newTotal } : b));

      await axios.post(`${BASE_HTTP_URL}/api/booking/generate-bill`, defaultBill);
      console.log(`[BOOKING] Generated bill for booking ${numericId}`);
      return { success: true };
    } catch (error: any) {
      console.error(`[BOOKING] Failed to generate bill:`, error?.response?.data || error?.message);

      return { success: false, isOffline: true, error: error.response?.data?.message || 'Failed to generate bill.' };
    }
  };

  const acceptBooking = async (id: string) => updateBookingStatus(id, 'accepted');
  const rejectBooking = async (id: string) => updateBookingStatus(id, 'rejected');

  const refreshBookings = async () => {
    if (!authToken) return;

    try {
      try {
        const statsRes = await axios.get(`${BASE_HTTP_URL}/api/mechanic/dashboard`);
        setDashboardStats(statsRes.data);
      } catch (e: any) {
        console.log(`[DASHBOARD] Could not fetch stats: ${e.message}`);
      }

      try {
        const weeklyRes = await axios.get(`${BASE_HTTP_URL}/api/mechanic/weekly-jobs`);
        setWeeklyJobs(weeklyRes.data || []);
      } catch (e: any) {
        console.log(`[WEEKLY-JOBS] Could not fetch weekly jobs: ${e.message}`);
      }

      // Removed 'ARRIVED' which is not valid on the backend swagger
      const statuses = ['PENDING', 'ACCEPTED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED'];
      const allBookings: Booking[] = [];

      for (const status of statuses) {
        try {
          const response = await axios.get(`${BASE_HTTP_URL}/api/mechanic/history?status=${status}`);
          const fetchedBookings = response.data || [];

          fetchedBookings.forEach((b: any) => {
            allBookings.push({
              id: String(b.bookingId),
              customerName: b.customerName || 'Customer',
              customerPhone: b.customerPhone || '',
              vehicle: b.problem || 'Unknown Vehicle',
              serviceType: b.problem || 'Service',
              price: b.totalAmount || 120,
              notes: b.problem || '',
              location: 'Mapped Location',
              time: b.bookedTime ? new Date(b.bookedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString(),
              status: b.status?.toLowerCase() || status.toLowerCase(),
              latitude: b.latitude || 0,
              longitude: b.longitude || 0,
              customerId: b.customerId || undefined,
            });
          });
        } catch (err: any) {
          console.log(`[BOOKING] Could not fetch ${status} bookings: ${err.message}`);
        }
      }

      setBookings(allBookings);
    } catch (error) {
      console.error('[BOOKING] Failed to refresh bookings history:', error);
    }
  };

  const addSimulatedBooking = (bookingData: any) => {
    const newBooking: Booking = {
      id: `B00${bookings.length + 1}`,
      status: 'pending',
      ...bookingData,
    };
    setBookings((prev) => [newBooking, ...prev]);
  };

  const sendLocationToCustomer = async (bookingId: string): Promise<{ success: boolean; isOffline?: boolean; error?: string }> => {
    const booking = bookingsRef.current.find(b => String(b.id) === String(bookingId));
    if (!booking) {
      return { success: false, error: 'Booking not found' };
    }
    if (!['accepted', 'in_progress', 'arrived'].includes(booking.status)) {
      return { success: false, error: 'Location can only be shared after the booking is accepted (booked).' };
    }
    const targetUserId = booking.customerId ? Number(booking.customerId) : null;
    const coords = currentCoordsRef.current;

    if (!coords) {
      return { success: false, error: 'GPS location coordinates not available yet.' };
    }

    if (!isSocketConnected || !stompClientRef.current || !stompClientRef.current.connected) {
      console.log('[SOCKET OFFLINE] Simulating location send to /app/mechanic/location:', {
        userId: targetUserId || 999,
        lat: coords.latitude,
        lon: coords.longitude,
      });
      return { success: true, isOffline: true };
    }

    try {
      stompClientRef.current.publish({
        destination: '/app/mechanic/location',
        body: JSON.stringify({
          userId: targetUserId || 999,
          lat: coords.latitude,
          lon: coords.longitude,
        }),
      });
      console.log('[SOCKET] Manually sent location update to /app/mechanic/location for customer:', targetUserId);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to send location via WebSocket' };
    }
  };

  
  const toggleDarkMode = () => setDarkMode((prev) => !prev);
  const toggleNotifications = () => setNotificationsEnabled((prev) => !prev);
  const updateGarageInfo = (info: Partial<GarageInfo>) =>
    setGarageInfo((prev) => ({ ...prev, ...info }));

  const updateProfileOnServer = async (name: string, phoneNo: string, experience: string) => {
    try {
      const response = await axios.put(`${BASE_HTTP_URL}/api/user/profile/update`, {
        name,
        phoneNo,
        experience
      });
      console.log('[PROFILE] Updated profile on server:', response.data);
      return { success: true };
    } catch (error: any) {
      console.error('[PROFILE] Failed to update profile:', error?.response?.data || error?.message);
      return { success: false, error: error.response?.data?.message || 'Failed to update profile.' };
    }
  };

  
  const contextValue = React.useMemo(() => {
    const completedJobsCount = bookings.filter((b) => b.status === 'completed').length;
    const dailyEarnings = bookings.filter((b) => b.status === 'completed').reduce((sum, b) => sum + (Number(b.price) || 0), 0);
    const monthlyEarnings = bookings.filter((b) => b.status === 'completed').reduce((sum, b) => sum + (Number(b.price) || 0), 0);
    const totalEarnings = bookings.filter((b) => b.status === 'completed').reduce((sum, b) => sum + (Number(b.price) || 0), 0);

    return {
      isLoggedIn,
      authToken,
      authLoading,
      bookings,
      darkMode,
      isOnline,
      isSocketConnected,
      currentCoords,
      mechanicId,
      completedJobsCount,
      dailyEarnings,
      monthlyEarnings,
      totalEarnings,
      garageInfo,
      reviews: [],
      notificationsEnabled,
      setIsOnline,
      setCurrentCoords,
      toggleDarkMode,
      toggleNotifications,
      login,
      logout,
      signup,
      updateBookingStatus,
      acceptBooking,
      rejectBooking,
      refreshBookings,
      generateBill,
      addSimulatedBooking,
      updateGarageInfo,
      updateProfileOnServer,
      forgotPassword,
      verifyOtp,
      resetPassword,
      sendLocationToCustomer,
      dashboardStats,
      weeklyJobs,
    };
  }, [
    isLoggedIn,
    authToken,
    authLoading,
    bookings,
    darkMode,
    isOnline,
    isSocketConnected,
    currentCoords,
    mechanicId,
    garageInfo,
    notificationsEnabled,
    dashboardStats,
    weeklyJobs,
  ]);

  return (
    <MechanicContext.Provider value={contextValue}>
      {children}
    </MechanicContext.Provider>
  );
};

export const useMechanic = () => {
  const context = useContext(MechanicContext);
  if (!context) throw new Error('useMechanic must be used within a MechanicProvider');
  return context;
};