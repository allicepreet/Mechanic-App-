import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Booking } from './MechanicContext';
import SwipeButton from './SwipeButton';

const VEHICLE_IMAGES: Record<string, any> = {
  B001: require('@/assets/images/tesla.png'),
  B004: require('@/assets/images/audi.png'),
  B002: require('@/assets/images/porsche.png'),
  B005: require('@/assets/images/mustang.png'),
};

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

  const vehicleImg = VEHICLE_IMAGES[booking.id] || require('@/assets/images/banner.png');

  const cardContent = (
    <>
      {/* Premium Car Image Banner */}
      <Image
        source={vehicleImg}
        style={styles.cardImage}
        resizeMode="cover"
      />

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
        <View style={[styles.footerPrompt, { borderTopColor: cardBorder }]}>
          <Text style={[styles.footerText, { color: textSecondary }]}>
            {booking.status === 'accepted' ? 'Ready to begin diagnostic checks' : 'Active mechanic operations ongoing'}
          </Text>
          <Ionicons name="arrow-forward" size={14} color={statusStyle.text} />
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
  footerPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
