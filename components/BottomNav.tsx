import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { router, usePathname } from 'expo-router';
import { useMechanic } from '@/components/MechanicContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import PressableScale from '@/components/PressableScale';

export default function BottomNav() {
  const { darkMode } = useMechanic();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const primaryAccent = '#00E5FF'; // Premium Neon Cyan
  const textSecondary = darkMode ? '#94A3B8' : '#64748B';

  const NavButton = ({ route, icon, iconFamily, label }: any) => {
    const isActive = pathname === route || (route === '/mechanic/dashboard' && pathname === '/mechanic');
    const color = isActive ? primaryAccent : textSecondary;

    return (
      <PressableScale
        style={styles.navItem}
        activeScale={0.85}
        onPress={() => (isActive ? null : router.push(route))}
      >
        <View
          style={[
            styles.iconWrapper,
            isActive && {
              backgroundColor: darkMode ? 'rgba(0, 229, 255, 0.15)' : 'rgba(0, 229, 255, 0.1)',
            },
          ]}
        >
          {iconFamily === 'MaterialCommunityIcons' ? (
            <MaterialCommunityIcons name={icon} size={22} color={color} />
          ) : (
            <Ionicons name={icon} size={22} color={color} />
          )}
        </View>
        <Text style={[styles.navText, isActive && styles.navTextActive, { color }]}>
          {label}
        </Text>
      </PressableScale>
    );
  };

  return (
    <View style={[styles.navbarContainer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <BlurView
        intensity={darkMode ? 40 : 60}
        tint={darkMode ? 'dark' : 'light'}
        style={[styles.navbar, darkMode ? styles.navbarDark : styles.navbarLight]}
      >
        <NavButton route="/mechanic/dashboard" icon="speedometer" iconFamily="Ionicons" label="Dashboard" />
        <NavButton route="/mechanic/bookings" icon="construct" iconFamily="Ionicons" label="Bookings" />
        <NavButton route="/mechanic/earnings" icon="cash" iconFamily="Ionicons" label="Earnings" />
        <NavButton route="/mechanic/history" icon="time" iconFamily="Ionicons" label="History" />
        <NavButton route="/mechanic/profile" icon="person" iconFamily="Ionicons" label="Profile" />
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  navbarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    overflow: 'hidden',
  },
  navbarDark: {
    backgroundColor: 'rgba(9, 10, 12, 0.65)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  navbarLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  navItem: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    height: '100%',
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  navText: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  navTextActive: {
    fontWeight: '800',
  },
});

