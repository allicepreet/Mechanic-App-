import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useMechanic } from '@/components/MechanicContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface FAQItem {
  q: string;
  a: string;
  category: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    q: 'How do I start an active dispatch trip?',
    a: 'When an incoming request is accepted, it transitions to "Today\'s Schedule" on your dashboard. Open the ticket and swipe the slider at the bottom to depart the hub. This activates live GPS routing and telemetry broadcasting.',
    category: 'Operations',
  },
  {
    q: 'Why did the pending requests count not decrease immediately?',
    a: 'We have updated the core engine! Swipe and button-action counts now decrement instantly in real-time matching the animation frame, ensuring zero visual lag during active shifts.',
    category: 'Interface',
  },
  {
    q: 'How are weekly earnings calculated and paid?',
    a: 'All completed on-site repairs and mobile tuning fees are summed. Automated bank disbursements are settled every Monday at 12:00 AM UTC directly to your connected bank details.',
    category: 'Financials',
  },
  {
    q: 'What should I do if a client vehicle is not at the breakdown site?',
    a: 'Use the "Contact Client" action button in the active trip sheet, or tap the "Direct Dispatch Hotline" card below to connect directly with the Apex Dispatch and GPS telemetry center.',
    category: 'Operations',
  },
  {
    q: 'How do I toggle offline and online shifts?',
    a: 'Use the green duty status switch at the top of your dashboard. Turning it offline suspends the incoming customer request queue and locks the client preview portal.',
    category: 'Interface',
  },
];

