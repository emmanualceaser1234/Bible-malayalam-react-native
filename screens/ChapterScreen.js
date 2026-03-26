import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
const NUM_COLUMNS = 4;
const SPACING = 8;
const ITEM_WIDTH = (width - (SPACING * 2 * (NUM_COLUMNS + 1))) / NUM_COLUMNS;

const ChapterScreen = ({ route, navigation }) => {
  const { bookId, bookName, chapterCount } = route.params;

  const chapters = Array.from({ length: chapterCount }, (_, i) => i + 1);

  // Add dummy items to complete the last row
  const itemsNeededToCompleteRow = NUM_COLUMNS - (chapters.length % NUM_COLUMNS);
  if (itemsNeededToCompleteRow !== NUM_COLUMNS) {
    for (let i = 0; i < itemsNeededToCompleteRow; i++) {
      chapters.push(null); // Add null for empty spaces
    }
  }

  const handleChapterPress = (chapterNumber) => {
    navigation.navigate('Book', {
      bookId: bookId,
      bookName: bookName,
      chapterCount: chapterCount,
      initialChapter: chapterNumber
    });
  };

  const renderChapterItem = ({ item }) => {
    if (item === null) {
      // Render an empty view with the same dimensions
      return <View style={styles.chapterItem} />;
    }

    return (
      <TouchableOpacity
        style={styles.chapterItem}
        onPress={() => handleChapterPress(item)}
      >
        <Text style={styles.chapterNumber}>{item}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.bookTitle}>{bookName}</Text>
      <FlatList
        data={chapters}
        renderItem={renderChapterItem}
        keyExtractor={(item, index) => index.toString()}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F4FD',
  },
  bookTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C5282',
    textAlign: 'center',
    padding: 16,
  },
  listContainer: {
    padding: SPACING * 2,
  },
  chapterItem: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH, // Make it square
    margin: SPACING,
    backgroundColor: '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#89CFF0',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  chapterNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C5282',
  },
});

export default ChapterScreen; 