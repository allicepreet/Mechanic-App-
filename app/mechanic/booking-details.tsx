import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useMechanic, Booking } from '@/components/MechanicContext';
import Header from '@/components/Header';
import CustomerCard from '@/components/CustomerCard';
import StatusButton from '@/components/StatusButton';
import SwipeButton from '@/components/SwipeButton';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const VEHICLE_IMAGES: Record<string, any> = {
  B001: require('@/assets/images/tesla.png'),
  B004: require('@/assets/images/audi.png'),
  B002: require('@/assets/images/porsche.png'),
  B005: require('@/assets/images/mustang.png'),
};

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

  // Stepper state resolver
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

  // Stepper node labels
  const steps = [
    { label: 'Requested', icon: 'file-text-outline' },
    { label: 'Confirmed', icon: 'checkmark-circle-outline' },
    { label: 'In Shop', icon: 'build-outline' },
    { label: 'Completed', icon: 'trophy-outline' },
  ];

  const handleUpdateStatus = () => {
    if (booking.status === 'accepted') {
      updateBookingStatus(booking.id, 'in_progress');
    } else if (booking.status === 'in_progress') {
      updateBookingStatus(booking.id, 'completed');
    }
  };

  const vehicleImg = VEHICLE_IMAGES[booking.id] || require('@/assets/images/banner.png');

  return (
    <View style={[styles.container, { backgroundColor: activeBg }]}>
      <Header title="Booking Details" showBack darkMode={darkMode} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Premium Hero Vehicle Image Banner */}
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

        {/* Horizontal Progress Stepper */}
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
          darkMode={darkMode}
        />

        {/* Vehicle Information Panel */}
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

        {/* Action Description */}
        <Text style={[styles.sectionTitle, { color: textPrimary }]}>Notes</Text>
        <View style={[styles.notesCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <Ionicons name="chatbox-ellipses-outline" size={18} color="#F59E0B" style={styles.notesIcon} />
          <View style={styles.notesTextSec}>
            <Text style={[styles.notesHeading, { color: textPrimary }]}>{booking.serviceType}</Text>
            <Text style={[styles.notesBody, { color: textSecondary }]}>"{booking.notes}"</Text>
          </View>
        </View>

        {/* Workflow State Modifiers */}
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
});
