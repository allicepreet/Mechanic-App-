import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Animated, Easing, Platform, Dimensions, ActivityIndicator, Alert, KeyboardAvoidingView, ScrollView, AlertButton, Image } from 'react-native';
import { router } from 'expo-router';
import { useMechanic } from '@/components/MechanicContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function RegisterScreen() {
  const { signup, darkMode } = useMechanic();
  const insets = useSafeAreaInsets();

  // Web-safe alert dialog helper to guarantee visibility and support confirmations on web
  const showAlert = (title: string, message: string, buttons?: AlertButton[]) => {
    console.log(`[ALERT DIALOG] ${title}: ${message}`);
    if (Platform.OS === 'web') {
      if (buttons && buttons.length > 1) {
        const confirmResult = window.confirm(`${title}\n\n${message}`);
        if (confirmResult) {
          const primaryButton = buttons.find(b => b.style !== 'cancel') || buttons[0];
          if (primaryButton && primaryButton.onPress) primaryButton.onPress();
        } else {
          const cancelButton = buttons.find(b => b.style === 'cancel');
          if (cancelButton && cancelButton.onPress) cancelButton.onPress();
        }
      } else {
        window.alert(`${title}\n\n${message}`);
        if (buttons && buttons[0] && buttons[0].onPress) {
          buttons[0].onPress();
        }
      }
    } else {
      Alert.alert(title, message, buttons);
    }
  };

  // Registration Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [shopName, setShopName] = useState(''); // Optional shop name for local garage display
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState({ name: false, email: false, phone: false, password: false, shop: false });

  // Location / GPS Telemetry States
  const [lat, setLat] = useState(''); // Initially empty, locked GPS required
  const [lng, setLng] = useState(''); // Initially empty, locked GPS required
  const [isLocating, setIsLocating] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<'IDLE' | 'LOCATING' | 'LOCKED' | 'ERROR'>('IDLE');

  // Animation values for rotating mainframe shield & scanner HUD
  const floatAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const radarSweepAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  const neonGreen = '#00E676';
  const neonCyan = '#06B6D4';

  useEffect(() => {
    // Start ambient animations
    Animated.parallel([
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -10,
            duration: 2200,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 2200,
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 16000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      )
    ]).start();
  }, []);

  // Triggered when locating starts
  const startRadarSweep = () => {
    radarSweepAnim.setValue(0);
    Animated.loop(
      Animated.timing(radarSweepAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      { iterations: -1 }
    ).start();
  };

  const stopRadarSweep = () => {
    radarSweepAnim.stopAnimation();
  };

  const handleRequestLocation = async () => {
    setIsLocating(true);
    setGpsStatus('LOCATING');
    startRadarSweep();

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showAlert(
          'Location Access Denied',
          'GPS permission is required for dispatch distance calculations. Reverting to Austin Mainframe coordinates.',
          [{ text: 'OK' }]
        );
        setGpsStatus('ERROR');
        stopRadarSweep();
        setIsLocating(false);
        return;
      }

      // Request precise location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLat(location.coords.latitude.toFixed(6));
      setLng(location.coords.longitude.toFixed(6));
      setGpsStatus('LOCKED');
    } catch (error) {
      console.warn('GPS locking error:', error);
      showAlert(
        'Mainframe Lock Timeout',
        'Could not instantly lock GPS. Please adjust coordinates manually or retry.',
        [{ text: 'OK' }]
      );
      setGpsStatus('ERROR');
    } finally {
      stopRadarSweep();
      setIsLocating(false);
    }
  };

  // Automatically acquire GPS telemetry on mount to make setup seamless
  useEffect(() => {
    handleRequestLocation();
  }, []);

  const handleRegister = async () => {
    console.log('--- [FRONTEND CLICK] INITIALIZE TERMINAL CONN pressed ---');
    console.log('Form Inputs Captured:', { name, email, phone, password: password ? 'PROVIDED' : 'BLANK', shopName, lat, lng });

    if (!name.trim()) {
      showAlert('Details Incomplete', 'Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      showAlert('Details Incomplete', 'Please enter your email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showAlert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    if (!phone.trim()) {
      showAlert('Details Incomplete', 'Please enter your phone number.');
      return;
    }
    if (phone.replace(/[^0-9]/g, '').length < 10) {
      showAlert('Invalid Phone', 'Please enter a valid phone number with at least 10 digits.');
      return;
    }
    if (!password) {
      showAlert('Details Incomplete', 'Please enter a security keycode.');
      return;
    }
    if (password.length < 6) {
      showAlert('Weak Keycode', 'Security keycode must be at least 6 characters long.');
      return;
    }

    if (!lat || !lng) {
      showAlert('Telemetry Required', 'GPS Telemetry coordinates (Latitude and Longitude) are required to complete registration. Please lock your live position or enter coordinates.');
      return;
    }

    const latitudeNum = parseFloat(lat);
    const longitudeNum = parseFloat(lng);

    if (isNaN(latitudeNum) || isNaN(longitudeNum)) {
      showAlert('Telemetry Invalid', 'Latitude and Longitude must be valid decimal coordinates.');
      return;
    }

    setIsLoading(true);

    // Call updated signup api endpoint
    const result = await signup(name, email, phone, password, latitudeNum, longitudeNum, shopName);

    setIsLoading(false);

    if (result.success) {
      showAlert('Registration Verified', `Welcome aboard, Technician ${name}. Your terminal node is now active.`, [
        { text: 'Access Dashboard', onPress: () => router.replace('/mechanic/dashboard') }
      ]);
    } else {
      if (result.isOffline) {
        showAlert(
          'Security Server Offline',
          'Could not connect to the API server. Would you like to enter in Simulated Demo Mode for previewing the app dashboard?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Enter Demo Mode', 
              onPress: () => {
                // Simulate successful signin manually for showcase
                router.replace('/mechanic/dashboard');
              } 
            }
          ]
        );
      } else {
        showAlert('Registration Denied', result.error || 'Failed to establish database connection.');
      }
    }
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const rotationCounter = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  const radarRotation = radarSweepAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const isDark = darkMode;
  const bgColor = isDark ? '#0B0F19' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#1E293B';
  const panelColor = isDark ? 'rgba(15, 23, 42, 0.94)' : 'rgba(255, 255, 255, 0.94)';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
  const inputBg = isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)';
  const inputBorder = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0, 0, 0, 0.05)';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: bgColor }]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      <ScrollView
        contentContainerStyle={[styles.scrollContainer, { paddingTop: Math.max(insets.top, 20) }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Tech Logo & Telemetry Banner */}
        <View style={styles.headerBlock}>
          <Text style={[styles.brandText, { color: textColor }]}>
            apex<Text style={{ color: neonGreen }}>.</Text>
          </Text>
          <Text style={styles.mainframeSub}>SECURE TECHNICIAN PORTAL // VER. 5.4.0</Text>
        </View>

        {/* Cute Mechanic Animation */}
        <View style={styles.telemetryHub}>
          <Animated.View style={[
            { transform: [{ translateY: floatAnim }] },
            { alignItems: 'center', justifyContent: 'center' }
          ]}>
            <Image 
              source={require('@/assets/images/cute-mechanic.png')} 
              style={{ width: 180, height: 180, resizeMode: 'contain' }} 
            />
          </Animated.View>
        </View>

        {/* Main Terminal Form */}
        <View style={[styles.terminalPanel, { backgroundColor: panelColor, borderColor: borderColor }]}>
          <Text style={[styles.terminalTitle, { color: textColor }]}>TECH REGISTRATION</Text>

          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>FULL NAME</Text>
            <View style={[
                styles.inputWrapper, 
                isFocused.name && styles.inputWrapperFocused,
                { backgroundColor: inputBg, borderColor: isFocused.name ? neonGreen : inputBorder }
              ]}>
              <Ionicons name="person-outline" size={18} color={isFocused.name ? neonGreen : '#94A3B8'} style={styles.fieldIcon} />
              <TextInput
                style={[styles.textInput, { color: textColor }]}
                placeholder="Dominic Toretto"
                placeholderTextColor="#64748B"
                value={name}
                onChangeText={setName}
                onFocus={() => setIsFocused(prev => ({ ...prev, name: true }))}
                onBlur={() => setIsFocused(prev => ({ ...prev, name: false }))}
              />
            </View>
          </View>

          {/* Email Address */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
            <View style={[
                styles.inputWrapper, 
                isFocused.email && styles.inputWrapperFocused,
                { backgroundColor: inputBg, borderColor: isFocused.email ? neonGreen : inputBorder }
              ]}>
              <Ionicons name="mail-outline" size={18} color={isFocused.email ? neonGreen : '#94A3B8'} style={styles.fieldIcon} />
              <TextInput
                style={[styles.textInput, { color: textColor }]}
                placeholder="dominic@apex.com"
                placeholderTextColor="#64748B"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setIsFocused(prev => ({ ...prev, email: true }))}
                onBlur={() => setIsFocused(prev => ({ ...prev, email: false }))}
              />
            </View>
          </View>

          {/* Phone Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>PHONE NUMBER</Text>
            <View style={[
                styles.inputWrapper, 
                isFocused.phone && styles.inputWrapperFocused,
                { backgroundColor: inputBg, borderColor: isFocused.phone ? neonGreen : inputBorder }
              ]}>
              <Ionicons name="call-outline" size={18} color={isFocused.phone ? neonGreen : '#94A3B8'} style={styles.fieldIcon} />
              <TextInput
                style={[styles.textInput, { color: textColor }]}
                placeholder="+1 (555) 999-8800"
                placeholderTextColor="#64748B"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                onFocus={() => setIsFocused(prev => ({ ...prev, phone: true }))}
                onBlur={() => setIsFocused(prev => ({ ...prev, phone: false }))}
              />
            </View>
          </View>

          {/* Shop Name (Optional display attribute) */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>SHOP / GARAGE NAME (OPTIONAL)</Text>
            <View style={[
                styles.inputWrapper, 
                isFocused.shop && styles.inputWrapperFocused,
                { backgroundColor: inputBg, borderColor: isFocused.shop ? neonGreen : inputBorder }
              ]}>
              <Ionicons name="storefront-outline" size={18} color={isFocused.shop ? neonGreen : '#94A3B8'} style={styles.fieldIcon} />
              <TextInput
                style={[styles.textInput, { color: textColor }]}
                placeholder="Toretto's Performance Shop"
                placeholderTextColor="#64748B"
                value={shopName}
                onChangeText={setShopName}
                onFocus={() => setIsFocused(prev => ({ ...prev, shop: true }))}
                onBlur={() => setIsFocused(prev => ({ ...prev, shop: false }))}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>SECURITY KEYCODE</Text>
            <View style={[
                styles.inputWrapper, 
                isFocused.password && styles.inputWrapperFocused,
                { backgroundColor: inputBg, borderColor: isFocused.password ? neonGreen : inputBorder }
              ]}>
              <Ionicons name="lock-closed-outline" size={18} color={isFocused.password ? neonGreen : '#94A3B8'} style={styles.fieldIcon} />
              <TextInput
                style={[styles.textInput, { color: textColor }]}
                placeholder="••••••••"
                placeholderTextColor="#64748B"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                onFocus={() => setIsFocused(prev => ({ ...prev, password: true }))}
                onBlur={() => setIsFocused(prev => ({ ...prev, password: false }))}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeToggle}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </View>

          {/* GPS TELEMETRY CONTROL MODULE */}
          <View style={styles.gpsContainer}>
            <View style={styles.gpsHeader}>
              <Text style={styles.gpsLabel}>GPS DISPATCH COORDINATES</Text>
              
              {/* Dynamic Status Badge */}
              <View style={[
                styles.gpsBadge,
                gpsStatus === 'LOCKED' && { borderColor: neonGreen, backgroundColor: 'rgba(0, 230, 118, 0.05)' },
                gpsStatus === 'LOCATING' && { borderColor: neonCyan, backgroundColor: 'rgba(6, 182, 212, 0.05)' },
                gpsStatus === 'ERROR' && { borderColor: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.05)' }
              ]}>
                <View style={[
                  styles.gpsStatusDot,
                  gpsStatus === 'LOCKED' && { backgroundColor: neonGreen },
                  gpsStatus === 'LOCATING' && { backgroundColor: neonCyan },
                  gpsStatus === 'ERROR' && { backgroundColor: '#EF4444' }
                ]} />
                <Text style={[
                  styles.gpsStatusText,
                  gpsStatus === 'LOCKED' && { color: neonGreen },
                  gpsStatus === 'LOCATING' && { color: neonCyan },
                  gpsStatus === 'ERROR' && { color: '#EF4444' }
                ]}>
                  {gpsStatus}
                </Text>
              </View>
            </View>

            {/* Decimal Coordinate overrides */}
            <View style={styles.coordInputs}>
              <View style={styles.coordField}>
                <Text style={styles.coordLabel}>LATITUDE</Text>
                <TextInput
                  style={[styles.coordInput, { color: textColor, backgroundColor: inputBg, borderColor: inputBorder }]}
                  keyboardType="numeric"
                  placeholder="30.2672"
                  placeholderTextColor="#64748B"
                  value={lat}
                  onChangeText={setLat}
                />
              </View>
              <View style={styles.coordField}>
                <Text style={styles.coordLabel}>LONGITUDE</Text>
                <TextInput
                  style={[styles.coordInput, { color: textColor, backgroundColor: inputBg, borderColor: inputBorder }]}
                  keyboardType="numeric"
                  placeholder="-97.7431"
                  placeholderTextColor="#64748B"
                  value={lng}
                  onChangeText={setLng}
                />
              </View>
            </View>

            {/* GPS Telemetry sweep activator */}
            <TouchableOpacity 
              style={[styles.gpsDetectBtn, isLocating && { borderColor: neonCyan }]}
              onPress={handleRequestLocation}
              disabled={isLocating}
            >
              {isLocating ? (
                <>
                  <Animated.View style={{ transform: [{ rotate: radarRotation }] }}>
                    <MaterialCommunityIcons name="radar" size={16} color={neonCyan} />
                  </Animated.View>
                  <Text style={[styles.gpsDetectBtnText, { color: neonCyan }]}>LOCKING SYSTEM GPS...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="locate-outline" size={16} color={neonGreen} />
                  <Text style={styles.gpsDetectBtnText}>ACQUIRE LIVE GPS TELEMETRY</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Main Submit Registration trigger */}
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: neonGreen }]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#0B0F19" />
            ) : (
              <>
                <Text style={styles.submitBtnText}>INITIALIZE TERMINAL CONN</Text>
                <Ionicons name="shield-checkmark" size={18} color="#0B0F19" style={{ marginLeft: 6 }} />
              </>
            )}
          </TouchableOpacity>

          {/* Already registered back-navigation route */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/login')}>
            <Text style={styles.backBtnText}>RETRIEVE CONNECTED TERMINAL (SIGN IN)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerBlock: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  brandText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  mainframeSub: {
    color: '#64748B',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 4,
  },
  telemetryHub: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  outerRingContainer: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  gearOuter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearInner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerDotRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 230, 118, 0.4)',
    borderStyle: 'dashed',
  },
  middleShieldRing: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.12)',
    backgroundColor: 'rgba(0, 230, 118, 0.01)',
  },
  innerShieldRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'rgba(0, 230, 118, 0.25)',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  hudCoordBadge: {
    position: 'absolute',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  hudCoordText: {
    color: '#00E676',
    fontSize: 7.5,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  terminalPanel: {
    backgroundColor: 'rgba(15, 23, 42, 0.94)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  terminalTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 16,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    color: '#94A3B8',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 5,
  },
  inputWrapper: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  inputWrapperFocused: {
    borderColor: '#00E676',
    backgroundColor: 'rgba(0, 230, 118, 0.02)',
  },
  fieldIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    height: '100%',
  },
  eyeToggle: {
    padding: 4,
  },
  gpsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    padding: 12,
    marginVertical: 12,
  },
  gpsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  gpsLabel: {
    color: '#94A3B8',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  gpsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  gpsStatusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#94A3B8',
    marginRight: 4,
  },
  gpsStatusText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#94A3B8',
  },
  coordInputs: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  coordField: {
    flex: 1,
  },
  coordLabel: {
    color: '#64748B',
    fontSize: 7.5,
    fontWeight: '800',
    marginBottom: 4,
  },
  coordInput: {
    height: 38,
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 10,
  },
  gpsDetectBtn: {
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#00E676',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 230, 118, 0.02)',
    gap: 6,
  },
  gpsDetectBtnText: {
    color: '#00E676',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  submitBtn: {
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
    marginTop: 8,
  },
  submitBtnText: {
    color: '#0B0F19',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  backBtn: {
    marginTop: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
