import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface StatusButtonProps {
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'rejected';
  onPress: () => void;
}

export default function StatusButton({ status, onPress }: StatusButtonProps) {
  // Configs based on booking status
  const getButtonConfig = () => {
    switch (status) {
      case 'accepted':
        return {
          bg: '#06B6D4',
          text: 'Start Dispatch Navigation',
          icon: 'navigation',
          enabled: true,
        };
      case 'in_progress':
        return {
          bg: '#10B981',
          text: 'Arrive & Complete Service',
          icon: 'check-all',
          enabled: true,
        };
      case 'completed':
        return {
          bg: 'rgba(16, 185, 129, 0.12)',
          text: 'Service Completed',
          icon: 'check-all',
          enabled: false,
          color: '#10B981',
        };
      case 'pending':
        return {
          bg: '#F59E0B',
          text: 'Accept Booking First',
          icon: 'alert-decagram-outline',
          enabled: false,
        };
      case 'rejected':
        return {
          bg: 'rgba(239, 68, 68, 0.1)',
          text: 'Service Declined',
          icon: 'close-circle-outline',
          enabled: false,
          color: '#EF4444',
        };
    }
  };

  const config = getButtonConfig();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={!config.enabled}
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor: config.bg,
          opacity: config.enabled ? 1 : 0.8,
        },
      ]}
    >
      <View style={styles.content}>
        <MaterialCommunityIcons
          name={config.icon as any}
          size={20}
          color={config.color || '#FFFFFF'}
          style={styles.icon}
        />
        <Text style={[styles.text, { color: config.color || '#FFFFFF' }]}>
          {config.text}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
