import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useMechanic } from '@/components/MechanicContext';

export default function Index() {
  const { isLoggedIn, authLoading } = useMechanic();

  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B0F19' }}>
        <ActivityIndicator size="large" color="#00E676" />
      </View>
    );
  }

  if (isLoggedIn) {
    return <Redirect href="/mechanic/dashboard" />;
  }

  return <Redirect href="/login" />;
}
