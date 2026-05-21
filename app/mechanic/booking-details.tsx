import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useMechanic, Booking, getVehicleImage } from '@/components/MechanicContext';
import Header from '@/components/Header';
import CustomerCard from '@/components/CustomerCard';
import StatusButton from '@/components/StatusButton';
import SwipeButton from '@/components/SwipeButton';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function BookingDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { bookings, darkMode, updateBookingStatus, acceptBooking, rejectBooking } = useMechanic();

  const booking = bookings.find((b) => b.id === id);

  const activeBg = darkMode ? '#151718' : '#F8FAFC';
  const cardBg = darkMode ? '#1E2022' : '#FFFFFF';
  const textPrimary = darkMode ? '#ECEDEE' : '#0F172A';
  const textSecondary = darkMode ? '#9BA1A6' : '#64748B';
  const cardBorder = darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)';

  if (!booking) {
    return (
      <View style={[styles.container, { backgroundColor: activeBg }]}>
        <Header title="Booking Not Found" showBack />
        <View style={styles.errorContent}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={[styles.errorTitle, { color: textPrimary }]}>Booking Not Found</Text>
          <Text style={[styles.errorMsg, { color: textSecondary }]}>The requested booking ticket could not be located.</Text>
          <TouchableOpacity style={styles.errorBtn} onPress={() => router.back()}>
            <Text style={styles.errorBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }


  const getStepperActiveIndex = (status: Booking['status']) => {
    switch (status) {
      case 'pending': return 0;
      case 'accepted': return 1;
      case 'in_progress': return 2;
      case 'completed': return 3;
      case 'rejected': return -1;
    }
  };

  const activeIndex = getStepperActiveIndex(booking.status);

  
  const steps = [
    { label: 'Requested', icon: 'file-text-outline' },
    { label: 'Accepted', icon: 'checkmark-circle-outline' },
    { label: 'En Route', icon: 'navigate-outline' },
    { label: 'Completed', icon: 'checkmark-done-outline' },
  ];

  const handleUpdateStatus = () => {
    if (booking.status === 'accepted') {
      updateBookingStatus(booking.id, 'in_progress');
    } else if (booking.status === 'in_progress') {
      updateBookingStatus(booking.id, 'completed');
    }
  };

  const vehicleImg = getVehicleImage(booking.vehicle);

  return (
    <View style={[styles.container, { backgroundColor: activeBg }]}>
      <Header title="Booking Details" showBack darkMode={darkMode} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
 
        <View style={[styles.heroImageContainer, { borderColor: cardBorder }]}>
          <Image
            source={vehicleImg}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroPriceBadge}>
            <Text style={styles.heroPriceText}>Rs. {booking.price}</Text>
          </View>
        </View>

        {booking.status === 'in_progress' && (
          <View style={[styles.telemetryHud, { backgroundColor: cardBg, borderColor: '#06B6D4' }]}>
            <View style={styles.hudHeader}>
              <View style={styles.hudPulseRow}>
                <View style={styles.pulseContainer}>
                  <View style={styles.pulseOuter}>
                    <View style={styles.pulseInner} />
                  </View>
                </View>
                <Text style={styles.hudTitle}>GPS DISPATCH SYSTEM ACTIVE</Text>
              </View>
              <View style={styles.hudBadge}>
                <Text style={styles.hudBadgeText}>EN ROUTE</Text>
              </View>
            </View>

            <View style={styles.hudContent}>
              <View style={styles.telemetryStatsGrid}>
                <View style={styles.telemetryStatCell}>
                  <Ionicons name="speedometer-outline" size={14} color="#06B6D4" />
                  <View style={{ marginLeft: 6 }}>
                    <Text style={styles.telemetryStatLabel}>VAN SPEED</Text>
                    <Text style={[styles.telemetryStatValue, { color: textPrimary }]}>42 km/h</Text>
                  </View>
                </View>
                <View style={styles.telemetryStatCell}>
                  <Ionicons name="location-outline" size={14} color="#EF4444" />
                  <View style={{ marginLeft: 6 }}>
                    <Text style={styles.telemetryStatLabel}>LIVE COORDS</Text>
                    <Text style={[styles.telemetryStatValue, { color: textPrimary, fontSize: 10 }]}>30.2672° N, 97.7431° W</Text>
                  </View>
                </View>
              </View>

              <View style={[styles.routeVisualizer, { borderColor: cardBorder }]}>
                <View style={styles.visualizerNodeRow}>
                  <View style={[styles.visualNode, { backgroundColor: '#7DA0A9' }]}>
                    <Ionicons name="business" size={10} color="#FFFFFF" />
                  </View>
                  <Text style={[styles.visualNodeText, { color: textSecondary }]} numberOfLines={1}>Dispatch Hub</Text>
                </View>
                <View style={styles.visualConnectorContainer}>
                  <View style={styles.visualConnectorDashed} />
                  <View style={styles.visualConnectorVehicle}>
                    <MaterialCommunityIcons name="truck-delivery" size={12} color="#06B6D4" />
                  </View>
                </View>
                <View style={styles.visualizerNodeRow}>
                  <View style={[styles.visualNode, { backgroundColor: '#EF4444' }]}>
                    <Ionicons name="location-sharp" size={10} color="#FFFFFF" />
                  </View>
                  <Text style={[styles.visualNodeText, { color: textPrimary }]} numberOfLines={1}>Breakdown Site</Text>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.simulateNavBtn}
                onPress={() => {
                  Alert.alert(
                    'Launching Built-in HUD Maps',
                    'Recalibrating high-precision laser telemetry...\n\nSyncing route coordinates with vehicle head-up display dashboard.\n\nSimulating turn-by-turn auditory guidance: "In 200 meters, turn right on Lamar Blvd."',
                    [{ text: 'Dismiss HUD Overlay', style: 'default' }]
                  );
                }}
              >
                <Ionicons name="navigate-circle-outline" size={15} color="#06B6D4" style={{ marginRight: 6 }} />
                <Text style={styles.simulateNavBtnText}>INSPECT HIGH-ACCURACY GPS TRACKER</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {booking.status !== 'rejected' && (
          <View style={[styles.stepperCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <Text style={[styles.cardTitle, { color: textSecondary }]}>PROGRESS STATUS</Text>
            <View style={styles.stepperContainer}>
              {steps.map((step, idx) => {
                const isPassed = idx <= activeIndex;
                const isCurrent = idx === activeIndex;
                let activeColor = '#F59E0B'; // default warning amber for request
                if (activeIndex === 1) activeColor = '#06B6D4'; // cyan for accepted
                if (activeIndex === 2) activeColor = '#3B82F6'; // blue for in-progress
                if (activeIndex === 3) activeColor = '#10B981'; // emerald for complete

                return (
                  <React.Fragment key={idx}>
                    <View style={styles.stepNode}>
                      <View
                        style={[
                          styles.nodeCircle,
                          {
                            backgroundColor: isCurrent ? activeColor : isPassed ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                            borderColor: isCurrent ? activeColor : isPassed ? '#10B981' : cardBorder,
                          },
                        ]}
                      >
                        <Ionicons
                          name={step.icon as any}
                          size={14}
                          color={isCurrent ? '#FFFFFF' : isPassed ? '#10B981' : textSecondary}
                        />
                      </View>
                      <Text style={[styles.nodeLabel, { color: isCurrent ? activeColor : textSecondary }]}>
                        {step.label}
                      </Text>
                    </View>

                    {idx < steps.length - 1 && (
                      <View
                        style={[
                          styles.nodeConnector,
                          {
                            backgroundColor: idx < activeIndex ? '#10B981' : cardBorder,
                          },
                        ]}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </View>
          </View>
        )}

        {/* Customer Information Panel */}
        <Text style={[styles.sectionTitle, { color: textPrimary }]}>Customer Details</Text>
        <CustomerCard
          name={booking.customerName}
          phone={booking.customerPhone}
          location={booking.location}
          distance={booking.distance}
          eta={booking.eta}
          darkMode={darkMode}
        />

 
        <Text style={[styles.sectionTitle, { color: textPrimary }]}>Vehicle Details</Text>
        <View style={[styles.infoCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="car-cog" size={20} color="#F59E0B" />
            <Text style={[styles.infoText, { color: textPrimary }]}>{booking.vehicle}</Text>
          </View>

          <View style={[styles.detailsGrid, { borderTopColor: cardBorder }]}>
            <View style={styles.gridCell}>
              <Text style={[styles.cellLabel, { color: textSecondary }]}>LICENSE PLATE</Text>
              <Text style={[styles.cellValue, { color: textPrimary }]}>
                {booking.vehicle.includes('Tesla') ? 'EV-789X' : 'M4-COMP'}
              </Text>
            </View>
            <View style={styles.gridCell}>
              <Text style={[styles.cellLabel, { color: textSecondary }]}>ODOMETER</Text>
              <Text style={[styles.cellValue, { color: textPrimary }]}>
                {booking.vehicle.includes('Tesla') ? '12,450 mi' : '28,110 mi'}
              </Text>
            </View>
          </View>

          <View style={[styles.detailsGrid, { borderTopColor: cardBorder }]}>
            <View style={styles.gridCell}>
              <Text style={[styles.cellLabel, { color: textSecondary }]}>ESTIMATED REVENUE</Text>
              <Text style={[styles.cellValue, { color: '#10B981' }]}>Rs. {booking.price.toFixed(0)}</Text>
            </View>
            <View style={styles.gridCell}>
              <Text style={[styles.cellLabel, { color: textSecondary }]}>ESTIMATED TIME</Text>
              <Text style={[styles.cellValue, { color: textPrimary }]}>
                {booking.vehicle.includes('Tesla') ? '2.5 Hours' : '3.0 Hours'}
              </Text>
            </View>
          </View>
        </View>

      
        <Text style={[styles.sectionTitle, { color: textPrimary }]}>Notes</Text>
        <View style={[styles.notesCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <Ionicons name="chatbox-ellipses-outline" size={18} color="#F59E0B" style={styles.notesIcon} />
          <View style={styles.notesTextSec}>
            <Text style={[styles.notesHeading, { color: textPrimary }]}>{booking.serviceType}</Text>
            <Text style={[styles.notesBody, { color: textSecondary }]}>{`"${booking.notes}"`}</Text>
          </View>
        </View>

  
        <View style={styles.actionBlock}>
          {booking.status === 'pending' ? (
            <View style={styles.carouselButtons}>
              <TouchableOpacity
                style={[
                  styles.carouselBtn,
                  styles.declineBtn,
                  { borderColor: darkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.15)' }
                ]}
                onPress={() => {
                  rejectBooking(booking.id);
                  router.back();
                }}
              >
                <Ionicons name="close-circle-outline" size={16} color="#EF4444" style={{ marginRight: 6 }} />
                <Text style={styles.declineBtnText}>Decline</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.carouselBtn,
                  styles.acceptBtn,
                  { backgroundColor: '#7DA0A9' }
                ]}
                onPress={() => {
                  acceptBooking(booking.id);
                }}
              >
                <Ionicons name="checkmark-circle-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.acceptBtnText}>Accept</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <StatusButton status={booking.status} onPress={handleUpdateStatus} />
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroImageContainer: {
    width: '100%',
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 16,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPriceBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  heroPriceText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMsg: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  errorBtn: {
    backgroundColor: '#F59E0B',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  errorBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginBottom: 10,
    marginTop: 18,
  },
  stepperCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  stepNode: {
    alignItems: 'center',
    flex: 1,
  },
  nodeCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nodeLabel: {
    fontSize: 9,
    fontWeight: '700',
    marginTop: 6,
    textAlign: 'center',
  },
  nodeConnector: {
    height: 2,
    flex: 0.8,
    marginTop: -16, // align perfectly with nodes
  },
  infoCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  infoText: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },
  detailsGrid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 12,
    marginBottom: 12,
  },
  gridCell: {
    flex: 1,
  },
  cellLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  cellValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  notesCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 24,
  },
  notesIcon: {
    marginTop: 2,
  },
  notesTextSec: {
    flex: 1,
    marginLeft: 12,
  },
  notesHeading: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  notesBody: {
    fontSize: 13,
    fontWeight: '500',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  actionBlock: {
    width: '100%',
    marginTop: 8,
  },
  carouselButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    width: '100%',
  },
  carouselBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineBtn: {
    borderWidth: 1,
  },
  declineBtnText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
  },
  acceptBtn: {
    shadowColor: '#7DA0A9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  acceptBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  telemetryHud: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  hudHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  hudPulseRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseContainer: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(6, 182, 212, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  pulseOuter: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(6, 182, 212, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#06B6D4',
  },
  hudTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#06B6D4',
    letterSpacing: 1,
  },
  hudBadge: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  hudBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#06B6D4',
  },
  hudContent: {
    gap: 12,
  },
  telemetryStatsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  telemetryStatCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  telemetryStatLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: '#64748B',
  },
  telemetryStatValue: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 1,
  },
  routeVisualizer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
  },
  visualizerNodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  visualNode: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  visualNodeText: {
    fontSize: 9,
    fontWeight: '700',
    flex: 1,
  },
  visualConnectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    width: 60,
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  visualConnectorDashed: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#06B6D4',
    opacity: 0.4,
  },
  visualConnectorVehicle: {
    backgroundColor: '#1E2022',
    padding: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#06B6D4',
    zIndex: 2,
  },
  simulateNavBtn: {
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    backgroundColor: 'rgba(6, 182, 212, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 4,
  },
  simulateNavBtnText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#06B6D4',
    letterSpacing: 0.8,
  },
});
