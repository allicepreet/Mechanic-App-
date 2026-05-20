import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightElement?: React.ReactNode;
  darkMode?: boolean;
}

export default function Header({
  title,
  showBack = false,
  onBackPress,
  rightElement,
  darkMode = true,
}: HeaderProps) {
  const insets = useSafeAreaInsets();
  
  const activeBg = darkMode ? '#151718' : '#FFFFFF';
  const activeBorder = darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
  const activeText = darkMode ? '#ECEDEE' : '#0F172A';

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: activeBg,
          borderBottomColor: activeBorder,
          paddingTop: Math.max(insets.top, Platform.OS === 'ios' ? 44 : 20),
        },
      ]}
    >
      <View style={styles.content}>
        {showBack ? (
          <TouchableOpacity onPress={handleBack} style={[styles.backButton, darkMode ? styles.btnDark : styles.btnLight]}>
            <Ionicons name="arrow-back" size={22} color={activeText} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}

        <Text style={[styles.title, { color: activeText }]} numberOfLines={1}>
          {title}
        </Text>

        <View style={styles.rightContainer}>
          {rightElement || <View style={styles.placeholder} />}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    paddingBottom: 12,
    zIndex: 100,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 48,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  btnLight: {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginHorizontal: 8,
  },
  rightContainer: {
    minWidth: 38,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  placeholder: {
    width: 38,
    height: 38,
  },
});
