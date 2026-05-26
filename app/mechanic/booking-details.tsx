import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput
} from 'react-native';

import CustomerCard from '@/components/CustomerCard';
import Header from '@/components/Header';
import { Booking, useMechanic } from '@/components/MechanicContext';
import StatusButton from '@/components/StatusButton';
import { Platform } from 'react-native';

export default function BookingDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { bookings, darkMode, acceptBooking, rejectBooking, updateBookingStatus, generateBill } = useMechanic();
  const [isAccepting, setIsAccepting] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [serviceFee, setServiceFee] = useState('120');
  const [partsCost, setPartsCost] = useState('0');
  const [extraCharges, setExtraCharges] = useState('0');
  
  const billTotal = (parseFloat(serviceFee || '0') + parseFloat(partsCost || '0') + parseFloat(extraCharges || '0')).toFixed(2);

  const booking = bookings.find((b: Booking) => b.id === id);

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
          <Text style={[styles.errorMsg, { color: textSecondary }]}>
            The requested booking ticket could not be located.
          </Text>
          <TouchableOpacity style={styles.errorBtn} onPress={() => router.back()}>
            <Text style={styles.errorBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleAcceptBooking = async () => {
    setIsAccepting(true);
    try {
      const result = await acceptBooking(booking.id);
      if (result && result.success) {
        Platform.OS === 'web' ? window.alert('Success: Dispatch terminal has been accepted.') : Alert.alert('Success', 'Dispatch terminal has been accepted.');
      } else if (result && result.isOffline) {
        Platform.OS === 'web' ? window.alert('Simulated Mode: Device terminal handling offline demonstration fallback.') : Alert.alert('Simulated Mode', 'Device terminal handling offline demonstration fallback.');
      } else {
        Platform.OS === 'web' ? window.alert(`Error: ${result?.error || 'Failed to accept terminal dispatch request.'}`) : Alert.alert('Error', result?.error || 'Failed to accept terminal dispatch request.');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to accept terminal dispatch request.';
      Platform.OS === 'web' ? window.alert(`Network Error: ${errorMsg}`) : Alert.alert('Network Error', errorMsg);
    } finally {
      setIsAccepting(false);
    }
  };

  const getStepperActiveIndex = (status: Booking['status']): number => {
    switch (status) {
      case 'pending': return 0;
      case 'accepted': return 1;
      case 'in_progress': return 2;
      case 'arrived': return 3;
      case 'completed': return 4;
      default: return -1;
    }
  };

  const activeIndex = getStepperActiveIndex(booking.status);

  const steps = [
    { label: 'Requested', icon: 'file-tray-outline' },
    { label: 'Accepted', icon: 'checkmark-circle-outline' },
    { label: 'En Route', icon: 'navigate-outline' },
    { label: 'Arrived', icon: 'location-outline' },
    { label: 'Completed', icon: 'checkmark-done-outline' },
  ];

  const handleUpdateStatus = async () => {
    if (booking.status === 'accepted') {
      try {
        await updateBookingStatus(booking.id, 'in_progress');
        Platform.OS === 'web' ? window.alert('Status Updated: You are now en route to the breakdown site.') : Alert.alert('Status Updated', 'You are now en route to the breakdown site.');
      } catch (error) {
        Platform.OS === 'web' ? window.alert('Error: Failed to update booking status.') : Alert.alert('Error', 'Failed to update booking status.');
      }
    } else if (booking.status === 'in_progress') {
      
      router.push({ pathname: '/mechanic/navigation', params: { id: booking.id } });
    } else if (booking.status === 'arrived') {
  
      setShowBillModal(true);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: activeBg }]}>
      <Header title="Booking Details" showBack darkMode={darkMode} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

       
        <View style={[styles.telemetryCenter, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={styles.tcHeader}>
            <View style={styles.tcHeaderLeft}>
              <View style={styles.tcPulseDot}>
                <View
                  style={[
                    styles.tcPulseInner,
                    {
                      backgroundColor: booking.status === 'in_progress'
                        ? '#3B82F6'
                        : (booking.status === 'arrived' || booking.status === 'completed')
                          ? '#10B981'
                          : booking.status === 'accepted'
                            ? '#06B6D4'
                            : '#F59E0B'
                    }
                  ]}
                />
              </View>
              <Text style={[styles.tcHeaderLabel, { color: darkMode ? '#94A3B8' : '#64748B' }]}>
                {booking.status === 'completed'
                  ? 'SERVICE COMPLETED'
                  : booking.status === 'in_progress'
                    ? 'RADAR DISPATCH ACTIVE'
                    : booking.status === 'arrived'
                      ? 'ARRIVED AT DESTINATION'
                      : booking.status === 'accepted'
                        ? 'DISPATCH STANDING BY'
                        : 'AWAITING DISPATCH'}
              </Text>
            </View>
            <View style={styles.tcTicketTag}>
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
              <View style={[styles.tcRouteLineDash, { borderColor: booking.status === 'in_progress' ? '#3B82F6' : '#94A3B8' }]} />
              <View style={[styles.tcRouteVehicle, { backgroundColor: cardBg, borderColor: booking.status === 'in_progress' ? '#3B82F6' : '#7DA0A9' }]}>
                <MaterialCommunityIcons name="truck-delivery" size={11} color={booking.status === 'in_progress' ? '#3B82F6' : '#7DA0A9'} />
              </View>
            </View>
            <View style={styles.tcRouteNode}>
              <View style={[styles.tcNodeDot, { backgroundColor: '#EF4444' }]}>
                <Ionicons name="location-sharp" size={9} color="#FFFFFF" />
              </View>
              <Text style={[styles.tcNodeLabel, { color: textPrimary }]} numberOfLines={1}>{booking.location}</Text>
            </View>
          </View>

          {(booking.status === 'accepted' || booking.status === 'in_progress') && (
            <TouchableOpacity
              style={[styles.tcNavBtn, { backgroundColor: booking.status === 'in_progress' ? '#3B82F6' : '#7DA0A9' }]}
              onPress={() => router.push({ pathname: '/mechanic/navigation', params: { id: booking.id } })}
            >
              <Text style={styles.tcNavBtnText}>
                {booking.status === 'in_progress' ? 'CONTINUE NAVIGATION' : 'START NAVIGATION'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Stepper Status Progress Card */}
        <View style={[styles.stepperCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <Text style={[styles.cardTitle, { color: textSecondary }]}>PROGRESS STATUS</Text>
          <View style={styles.stepperContainer}>
            {steps.map((step, idx) => {
              const isPassed = idx <= activeIndex;
              const isCurrent = idx === activeIndex;
              let activeColor = '#F59E0B';
              if (activeIndex === 1) activeColor = '#06B6D4';
              else if (activeIndex === 2) activeColor = '#3B82F6';
              else if (activeIndex === 3) activeColor = '#10B981';
              else if (activeIndex === 4) activeColor = '#10B981';

              return (
                <React.Fragment key={idx}>
                  <View style={styles.stepNode}>
                    <View
                      style={[
                        styles.nodeCircle,
                        {
                          backgroundColor: isCurrent
                            ? activeColor
                            : isPassed
                              ? 'rgba(16, 185, 129, 0.15)'
                              : 'transparent',
                          borderColor: isCurrent ? activeColor : isPassed ? '#10B981' : cardBorder
                        }
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
                        { backgroundColor: idx < activeIndex ? '#10B981' : cardBorder }
                      ]}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </View>
        </View>

        {/* Customer Details Sheet */}
        <Text style={[styles.sectionTitle, { color: textPrimary }]}>Customer Details</Text>
        <CustomerCard
          name={booking.customerName}
          phone={booking.customerPhone}
          location={booking.location}
          distance={booking.distance}
          eta={booking.eta}
          darkMode={darkMode}
          bookingId={booking.id}
        />

        {/* Invoice / Bill Section (Visible only when completed) */}
        {booking.status === 'completed' && (
          <View style={[styles.billCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <View style={styles.billHeader}>
              <Ionicons name="receipt-outline" size={20} color="#10B981" />
              <Text style={[styles.billTitle, { color: textPrimary }]}>Bill Summary</Text>
            </View>
            <View style={styles.billDivider} />
            <View style={styles.billRow}>
              <Text style={[styles.billLabel, { color: textSecondary }]}>Service Fee</Text>
              <Text style={[styles.billValue, { color: textPrimary }]}>Rs. {booking.price?.toFixed(2) || '0.00'}</Text>
            </View>
            <View style={styles.billRow}>
              <Text style={[styles.billLabel, { color: textSecondary }]}>Parts Cost</Text>
              <Text style={[styles.billValue, { color: textPrimary }]}>Rs. 0.00</Text>
            </View>
            <View style={styles.billRow}>
              <Text style={[styles.billLabel, { color: textSecondary }]}>Extra Charges</Text>
              <Text style={[styles.billValue, { color: textPrimary }]}>Rs. 0.00</Text>
            </View>
            <View style={styles.billDividerDashed} />
            <View style={styles.billRow}>
              <Text style={[styles.billTotalLabel, { color: textPrimary }]}>Total</Text>
              <Text style={[styles.billTotalValue, { color: '#10B981' }]}>Rs. {booking.price?.toFixed(2) || '0.00'}</Text>
            </View>
            <Text style={[styles.billFooter, { color: textSecondary }]}>
              Billing Details: General Service.{'\n'}
              Bill generated and sent to customer.
            </Text>
          </View>
        )}

        {/* Action Button Blocks */}
        <View style={styles.actionBlock}>
          {booking.status === 'pending' ? (
            <View style={styles.carouselButtons}>
              <TouchableOpacity
                style={[styles.carouselBtn, styles.declineBtn]}
                onPress={() => { rejectBooking(booking.id); router.back(); }}
              >
                <Text style={styles.declineBtnText}>Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.carouselBtn, styles.acceptBtn, { backgroundColor: '#7DA0A9' }]}
                onPress={handleAcceptBooking}
                disabled={isAccepting}
              >
                {isAccepting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.acceptBtnText}>Accept</Text>}
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <StatusButton status={booking.status as any} onPress={handleUpdateStatus} />
              {booking.status === 'completed' && (
                <TouchableOpacity
                  style={{ marginTop: 12, paddingVertical: 12, alignItems: 'center' }}
                  onPress={() => router.push('/mechanic/dashboard')}
                >
                  <Text style={{ color: '#7DA0A9', fontWeight: '800', fontSize: 14 }}>Return to Dashboard</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Pop-up Bill Modal (Shows instantly upon completion) */}
      <Modal
        visible={showBillModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBillModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <View style={styles.billHeader}>
              <Ionicons name="receipt-outline" size={28} color="#10B981" />
              <Text style={[styles.billTitle, { color: textPrimary, fontSize: 22 }]}>Bill Summary</Text>
            </View>
            <Text style={{ color: textSecondary, marginBottom: 20, textAlign: 'center' }}>
              Booking #{booking.id}
            </Text>
            <View style={styles.billDivider} />
            <View style={styles.billRow}>
              <Text style={[styles.billLabel, { color: textSecondary, alignSelf: 'center' }]}>Service Fee</Text>
              <View style={styles.inputContainer}>
                <Text style={{color: textSecondary}}>$</Text>
                <TextInput style={[styles.billInput, { color: textPrimary, borderColor: cardBorder }]} keyboardType="numeric" value={serviceFee} onChangeText={setServiceFee} />
              </View>
            </View>
            <View style={styles.billRow}>
              <Text style={[styles.billLabel, { color: textSecondary, alignSelf: 'center' }]}>Parts Cost</Text>
              <View style={styles.inputContainer}>
                <Text style={{color: textSecondary}}>$</Text>
                <TextInput style={[styles.billInput, { color: textPrimary, borderColor: cardBorder }]} keyboardType="numeric" value={partsCost} onChangeText={setPartsCost} />
              </View>
            </View>
            <View style={styles.billRow}>
              <Text style={[styles.billLabel, { color: textSecondary, alignSelf: 'center' }]}>Extra Charges</Text>
              <View style={styles.inputContainer}>
                <Text style={{color: textSecondary}}>$</Text>
                <TextInput style={[styles.billInput, { color: textPrimary, borderColor: cardBorder }]} keyboardType="numeric" value={extraCharges} onChangeText={setExtraCharges} />
              </View>
            </View>
            <View style={styles.billDividerDashed} />
            <View style={styles.billRow}>
              <Text style={[styles.billTotalLabel, { color: textPrimary }]}>Total</Text>
              <Text style={[styles.billTotalValue, { color: '#10B981' }]}>${billTotal}</Text>
            </View>
            <Text style={[styles.billFooter, { color: textSecondary, marginTop: 24 }]}>
              Billing Details: General Service.{'\n'}
              Bill generated and sent to customer.
            </Text>

            <TouchableOpacity
              style={{ width: '100%', backgroundColor: '#10B981', marginTop: 32, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' }}
              onPress={async () => {
                try {
                  const billResult = await generateBill(booking.id, {
                    serviceCharge: parseFloat(serviceFee || '0'),
                    partsCost: parseFloat(partsCost || '0'),
                    extraCharges: parseFloat(extraCharges || '0'),
                    billingDetails: 'Custom Generated Bill'
                  });
                  if (billResult.success || billResult.isOffline) {
                    await updateBookingStatus(booking.id, 'completed');
                    setShowBillModal(false);
                    Platform.OS === 'web' ? window.alert('Success: Job Completed.') : Alert.alert('Success', 'Job Completed.');
                  } else {
                    Platform.OS === 'web' ? window.alert(`Error: ${billResult.error || 'Failed to generate bill.'}`) : Alert.alert('Error', billResult.error || 'Failed to generate bill.');
                  }
                } catch (error) {
                  Platform.OS === 'web' ? window.alert('Error: Failed to complete job.') : Alert.alert('Error', 'Failed to complete job.');
                }
              }}
            >
              <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 16 }}>Generate & Complete</Text>
            </TouchableOpacity>
            
            <View style={{ alignItems: 'center', marginTop: 12, padding: 8, backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: 8 }}>
              <Text style={{ color: '#10B981', fontSize: 10, fontWeight: '700' }}>CALLING ENDPOINT:</Text>
              <Text style={{ color: textSecondary, fontSize: 10, marginTop: 2, fontFamily: 'monospace' }}>
                PATCH /api/booking/complete/{booking.id.replace(/\D/g, '')}
              </Text>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  telemetryCenter: { borderRadius: 20, borderWidth: 1, padding: 14, marginBottom: 16 },
  tcHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  tcHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  tcPulseDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  tcPulseInner: { width: 8, height: 8, borderRadius: 4 },
  tcHeaderLabel: { fontSize: 10, fontWeight: '900' },
  tcTicketTag: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, backgroundColor: 'rgba(125,160,169,0.1)' },
  tcTicketTagText: { fontSize: 10, fontWeight: '800', color: '#7DA0A9' },
  tcRoute: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, padding: 10, marginBottom: 12, gap: 6 },
  tcRouteNode: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  tcNodeDot: { width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  tcNodeLabel: { fontSize: 10, fontWeight: '700', flex: 1 },
  tcRouteLine: { width: 50, alignItems: 'center', position: 'relative' },
  tcRouteLineDash: { position: 'absolute', top: '50%', left: 0, right: 0, borderTopWidth: 1, borderStyle: 'dashed' },
  tcRouteVehicle: { padding: 3, borderRadius: 8, borderWidth: 1, zIndex: 2 },
  tcNavBtn: { height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  tcNavBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
  errorContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorTitle: { fontSize: 18, fontWeight: '800', marginTop: 16 },
  errorMsg: { fontSize: 14, textAlign: 'center', marginVertical: 8 },
  errorBtn: { backgroundColor: '#F59E0B', padding: 12, borderRadius: 10, marginTop: 16 },
  errorBtnText: { color: '#FFF', fontWeight: '700' },
  sectionTitle: { fontSize: 15, fontWeight: '800', marginBottom: 10, marginTop: 18 },
  stepperCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 8 },
  cardTitle: { fontSize: 10, fontWeight: '800', marginBottom: 16 },
  stepperContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepNode: { alignItems: 'center', flex: 1 },
  nodeCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  nodeLabel: { fontSize: 9, fontWeight: '700', marginTop: 6 },
  nodeConnector: { height: 2, flex: 0.8, marginTop: -16 },
  actionBlock: { width: '100%', marginTop: 24 },
  carouselButtons: { flexDirection: 'row', gap: 12 },
  carouselBtn: { flex: 1, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  declineBtn: { borderWidth: 1, borderColor: '#EF4444' },
  declineBtnText: { color: '#EF4444', fontWeight: '700' },
  acceptBtn: { borderWidth: 0 },
  acceptBtnText: { color: '#FFFFFF', fontWeight: '700' },
  billCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginTop: 16 },
  billHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  billTitle: { fontSize: 16, fontWeight: '800', marginLeft: 8 },
  billDivider: { height: 1, backgroundColor: 'rgba(150, 150, 150, 0.1)', marginBottom: 12 },
  billDividerDashed: { height: 1, borderTopWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(150, 150, 150, 0.2)', marginVertical: 12 },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  billLabel: { fontSize: 14, fontWeight: '500' },
  billValue: { fontSize: 14, fontWeight: '700' },
  billTotalLabel: { fontSize: 16, fontWeight: '800' },
  billTotalValue: { fontSize: 18, fontWeight: '900' },
  billFooter: { fontSize: 11, fontStyle: 'italic', marginTop: 12, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', borderRadius: 20, borderWidth: 1, padding: 24, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 15 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent' },
  billInput: { fontSize: 14, fontWeight: '700', minWidth: 60, textAlign: 'right', borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, marginLeft: 4 },
});