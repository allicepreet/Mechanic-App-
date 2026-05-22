import React from 'react';
import { View, StyleSheet, Text, Platform, Dimensions, TouchableOpacity, Alert, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useMechanic } from '@/components/MechanicContext';

// Conditionally import react-native-maps only on native platforms (Commented out for web bundling compatibility)
let MapView: any = null;
let Marker: any = null;
let Polyline: any = null;
let PROVIDER_GOOGLE: any = null;

/*
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Polyline = Maps.Polyline;
  PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
}
*/

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const primaryAccent = '#7DA0A9';

export default function NavigationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id = 'Unknown', location = 'Unknown', latitude = 12.9716, longitude = 77.5946 } = params as any;

  const { bookings, currentCoords, setCurrentCoords, updateBookingStatus, darkMode } = useMechanic();

  const booking = bookings.find((b) => b.id === id);

  // Positions
  const startPos = { latitude: 12.9352, longitude: 77.6245 };
  const destinationPos = { latitude: Number(latitude), longitude: Number(longitude) };

  const [currentSimulatedPos, setCurrentSimulatedPos] = React.useState(startPos);
  const [stepIndex, setStepIndex] = React.useState(0);
  const [currentSpeed, setCurrentSpeed] = React.useState(0);

  // Smooth coordinate progression toward breakdown site
  React.useEffect(() => {
    let timer: any = null;
    let speedTimer: any = null;

    // Simulate dynamic speed telemetry
    speedTimer = setInterval(() => {
      setCurrentSpeed((prev) => {
        if (stepIndex >= 4) return 0;
        if (stepIndex === 3) return Math.max(12, Math.floor(prev - (Math.random() * 8)));
        if (prev < 42) return Math.min(58, Math.floor(prev + (Math.random() * 14)));
        return Math.max(38, Math.floor(prev + (Math.random() * 6 - 3)));
      });
    }, 1500);

    // Route coordinates steps progression
    timer = setInterval(() => {
      setStepIndex((idx) => {
        const nextIdx = idx + 1;
        if (nextIdx > 4) {
          clearInterval(timer);
          return 4;
        }

        const t = nextIdx / 4;
        const nextLat = startPos.latitude + (destinationPos.latitude - startPos.latitude) * t;
        const nextLon = startPos.longitude + (destinationPos.longitude - startPos.longitude) * t;
        
        const newCoords = { latitude: nextLat, longitude: nextLon };
        setCurrentSimulatedPos(newCoords);
        
        // Push coordinate telemetry to MechanicContext for real-time WebSocket streaming
        setCurrentCoords(newCoords);

        return nextIdx;
      });
    }, 4500);

    return () => {
      clearInterval(timer);
      clearInterval(speedTimer);
    };
  }, [latitude, longitude, stepIndex]);

  const getTurnDetails = (idx: number) => {
    switch (idx) {
      case 0:
        return {
          icon: 'arrow-forward-circle-outline',
          text: 'Turn right onto Hal Airport Road in 800m',
          eta: '8 mins',
          distance: '3.2 km',
        };
      case 1:
        return {
          icon: 'arrow-up-circle-outline',
          text: 'Continue straight toward Intermediate Ring Road',
          eta: '5 mins',
          distance: '2.1 km',
        };
      case 2:
        return {
          icon: 'arrow-back-circle-outline',
          text: 'In 300m, turn left at Domlur Junction',
          eta: '3 mins',
          distance: '1.2 km',
        };
      case 3:
        return {
          icon: 'navigate-circle-outline',
          text: 'Approaching breakdown client destination in 150m',
          eta: '1 min',
          distance: '150 m',
        };
      case 4:
      default:
        return {
          icon: 'pin-outline',
          text: 'Arrived at customer breakdown site on your left',
          eta: 'Arrived',
          distance: '0 m',
        };
    }
  };

  const { icon: turnIcon, text: turnText, eta: simulatedEta, distance: simulatedDist } = getTurnDetails(stepIndex);

  const region = {
    latitude: (currentSimulatedPos.latitude + destinationPos.latitude) / 2,
    longitude: (currentSimulatedPos.longitude + destinationPos.longitude) / 2,
    latitudeDelta: Math.abs(currentSimulatedPos.latitude - destinationPos.latitude) * 2.2 || 0.03,
    longitudeDelta: Math.abs(currentSimulatedPos.longitude - destinationPos.longitude) * 2.2 || 0.03,
  };

  const handleArrival = () => {
    updateBookingStatus(id, 'completed');
    const msg = 'You have successfully arrived at the client breakdown site and resolved the emergency. The service ticket has been updated to completed.';
    
    if (Platform.OS === 'web') {
      window.alert(`🎉 SERVICE COMPLETED\n\n${msg}`);
      router.replace('/mechanic/dashboard');
    } else {
      Alert.alert(
        '🎉 Service Completed',
        msg,
        [{ text: 'Return to Dashboard', onPress: () => router.replace('/mechanic/dashboard') }]
      );
    }
  };

  const activeBg = darkMode ? '#0F172A' : '#F4F6F8';
  const cardBg = darkMode ? '#1E293B' : '#FFFFFF';
  const textPrimary = darkMode ? '#F8FAFC' : '#1E293B';
  const textSecondary = darkMode ? '#94A3B8' : '#64748B';
  const cardBorder = darkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(125, 160, 169, 0.12)';

  return (
    <View style={[styles.container, { backgroundColor: activeBg }]}>
      {/* Header overlay */}
      <View style={[styles.header, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.9)' : 'rgba(125, 160, 169, 0.95)' }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={16} color="#FFF" />
          <Text style={styles.backText}>Exit</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Navigation HUD</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Top half: Map View (takes exactly 48% screen height for balanced split screen on phone) */}
      <View style={styles.mapContainer}>
        {Platform.OS !== 'web' && MapView ? (
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={region}
            showsUserLocation={false}
          >
            <Marker coordinate={currentSimulatedPos} title="Mechanic (You)" pinColor={primaryAccent} />
            <Marker coordinate={destinationPos} title={String(location)} pinColor="red" />
            <Polyline
              coordinates={[currentSimulatedPos, destinationPos]}
              strokeColor={primaryAccent}
              strokeWidth={5}
            />
          </MapView>
        ) : (
          /* Web fallback / Interactive driving route simulation visualizer */
          <View style={[styles.webFallback, { backgroundColor: darkMode ? '#152033' : '#EAF0F2', borderColor: cardBorder }]}>
            <View style={styles.webRouteBadge}>
              <Text style={styles.webRouteBadgeText}>DYNAMIC ROUTE MAP</Text>
            </View>
            <View style={styles.pinRow}>
              <View style={[styles.nodeIndicator, { backgroundColor: 'rgba(6, 182, 212, 0.12)' }]}>
                <Ionicons name="navigate-circle" size={32} color="#06B6D4" />
                <Text style={[styles.nodeLabelText, { color: textPrimary }]}>You</Text>
              </View>
              <View style={styles.dashedConnector}>
                <MaterialCommunityIcons name="car-sports" size={20} color={primaryAccent} style={{ transform: [{ scaleX: -1 }] }} />
              </View>
              <View style={[styles.nodeIndicator, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}>
                <Ionicons name="location-sharp" size={32} color="#EF4444" />
                <Text style={[styles.nodeLabelText, { color: textPrimary }]}>Client</Text>
              </View>
            </View>
            <View style={styles.coordsBlock}>
              <Text style={[styles.coordsText, { color: textSecondary }]}>
                GPS: {currentSimulatedPos.latitude.toFixed(5)}°N, {currentSimulatedPos.longitude.toFixed(5)}°E
              </Text>
              <Text style={[styles.coordsText, { color: textSecondary }]}>
                Dest: {destinationPos.latitude.toFixed(5)}°N, {destinationPos.longitude.toFixed(5)}°E
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Bottom half: Rich Driving Telemetry Cockpit HUD */}
      <View style={[styles.hudContainer, { backgroundColor: cardBg, borderColor: cardBorder }]}>
        
        {/* Pulsing signal status bar */}
        <View style={styles.statusRow}>
          <View style={styles.pulseDotRow}>
            <View style={[styles.statusPulseDot, { backgroundColor: '#10B981' }]} />
            <Text style={[styles.statusTagText, { color: '#10B981' }]}>WEBSOCKET ACTIVE TELEMETRY</Text>
          </View>
          <Text style={[styles.etaValue, { color: '#06B6D4' }]}>{simulatedEta}</Text>
        </View>

        {/* Speed, Distance, ETA grids */}
        <View style={styles.telemetryGrid}>
          <View style={[styles.telemetryCell, { backgroundColor: darkMode ? '#151D2A' : '#F9FBFB', borderColor: cardBorder }]}>
            <Ionicons name="speedometer-outline" size={20} color={primaryAccent} />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.cellLabel}>DRIVING SPEED</Text>
              <Text style={[styles.cellValue, { color: textPrimary }]}>{currentSpeed} km/h</Text>
            </View>
          </View>

          <View style={[styles.telemetryCell, { backgroundColor: darkMode ? '#151D2A' : '#F9FBFB', borderColor: cardBorder }]}>
            <Ionicons name="resize-outline" size={20} color="#EF4444" />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.cellLabel}>REMAINING DIST.</Text>
              <Text style={[styles.cellValue, { color: textPrimary }]}>{simulatedDist}</Text>
            </View>
          </View>
        </View>

        {/* Navigation Turn Instruction */}
        <View style={[styles.instructionCard, { backgroundColor: darkMode ? '#1A2333' : '#F1F5F7', borderColor: cardBorder }]}>
          <Ionicons name={turnIcon as any} size={28} color="#10B981" />
          <View style={{ marginLeft: 14, flex: 1 }}>
            <Text style={[styles.instructionText, { color: textPrimary }]}>{turnText}</Text>
            <Text style={[styles.instructionSub, { color: textSecondary }]}>Dynamic GPS guidance active</Text>
          </View>
        </View>

        {/* Customer card / CTA actions */}
        <View style={[styles.customerSummaryCard, { borderTopColor: cardBorder }]}>
          <View style={styles.customerBrief}>
            <Image
              source={require('@/assets/images/profile.png')}
              style={styles.avatarImg}
            />
            <View style={{ marginLeft: 12 }}>
              <Text style={[styles.customerName, { color: textPrimary }]}>{booking?.customerName || 'Alex Rivera'}</Text>
              <Text style={[styles.customerVehicle, { color: textSecondary }]}>{booking?.vehicle || '2021 Tesla Model 3'}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.arrivalBtn} onPress={handleArrival}>
            <Ionicons name="checkmark-done" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.arrivalBtnText}>ARRIVED</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}
