import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlassBg from '@/components/ui/GlassBg';
import Header from '@/components/shared/Header';
import { useStore } from '@/store';
import Colors from '@/constants/Colors';
import { Plus, Search } from 'lucide-react-native';
import NoteItem from '@/components/notes/NoteItem';
import { useRouter } from 'expo-router';
import SearchBar from '@/components/shared/SearchBar';

export default function NotesScreen() {
  const { notes } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const router = useRouter();

  // Filter notes based on search query
  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Sort notes by last edited date
  const sortedNotes = [...filteredNotes].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const handleNotePress = (noteId: string) => {
    router.push(`/notes/${noteId}`);
  };

  return (
    <GlassBg>
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header 
          title="Notes" 
          showVoice={true}
        />
        
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
              onPress={() => router.push('/notes/create')}
            >
              <Plus size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={sortedNotes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <NoteItem
                note={item}
                onPress={() => handleNotePress(item.id)}
              />
            )}
            contentContainerStyle={styles.notesList}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No notes found</Text>
                <TouchableOpacity 
                  style={styles.emptyButton}
                  onPress={() => router.push('/notes/create')}
                >
                  <Text style={styles.emptyButtonText}>Create Note</Text>
                </TouchableOpacity>
              </View>
            }
          />
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
  notesList: {
    paddingBottom: 100,
  },
  columnWrapper: {
    justifyContent: 'space-between',
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
});