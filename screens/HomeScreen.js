import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';

const HomeScreen = ({ navigation }) => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedTestament, setSelectedTestament] = useState('ALL'); // 'ALL', 'OLD', or 'NEW'

  useEffect(() => {
    loadBooks();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [searchText, books, selectedTestament]);

  const loadBooks = async () => {
    try {
      const bookData = require('../data/book names.json');
      setBooks(bookData);
      setFilteredBooks(bookData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading books:', error);
      Alert.alert('Error', 'Failed to load Bible books');
      setLoading(false);
    }
  };

  const filterBooks = () => {
    let filtered = books;
    
    // Filter by testament if not ALL
    if (selectedTestament !== 'ALL') {
      filtered = filtered.filter(book => book.book_cat === selectedTestament);
    }

    // Filter by search text
    if (searchText.trim() !== '') {
      filtered = filtered.filter(book =>
        book.book_eng_name.toLowerCase().includes(searchText.toLowerCase()) ||
        book.book_mal_name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredBooks(filtered);
  };

  const handleBookPress = (book) => {
    navigation.navigate('Chapter', {
      bookId: book._id,
      bookName: book.book_eng_name,
      chapterCount: book.chapter_count,
    });
  };

  const renderBookItem = ({ item }) => (
    <TouchableOpacity
      style={styles.bookItem}
      onPress={() => handleBookPress(item)}
    >
      <View style={styles.bookContent}>
        <Text style={styles.bookEngName}>{item.book_eng_name}</Text>
        <Text style={styles.bookMalName}>{item.book_mal_name}</Text>
        <Text style={styles.chapterCount}>{item.chapter_count} chapters</Text>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.testamentToggle}>
        <TouchableOpacity
          style={[
            styles.testamentButton,
            selectedTestament === 'ALL' && styles.testamentButtonActive,
          ]}
          onPress={() => setSelectedTestament('ALL')}
        >
          <Text style={[
            styles.testamentButtonText,
            selectedTestament === 'ALL' && styles.testamentButtonTextActive
          ]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.testamentButton,
            selectedTestament === 'OLD' && styles.testamentButtonActive,
          ]}
          onPress={() => setSelectedTestament('OLD')}
        >
          <Text style={[
            styles.testamentButtonText,
            selectedTestament === 'OLD' && styles.testamentButtonTextActive
          ]}>Old Testament</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.testamentButton,
            selectedTestament === 'NEW' && styles.testamentButtonActive,
          ]}
          onPress={() => setSelectedTestament('NEW')}
        >
          <Text style={[
            styles.testamentButtonText,
            selectedTestament === 'NEW' && styles.testamentButtonTextActive
          ]}>New Testament</Text>
        </TouchableOpacity>
      </View>
      {/* <TextInput
        style={styles.searchInput}
        placeholder="Search books..."
        placeholderTextColor="#95a5a6"
        value={searchText}
        onChangeText={setSearchText}
      /> */}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2c3e50" />
        <Text style={styles.loadingText}>Loading Bible Books...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredBooks}
        renderItem={renderBookItem}
        keyExtractor={(item) => item._id.toString()}
        ListHeaderComponent={renderHeader}
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
  listContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  testamentToggle: {
    flexDirection: 'row',
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 4,
  },
  testamentButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 6,
    alignItems: 'center',
  },
  testamentButtonActive: {
    backgroundColor: '#2C5282',
  },
  testamentButtonText: {
    fontSize: 12,
    color: '#2C5282',
    fontWeight: '600',
  },
  testamentButtonTextActive: {
    color: '#fff',
  },
  searchInput: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#B3DFFF',
  },
  bookItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  bookContent: {
    flex: 1,
  },
  bookEngName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C5282',
    marginBottom: 4,
  },
  bookMalName: {
    fontSize: 16,
    color: '#4A90B8',
    marginBottom: 4,
  },
  chapterCount: {
    fontSize: 14,
    color: '#7BB3D9',
  },
});

export default HomeScreen; 