import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { useMechanic } from '@/components/MechanicContext';

export default function LoginScreen() {
  const { login } = useMechanic();
  
  // Default inputs set to your credentials
  const [email, setEmail] = useState('preetallice@gmail.com');
  const [password, setPassword] = useState('#Allice2004');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      if (Platform.OS === 'web') {
        window.alert('Please enter both email and password.');
      } else {
        Alert.alert('Details Missing', 'Please enter both email and password.');
      }
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      router.replace('/mechanic/dashboard');
    } else {
      const errorMsg = result.error || 'Failed to authenticate.';
      if (Platform.OS === 'web') {
        window.alert(errorMsg);
      } else {
        Alert.alert('Access Denied', errorMsg);
      }
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.brand}>apex<Text style={{ color: '#00E676' }}>.</Text></Text>
        <Text style={styles.subtitle}>Terminal Authentication Gate</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>EMAIL ADDRESS</Text>
          <TextInput 
            style={styles.input} 
            placeholder="email@example.com" 
            placeholderTextColor="#64748B"
            value={email} 
            onChangeText={setEmail} 
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>SECURITY CODE</Text>
          <TextInput 
            style={styles.input} 
            placeholder="••••••••" 
            placeholderTextColor="#64748B"
            value={password} 
            onChangeText={setPassword} 
            secureTextEntry 
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#0B0F19" />
          ) : (
            <Text style={styles.btnText}>Authorize Connection</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0B0F19', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  card: { 
    width: '100%', 
    maxWidth: 400, 
    backgroundColor: '#1E293B', 
    padding: 28, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5
  },
  brand: { 
    color: '#FFF', 
    fontSize: 32, 
    fontWeight: '900', 
    textAlign: 'center',
    letterSpacing: -0.5
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '600',
    letterSpacing: 0.5
  },
  inputGroup: {
    marginBottom: 16
  },
  label: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: 1
  },
  input: { 
    height: 48, 
    backgroundColor: '#0F172A', 
    borderRadius: 10, 
    paddingHorizontal: 16, 
    color: '#FFF', 
    borderWidth: 1.5, 
    borderColor: 'rgba(255,255,255,0.05)',
    fontSize: 14,
    fontWeight: '600'
  },
  btn: { 
    height: 50, 
    backgroundColor: '#00E676', 
    borderRadius: 25, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 12,
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3
  },
  btnText: { 
    color: '#0B0F19', 
    fontSize: 15, 
    fontWeight: '800' 
  }
});