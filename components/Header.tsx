import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { Link } from 'expo-router';
import { Image } from 'expo-image';
import { Search } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Layout from '@/constants/layout';
import SearchBar from './SearchBar';

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
}

export interface HeaderRef {
  handleScroll: (scrollY: number) => void;
}

const Header = forwardRef<HeaderRef, HeaderProps>(({ title, showSearch = true }, ref) => {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [opacity, setOpacity] = useState(1);

  useImperativeHandle(ref, () => ({
    handleScroll: (scrollY: number) => {
      const newOpacity = Math.max(0, 1 - scrollY / 100);
      setOpacity(newOpacity);
    },
  }));

  return (
    <View style={[styles.container, { opacity }]}>
      <View style={styles.content}>
        {!isSearchVisible && (
          <>
            <Link href="/" asChild>
              <TouchableOpacity>
                <Image
                  source={require('@/assets/images/arise.png')}
                  style={styles.logo}
                  contentFit="contain"
                />
              </TouchableOpacity>
            </Link>
            {title ? (
              <Text style={styles.title}>{title}</Text>
            ) : null}
          </>
        )}

        {showSearch && (
          <View style={[styles.searchContainer, isSearchVisible && styles.searchContainerExpanded]}>
            {isSearchVisible ? (
              <SearchBar onBlur={() => setIsSearchVisible(false)} />
            ) : (
              <TouchableOpacity
                style={styles.searchButton}
                onPress={() => setIsSearchVisible(true)}
              >
                <Search size={24} color={Colors.dark.text} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: Layout.spacing.md,
  },
  logo: {
    width: 100,
    height: 32,
  },
  title: {
    color: Colors.dark.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: Layout.spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainerExpanded: {
    flex: 1,
  },
  searchButton: {
    padding: Layout.spacing.sm,
  },
});

export default Header;