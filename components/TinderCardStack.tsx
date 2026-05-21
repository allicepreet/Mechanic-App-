import React, { useRef, useState } from 'react';
import { StyleSheet, View, Text, Animated, PanResponder, Dimensions, TouchableOpacity, Image } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Booking, getVehicleImage } from './MechanicContext';
import { router } from 'expo-router';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;

interface TinderCardStackProps {
  bookings: Booking[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onSwipeStart: (id: string) => void;
  darkMode?: boolean;
}

export default function TinderCardStack({
  bookings,
  onAccept,
  onReject,
  onSwipeStart,
  darkMode = true,
}: TinderCardStackProps) {
  const [localSwipedIds, setLocalSwipedIds] = useState<string[]>([]);
  const activeBookings = bookings.filter((b) => !localSwipedIds.includes(b.id));
  const position = useRef(new Animated.ValueXY()).current;

  // Store activeBookings and callbacks in refs to eliminate stale closure bugs with PanResponder
  const activeBookingsRef = useRef(activeBookings);
  activeBookingsRef.current = activeBookings;

  const propsRef = useRef({ onAccept, onReject, onSwipeStart });
  propsRef.current = { onAccept, onReject, onSwipeStart };

  const forceSwipeRef = useRef<any>(null);

  const cardBg = darkMode ? '#1E293B' : '#FFFFFF';
  const textPrimary = darkMode ? '#F8FAFC' : '#1E293B';
  const textSecondary = darkMode ? '#94A3B8' : '#64748B';
  const cardBorder = darkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(125, 160, 169, 0.1)';
  const primaryAccent = '#7DA0A9';

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (event, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          forceSwipeRef.current?.('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          forceSwipeRef.current?.('left');
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
  };

  const forceSwipe = (direction: 'right' | 'left') => {
    if (activeBookingsRef.current.length === 0) return;
    const item = activeBookingsRef.current[0];
    
    // Instantly notify parent to update header count and trigger any layout syncing
    propsRef.current.onSwipeStart(item.id);

    const x = direction === 'right' ? SCREEN_WIDTH + 100 : -SCREEN_WIDTH - 100;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => onSwipeComplete(direction, item));
  };

  forceSwipeRef.current = forceSwipe;

  const onSwipeComplete = (direction: 'right' | 'left', item: Booking) => {
    if (direction === 'right') {
      propsRef.current.onAccept(item.id);
    } else {
      propsRef.current.onReject(item.id);
    }
    setLocalSwipedIds((prev) => [...prev, item.id]);
    position.setValue({ x: 0, y: 0 });
  };

  const getCardStyle = () => {
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange: ['-30deg', '0deg', '30deg'],
    });

