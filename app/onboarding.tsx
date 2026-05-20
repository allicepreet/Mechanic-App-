import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { router } from 'expo-router';
import { useMechanic } from '@/components/MechanicContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ONBOARDING_PAGES = [
  {
    id: 1,
    title: 'Advanced Diagnostics',
    subtitle: 'Real-time telemetry, full EV drivetrain analysis, and elite ECU tuning for modern performance vehicles.',
    image: require('@/assets/images/tesla.png'),
    tag: 'INTELLIGENT TECH',
    icon: 'speedometer-outline',
  },
  {
    id: 2,
    title: 'Precision Tuning',
    subtitle: 'Expert suspension calibration, aerodynamic setups, and track-day adjustments for ultimate cornering.',
    image: require('@/assets/images/porsche.png'),
    tag: 'ELITE CALIBRATION',
    icon: 'options-outline',
  },
  {
    id: 3,
    title: 'High Performance',
    subtitle: 'High-end exhaust systems, bespoke caliper paint, and premium synthetic oil upgrades for high-revving engines.',
    image: require('@/assets/images/mustang.png'),
    tag: 'UNLEASHED POWER',
    icon: 'flame-outline',
  },
];

export default function OnboardingScreen() {
  const { darkMode } = useMechanic();
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const activeBg = darkMode ? '#0F172A' : '#F4F6F8';
  const textPrimary = darkMode ? '#F8FAFC' : '#1E293B';
  const textSecondary = darkMode ? '#94A3B8' : '#64748B';
  const cardBg = darkMode ? '#1E293B' : '#FFFFFF';
  const primaryAccent = '#7DA0A9';
  const cardBorder = darkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(125, 160, 169, 0.12)';

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / SCREEN_WIDTH);
    if (index !== activeIndex && index >= 0 && index < ONBOARDING_PAGES.length) {
      setActiveIndex(index);
    }
  };

  const handleNext = () => {
    if (activeIndex < ONBOARDING_PAGES.length - 1) {
      scrollRef.current?.scrollTo({
        x: (activeIndex + 1) * SCREEN_WIDTH,
        animated: true,
      });
    } else {
      router.push('/login');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: activeBg }]}>
      <StatusBar style={darkMode ? 'light' : 'dark'} />

      {/* Brand logo at top */}
      <View style={[styles.brandHeader, { paddingTop: Math.max(insets.top, 16) }]}>
        <View style={styles.brandRow}>
          <View style={[styles.brandIconContainer, { backgroundColor: primaryAccent }]}>
            <Ionicons name="construct" size={16} color="#FFFFFF" />
          </View>
          <Text style={[styles.brandText, { color: textPrimary }]}>APEX AUTO WORKS</Text>
        </View>
        <TouchableOpacity style={styles.skipBtn} onPress={() => router.push('/login')}>
          <Text style={[styles.skipText, { color: primaryAccent }]}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/*Snapping ScrollView Carousel */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        style={styles.scrollWrapper}
      >
        {ONBOARDING_PAGES.map((page, index) => (
          <View key={page.id} style={styles.slideContainer}>
            {/* Visual car container with elegant glassmorphism framing */}
            <View style={[styles.imageContainer, { borderColor: cardBorder }]}>
              <Image source={page.image} style={styles.carImage} resizeMode="contain" />
              <View style={[styles.tagBadge, { backgroundColor: primaryAccent }]}>
                <Ionicons name={page.icon as any} size={11} color="#FFFFFF" style={styles.tagIcon} />
                <Text style={styles.tagText}>{page.tag}</Text>
              </View>
            </View>

            {/* Description Info Card */}
            <View style={[styles.infoCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <Text style={[styles.slideTitle, { color: textPrimary }]}>{page.title}</Text>
              <Text style={[styles.slideSubtitle, { color: textSecondary }]}>{page.subtitle}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Dot Indicators */}
      <View style={styles.indicatorContainer}>
        {ONBOARDING_PAGES.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: index === activeIndex ? primaryAccent : (darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'),
                width: index === activeIndex ? 22 : 6,
              },
            ]}
          />
        ))}
      </View>

      {/* Premium Buttons at bottom */}
      <View style={[styles.bottomActions, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.outlineBtn, { borderColor: primaryAccent }]}
            onPress={() => router.push('/login')}
          >
            <Text style={[styles.outlineBtnText, { color: primaryAccent }]}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.solidBtn, { backgroundColor: primaryAccent }]}
            onPress={() => router.push('/signup')}
          >
            <Text style={styles.solidBtnText}>Create Account</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={styles.btnIcon} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  brandHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    height: 70,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  brandText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  skipBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollWrapper: {
    flex: 1,
  },
  slideContainer: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  imageContainer: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.36,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: 'rgba(125, 160, 169, 0.03)',
  },
  carImage: {
    width: '95%',
    height: '85%',
  },
  tagBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  tagIcon: {
    marginRight: 4,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  infoCard: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    marginTop: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  slideSubtitle: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '400',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: SCREEN_HEIGHT * 0.04,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  bottomActions: {
    paddingHorizontal: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  outlineBtn: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  outlineBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  solidBtn: {
    flex: 1.3,
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  solidBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  btnIcon: {
    marginLeft: 6,
  },
});
