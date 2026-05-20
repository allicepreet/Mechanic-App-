import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { router } from 'expo-router';
import { useMechanic } from '@/components/MechanicContext';
import Header from '@/components/Header';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { garageInfo, darkMode, completedJobsCount, updateGarageInfo, logout } = useMechanic();
  const insets = useSafeAreaInsets();

  const [editMode, setEditMode] = useState(false);
  const [shopName, setShopName] = useState(garageInfo.name);
  const [owner, setOwner] = useState(garageInfo.ownerName);
  const [phone, setPhone] = useState(garageInfo.phone);
  const [address, setAddress] = useState(garageInfo.address);
  const [hours, setHours] = useState(garageInfo.workingHours);

  const activeBg = darkMode ? '#151718' : '#F8FAFC';
  const cardBg = darkMode ? '#1E2022' : '#FFFFFF';
  const textPrimary = darkMode ? '#ECEDEE' : '#0F172A';
  const textSecondary = darkMode ? '#9BA1A6' : '#64748B';
  const cardBorder = darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)';
  const primaryAccent = '#7DA0A9';

  const handleSave = () => {
    updateGarageInfo({
      name: shopName,
      ownerName: owner,
      phone,
      address,
      workingHours: hours,
    });
    setEditMode(false);
    Alert.alert('Profile Saved', 'Your garage credentials have been successfully updated across the ecosystem.');
  };

  const handleLogoutSim = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of your garage account?', [
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/');
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: activeBg }]}>
      {/* Header Bar */}
      <Header title="Garage Profile" showBack={false} darkMode={darkMode} />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Covered Banner & Avatar */}
        <View style={styles.headerCoverContainer}>
          <Image
            source={require('@/assets/images/garage.png')}
            style={styles.coverImage}
            resizeMode="cover"
          />
          <View style={styles.coverOverlay} />

          <View style={styles.avatarAbsoluteContainer}>
            <Image
              source={require('@/assets/images/profile.png')}
              style={styles.avatarImage}
            />
            <View style={styles.onlineActiveDot} />
          </View>
        </View>

        {/* Brand Labels */}
        <View style={styles.brandContainer}>
          <Text style={[styles.ownerNameText, { color: textPrimary }]}>{garageInfo.ownerName}</Text>
          <Text style={[styles.garageNameText, { color: textSecondary }]}>{garageInfo.name}</Text>
        </View>

        {/* Counter Badge Rows */}
        <View style={styles.counterRow}>
          <View style={[styles.counterBox, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <Text style={styles.counterNum}>{completedJobsCount}</Text>
            <Text style={[styles.counterLabel, { color: textSecondary }]}>Jobs Closed</Text>
          </View>

          <TouchableOpacity
            style={[styles.counterBox, { backgroundColor: cardBg, borderColor: cardBorder }]}
            onPress={() => router.push('/mechanic/reviews')}
          >
            <View style={styles.ratingRow}>
              <Text style={styles.counterNum}>4.9</Text>
              <Ionicons name="star" size={14} color="#F59E0B" style={styles.starIcon} />
            </View>
            <Text style={[styles.counterLabel, { color: textSecondary }]}>Rating Feedback</Text>
          </TouchableOpacity>

          <View style={[styles.counterBox, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <Text style={styles.counterNum}>8+</Text>
            <Text style={[styles.counterLabel, { color: textSecondary }]}>Years Exp</Text>
          </View>
        </View>

        {/* Dynamic Editor Panel */}
        <View style={[styles.editorCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={styles.editorHeader}>
            <Text style={[styles.sectionTitle, { color: textPrimary }]}>Garage Settings</Text>
            <TouchableOpacity
              onPress={() => {
                if (editMode) {
                  handleSave();
                } else {
                  setEditMode(true);
                }
              }}
            >
              <Text style={styles.editBtnText}>{editMode ? 'Save Profile' : 'Edit Credentials'}</Text>
            </TouchableOpacity>
          </View>

          {editMode ? (
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: textSecondary }]}>GARAGE NAME</Text>
                <TextInput
                  style={[styles.input, { color: textPrimary, borderColor: cardBorder }]}
                  value={shopName}
                  onChangeText={setShopName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: textSecondary }]}>OWNER / MANAGER</Text>
                <TextInput
                  style={[styles.input, { color: textPrimary, borderColor: cardBorder }]}
                  value={owner}
                  onChangeText={setOwner}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: textSecondary }]}>TELEPHONE</Text>
                <TextInput
                  style={[styles.input, { color: textPrimary, borderColor: cardBorder }]}
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: textSecondary }]}>WORKSHOP ADDRESS</Text>
                <TextInput
                  style={[styles.input, { color: textPrimary, borderColor: cardBorder }]}
                  value={address}
                  onChangeText={setAddress}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: textSecondary }]}>SERVICE HOURS</Text>
                <TextInput
                  style={[styles.input, { color: textPrimary, borderColor: cardBorder }]}
                  value={hours}
                  onChangeText={setHours}
                />
              </View>
            </View>
          ) : (
            <View style={styles.infoFields}>
              <View style={styles.fieldRow}>
                <Ionicons name="business" size={16} color="#F59E0B" />
                <Text style={[styles.fieldValue, { color: textPrimary }]}>{garageInfo.name}</Text>
              </View>

              <View style={styles.fieldRow}>
                <Ionicons name="call" size={16} color="#10B981" />
                <Text style={[styles.fieldValue, { color: textPrimary }]}>{garageInfo.phone}</Text>
              </View>

              <View style={styles.fieldRow}>
                <Ionicons name="location" size={16} color="#EF4444" />
                <Text style={[styles.fieldValue, { color: textPrimary }]} numberOfLines={2}>
                  {garageInfo.address}
                </Text>
              </View>

              <View style={styles.fieldRow}>
                <Ionicons name="time" size={16} color="#3B82F6" />
                <Text style={[styles.fieldValue, { color: textPrimary }]}>{garageInfo.workingHours}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Specialty Filter Badges */}
        <Text style={[styles.sectionTitle, { color: textPrimary, marginLeft: 6, marginBottom: 12, marginTop: 12 }]}>
          Diagnostics & Tuning Specialties
        </Text>
        <View style={styles.specialtyContainer}>
          {garageInfo.specialties.map((spec, i) => (
            <View key={i} style={[styles.specChip, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <MaterialCommunityIcons name="tag-outline" size={13} color="#F59E0B" />
              <Text style={[styles.specText, { color: textPrimary }]}>{spec}</Text>
            </View>
          ))}
        </View>

        {/* Secondary Navigation Links */}
        <View style={styles.linksBlock}>
          <TouchableOpacity
            style={[styles.linkRow, { backgroundColor: cardBg, borderColor: cardBorder }]}
            onPress={() => router.push('/mechanic/reviews')}
          >
            <View style={styles.linkLeft}>
              <Ionicons name="star-outline" size={18} color="#F59E0B" />
              <Text style={[styles.linkText, { color: textPrimary }]}>View Verified Reviews</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.linkRow, { backgroundColor: cardBg, borderColor: cardBorder }]}
            onPress={() => router.push('/mechanic/settings')}
          >
            <View style={styles.linkLeft}>
              <Ionicons name="settings-outline" size={18} color="#3B82F6" />
              <Text style={[styles.linkText, { color: textPrimary }]}>App Configurations</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Safety Terminate Portal */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogoutSim}>
          <Ionicons name="log-out" size={18} color="#FFFFFF" style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Reusable Premium Floating Bottom Navigation Bar */}
      <View style={[styles.navbarContainer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={[styles.navbar, darkMode ? styles.navbarDark : styles.navbarLight]}>
          <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/mechanic/dashboard')}>
            <View style={styles.inactiveTabIcon}>
              <Ionicons name="speedometer" size={20} color={textSecondary} />
            </View>
            <Text style={[styles.navText, { color: textSecondary }]}>Dashboard</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/mechanic/bookings')}>
            <View style={styles.inactiveTabIcon}>
              <Ionicons name="construct" size={20} color={textSecondary} />
            </View>
            <Text style={[styles.navText, { color: textSecondary }]}>Bookings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/mechanic/earnings')}>
            <View style={styles.inactiveTabIcon}>
              <Ionicons name="cash" size={20} color={textSecondary} />
            </View>
            <Text style={[styles.navText, { color: textSecondary }]}>Earnings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => {}}>
            <View style={[styles.activeTabHighlight, { backgroundColor: darkMode ? 'rgba(125, 160, 169, 0.15)' : 'rgba(125, 160, 169, 0.12)' }]}>
              <Ionicons name="person" size={20} color={primaryAccent} />
            </View>
            <Text style={[styles.navTextActive, { color: primaryAccent }]}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  headerCoverContainer: {
    height: 140,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 48, // space for the avatar overflow
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  avatarAbsoluteContainer: {
    position: 'absolute',
    bottom: -32,
    left: '50%',
    transform: [{ translateX: -40 }],
    width: 80,
    height: 80,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#F59E0B',
  },
  onlineActiveDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#1E2022',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  ownerNameText: {
    fontSize: 18,
    fontWeight: '800',
  },
  garageNameText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  counterBox: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterNum: {
    fontSize: 18,
    fontWeight: '900',
    color: '#F59E0B',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    marginLeft: 3,
    marginTop: -2,
  },
  counterLabel: {
    fontSize: 9,
    fontWeight: '700',
    marginTop: 4,
  },
  editorCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  editorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  editBtnText: {
    color: '#F59E0B',
    fontSize: 13,
    fontWeight: '700',
  },
  formContainer: {
    gap: 12,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  input: {
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 13,
    fontWeight: '600',
  },
  infoFields: {
    gap: 14,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldValue: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 10,
    flex: 1,
  },
  specialtyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  specChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  specText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 6,
  },
  linksBlock: {
    gap: 10,
    marginBottom: 24,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  linkText: {
    fontSize: 13,
    fontWeight: '700',
  },
  logoutBtn: {
    backgroundColor: '#EF4444',
    height: 44,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  navbarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 64,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    paddingHorizontal: 8,
  },
  navbarDark: {
    backgroundColor: 'rgba(30, 32, 34, 0.92)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  navbarLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  navItem: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    height: '100%',
  },
  navText: {
    fontSize: 9,
    fontWeight: '700',
    marginTop: 4,
  },
  navTextActive: {
    fontSize: 9,
    fontWeight: '800',
    marginTop: 4,
  },
  activeTabHighlight: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  inactiveTabIcon: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
});
