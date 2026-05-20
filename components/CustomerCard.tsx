import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Linking, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface CustomerCardProps {
  name: string;
  phone: string;
  location: string;
  darkMode?: boolean;
}

export default function CustomerCard({
  name,
  phone,
  location,
  darkMode = true,
}: CustomerCardProps) {
  const cardBg = darkMode ? '#1E2022' : '#FFFFFF';
  const textPrimary = darkMode ? '#ECEDEE' : '#0F172A';
  const textSecondary = darkMode ? '#9BA1A6' : '#64748B';
  const cardBorder = darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)';

  // Generate short letters for Avatar
  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const handleCall = () => {
    const url = `tel:${phone.replace(/[^\d+]/g, '')}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Phone Call Simulation', `Dialing customer: ${phone}`);
        }
      })
      .catch(() => {
        Alert.alert('Phone Call Simulation', `Dialing customer: ${phone}`);
      });
  };

  const handleSMS = () => {
    const url = `sms:${phone.replace(/[^\d+]/g, '')}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('SMS Simulation', `Opening text conversation with: ${phone}`);
        }
      })
      .catch(() => {
        Alert.alert('SMS Simulation', `Opening text conversation with: ${phone}`);
      });
  };

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
      <View style={styles.header}>
        {/* Stylized Gradient/Color Avatar */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(name)}</Text>
        </View>

        <View style={styles.details}>
          <Text style={[styles.name, { color: textPrimary }]}>{name}</Text>
          <Text style={[styles.phone, { color: textSecondary }]}>{phone}</Text>
        </View>
      </View>

      {/* Action buttons (Call & SMS) */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={handleCall} style={[styles.actionBtn, styles.callBtn]}>
          <Ionicons name="call" size={16} color="#FFFFFF" style={styles.btnIcon} />
          <Text style={styles.callBtnText}>Call Customer</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSMS} style={[styles.actionBtn, styles.smsBtn]}>
          <Ionicons name="chatbubble" size={16} color="#F59E0B" style={styles.btnIcon} />
          <Text style={styles.smsBtnText}>Message</Text>
        </TouchableOpacity>
      </View>

      {/* Service location info */}
      <View style={[styles.locationContainer, { borderTopColor: cardBorder }]}>
        <Ionicons name="location" size={16} color="#F59E0B" />
        <Text style={[styles.locationText, { color: textSecondary }]}>{location}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  details: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
  },
  phone: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  actionBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callBtn: {
    backgroundColor: '#10B981',
  },
  callBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  smsBtn: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  smsBtnText: {
    color: '#F59E0B',
    fontSize: 13,
    fontWeight: '700',
  },
  btnIcon: {
    marginRight: 6,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
    flex: 1,
  },
});
