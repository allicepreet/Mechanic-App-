import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useMechanic } from '@/components/MechanicContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function SignupScreen() {
  const { signup, darkMode } = useMechanic();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [shopName, setShopName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [focusedField, setFocusedField] = useState<string | null>(null);

  const activeBg = darkMode ? '#0F172A' : '#F4F6F8';
  const textPrimary = darkMode ? '#F8FAFC' : '#1E293B';
  const textSecondary = darkMode ? '#94A3B8' : '#64748B';
  const cardBg = darkMode ? '#1E293B' : '#FFFFFF';
  const primaryAccent = '#7DA0A9';
  const cardBorder = darkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(125, 160, 169, 0.12)';

  const handleSignup = () => {
    if (!name || !shopName || !email || !phone || !password) {
      Alert.alert('Incomplete Form', 'Please fill in all the details to register your garage.');
      return;
    }

    // Call the context signup callback, which dynamically updates the owner name, garage name, phone, etc.
    signup(name, email, shopName, phone);

    Alert.alert('Garage Registered!', `Welcome to the Apex Network, ${name}. Your garage "${shopName}" is now active.`, [
      {
        text: 'Proceed to Dashboard',
        onPress: () => router.replace('/mechanic/dashboard'),
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: activeBg }]}
    >
      <StatusBar style="light" />

      <ImageBackground
        source={require('@/assets/images/banner.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.imageOverlay} />

        {/* Back navigation button */}
        <TouchableOpacity
          style={[styles.backButton, { top: Math.max(insets.top, 16) }]}
          onPress={() => router.replace('/onboarding')}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={[styles.scrollContainer, { paddingTop: Math.max(insets.top + 60, 80) }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Title Section */}
          <View style={styles.headerBlock}>
            <View style={styles.logoBadge}>
              <Ionicons name="construct" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.mainTitle}>APEX AUTO WORKS</Text>
            <Text style={styles.subtitle}>Register your garage in our premium performance network</Text>
          </View>

          {/* Form Card */}
          <View style={[styles.loginCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <Text style={[styles.cardHeader, { color: textPrimary }]}>Create Garage Profile</Text>

            {/* Owner Name */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: textSecondary }]}>FULL NAME</Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    borderColor: focusedField === 'name' ? primaryAccent : cardBorder,
                    backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
                  },
                ]}
              >
                <Ionicons name="person-outline" size={18} color={focusedField === 'name' ? primaryAccent : textSecondary} style={styles.fieldIcon} />
                <TextInput
                  style={[styles.textInput, { color: textPrimary }]}
                  placeholder="Dominic Toretto"
                  placeholderTextColor={textSecondary}
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            {/* Garage Name */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: textSecondary }]}>GARAGE / WORKSHOP NAME</Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    borderColor: focusedField === 'shopName' ? primaryAccent : cardBorder,
                    backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
                  },
                ]}
              >
                <Ionicons name="business-outline" size={18} color={focusedField === 'shopName' ? primaryAccent : textSecondary} style={styles.fieldIcon} />
                <TextInput
                  style={[styles.textInput, { color: textPrimary }]}
                  placeholder="Toretto's Speed Shop"
                  placeholderTextColor={textSecondary}
                  value={shopName}
                  onChangeText={setShopName}
                  onFocus={() => setFocusedField('shopName')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: textSecondary }]}>EMAIL ADDRESS</Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    borderColor: focusedField === 'email' ? primaryAccent : cardBorder,
                    backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
                  },
                ]}
              >
                <Ionicons name="mail-outline" size={18} color={focusedField === 'email' ? primaryAccent : textSecondary} style={styles.fieldIcon} />
                <TextInput
                  style={[styles.textInput, { color: textPrimary }]}
                  placeholder="dominic@apex.com"
                  placeholderTextColor={textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Phone Field */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: textSecondary }]}>GARAGE PHONE NUMBER</Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    borderColor: focusedField === 'phone' ? primaryAccent : cardBorder,
                    backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
                  },
                ]}
              >
                <Ionicons name="call-outline" size={18} color={focusedField === 'phone' ? primaryAccent : textSecondary} style={styles.fieldIcon} />
                <TextInput
                  style={[styles.textInput, { color: textPrimary }]}
                  placeholder="+1 (555) 999-8800"
                  placeholderTextColor={textSecondary}
                  value={phone}
                  onChangeText={setPhone}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: textSecondary }]}>SECURITY PASSWORD</Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    borderColor: focusedField === 'password' ? primaryAccent : cardBorder,
                    backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
                  },
                ]}
              >
                <Ionicons name="lock-closed-outline" size={18} color={focusedField === 'password' ? primaryAccent : textSecondary} style={styles.fieldIcon} />
                <TextInput
                  style={[styles.textInput, { color: textPrimary }]}
                  placeholder="••••••••"
                  placeholderTextColor={textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeToggle}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Action */}
            <TouchableOpacity style={[styles.submitBtn, { backgroundColor: primaryAccent, marginTop: 12 }]} onPress={handleSignup}>
              <Text style={styles.submitBtnText}>Register & Go Online</Text>
              <Ionicons name="shield-checkmark-outline" size={18} color="#FFFFFF" style={styles.submitIcon} />
            </TouchableOpacity>
          </View>

          {/* Direct to Login */}
          <View style={styles.footerBlock}>
            <Text style={[styles.footerLabel, { color: '#E2ECEE' }]}>Already have a garage account?</Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={[styles.footerLink, { color: primaryAccent }]}>Sign In</Text>
            </TouchableOpacity>
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
    backgroundColor: 'rgba(15, 23, 42, 0.82)', // slightly deeper dark tint for readability on signup
  },
  backButton: {
    position: 'absolute',
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingBottom: 50,
  },
  headerBlock: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#7DA0A9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#7DA0A9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  mainTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.8,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  loginCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 5,
  },
  cardHeader: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
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
    fontSize: 14,
    fontWeight: '600',
    height: '100%',
  },
  eyeToggle: {
    padding: 4,
  },
  submitBtn: {
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7DA0A9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
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
  footerBlock: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 28,
  },
  footerLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '700',
  },
});
