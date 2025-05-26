import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, Dimensions, Platform, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Star, Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import Layout from '@/constants/layout';
import { LocalAnime } from '@/types/anime';

interface SpotlightCarouselProps {
  animeList: LocalAnime[];
  autoPlay?: boolean;
  interval?: number;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ITEM_HEIGHT = Math.max(350, Math.min(450, SCREEN_HEIGHT * 0.45));

export default function SpotlightCarousel({ 
  animeList, 
  autoPlay = true, 
  interval = 35000
}: SpotlightCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [showVideo, setShowVideo] = useState(Platform.OS === 'web');
  const [dimensions, setDimensions] = useState({ width: SCREEN_WIDTH, height: ITEM_HEIGHT });
  const scrollViewRef = useRef<any>(null);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const updateDimensions = () => {
      const { width, height } = Dimensions.get('window');
      const newItemHeight = Math.max(350, Math.min(450, height * 0.45));
      setDimensions({ width, height: newItemHeight });
    };

    updateDimensions();

    if (Platform.OS === 'web') {
      window.addEventListener('resize', updateDimensions);
      return () => window.removeEventListener('resize', updateDimensions);
    }
  }, []);

  useEffect(() => {
    if (autoPlay && animeList.length > 1) {
      startAutoPlay();
    }
    
    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, [autoPlay, animeList.length, activeIndex, interval]);

  const startAutoPlay = () => {
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
    }
    
    autoPlayTimerRef.current = setInterval(() => {
      goToNextSlide();
    }, interval);
  };

  const goToNextSlide = () => {
    if (!scrollViewRef.current) return;
    
    const nextIndex = (activeIndex + 1) % animeList.length;
    scrollViewRef.current.scrollTo({
      x: nextIndex * dimensions.width,
      animated: true
    });
    setActiveIndex(nextIndex);
  };

  const goToPrevSlide = () => {
    if (!scrollViewRef.current) return;
    
    const prevIndex = activeIndex === 0 ? animeList.length - 1 : activeIndex - 1;
    scrollViewRef.current.scrollTo({
      x: prevIndex * dimensions.width,
      animated: true
    });
    setActiveIndex(prevIndex);
  };

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / dimensions.width);
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
      if (autoPlay) startAutoPlay();
    }
  };

  if (!animeList?.length) return null;

  return (
    <View style={[styles.container, { height: dimensions.height }]}>
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {animeList.map((anime, index) => {
          const isActive = index === activeIndex;
          const ratingValue = typeof anime.rating === 'number' 
            ? anime.rating 
            : typeof anime.rating === 'string' 
              ? parseFloat(anime.rating) || 0 
              : 0;
          
          const hasTrailer = anime.vdo?.includes('youtube.com') || anime.vdo?.includes('youtu.be');
          const youtubeUrl = hasTrailer ? 
            `${anime.vdo}${anime.vdo.includes('?') ? '&' : '?'}enablejsapi=1&autoplay=1${isMuted ? '&mute=1' : ''}` : 
            '';

          return (
            <View 
              key={anime.id}
              style={[styles.slide, { width: dimensions.width }]}
            >
              {hasTrailer && isActive && showVideo && Platform.OS === 'web' ? (
                <View style={[styles.videoContainer, StyleSheet.absoluteFill]}>
                  <iframe
                    src={youtubeUrl}
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                    }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </View>
              ) : (
                <Image
                  source={{ uri: anime.bannerImage || anime.coverImage }}
                  style={[styles.image, StyleSheet.absoluteFill]}
                  contentFit="cover"
                  transition={500}
                />
              )}
              
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
                style={[styles.gradient, StyleSheet.absoluteFill]}
              />
              
              <View style={styles.content}>
                <View style={styles.genreContainer}>
                  {anime.genres.slice(0, 3).map((genre, idx) => (
                    <View key={idx} style={styles.genreTag}>
                      <Text style={styles.genreText}>{genre}</Text>
                    </View>
                  ))}
                  {anime.status === "Current" && (
                    <View style={styles.airingTag}>
                      <Text style={styles.airingText}>AIRING</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.title} numberOfLines={2}>{anime.title}</Text>

                <View style={styles.metaContainer}>
                  <View style={styles.ratingContainer}>
                    <Star size={16} color={Colors.dark.accent} fill={Colors.dark.accent} />
                    <Text style={styles.rating}>{ratingValue.toFixed(1)}</Text>
                  </View>
                  {anime.episodes && (
                    <Text style={styles.episodes}>{anime.episodes} Episodes</Text>
                  )}
                  {anime.duration && (
                    <Text style={styles.duration}>{anime.duration}</Text>
                  )}
                  {anime.quality && (
                    <View style={styles.qualityTag}>
                      <Text style={styles.qualityText}>{anime.quality}</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.synopsis} numberOfLines={2}>
                  {anime.description}
                </Text>

                <View style={styles.buttonContainer}>
                  <Link href={`/anime/${anime.id}`} asChild>
                    <Pressable style={styles.watchButton}>
                      <Play size={16} color={Colors.dark.text} />
                      <Text style={styles.watchButtonText}>Watch Now</Text>
                    </Pressable>
                  </Link>
                  
                  {hasTrailer && Platform.OS === 'web' && (
                    <TouchableOpacity 
                      style={styles.muteButton} 
                      onPress={() => setIsMuted(!isMuted)}
                    >
                      {isMuted ? (
                        <VolumeX size={20} color={Colors.dark.text} />
                      ) : (
                        <Volume2 size={20} color={Colors.dark.text} />
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </Animated.ScrollView>
      
      {animeList.length > 1 && (
        <>
          <TouchableOpacity 
            style={styles.navButtonLeft} 
            onPress={goToPrevSlide}
          >
            <ChevronLeft size={24} color={Colors.dark.text} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navButtonRight} 
            onPress={goToNextSlide}
          >
            <ChevronRight size={24} color={Colors.dark.text} />
          </TouchableOpacity>

          <View style={styles.pagination}>
            {animeList.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.paginationDot,
                  index === activeIndex && styles.paginationDotActive,
                ]}
                onPress={() => {
                  scrollViewRef.current?.scrollTo({
                    x: index * dimensions.width,
                    animated: true
                  });
                  setActiveIndex(index);
                  if (autoPlay) startAutoPlay();
                }}
              />
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: Layout.spacing.md,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    position: 'relative',
    height: '100%',
  },
  videoContainer: {
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    height: '100%',
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Layout.spacing.md,
    paddingBottom: Layout.spacing.lg,
  },
  genreContainer: {
    flexDirection: 'row',
    marginBottom: Layout.spacing.xs,
    flexWrap: 'wrap',
  },
  genreTag: {
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: 4,
    marginRight: Layout.spacing.xs,
    marginBottom: Layout.spacing.xs,
  },
  genreText: {
    color: Colors.dark.text,
    fontSize: 10,
    fontWeight: 'bold',
  },
  airingTag: {
    backgroundColor: Colors.dark.accent,
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: 4,
    marginRight: Layout.spacing.xs,
  },
  airingText: {
    color: Colors.dark.text,
    fontSize: 10,
    fontWeight: 'bold',
  },
  title: {
    color: Colors.dark.text,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: Layout.spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
    flexWrap: 'wrap',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  rating: {
    color: Colors.dark.text,
    fontSize: 14,
    marginLeft: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 2,
  },
  episodes: {
    color: Colors.dark.text,
    fontSize: 14,
    marginRight: Layout.spacing.md,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 2,
  },
  duration: {
    color: Colors.dark.text,
    fontSize: 14,
    marginRight: Layout.spacing.md,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 2,
  },
  qualityTag: {
    backgroundColor: Colors.dark.secondary,
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  qualityText: {
    color: Colors.dark.text,
    fontSize: 10,
    fontWeight: 'bold',
  },
  synopsis: {
    color: Colors.dark.text,
    fontSize: 14,
    marginBottom: Layout.spacing.md,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  watchButton: {
    backgroundColor: Colors.dark.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.md,
    borderRadius: Layout.borderRadius.sm,
  },
  watchButtonText: {
    color: Colors.dark.text,
    fontWeight: 'bold',
    marginLeft: Layout.spacing.xs,
  },
  muteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Layout.spacing.md,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: Layout.spacing.sm,
    left: 0,
    right: 0,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.subtext,
    marginHorizontal: 4,
    opacity: 0.5,
  },
  paginationDotActive: {
    backgroundColor: Colors.dark.primary,
    opacity: 1,
    width: 16,
  },
  navButtonLeft: {
    position: 'absolute',
    top: '50%',
    left: 10,
    marginTop: -25,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonRight: {
    position: 'absolute',
    top: '50%',
    right: 10,
    marginTop: -25,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});