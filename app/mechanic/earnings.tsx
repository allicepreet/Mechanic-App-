import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useMechanic } from '@/components/MechanicContext';
import Header from '@/components/Header';
import EarningsCard from '@/components/EarningsCard';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EarningsScreen() {
  const {
    bookings,
    darkMode,
    totalEarnings,
    dailyEarnings,
    monthlyEarnings,
    completedJobsCount,
  } = useMechanic();

  const insets = useSafeAreaInsets();

  const activeBg = darkMode ? '#151718' : '#F8FAFC';
  const cardBg = darkMode ? '#1E2022' : '#FFFFFF';
  const textPrimary = darkMode ? '#ECEDEE' : '#0F172A';
  const textSecondary = darkMode ? '#9BA1A6' : '#64748B';
  const cardBorder = darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)';
  const primaryAccent = '#7DA0A9';

  // Extract completed bookings as history list
  const completedJobs = bookings.filter((b) => b.status === 'completed');

  const handleRequestPayout = () => {
    Alert.alert(
      'Instant Payout requested',
      `Simulating payout of Rs. ${dailyEarnings.toFixed(0)} to your connected Business Account (Apex Shop Account •••• 9840). Funds will arrive shortly!`
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: activeBg }]}>
      {/* Header Bar */}
      <Header title="Earnings Summary" showBack={false} darkMode={darkMode} />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Metric Board */}
        <EarningsCard
          daily={dailyEarnings}
          monthly={monthlyEarnings}
          total={totalEarnings}
          completedJobs={completedJobsCount}
          darkMode={darkMode}
        />

        {/* Bank & Payout Controller Panel */}
        <Text style={[styles.sectionTitle, { color: textPrimary }]}>Payout Details</Text>
        <View style={[styles.payoutCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={styles.bankRow}>
            <MaterialCommunityIcons name="bank-transfer" size={24} color="#F59E0B" />
            <View style={styles.bankDetails}>
              <Text style={[styles.bankName, { color: textPrimary }]}>Apex Shop Account</Text>
              <Text style={[styles.bankNumber, { color: textSecondary }]}>Chase Business •••• 9840</Text>
            </View>
            <View style={styles.connectedBadge}>
              <Text style={styles.connectedBadgeText}>Active</Text>
            </View>
          </View>

          <View style={[styles.paymentDateRow, { borderTopColor: cardBorder }]}>
            <Ionicons name="calendar-outline" size={16} color={textSecondary} />
            <Text style={[styles.paymentDateText, { color: textSecondary }]}>
              Next Automated Payout: <Text style={{ color: textPrimary, fontWeight: '700' }}>May 25, 2026</Text>
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.payoutBtn,
              {
                backgroundColor: dailyEarnings > 0 ? '#10B981' : 'rgba(255, 255, 255, 0.05)',
                borderColor: dailyEarnings > 0 ? 'transparent' : cardBorder,
                borderWidth: dailyEarnings > 0 ? 0 : 1,
              },
            ]}
            disabled={dailyEarnings === 0}
            onPress={handleRequestPayout}
          >
            <Text
              style={[
                styles.payoutBtnText,
                { color: dailyEarnings > 0 ? '#FFFFFF' : textSecondary },
              ]}
            >
              {dailyEarnings > 0 ? 'Request Instant Payout' : 'No Recent Payout Balance'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Transaction History Ledger */}
        <Text style={[styles.sectionTitle, { color: textPrimary }]}>Transaction History</Text>
        {completedJobs.length > 0 ? (
          completedJobs.map((job) => (
            <View key={job.id} style={[styles.transactionCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <View style={styles.txHeader}>
                <View style={styles.txMeta}>
                  <Text style={[styles.txVehicle, { color: textPrimary }]} numberOfLines={1}>
                    {job.vehicle}
                  </Text>
                  <Text style={[styles.txDate, { color: textSecondary }]}>
                    {job.date} • {job.time}
                  </Text>
                </View>
                <Text style={styles.txPrice}>+Rs. {job.price.toFixed(0)}</Text>
              </View>

              <View style={[styles.txFooter, { borderTopColor: cardBorder }]}>
                <Ionicons name="checkmark-done" size={14} color="#10B981" />
                <Text style={[styles.txService, { color: textSecondary }]}>{job.serviceType}</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={[styles.emptyLedger, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <Ionicons name="receipt-outline" size={32} color={textSecondary} />
            <Text style={[styles.emptyLedgerText, { color: textPrimary }]}>No transactions yet</Text>
            <Text style={[styles.emptyLedgerSub, { color: textSecondary }]}>
              Complete active bookings on your dashboard to see your earnings transaction history here.
            </Text>
          </View>
        )}

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

          <TouchableOpacity style={styles.navItem} onPress={() => {}}>
            <View style={[styles.activeTabHighlight, { backgroundColor: darkMode ? 'rgba(125, 160, 169, 0.15)' : 'rgba(125, 160, 169, 0.12)' }]}>
              <Ionicons name="cash" size={20} color={primaryAccent} />
            </View>
            <Text style={[styles.navTextActive, { color: primaryAccent }]}>Earnings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/mechanic/profile')}>
            <View style={styles.inactiveTabIcon}>
              <Ionicons name="person" size={20} color={textSecondary} />
            </View>
            <Text style={[styles.navText, { color: textSecondary }]}>Profile</Text>
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
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginBottom: 12,
    marginTop: 8,
  },
  payoutCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  bankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  bankDetails: {
    flex: 1,
    marginLeft: 12,
  },
  bankName: {
    fontSize: 15,
    fontWeight: '700',
  },
  bankNumber: {
    fontSize: 12,
    marginTop: 2,
  },
  connectedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  connectedBadgeText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
  },
  paymentDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 12,
    marginBottom: 16,
  },
  paymentDateText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 8,
  },
  payoutBtn: {
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  payoutBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  transactionCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  txHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  txMeta: {
    flex: 1,
    marginRight: 12,
  },
  txVehicle: {
    fontSize: 14,
    fontWeight: '700',
  },
  txDate: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  txPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#10B981',
  },
  txFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 8,
  },
  txService: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
    flex: 1,
  },
  emptyLedger: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyLedgerText: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 10,
    marginBottom: 4,
  },
  emptyLedgerSub: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 16,
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
