import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, Platform, Dimensions, RefreshControl, Alert } from 'react-native';
  import { router, usePathname } from 'expo-router';
import { useMechanic, Booking } from '@/components/MechanicContext';
import BookingCard from '@/components/BookingCard';
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
    isOnline,
    setIsOnline,
    isSocketConnected,
    currentCoords,
    mechanicId,
  } = useMechanic();

  const pathname = usePathname();
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
  const pendingRequests = isOnline ? bookings.filter((b) => b.status === 'pending') : [];
  const activeJobs = bookings.filter((b) => b.status === 'accepted' || b.status === 'in_progress' || b.status === 'arrived');
  // Top pending request (shown as notification)
  const topRequest = pendingRequests[0] ?? null;

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
            <View style={[styles.onlineBadge, { backgroundColor: isOnline ? '#10B981' : '#64748B', borderColor: headerBg }]} />
          </TouchableOpacity>

          <View style={styles.brandInfo}>
            <Text style={[styles.garageText, { color: headerTextPrimary }]}>{garageInfo.name}</Text>
            <Text style={[styles.statusText, { color: headerTextSecondary }]}>
              {isOnline ? 'Online' : 'Offline'} • ID: {mechanicId || '5'} • {garageInfo.ownerName}
            </Text>
          </View>

          {/* Active/Inactive Toggle Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.statusToggleBtn,
              {
                backgroundColor: isOnline ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                borderColor: isOnline ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)',
              }
            ]}
            onPress={() => setIsOnline(!isOnline)}
          >
            <View style={[styles.statusToggleDot, { backgroundColor: isOnline ? '#10B981' : '#EF4444' }]} />
            <Text style={[styles.statusToggleText, { color: isOnline ? '#10B981' : '#EF4444' }]}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingsBtn, { backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.15)', marginRight: 8 }]}
            onPress={() => router.push('/mechanic/customer-preview')}
          >
            <MaterialCommunityIcons name="play-circle-outline" size={22} color={headerTextPrimary} />
          </TouchableOpacity>

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
        {/* Live WebSocket GPS Tracking Banner */}
        {isOnline && (
          <View
            style={[
              styles.gpsBanner,
              {
                backgroundColor: cardBg,
                borderColor: cardBorder,
              }
            ]}
          >
            <View style={styles.gpsBannerLeft}>
              <View style={styles.pulseContainer}>
                <View 
                  style={[
                    styles.pulseOuter, 
                    { backgroundColor: isSocketConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)' }
                  ]} 
                />
                <View 
                  style={[
                    styles.pulseInner, 
                    { backgroundColor: isSocketConnected ? '#10B981' : '#EF4444' }
                  ]} 
                />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={[styles.gpsTitle, { color: textPrimary }]}>
                  LIVE LOCATION
                </Text>
                <Text style={[styles.gpsCoords, { color: textSecondary }]}>
                  {currentCoords 
                    ? `Lat: ${currentCoords.latitude.toFixed(5)}°  ·  Lon: ${currentCoords.longitude.toFixed(5)}°`
                    : 'Getting location...'
                  }
                </Text>
                {isSocketConnected && (
                  <View style={{ marginTop: 8, backgroundColor: 'rgba(6, 182, 212, 0.08)', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(6, 182, 212, 0.2)' }}>
                    <Text style={{ color: '#06B6D4', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 }}>
                      <Ionicons name="wifi" size={9} color="#06B6D4" /> SENDING LOCATION EVERY 3s
                    </Text>
                    <Text style={{ color: textSecondary, fontSize: 9, fontWeight: '600', marginTop: 4, fontFamily: 'monospace' }}>
                      Endpoint: /app/mechanic/location{'\n'}
                      Auth: Bearer [JWT Token]{'\n'}
                      Payload: {`{ userId: ${mechanicId}, lat: ${currentCoords?.latitude.toFixed(4)}, lon: ${currentCoords?.longitude.toFixed(4)} }`}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View 
                style={[
                  styles.gpsBadge, 
                  { backgroundColor: isSocketConnected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)' }
                ]}
              >
                <MaterialCommunityIcons 
                  name={isSocketConnected ? 'transit-connection-variant' : 'transit-connection-horizontal'} 
                  size={12} 
                  color={isSocketConnected ? '#10B981' : '#EF4444'} 
                />
                <Text 
                  style={[
                    styles.gpsBadgeText, 
                    { color: isSocketConnected ? '#10B981' : '#EF4444' }
                  ]}
                >
                  {isSocketConnected ? 'LIVE FEED' : 'RECONNECTING'}
                </Text>
              </View>
              <View style={[styles.gpsBadge, { backgroundColor: 'rgba(245, 158, 11, 0.12)', marginLeft: 8 }]}>
                <Ionicons name="person" size={12} color="#F59E0B" />
                <Text style={[styles.gpsBadgeText, { color: '#F59E0B' }]}>ID: {mechanicId || '5'}</Text>
              </View>
            </View>
          </View>
        )}

        {/* ACTIVE SERVICE TRACKER BANNER */}
        {activeJobs.length > 0 && (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push({ pathname: '/mechanic/booking-details', params: { id: activeJobs[0].id } })}
            style={[
              styles.activeServiceBanner,
              { 
                backgroundColor: activeJobs[0].status === 'arrived' ? 'rgba(16, 185, 129, 0.1)' : activeJobs[0].status === 'in_progress' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(6, 182, 212, 0.1)', 
                borderColor: activeJobs[0].status === 'arrived' ? '#10B981' : activeJobs[0].status === 'in_progress' ? '#3B82F6' : '#06B6D4' 
              }
            ]}
          >
            <View style={styles.activeServiceHeader}>
              <View style={styles.activeServiceDotContainer}>
                <View style={[styles.activeServiceDotOuter, { backgroundColor: activeJobs[0].status === 'arrived' ? 'rgba(16, 185, 129, 0.2)' : activeJobs[0].status === 'in_progress' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(6, 182, 212, 0.2)' }]} />
                <View style={[styles.activeServiceDotInner, { backgroundColor: activeJobs[0].status === 'arrived' ? '#10B981' : activeJobs[0].status === 'in_progress' ? '#3B82F6' : '#06B6D4' }]} />
              </View>
              <Text style={[styles.activeServiceTitle, { color: activeJobs[0].status === 'arrived' ? '#10B981' : activeJobs[0].status === 'in_progress' ? '#3B82F6' : '#06B6D4' }]}>
                {activeJobs[0].status === 'arrived' ? 'ARRIVED - PENDING BILL' : activeJobs[0].status === 'in_progress' ? 'EN ROUTE TO CUSTOMER' : 'STANDBY FOR DISPATCH'}
              </Text>
            </View>
            <View style={styles.activeServiceBody}>
              <View>
                <Text style={[styles.activeServiceVehicle, { color: textPrimary }]}>{activeJobs[0].vehicle}</Text>
                <Text style={[styles.activeServiceCustomer, { color: textSecondary }]}>{activeJobs[0].customerName}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={textSecondary} />
            </View>
          </TouchableOpacity>
        )}

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
              <Text style={[styles.statsTitle, { color: darkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.9)' }]}>EARNINGS</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
          </View>

          <View style={styles.statsMain}>
            <View>
              <Text style={styles.statsSubVal}>Rs. {monthlyEarnings.toFixed(0)}</Text>
              <Text style={styles.statsSubLbl}>This Month</Text>
            </View>

            <View style={[styles.statDivider, { backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)' }]} />

            <View>
              <Text style={[styles.statsSubVal, { color: darkMode ? '#10B981' : '#FFFFFF' }]}>+Rs. {dailyEarnings.toFixed(0)}</Text>
              <Text style={styles.statsSubLbl}>Today</Text>
            </View>

            <View style={[styles.statDivider, { backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)' }]} />

            <View>
              <Text style={styles.statsSubVal}>{completedJobsCount}</Text>
              <Text style={styles.statsSubLbl}>Completed Jobs</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Notification-Style Incoming Requests */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            {pendingRequests.length > 0 && (
              <View style={styles.sectionAlertDot} />
            )}
            <Text style={[styles.sectionTitle, { color: textPrimary }]}>
              {pendingRequests.length > 0 ? 'New Booking' : 'New Bookings'}
            </Text>
          </View>
        </View>

        {topRequest ? (
          <View style={[styles.notifContainer, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push({ pathname: '/mechanic/booking-details', params: { id: topRequest.id } })}
              style={styles.notifRow}
            >
              {/* Left: icon + live dot */}
              <View style={styles.notifIconWrap}>
                <View style={[styles.notifIconBg, { backgroundColor: 'rgba(239,68,68,0.12)' }]}>
                  <MaterialCommunityIcons
                    name={topRequest.vehicle.toLowerCase().includes('tesla') || topRequest.vehicle.toLowerCase().includes('etron') ? 'ev-station' : 'car-wrench'}
                    size={18}
                    color="#EF4444"
                  />
                </View>
                <View style={styles.notifLiveDot} />
              </View>

              {/* Center: notification body */}
              <View style={styles.notifBody}>
                <View style={styles.notifTitleRow}>
                  <Text style={[styles.notifTitle, { color: textPrimary }]} numberOfLines={1}>
                    {topRequest.serviceType}
                  </Text>
                  <Text style={[styles.notifTime, { color: textSecondary }]}>{topRequest.time}</Text>
                </View>
                <Text style={[styles.notifSub, { color: textSecondary }]} numberOfLines={1}>
                  {topRequest.customerName} · {topRequest.vehicle}
                </Text>
                <View style={styles.notifMeta}>
                  <Ionicons name="location-sharp" size={10} color="#EF4444" />
                  <Text style={[styles.notifMetaText, { color: textSecondary }]} numberOfLines={1}>
                    {topRequest.location}
                  </Text>
                  {topRequest.distance ? (
                    <>
                      <Text style={[styles.notifMetaDot, { color: textSecondary }]}>·</Text>
                      <Text style={[styles.notifMetaText, { color: '#F59E0B' }]}>{topRequest.distance}</Text>
                      <Text style={[styles.notifMetaDot, { color: textSecondary }]}>·</Text>
                      <Text style={[styles.notifMetaText, { color: '#06B6D4' }]}>{topRequest.eta}</Text>
                    </>
                  ) : null}
                </View>
                <View style={styles.notifActions}>
                  <TouchableOpacity
                    style={[styles.notifBtnDecline, { borderColor: darkMode ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.2)' }]}
                    onPress={(e) => {
                      e.stopPropagation();
                      Alert.alert('Decline Request', `Reject service call from ${topRequest.customerName}?`, [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Decline', style: 'destructive', onPress: () => rejectBooking(topRequest.id) },
                      ]);
                    }}
                  >
                    <Text style={styles.notifBtnDeclineText}>Decline</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.notifBtnAccept}
                    onPress={(e) => {
                      e.stopPropagation();
                      acceptBooking(topRequest.id);
                    }}
                  >
                    <Text style={styles.notifBtnAcceptText}>Accept</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Right: price */}
              <Text style={[styles.notifPrice, { color: '#10B981' }]}>Rs.{topRequest.price}</Text>
            </TouchableOpacity>
          </View>
        ) : !isOnline ? (
          <View style={[styles.emptyCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <Ionicons name="eye-off-outline" size={40} color={textSecondary} />
            <Text style={[styles.emptyText, { color: textPrimary }]}>You are Offline</Text>
            <Text style={[styles.emptySub, { color: textSecondary }]}>
              Go online to receive new booking requests.
            </Text>
          </View>
        ) : (
          <View style={[styles.emptyCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <Ionicons name="checkmark-done-circle" size={40} color="#10B981" />
            <Text style={[styles.emptyText, { color: textPrimary }]}>No new bookings</Text>
            <Text style={[styles.emptySub, { color: textSecondary }]}>
              You don't have any pending requests right now.
            </Text>
          </View>
        )}

        {/* Today's Schedule Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>
            Active Jobs ({activeJobs.length})
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
            <Text style={[styles.emptyText, { color: textPrimary }]}>No Active Jobs</Text>
            <Text style={[styles.emptySub, { color: textSecondary }]}>
              Accept a booking above to start a job.
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

          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/mechanic/payments' as any)}>
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
  statusToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 6,
  },
  statusToggleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusToggleText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  settingsBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gpsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  gpsBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activeServiceBanner: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  activeServiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activeServiceDotContainer: {
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  activeServiceDotOuter: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  activeServiceDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeServiceTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  activeServiceBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeServiceVehicle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  activeServiceCustomer: {
    fontSize: 13,
    fontWeight: '500',
  },
  pulseContainer: {
    position: 'relative',
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseOuter: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    opacity: 0.6,
  },
  pulseInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  gpsTitle: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  gpsCoords: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  gpsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  gpsBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#06B6D4',
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
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionAlertDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
    marginRight: 7,
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
  // Pending Request Cards
  requestCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  reqTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 5,
  },
  priorityDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  priorityText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  reqPrice: {
    fontSize: 17,
    fontWeight: '900',
  },
  reqVehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  reqVehicle: {
    fontSize: 14,
    fontWeight: '800',
  },
  reqService: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  reqTelemetry: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 10,
    gap: 6,
  },
  reqTelemetryCell: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  reqTelemetryText: {
    fontSize: 9,
    fontWeight: '700',
    flex: 1,
  },
  reqTelemetrySep: {
    width: 1,
    height: 14,
  },
  reqTelemetrySmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  reqTelemetrySmallText: {
    fontSize: 9,
    fontWeight: '800',
  },
  reqMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reqMetaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  reqMetaText: {
    fontSize: 11,
    fontWeight: '600',
  },
  reqActions: {
    flexDirection: 'row',
    gap: 10,
  },
  reqBtn: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  reqBtnDecline: {
    borderWidth: 1,
  },
  reqBtnDeclineText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },
  reqBtnAccept: {
    backgroundColor: '#7DA0A9',
    shadowColor: '#7DA0A9',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 2,
  },
  reqBtnAcceptText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  // Notification-style request list
  notifContainer: {
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  notifDivider: {
    height: 1,
    marginHorizontal: 14,
  },
  notifIconWrap: {
    position: 'relative',
    width: 40,
    alignItems: 'center',
  },
  notifIconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifLiveDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  notifBody: {
    flex: 1,
  },
  notifTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '800',
    flex: 1,
    marginRight: 8,
  },
  notifTime: {
    fontSize: 10,
    fontWeight: '500',
  },
  notifSub: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 4,
  },
  notifMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
    gap: 3,
    marginBottom: 8,
  },
  notifMetaText: {
    fontSize: 10,
    fontWeight: '600',
    flexShrink: 1,
  },
  notifMetaDot: {
    fontSize: 10,
    fontWeight: '400',
  },
  notifActions: {
    flexDirection: 'row',
    gap: 8,
  },
  notifBtnDecline: {
    height: 28,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifBtnDeclineText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '700',
  },
  notifBtnAccept: {
    height: 28,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#7DA0A9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifBtnAcceptText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  notifPrice: {
    fontSize: 13,
    fontWeight: '900',
    marginTop: 2,
  },
  notifQueueFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderTopWidth: 1,
  },
  notifQueueText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '500',
  },
  notifQueueLink: {
    fontSize: 11,
    fontWeight: '800',
  },
});
