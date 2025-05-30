import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlassBg from '@/components/ui/GlassBg';
import Header from '@/components/shared/Header';
import Colors from '@/constants/Colors';
import GlassCard from '@/components/ui/GlassCard';
import { Tag, Trash2, Plus } from 'lucide-react-native';
import { useNotes } from '@/hooks/useSupabase';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function NoteDetailScreen() {
  console.log('NoteDetailScreen component rendered.');
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { createNote, updateNote, deleteNote, fetchNoteById, loading } =
    useNotes();
  const { session } = useAuth();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [color, setColor] = useState('#ffffff');

  useEffect(() => {
    if (id) {
      const loadNote = async () => {
        const noteData = await fetchNoteById(id as string);
        if (noteData) {
          setTitle(noteData.title);
          setContent(noteData.content || '');
          setTags(noteData.tags || []);
          setColor(noteData.color || '#ffffff');
        }
      };
      loadNote();
    }
  }, [id, fetchNoteById]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }

    try {
      if (!session?.user?.id) {
        console.error('No user session');
        return;
      }

      const noteData = {
        title: title.trim(),
        content: content.trim() || null,
        tags,
        color,
      };

      console.log('handleSave: Preparing to save note with data:', noteData);

      if (id) {
        const updatedNote = await updateNote(id as string, noteData);
        if (updatedNote) {
          console.log('handleSave: Note updated successfully:', updatedNote);
        } else {
          console.error('handleSave: Failed to update note');
        }
      } else {
        console.log('handleSave: Calling createNote with data:', noteData);
        const newNote = await createNote(noteData);
        if (newNote) {
          console.log('handleSave: Note created successfully:', newNote);
        } else {
          console.error('handleSave: Failed to create note');
        }
      }

      router.back();
    } catch (error) {
      console.error('handleSave: Error saving note:', error);
      Alert.alert('Error', 'Failed to save note');
    }
  };

  const handleDelete = async () => {
    try {
      if (!id) return;

      const success = await deleteNote(id as string);
      if (success) {
        console.log('Note deleted successfully');
        router.back();
      } else {
        console.error('Failed to delete note');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
      setShowTagInput(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  if (id && loading) {
    return (
      <GlassBg>
        <SafeAreaView style={styles.container} edges={['top']}>
          <Header title="Loading Note..." showBack />
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading note...</Text>
          </View>
        </SafeAreaView>
      </GlassBg>
    );
  }

  return (
    <GlassBg>
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header
          title={id ? 'Edit Note' : 'New Note'}
          showBack
          rightComponent={
            <View style={styles.headerButtons}>
              {id && (
                <TouchableOpacity
                  onPress={handleDelete}
                  style={[styles.headerButton, styles.deleteButton]}
                >
                  <Trash2 size={24} color={Colors.error} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={handleSave}
                style={[styles.headerButton, styles.saveButton]}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          }
        />

        <ScrollView style={styles.content}>
          <GlassCard style={styles.card}>
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Note title"
              placeholderTextColor={Colors.secondaryText}
            />

            <TextInput
              style={styles.contentInput}
              value={content}
              onChangeText={setContent}
              placeholder="Start writing..."
              placeholderTextColor={Colors.secondaryText}
              multiline
              textAlignVertical="top"
            />

            <View style={styles.tagsContainer}>
              <View style={styles.tagsHeader}>
                <Text style={styles.sectionTitle}>Tags</Text>
                <TouchableOpacity
                  style={styles.addTagButton}
                  onPress={() => setShowTagInput(true)}
                >
                  <Plus size={20} color={Colors.primary} />
                </TouchableOpacity>
              </View>

              {showTagInput && (
                <View style={styles.tagInputContainer}>
                  <TextInput
                    style={styles.tagInput}
                    value={newTag}
                    onChangeText={setNewTag}
                    placeholder="Add tag"
                    placeholderTextColor={Colors.secondaryText}
                    onSubmitEditing={handleAddTag}
                    autoFocus
                  />
                  <TouchableOpacity
                    style={styles.addTagConfirmButton}
                    onPress={handleAddTag}
                  >
                    <Text style={styles.addTagConfirmText}>Add</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.tagsList}>
                {tags.map((tag, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.tag}
                    onPress={() => handleRemoveTag(tag)}
                  >
                    <Tag size={14} color={Colors.primary} />
                    <Text style={styles.tagText}>{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {id && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
              >
                <Trash2 size={20} color={Colors.error} />
                <Text style={styles.deleteText}>Delete Note</Text>
              </TouchableOpacity>
            )}
          </GlassCard>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Note</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </GlassBg>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    marginBottom: 20,
  },
  titleInput: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    color: Colors.text,
    marginBottom: 16,
  },
  contentInput: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.text,
    marginBottom: 20,
    minHeight: 200,
  },
  tagsContainer: {
    marginTop: 20,
  },
  tagsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: Colors.text,
  },
  addTagButton: {
    padding: 8,
    backgroundColor: 'rgba(124, 77, 255, 0.1)',
    borderRadius: 8,
  },
  tagInputContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tagInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.text,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  addTagConfirmButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 8,
  },
  addTagConfirmText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: 'white',
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(124, 77, 255, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.primary,
    marginLeft: 6,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    marginTop: 20,
  },
  deleteText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.error,
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  saveButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: 'white',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    color: Colors.text,
  },
});

const getPriorityColor = (priority: string, opacity: number = 1) => {
  switch (priority) {
    case 'high':
      return `rgba(244, 67, 54, ${opacity})`;
    case 'medium':
      return `rgba(255, 152, 0, ${opacity})`;
    default:
      return `rgba(33, 150, 243, ${opacity})`;
  }
};
