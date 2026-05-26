import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useMechanic, Review } from '@/components/MechanicContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapView, Marker, Polyline } from '@/components/MapModule';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const VEHICLES = [
  '2024 Porsche Taycan Turbo S',
  '2023 Tesla Model S Plaid',
  '2022 Audi RS e-tron GT',
  '2021 Ford Mustang Shelby GT500',
  '2023 Corvette Z06',
];

const SERVICES = [
  { name: 'EV Battery Telemetry Calibration', price: 450 },
  { name: 'ECU Stage 2 Performance Tune', price: 680 },
  { name: 'Bespoke Brake Caliper Customization', price: 350 },
  { name: 'Track Day Aerodynamic Alignment', price: 500 },
  { name: 'Castrol SRF Pro Brake Flush', price: 220 },
];

const RANDOM_CLIENTS = [
  {
    name: 'Bruce Wayne',
    location: '1007 Mountain Drive (Wayne Manor)',
    vehicle: '2024 Porsche Taycan Turbo S',
    service: SERVICES[3],
    notes: 'Please check suspension settings and calibrate high-speed downforce telemetry. Highly classified specs.',
  },
  {
    name: 'Selina Kyle',
    location: 'Safehouse Sector 7 (East End Rooftops)',
    vehicle: '2023 Corvette Z06',
    service: SERVICES[2],
    notes: 'Caliper decals must be painted Matte Shadow Black. Check pad thickness for rapid deceleration.',
  },
  {
    name: 'Tony Stark',
    location: '10880 El Mirador Dr (Stark Industries Hub)',
    vehicle: '2022 Audi RS e-tron GT',
    service: SERVICES[0],
    notes: 'Optimize thermal threshold of cell module 4. Flash firmware update with clean diagnostics.',
  },
  {
    name: 'Natasha Romanoff',
    location: 'Safehouse Terminal B (Dock 14)',
    vehicle: '2023 Tesla Model S Plaid',
    service: SERVICES[1],
    notes: 'Remove throttle latency and enable custom performance profiles. Silent operations required.',
  },
  {
    name: 'Diana Prince',
    location: 'Gateway Arch Plaza (Mobile Zone)',
    vehicle: '2021 Ford Mustang Shelby GT500',
    service: SERVICES[4],
    notes: 'Flush track-ready reservoir with premium SRF fluid. Ensure solid pedal response.',
  }
];

