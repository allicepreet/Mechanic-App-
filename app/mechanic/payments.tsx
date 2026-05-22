import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useMechanic } from '@/components/MechanicContext';
import { router } from 'expo-router';
import BottomNav from '@/components/BottomNav';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function PaymentsScreen() {
  const { darkMode } = useMechanic();

  const handlePay = () => {
    // Mock payment processing
    Alert.alert('Payment Successful', 'Your payment was processed successfully.', [
      { text: 'OK', onPress: () => router.push('/mechanic/payment-success' as any) },
    ]);
  };

  const bg = darkMode ? '#151718' : '#F8FAFC';
  const textPrimary = darkMode ? '#ECEDEE' : '#0F172A';

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Text style={[styles.title, { color: textPrimary }]}>Payments</Text>
      <TouchableOpacity style={styles.payButton} onPress={handlePay}>
        <Ionicons name="card-outline" size={20} color="#FFFFFF" />
        <Text style={styles.payButtonText}>Pay Now</Text>
      </TouchableOpacity>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 32,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#28A745',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
