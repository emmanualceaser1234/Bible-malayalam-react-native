import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Dimensions,
  PanResponder,
  Animated,
} from 'react-native';

const { width } = Dimensions.get('window');

const BookScreen = ({ route, navigation }) => {
  const { bookId, bookName, chapterCount, initialChapter } = route.params;
  const [currentChapter, setCurrentChapter] = useState(initialChapter || 1);
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allVerses, setAllVerses] = useState([]);
  const [hasIntro, setHasIntro] = useState(false);
  const scrollViewRef = useRef(null);
  
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadAllVerses();
  }, []);

  useEffect(() => {
    if (allVerses.length > 0) {
      loadChapterVerses(currentChapter);
    }
  }, [currentChapter, allVerses]);

  const loadAllVerses = async () => {
    try {
      const verseData = require('../data/verse.json');
      const bookVerses = verseData.filter(verse => verse.book_no === bookId);
      setAllVerses(bookVerses);
      
      // Check if this book has an intro section (actual_chapter_no === 0)
      const introExists = bookVerses.some(verse => verse.actual_chapter_no === 0);
      setHasIntro(introExists);
      
      // If no intro, start with chapter 1
      if (!introExists) {
        setCurrentChapter(1);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading verses:', error);
      Alert.alert('Error', 'Failed to load Bible verses');
      setLoading(false);
    }
  };

  const loadChapterVerses = (chapterNumber) => {
    const chapterVerses = allVerses.filter(verse => 
      verse.actual_chapter_no === chapterNumber
    );
    
    // Sort verses by verse number
    chapterVerses.sort((a, b) => a.verse_no - b.verse_no);
    setVerses(chapterVerses);
    
    // Scroll to top when chapter changes
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  const animateChapterTransition = (direction) => {
    slideAnim.setValue(direction === 'next' ? width : -width);

    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };

  const goToPreviousChapter = () => {
    if ((hasIntro && currentChapter > 0) || (!hasIntro && currentChapter > 1)) {
      animateChapterTransition('prev');
      setCurrentChapter(currentChapter - 1);
    }
  };

  const goToNextChapter = () => {
    if (currentChapter < chapterCount) {
      animateChapterTransition('next');
      setCurrentChapter(currentChapter + 1);
    }
  };

  const getMinChapter = () => hasIntro ? 0 : 1;
  const getMaxChapter = () => chapterCount;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onStartShouldSetPanResponderCapture: () => false,
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      const { dx, dy } = gestureState;
      return Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy * 2);
    },
    onMoveShouldSetPanResponderCapture: () => false,
    onPanResponderGrant: () => {
      if (scrollViewRef.current) {
        scrollViewRef.current.setNativeProps({ scrollEnabled: false });
      }
    },
    onPanResponderMove: (evt, gestureState) => {
      slideAnim.setValue(gestureState.dx);
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (scrollViewRef.current) {
        scrollViewRef.current.setNativeProps({ scrollEnabled: true });
      }

      const SWIPE_THRESHOLD = 50;

      if (gestureState.dx > SWIPE_THRESHOLD && currentChapter > (hasIntro ? 0 : 1)) {
        goToPreviousChapter();
      } else if (gestureState.dx < -SWIPE_THRESHOLD && currentChapter < chapterCount) {
        goToNextChapter();
      } else {
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }).start();
      }
    },
    onPanResponderTerminate: () => {
      if (scrollViewRef.current) {
        scrollViewRef.current.setNativeProps({ scrollEnabled: true });
      }
    },
  });

  const renderVerse = (verse, index) => (
    <View key={`${verse._id}-${index}`} style={styles.verseContainer}>
      <Text style={styles.verseNumber}>{verse.verse_no}</Text>
      <Text style={styles.verseText}>{verse.verse}</Text>
    </View>
  );

  const getChapterTitle = () => {
    if (currentChapter === 0) {
      return 'Intro';
    }
    return `Chapter ${currentChapter}`;
  };

  const getProgressText = () => {
    if (hasIntro) {
      if (currentChapter === 0) {
        return `Intro • ${chapterCount} chapters total`;
      }
      return `${currentChapter} of ${chapterCount} chapters`;
    }
    return `${currentChapter} of ${chapterCount} chapters`;
  };

  const getProgressPercentage = () => {
    if (hasIntro) {
      return ((currentChapter) / chapterCount) * 100;
    }
    return (currentChapter / chapterCount) * 100;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2c3e50" />
        <Text style={styles.loadingText}>Loading verses...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Chapter Navigation Header */}
      <View style={styles.chapterHeader}>
        <TouchableOpacity
          style={[styles.navButton, currentChapter === getMinChapter() && styles.navButtonDisabled]}
          onPress={goToPreviousChapter}
          disabled={currentChapter === getMinChapter()}
        >
          <Text style={[styles.navButtonText, currentChapter === getMinChapter() && styles.navButtonTextDisabled]}>
            ← 
          </Text>
        </TouchableOpacity>
        
        <View style={styles.chapterInfo}>
          <Text style={styles.chapterTitle}>{getChapterTitle()}</Text>
          <Text style={styles.chapterSubtitle}>{verses.length} verses</Text>
        </View>
        
        <TouchableOpacity
          style={[styles.navButton, currentChapter === getMaxChapter() && styles.navButtonDisabled]}
          onPress={goToNextChapter}
          disabled={currentChapter === getMaxChapter()}
        >
          <Text style={[styles.navButtonText, currentChapter === getMaxChapter() && styles.navButtonTextDisabled]}>
             →
          </Text>
        </TouchableOpacity>
      </View>

      {/* Wrap the ScrollView in an Animated.View */}
      <Animated.View 
        style={[
          styles.contentContainer,
          {
            transform: [{ translateX: slideAnim }]
          }
        ]}
        {...panResponder.panHandlers}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {currentChapter === 0 && (
            <View style={styles.introHeader}>
              <Text style={styles.introTitle}>Introduction</Text>
              <Text style={styles.introSubtitle}>Book of {bookName}</Text>
            </View>
          )}
          
          {verses.length > 0 ? (
            verses.map((verse, index) => renderVerse(verse, index))
          ) : (
            <View style={styles.noVersesContainer}>
              <Text style={styles.noVersesText}>
                {currentChapter === 0 ? 'No introduction available for this book' : 'No verses found for this chapter'}
              </Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {/* Chapter Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${getProgressPercentage()}%` }
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {getProgressText()}
        </Text>
      </View>

      {/* Swipe Hint */}
      {/* <Text style={styles.swipeHint}>Swipe left/right to navigate chapters</Text> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F4FD',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F4FD',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#2C5282',
  },
  chapterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#B3DFFF',
  },
  navButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#89CFF0',
    borderRadius: 6,
    minWidth: 80,
  },
  navButtonDisabled: {
    backgroundColor: '#B3DFFF',
  },
  navButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 14,
  },
  navButtonTextDisabled: {
    color: '#7BB3D9',
  },
  chapterInfo: {
    alignItems: 'center',
  },
  chapterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C5282',
  },
  chapterSubtitle: {
    fontSize: 12,
    color: '#4A90B8',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    width: '100%',
  },
  introHeader: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#89CFF0',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 1,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C5282',
    marginBottom: 4,
  },
  introSubtitle: {
    fontSize: 16,
    color: '#4A90B8',
    fontStyle: 'italic',
  },
  verseContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#89CFF0',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  verseNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#89CFF0',
    marginRight: 12,
    marginTop: 2,
    minWidth: 20,
  },
  verseText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#2C5282',
    textAlign: 'justify',
  },
  noVersesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  noVersesText: {
    fontSize: 16,
    color: '#4A90B8',
    textAlign: 'center',
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#B3DFFF',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E8F4FD',
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#89CFF0',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#4A90B8',
    textAlign: 'center',
  },
  swipeHint: {
    fontSize: 12,
    color: '#7BB3D9',
    textAlign: 'center',
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
});

export default BookScreen; 