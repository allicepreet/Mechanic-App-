import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Animated, Easing, Platform, Dimensions, ActivityIndicator, Alert } from 'react-native';
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

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [shopName, setShopName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState({ name: false, email: false, shop: false, phone: false, password: false });

  
  const floatAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

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
      ),
    ]).start();
  }, []);

  const neonGreen = '#00E676';

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleSignup = async () => {
    if (!name || !email || !shopName || !phone || !password) {
      Alert.alert('Missing Information', 'Please fill in all fields.');
      return;
    }
    setIsLoading(true);
    
    let currentLat = 12.9352;
    let currentLng = 77.6245;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        currentLat = location.coords.latitude;
        currentLng = location.coords.longitude;
      }
    } catch (e) {
      console.warn('GPS location request error:', e);
    }
   
    const result = await signup(name, email, phone, password, currentLat, currentLng, shopName);
    
    setIsLoading(false);
    
    if (result.success) {
      Alert.alert('Registration Verified', `Welcome aboard, Technician ${name}. Your terminal node is now active.`, [
        { text: 'Access Dashboard', onPress: () => router.replace('/mechanic/dashboard') }
      ]);
    } else {
      if (result.isOffline) {
        Alert.alert(
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
        Alert.alert('Registration Denied', result.error || 'Failed to establish database connection.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Animated.View style={[styles.mainframeNode, { transform: [{ translateY: floatAnim }, { rotate: rotation }] }]}> 
        <MaterialCommunityIcons name="shield-lock-outline" size={54} color={neonGreen} />
      </Animated.View>
      <View style={[styles.formContainer, { paddingTop: Math.max(insets.top, 24) }]}>
        <Text style={styles.title}>Create Account</Text>
        {/* Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>FULL NAME</Text>
          <View style={[styles.inputWrapper, isFocused.name && styles.inputWrapperFocused]}>
            <Ionicons name="person-outline" size={18} color={isFocused.name ? neonGreen : '#94A3B8'} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Dominic T."
              placeholderTextColor="#64748B"
              value={name}
              onChangeText={setName}
              onFocus={() => setIsFocused(prev => ({ ...prev, name: true }))}
              onBlur={() => setIsFocused(prev => ({ ...prev, name: false }))}
            />
          </View>
        </View>
        {/* Email */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
          <View style={[styles.inputWrapper, isFocused.email && styles.inputWrapperFocused]}>
            <Ionicons name="mail-outline" size={18} color={isFocused.email ? neonGreen : '#94A3B8'} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
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
        {/* Shop Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>SHOP NAME</Text>
          <View style={[styles.inputWrapper, isFocused.shop && styles.inputWrapperFocused]}>
            <Ionicons name="storefront-outline" size={18} color={isFocused.shop ? neonGreen : '#94A3B8'} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Apex Auto Works"
              placeholderTextColor="#64748B"
              value={shopName}
              onChangeText={setShopName}
              onFocus={() => setIsFocused(prev => ({ ...prev, shop: true }))}
              onBlur={() => setIsFocused(prev => ({ ...prev, shop: false }))}
            />
          </View>
        </View>
        {/* Phone */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>PHONE NUMBER</Text>
          <View style={[styles.inputWrapper, isFocused.phone && styles.inputWrapperFocused]}>
            <Ionicons name="call-outline" size={18} color={isFocused.phone ? neonGreen : '#94A3B8'} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="+1 (555) 999‑8800"
              placeholderTextColor="#64748B"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              onFocus={() => setIsFocused(prev => ({ ...prev, phone: true }))}
              onBlur={() => setIsFocused(prev => ({ ...prev, phone: false }))}
            />
          </View>
        </View>
       
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>PASSWORD</Text>
          <View style={[styles.inputWrapper, isFocused.password && styles.inputWrapperFocused]}>
            <Ionicons name="lock-closed-outline" size={18} color={isFocused.password ? neonGreen : '#94A3B8'} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="••••••••"
              placeholderTextColor="#64748B"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              onFocus={() => setIsFocused(prev => ({ ...prev, password: true }))}
              onBlur={() => setIsFocused(prev => ({ ...prev, password: false }))}
            />
            <TouchableOpacity style={styles.eyeToggle} onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: neonGreen }]}
          onPress={handleSignup}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#0B0F19" />
          ) : (
            <Text style={styles.submitBtnText}>Create Account</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/login')}>
          <Text style={styles.backBtnText}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainframeNode: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.15,
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContainer: {
    width: '90%',
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: 'rgba(15,23,42,0.94)',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: { marginBottom: 12 },
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
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  inputWrapperFocused: {
    borderColor: '#00E676',
    backgroundColor: 'rgba(0,230,118,0.02)',
  },
  inputIcon: { marginRight: 10 },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  eyeToggle: { padding: 4 },
  submitBtn: {
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnText: {
    color: '#0B0F19',
    fontSize: 14,
    fontWeight: '800',
  },
  backBtn: {
    marginTop: 12,
    alignItems: 'center',
  },
  backBtnText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
});
