import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { router, usePathname } from 'expo-router';
import { useMechanic } from '@/components/MechanicContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BottomNav() {
  const { darkMode } = useMechanic();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const primaryAccent = '#7DA0A9';
  const textSecondary = darkMode ? '#94A3B8' : '#64748B';

  return (
    <View style={[styles.navbarContainer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={[styles.navbar, darkMode ? styles.navbarDark : styles.navbarLight]}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/mechanic/dashboard')}>
          <View style={styles.inactiveTabIcon}>
            <Ionicons name="speedometer" size={20} color={textSecondary} />
          </View>
          <Text style={[styles.navText, { color: textSecondary }]}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/mechanic/bookings')}>
          {pathname === '/mechanic/bookings' ? (
            <View style={[styles.activeTabHighlight, { backgroundColor: darkMode ? 'rgba(125, 160, 169, 0.15)' : 'rgba(125, 160, 169, 0.12)' }]}>
              <Ionicons name="construct" size={20} color={primaryAccent} />
            </View>
          ) : (
            <View style={styles.inactiveTabIcon}>
              <Ionicons name="construct" size={20} color={textSecondary} />
            </View>
          )}
          <Text style={[pathname === '/mechanic/bookings' ? styles.navTextActive : styles.navText, { color: pathname === '/mechanic/bookings' ? primaryAccent : textSecondary }]}>Bookings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/mechanic/earnings')}>
          <View style={styles.inactiveTabIcon}>
            <Ionicons name="cash" size={20} color={textSecondary} />
          </View>
          <Text style={[styles.navText, { color: textSecondary }]}>Earnings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/mechanic/payments')}>
          {pathname === '/mechanic/payments' ? (
            <View style={[styles.activeTabHighlight, { backgroundColor: darkMode ? 'rgba(125, 160, 169, 0.15)' : 'rgba(125, 160, 169, 0.12)' }]}>
              <MaterialCommunityIcons name="credit-card-outline" size={20} color={primaryAccent} />
            </View>
          ) : (
            <View style={styles.inactiveTabIcon}>
              <MaterialCommunityIcons name="credit-card-outline" size={20} color={textSecondary} />
            </View>
          )}
          <Text style={[pathname === '/mechanic/payments' ? styles.navTextActive : styles.navText, { color: pathname === '/mechanic/payments' ? primaryAccent : textSecondary }]}>Payments</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/mechanic/profile')}>
          <View style={styles.inactiveTabIcon}>
            <Ionicons name="person" size={20} color={textSecondary} />
          </View>
          <Text style={[styles.navText, { color: textSecondary }]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    height: 68,
    borderRadius: 28,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
    paddingHorizontal: 8,
  },
  navbarDark: {
    backgroundColor: 'rgba(30, 41, 59, 0.94)',
    borderColor: 'rgba(255, 255, 1, 0.08)',
  },
  navbarLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderColor: 'rgba(0, 0, 0, 0.05)',
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
    marginTop: 2,
  },
  navTextActive: {
    fontSize: 9,
    fontWeight: '800',
    marginTop: 2,
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
