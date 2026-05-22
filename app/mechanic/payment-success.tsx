import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Alert } from 'react-native';
import { router } from 'expo-router';
import { useMechanic } from '@/components/MechanicContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import BottomNav from '@/components/BottomNav';

export default function PaymentSuccessScreen() {
  const { darkMode } = useMechanic();

  const bg = darkMode ? '#151718' : '#F8FAFC';
  const textPrimary = darkMode ? '#ECEDEE' : '#0F172A';
  const accent = darkMode ? '#28A745' : '#28A745';

  const receiptInfo = {
    service: 'Vehicle Inspection',
    amount: '$120.00',
    date: new Date().toLocaleDateString(),
    reference: 'REF' + Math.floor(Math.random() * 1000000),
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Payment receipt:\nService: ${receiptInfo.service}\nAmount: ${receiptInfo.amount}\nDate: ${receiptInfo.date}\nReference: ${receiptInfo.reference}`,
      });
      if (result.activityType) {
        // shared with activity type of result.activityType
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to share receipt.');
    }
  };

  const goToDashboard = () => {
    router.replace('/mechanic' as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Ionicons name="checkmark-circle" size={64} color={accent} />
      <Text style={[styles.title, { color: textPrimary }]}>Payment Successful</Text>
      <View style={styles.receiptBox}>
        <Text style={[styles.label, { color: textPrimary }]}>Service:</Text>
        <Text style={styles.value}>{receiptInfo.service}</Text>
        <Text style={[styles.label, { color: textPrimary }]}>Amount:</Text>
        <Text style={styles.value}>{receiptInfo.amount}</Text>
        <Text style={[styles.label, { color: textPrimary }]}>Date:</Text>
        <Text style={styles.value}>{receiptInfo.date}</Text>
        <Text style={[styles.label, { color: textPrimary }]}>Reference:</Text>
        <Text style={styles.value}>{receiptInfo.reference}</Text>
      </View>
      <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
        <Ionicons name="share-social" size={20} color="#FFFFFF" />
        <Text style={styles.actionButtonText}>Share Receipt</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton} onPress={goToDashboard}>
        <Ionicons name="home" size={20} color="#FFFFFF" />
        <Text style={styles.actionButtonText}>Back to Dashboard</Text>
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
    fontSize: 28,
    fontWeight: '800',
    marginTop: 16,
    marginBottom: 24,
  },
  receiptBox: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  actionButton: {
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
    marginTop: 12,
    width: '100%',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