export default function HelpScreen() {
  const { darkMode } = useMechanic();
  const insets = useSafeAreaInsets();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const activeBg = darkMode ? '#0B0F19' : '#F4F6F8';
  const cardBg = darkMode ? '#1E293B' : '#FFFFFF';
  const textPrimary = darkMode ? '#F8FAFC' : '#1E293B';
  const textSecondary = darkMode ? '#94A3B8' : '#64748B';
  const cardBorder = darkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(125, 160, 169, 0.1)';
  const primaryAccent = '#7DA0A9';

  const filteredFaqs = FAQ_DATA.filter(
    (faq) =>
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCallHotline = (title: string, phone: string) => {
    Alert.alert(
      'Simulating Voice Call',
      `Connecting to Apex ${title}...\n\nNumber: ${phone}\n\nThis is a secure voice dispatch simulation.`,
      [{ text: 'End Call', style: 'destructive' }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: activeBg }]}>
      {/* Sticky Header */}
      <View
        style={[
          styles.stickyHeader,
          {
            paddingTop: Math.max(insets.top, 16),
            backgroundColor: darkMode ? '#1E293B' : '#7DA0A9',
          },
        ]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            <Text style={styles.backBtnText}>Profile</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help & Support</Text>
          <View style={{ width: 80 }} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Support Banner Card */}
        <View style={[styles.bannerCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <Ionicons name="headset-outline" size={32} color={primaryAccent} />
          <Text style={[styles.bannerTitle, { color: textPrimary }]}>Apex Mechanic Support Terminal</Text>
          <Text style={[styles.bannerSubtitle, { color: textSecondary }]}>
            Active duty operators have 24/7 access to live telemetry, roadside dispatches, and priority voice routing.
          </Text>
        </View>

        {/* Live Hotline Cards */}
        <Text style={[styles.sectionHeading, { color: textPrimary }]}>Direct Dispatch Hotlines</Text>
        <View style={styles.hotlineGrid}>
          {/* Card 1: Telemetry Hotline */}
          <TouchableOpacity
            style={[styles.hotlineCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
            onPress={() => handleCallHotline('Rider Telemetry Center', '+1 (800) 555-APEX')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <MaterialCommunityIcons name="radio-tower" size={22} color="#10B981" />
            </View>
            <Text style={[styles.hotlineTitle, { color: textPrimary }]}>Telemetry Center</Text>
            <Text style={[styles.hotlineDesc, { color: textSecondary }]}>GPS and dispatch issues</Text>
            <Text style={[styles.hotlinePhone, { color: primaryAccent }]}>1-800-555-APEX</Text>
          </TouchableOpacity>

          {/* Card 2: Settlement Hotline */}
          <TouchableOpacity
            style={[styles.hotlineCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
            onPress={() => handleCallHotline('Bank Settlement Desk', '+1 (888) 777-Settler')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
              <MaterialCommunityIcons name="cash-register" size={22} color="#F59E0B" />
            </View>
            <Text style={[styles.hotlineTitle, { color: textPrimary }]}>Settlement Desk</Text>
            <Text style={[styles.hotlineDesc, { color: textSecondary }]}>Payout and earnings help</Text>
            <Text style={[styles.hotlinePhone, { color: primaryAccent }]}>1-888-777-SETT</Text>
          </TouchableOpacity>
        </View>

        {/* Apex Control Interactive Logs Mockup */}
        <Text style={[styles.sectionHeading, { color: textPrimary }]}>Apex Live Control Feed</Text>
        <View style={[styles.controlFeedCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={styles.feedHeader}>
            <View style={styles.pulseDot} />
            <Text style={styles.feedStatusText}>LIVE TELEMETRY COMMS FEED</Text>
          </View>
          
          <View style={styles.logContainer}>
            <Text style={styles.logTime}>[11:24:02 UTC] <Text style={styles.logGreen}>SYSTEM</Text> Online shifts validated. GPS status broadcast active.</Text>
            <Text style={styles.logTime}>[11:25:40 UTC] <Text style={styles.logAmber}>DISPATCH</Text> Model 3 breakdown at Oakwood Ave. Calipers painted Red.</Text>
            <Text style={styles.logTime}>[11:28:15 UTC] <Text style={styles.logBlue}>RIDER</Text> Dominic T. departing hub for on-site ECU stage 2 tune.</Text>
            <Text style={styles.logTime}>[11:30:10 UTC] <Text style={styles.logGreen}>CONTROL</Text> Tinder deck synchronization and flicker-free locks operational.</Text>
          </View>
        </View>

        {/* Search FAQ bar */}
        <Text style={[styles.sectionHeading, { color: textPrimary }]}>Frequently Asked Questions</Text>
        <View style={[styles.searchContainer, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <Ionicons name="search" size={18} color={textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search operator FAQs..."
            placeholderTextColor={textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: textPrimary }]}
          />
        </View>

        {/* FAQs Accordion */}
        <View style={styles.faqBlock}>
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => {
              const isActive = activeFaq === index;
              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.8}
                  style={[styles.faqRow, { backgroundColor: cardBg, borderColor: cardBorder }]}
                  onPress={() => setActiveFaq(isActive ? null : index)}
                >
                  <View style={styles.faqHeaderRow}>
                    <View style={styles.faqQuestionContainer}>
                      <View style={[styles.faqTag, { backgroundColor: faq.category === 'Financials' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(125, 160, 169, 0.1)' }]}>
                        <Text style={[styles.faqTagText, { color: faq.category === 'Financials' ? '#F59E0B' : primaryAccent }]}>
                          {faq.category}
                        </Text>
                      </View>
                      <Text style={[styles.faqQuestionText, { color: textPrimary }]}>{faq.q}</Text>
                    </View>
                    <Ionicons name={isActive ? 'chevron-up' : 'chevron-down'} size={16} color={textSecondary} />
                  </View>
                  {isActive && (
                    <View style={[styles.faqBody, { borderTopColor: cardBorder }]}>
                      <Text style={[styles.faqAnswerText, { color: textSecondary }]}>{faq.a}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={[styles.emptyFaq, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <Ionicons name="help-circle-outline" size={24} color={textSecondary} />
              <Text style={[styles.emptyFaqText, { color: textSecondary }]}>No matching questions found.</Text>
            </View>
          )}
        </View>

        {/* Footer Support Tag */}
        <View style={styles.footerSupportContainer}>
          <Text style={[styles.footerSupportText, { color: textSecondary }]}>
            Apex Core Diagnostics System • Support Hub
          </Text>
          <Text style={[styles.footerSupportSubtext, { color: textSecondary }]}>
            Secure dispatch tunnel with end-to-end telemetry encryption.
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
  stickyHeader: {
    height: 104,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 48,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  bannerCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    textAlign: 'center',
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 6,
    textAlign: 'center',
  },
  bannerSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    fontWeight: '500',
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginBottom: 12,
    marginTop: 12,
  },
  hotlineGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  hotlineCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  hotlineTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  hotlineDesc: {
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 12,
  },
  hotlinePhone: {
    fontSize: 12,
    fontWeight: '800',
  },
  controlFeedCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginRight: 6,
  },
  feedStatusText: {
    color: '#EF4444',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  logContainer: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  logTime: {
    color: '#94A3B8',
    fontSize: 10,
    fontFamily: 'monospace',
    lineHeight: 14,
  },
  logGreen: {
    color: '#10B981',
    fontWeight: '800',
  },
  logAmber: {
    color: '#F59E0B',
    fontWeight: '800',
  },
  logBlue: {
    color: '#3B82F6',
    fontWeight: '800',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  faqBlock: {
    gap: 10,
    marginBottom: 24,
  },
  faqRow: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  faqHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  faqQuestionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  faqTag: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  faqTagText: {
    fontSize: 8,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  faqQuestionText: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
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
  emptyFaq: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyFaqText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footerSupportContainer: {
    alignItems: 'center',
    marginTop: 10,
    gap: 4,
  },
  footerSupportText: {
    fontSize: 10,
    fontWeight: '700',
  },
  footerSupportSubtext: {
    fontSize: 9,
    fontWeight: '500',
    textAlign: 'center',
  },
});