    return {
      ...position.getLayout(),
      transform: [{ rotate }],
    };
  };

  // Badge Opacity interpolations
  const acceptOpacity = position.x.interpolate({
    inputRange: [0, SCREEN_WIDTH * 0.2],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const declineOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH * 0.2, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const renderStack = () => {
    if (activeBookings.length === 0) {
      return (
        <View style={[styles.emptyCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <Ionicons name="checkmark-done-circle" size={48} color="#10B981" />
          <Text style={[styles.emptyText, { color: textPrimary }]}>All Requests Swept!</Text>
          <Text style={[styles.emptySub, { color: textSecondary }]}>
            Your active repair schedule is fully organized.
          </Text>
        </View>
      );
    }

    return activeBookings
      .slice(0, 3) // Only render the top 3 cards in stack for maximum performance and gorgeous layered layout depth
      .map((item, idx) => {
        const isCurrent = idx === 0;

        if (!isCurrent) {
          // Render underlying cards in stack for depth
          return (
            <View
              key={item.id}
              style={[
                styles.card,
                styles.underCard,
                {
                  backgroundColor: cardBg,
                  borderColor: cardBorder,
                  top: 10 * idx,
                  transform: [{ scale: 1 - 0.04 * idx }],
                  zIndex: -idx,
                },
              ]}
            >
              <Image
                source={getVehicleImage(item.vehicle)}
                style={styles.cardImage}
                resizeMode="cover"
              />
              <View style={styles.cardHeader}>
                <Text style={[styles.carName, { color: textPrimary }]}>{item.vehicle}</Text>
                <Text style={styles.price}>Rs. {item.price}</Text>
              </View>
            </View>
          );
        }

        return (
          <Animated.View
            key={item.id}
            {...panResponder.panHandlers}
            style={[
              getCardStyle(),
              styles.card,
              {
                backgroundColor: cardBg,
                borderColor: cardBorder,
                zIndex: 99,
              },
            ]}
          >
            {/* Swiping Overlay Stamps */}
            <Animated.View style={[styles.stampContainer, styles.acceptStamp, { opacity: acceptOpacity }]}>
              <Text style={styles.acceptStampText}>ACCEPT</Text>
            </Animated.View>

            <Animated.View style={[styles.stampContainer, styles.declineStamp, { opacity: declineOpacity }]}>
              <Text style={styles.declineStampText}>DECLINE</Text>
            </Animated.View>

            {/* Gorgeous Vehicle Image Cover */}
            <Image
              source={getVehicleImage(item.vehicle)}
              style={styles.cardImage}
              resizeMode="cover"
            />

            {/* Card Content Header */}
            <View style={styles.cardHeader}>
              <View style={styles.vehicleRow}>
                <MaterialCommunityIcons
                  name={
                    item.vehicle.toLowerCase().includes('tesla') || item.vehicle.toLowerCase().includes('etron')
                      ? 'ev-station'
                      : 'car-sports'
                  }
                  size={22}
                  color={primaryAccent}
                />
                <Text style={[styles.carName, { color: textPrimary }]} numberOfLines={1}>
                  {item.vehicle}
                </Text>
              </View>
              <Text style={styles.price}>Rs. {item.price}</Text>
            </View>

            {/* Service & Notes */}
            <View style={[styles.bodySec, { borderTopColor: cardBorder, borderBottomColor: cardBorder }]}>
              <Text style={[styles.service, { color: textPrimary }]}>{item.serviceType}</Text>
              {item.notes ? (
                <Text style={[styles.notes, { color: textSecondary }]} numberOfLines={2}>
                  {`"${item.notes}"`}
                </Text>
              ) : null}
            </View>

            {/* Stranded breakdown location, distance, and ETA */}
            <View style={styles.routeContainer}>
              <View style={styles.locationRow}>
                <Ionicons name="location-sharp" size={14} color="#EF4444" />
                <Text style={[styles.locationText, { color: textPrimary }]} numberOfLines={1}>
                  {item.location}
                </Text>
              </View>
              {item.distance && (
                <View style={styles.distanceRow}>
                  <View style={[styles.badge, { backgroundColor: darkMode ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.08)' }]}>
                    <Ionicons name="speedometer-outline" size={11} color="#F59E0B" />
                    <Text style={[styles.badgeText, { color: '#F59E0B' }]}>{item.distance} away</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: darkMode ? 'rgba(6, 182, 212, 0.15)' : 'rgba(6, 182, 212, 0.08)' }]}>
                    <Ionicons name="time-outline" size={11} color="#06B6D4" />
                    <Text style={[styles.badgeText, { color: '#06B6D4' }]}>{item.eta} ETA</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Location & Time Footer info */}
            <View style={styles.footerSec}>
              <View style={styles.infoRow}>
                <Ionicons name="person-outline" size={14} color={textSecondary} />
                <Text style={[styles.infoText, { color: textSecondary }]}>{item.customerName}</Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={14} color={textSecondary} />
                <Text style={[styles.infoText, { color: textSecondary }]}>
                  {item.date} • {item.time}
                </Text>
              </View>
            </View>
          </Animated.View>
        );
      })
      .reverse(); // Reverse stack so current card is rendered on top
  };

  const handleInfoPress = () => {
    if (activeBookings.length > 0) {
      router.push({
        pathname: '/mechanic/booking-details',
        params: { id: activeBookings[0].id },
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Card Deck Area */}
      <View style={styles.deck}>{renderStack()}</View>

      {/* Tinder-like Bottom Circular Control Buttons */}
      {activeBookings.length > 0 && (
        <View style={styles.controls}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => forceSwipe('left')}
            style={[styles.btn, styles.btnDecline, { borderColor: darkMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)' }]}
          >
            <Ionicons name="close" size={28} color="#EF4444" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleInfoPress}
            style={[styles.btn, styles.btnInfo, { borderColor: darkMode ? 'rgba(125, 160, 169, 0.2)' : 'rgba(125, 160, 169, 0.15)' }]}
          >
            <Ionicons name="eye-outline" size={24} color={primaryAccent} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => forceSwipe('right')}
            style={[styles.btn, styles.btnAccept, { borderColor: darkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)' }]}
          >
            <Ionicons name="checkmark" size={28} color="#10B981" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
  },
  deck: {
    height: 360,
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
  },
  card: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 340,
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  underCard: {
    shadowOpacity: 0, // don't double shadow overlapping cards
    elevation: 0,
  },
  cardImage: {
    width: '100%',
    height: 140,
    borderRadius: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  carName: {
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 6,
    flex: 1,
  },
  price: {
    fontSize: 18,
    fontWeight: '900',
    color: '#10B981',
  },
  bodySec: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 8,
    marginBottom: 8,
  },
  service: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  notes: {
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  footerSec: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 20,
  },
  btn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  btnDecline: {
    backgroundColor: 'rgba(239, 68, 68, 0.06)',
  },
  btnAccept: {
    backgroundColor: 'rgba(16, 185, 129, 0.06)',
  },
  btnInfo: {
    backgroundColor: 'rgba(125, 160, 169, 0.06)',
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  emptyCard: {
    height: 340,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  stampContainer: {
    position: 'absolute',
    top: 50,
    borderWidth: 3,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    zIndex: 100,
    transform: [{ rotate: '-12deg' }],
  },
  acceptStamp: {
    left: 36,
    borderColor: '#10B981',
  },
  acceptStampText: {
    color: '#10B981',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
  },
  declineStamp: {
    right: 36,
    borderColor: '#EF4444',
    transform: [{ rotate: '12deg' }],
  },
  declineStampText: {
    color: '#EF4444',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
  },
  routeContainer: {
    marginVertical: 8,
    gap: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
    flex: 1,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
});
