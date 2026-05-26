import React, { useState, ComponentProps } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert, Modal, ActivityIndicator, Platform } from 'react-native';
import { router } from 'expo-router';
import { useMechanic } from '@/components/MechanicContext';
import Header from '@/components/Header';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomNav from '@/components/BottomNav';

const GARAGE_DOCUMENTS: {
  readonly id: string;
  readonly title: string;
  readonly category: string;
  readonly authority: string;
  readonly status: string;
  readonly icon: ComponentProps<typeof MaterialCommunityIcons>['name'];
  readonly color: string;
  readonly number: string;
  readonly issued: string;
  readonly expires: string;
  readonly desc: string;
  readonly fileSize: string;
}[] = [
];

export default function ProfileScreen() {
  const { garageInfo, darkMode, completedJobsCount, updateGarageInfo, updateProfileOnServer, logout, isOnline, setIsOnline, resetPassword } = useMechanic();
  const insets = useSafeAreaInsets();

  const [editMode, setEditMode] = useState(false);
  const [shopName, setShopName] = useState(garageInfo.name);
  const [owner, setOwner] = useState(garageInfo.ownerName);
  const [phone, setPhone] = useState(garageInfo.phone);
  const [address, setAddress] = useState(garageInfo.address);
  const [hours, setHours] = useState(garageInfo.workingHours);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const [selectedDoc, setSelectedDoc] = useState<typeof GARAGE_DOCUMENTS[number] | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const activeBg = darkMode ? '#151718' : '#F8FAFC';
  const cardBg = darkMode ? '#1E2022' : '#FFFFFF';
  const textPrimary = darkMode ? '#ECEDEE' : '#0F172A';
  const textSecondary = darkMode ? '#9BA1A6' : '#64748B';
  const cardBorder = darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)';
  const primaryAccent = '#7DA0A9';

  const [isSaving, setIsSaving] = useState(false);

  const handleResetPassword = async () => {
    if (!oldPassword || !newPassword) {
      Alert.alert('Missing Info', 'Please enter both your old and new password.');
      return;
    }
    setIsResettingPassword(true);
    const res = await resetPassword(oldPassword, newPassword);
    setIsResettingPassword(false);
    if (res.success) {
      Alert.alert('Success', 'Your password has been changed securely.');
      setOldPassword('');
      setNewPassword('');
    } else {
      Alert.alert('Failed', res.error || 'Failed to change password.');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Call server API
    const result = await updateProfileOnServer(owner, phone, '8+ Years');
    
    if (result.success) {
      updateGarageInfo({
        name: shopName,
        ownerName: owner,
        phone,
        address,
        workingHours: hours,
      });
      setEditMode(false);
      Alert.alert('Profile Saved', 'Your profile has been updated on the server.');
    } else {
      Alert.alert('Error', result.error || 'Failed to update profile on the server.');
    }
    setIsSaving(false);
  };

  const handleLogoutSim = () => {
    if (Platform.OS === 'web') {
      const confirmLogout = window.confirm('Sign Out\n\nAre you sure you want to sign out of your garage account?');
      if (confirmLogout) {
        logout();
        router.replace('/');
      }
    } else {
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
    }
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
            <View
              style={[
                styles.onlineActiveDot,
                { backgroundColor: isOnline ? '#10B981' : '#64748B' },
              ]}
            />
          </View>
        </View>

        {/* Brand Labels */}
        <View style={styles.brandContainer}>
          <Text style={[styles.ownerNameText, { color: textPrimary }]}>{garageInfo.ownerName}</Text>
          <Text style={[styles.garageNameText, { color: textSecondary }]}>{garageInfo.name}</Text>
          
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.profileStatusTag,
              {
                backgroundColor: isOnline ? 'rgba(16, 185, 129, 0.12)' : 'rgba(100, 116, 139, 0.12)',
                borderColor: isOnline ? 'rgba(16, 185, 129, 0.2)' : 'rgba(100, 116, 139, 0.2)',
              },
            ]}
            onPress={() => setIsOnline(!isOnline)}
          >
            <View style={[styles.profileStatusDot, { backgroundColor: isOnline ? '#10B981' : '#64748B' }]} />
            <Text style={[styles.profileStatusText, { color: isOnline ? '#10B981' : textSecondary }]}>
              {isOnline ? 'Online • Accepting Bookings' : 'Offline • Shop Closed'}
            </Text>
          </TouchableOpacity>
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
              <Text style={styles.counterNum}>--</Text>
              <Ionicons name="star" size={14} color="#F59E0B" style={styles.starIcon} />
            </View>
            <Text style={[styles.counterLabel, { color: textSecondary }]}>Rating Feedback</Text>
          </TouchableOpacity>

          <View style={[styles.counterBox, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <Text style={styles.counterNum}>--</Text>
            <Text style={[styles.counterLabel, { color: textSecondary }]}>Years Exp</Text>
          </View>
        </View>

        {/* Dynamic Editor Panel */}
        <View style={[styles.editorCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={styles.editorHeader}>
            <Text style={[styles.sectionTitle, { color: textPrimary }]}>Garage Settings</Text>
            <TouchableOpacity
              disabled={isSaving}
              onPress={() => {
                if (editMode) {
                  handleSave();
                } else {
                  setEditMode(true);
                }
              }}
              style={{ alignItems: 'flex-end' }}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#F59E0B" />
              ) : (
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.editBtnText}>{editMode ? 'Save Profile' : 'Edit Credentials'}</Text>
                  {editMode && (
                    <Text style={{ color: 'rgba(245, 158, 11, 0.7)', fontSize: 8, marginTop: 2, fontFamily: 'monospace' }}>
                      PUT /api/user/profile/update
                    </Text>
                  )}
                </View>
              )}
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

        {/* Security Settings Panel */}
        <View style={[styles.editorCard, { backgroundColor: cardBg, borderColor: cardBorder, marginTop: 16 }]}>
          <View style={styles.editorHeader}>
            <Text style={[styles.sectionTitle, { color: textPrimary }]}>Security & Authentication</Text>
          </View>
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: textSecondary }]}>CURRENT PASSWORD</Text>
              <TextInput
                style={[styles.input, { color: textPrimary, borderColor: cardBorder }]}
                value={oldPassword}
                onChangeText={setOldPassword}
                secureTextEntry
                placeholder="Enter current password"
                placeholderTextColor={textSecondary}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: textSecondary }]}>NEW PASSWORD</Text>
              <TextInput
                style={[styles.input, { color: textPrimary, borderColor: cardBorder }]}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                placeholder="Enter new password"
                placeholderTextColor={textSecondary}
              />
            </View>
            <TouchableOpacity
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                borderColor: 'rgba(245, 158, 11, 0.4)',
                borderWidth: 1,
                paddingVertical: 10,
                borderRadius: 8,
                alignItems: 'center',
                marginTop: 8
              }}
              onPress={handleResetPassword}
              disabled={isResettingPassword}
            >
              {isResettingPassword ? (
                <ActivityIndicator size="small" color="#F59E0B" />
              ) : (
                <Text style={{ color: '#F59E0B', fontWeight: '800', fontSize: 13 }}>Change Password</Text>
              )}
            </TouchableOpacity>
          </View>
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

        {/* Verified Shop Credentials & Licenses */}
        <View style={styles.credentialsSectionHeader}>
          <Text style={[styles.sectionTitle, { color: textPrimary, marginLeft: 6 }]}>
            Verified Shop Credentials
          </Text>
          <View style={styles.verifiedCountBadge}>
            <Ionicons name="checkmark-circle" size={12} color="#10B981" />
            <Text style={styles.verifiedCountText}>0 Active</Text>
          </View>
        </View>

        <View style={styles.docsContainer}>
          {GARAGE_DOCUMENTS.map((doc) => (
            <TouchableOpacity
              key={doc.id}
              style={[styles.docItemRow, { backgroundColor: cardBg, borderColor: cardBorder }]}
              onPress={() => setSelectedDoc(doc)}
              activeOpacity={0.7}
            >
              <View style={[styles.docIconContainer, { backgroundColor: `${doc.color}15` }]}>
                <MaterialCommunityIcons name={doc.icon} size={20} color={doc.color} />
              </View>
              
              <View style={styles.docInfoContainer}>
                <Text style={[styles.docTitleText, { color: textPrimary }]} numberOfLines={1}>
                  {doc.title}
                </Text>
                <Text style={[styles.docCategoryText, { color: textSecondary }]}>
                  {doc.category}
                </Text>
              </View>
              
              <View style={styles.docRightCell}>
                <View style={styles.miniVerifiedPill}>
                  <Ionicons name="shield" size={10} color="#10B981" />
                  <Text style={styles.miniVerifiedText}>Verified</Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color={textSecondary} />
              </View>
            </TouchableOpacity>
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

          <TouchableOpacity
            style={[styles.linkRow, { backgroundColor: cardBg, borderColor: cardBorder }]}
            onPress={() => router.push('/mechanic/help')}
          >
            <View style={styles.linkLeft}>
              <Ionicons name="headset-outline" size={18} color="#10B981" />
              <Text style={[styles.linkText, { color: textPrimary }]}>Technical Support Hub</Text>
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
      <BottomNav />

      {/* Premium Document Details Drawer Modal */}
      <Modal
        visible={selectedDoc !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedDoc(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            {/* Modal Drag Indicator/Handle */}
            <View style={[styles.modalHandle, { backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)' }]} />

            {selectedDoc && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScrollContent}>
                {/* Header: Circle Icon & Verification Status */}
                <View style={styles.modalHeader}>
                  <View style={[styles.modalIconBg, { backgroundColor: `${selectedDoc.color}15` }]}>
                    <MaterialCommunityIcons name={selectedDoc.icon} size={36} color={selectedDoc.color} />
                  </View>
                  
                  <View style={styles.modalVerificationStatus}>
                    <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                    <Text style={styles.modalVerificationText}>TRUSTED APEX CREDENTIAL</Text>
                  </View>
                  
                  <Text style={[styles.modalTitle, { color: textPrimary }]}>{selectedDoc.title}</Text>
                  <Text style={[styles.modalSubtitle, { color: textSecondary }]}>{selectedDoc.authority}</Text>
                </View>

                
                <View style={[styles.metaGrid, { borderColor: cardBorder }]}>
                  <View style={styles.metaGridCell}>
                    <Text style={[styles.metaLabel, { color: textSecondary }]}>REGISTRATION NO.</Text>
                    <Text style={[styles.metaValue, { color: textPrimary }]}>{selectedDoc.number}</Text>
                  </View>
                  <View style={styles.metaGridCell}>
                    <Text style={[styles.metaLabel, { color: textSecondary }]}>DOCUMENT TYPE</Text>
                    <Text style={[styles.metaValue, { color: textPrimary }]}>{selectedDoc.category}</Text>
                  </View>
                </View>

                <View style={[styles.metaGrid, { borderTopWidth: 0, borderColor: cardBorder }]}>
                  <View style={styles.metaGridCell}>
                    <Text style={[styles.metaLabel, { color: textSecondary }]}>ISSUED DATE</Text>
                    <Text style={[styles.metaValue, { color: textPrimary }]}>{selectedDoc.issued}</Text>
                  </View>
                  <View style={styles.metaGridCell}>
                    <Text style={[styles.metaLabel, { color: textSecondary }]}>EXPIRY DATE</Text>
                    <Text style={[styles.metaValue, { color: textPrimary }]}>{selectedDoc.expires}</Text>
                  </View>
                </View>

                {/* Description Body */}
                <View style={styles.descriptionSection}>
                  <Text style={[styles.descriptionTitle, { color: textPrimary }]}>Credential Scope & Details</Text>
                  <Text style={[styles.descriptionBodyText, { color: textSecondary }]}>
                    {selectedDoc.desc}
                  </Text>
                </View>

                {/* Simulated Action: Download/Print Certificate */}
                <TouchableOpacity
                  style={[styles.downloadButton, { backgroundColor: primaryAccent }]}
                  onPress={() => {
                    setIsDownloading(true);
                    setTimeout(() => {
                      setIsDownloading(false);
                      Alert.alert(
                        'Secure Download Complete',
                        `Successfully fetched cryptographic copy of "${selectedDoc.title}" to local secure storage. (${selectedDoc.fileSize})`,
                        [{ text: 'Great' }]
                      );
                    }, 1200);
                  }}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="cloud-download-outline" size={16} color="#FFFFFF" />
                      <Text style={styles.downloadButtonText}>
                        Download Secure PDF ({selectedDoc.fileSize})
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Close Button */}
                <TouchableOpacity
                  style={[styles.closeButton, { borderColor: cardBorder }]}
                  onPress={() => setSelectedDoc(null)}
                >
                  <Text style={[styles.closeButtonText, { color: textPrimary }]}>Close Window</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
  profileStatusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  profileStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  profileStatusText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  credentialsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 12,
  },
  verifiedCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    gap: 4,
  },
  verifiedCountText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
  },
  docsContainer: {
    gap: 10,
    marginBottom: 20,
  },
  docItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  docIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  docInfoContainer: {
    flex: 1,
    gap: 2,
  },
  docTitleText: {
    fontSize: 13,
    fontWeight: '700',
  },
  docCategoryText: {
    fontSize: 10,
    fontWeight: '600',
  },
  docRightCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniVerifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
    gap: 3,
  },
  miniVerifiedText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#10B981',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    minHeight: '65%',
    maxHeight: '85%',
    padding: 24,
  },
  modalHandle: {
    width: 42,
    height: 6,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalScrollContent: {
    paddingBottom: 32,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  modalIconBg: {
    width: 68,
    height: 68,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalVerificationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  modalVerificationText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#10B981',
    letterSpacing: 0.5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  metaGrid: {
    flexDirection: 'row',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    paddingVertical: 14,
  },
  metaGridCell: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  metaLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  descriptionSection: {
    marginVertical: 20,
    gap: 8,
  },
  descriptionTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  descriptionBodyText: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
  },
  downloadButton: {
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  downloadButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  closeButton: {
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
