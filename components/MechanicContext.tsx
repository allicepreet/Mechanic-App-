import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { Client } from '@stomp/stompjs';
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
}

export interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  service: string;
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
  const [darkMode, setDarkMode] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

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
    name: 'Apex Auto Works',
    ownerName: 'Dominic T.',
    phone: '+1 (555) 999-8800',
    address: '10880 El Mirador Dr, Los Angeles, CA',
    workingHours: '8:00 AM - 10:00 PM',
    specialties: ['EV Battery Calibration', 'ECU Tuning', 'High-Performance Diagnostics Frameworks'],
  });

  const stompClientRef = useRef<any>(null);

  // ─── WebSocket / STOMP Connection ─────────────────────────────────────────
  useEffect(() => {
    if (!isLoggedIn) {
      if (stompClientRef.current) stompClientRef.current.deactivate();
      return;
    }

    const connectToStompBroker = () => {
      console.log('[STOMP] Initializing network socket stream...');
      
      const client = new Client({
        webSocketFactory: () => new SockJS(`${BASE_HTTP_URL}/ws`),
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
              };
              setBookings((prev) => {
                // avoid duplicate bookings
                if (prev.some(b => b.id === incomingRequest.id)) return prev;
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
      if (stompClientRef.current) stompClientRef.current.deactivate();
    };
  }, [isLoggedIn, mechanicId]);

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

  // Broadcast location to WebSocket every 3 seconds
  useEffect(() => {
    if (!isLoggedIn || !isSocketConnected || !stompClientRef.current) return;

    const intervalId = setInterval(() => {
      const coords = currentCoordsRef.current;
      if (coords && stompClientRef.current?.connected) {
        stompClientRef.current.publish({
          destination: '/app/mechanic/location',
          body: JSON.stringify({
            userId: Number(mechanicId),
            lat: coords.latitude,
            lon: coords.longitude,
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
      } else if (status === 'completed') {
        // Only complete booking here
        await axios.patch(`${BASE_HTTP_URL}/api/booking/complete/${numericId}`);
        console.log(`[BOOKING] Successfully completed booking ${numericId} on server`);
      } else {
        console.log(`[BOOKING] Local status update only for status: ${status}`);
      }
      return { success: true };
    } catch (error: any) {
      console.error(`[BOOKING] Failed to update status to ${status} on server:`, error?.response?.data || error?.message);
      // Fallback to simulation mode so flow can continue even if backend fails
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
        serviceCharge: billDetails?.serviceCharge || 120,
        partsCost: billDetails?.partsCost || 0,
        extraCharges: billDetails?.extraCharges || 0,
        billingDetails: billDetails?.billingDetails || "Standard Service Completion"
      };
      await axios.post(`${BASE_HTTP_URL}/api/booking/generate-bill`, defaultBill);
      console.log(`[BOOKING] Generated bill for booking ${numericId}`);
      return { success: true };
    } catch (error: any) {
      console.error(`[BOOKING] Failed to generate bill:`, error?.response?.data || error?.message);
      // Fallback to simulation mode so flow can continue even if backend fails
      return { success: false, isOffline: true, error: error.response?.data?.message || 'Failed to generate bill.' };
    }
  };

  const acceptBooking = async (id: string) => updateBookingStatus(id, 'accepted');
  const rejectBooking = async (id: string) => updateBookingStatus(id, 'rejected');
  const refreshBookings = () => { }; // Bookings arrive via WebSocket only

  const addSimulatedBooking = (bookingData: any) => {
    const newBooking: Booking = {
      id: `B00${bookings.length + 1}`,
      status: 'pending',
      ...bookingData,
    };
    setBookings((prev) => [newBooking, ...prev]);
  };

  // ─── Settings ─────────────────────────────────────────────────────────────
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

  // ─── Provider ──────────────────────────────────────────────────────────────
  return (
    <MechanicContext.Provider
      value={{
        isLoggedIn,
        authToken,
        authLoading,
        bookings,
        darkMode,
        isOnline,
        isSocketConnected,
        currentCoords,
        mechanicId,
        completedJobsCount: bookings.filter((b) => b.status === 'completed').length,
        dailyEarnings: 1100 + bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + (Number(b.price) || 120), 0),
        monthlyEarnings: 4500 + bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + (Number(b.price) || 120), 0),
        totalEarnings: 5600 + bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + (Number(b.price) || 120), 0),
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
      }}
    >
      {children}
    </MechanicContext.Provider>
  );
};

export const useMechanic = () => {
  const context = useContext(MechanicContext);
  if (!context) throw new Error('useMechanic must be used within a MechanicProvider');
  return context;
};