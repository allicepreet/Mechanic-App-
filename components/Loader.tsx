import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Easing, Text } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface LoaderProps {
  message?: string;
  darkMode?: boolean;
}

export default function Loader({ message = 'Loading Systems...', darkMode = true }: LoaderProps) {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startRotation = () => {
      rotateAnim.setValue(0);
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    };

    startRotation();
  }, [rotateAnim]);

  // Main gear rotation: Clockwise
  const spinClockwise = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Secondary gear rotation: Counter-Clockwise (speed matches gear ratio)
  const spinCounterClockwise = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  const activeBg = darkMode ? '#151718' : '#F8FAFC';
  const textTheme = darkMode ? '#ECEDEE' : '#0F172A';
  const subTextTheme = darkMode ? '#9BA1A6' : '#64748B';

  return (
    <View style={[styles.container, { backgroundColor: activeBg }]}>
      <View style={styles.gearContainer}>
        {/* Large Gear */}
        <Animated.View style={{ transform: [{ rotate: spinClockwise }] }}>
          <MaterialCommunityIcons name="cog" size={70} color="#F59E0B" />
        </Animated.View>

        {/* Small Gear nestled next to the large one */}
        <Animated.View style={[styles.smallGear, { transform: [{ rotate: spinCounterClockwise }] }]}>
          <MaterialCommunityIcons name="cog" size={42} color="#10B981" />
        </Animated.View>
      </View>
      <Text style={[styles.title, { color: textTheme }]}>APEX DIAGNOSTICS</Text>
      <Text style={[styles.message, { color: subTextTheme }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  gearContainer: {
    width: 120,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 20,
  },
  smallGear: {
    marginLeft: -12,
    marginTop: -28,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 8,
  },
  message: {
    fontSize: 13,
    fontWeight: '500',
  },
});
