import React from 'react';
import { View, Text } from 'react-native';

// Standard Mock Map Components for frictionless Laptop testing
const MockMapView = (props: any) => (
  <View style={[{ backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }, props.style]}>
    <Text style={{ color: '#06B6D4', fontSize: 12, fontWeight: '800', letterSpacing: 0.5 }}>
      🗺️ MAP TELEMETRY TEMPORARILY ON STANDBY
    </Text>
    <Text style={{ color: '#94A3B8', fontSize: 10, fontWeight: '600', marginTop: 4 }}>
      Mock Radar Interface Active (Web/Laptop)
    </Text>
    {props.children}
  </View>
);

const MockMarker = (props: any) => null;
const MockPolyline = (props: any) => null;

const MapView = MockMapView;
const Marker = MockMarker;
const Polyline = MockPolyline;
const PROVIDER_GOOGLE = 'google';
const UrlTile = (props: any) => null;

export { MapView, Marker, Polyline, PROVIDER_GOOGLE, UrlTile };
