import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { router } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Booking, getVehicleImage, useMechanic } from './MechanicContext';
import SwipeButton from './SwipeButton';

interface BookingCardProps {
  booking: Booking;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  darkMode?: boolean;
}

export default function BookingCard({
  booking,
  onAccept,
  onReject,
  darkMode = true,
}: BookingCardProps) {
  const { updateBookingStatus } = useMechanic();
  const cardBg = darkMode ? '#1E2022' : '#FFFFFF';
  const textPrimary = darkMode ? '#ECEDEE' : '#0F172A';
  const textSecondary = darkMode ? '#9BA1A6' : '#64748B';
  const cardBorder = darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)';

  // Determine status color codes
  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', icon: 'alert-decagram' };
      case 'accepted':
        return { bg: 'rgba(6, 182, 212, 0.15)', text: '#06B6D4', icon: 'check-decagram' };
      case 'in_progress':
        return { bg: 'rgba(59, 130, 246, 0.15)', text: '#3B82F6', icon: 'wrench-clock' };
      case 'completed':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', icon: 'checkbox-marked-circle' };
      case 'rejected':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', icon: 'close-circle' };
    }
  };

  const statusStyle = getStatusColor(booking.status);

  const handleCardPress = () => {
    // Navigate to details screen, passing the booking ID
    router.push({
      pathname: '/mechanic/booking-details',
      params: { id: booking.id },
    });
  };

  const vehicleImg = getVehicleImage(booking.vehicle);

  const cardContent = (
    <>
      {/* Sleek Digital Service Ticket HUD Banner */}
      <View style={[styles.telemetryHUD, { backgroundColor: darkMode ? '#0F172A' : '#F8FAFC', borderColor: cardBorder }]}>
        <View style={styles.hudTopRow}>
          <View style={styles.hudPulseRow}>
            <View style={styles.pulseContainer}>
              <View style={[styles.pulseOuter, { backgroundColor: booking.status === 'in_progress' ? 'rgba(59, 130, 246, 0.2)' : booking.status === 'accepted' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(245, 158, 11, 0.2)' }]}>
                <View style={[styles.pulseInner, { backgroundColor: booking.status === 'in_progress' ? '#3B82F6' : booking.status === 'accepted' ? '#06B6D4' : '#F59E0B' }]} />
              </View>
            </View>
            <Text style={[styles.hudLabel, { color: textSecondary }]}>
              {booking.status === 'in_progress' ? 'DISPATCH RADAR ACTIVE' : booking.status === 'accepted' ? 'DISPATCH READY' : 'OBD-II INACTIVE'}
            </Text>
          </View>
          <View style={[styles.ticketBadge, { backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.03)' }]}>
            <Text style={[styles.ticketBadgeText, { color: textSecondary }]}>TICKET {booking.id}</Text>
          </View>
        </View>

        <View style={styles.hudGrid}>
          <View style={[styles.hudCell, { borderRightWidth: 1, borderRightColor: cardBorder }]}>
            <Text style={styles.hudCellLabel}>OBD METRIC</Text>
            <Text style={[styles.hudCellValue, { color: booking.status === 'completed' ? '#10B981' : '#EF4444' }]}>
              {booking.status === 'completed' ? 'SYS_PASS' : 'FAULT_DTC_1'}
            </Text>
          </View>
          <View style={[styles.hudCell, { borderRightWidth: 1, borderRightColor: cardBorder }]}>
            <Text style={styles.hudCellLabel}>EST TIME</Text>
            <Text style={[styles.hudCellValue, { color: '#06B6D4' }]}>
              {booking.vehicle.includes('Tesla') ? '2.5 Hrs' : '3.0 Hrs'}
            </Text>
          </View>
          <View style={styles.hudCell}>
            <Text style={styles.hudCellLabel}>COORDINATES</Text>
            <Text style={[styles.hudCellValue, { color: textPrimary, fontSize: 8 }]} numberOfLines={1}>
              30.267° N, 97.743° W
            </Text>
          </View>
        </View>
      </View>

      {/* Header section with vehicle and status tag */}
      <View style={styles.cardHeader}>
        <View style={styles.vehicleContainer}>
          <MaterialCommunityIcons
            name={booking.vehicle.toLowerCase().includes('tesla') || booking.vehicle.toLowerCase().includes('etron') ? 'ev-station' : 'car-sports'}
            size={22}
            color={darkMode ? '#F59E0B' : '#E28743'}
          />
          <Text style={[styles.vehicleText, { color: textPrimary }]}>{booking.vehicle}</Text>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <MaterialCommunityIcons name={statusStyle.icon as any} size={13} color={statusStyle.text} style={styles.badgeIcon} />
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {booking.status.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Service type description */}
      <Text style={[styles.serviceText, { color: textPrimary }]}>{booking.serviceType}</Text>

      {/* Customer summary */}
      <View style={styles.customerRow}>
        <Ionicons name="person-outline" size={14} color={textSecondary} />
        <Text style={[styles.customerName, { color: textSecondary }]}>{booking.customerName}</Text>
      </View>

      {/* Breakdown location summary */}
      <View style={styles.locationSummaryRow}>
        <Ionicons name="location-outline" size={14} color="#EF4444" style={{ marginRight: 6 }} />
        <Text style={[styles.locationSummaryText, { color: textSecondary }]} numberOfLines={1}>
          Stranded: {booking.location} {booking.distance ? `(${booking.distance} away)` : ''}
        </Text>
      </View>

      {/* Date, Time, and Price summary line */}
      <View style={styles.metaRow}>
        <View style={styles.chipsContainer}>
          <View style={[styles.chip, { backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9' }]}>
            <Ionicons name="calendar-outline" size={12} color={textSecondary} />
            <Text style={[styles.chipText, { color: textSecondary }]}>{booking.date}</Text>
          </View>
          <View style={[styles.chip, { backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9' }]}>
            <Ionicons name="time-outline" size={12} color={textSecondary} />
            <Text style={[styles.chipText, { color: textSecondary }]}>{booking.time}</Text>
          </View>
        </View>

        <Text style={[styles.priceText, { color: darkMode ? '#10B981' : '#059669' }]}>
          Rs. {booking.price.toFixed(0)}
        </Text>
      </View>
    </>
  );

  if (booking.status === 'pending' && (onAccept || onReject)) {
    const primaryAccent = '#7DA0A9';
    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: cardBg,
            borderColor: cardBorder,
          },
        ]}
      >
        <TouchableOpacity activeOpacity={0.85} onPress={handleCardPress}>
          {cardContent}
        </TouchableOpacity>

        {/* Quick Interactive Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              styles.declineBtn,
              { borderColor: darkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.15)' }
            ]}
            onPress={(e) => {
              e.stopPropagation();
              onReject?.(booking.id);
            }}
          >
            <Ionicons name="close-circle-outline" size={15} color="#EF4444" style={{ marginRight: 6 }} />
            <Text style={styles.declineBtnText}>Decline</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionBtn,
              styles.acceptBtn,
              { backgroundColor: primaryAccent }
            ]}
            onPress={(e) => {
              e.stopPropagation();
              onAccept?.(booking.id);
            }}
          >
            <Ionicons name="checkmark-circle-outline" size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.acceptBtnText}>Accept</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handleCardPress}
      style={[
        styles.card,
        {
          backgroundColor: cardBg,
          borderColor: cardBorder,
        },
      ]}
    >
      {cardContent}

      {/* Informative footer for active/in-progress items */}
      {(booking.status === 'accepted' || booking.status === 'in_progress') && (
        <View style={[styles.activeActionsBlock, { borderTopColor: cardBorder }]}>
          <View style={styles.activeDetailsRow}>
            <Ionicons name="location-sharp" size={15} color="#EF4444" style={{ marginRight: 6 }} />
            <Text style={[styles.activeDetailsText, { color: textSecondary }]} numberOfLines={1}>
              {booking.location}
            </Text>
          </View>
          {booking.distance && (
            <Text style={[styles.routeSubText, { color: textSecondary }]}>
              Rider Distance: <Text style={{ color: textPrimary, fontWeight: '700' }}>{booking.distance}</Text> • ETA: <Text style={{ color: '#06B6D4', fontWeight: '700' }}>{booking.eta}</Text>
            </Text>
          )}

          <TouchableOpacity
            style={[styles.gpsNavigateBtn, { backgroundColor: booking.status === 'accepted' ? '#06B6D4' : '#3B82F6' }]}
            onPress={(e) => {
              e.stopPropagation(); // prevent card click navigation
              Alert.alert(
                'Simulated GPS Routing Active',
                `Departing mobile dispatch hub!\n\nRouting turn-by-turn directions to client's stranded vehicle:\n\nLocation: ${booking.location}\n\nDistance: ${booking.distance || '3.5 km'} | ETA: ${booking.eta || '10 mins'}\n\nDominic T. is en route in the mobile tuning van!`,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      if (booking.status === 'accepted') {
                        updateBookingStatus(booking.id, 'in_progress');
                      }
                      router.push({
                        pathname: '/mechanic/booking-details',
                        params: { id: booking.id },
                      });
                    },
                    style: 'default',
                  },
                ]
              );
            }}
          >
            <Ionicons name="navigate-circle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.gpsNavigateBtnText}>
              {booking.status === 'accepted' ? 'Start Dispatch Navigation' : 'Continue Trip Navigation'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 130,
    borderRadius: 12,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  vehicleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  vehicleText: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  badgeIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  serviceText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerName: {
    fontSize: 13,
    marginLeft: 6,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chipsContainer: {
    flexDirection: 'row',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '800',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    gap: 12,
    width: '100%',
  },
  actionBtn: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineBtn: {
    borderWidth: 1,
  },
  acceptBtn: {
    shadowColor: '#7DA0A9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  declineBtnText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },
  acceptBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  locationSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 10,
  },
  locationSummaryText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  activeActionsBlock: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  activeDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeDetailsText: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  routeSubText: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: -2,
  },
  gpsNavigateBtn: {
    height: 38,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  gpsNavigateBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  telemetryHUD: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    height: 76,
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  hudTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hudPulseRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseContainer: {
    width: 10,
    height: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  pulseOuter: {
    width: 8,
    height: 8,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseInner: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  hudLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  ticketBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ticketBadgeText: {
    fontSize: 8,
    fontWeight: '900',
  },
  hudGrid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 8,
  },
  hudCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hudCellLabel: {
    fontSize: 7,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  hudCellValue: {
    fontSize: 10,
    fontWeight: '800',
  },
});
