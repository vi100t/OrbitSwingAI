import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlassBg from '@/components/ui/GlassBg';
import Header from '@/components/shared/Header';
import Colors from '@/constants/Colors';
import { Plus, Search } from 'lucide-react-native';
import NoteItem from '@/components/notes/NoteItem';
import { useRouter } from 'expo-router';
import SearchBar from '@/components/shared/SearchBar';
import { useNotes } from '@/hooks/useSupabase';
import PullToRefreshLoader from '@/components/shared/PullToRefreshLoader';
import { Note } from '@/types/note';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_WIDTH = (SCREEN_WIDTH - 48) / 2; // 2 columns with padding

export default function NotesScreen() {
  const { notes, loading, refreshNotes } = useNotes();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const cardsPosition = React.useRef(new Animated.Value(0)).current;
  const pullDistance = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(cardsPosition, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [loading, fadeAnim, cardsPosition]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refreshNotes();
    setRefreshing(false);
    pullDistance.setValue(0);
  }, [refreshNotes, pullDistance]);

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    pullDistance.setValue(offsetY);
  };

  const cardsTranslateY = pullDistance.interpolate({
    inputRange: [-100, -50, 0],
    outputRange: [SCREEN_WIDTH, 0, 0],
    extrapolate: 'clamp',
  });

  // Filter notes based on search query
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.content?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  // Sort notes by last edited date
  const sortedNotes = [...filteredNotes].sort(
    (a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

  const handleNotePress = (noteId: string) => {
    router.push(`/notes/${noteId}`);
  };

  const renderMasonryLayout = () => {
    const columns: Note[][] = [[], []];
    let currentColumn = 0;

    sortedNotes.forEach((note) => {
      // Add note to the current column
      columns[currentColumn].push(note);
      // Switch to the other column for the next note
      currentColumn = currentColumn === 0 ? 1 : 0;
    });

    return (
      <View style={styles.masonryContainer}>
        {columns.map((column, columnIndex) => (
          <View key={columnIndex} style={styles.column}>
            {column.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                onPress={() => handleNotePress(note.id)}
              />
            ))}
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <GlassBg>
        <SafeAreaView style={styles.container} edges={['top']}>
          <Header title="Notes" showVoice={true} />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        </SafeAreaView>
      </GlassBg>
    );
  }

  return (
    <GlassBg>
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="Notes" showVoice={true} />

        <View style={styles.contentContainer}>
          <View style={styles.searchRow}>
            {showSearch ? (
              <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                onClear={() => {
                  setSearchQuery('');
                  setShowSearch(false);
                }}
              />
            ) : (
              <TouchableOpacity
                style={styles.searchButton}
                onPress={() => setShowSearch(true)}
              >
                <Search size={18} color={Colors.text} />
                <Text style={styles.searchButtonText}>Search notes</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/notes/new')}
            >
              <Plus size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <Animated.View
            style={[
              styles.contentWrapper,
              {
                opacity: fadeAnim,
                transform: [{ translateY: cardsTranslateY }],
                marginTop: 12,
              },
            ]}
          >
            <ScrollView
              onScroll={handleScroll}
              scrollEventThrottle={16}
              contentContainerStyle={styles.notesList}
            >
              {sortedNotes.length > 0 ? (
                renderMasonryLayout()
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No notes found</Text>
                  <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={() => router.push('/notes/new')}
                  >
                    <Text style={styles.emptyButtonText}>Create Note</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </Animated.View>

          <PullToRefreshLoader pullDistance={pullDistance} />
        </View>
      </SafeAreaView>
    </GlassBg>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentWrapper: {
    flex: 1,
  },
  searchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  searchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 12,
  },
  searchButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.secondaryText,
    marginLeft: 8,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  masonryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    width: COLUMN_WIDTH,
    gap: 8,
  },
  notesList: {
    paddingBottom: 100,
  },
  emptyContainer: {
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: Colors.secondaryText,
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
