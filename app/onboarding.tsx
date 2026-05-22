import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions, Animated, Easing, NativeSyntheticEvent, NativeScrollEvent, Platform } from 'react-native';
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
    tag: 'INTELLIGENT TECH',
    icon: 'speedometer-outline',
  },
  {
    id: 2,
    title: 'Precision Tuning',
    subtitle: 'Expert suspension calibration, aerodynamic setups, and track-day adjustments for ultimate cornering.',
    tag: 'ELITE CALIBRATION',
    icon: 'options-outline',
  },
  {
    id: 3,
    title: 'High Performance',
    subtitle: 'High-end exhaust systems, bespoke caliper paint, and premium synthetic oil upgrades for high-revving engines.',
    tag: 'UNLEASHED POWER',
    icon: 'flame-outline',
  },
];

export default function OnboardingScreen() {
  const { darkMode } = useMechanic();
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 8000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.4,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      )
    ]).start();
  }, []);

  const radarRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

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

  const renderTelemetryGraphics = (index: number) => {
    const activeColor = primaryAccent;
    const radarRotateStyle = {
      transform: [{ rotate: radarRotation }],
    };
    const pulseStyle = {
      opacity: pulseAnim,
    };

    if (index === 0) {
      return (
        <View style={styles.hudGraphicContainer}>
          <View style={[styles.dialOuter, { borderColor: darkMode ? 'rgba(125,160,169,0.15)' : 'rgba(125,160,169,0.2)' }]}>
            <View style={[styles.dialArc, { borderColor: activeColor }]} />
            <View style={styles.dialInner}>
              <Animated.View style={[styles.dialPulse, { backgroundColor: activeColor }, pulseStyle]} />
              <Text style={[styles.dialValText, { color: textPrimary }]}>SYS_OK</Text>
              <Text style={styles.dialLabelText}>OBD STATUS</Text>
            </View>
          </View>

          <View style={styles.hudTelemetryRows}>
            <View style={styles.hudTelemetryRow}>
              <Text style={[styles.hudLabelText, { color: textSecondary }]}>ECU_SYS</Text>
              <Text style={[styles.hudValText, { color: textPrimary }]}>ONLINE</Text>
            </View>
            <View style={styles.hudTelemetryRow}>
              <Text style={[styles.hudLabelText, { color: textSecondary }]}>EV_TEMP</Text>
              <Text style={[styles.hudValText, { color: textPrimary }]}>36.8°C</Text>
            </View>
            <View style={styles.hudTelemetryRow}>
              <Text style={[styles.hudLabelText, { color: textSecondary }]}>BAT_BUS</Text>
              <Text style={[styles.hudValText, { color: '#10B981' }]}>398V_NOM</Text>
            </View>
          </View>
        </View>
      );
    } else if (index === 1) {
      return (
        <View style={styles.tuningGraphicContainer}>
          <View style={styles.slidersBlock}>
            <View style={styles.sliderGroup}>
              <Text style={[styles.sliderLabel, { color: textSecondary }]}>FRONT DAMPING // 82%</Text>
              <View style={styles.sliderTrack}>
                <View style={[styles.sliderFill, { width: '82%', backgroundColor: activeColor }]} />
                <View style={[styles.sliderKnob, { left: '82%', borderColor: activeColor }]} />
              </View>
            </View>
            <View style={styles.sliderGroup}>
              <Text style={[styles.sliderLabel, { color: textSecondary }]}>REAR DOWNFORCE // 64%</Text>
              <View style={styles.sliderTrack}>
                <View style={[styles.sliderFill, { width: '64%', backgroundColor: activeColor }]} />
                <View style={[styles.sliderKnob, { left: '64%', borderColor: activeColor }]} />
              </View>
            </View>
            <View style={styles.sliderGroup}>
              <Text style={[styles.sliderLabel, { color: textSecondary }]}>STEERING RESPONSE // ELITE</Text>
              <View style={styles.sliderTrack}>
                <View style={[styles.sliderFill, { width: '90%', backgroundColor: activeColor }]} />
                <View style={[styles.sliderKnob, { left: '90%', borderColor: activeColor }]} />
              </View>
            </View>
          </View>

          <View style={styles.eqBlock}>
            {[30, 48, 65, 42, 58, 80, 50, 68, 35, 52].map((height, i) => (
              <View
                key={i}
                style={[
                  styles.eqBar,
                  {
                    height: height * 0.5,
                    backgroundColor: activeColor,
                    opacity: 0.3 + (i % 3) * 0.25,
                  },
                ]}
              />
            ))}
          </View>
        </View>
      );
    } else {
      return (
        <View style={styles.radarGraphicContainer}>
          <View style={[styles.radarCircleBig, { borderColor: darkMode ? 'rgba(125,160,169,0.15)' : 'rgba(125,160,169,0.2)' }]}>
            <View style={[styles.radarCircleMid, { borderColor: darkMode ? 'rgba(125,160,169,0.1)' : 'rgba(125,160,169,0.15)' }]} />
            <View style={[styles.radarCircleSmall, { borderColor: darkMode ? 'rgba(125,160,169,0.06)' : 'rgba(125,160,169,0.1)' }]} />
            
            <View style={[styles.radarAxisH, { backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]} />
            <View style={[styles.radarAxisV, { backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]} />

            <Animated.View style={[styles.radarSweepContainer, radarRotateStyle]}>
              <View style={[styles.radarSweepLine, { backgroundColor: activeColor }]} />
            </Animated.View>

            <Animated.View style={[styles.radarTargetNode, { top: '35%', left: '25%', borderColor: activeColor }, pulseStyle]} />
            <Animated.View style={[styles.radarTargetNode, { bottom: '25%', right: '30%', borderColor: activeColor }, pulseStyle]} />
          </View>

          <View style={styles.radarTelemetry}>
            <Text style={[styles.radarCoordinatesText, { color: textSecondary }]}>
              COORD: 30.2672° N // 97.7431° W
            </Text>
            <Text style={[styles.radarCoordinatesText, { color: textSecondary }]}>
              SAT STATUS: 12_LOCKED // HDG: 180°
            </Text>
          </View>
        </View>
      );
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
            {/* Visual container with elegant glassmorphism framing */}
            <View style={[styles.imageContainer, { borderColor: cardBorder }]}>
              {renderTelemetryGraphics(index)}
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
  hudGraphicContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 24,
  },
  dialOuter: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dialArc: {
    position: 'absolute',
    width: 118,
    height: 118,
    borderRadius: 59,
    borderWidth: 3,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    transform: [{ rotate: '45deg' }],
  },
  dialInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(125, 160, 169, 0.02)',
  },
  dialPulse: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  dialValText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dialLabelText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2,
    letterSpacing: 0.8,
  },
  hudTelemetryRows: {
    flex: 1,
    gap: 8,
    justifyContent: 'center',
  },
  hudTelemetryRow: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.08)',
    paddingBottom: 4,
  },
  hudLabelText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  hudValText: {
    fontSize: 12,
    fontWeight: '700',
  },
  tuningGraphicContainer: {
    width: '100%',
    height: '100%',
    padding: 20,
    justifyContent: 'space-between',
  },
  slidersBlock: {
    gap: 12,
    marginTop: 8,
  },
  sliderGroup: {
    gap: 4,
  },
  sliderLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sliderTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    width: '100%',
    position: 'relative',
  },
  sliderFill: {
    height: '100%',
    borderRadius: 3,
  },
  sliderKnob: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
    top: -3,
    marginLeft: -6,
  },
  eqBlock: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    height: 48,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.08)',
    paddingTop: 8,
    marginBottom: 4,
  },
  eqBar: {
    width: 14,
    borderRadius: 2,
  },
  radarGraphicContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  radarCircleBig: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  radarCircleMid: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
  },
  radarCircleSmall: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
  },
  radarAxisH: {
    position: 'absolute',
    width: '100%',
    height: 1,
  },
  radarAxisV: {
    position: 'absolute',
    height: '100%',
    width: 1,
  },
  radarSweepContainer: {
    position: 'absolute',
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarSweepLine: {
    width: 70,
    height: 1.5,
    position: 'absolute',
    left: 70,
    top: 70,
  },
  radarTargetNode: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
  },
  radarTelemetry: {
    marginTop: 12,
    alignItems: 'center',
    gap: 3,
  },
  radarCoordinatesText: {
    fontSize: 8,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 0.5,
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
