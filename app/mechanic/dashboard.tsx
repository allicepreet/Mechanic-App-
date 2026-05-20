import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, Platform, Dimensions, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useMechanic, Booking } from '@/components/MechanicContext';
import BookingCard from '@/components/BookingCard';
import TinderCardStack from '@/components/TinderCardStack';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SCREEN_WIDTH = Dimensions.get('window').width;

const VEHICLE_IMAGES: Record<string, any> = {
  B001: require('@/assets/images/tesla.png'),
  B003: require('@/assets/images/tesla.png'),
  B004: require('@/assets/images/audi.png'),
  B006: require('@/assets/images/porsche.png'),
  B007: require('@/assets/images/audi.png'),
  B008: require('@/assets/images/mustang.png'),
  B002: require('@/assets/images/porsche.png'),
  B005: require('@/assets/images/mustang.png'),
};

export default function DashboardScreen() {
  const {
    bookings,
    garageInfo,
    darkMode,
    dailyEarnings,
    monthlyEarnings,
    completedJobsCount,
    acceptBooking,
    rejectBooking,
    refreshBookings,
  } = useMechanic();

  const [refreshing, setRefreshing] = React.useState(false);

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

  const headerBg = darkMode ? '#1E293B' : '#7DA0A9';
  const headerBorder = darkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.1)';
  const headerTextPrimary = darkMode ? '#F8FAFC' : '#FFFFFF';
  const headerTextSecondary = darkMode ? '#94A3B8' : '#E2ECEE';

  // Filter bookings for sections
  const pendingRequests = bookings.filter((b) => b.status === 'pending');
  const activeJobs = bookings.filter((b) => b.status === 'accepted' || b.status === 'in_progress');

  return (
    <View style={[styles.container, { backgroundColor: activeBg }]}>
      {/* Top Brand Bar */}
      <View
        style={[
          styles.topHeader,
          {
            backgroundColor: headerBg,
            borderBottomColor: headerBorder,
            paddingTop: Math.max(insets.top, Platform.OS === 'ios' ? 44 : 20),
          },
        ]}
      >
        <View style={styles.topHeaderContent}>
          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => router.push('/mechanic/profile')}
          >
            <Image
              source={require('@/assets/images/profile.png')}
              style={styles.avatarImg}
            />
            <View style={[styles.onlineBadge, { borderColor: headerBg }]} />
          </TouchableOpacity>

          <View style={styles.brandInfo}>
            <Text style={[styles.garageText, { color: headerTextPrimary }]}>{garageInfo.name}</Text>
            <Text style={[styles.statusText, { color: headerTextSecondary }]}>Active Duty • {garageInfo.ownerName}</Text>
          </View>

          <TouchableOpacity
            style={[styles.settingsBtn, { backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.15)' }]}
            onPress={() => router.push('/mechanic/settings')}
          >
            <Ionicons name="settings-sharp" size={20} color={headerTextPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={primaryAccent}
            colors={[primaryAccent]}
            progressBackgroundColor={darkMode ? '#1E293B' : '#FFFFFF'}
          />
        }
      >
        {/* Quick Earnings Dashboard Banner */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push('/mechanic/earnings')}
          style={[
            styles.statsCard,
            darkMode ? styles.statsCardDark : styles.statsCardLight,
            { borderColor: darkMode ? cardBorder : 'transparent' },
          ]}
        >
          <View style={styles.statsHeader}>
            <View style={styles.statsLabelContainer}>
              <MaterialCommunityIcons name="finance" size={18} color={darkMode ? primaryAccent : '#FFFFFF'} />
              <Text style={[styles.statsTitle, { color: darkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.9)' }]}>EARNINGS OVERVIEW</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
          </View>

          <View style={styles.statsMain}>
            <View>
              <Text style={styles.statsSubVal}>Rs. {monthlyEarnings.toFixed(0)}</Text>
              <Text style={styles.statsSubLbl}>Monthly Revenue</Text>
            </View>

            <View style={[styles.statDivider, { backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)' }]} />

            <View>
              <Text style={[styles.statsSubVal, { color: darkMode ? '#10B981' : '#FFFFFF' }]}>+Rs. {dailyEarnings.toFixed(0)}</Text>
              <Text style={styles.statsSubLbl}>Recent Revenue</Text>
            </View>

            <View style={[styles.statDivider, { backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)' }]} />

            <View>
              <Text style={styles.statsSubVal}>{completedJobsCount}</Text>
              <Text style={styles.statsSubLbl}>Jobs Closed</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Snappy Pending Requests Horizontal Carousel */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>
            Pending Requests ({pendingRequests.length})
          </Text>
          {pendingRequests.length > 0 && (
            <TouchableOpacity onPress={() => router.push('/mechanic/bookings')}>
              <Text style={[styles.viewAllText, { color: primaryAccent }]}>View All</Text>
            </TouchableOpacity>
          )}
        </View>

        {pendingRequests.length > 0 ? (
          <View style={{ paddingHorizontal: 16 }}>
            <TinderCardStack
              bookings={pendingRequests}
              onAccept={acceptBooking}
              onReject={rejectBooking}
              darkMode={darkMode}
            />
          </View>
        ) : (
          <View style={[styles.emptyCard, { backgroundColor: cardBg, borderColor: cardBorder, marginHorizontal: 16 }]}>
            <Ionicons name="checkmark-done-circle" size={40} color="#10B981" />
            <Text style={[styles.emptyText, { color: textPrimary }]}>All Caught Up!</Text>
            <Text style={[styles.emptySub, { color: textSecondary }]}>
              There are no pending service requests to review.
            </Text>
          </View>
        )}

        {/* Today's Schedule Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>
            Today's Schedule ({activeJobs.length})
          </Text>
        </View>

        {activeJobs.length > 0 ? (
          activeJobs.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              darkMode={darkMode}
            />
          ))
        ) : (
          <View style={[styles.emptyCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <MaterialCommunityIcons name="calendar-blank" size={32} color={primaryAccent} />
            <Text style={[styles.emptyText, { color: textPrimary }]}>No Active Services</Text>
            <Text style={[styles.emptySub, { color: textSecondary }]}>
              Accept pending requests above to begin diagnostic and service operations.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Reusable Premium Floating Bottom Navigation Bar */}
      <View style={[styles.navbarContainer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={[styles.navbar, darkMode ? styles.navbarDark : styles.navbarLight]}>
          <TouchableOpacity style={styles.navItem} onPress={() => {}}>
            <View style={[styles.activeTabHighlight, { backgroundColor: darkMode ? 'rgba(125, 160, 169, 0.15)' : 'rgba(125, 160, 169, 0.12)' }]}>
              <Ionicons name="speedometer" size={20} color={primaryAccent} />
            </View>
            <Text style={[styles.navTextActive, { color: primaryAccent }]}>Dashboard</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/mechanic/bookings')}>
            <View style={styles.inactiveTabIcon}>
              <Ionicons name="construct" size={20} color={textSecondary} />
            </View>
            <Text style={[styles.navText, { color: textSecondary }]}>Bookings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/mechanic/earnings')}>
            <View style={styles.inactiveTabIcon}>
              <Ionicons name="cash" size={20} color={textSecondary} />
            </View>
            <Text style={[styles.navText, { color: textSecondary }]}>Earnings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/mechanic/profile')}>
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
  topHeader: {
    borderBottomWidth: 1,
    paddingBottom: 14,
    zIndex: 10,
  },
  topHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 48,
  },
  avatarBtn: {
    position: 'relative',
  },
  avatarImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#1E2022',
  },
  brandInfo: {
    flex: 1,
    marginLeft: 12,
  },
  garageText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  settingsBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  statsCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  statsCardDark: {
    backgroundColor: '#1E2022',
  },
  statsCardLight: {
    backgroundColor: '#7DA0A9',
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  statsLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: 'rgba(255, 255, 255, 0.6)',
    marginLeft: 6,
  },
  statsMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsSubVal: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  statsSubLbl: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
  carouselContainer: {
    paddingLeft: 16,
    paddingRight: 8,
    paddingBottom: 20,
  },
  carouselCard: {
    width: SCREEN_WIDTH * 0.82,
    marginRight: 16,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    position: 'relative',
  },
  carouselImage: {
    width: '100%',
    height: 125,
  },
  carouselPriceBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#10B981',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  carouselPriceText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  carouselBody: {
    padding: 14,
  },
  carouselTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  carouselService: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  carouselSub: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 12,
  },
  carouselButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  carouselBtn: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineBtn: {
    borderWidth: 1,
  },
  acceptBtn: {
    borderWidth: 0,
  },
  declineBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },
  acceptBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 10,
    marginBottom: 4,
  },
  emptySub: {
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
