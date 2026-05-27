import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { useMechanic } from '@/components/MechanicContext';

interface CustomerCardProps {
  name: string;
  phone: string;
  location: string;
  distance?: string;
  eta?: string;
  darkMode?: boolean;
  bookingId?: string;
}

export default function CustomerCard({
  name,
  phone,
  location,
  distance,
  eta,
  darkMode = true,
  bookingId,
}: CustomerCardProps) {
  const { sendLocationToCustomer, bookings } = useMechanic();
  const booking = bookings.find((b) => String(b.id) === String(bookingId));
  const isBooked = booking ? ['accepted', 'in_progress', 'arrived'].includes(booking.status) : false;

  const cardBg = darkMode ? '#1E2022' : '#FFFFFF';
  const textPrimary = darkMode ? '#ECEDEE' : '#0F172A';
  const textSecondary = darkMode ? '#9BA1A6' : '#64748B';
  const cardBorder = darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)';


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
          Platform.OS === 'web' ? window.alert(`Phone Call Simulation: Dialing customer: ${phone}`) : Alert.alert('Phone Call Simulation', `Dialing customer: ${phone}`);
        }
      })
      .catch(() => {
        Platform.OS === 'web' ? window.alert(`Phone Call Simulation: Dialing customer: ${phone}`) : Alert.alert('Phone Call Simulation', `Dialing customer: ${phone}`);
      });
  };

  const handleSMS = () => {
    const url = `sms:${phone.replace(/[^\d+]/g, '')}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Platform.OS === 'web' ? window.alert(`SMS Simulation: Opening text conversation with: ${phone}`) : Alert.alert('SMS Simulation', `Opening text conversation with: ${phone}`);
        }
      })
      .catch(() => {
        Platform.OS === 'web' ? window.alert(`SMS Simulation: Opening text conversation with: ${phone}`) : Alert.alert('SMS Simulation', `Opening text conversation with: ${phone}`);
      });
  };

  const handleSendLocation = async () => {
    if (!bookingId) {
      Platform.OS === 'web' 
        ? window.alert('Error: No active booking found to send location.') 
        : Alert.alert('Error', 'No active booking found to send location.');
      return;
    }

    try {
      const result = await sendLocationToCustomer(bookingId);
      if (result.success) {
        const msg = result.isOffline 
          ? `Live Location Simulation:\n\nMechanic location successfully broadcasted over WS channel to Customer.\n\nEndpoint: /app/mechanic/location`
          : `Live Location broadcasted successfully to Customer!\n\nEndpoint: /app/mechanic/location`;
        
        Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Location Shared', msg);
      } else {
        Platform.OS === 'web' 
          ? window.alert(`Failed to send location: ${result.error}`) 
          : Alert.alert('Error', `Failed to send location: ${result.error}`);
      }
    } catch (err: any) {
      console.error(err);
      Platform.OS === 'web' 
        ? window.alert(`Failed to send location: ${err?.message || err}`) 
        : Alert.alert('Error', `Failed to send location: ${err?.message || err}`);
    }
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


      <View style={styles.actions}>
        <TouchableOpacity onPress={handleCall} style={[styles.actionBtn, styles.callBtn]}>
          <Ionicons name="call" size={14} color="#FFFFFF" style={styles.btnIcon} />
          <Text style={styles.callBtnText}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSMS} style={[styles.actionBtn, styles.smsBtn]}>
          <Ionicons name="chatbubble" size={14} color="#F59E0B" style={styles.btnIcon} />
          <Text style={styles.smsBtnText}>Message</Text>
        </TouchableOpacity>

      </View>

      {isBooked && (
        <TouchableOpacity onPress={handleSendLocation} style={[styles.sendLocationBtn, { backgroundColor: '#F59E0B' }]}>
          <MaterialCommunityIcons name="map-marker-radius" size={16} color="#FFFFFF" style={styles.btnIcon} />
          <Text style={styles.sendLocationBtnText}>Send Live Location to Customer</Text>
        </TouchableOpacity>
      )}


      <View style={[styles.locationContainer, { borderTopColor: cardBorder }]}>
        <Ionicons name="location" size={16} color="#EF4444" />
        <Text style={[styles.locationText, { color: textSecondary }]}>
          Stranded: {location} {distance ? `(${distance} away • ${eta} ETA)` : ''}
        </Text>
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
  navBtn: {
    backgroundColor: '#06B6D4',
  },
  navBtnText: {
    color: '#FFFFFF',
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
  sendLocationBtn: {
    height: 40,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sendLocationBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
