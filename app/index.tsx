import { Redirect } from 'expo-router';
import { useMechanic } from '@/components/MechanicContext';

export default function Index() {
  const { isLoggedIn } = useMechanic();

  if (isLoggedIn) {
    return <Redirect href="/mechanic/dashboard" />;
  }

  return <Redirect href="/login" />;
}
