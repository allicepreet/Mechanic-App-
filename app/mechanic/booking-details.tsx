import CustomerCard from '@/components/CustomerCard';
import Header from '@/components/Header';
import { Booking, useMechanic } from '@/components/MechanicContext';
import StatusButton from '@/components/StatusButton';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

  const vehicleIsEV = booking.vehicle.toLowerCase().includes('tesla') || booking.vehicle.toLowerCase().includes('etron');

  return (
    <View style={[styles.container, { backgroundColor: activeBg }]}>
      <Header title="Booking Details" showBack darkMode={darkMode} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={[styles.telemetryCenter, { backgroundColor: cardBg, borderColor: cardBorder }]}>

          <View style={styles.tcHeader}>
            <View style={styles.tcHeaderLeft}>
              <View style={styles.tcPulseDot}>
                <View style={[styles.tcPulseInner, { backgroundColor: booking.status === 'in_progress' ? '#3B82F6' : booking.status === 'accepted' ? '#06B6D4' : '#F59E0B' }]} />
              </View>
              <Text style={[styles.tcHeaderLabel, { color: darkMode ? '#94A3B8' : '#64748B' }]}>
                {booking.status === 'in_progress' ? 'RADAR DISPATCH ACTIVE' : booking.status === 'accepted' ? 'DISPATCH STANDING BY' : booking.status === 'pending' ? 'AWAITING DISPATCH' : 'SERVICE CLOSED'}
              </Text>
            </View>
            <View style={[styles.tcTicketTag, { backgroundColor: darkMode ? 'rgba(125,160,169,0.1)' : 'rgba(125,160,169,0.12)' }]}>
              <Text style={styles.tcTicketTagText}>#{booking.id}</Text>
            </View>
          </View>


          <View style={[styles.tcRoute, { backgroundColor: darkMode ? '#0F172A' : '#F1F5F9', borderColor: cardBorder }]}>
            <View style={styles.tcRouteNode}>
              <View style={[styles.tcNodeDot, { backgroundColor: '#7DA0A9' }]}>
                <Ionicons name="business" size={9} color="#FFFFFF" />
              </View>
              <Text style={[styles.tcNodeLabel, { color: textSecondary }]}>Dispatch Hub</Text>
            </View>

            <View style={styles.tcRouteLine}>
              <View style={[styles.tcRouteLineDash, { borderColor: booking.status === 'in_progress' ? '#3B82F6' : '#94A3B8', opacity: 0.5 }]} />
              <View style={[styles.tcRouteVehicle, { backgroundColor: cardBg, borderColor: booking.status === 'in_progress' ? '#3B82F6' : '#7DA0A9' }]}>
                <MaterialCommunityIcons name="truck-delivery" size={11} color={booking.status === 'in_progress' ? '#3B82F6' : '#7DA0A9'} />
              </View>
            </View>

            <View style={styles.tcRouteNode}>
              <View style={[styles.tcNodeDot, { backgroundColor: '#EF4444' }]}>
                <Ionicons name="location-sharp" size={9} color="#FFFFFF" />
              </View>
              <Text style={[styles.tcNodeLabel, { color: textPrimary }]} numberOfLines={2}>{booking.location}</Text>
            </View>
          </View>


          <View style={styles.tcGrid}>
            <View style={[styles.tcCell, { borderRightWidth: 1, borderRightColor: cardBorder }]}>
              <Text style={styles.tcCellLabel}>OBD-II SYSTEM</Text>
              <Text style={[styles.tcCellValue, { color: booking.status === 'completed' ? '#10B981' : '#EF4444' }]}>
                {booking.status === 'completed' ? 'COMPLIANT' : 'FAULT_DTC'}
              </Text>
            </View>
            <View style={[styles.tcCell, { borderRightWidth: 1, borderRightColor: cardBorder }]}>
              <Text style={styles.tcCellLabel}>ETA RANGE</Text>
              <Text style={[styles.tcCellValue, { color: '#06B6D4' }]}>{booking.eta || 'N/A'}</Text>
            </View>
            <View style={[styles.tcCell, { borderRightWidth: 1, borderRightColor: cardBorder }]}>
              <Text style={styles.tcCellLabel}>DISTANCE</Text>
              <Text style={[styles.tcCellValue, { color: '#F59E0B' }]}>{booking.distance || 'N/A'}</Text>
            </View>
            <View style={styles.tcCell}>
              <Text style={styles.tcCellLabel}>REVENUE</Text>
              <Text style={[styles.tcCellValue, { color: '#10B981' }]}>Rs.{booking.price}</Text>
            </View>
          </View>

          {/* Navigation CTA */}
          {(booking.status === 'accepted' || booking.status === 'in_progress') && (
            <TouchableOpacity
              style={[styles.tcNavBtn, { backgroundColor: booking.status === 'in_progress' ? '#3B82F6' : '#7DA0A9' }]}
              activeOpacity={0.85}
              onPress={() => {
                if (booking.status === 'accepted') {
                  updateBookingStatus(booking.id, 'in_progress');
                }
                router.push({
                  pathname: '/mechanic/navigation',
                  params: {
                    id: booking.id,
                    location: booking.location,
                    latitude: booking.latitude || 12.9716,
                    longitude: booking.longitude || 77.5946,
                  },
                });
              }}
            >
              <Ionicons name="navigate-circle" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.tcNavBtnText}>
                {booking.status === 'in_progress' ? 'CONTINUE LIVE NAVIGATION' : 'START DISPATCH NAVIGATION'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* The in_progress telemetry HUD is now embedded in the control center above — skip old block */}

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
  telemetryCenter: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  tcHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tcHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tcPulseDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  tcPulseInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tcHeaderLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  tcTicketTag: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tcTicketTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7DA0A9',
  },
  tcRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    marginBottom: 12,
    gap: 6,
  },
  tcRouteNode: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tcNodeDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tcNodeLabel: {
    fontSize: 10,
    fontWeight: '700',
    flex: 1,
  },
  tcRouteLine: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  tcRouteLineDash: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 0,
    borderTopWidth: 1,
    borderStyle: 'dashed',
  },
  tcRouteVehicle: {
    padding: 3,
    borderRadius: 8,
    borderWidth: 1,
    zIndex: 2,
  },
  tcGrid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.1)',
    paddingTop: 12,
    marginBottom: 12,
  },
  tcCell: {
    flex: 1,
    alignItems: 'center',
  },
  tcCellLabel: {
    fontSize: 7,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.4,
    marginBottom: 3,
    textAlign: 'center',
  },
  tcCellValue: {
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  tcNavBtn: {
    height: 42,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  tcNavBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
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
