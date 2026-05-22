import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useColorScheme as useDeviceColorScheme, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/constants/Api';
import * as Location from 'expo-location';

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
  distance?: string;
  eta?: string;
  latitude?: number;
  longitude?: number;
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

const b64Decode = (str: string): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let buffer = '';
  const cleanStr = str.replace(/=+$/, '');
  let bc = 0;
  let bs = 0;
  
  for (let i = 0; i < cleanStr.length; i++) {
    const char = cleanStr.charAt(i);
    const idx = chars.indexOf(char);
    if (idx === -1) continue;
    
    bs = bc % 4 ? bs * 64 + idx : idx;
    if (bc++ % 4) {
      buffer += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6)));
    }
  }
  return buffer;
};

export const decodeJwt = (token: string): any => {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = b64Decode(base64);
    
    const jsonPayload = decodeURIComponent(
      decoded
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.warn('--- [JWT DECODE FAILED] ---', err);
    return null;
  }
};

const encodeStompFrame = (command: string, headers: Record<string, string>, body: string = ''): string => {
  let frame = `${command}\n`;
  for (const [key, val] of Object.entries(headers)) {
    frame += `${key}:${val}\n`;
  }
  frame += `\n${body}\u0000`;
  return frame;
};

// ─── Centralised authenticated fetch ────────────────────────────────────────
// A shared ref that the MechanicProvider keeps up-to-date with the live token.
// All API calls go through authFetch() so the header is always present.
const _sharedTokenRef = { current: null as string | null };
export const setSharedToken = (token: string | null) => {
  _sharedTokenRef.current = token;
  console.log('--- [AUTH FETCH] Shared token updated:', token ? 'PRESENT' : 'NULL');
};

const authFetch = (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = _sharedTokenRef.current;
  const existingHeaders = (options.headers as Record<string, string>) || {};
  const mergedHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...existingHeaders,
  };
  if (token) {
    mergedHeaders['Authorization'] = `Bearer ${token}`;
    console.log(`--- [AUTH FETCH] ${options.method || 'GET'} ${url} — Authorization header attached ---`);
  } else {
    console.warn(`--- [AUTH FETCH] ${options.method || 'GET'} ${url} — No token, sending unauthenticated ---`);
  }
  return fetch(url, { ...options, headers: mergedHeaders });
};
// ────────────────────────────────────────────────────────────────────────────

interface StompFrame {
  command: string;
  headers: Record<string, string>;
  body: string;
}

const decodeStompFrame = (data: string): StompFrame[] => {
  const frames: StompFrame[] = [];
  // Normalize CRLF to LF to make parsing bulletproof across different STOMP server implementations
  const normalizedData = data.replace(/\r\n/g, '\n');
  const rawFrames = normalizedData.split('\u0000');
  
  for (const raw of rawFrames) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    
    const parts = trimmed.split('\n\n');
    const headerLines = parts[0].split('\n');
    const command = headerLines[0].trim();
    const headers: Record<string, string> = {};
    
    for (let i = 1; i < headerLines.length; i++) {
      const line = headerLines[i].trim();
      if (!line) continue;
      const colonIdx = line.indexOf(':');
      if (colonIdx !== -1) {
        const key = line.substring(0, colonIdx).trim();
        const val = line.substring(colonIdx + 1).trim();
        headers[key] = val;
      }
    }
    
    const body = parts.slice(1).join('\n\n').trim();
    frames.push({ command, headers, body });
  }
  
  return frames;
};

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
  logout: () => void | Promise<void>;
  refreshBookings: () => void;
  isLoggedIn: boolean;
  authLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string; isOffline?: boolean }>;
  signup: (
    name: string,
    email: string,
    phone: string,
    password?: string,
    latitude?: number,
    longitude?: number,
    shopName?: string
  ) => Promise<{ success: boolean; error?: string; isOffline?: boolean }>;
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  isSocketConnected: boolean;
  currentCoords: { latitude: number; longitude: number } | null;
  setCurrentCoords: (coords: { latitude: number; longitude: number } | null) => void;
  mechanicId: number | null;
  setMechanicId: (id: number | null) => void;
  authToken: string | null;
  setAuthToken: (token: string | null) => void;
  addSimulatedBooking: (booking: {
    customerName: string;
    customerPhone: string;
    vehicle: string;
    serviceType: string;
    price: number;
    notes: string;
    location: string;
    time: string;
  }) => void;
}

