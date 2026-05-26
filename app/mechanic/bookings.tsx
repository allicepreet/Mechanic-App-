import BookingCard from '@/components/BookingCard';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { useMechanic } from '@/components/MechanicContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
              { backgroundColor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
              activeFilter === 'pending' && { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.4)' },
            ]}
            onPress={() => setActiveFilter('pending')}
          >
            <Text style={[styles.filterText, { color: activeFilter === 'pending' ? '#F59E0B' : textSecondary }]}>
              Pending ({pendingCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              { backgroundColor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
              activeFilter === 'active' && { backgroundColor: 'rgba(6, 182, 212, 0.15)', borderColor: 'rgba(6, 182, 212, 0.4)' },
            ]}
            onPress={() => setActiveFilter('active')}
          >
            <Text style={[styles.filterText, { color: activeFilter === 'active' ? '#06B6D4' : textSecondary }]}>
              Active ({activeCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              { backgroundColor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
              activeFilter === 'completed' && { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.4)' },
            ]}
            onPress={() => setActiveFilter('completed')}
          >
            <Text style={[styles.filterText, { color: activeFilter === 'completed' ? '#10B981' : textSecondary }]}>
              Completed ({completedCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              { backgroundColor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
              activeFilter === 'all' && { backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', borderColor: textPrimary },
            ]}
            onPress={() => setActiveFilter('all')}
          >
            <Text style={[styles.filterText, { color: activeFilter === 'all' ? textPrimary : textSecondary }]}>
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
          (activeFilter === 'pending' || activeFilter === 'active' ? filteredBookings.slice(0, 1) : filteredBookings).map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onAccept={acceptBooking}
              onReject={rejectBooking}
              darkMode={darkMode}
            />
          ))
        ) : (
          <View style={[styles.emptyState, { backgroundColor: darkMode ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.6)', borderColor: cardBorder }]}>
            <View style={{ padding: 20, borderRadius: 40, backgroundColor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', marginBottom: 20 }}>
              <Ionicons
                name={
                  activeFilter === 'pending'
                    ? 'time-outline'
                    : activeFilter === 'active'
                      ? 'construct-outline'
                      : activeFilter === 'completed'
                        ? 'checkmark-done-circle-outline'
                        : 'calendar-outline'
                }
                size={54}
                color={activeFilter === 'pending' ? '#F59E0B' : activeFilter === 'active' ? '#06B6D4' : activeFilter === 'completed' ? '#10B981' : textSecondary}
              />
            </View>
            <Text style={[styles.emptyTitle, { color: textPrimary }]}>
              {activeFilter === 'all' ? 'No Bookings' : `No ${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Bookings`}
            </Text>
            <Text style={[styles.emptyMessage, { color: textSecondary }]}>
              {activeFilter === 'pending'
                ? 'You have no pending requests right now.'
                : activeFilter === 'active'
                  ? 'No active jobs scheduled for today.'
                  : activeFilter === 'completed'
                    ? 'No completed jobs found.'
                    : 'You currently have no bookings in your history.'}
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
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  filterScroll: {
    paddingHorizontal: 16,
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '700',
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
});
