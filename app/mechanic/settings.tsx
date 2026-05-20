import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { useMechanic } from '@/components/MechanicContext';
import Header from '@/components/Header';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function SettingsScreen() {
  const { darkMode, notificationsEnabled, toggleDarkMode, toggleNotifications } = useMechanic();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const activeBg = darkMode ? '#151718' : '#F8FAFC';
  const cardBg = darkMode ? '#1E2022' : '#FFFFFF';
  const textPrimary = darkMode ? '#ECEDEE' : '#0F172A';
  const textSecondary = darkMode ? '#9BA1A6' : '#64748B';
  const cardBorder = darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)';

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqData = [
    {
      q: 'How do I initiate a new diagnostic operation?',
      a: 'Navigate to the "Bookings" tab, select any "Pending" client ticket, and tap "Accept Job". From there, the ticket will transition to your active schedule dashboard where you can open it and trigger diagnostic phases.',
    },
    {
      q: 'When do financial payouts get disbursed?',
      a: 'Standard disbursements are processed automatically every Monday at 12:00 AM UTC. You can also request an instant transfer anytime from the "Earnings" ledger by tapping "Request Instant Payout".',
    },
    {
      q: 'Can I append custom services to a vehicle?',
      a: 'Yes. While viewing an active "Diagnostic Dossier", you can edit or append custom parts, fluids, and technician notes directly from the client vehicle sheet.',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: activeBg }]}>
      {/* Header Bar */}
      <Header title="App Configuration" showBack darkMode={darkMode} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Toggle Controls Section */}
        <Text style={[styles.sectionTitle, { color: textPrimary }]}>Preferences & Visuals</Text>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          
          {/* Dark Mode Theme toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                <Ionicons name="moon" size={18} color="#3B82F6" />
              </View>
              <View>
                <Text style={[styles.settingTitleText, { color: textPrimary }]}>System Dark Vibe</Text>
                <Text style={[styles.settingSubText, { color: textSecondary }]}>Toggle brushed-carbon aesthetics</Text>
              </View>
            </View>
            <Switch
              value={darkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#767577', true: '#F59E0B' }}
              thumbColor={darkMode ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>

          {/* Notifications Toggle */}
          <View style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: cardBorder }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <Ionicons name="notifications" size={18} color="#F59E0B" />
              </View>
              <View>
                <Text style={[styles.settingTitleText, { color: textPrimary }]}>Push Operations</Text>
                <Text style={[styles.settingSubText, { color: textSecondary }]}>Alert on new diagnostic requests</Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: '#767577', true: '#10B981' }}
              thumbColor={notificationsEnabled ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>

          {/* Sound Alerts Toggle */}
          <View style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: cardBorder }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <Ionicons name="volume-high" size={18} color="#10B981" />
              </View>
              <View>
                <Text style={[styles.settingTitleText, { color: textPrimary }]}>Diagnostic Sound FX</Text>
                <Text style={[styles.settingSubText, { color: textSecondary }]}>Chime on status adjustments</Text>
              </View>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: '#767577', true: '#10B981' }}
              thumbColor={soundEnabled ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* FAQs accordion section */}
        <Text style={[styles.sectionTitle, { color: textPrimary }]}>Operations FAQ</Text>
        <View style={styles.faqBlock}>
          {faqData.map((faq, index) => {
            const isActive = activeFaq === index;
            return (
              <TouchableOpacity
                key={index}
                activeOpacity={0.8}
                style={[styles.faqRow, { backgroundColor: cardBg, borderColor: cardBorder }]}
                onPress={() => toggleFaq(index)}
              >
                <View style={styles.faqHeader}>
                  <Text style={[styles.faqQuestionText, { color: textPrimary }]}>{faq.q}</Text>
                  <Ionicons
                    name={isActive ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={textSecondary}
                  />
                </View>
                {isActive && (
                  <View style={[styles.faqBody, { borderTopColor: cardBorder }]}>
                    <Text style={[styles.faqAnswerText, { color: textSecondary }]}>{faq.a}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* App Version Diagnostics Info */}
        <View style={styles.versionContainer}>
          <MaterialCommunityIcons name="shield-key-outline" size={18} color={textSecondary} />
          <Text style={[styles.versionText, { color: textSecondary }]}>
            Apex Core Diagnostics System • Version 1.4.0
          </Text>
          <Text style={[styles.versionServerText, { color: textSecondary }]}>
            Diagnostic Server: SECURE-SSL-US-EAST
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginBottom: 12,
    marginTop: 14,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingTitleText: {
    fontSize: 14,
    fontWeight: '700',
  },
  settingSubText: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  faqBlock: {
    gap: 10,
    marginBottom: 32,
  },
  faqRow: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  faqQuestionText: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
    marginRight: 12,
  },
  faqBody: {
    borderTopWidth: 1,
    padding: 14,
  },
  faqAnswerText: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
  versionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  versionText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  versionServerText: {
    fontSize: 10,
    fontWeight: '500',
  },
});