export default function CustomerPreviewScreen() {
  const { garageInfo, darkMode, reviews, isOnline, addSimulatedBooking, currentCoords, bookings } = useMechanic();
  const insets = useSafeAreaInsets();

  const [customerName, setCustomerName] = useState('');
  const [strandedLocation, setStrandedLocation] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(VEHICLES[0]);
  const [selectedService, setSelectedService] = useState(SERVICES[0]);
  const [customNotes, setCustomNotes] = useState('');
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const [clientCoords, setClientCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const activeBg = darkMode ? '#0F172A' : '#F4F6F8';
  const cardBg = darkMode ? '#1E293B' : '#FFFFFF';
  const textPrimary = darkMode ? '#F8FAFC' : '#1E293B';
  const textSecondary = darkMode ? '#94A3B8' : '#64748B';
  const cardBorder = darkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(125, 160, 169, 0.12)';
  const primaryAccent = '#7DA0A9';

  const prefillRandomClient = () => {
    const randomClient = RANDOM_CLIENTS[Math.floor(Math.random() * RANDOM_CLIENTS.length)];
    setCustomerName(randomClient.name);
    setStrandedLocation(randomClient.location);
    setSelectedVehicle(randomClient.vehicle);
    setSelectedService(randomClient.service);
    setCustomNotes(randomClient.notes);
  };

  React.useEffect(() => {
    prefillRandomClient();
  }, []);

  const handleSubmit = () => {
    if (!customerName.trim()) {
      Alert.alert('Details Missing', 'Please enter your name to dispatch a service request.');
      return;
    }

    if (!strandedLocation.trim()) {
      Alert.alert('Breakdown Location Required', 'Please specify the exact location where the vehicle is stranded so the mechanic can reach you.');
      return;
    }

    const customerId = Math.floor(100 + Math.random() * 900);
    const clientLat = 12.9352 + (Math.random() - 0.5) * 0.02;
    const clientLon = 77.6245 + (Math.random() - 0.5) * 0.02;
    setClientCoords({ latitude: clientLat, longitude: clientLon });

    const bId = `B00${Date.now().toString().slice(-4)}`;

    // Call addSimulatedBooking from context
    addSimulatedBooking({
      id: bId,
      customerId: customerId,
      customerName: customerName,
      customerPhone: `+1 (555) 0${Math.floor(10 + Math.random() * 90)}-${Math.floor(1000 + Math.random() * 9000)}`,
      vehicle: selectedVehicle,
      serviceType: selectedService.name,
      price: selectedService.price,
      notes: customNotes.trim() || 'Customer requested premium performance inspection.',
      location: strandedLocation.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      latitude: clientLat,
      longitude: clientLon,
      status: 'pending',
    });

    setActiveBookingId(bId);
    setBookingSubmitted(true);
  };

  const resetForm = () => {
    prefillRandomClient();
    setBookingSubmitted(false);
    setActiveBookingId(null);
    setClientCoords(null);
  };

  const activeBooking = bookings.find(b => String(b.id) === String(activeBookingId)) || null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: activeBg }]}
    >
      {/* Sticky Top Navigation */}
      <View
        style={[
          styles.stickyHeader,
          {
            paddingTop: Math.max(insets.top, 16),
            backgroundColor: darkMode ? '#1E293B' : '#7DA0A9',
          },
        ]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            <Text style={styles.backBtnText}>Dashboard</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Apex Client Preview</Text>
          <View style={{ width: 80 }} /> {/* balance layout */}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Cover Photo */}
        <View style={styles.coverContainer}>
          <Image
            source={require('@/assets/images/garage.png')}
            style={styles.coverImage}
            resizeMode="cover"
          />
          <View style={styles.coverOverlay} />
          
          <View style={styles.avatarAbsoluteContainer}>
            <Image
              source={require('@/assets/images/profile.png')}
              style={styles.avatarImage}
            />
            <View
              style={[
                styles.onlineActiveDot,
                { backgroundColor: isOnline ? '#10B981' : '#64748B' },
              ]}
            />
          </View>
        </View>

        {/* Mechanic Headings */}
        <View style={styles.brandContainer}>
          <Text style={[styles.garageNameText, { color: textPrimary }]}>{garageInfo.name}</Text>
          <Text style={[styles.ownerNameText, { color: textSecondary }]}>{garageInfo.ownerName}</Text>
        </View>

        {/* Dynamic Presence Pulsing Status Bar */}
        <View
          style={[
            styles.statusBanner,
            {
              backgroundColor: isOnline ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              borderColor: isOnline ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            },
          ]}
        >
          <View
            style={[
              styles.statusPulseDot,
              { backgroundColor: isOnline ? '#10B981' : '#EF4444' },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              { color: isOnline ? '#10B981' : '#EF4444' },
            ]}
          >
            {isOnline ? 'ONLINE • READY FOR INSTANT DISPATCH' : 'OFFLINE • SHIFT COMPLETED'}
          </Text>
        </View>

        {/* About Specialist Card */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <Text style={[styles.cardTitle, { color: textPrimary }]}>Service & Hub Details</Text>
          
          <View style={styles.detailRow}>
            <Ionicons name="location-sharp" size={18} color="#EF4444" style={styles.detailIcon} />
            <Text style={[styles.detailText, { color: textPrimary }]}>{garageInfo.address}</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="time" size={18} color="#3B82F6" style={styles.detailIcon} />
            <Text style={[styles.detailText, { color: textPrimary }]}>{garageInfo.workingHours}</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="call" size={18} color="#10B981" style={styles.detailIcon} />
            <Text style={[styles.detailText, { color: textPrimary }]}>{garageInfo.phone}</Text>
          </View>

          <Text style={[styles.specialtyLabel, { color: textSecondary }]}>SPECIALTIES</Text>
          <View style={styles.specialtyContainer}>
            {garageInfo.specialties.map((spec, index) => (
              <View key={index} style={[styles.specChip, { backgroundColor: darkMode ? 'rgba(255,255,255,0.03)' : '#F0F3F4' }]}>
                <Text style={[styles.specText, { color: textPrimary }]}>{spec}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Dynamic Dispatch Form Card */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={styles.formHeader}>
            <MaterialCommunityIcons name="car-cog" size={20} color={primaryAccent} />
            <Text style={[styles.cardTitle, { color: textPrimary, marginLeft: 6, marginBottom: 0 }]}>
              Request On-Demand Dispatch
            </Text>
          </View>

          {bookingSubmitted ? (
            <View style={styles.trackingContainer}>
              {/* Premium Tracker Header */}
              <View style={[styles.trackingHeader, { borderBottomColor: cardBorder }]}>
                <MaterialCommunityIcons name="radar" size={24} color="#F59E0B" />
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={[styles.trackingTitle, { color: textPrimary }]}>Live Dispatch Tracking</Text>
                  <Text style={[styles.trackingSubtitleText, { color: textSecondary }]}>
                    Booking ID: {activeBooking?.id || 'Pending'} · {activeBooking?.vehicle}
                  </Text>
                </View>
                <View style={[styles.statusBadgeIcon, { backgroundColor: activeBooking?.status === 'arrived' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)' }]}>
                  <Text style={{ color: activeBooking?.status === 'arrived' ? '#10B981' : '#F59E0B', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' }}>
                    {activeBooking?.status?.replace('_', ' ') || 'pending'}
                  </Text>
                </View>
              </View>

              {/* Dynamic Status Notification Alert Banner */}
              {activeBooking?.status === 'arrived' ? (
                <View style={styles.arrivedBanner}>
                  <Ionicons name="sparkles" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.arrivedBannerTitle}>🚨 MECHANIC ARRIVED!</Text>
                    <Text style={styles.arrivedBannerSub}>Dominic T. has arrived at your location with the mobile tuning van.</Text>
                  </View>
                </View>
              ) : activeBooking?.status === 'accepted' || activeBooking?.status === 'in_progress' ? (
                <View style={[styles.enRouteBanner, { backgroundColor: 'rgba(6, 182, 212, 0.1)', borderColor: 'rgba(6, 182, 212, 0.3)' }]}>
                  <MaterialCommunityIcons name="truck-delivery" size={20} color="#06B6D4" style={{ marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#06B6D4', fontWeight: '800', fontSize: 12 }}>MECHANIC EN ROUTE</Text>
                    <Text style={{ color: textSecondary, fontSize: 11, fontWeight: '500', marginTop: 2 }}>Dominic T. is navigating to your stranded location. Keep this page open to watch progress.</Text>
                  </View>
                </View>
              ) : activeBooking?.status === 'completed' ? (
                <View style={[styles.enRouteBanner, { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)' }]}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" style={{ marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#10B981', fontWeight: '800', fontSize: 12 }}>SERVICE COMPLETED</Text>
                    <Text style={{ color: textSecondary, fontSize: 11, fontWeight: '500', marginTop: 2 }}>The tune-up is completed and your performance diagnostics are solid! Thank you.</Text>
                  </View>
                </View>
              ) : (
                <View style={[styles.enRouteBanner, { backgroundColor: 'rgba(245, 158, 11, 0.08)', borderColor: 'rgba(245, 158, 11, 0.2)' }]}>
                  <MaterialCommunityIcons name="clock-outline" size={20} color="#F59E0B" style={{ marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#F59E0B', fontWeight: '800', fontSize: 12 }}>AWAITING DISPATCH DISCOVERY</Text>
                    <Text style={{ color: textSecondary, fontSize: 11, fontWeight: '500', marginTop: 2 }}>Waiting for Dominic T. to accept your dispatch request on his rider screen...</Text>
                  </View>
                </View>
              )}

              {/* Real-time GPS Tracking Map */}
              {clientCoords && (
                <View style={[styles.mapWrapper, { borderColor: cardBorder }]}>
                  {Platform.OS !== 'web' && MapView ? (
                    <MapView
                      style={styles.trackingMap}
                      initialRegion={{
                        latitude: (clientCoords.latitude + (currentCoords?.latitude || 12.9352)) / 2,
                        longitude: (clientCoords.longitude + (currentCoords?.longitude || 77.6245)) / 2,
                        latitudeDelta: Math.abs(clientCoords.latitude - (currentCoords?.latitude || 12.9352)) * 2 || 0.05,
                        longitudeDelta: Math.abs(clientCoords.longitude - (currentCoords?.longitude || 77.6245)) * 2 || 0.05,
                      }}
                      showsUserLocation={false}
                    >
                      {/* Customer stranded pin */}
                      <Marker
                        coordinate={clientCoords}
                        title="You (Stranded Vehicle)"
                        pinColor="red"
                      />
                      {/* Mechanic incoming pin */}
                      {currentCoords && (
                        <Marker
                          coordinate={currentCoords}
                          title="Dominic T. (Mechanic Van)"
                          pinColor="orange"
                        />
                      )}
                      {/* Polyline path between mechanic and customer */}
                      {currentCoords && (
                        <Polyline
                          coordinates={[currentCoords, clientCoords]}
                          strokeWidth={3}
                          strokeColor="#F59E0B"
                        />
                      )}
                    </MapView>
                  ) : (
                    <View style={styles.webMapFallback}>
                      <MaterialCommunityIcons name="map-legend" size={32} color={textSecondary} />
                      <Text style={{ color: textPrimary, fontSize: 12, fontWeight: '700', marginTop: 8 }}>Interactive Map Simulator Active</Text>
                      <Text style={{ color: textSecondary, fontSize: 10, textAlign: 'center', marginTop: 4, paddingHorizontal: 16 }}>
                        Mechanic GPS: {currentCoords ? `${currentCoords.latitude.toFixed(4)}°, ${currentCoords.longitude.toFixed(4)}°` : 'Awaiting signal...'}{'\n'}
                        Your Location: {clientCoords.latitude.toFixed(4)}°, {clientCoords.longitude.toFixed(4)}°{'\n'}
                        Distance: {currentCoords ? '0.85 km away' : 'Calculating...'}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Dynamic Live WebSocket Payload Logger */}
              <View style={[styles.logBanner, { backgroundColor: darkMode ? 'rgba(0,0,0,0.3)' : '#F1F5F9' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ color: '#F59E0B', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 }}>
                    <Ionicons name="radio" size={10} color="#F59E0B" /> DYNAMIC WEBSOCKET SUBSCRIBER STREAM
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 4 }} />
                    <Text style={{ color: textSecondary, fontSize: 8, fontWeight: '700' }}>CONNECTED</Text>
                  </View>
                </View>
                <Text style={[styles.logText, { color: textSecondary }]}>
                  Topic: <Text style={{ color: textPrimary, fontWeight: '800' }}>/topic/customer/{activeBooking?.customerId || '999'}</Text>{'\n'}
                  Socket Link: <Text style={{ color: textPrimary }}>ws://localhost:8080/ws</Text>{'\n'}
                  Payload: {JSON.stringify({
                    lat: currentCoords?.latitude || 12.9352,
                    lon: currentCoords?.longitude || 77.6245,
                    status: activeBooking?.status || 'pending',
                    arrived: activeBooking?.status === 'arrived',
                    timestamp: new Date().toLocaleTimeString()
                  }, null, 1)}
                </Text>
              </View>

              {/* Reset / Submit Another Dispatch Request */}
              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: primaryAccent, width: '100%', marginTop: 16 }]}
                onPress={resetForm}
              >
                <Text style={styles.submitBtnText}>Cancel and Reset Tracker</Text>
              </TouchableOpacity>
            </View>
          ) : !isOnline ? (
            // Offline locked view
            <View style={styles.offlineLockOverlay}>
              <View style={styles.lockBadge}>
                <Ionicons name="lock-closed" size={32} color="#EF4444" />
              </View>
              <Text style={[styles.lockTitle, { color: textPrimary }]}>Shift Finished</Text>
              <Text style={[styles.lockSub, { color: textSecondary }]}>
                Dominic T. is currently off-duty. On-demand mobile service dispatches will resume once he checks back in for a live shift on his dashboard.
              </Text>
              <View style={styles.simulatedDisabledForm}>
                <View style={styles.disabledInput} />
                <View style={styles.disabledInput} />
                <View style={[styles.disabledInput, { height: 70 }]} />
              </View>
            </View>
          ) : (
            // Active Form
            <View style={styles.formBody}>
              <Text style={[styles.formSubtitle, { color: textSecondary }]}>
                Specify your location and vehicle specs to dispatch the mobile technician straight to you.
              </Text>

              {/* Client Name Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: textSecondary }]}>YOUR NAME</Text>
                <TextInput
                  style={[styles.textInput, { color: textPrimary, borderColor: cardBorder }]}
                  placeholder="Jane Rivera"
                  placeholderTextColor={textSecondary}
                  value={customerName}
                  onChangeText={setCustomerName}
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons name="map-marker" size={12} color="#F59E0B" style={{ marginRight: 4 }} />
                  <Text style={[styles.inputLabel, { color: '#F59E0B' }]}>VEHICLE BREAKDOWN LOCATION (REQUIRED)</Text>
                </View>
                <TextInput
                  style={[styles.textInput, { color: textPrimary, borderColor: cardBorder }]}
                  placeholder="e.g. Stranded at Interstate-35 Exit 240, or home driveway"
                  placeholderTextColor={textSecondary}
                  value={strandedLocation}
                  onChangeText={setStrandedLocation}
                />
              </View>

              {/* Vehicle Select Row */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: textSecondary }]}>SELECT PERFORMANCE VEHICLE</Text>
                <View style={styles.chipGrid}>
                  {VEHICLES.map((car) => {
                    const isSelected = selectedVehicle === car;
                    return (
                      <TouchableOpacity
                        key={car}
                        style={[
                          styles.selectionChip,
                          {
                            borderColor: isSelected ? primaryAccent : cardBorder,
                            backgroundColor: isSelected ? 'rgba(125, 160, 169, 0.12)' : 'transparent',
                          },
                        ]}
                        onPress={() => setSelectedVehicle(car)}
                      >
                        <Text
                          style={[
                            styles.selectionChipText,
                            { color: isSelected ? primaryAccent : textPrimary, fontWeight: isSelected ? '800' : '600' },
                          ]}
                          numberOfLines={1}
                        >
                          {car}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Service Select Row */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: textSecondary }]}>CHOOSE TUNE / CALIBRATION PROCEDURE</Text>
                <View style={styles.chipGrid}>
                  {SERVICES.map((srv) => {
                    const isSelected = selectedService.name === srv.name;
                    return (
                      <TouchableOpacity
                        key={srv.name}
                        style={[
                          styles.selectionChip,
                          {
                            borderColor: isSelected ? primaryAccent : cardBorder,
                            backgroundColor: isSelected ? 'rgba(125, 160, 169, 0.12)' : 'transparent',
                          },
                        ]}
                        onPress={() => setSelectedService(srv)}
                      >
                        <View style={styles.chipContent}>
                          <Text
                            style={[
                              styles.selectionChipText,
                              { color: isSelected ? primaryAccent : textPrimary, fontWeight: isSelected ? '800' : '600' },
                            ]}
                          >
                            {srv.name}
                          </Text>
                          <Text
                            style={[
                              styles.chipPriceText,
                              { color: isSelected ? '#10B981' : textSecondary },
                            ]}
                          >
                            Rs. {srv.price}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Custom specs */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: textSecondary }]}>ENGINE / BATTERY CUSTOM INSTRUCTIONS</Text>
                <TextInput
                  style={[styles.textAreaInput, { color: textPrimary, borderColor: cardBorder }]}
                  placeholder="E.g., calibrate torque parameters, flush air intake, set battery cell threshold..."
                  placeholderTextColor={textSecondary}
                  multiline
                  numberOfLines={4}
                  value={customNotes}
                  onChangeText={setCustomNotes}
                />
              </View>

              {/* Dispatch Action */}
              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: primaryAccent }]}
                onPress={handleSubmit}
              >
                <Text style={styles.submitBtnText}>Dispatch Tuning Request</Text>
                <Ionicons name="send" size={14} color="#FFFFFF" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Dynamic Reviews Section */}
        <View style={styles.reviewsTitleRow}>
          <Text style={[styles.sectionHeading, { color: textPrimary }]}>Verified Client Reviews</Text>
          <View style={styles.ratingSummary}>
            <Text style={[styles.ratingAverage, { color: textPrimary }]}>4.9</Text>
            <Ionicons name="star" size={13} color="#F59E0B" />
          </View>
        </View>

        {reviews.map((rev) => (
          <View key={rev.id} style={[styles.reviewCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewAvatar}>
                <Text style={styles.reviewAvatarText}>{rev.customerName[0]}</Text>
              </View>
              <View style={styles.reviewBrandRow}>
                <Text style={[styles.reviewAuthor, { color: textPrimary }]}>{rev.customerName}</Text>
                <Text style={[styles.reviewDate, { color: textSecondary }]}>{rev.date}</Text>
              </View>
              <View style={styles.reviewStars}>
                {[...Array(rev.rating)].map((_, i) => (
                  <Ionicons key={i} name="star" size={12} color="#F59E0B" />
                ))}
              </View>
            </View>
            <Text style={[styles.reviewService, { color: primaryAccent }]}>{rev.service}</Text>
            <Text style={[styles.reviewComment, { color: textSecondary }]}>{`"${rev.comment}"`}</Text>
          </View>
        ))}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stickyHeader: {
    height: 104,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 48,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  coverContainer: {
    height: 140,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 48,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  avatarAbsoluteContainer: {
    position: 'absolute',
    bottom: -32,
    left: '50%',
    transform: [{ translateX: -40 }],
    width: 80,
    height: 80,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#7DA0A9',
  },
  onlineActiveDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#1E2022',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  garageNameText: {
    fontSize: 20,
    fontWeight: '800',
  },
  ownerNameText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 20,
  },
  statusPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailIcon: {
    marginRight: 10,
    width: 18,
    textAlign: 'center',
  },
  detailText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
  },
  specialtyLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 10,
  },
  specialtyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specChip: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  specText: {
    fontSize: 11,
    fontWeight: '700',
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(125, 160, 169, 0.1)',
    paddingBottom: 12,
  },
  formBody: {
    gap: 16,
  },
  formSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
    marginBottom: 4,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  textInput: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '600',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectionChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  selectionChipText: {
    fontSize: 11,
  },
  chipContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    gap: 20,
  },
  chipPriceText: {
    fontSize: 11,
    fontWeight: '800',
  },
  textAreaInput: {
    height: 80,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    fontWeight: '600',
    textAlignVertical: 'top',
  },
  submitBtn: {
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    width: '100%',
    marginTop: 10,
    shadowColor: '#7DA0A9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  offlineLockOverlay: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  lockBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  lockTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  lockSub: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  simulatedDisabledForm: {
    width: '100%',
    gap: 10,
    opacity: 0.15,
  },
  disabledInput: {
    height: 38,
    backgroundColor: '#64748B',
    borderRadius: 8,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successBadge: {
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
  },
  successSub: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  reviewsTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  ratingSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingAverage: {
    fontSize: 13,
    fontWeight: '800',
  },
  reviewCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#7DA0A9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewAvatarText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  reviewBrandRow: {
    flex: 1,
    marginLeft: 10,
  },
  reviewAuthor: {
    fontSize: 13,
    fontWeight: '700',
  },
  reviewDate: {
    fontSize: 9,
    fontWeight: '500',
    marginTop: 1,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewService: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
  },
  reviewComment: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  trackingContainer: {
    gap: 12,
  },
  trackingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingBottom: 12,
    marginBottom: 8,
  },
  trackingTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  trackingSubtitleText: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  statusBadgeIcon: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrivedBanner: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  arrivedBannerTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  arrivedBannerSub: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    lineHeight: 15,
  },
  enRouteBanner: {
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 10,
  },
  mapWrapper: {
    height: 180,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 10,
  },
  trackingMap: {
    ...StyleSheet.absoluteFillObject,
  },
  webMapFallback: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    padding: 16,
  },
  logBanner: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.15)',
  },
  logText: {
    fontSize: 10,
    lineHeight: 14,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontWeight: '600',
    marginTop: 8,
  },
});