// Ensure the local images imports are safe helper

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Math.max(48, Platform.OS === 'ios' ? 48 : 24),
    paddingHorizontal: 16,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
    elevation: 3,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  mapContainer: {
    height: SCREEN_HEIGHT * 0.44,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  /* ---- Fallback web map styles ---- */
  webFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderWidth: 1,
  },
  webRouteBadge: {
    backgroundColor: 'rgba(125, 160, 169, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 16,
  },
  webRouteBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#7DA0A9',
    letterSpacing: 0.8,
  },
  pinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '80%',
    marginBottom: 20,
  },
  nodeIndicator: {
    width: 68,
    height: 68,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  nodeLabelText: {
    fontSize: 9,
    fontWeight: '800',
    marginTop: 4,
  },
  dashedConnector: {
    flex: 1,
    height: 2,
    borderWidth: 1,
    borderColor: '#7DA0A9',
    borderStyle: 'dashed',
    borderRadius: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coordsBlock: {
    alignItems: 'center',
  },
  coordsText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 2,
  },
  /* ---- HUD Panel Styles ---- */
  hudContainer: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    padding: 18,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  pulseDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusTagText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  etaValue: {
    fontSize: 16,
    fontWeight: '900',
  },
  telemetryGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  telemetryCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  cellLabel: {
    fontSize: 7,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  cellValue: {
    fontSize: 14,
    fontWeight: '900',
    marginTop: 1,
  },
  instructionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  instructionSub: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
  },
  customerSummaryCard: {
    borderTopWidth: 1,
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  customerBrief: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarImg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#7DA0A9',
  },
  customerName: {
    fontSize: 13,
    fontWeight: '800',
  },
  customerVehicle: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
  arrivalBtn: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  arrivalBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
});
