import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, Dimensions, Animated, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { useMechanic } from '@/components/MechanicContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function LoginScreen() {
  const { login, darkMode } = useMechanic();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('dominic@apex.com');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  
  // Slide up panel and logo transition animations
  const [showAuthPanel, setShowAuthPanel] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const contentFadeAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  const neonGreen = '#00E676';
  const darkBg = '#0B0F19';

  // Float animation for vehicle
  useEffect(() => {
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
    ).start();
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
    });
  };

  const handleLogin = (isDemo = false) => {
    if (!isDemo && (!email || !password)) {
      Alert.alert('Details Missing', 'Please enter your email and security code.');
      return;
    }

    if (isDemo) {
      setIsDemoLoading(true);
    } else {
      setIsLoading(true);
    }

    setTimeout(() => {
      login(isDemo ? 'dominic@apex.com' : email, isDemo ? 'admin' : password);
      setIsLoading(false);
      setIsDemoLoading(false);
      router.replace('/mechanic/dashboard');
    }, 1200);
  };

  // Interpolations for vehicle shadow sizing
  const shadowScale = floatAnim.interpolate({
    inputRange: [-12, 0],
    outputRange: [0.75, 1],
  });
  
  const shadowOpacity = floatAnim.interpolate({
    inputRange: [-12, 0],
    outputRange: [0.18, 0.35],
  });

  const scriptFont = Platform.select({
    ios: 'Snell Roundhand',
    android: 'serif',
    default: 'serif',
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Main Screen Content Layer */}
      <Animated.View style={[styles.mainLayout, { opacity: contentFadeAnim }]}>
        {/* Brand Logo Header */}
        <View style={[styles.brandHeader, { paddingTop: Math.max(insets.top, 24) }]}>
          <Text style={styles.brandText}>
            apex<Text style={{ color: neonGreen }}>.</Text>
          </Text>
        </View>

        {/* Floating Supercar and Shadow */}
        <View style={styles.vehicleContainer}>
          <Animated.Image
            source={require('@/assets/images/porsche.png')}
            style={[
              styles.vehicleImage,
              { transform: [{ translateY: floatAnim }] }
            ]}
            resizeMode="contain"
          />
          <Animated.View 
            style={[
              styles.vehicleShadow,
              { 
                transform: [{ scaleX: shadowScale }, { scaleY: shadowScale }],
                opacity: shadowOpacity
              }
            ]} 
          />
        </View>

        {/* Brand Typography Titles */}
        <View style={styles.titleBlock}>
          <Text style={styles.trackedSubText}>DIAGNOSE AND TUNE</Text>
          <View style={styles.serifRow}>
            <Text style={styles.mainSerifTitle}>instant</Text>
            <Text style={[styles.scriptOverlapText, { fontFamily: scriptFont }]}>
              dispatch
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Interactive Inverted Dome Tab & Chevron Entry Button */}
      {!showAuthPanel && (
        <View style={[styles.invertedDomeContainer, { bottom: insets.bottom > 0 ? insets.bottom : 16 }]}>
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
          { transform: [{ translateY: slideAnim }] }
        ]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={[styles.keyboardContainer, { paddingBottom: Math.max(insets.bottom, 24) }]}
        >
          <View style={styles.dragHandle} />
          
          <View style={styles.authHeaderBlock}>
            <View style={styles.authLogoBadge}>
              <MaterialCommunityIcons name="shield-lock-outline" size={24} color={neonGreen} />
            </View>
            <Text style={styles.authTitle}>Technician Credentials</Text>
            <Text style={styles.authSubtitle}>
              Authorize terminal connection to access the active dispatch board
            </Text>
          </View>

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
                style={styles.textInput}
                placeholder="dominic@apex.com"
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
                style={styles.textInput}
                placeholder="••••••••"
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

          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={handleCloseAuth}
          >
            <Text style={styles.backBtnText}>Back to Splash</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
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
  vehicleImage: {
    width: SCREEN_WIDTH * 0.95,
    height: SCREEN_HEIGHT * 0.28,
    zIndex: 2,
  },
  vehicleShadow: {
    width: SCREEN_WIDTH * 0.7,
    height: 14,
    backgroundColor: '#000000',
    borderRadius: 7,
    position: 'absolute',
    bottom: 25,
    zIndex: 1,
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
  // Inverted Dome Tab containing chevron button at bottom center
  invertedDomeContainer: {
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
    width: 140,
    height: 52,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 70,
    borderTopRightRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
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
