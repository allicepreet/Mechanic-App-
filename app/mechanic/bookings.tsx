import React, { useState } from 'react';
import BottomNav from '@/components/BottomNav';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Platform, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useMechanic, Booking } from '@/components/MechanicContext';
import BookingCard from '@/components/BookingCard';
import Header from '@/components/Header';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type FilterType = 'all' | 'pending' | 'active' | 'completed';

export default function BookingsScreen() {
  const { bookings, darkMode, acceptBooking, rejectBooking, refreshBookings } = useMechanic();
  const [activeFilter, setActiveFilter] = useState<FilterType>('pending');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      refreshBookings();
      setRefreshing(false);
    }, 1500);
  }, [refreshBookings]);

  const insets = useSafeAreaInsets();

  const activeBg = darkMode ? '#0F172A' : '#F4F6F8';
  const cardBg = darkMode ? '#1E293B' : '#FFFFFF';
  const textPrimary = darkMode ? '#F8FAFC' : '#1E293B';
  const textSecondary = darkMode ? '#94A3B8' : '#64748B';
  const cardBorder = darkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(125, 160, 169, 0.1)';
  const primaryAccent = '#7DA0A9';


  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const activeCount = bookings.filter((b) => b.status === 'accepted' || b.status === 'in_progress').length;
  const completedCount = bookings.filter((b) => b.status === 'completed').length;

  const filteredBookings = bookings.filter((b) => {
    if (activeFilter === 'pending') return b.status === 'pending';
    if (activeFilter === 'active') return b.status === 'accepted' || b.status === 'in_progress';
    if (activeFilter === 'completed') return b.status === 'completed';
    return true; 
  });

  return (
    <View style={[styles.container, { backgroundColor: activeBg }]}>
      
      <Header title="Bookings" showBack={false} darkMode={darkMode} />

      
      <View style={[styles.filterBar, { borderBottomColor: cardBorder }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === 'pending' && styles.filterTabActive,
              activeFilter === 'pending' && { borderBottomColor: primaryAccent },
            ]}
            onPress={() => setActiveFilter('pending')}
          >
            <Text style={[styles.filterText, activeFilter === 'pending' ? [styles.filterTextActive, { color: primaryAccent }] : { color: textSecondary }]}>
              Pending ({pendingCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === 'active' && styles.filterTabActive,
              activeFilter === 'active' && { borderBottomColor: '#06B6D4' },
            ]}
            onPress={() => setActiveFilter('active')}
          >
            <Text style={[styles.filterText, activeFilter === 'active' ? styles.filterTextActive : { color: textSecondary }]}>
              Active ({activeCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === 'completed' && styles.filterTabActive,
              activeFilter === 'completed' && { borderBottomColor: '#10B981' },
            ]}
            onPress={() => setActiveFilter('completed')}
          >
            <Text style={[styles.filterText, activeFilter === 'completed' ? styles.filterTextActive : { color: textSecondary }]}>
              Completed ({completedCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === 'all' && styles.filterTabActive,
              activeFilter === 'all' && { borderBottomColor: textPrimary },
            ]}
            onPress={() => setActiveFilter('all')}
          >
            <Text style={[styles.filterText, activeFilter === 'all' ? [styles.filterTextActive, { color: textPrimary }] : { color: textSecondary }]}>
              All Jobs ({bookings.length})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      
      <ScrollView
        contentContainerStyle={[styles.listContainer, { paddingBottom: 110 }]}
        showsVerticalScrollIndicator={false}
      >
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onAccept={acceptBooking}
              onReject={rejectBooking}
              darkMode={darkMode}
            />
          ))
        ) : (
          <View style={[styles.emptyState, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <Ionicons
              name={
                activeFilter === 'pending'
                  ? 'checkmark-done-circle'
                  : activeFilter === 'active'
                  ? 'construct-outline'
                  : 'calendar-outline'
              }
              size={48}
              color={activeFilter === 'pending' ? '#10B981' : activeFilter === 'active' ? '#06B6D4' : textSecondary}
              style={styles.emptyIcon}
            />
            <Text style={[styles.emptyTitle, { color: textPrimary }]}>
              No {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Bookings
            </Text>
            <Text style={[styles.emptyMessage, { color: textSecondary }]}>
              {activeFilter === 'pending'
                ? 'You have no pending requests right now.'
                : activeFilter === 'active'
                ? 'No active jobs scheduled for today.'
                : 'No completed jobs found.'}
            </Text>
          </View>
        )}
      </ScrollView>

      
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterBar: {
    borderBottomWidth: 1,
  },
  filterScroll: {
    paddingHorizontal: 12,
  },
  filterTab: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  filterTabActive: {
    borderBottomWidth: 2,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '700',
  },
  filterTextActive: {
    color: '#F59E0B',
  },
  listContainer: {
    padding: 16,
  },
  emptyState: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
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
    borderColor: 'rgba(255, 255, 255, 0.08)',
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
