import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, Animated } from 'react-native';
import { Link } from 'expo-router';
import { Image } from 'expo-image';
import { Search, Bell, Menu, User } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import Colors from '@/constants/colors';
import Layout from '@/constants/layout';
import SearchBar from './SearchBar';

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
  onMenuPress?: () => void;
}

export interface HeaderRef {
  handleScroll: (scrollY: number) => void;
}

const Header = forwardRef<HeaderRef, HeaderProps>(({ title, showSearch = true, onMenuPress }, ref) => {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [scrollY] = useState(new Animated.Value(0));

  useImperativeHandle(ref, () => ({
    handleScroll: (value: number) => {
      scrollY.setValue(value);
    },
  }));

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const HeaderBackground = Platform.OS === 'ios' ? BlurView : View;
  const headerBackgroundProps = Platform.OS === 'ios' ? {
    tint: 'dark',
    intensity: 100,
  } : {
    style: { backgroundColor: Colors.dark.background + 'CC' }
  };

  return (
    <Animated.View style={[styles.container]}>
      <HeaderBackground style={StyleSheet.absoluteFill} {...headerBackgroundProps} />
      <View style={styles.content}>
        {!isSearchVisible ? (
          <>
            <View style={styles.leftSection}>
              <TouchableOpacity style={styles.iconButton} onPress={onMenuPress}>
                <Menu size={24} color={Colors.dark.text} />
              </TouchableOpacity>
              <Link href="/" asChild>
                <TouchableOpacity>
                  <Image
                    source={require('@/assets/images/arise.png')}
                    style={styles.logo}
                    contentFit="contain"
                  />
                </TouchableOpacity>
              </Link>
              {title ? <Text style={styles.title}>{title}</Text> : null}
            </View>

            <View style={styles.rightSection}>
              {showSearch && (
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => setIsSearchVisible(true)}
                >
                  <Search size={24} color={Colors.dark.text} />
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.iconButton}>
                <Bell size={24} color={Colors.dark.text} />
              </TouchableOpacity>
              <Link href="/profile" asChild>
                <TouchableOpacity style={styles.iconButton}>
                  <User size={24} color={Colors.dark.text} />
                </TouchableOpacity>
              </Link>
            </View>
          </>
        ) : (
          <View style={styles.searchContainer}>
            <SearchBar 
              onBlur={() => setIsSearchVisible(false)}
              autoFocus={true}
            />
          </View>
        )}
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border + '40',
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: Layout.spacing.md,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 32,
    marginLeft: Layout.spacing.sm,
  },
  title: {
    color: Colors.dark.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: Layout.spacing.md,
  },
  iconButton: {
    padding: Layout.spacing.sm,
    marginLeft: Layout.spacing.xs,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default Header;