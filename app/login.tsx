import { useMechanic } from '@/components/MechanicContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, AlertButton, Animated, Dimensions, Easing, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, Image, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function LoginScreen() {
  const { login, forgotPassword, verifyOtp, darkMode } = useMechanic();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  // Slide up panel and logo transition animations
  const [showAuthPanel, setShowAuthPanel] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'forgot_email' | 'forgot_otp'>('login');
  const [otp, setOtp] = useState('');
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const contentFadeAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const neonGreen = '#00E676';
  const darkBg = '#0B0F19';

  // Float and Rotate animations for mainframe terminal
  useEffect(() => {
    Animated.parallel([
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -12,
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
          duration: 12000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      )
    ]).start();
  }, []);

  const handleOpenAuth = () => {
    setShowAuthPanel(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(contentFadeAnim, {
        toValue: 0.15, // dim the background titles slightly
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleCloseAuth = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(contentFadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowAuthPanel(false);
      setAuthMode('login'); // Reset auth mode on close
    });
  };

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

  const handleLogin = async (isDemo = false) => {
    console.log('--- [FRONTEND CLICK] Login Button Pressed ---');
    console.log('Inputs Captured:', { email, password: password ? 'PROVIDED' : 'BLANK', isDemo });

    if (!isDemo) {
      if (!email.trim()) {
        showAlert('Details Missing', 'Please enter your email address.');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        showAlert('Invalid Email', 'Please enter a valid email address.');
        return;
      }
      if (!password) {
        showAlert('Details Missing', 'Please enter your security code.');
        return;
      }
      if (password.length < 6) {
        showAlert('Invalid Code', 'Security code must be at least 6 characters long.');
        return;
      }
    }

    if (isDemo) {
      setIsDemoLoading(true);
      setTimeout(() => {
        setIsDemoLoading(false);
        router.replace('/mechanic/dashboard');
      }, 800);
      return;
    }

    setIsLoading(true);

    const result = await login(email, password);

    setIsLoading(false);

    if (result.success) {
      router.replace('/mechanic/dashboard');
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
                router.replace('/mechanic/dashboard');
              }
            }
          ]
        );
      } else {
        showAlert('Access Denied', result.error || 'Failed to authenticate.');
      }
    }
  };

  const handleSendOtp = async () => {
    if (!email) {
      showAlert('Error', 'Please enter your email address.');
      return;
    }
    setIsLoading(true);
    const res = await forgotPassword(email);
    setIsLoading(false);

    if (res.success) {
      showAlert('OTP Sent', 'Check your email for the verification code.');
      setAuthMode('forgot_otp');
    } else {
      showAlert('Failed', res.error || 'Failed to send OTP.');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      showAlert('Error', 'Please enter the OTP.');
      return;
    }
    setIsLoading(true);
    const res = await verifyOtp(email, otp);
    setIsLoading(false);

    if (res.success) {
      showAlert('Success', 'OTP verified successfully. Please contact admin to issue your new password, or login with temporary credentials if provided.', [{
        text: 'OK', onPress: () => setAuthMode('login')
      }]);
    } else {
      showAlert('Failed', res.error || 'Invalid OTP.');
    }
  };

  // Interpolations for meshing rotating cogs (opposite directions!)
  const rotation = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const rotationCounter = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] });

  const scriptFont = Platform.select({
    ios: 'Snell Roundhand',
    android: 'serif',
    default: 'serif',
  });

  const isDark = darkMode;
  const bgColor = isDark ? '#0B0F19' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#1E293B';
  const panelColor = isDark ? 'rgba(15, 23, 42, 0.94)' : 'rgba(255, 255, 255, 0.94)';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={[styles.container, { backgroundColor: bgColor }]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Main Screen Content Layer */}
      <Animated.View style={[styles.mainLayout, { opacity: contentFadeAnim }]}>
        {/* Brand Logo Header */}
        <View style={[styles.brandHeader, { paddingTop: Math.max(insets.top, 24) }]}>
          <Text style={[styles.brandText, { color: textColor }]}>
            apex<Text style={{ color: neonGreen }}>.</Text>
          </Text>
        </View>

        {/* Cute Mechanic Animation */}
        <View style={styles.vehicleContainer}>
          <Animated.View
            style={[
              { transform: [{ translateY: floatAnim }] },
              { alignItems: 'center', justifyContent: 'center' }
            ]}
          >
            <Image 
              source={require('@/assets/images/cute-mechanic.png')} 
              style={{ width: 220, height: 220, resizeMode: 'contain' }} 
            />
          </Animated.View>
        </View>

        {/* Brand Typography Titles */}
        <View style={styles.titleBlock}>
          <Text style={styles.trackedSubText}>DIAGNOSE AND TUNE</Text>
          <View style={styles.serifRow}>
            <Text style={[styles.mainSerifTitle, { color: textColor }]}>instant</Text>
            <Text style={[styles.scriptOverlapText, { fontFamily: scriptFont }]}>
              dispatch
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Interactive Inverted Dome Tab & Chevron Entry Button */}
      {!showAuthPanel && (
        <View style={[styles.invertedDomeContainer, { bottom: insets.bottom > 0 ? insets.bottom : 16 }]}>
          {/* Register Button */}
          <TouchableOpacity
            style={[styles.circleChevronBtn, { backgroundColor: 'rgba(0,230,118,0.12)', borderColor: 'rgba(0,230,118,0.4)', marginRight: 16 }]}
            activeOpacity={0.85}
            onPress={() => router.push('/register')}
          >
            <Ionicons name="person-add-outline" size={20} color={neonGreen} />
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={styles.circleChevronBtn}
            activeOpacity={0.85}
            onPress={handleOpenAuth}
          >
            <Ionicons name="chevron-forward" size={20} color={neonGreen} />
          </TouchableOpacity>
        </View>
      )}

      {/* Frosted Glass Slide-up Auth Panel */}
      <Animated.View
        style={[
          styles.authPanelContainer,
          { 
            backgroundColor: panelColor,
            borderColor: borderColor,
            transform: [{ translateY: slideAnim }] 
          }
        ]}
      >
        <ScrollView
          contentContainerStyle={[styles.keyboardContainer, { paddingBottom: Math.max(insets.bottom, 24) }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.dragHandle} />

          <View style={styles.authHeaderBlock}>
            <View style={styles.authLogoBadge}>
              <MaterialCommunityIcons 
                name={authMode === 'login' ? 'shield-lock-outline' : 'email-lock-outline'} 
                size={24} 
                color={neonGreen} 
              />
            </View>
            <Text style={[styles.authTitle, { color: textColor }]}>
              {authMode === 'login' ? 'Technician Credentials' : 'Password Recovery'}
            </Text>
            <Text style={styles.authSubtitle}>
              {authMode === 'login' 
                ? 'Authorize terminal connection to access the active dispatch board'
                : authMode === 'forgot_email' 
                  ? 'Enter your registered email address to receive a one-time passcode.'
                  : 'Enter the verification code sent to your email.'}
            </Text>
          </View>

          {authMode === 'login' && (
            <>
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    isEmailFocused && styles.inputWrapperFocused
                  ]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={18}
                    color={isEmailFocused ? neonGreen : '#94A3B8'}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.textInput, { color: textColor }]}
                    placeholder="Enter email"
                    placeholderTextColor="#64748B"
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setIsEmailFocused(true)}
                    onBlur={() => setIsEmailFocused(false)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Passcode Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>SECURITY CODE</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    isPasswordFocused && styles.inputWrapperFocused
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color={isPasswordFocused ? neonGreen : '#94A3B8'}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.textInput, { color: textColor }]}
                    placeholder="Enter password"
                    placeholderTextColor="#64748B"
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeToggle}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color="#94A3B8"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Submit Actions */}
              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: neonGreen }]}
                onPress={() => handleLogin(false)}
                disabled={isLoading || isDemoLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#0B0F19" />
                ) : (
                  <>
                    <Text style={styles.submitBtnText}>Authorize Sign In</Text>
                    <Ionicons name="shield-checkmark" size={18} color="#0B0F19" style={{ marginLeft: 6 }} />
                  </>
                )}
              </TouchableOpacity>

              {/* Forgot Password Link */}
              <TouchableOpacity
                style={{ alignItems: 'center', marginTop: 12, marginBottom: 4 }}
                onPress={() => setAuthMode('forgot_email')}
              >
                <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '600' }}>
                  Forgot your security code? <Text style={{ color: neonGreen }}>Reset it here</Text>
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.demoBtn}
                onPress={() => handleLogin(true)}
                disabled={isLoading || isDemoLoading}
              >
                {isDemoLoading ? (
                  <ActivityIndicator size="small" color={neonGreen} />
                ) : (
                  <>
                    <Ionicons name="flash" size={15} color={neonGreen} style={{ marginRight: 6 }} />
                    <Text style={styles.demoBtnText}>Instant Demo Access</Text>
                  </>
                )}
              </TouchableOpacity>
              
              {/* Register Link */}
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => router.replace('/register')}
              >
                <Text style={[styles.backBtnText, { color: '#00E676' }]}>Register New Terminal (Sign Up)</Text>
              </TouchableOpacity>
            </>
          )}

          {authMode === 'forgot_email' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    isEmailFocused && styles.inputWrapperFocused
                  ]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={18}
                    color={isEmailFocused ? neonGreen : '#94A3B8'}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.textInput, { color: textColor }]}
                    placeholder="Enter email"
                    placeholderTextColor="#64748B"
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setIsEmailFocused(true)}
                    onBlur={() => setIsEmailFocused(false)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: neonGreen }]}
                onPress={handleSendOtp}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#0B0F19" />
                ) : (
                  <Text style={styles.submitBtnText}>Send OTP</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => setAuthMode('login')}
              >
                <Text style={[styles.backBtnText, { color: '#00E676' }]}>Back to Login</Text>
              </TouchableOpacity>
            </>
          )}

          {authMode === 'forgot_otp' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>ONE-TIME PASSCODE</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    isPasswordFocused && styles.inputWrapperFocused
                  ]}
                >
                  <Ionicons
                    name="keypad-outline"
                    size={18}
                    color={isPasswordFocused ? neonGreen : '#94A3B8'}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.textInput, { color: textColor }]}
                    placeholder="Enter 6-digit OTP"
                    placeholderTextColor="#64748B"
                    value={otp}
                    onChangeText={setOtp}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    keyboardType="numeric"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: neonGreen }]}
                onPress={handleVerifyOtp}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#0B0F19" />
                ) : (
                  <Text style={styles.submitBtnText}>Verify & Continue</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => setAuthMode('login')}
              >
                <Text style={[styles.backBtnText, { color: '#00E676' }]}>Back to Login</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Back Button */}
          {authMode === 'login' && (
            <TouchableOpacity
              style={styles.backBtn}
              onPress={handleCloseAuth}
            >
              <Text style={styles.backBtnText}>Back to Splash</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  mainLayout: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 120,
  },
  brandHeader: {
    paddingHorizontal: 28,
    alignItems: 'flex-start',
  },
  brandText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  vehicleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: SCREEN_HEIGHT * 0.38,
    width: '100%',
  },
  mainframeNode: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  outerRotateRing: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 2,
    borderColor: 'rgba(0, 230, 118, 0.45)',
    borderStyle: 'dashed',
  },
  midRing: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 230, 118, 0.15)',
    backgroundColor: 'rgba(0, 230, 118, 0.02)',
  },
  innerRing: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: 'rgba(0, 230, 118, 0.25)',
    backgroundColor: 'rgba(11, 15, 25, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
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
  microHudBadge: {
    position: 'absolute',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  microHudText: {
    color: '#00E676',
    fontSize: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  titleBlock: {
    paddingHorizontal: 28,
    alignItems: 'flex-start',
  },
  trackedSubText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 6,
  },
  serifRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    position: 'relative',
    height: 60,
  },
  mainSerifTitle: {
    fontSize: 48,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: '900',
    color: '#FFFFFF',
  },
  scriptOverlapText: {
    fontSize: 34,
    fontStyle: 'italic',
    color: '#00E676',
    position: 'absolute',
    bottom: -15,
    left: 80,
    fontWeight: '600',
  },

  invertedDomeContainer: {
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
    width: 200,
    height: 58,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  circleChevronBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  // Slide-up Auth Panel
  authPanelContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.65,
    backgroundColor: 'rgba(15, 23, 42, 0.94)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 10,
  },
  keyboardContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },
  authHeaderBlock: {
    alignItems: 'center',
    marginBottom: 20,
  },
  authLogoBadge: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderColor: 'rgba(0, 230, 118, 0.2)',
    borderWidth: 1,
  },
  authTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  authSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
  },
  inputWrapper: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  inputWrapperFocused: {
    borderColor: '#00E676',
    backgroundColor: 'rgba(0, 230, 118, 0.02)',
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    height: '100%',
  },
  eyeToggle: {
    padding: 4,
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
    fontSize: 14,
    fontWeight: '800',
  },
  demoBtn: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#00E676',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 230, 118, 0.02)',
  },
  demoBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#00E676',
  },
  backBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    opacity: 0.6,
  },
  backBtnText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
});