const MechanicContext = createContext<MechanicContextType | undefined>(undefined);

const INITIAL_BOOKINGS: Booking[] = [];

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'R001',
    customerName: 'David Miller',
    rating: 5,
    comment: 'Exceptional service! Arrived in under 30 minutes in his mobile tuning van. Checked EV battery health and calibrated system perfectly right in my driveway.',
    date: 'Yesterday',
    service: 'EV Battery Telemetry Calibration',
  },
  {
    id: 'R002',
    customerName: 'Emily Watson',
    rating: 5,
    comment: 'Super professional mobile specialist. My Audi drives perfectly after the stage 2 tune. Came straight to my office park. Highly recommend Dominic!',
    date: 'Yesterday',
    service: 'ECU Stage 2 Performance Tune',
  },
];

const INITIAL_GARAGE: GarageInfo = {
  name: 'Dominic T.',
  ownerName: 'Independent Mobile Specialist',
  phone: '+1 (555) 999-8800',
  address: 'Austin Service Zone & Mobile Dispatch Hub',
  workingHours: 'Active Shifts: 8:00 AM - 8:00 PM',
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
  const [authLoading, setAuthLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{ latitude: number; longitude: number } | null>({ latitude: 12.9352, longitude: 77.6245 });
  const [mechanicId, setMechanicId] = useState<number | null>(5);
  const [authToken, setAuthToken] = useState<string | null>(null);

  const currentCoordsRef = useRef<{ latitude: number; longitude: number } | null>({ latitude: 12.9352, longitude: 77.6245 });

  // Always start fresh — clear any stored session so user must log in every time
  useEffect(() => {
    const clearAndStart = async () => {
      try {
        console.log('--- [AUTH INIT] Clearing stored session — login required on every launch ---');
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('mechanicId');
        console.log('--- [AUTH INIT] Session cleared. Redirecting to login ---');
      } catch (err) {
        console.warn('--- [AUTH INIT ERROR] Failed to clear session ---', err);
      } finally {
        setAuthLoading(false);
      }
    };
    clearAndStart();
  }, []);
  const socketRef = useRef<WebSocket | null>(null);
  const isStompConnectedRef = useRef(false);
  const mechanicIdRef = useRef<number | null>(5);
  const authTokenRef = useRef<string | null>(null);

  useEffect(() => {
    mechanicIdRef.current = mechanicId;
  }, [mechanicId]);

  // Keep authTokenRef + shared module token always in sync with authToken state
  useEffect(() => {
    authTokenRef.current = authToken;
    setSharedToken(authToken);
    console.log('--- [AUTH TOKEN REF] Token updated:', authToken ? 'PRESENT' : 'NULL');
  }, [authToken]);

  // Dynamic Real-time GPS Tracker using expo-location with simulated drift fallback
  useEffect(() => {
    if (!isLoggedIn) return;

    let isMounted = true;
    let locationSubscription: any = null;
    let simulatedInterval: any = null;

    const startTracking = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          console.log('--- [GPS ACTIVE] Location permission granted. Watching device coordinates ---');
          locationSubscription = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.Balanced,
              timeInterval: 5000,
              distanceInterval: 5,
            },
            (location) => {
              if (isMounted && location?.coords) {
                const { latitude, longitude } = location.coords;
                console.log(`--- [GPS UPDATE] Live position: ${latitude}, ${longitude} ---`);
                setCurrentCoords({ latitude, longitude });
              }
            }
          );
          return;
        }
      } catch (err) {
        console.warn('--- [GPS WARNING] expo-location failed, using simulation: ---', err);
      }

      // Fallback: simulated drift if permissions denied or running in emulator/web
      console.log('--- [GPS SIMULATION] Running simulated drift telemetry ---');
      simulatedInterval = setInterval(() => {
        if (!isMounted) return;
        
        // Skip drift if we are currently simulating route navigation
        const hasActiveRouteSim = bookings.some((b) => b.status === 'in_progress');
        if (hasActiveRouteSim) return;

        setCurrentCoords((prev) => {
          if (!prev) return { latitude: 12.9352, longitude: 77.6245 };
          const latDrift = (Math.random() - 0.5) * 0.00004;
          const lonDrift = (Math.random() - 0.5) * 0.00004;
          return {
            latitude: prev.latitude + latDrift,
            longitude: prev.longitude + lonDrift,
          };
        });
      }, 5000);
    };

    startTracking();

    return () => {
      isMounted = false;
      if (locationSubscription) {
        locationSubscription.remove();
      }
      if (simulatedInterval) {
        clearInterval(simulatedInterval);
      }
    };
  }, [isLoggedIn, bookings]);

  const handleNewBookingDispatch = (bookingData: any) => {
    if (bookingData && (bookingData.customerName || bookingData.id || bookingData.customerPhone)) {
      console.log('--- [WEBSOCKET NEW BOOKING RECEIVED] ---', bookingData);
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const newBooking: Booking = {
        id: String(bookingData.id || `B${randomSuffix}`),
        customerName: bookingData.customerName || 'Emergency Customer',
        customerPhone: bookingData.customerPhone || bookingData.phone || '+1 (555) 000-0000',
        vehicle: bookingData.vehicle || 'Tesla Model 3',
        serviceType: bookingData.serviceType || 'Roadside Assistance',
        price: Number(bookingData.price || 150),
        status: 'pending',
        date: 'Today',
        time: bookingData.time || 'Just Now',
        notes: bookingData.notes || 'Emergency request dispatched via STOMP WebSocket.',
        location: bookingData.location || 'Active GPS Dispatch',
        distance: bookingData.distance || '2.5 km',
        eta: bookingData.eta || '10 mins',
        latitude: Number(bookingData.latitude || 12.9352),
        longitude: Number(bookingData.longitude || 77.6245),
      };
      setBookings((prev) => {
        if (prev.some((b) => b.id === newBooking.id)) return prev;
        return [newBooking, ...prev];
      });
      // Fire premium native alert popup dialog modal with dual Accept/Decline action buttons
      Alert.alert(
        '🚨 NEW BOOKING REQUEST',
        `Customer: ${newBooking.customerName}\nVehicle: ${newBooking.vehicle}\nService: ${newBooking.serviceType}\nPrice: Rs. ${newBooking.price}`,
        [
          {
            text: 'Decline',
            style: 'destructive',
            onPress: () => rejectBooking(newBooking.id),
          },
          {
            text: 'Accept',
            style: 'default',
            onPress: () => acceptBooking(newBooking.id),
          },
        ],
        { cancelable: false }
      );
    }
  };

  // Auto-reconnecting Real-time WebSocket STOMP Client
  useEffect(() => {
    if (!isLoggedIn || !isOnline) {
      setIsSocketConnected(false);
      return;
    }

    let reconnectTimeout: any = null;
    let isMounted = true;

    const connectWebSocket = () => {
      // Connect to the raw WebSocket SockJS transport endpoint
      const wsUrl = `${API_BASE_URL.replace(/^http/, 'ws')}/ws/websocket`;
      console.log(`--- [WEBSOCKET CONNECT] Connecting to ${wsUrl} ---`);

      try {
        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;
        isStompConnectedRef.current = false;

        socket.onopen = () => {
          console.log(`--- [WEBSOCKET OPEN] Connected to raw WS endpoint: ${wsUrl} ---`);
          
          // Send STOMP CONNECT frame
          console.log('--- [STOMP CONNECT] Sending CONNECT frame ---');
          const connectHeaders: Record<string, string> = {
            'accept-version': '1.1,1.2',
            'heart-beat': '10000,10000',
          };
          const liveToken = authTokenRef.current;
          if (liveToken) {
            connectHeaders['Authorization'] = `Bearer ${liveToken}`;
            console.log('--- [STOMP CONNECT] Attaching Authorization header ---');
          } else {
            console.warn('--- [STOMP CONNECT] No auth token available ---');
          }
          const connectFrame = encodeStompFrame('CONNECT', connectHeaders);
          socket.send(connectFrame);
        };

        socket.onmessage = (event) => {
          const rawData = event.data;
          console.log('--- [WEBSOCKET MESSAGE] Raw received data:', rawData);

          // Detect STOMP frame protocol
          if (rawData.startsWith('CONNECTED') || rawData.startsWith('MESSAGE') || rawData.startsWith('ERROR') || rawData.includes('\u0000')) {
            try {
              const frames = decodeStompFrame(rawData);
              for (const frame of frames) {
                console.log(`--- [STOMP FRAME] Command: ${frame.command} ---`, frame.headers);

                if (frame.command === 'CONNECTED') {
                  console.log('--- [STOMP CONNECTED] Handshake completed successfully ---');
                  isStompConnectedRef.current = true;
                  setIsSocketConnected(true);
                  
                  // Subscribe to specific mechanic's topic
                  const activeId = mechanicIdRef.current || 5;
                  const subscribeFrame = encodeStompFrame('SUBSCRIBE', {
                    id: 'sub-0',
                    destination: `/topic/mechanic/${activeId}`
                  });
                  socket.send(subscribeFrame);
                  console.log(`--- [STOMP SUBSCRIBE] Subscribed to /topic/mechanic/${activeId} ---`);

                  // Send initial location if available
                  if (currentCoordsRef.current) {
                    const locUpdate = {
                      type: 'LOCATION_UPDATE',
                      latitude: currentCoordsRef.current.latitude,
                      longitude: currentCoordsRef.current.longitude,
                      mechanicId: activeId
                    };
                    const stompSend = encodeStompFrame('SEND', {
                      destination: `/app/location/${activeId}`
                    }, JSON.stringify(locUpdate));
                    socket.send(stompSend);
                    console.log('--- [STOMP SEND] Sent initial location telemetry via STOMP ---');
                  }
                }

                if (frame.command === 'MESSAGE') {
                  console.log('--- [STOMP MESSAGE RECEIVED] ---', frame.body);
                  try {
                    const bookingData = JSON.parse(frame.body);
                    if (bookingData) {
                      handleNewBookingDispatch(bookingData);
                    }
                  } catch (jsonErr) {
                    console.warn('--- [STOMP MESSAGE JSON PARSE ERROR] ---', jsonErr);
                  }
                }

                if (frame.command === 'ERROR') {
                  console.warn('--- [STOMP PROTOCOL ERROR] ---', frame.body);
                }
              }
            } catch (stompErr) {
              console.warn('--- [STOMP DECODE ERROR] ---', stompErr);
            }
          } else {
            // Fallback to standard raw WebSocket JSON if backend runs in raw websocket mode
            try {
              const message = JSON.parse(rawData);
              if (message.type === 'NEW_BOOKING' || message.action === 'newBooking' || message.booking) {
                const bookingData = message.booking || message.data || message;
                handleNewBookingDispatch(bookingData);
              }
            } catch (jsonErr) {
              console.warn('--- [RAW WEBSOCKET PARSE ERROR] ---', jsonErr);
            }
          }
        };

        socket.onclose = (event) => {
          console.log(`--- [WEBSOCKET CLOSE] Closed: Code ${event.code}, Reason: ${event.reason || 'None'} ---`);
          socketRef.current = null;
          isStompConnectedRef.current = false;
          setIsSocketConnected(false);
          if (isMounted) {
            reconnectTimeout = setTimeout(connectWebSocket, 5000);
          }
        };

        socket.onerror = (err) => {
          console.warn('--- [WEBSOCKET ERROR] Connection error ---', err);
          setIsSocketConnected(false);
        };
      } catch (wsErr) {
        console.error('--- [WEBSOCKET EXCEPTION] Failed to initialize WebSocket ---', wsErr);
        socketRef.current = null;
        isStompConnectedRef.current = false;
        setIsSocketConnected(false);
        if (isMounted) {
          reconnectTimeout = setTimeout(connectWebSocket, 5000);
        }
      }
    };

    connectWebSocket();

    return () => {
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.close();
      }
      socketRef.current = null;
      isStompConnectedRef.current = false;
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [isLoggedIn, mechanicId, isOnline, authToken]);

  // Handle location telemetry streaming updates
  useEffect(() => {
    currentCoordsRef.current = currentCoords;
    if (isLoggedIn && isOnline && socketRef.current && socketRef.current.readyState === WebSocket.OPEN && currentCoords) {
      const locUpdate = {
        type: 'LOCATION_UPDATE',
        latitude: currentCoords.latitude,
        longitude: currentCoords.longitude,
        mechanicId: mechanicId || 5
      };
      
      try {
        if (isStompConnectedRef.current) {
          const activeId = mechanicId || 5;
          const stompSend = encodeStompFrame('SEND', {
            destination: `/app/location/${activeId}`
          }, JSON.stringify(locUpdate));
          socketRef.current.send(stompSend);
          console.log('--- [STOMP SEND] Sending location telemetry update:', locUpdate);
        } else {
          socketRef.current.send(JSON.stringify(locUpdate));
          console.log('--- [RAW WEBSOCKET SEND] Sending location telemetry update:', locUpdate);
        }
      } catch (sendErr) {
        console.warn('--- [WEBSOCKET SEND ERROR] Failed to send location update:', sendErr);
      }
    }
  }, [currentCoords, isLoggedIn, mechanicId, isOnline]);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string; isOffline?: boolean }> => {
    const targetUrl = `${API_BASE_URL}/api/auth/login`;
    const payload = {
      email,
      password,
    };

    console.log('--- [API REQUEST] Starting login ---');
    console.log(`URL: POST ${targetUrl}`);
    console.log('Payload:', JSON.stringify(payload, null, 2));

    try {
      const response = await authFetch(targetUrl, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      console.log('--- [API RESPONSE] Received login response ---');
      console.log(`Status Code: ${response.status} (${response.statusText})`);

      if (response.ok) {
        const resultText = await response.text();
        console.log('Login Success Response:', resultText);
        
        let tokenToDecode: string | null = null;
        let resolvedMechId = 5;
        try {
          const result = JSON.parse(resultText);
          if (result.token) tokenToDecode = result.token;
          else if (result.jwt) tokenToDecode = result.jwt;
          else if (result.accessToken) tokenToDecode = result.accessToken;
          else if (result.idToken) tokenToDecode = result.idToken;
          
          if (result.id) {
            resolvedMechId = Number(result.id);
            setMechanicId(resolvedMechId);
          } else if (result.mechanicId) {
            resolvedMechId = Number(result.mechanicId);
            setMechanicId(resolvedMechId);
          } else if (result.mechanic && result.mechanic.id) {
            resolvedMechId = Number(result.mechanic.id);
            setMechanicId(resolvedMechId);
          }
        } catch (e) {
          if (resultText.startsWith('eyJ') && resultText.split('.').length >= 2) {
            tokenToDecode = resultText;
          }
        }

        if (tokenToDecode) {
          console.log('--- [TOKEN RECEIVED] Saving and decoding token ---');
          // Immediately update both refs so authFetch uses the token right away
          // (React setState is async — useEffect sync would be too late)
          authTokenRef.current = tokenToDecode;
          setSharedToken(tokenToDecode);
          setAuthToken(tokenToDecode);
          await AsyncStorage.setItem('authToken', tokenToDecode);
          const decoded = decodeJwt(tokenToDecode);
          if (decoded) {
            console.log('--- [JWT DECODED PAYLOAD] ---', JSON.stringify(decoded, null, 2));
            const decodedId = decoded.id || decoded.mechanicId || decoded.userId || decoded.sub;
            if (decodedId) {
              const numericId = Number(decodedId);
              if (!isNaN(numericId)) {
                console.log(`--- [JWT SUCCESS] Decoded Mechanic ID: ${numericId} ---`);
                setMechanicId(numericId);
                resolvedMechId = numericId;
              }
            }
          }
          await AsyncStorage.setItem('mechanicId', String(resolvedMechId));
        }
        
        setIsLoggedIn(true);
        return { success: true };
      } else {
        const errorText = await response.text();
        console.warn('Login Error Response:', errorText);
        return { success: false, error: errorText || 'Invalid credentials' };
      }
    } catch (err: any) {
      console.error('--- [API EXCEPTION] Login Connection Error ---');
      console.error('Error Details:', err);
      return { 
        success: false, 
        error: err.message || 'Cannot connect to security mainframe. Please verify backend is running.', 
        isOffline: true 
      };
    }
  };

  const signup = async (
    name: string,
    email: string,
    phone: string,
    password?: string,
    latitude?: number,
    longitude?: number,
    shopName?: string
  ): Promise<{ success: boolean; error?: string; isOffline?: boolean }> => {
    // Save coordinate telemetry locally to be sent via WebSocket
    if (latitude !== undefined && longitude !== undefined) {
      setCurrentCoords({ latitude, longitude });
    }

    const targetUrl = `${API_BASE_URL}/api/auth/mechRegister`;
    const payload = {
      name,
      email,
      password: password || '12345678',
      phone,
      latitude: latitude !== undefined ? latitude : 0.0,
      longitude: longitude !== undefined ? longitude : 0.0,
      shopName: shopName || '',
    };

    console.log('--- [API REQUEST] Starting signup ---');
    console.log(`URL: POST ${targetUrl}`);
    console.log('Payload:', JSON.stringify(payload, null, 2));

    try {
      const response = await authFetch(targetUrl, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      console.log('--- [API RESPONSE] Received response ---');
      console.log(`Status Code: ${response.status} (${response.statusText})`);

      if (response.ok) {
        const successText = await response.text();
        console.log('Success Response Body:', successText);

        let tokenToDecode: string | null = null;
        let resolvedMechId = 5;
        try {
          const result = JSON.parse(successText);
          if (result.token) tokenToDecode = result.token;
          else if (result.jwt) tokenToDecode = result.jwt;
          else if (result.accessToken) tokenToDecode = result.accessToken;
          else if (result.idToken) tokenToDecode = result.idToken;
          
          if (result.id) {
            resolvedMechId = Number(result.id);
            setMechanicId(resolvedMechId);
          } else if (result.mechanicId) {
            resolvedMechId = Number(result.mechanicId);
            setMechanicId(resolvedMechId);
          } else if (result.mechanic && result.mechanic.id) {
            resolvedMechId = Number(result.mechanic.id);
            setMechanicId(resolvedMechId);
          }
        } catch (e) {
          if (successText.startsWith('eyJ') && successText.split('.').length >= 2) {
            tokenToDecode = successText;
          }
        }

        if (tokenToDecode) {
          console.log('--- [TOKEN RECEIVED] Saving and decoding token ---');
          // Immediately update both refs so authFetch uses the token right away
          authTokenRef.current = tokenToDecode;
          setSharedToken(tokenToDecode);
          setAuthToken(tokenToDecode);
          await AsyncStorage.setItem('authToken', tokenToDecode);
          const decoded = decodeJwt(tokenToDecode);
          if (decoded) {
            console.log('--- [JWT DECODED PAYLOAD] ---', JSON.stringify(decoded, null, 2));
            const decodedId = decoded.id || decoded.mechanicId || decoded.userId || decoded.sub;
            if (decodedId) {
              const numericId = Number(decodedId);
              if (!isNaN(numericId)) {
                console.log(`--- [JWT SUCCESS] Decoded Mechanic ID: ${numericId} ---`);
                setMechanicId(numericId);
                resolvedMechId = numericId;
              }
            }
          }
          await AsyncStorage.setItem('mechanicId', String(resolvedMechId));
        }

        setGarageInfo({
          name: shopName || 'Apex Auto Works',
          ownerName: name || 'Dominic T.',
          phone: phone || '+1 (555) 999-8800',
          address: '1024 Performance Way, Suite C',
          workingHours: 'Mon - Sat: 8:00 AM - 6:00 PM',
          specialties: ['Performance Tuning', 'Diagnostics', 'Brake Systems', 'High-End Alignment', 'EV Drivetrains'],
        });
        setIsLoggedIn(true);
        return { success: true };
      } else {
        const errorText = await response.text();
        console.warn('Error Response Body:', errorText);
        let errorMsg = 'Failed to register';
        try {
          const errorObj = JSON.parse(errorText);
          errorMsg = errorObj.message || errorObj.error || errorMsg;
        } catch {
          errorMsg = errorText || errorMsg;
        }
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('--- [API EXCEPTION] Network/Connection Error ---');
      console.error('Error Details:', err);
      return { 
        success: false, 
        error: err.message || 'Cannot connect to security mainframe. Please verify backend is running.', 
        isOffline: true 
      };
    }
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

  const acceptBooking = async (id: string) => {
    // Update local state immediately for instant feedback
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'accepted' as const } : b))
    );

    // Extract exact integer for bookingId path variable (e.g. 'B001' -> 1)
    const bookingIdInt = typeof id === 'number' ? id : parseInt(id.replace(/\D/g, '')) || 1;
    const mechId = mechanicId || 5;
    const targetUrl = `${API_BASE_URL}/api/booking/accept/${bookingIdInt}?mechanicId=${mechId}`;

    console.log('--- [API REQUEST] Starting Accept Booking ---');
    console.log(`URL: PATCH ${targetUrl}`);

    try {
      const response = await authFetch(targetUrl, { method: 'PATCH' });

      console.log('--- [API RESPONSE] Accept Booking ---');
      console.log(`Status Code: ${response.status}`);

      const responseText = await response.text();
      if (response.ok) {
        console.log('Success Response Body:', responseText);
      } else {
        console.warn('Accept Booking Error Response:', responseText);
      }
    } catch (err: any) {
      console.error('--- [API EXCEPTION] Accept Booking Connection Error ---');
      console.error('Error Details:', err);
    }
  };

  const rejectBooking = (id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'rejected' as const } : b))
    );
  };

  const updateBookingStatus = async (id: string, status: Booking['status']) => {
    // Update local state immediately for instant feedback
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b))
    );

    // If booking status transitions to 'completed', trigger the matching backend endpoint
    if (status === 'completed') {
      // Extract exact integer for bookingId path variable
      const bookingIdInt = typeof id === 'number' ? id : parseInt(id.replace(/\D/g, '')) || 1;
      const mechId = mechanicId || 5;
      const targetUrl = `${API_BASE_URL}/api/booking/complete/${bookingIdInt}?mechanicId=${mechId}`;

      console.log('--- [API REQUEST] Starting Complete Booking ---');
      console.log(`URL: PATCH ${targetUrl}`);

      try {
        const response = await authFetch(targetUrl, { method: 'PATCH' });

        console.log('--- [API RESPONSE] Complete Booking ---');
        console.log(`Status Code: ${response.status}`);

        const responseText = await response.text();
        if (response.ok) {
          console.log('Success Response Body:', responseText);
        } else {
          console.warn('Complete Booking Error Response:', responseText);
        }
      } catch (err: any) {
        console.error('--- [API EXCEPTION] Complete Booking Connection Error ---');
        console.error('Error Details:', err);
      }
    }
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

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('mechanicId');
      console.log('--- [AUTH PERSISTENCE CLEAR] Session cleared successfully ---');
    } catch (err) {
      console.warn('--- [AUTH PERSISTENCE CLEAR ERROR] ---', err);
    }
    setBookings(INITIAL_BOOKINGS);
    setAuthToken(null);
    setMechanicId(5);
    setIsSocketConnected(false);
    setIsLoggedIn(false);
  };

  const addSimulatedBooking = (bookingData: {
    customerName: string;
    customerPhone: string;
    vehicle: string;
    serviceType: string;
    price: number;
    notes: string;
    location: string;
    time: string;
  }) => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const newBooking: Booking = {
      id: `B${randomSuffix}`,
      customerName: bookingData.customerName,
      customerPhone: bookingData.customerPhone,
      vehicle: bookingData.vehicle,
      serviceType: bookingData.serviceType,
      price: bookingData.price,
      status: 'pending',
      date: 'Today',
      time: bookingData.time,
      notes: bookingData.notes,
      location: bookingData.location,
      distance: '2.5 km',
      eta: '10 mins',
      latitude: currentCoords ? currentCoords.latitude : 12.9352,
      longitude: currentCoords ? currentCoords.longitude : 77.6245,
    };
    setBookings((prev) => {
      if (prev.some((b) => b.id === newBooking.id)) return prev;
      return [newBooking, ...prev];
    });

    // Fire premium native alert popup dialog modal with dual Accept/Decline action buttons
    Alert.alert(
      '🚨 NEW SIMULATED BOOKING',
      `Customer: ${newBooking.customerName}\nVehicle: ${newBooking.vehicle}\nService: ${newBooking.serviceType}\nPrice: Rs. ${newBooking.price}`,
      [
        {
          text: 'Decline',
          style: 'destructive',
          onPress: () => rejectBooking(newBooking.id),
        },
        {
          text: 'Accept',
          style: 'default',
          onPress: () => acceptBooking(newBooking.id),
        },
      ],
      { cancelable: false }
    );
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
        authLoading,
        login,
        signup,
        isOnline,
        setIsOnline,
        isSocketConnected,
        currentCoords,
        setCurrentCoords,
        mechanicId,
        setMechanicId,
        authToken,
        setAuthToken,
        addSimulatedBooking,
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
