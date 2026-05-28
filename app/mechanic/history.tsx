import BookingCard from '@/components/BookingCard';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { useMechanic } from '@/components/MechanicContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

const BASE_HTTP_URL = 'http://192.168.88.5:8080';

export default function HistoryScreen() {
  const { darkMode, authToken } = useMechanic();
  const [historyBookings, setHistoryBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    if (!authToken) return;
    try {
      setError(null);
      // Fetch completed and rejected as history
      const statuses = ['COMPLETED', 'REJECTED'];
      let allHistory: any[] = [];

      for (const status of statuses) {
        const response = await axios.get(`${BASE_HTTP_URL}/api/mechanic/history?status=${status}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const fetchedBookings = response.data || [];

        fetchedBookings.forEach((b: any) => {
          allHistory.push({
            id: String(b.bookingId),
            customerName: b.customerName || 'Customer',
            customerPhone: b.customerPhone || '',
            vehicle: b.problem || 'Unknown Vehicle',
            serviceType: b.problem || 'Service',
            price: b.totalAmount || 120,
            notes: b.problem || '',
            location: 'Mapped Location',
            time: b.bookedTime
              ? new Date(b.bookedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : new Date().toLocaleTimeString(),
            status: b.status?.toLowerCase() || status.toLowerCase(),
            latitude: b.latitude || 0,
            longitude: b.longitude || 0,
            customerId: b.customerId || undefined,
          });
        });
      }

      setHistoryBookings(allHistory);
    } catch (err: any) {
      console.error('[HISTORY] Failed to fetch history:', err.message);
      setError('Failed to load history.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [authToken]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchHistory();
  }, [authToken]);

  const activeBg = darkMode ? '#0F172A' : '#F4F6F8';
  const cardBorder = darkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(125, 160, 169, 0.1)';
  const textPrimary = darkMode ? '#F8FAFC' : '#1E293B';
  const textSecondary = darkMode ? '#94A3B8' : '#64748B';

  return (
    <View style={[styles.container, { backgroundColor: activeBg }]}>
      <Header title="History" showBack={false} darkMode={darkMode} />

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#00E676" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.listContainer, { paddingBottom: 110 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={darkMode ? '#00E5FF' : '#00E676'}
            />
          }
        >
          {error ? (
            <View style={[styles.emptyState, { backgroundColor: darkMode ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.6)', borderColor: cardBorder }]}>
              <Text style={[styles.emptyTitle, { color: '#ef4444' }]}>{error}</Text>
            </View>
          ) : historyBookings.length > 0 ? (
            historyBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onAccept={async () => { }}
                onReject={async () => { }}
                darkMode={darkMode}
              />
            ))
          ) : (
            <View style={[styles.emptyState, { backgroundColor: darkMode ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.6)', borderColor: cardBorder }]}>
              <View style={{ padding: 20, borderRadius: 40, backgroundColor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', marginBottom: 20 }}>
                <Ionicons name="time-outline" size={54} color={textSecondary} />
              </View>
              <Text style={[styles.emptyTitle, { color: textPrimary }]}>No History</Text>
              <Text style={[styles.emptyMessage, { color: textSecondary }]}>
                You currently have no bookings in your history.
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: { padding: 16 },
  emptyState: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyTitle: { fontSize: 16, fontWeight: '800', marginBottom: 8 },
  emptyMessage: { fontSize: 13, fontWeight: '500', textAlign: 'center', lineHeight: 18 },
});
