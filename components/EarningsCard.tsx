import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface EarningsCardProps {
  daily: number;
  monthly: number;
  total: number;
  completedJobs: number;
  darkMode?: boolean;
}

export default function EarningsCard({
  daily,
  monthly,
  total,
  completedJobs,
  darkMode = true,
}: EarningsCardProps) {
  const textPrimary = darkMode ? '#ECEDEE' : '#0F172A';
  const textSecondary = darkMode ? '#9BA1A6' : '#64748B';
  const cardBorder = darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)';

  return (
    <View style={[styles.card, darkMode ? styles.cardDark : styles.cardLight, { borderColor: cardBorder }]}>
      {/* Glow Effect / Top Info */}
      <View style={styles.topRow}>
        <View style={styles.titleSec}>
          <MaterialCommunityIcons name="wallet-outline" size={20} color="#F59E0B" />
          <Text style={[styles.title, { color: textSecondary }]}>EARNINGS SUMMARY</Text>
        </View>
        <Text style={[styles.jobsBadge, { backgroundColor: darkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)' }]}>
          {completedJobs} Jobs Done
        </Text>
      </View>

      {/* Main Income Figure */}
      <View style={styles.mainEarnings}>
        <Text style={[styles.earningsLabel, { color: textSecondary }]}>Monthly Balance</Text>
        <Text style={[styles.earningsValue, { color: textPrimary }]}>Rs. {monthly.toFixed(0)}</Text>
      </View>

      {/* Grid splits for daily & total */}
      <View style={[styles.grid, { borderTopColor: cardBorder }]}>
        <View style={styles.gridColumn}>
          <Text style={[styles.gridLabel, { color: textSecondary }]}>Today's Earnings</Text>
          <Text style={[styles.gridValue, { color: '#10B981' }]}>+Rs. {daily.toFixed(0)}</Text>
        </View>

        <View style={[styles.gridDivider, { backgroundColor: cardBorder }]} />

        <View style={styles.gridColumn}>
          <Text style={[styles.gridLabel, { color: textSecondary }]}>All-Time Revenue</Text>
          <Text style={[styles.gridValue, { color: textPrimary }]}>Rs. {total.toFixed(0)}</Text>
        </View>
      </View>

      {/* Bottom mini-bar showing target progression */}
      <View style={styles.progression}>
        <View style={styles.progressTextRow}>
          <Text style={[styles.progressLabel, { color: textSecondary }]}>Monthly Shop Target</Text>
          <Text style={[styles.progressValText, { color: textPrimary }]}>80% Achieved</Text>
        </View>
        <View style={[styles.progressBarBg, { backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)' }]}>
          <View style={styles.progressBarActive} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  cardDark: {
    backgroundColor: '#1E2022',
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleSec: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginLeft: 6,
  },
  jobsBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  mainEarnings: {
    marginBottom: 20,
  },
  earningsLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  earningsValue: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  grid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 16,
    marginBottom: 16,
  },
  gridColumn: {
    flex: 1,
  },
  gridDivider: {
    width: 1,
    marginHorizontal: 16,
  },
  gridLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  gridValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  progression: {
    marginTop: 4,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  progressValText: {
    fontSize: 11,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarActive: {
    height: '100%',
    width: '80%',
    backgroundColor: '#F59E0B',
    borderRadius: 3,
  },
});
