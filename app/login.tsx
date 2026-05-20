import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, Alert, Dimensions, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useMechanic } from '@/components/MechanicContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function LoginScreen() {
  const { login } = useMechanic();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('dominic@apex.com');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const primaryAccent = '#7DA0A9';
  const glassBg = 'rgba(15, 23, 42, 0.65)';
  const glassBorder = 'rgba(255, 255, 255, 0.08)';

  const handleLogin = (isDemo = false) => {
    if (!isDemo && (!email || !password)) {
      Alert.alert('Details Missing', 'Please fill in both your email and security code.');
      return;
    }

    if (isDemo) {
      setIsDemoLoading(true);
    } else {
      setIsLoading(true);
    }

    // Simulate premium authorization delay
    setTimeout(() => {
      login(isDemo ? 'dominic@apex.com' : email, isDemo ? 'admin' : password);
      
      setIsLoading(false);
      setIsDemoLoading(false);
      
      // Navigate straight to the custom dashboard
      router.replace('/mechanic/dashboard');
    }, 1200);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="light" />
      
      {/* Background Image of high performance Porsche setup */}
      <ImageBackground
        source={require('@/assets/images/porsche.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.imageOverlay} />

        <ScrollView
          contentContainerStyle={[styles.scrollContainer, { paddingTop: Math.max(insets.top + 40, 60) }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Title Section */}
          <View style={styles.headerBlock}>
            <View style={[styles.logoBadge, { backgroundColor: primaryAccent }]}>
              <Ionicons name="construct" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.mainTitle}>APEX AUTO WORKS</Text>
            <Text style={styles.subtitle}>HIGH-PERFORMANCE SERVICE STATION</Text>
          </View>

          {/* Frosted Glassmorphism Card */}
          <View style={[styles.loginCard, { backgroundColor: glassBg, borderColor: glassBorder }]}>
            <Text style={styles.cardHeader}>Mechanic Sign In</Text>
            <Text style={styles.cardSubHeader}>Enter your security credentials to access the active garage bays</Text>

            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    borderColor: isEmailFocused ? primaryAccent : 'transparent',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  },
                ]}
              >
                <Ionicons name="mail-outline" size={18} color={isEmailFocused ? primaryAccent : '#94A3B8'} style={styles.fieldIcon} />
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

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>SECURITY PASSCODE</Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    borderColor: isPasswordFocused ? primaryAccent : 'transparent',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  },
                ]}
              >
                <Ionicons name="lock-closed-outline" size={18} color={isPasswordFocused ? primaryAccent : '#94A3B8'} style={styles.fieldIcon} />
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
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeToggle}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Form Actions */}
            <View style={styles.formOptions}>
              <View style={styles.rememberMeRow}>
                <Ionicons name="checkmark-circle" size={16} color={primaryAccent} />
                <Text style={styles.rememberMeText}>Remember Session</Text>
              </View>
              <TouchableOpacity>
                <Text style={[styles.forgotText, { color: primaryAccent }]}>Forgot Code?</Text>
              </TouchableOpacity>
            </View>

            {/* Standard Sign In Button */}
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: primaryAccent }]}
              onPress={() => handleLogin(false)}
              disabled={isLoading || isDemoLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>Authorize Sign In</Text>
                  <Ionicons name="shield-checkmark-outline" size={18} color="#FFFFFF" style={styles.submitIcon} />
                </>
              )}
            </TouchableOpacity>

            {/* Divider line */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Instant Demo Access Button (Stunning visual design) */}
            <TouchableOpacity
              style={[styles.demoBtn, { borderColor: primaryAccent }]}
              onPress={() => handleLogin(true)}
              disabled={isLoading || isDemoLoading}
            >
              {isDemoLoading ? (
                <ActivityIndicator size="small" color={primaryAccent} />
              ) : (
                <>
                  <Ionicons name="flash" size={16} color={primaryAccent} style={{ marginRight: 6 }} />
                  <Text style={[styles.demoBtnText, { color: primaryAccent }]}>Instant Demo Access</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer Info */}
          <View style={styles.footerBlock}>
            <Ionicons name="lock-closed" size={12} color="rgba(255, 255, 255, 0.4)" />
            <Text style={styles.footerText}>Secure SSL authorized shop terminal connection</Text>
          </View>
        </ScrollView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.72)', // deep elegant shadow overlay
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    minHeight: SCREEN_HEIGHT,
    justifyContent: 'center',
  },
  headerBlock: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#7DA0A9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 5,
  },
  mainTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
  },
  subtitle: {
    color: '#7DA0A9',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 6,
  },
  loginCard: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },
  cardHeader: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  cardSubHeader: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  inputWrapper: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  fieldIcon: {
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
  formOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  rememberMeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberMeText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '700',
  },
  submitBtn: {
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7DA0A9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  submitIcon: {
    marginLeft: 6,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 18,
    opacity: 0.4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#94A3B8',
  },
  dividerText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    marginHorizontal: 12,
  },
  demoBtn: {
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  demoBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  footerBlock: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
    gap: 6,
    opacity: 0.5,
  },
  footerText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
});
