import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { trpc, queryClient, trpcClient } from '@/lib/trpc';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, StyleSheet, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import Colors from '@/constants/colors';

export default function RootLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuAnimation = new Animated.Value(0);

  const toggleMenu = () => {
    const toValue = isMenuOpen ? 0 : 1;
    Animated.spring(menuAnimation, {
      toValue,
      useNativeDriver: true,
    }).start();
    setIsMenuOpen(!isMenuOpen);
  };

  const overlayOpacity = menuAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.7],
  });

  const menuTranslateX = menuAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 0],
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <SafeAreaProvider>
            <StatusBar style="light" />
            
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: {
                  backgroundColor: Colors.dark.background,
                },
              }}
            />

            {/* Menu Overlay */}
            {isMenuOpen && (
              <Animated.View 
                style={[
                  StyleSheet.absoluteFill,
                  { backgroundColor: 'black', opacity: overlayOpacity }
                ]}
                pointerEvents={isMenuOpen ? 'auto' : 'none'}
                onTouchEnd={toggleMenu}
              />
            )}

            {/* Side Menu */}
            <Animated.View
              style={[
                styles.menu,
                {
                  transform: [{ translateX: menuTranslateX }],
                }
              ]}
            >
              <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
              {/* Add your menu content here */}
            </Animated.View>
          </SafeAreaProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  menu: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 300,
    backgroundColor: Colors.dark.background + '80',
    borderRightWidth: 1,
    borderRightColor: Colors.dark.border,
  },
});