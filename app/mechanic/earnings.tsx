import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useMechanic } from '@/components/MechanicContext';
import Header from '@/components/Header';
import EarningsCard from '@/components/EarningsCard';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomNav from '@/components/BottomNav';

export default function EarningsScreen() {
  const {
    bookings,
    darkMode,
    totalEarnings,
    dailyEarnings,
    monthlyEarnings,
    completedJobsCount,
    weeklyJobs,
  } = useMechanic();

  const insets = useSafeAreaInsets();

  const activeBg = darkMode ? '#151718' : '#F8FAFC';
  const cardBg = darkMode ? '#1E2022' : '#FFFFFF';
  const textPrimary = darkMode ? '#ECEDEE' : '#0F172A';
  const textSecondary = darkMode ? '#9BA1A6' : '#64748B';
  const cardBorder = darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)';
  const primaryAccent = '#7DA0A9';

  
  const completedJobs = bookings.filter((b) => b.status === 'completed');

  const [selectedDay, setSelectedDay] = React.useState<number>(4); // Default to Friday
  const weeklyData = React.useMemo(() => {
    if (!weeklyJobs || weeklyJobs.length === 0) {
      return [
        { day: 'Mon', amount: 0, jobs: 0, date: 'Monday' },
        { day: 'Tue', amount: 0, jobs: 0, date: 'Tuesday' },
        { day: 'Wed', amount: 0, jobs: 0, date: 'Wednesday' },
        { day: 'Thu', amount: 0, jobs: 0, date: 'Thursday' },
        { day: 'Fri', amount: 0, jobs: 0, date: 'Friday' },
        { day: 'Sat', amount: 0, jobs: 0, date: 'Saturday' },
        { day: 'Sun', amount: 0, jobs: 0, date: 'Sunday' },
      ];
    }
    return weeklyJobs.map((item) => {
      const dayShort = item.day.substring(0, 3);
      // Let's estimate amount based on jobs count
      const estimatedAmt = item.totalJobs * 250;
      return {
        day: dayShort,
        amount: estimatedAmt,
        jobs: item.totalJobs,
        date: item.day,
      };
    });
  }, [weeklyJobs]);

  const maxWeeklyAmount = React.useMemo(() => {
    const maxVal = Math.max(...weeklyData.map(d => d.amount), 0);
    return maxVal > 0 ? maxVal : 1000;
  }, [weeklyData]);

  const serviceMix = [
    { name: 'Electrical & EV', share: '45%', color: '#06B6D4', count: 9 },
    { name: 'Brake & Suspension', share: '35%', color: '#F59E0B', count: 7 },
    { name: 'Engine Tuning', share: '20%', color: '#10B981', count: 4 },
  ];



  return (
    <View style={[styles.container, { backgroundColor: activeBg }]}>
      {/* Header Bar */}
      <Header title="Earnings Summary" showBack={false} darkMode={darkMode} />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]}
        showsVerticalScrollIndicator={false}
      >
    
        <EarningsCard
          daily={dailyEarnings}
          monthly={monthlyEarnings}
          total={totalEarnings}
          completedJobs={completedJobsCount}
          darkMode={darkMode}
        />

        <Text style={[styles.sectionTitle, { color: textPrimary }]}>Performance Analytics</Text>
        <View style={[styles.analyticsCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={styles.analyticsHeader}>
            <MaterialCommunityIcons name="chart-bar" size={20} color={primaryAccent} />
            <Text style={[styles.analyticsTitle, { color: textPrimary }]}>Weekly Telemetry & Revenue</Text>
          </View>
          
          <Text style={[styles.analyticsDesc, { color: textSecondary }]}>
            Tap on any bar column below to inspect detailed daily telemetry, earnings, and completed repair sessions.
          </Text>

          {/* Graphical Bar Chart */}
          <View style={styles.chartContainer}>
            {weeklyData.map((item, idx) => {
              const isSelected = selectedDay === idx;
              const heightPercent = `${(item.amount / maxWeeklyAmount) * 100}%`;
              return (
                <View key={idx} style={styles.chartColumn}>
                  <View style={styles.barWrapper}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setSelectedDay(idx)}
                      style={[
                        styles.barTrack,
                        {
                          backgroundColor: isSelected 
                            ? 'rgba(6, 182, 212, 0.08)' 
                            : 'rgba(255, 255, 255, 0.03)',
                          borderColor: isSelected 
                            ? 'rgba(6, 182, 212, 0.2)' 
                            : 'transparent'
                        }
                      ]}
                    >
                      <View 
                        style={[
                          styles.barFill, 
                          { 
                            height: heightPercent as any, 
                            backgroundColor: isSelected ? '#06B6D4' : primaryAccent 
                          }
                        ]} 
                      />
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.chartDayLabel, { color: isSelected ? '#06B6D4' : textSecondary }]}>
                    {item.day}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Interactive Day Inspection Box */}
          {(() => {
            const activeDayData = weeklyData[selectedDay] || weeklyData[0] || { day: 'N/A', amount: 0, jobs: 0, date: 'N/A' };
            return (
              <View style={[styles.chartDetailBox, { backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)', borderColor: cardBorder }]}>
                <View style={styles.chartDetailRow}>
                  <Text style={[styles.chartDetailLabel, { color: textSecondary }]}>DATE: {activeDayData.date}</Text>
                  <Text style={[styles.chartDetailValue, { color: textPrimary }]}>{activeDayData.day}</Text>
                </View>
                <View style={[styles.chartDetailDivider, { backgroundColor: cardBorder }]} />
                <View style={styles.chartDetailRow}>
                  <View>
                    <Text style={[styles.chartDetailAmt, { color: '#10B981' }]}>Rs. {activeDayData.amount}</Text>
                    <Text style={[styles.chartDetailSub, { color: textSecondary }]}>Daily Revenue</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.chartDetailJobs, { color: textPrimary }]}>{activeDayData.jobs} Jobs</Text>
                    <Text style={[styles.chartDetailSub, { color: textSecondary }]}>Repair Sessions</Text>
                  </View>
                </View>
              </View>
            );
          })()}

          {/* Service Proportions Breakdown */}
          <View style={[styles.chartDetailDivider, { backgroundColor: cardBorder, marginVertical: 16 }]} />
          
          <View style={styles.analyticsHeader}>
            <MaterialCommunityIcons name="chart-pie" size={18} color={primaryAccent} />
            <Text style={[styles.analyticsTitle, { color: textPrimary }]}>Service Category Proportions</Text>
          </View>
          
          <View style={styles.proportionContainer}>
            {serviceMix.map((mix, idx) => (
              <View 
                key={idx} 
                style={[
                  styles.proportionSegment, 
                  { 
                    width: mix.share as any, 
                    backgroundColor: mix.color,
                    borderTopLeftRadius: idx === 0 ? 6 : 0,
                    borderBottomLeftRadius: idx === 0 ? 6 : 0,
                    borderTopRightRadius: idx === serviceMix.length - 1 ? 6 : 0,
                    borderBottomRightRadius: idx === serviceMix.length - 1 ? 6 : 0,
                  }
                ]} 
              />
            ))}
          </View>

          <View style={styles.legendGrid}>
            {serviceMix.map((mix, idx) => (
              <View key={idx} style={styles.legendItem}>
                <View style={[styles.legendIndicator, { backgroundColor: mix.color }]} />
                <View>
                  <Text style={[styles.legendText, { color: textPrimary }]}>{mix.name}</Text>
                  <Text style={[styles.legendSubtext, { color: textSecondary }]}>{mix.share} ({mix.count} sessions)</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

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

          <View style={[styles.paymentDateRow, { borderTopColor: cardBorder, marginBottom: 0 }]}>
            <Ionicons name="calendar-outline" size={16} color={textSecondary} />
            <Text style={[styles.paymentDateText, { color: textSecondary }]}>
              Next Automated Payout: <Text style={{ color: textPrimary, fontWeight: '700' }}>May 25, 2026</Text>
            </Text>
          </View>
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
      <BottomNav />
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
  analyticsCard: {
    marginHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  analyticsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  analyticsTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  analyticsDesc: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barWrapper: {
    width: '100%',
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barTrack: {
    width: 14,
    height: '100%',
    justifyContent: 'flex-end',
    borderRadius: 7,
    borderWidth: 1,
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  chartDayLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 8,
  },
  chartDetailBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginTop: 4,
  },
  chartDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chartDetailLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  chartDetailValue: {
    fontSize: 11,
    fontWeight: '800',
  },
  chartDetailDivider: {
    height: 1,
    marginVertical: 10,
  },
  chartDetailAmt: {
    fontSize: 16,
    fontWeight: '900',
  },
  chartDetailSub: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
  },
  chartDetailJobs: {
    fontSize: 14,
    fontWeight: '800',
  },
  proportionContainer: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 10,
    marginBottom: 16,
    width: '100%',
  },
  proportionSegment: {
    height: '100%',
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '48%',
    marginBottom: 10,
  },
  legendIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
    marginTop: 3,
  },
  legendText: {
    fontSize: 10,
    fontWeight: '700',
  },
  legendSubtext: {
    fontSize: 9,
    fontWeight: '500',
    marginTop: 1,
  },
});
