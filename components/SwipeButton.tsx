import React, { useRef, useState } from 'react';
import { StyleSheet, View, Text, Animated, PanResponder, LayoutChangeEvent } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface SwipeButtonProps {
  onSwipeSuccess: () => void;
  text?: string;
  darkMode?: boolean;
}

export default function SwipeButton({
  onSwipeSuccess,
  text = 'SWIPE TO ACCEPT REQUEST',
  darkMode = true,
}: SwipeButtonProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const pan = useRef(new Animated.Value(0)).current;
  const [swiped, setSwiped] = useState(false);

  const handleSize = 44;
  const padding = 4;
  const maxTranslation = containerWidth - handleSize - padding * 2;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !swiped,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only capture horizontal movements exceeding 5 pixels to let vertical scrolls pass through naturally
        return !swiped && Math.abs(gestureState.dx) > 5;
      },
      onPanResponderGrant: (evt, gestureState) => {
        // Request parent ScrollViews to not intercept touches
        if (evt.nativeEvent && (evt.nativeEvent as any).target) {
          try {
            const target = (evt.nativeEvent as any).target;
            if (target.requestDisallowInterceptTouchEvent) {
              target.requestDisallowInterceptTouchEvent(true);
            }
          } catch (e) {
            // Safe fallback
          }
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        if (swiped || maxTranslation <= 0) return;
        // Restrict drag between 0 and maxTranslation
        const newValue = Math.max(0, Math.min(maxTranslation, gestureState.dx));
        pan.setValue(newValue);
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderRelease: (evt, gestureState) => {
        if (swiped || maxTranslation <= 0) return;
        
        // Success threshold is 75% of the total track distance
        if (gestureState.dx >= maxTranslation * 0.75) {
          setSwiped(true);
          // Animate handle to the absolute end
          Animated.timing(pan, {
            toValue: maxTranslation,
            duration: 150,
            useNativeDriver: true,
          }).start(() => {
            onSwipeSuccess();
          });
        } else {
          // Snap back to start if let go early
          Animated.spring(pan, {
            toValue: 0,
            tension: 40,
            friction: 7,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const onLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  // Fade out the track text as the swipe handle advances
  const textOpacity = pan.interpolate({
    inputRange: [0, maxTranslation > 0 ? maxTranslation * 0.6 : 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const activeBg = darkMode ? '#151718' : '#F8FAFC';
  const trackBorder = darkMode ? 'rgba(125, 160, 169, 0.2)' : 'rgba(125, 160, 169, 0.4)';
  const textColor = darkMode ? 'rgba(255, 255, 255, 0.6)' : '#64748B';

  return (
    <View
      onLayout={onLayout}
      style={[
        styles.container,
        {
          backgroundColor: swiped ? '#10B981' : activeBg,
          borderColor: swiped ? 'transparent' : trackBorder,
        },
      ]}
    >
      {/* Background Track Text */}
      {!swiped && (
        <Animated.View style={[styles.textWrapper, { opacity: textOpacity }]}>
          <Text style={[styles.swipeText, { color: textColor }]}>{text}</Text>
        </Animated.View>
      )}

      {/* Swipeable Handle */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.handle,
          {
            transform: [{ translateX: pan }],
            backgroundColor: swiped ? '#FFFFFF' : '#7DA0A9',
            width: handleSize,
            height: handleSize,
            borderRadius: handleSize / 2,
          },
        ]}
      >
        <Ionicons
          name={swiped ? 'checkmark-circle' : 'chevron-forward'}
          size={24}
          color={swiped ? '#10B981' : '#FFFFFF'}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 54,
    borderRadius: 27,
    borderWidth: 1.5,
    padding: 4,
    justifyContent: 'center',
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  textWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 24, // keep spacing from the initial handle X
  },
  swipeText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
  },
  handle: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
});
